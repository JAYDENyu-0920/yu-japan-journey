import {validTravelDay} from './travel-details.js?v=1.8.1';
import {validCustom} from './external-search.js';
const dateOK=d=>/^2026-11-(2\d|30)$/.test(d);
export function validSnapshot(p){return !!p&&p.schemaVersion===1&&p.trip&&Array.isArray(p.trip.favorites)&&p.trip.favorites.every(x=>typeof x==='string')&&Array.isArray(p.trip.visited)&&p.trip.visited.every(x=>typeof x==='string')&&Array.isArray(p.trip.customSpots)&&p.trip.customSpots.every(validCustom)&&p.trip.days&&typeof p.trip.days==='object'&&!Array.isArray(p.trip.days)&&Object.entries(p.trip.days).every(([d,v])=>dateOK(d)&&v&&validTravelDay(v)&&typeof v.hotel==='string'&&typeof v.departure==='string'&&Array.isArray(v.stops)&&v.stops.every(s=>s&&typeof s.id==='string'&&typeof s.time==='string'&&typeof s.note==='string'&&Number.isFinite(s.duration)&&s.duration>=0&&s.duration<=24))&&p.map&&Array.isArray(p.map.selected)&&p.map.selected.every(s=>typeof s==='string')&&p.map.positions&&typeof p.map.positions==='object'&&!Array.isArray(p.map.positions)&&Object.values(p.map.positions).every(v=>v&&Number.isFinite(v.lat)&&Math.abs(v.lat)<=90&&Number.isFinite(v.lng)&&Math.abs(v.lng)<=180)}
export function fingerprint(value){if(Array.isArray(value))return'['+value.map(fingerprint).join(',')+']';if(value&&typeof value==='object')return'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+fingerprint(value[k])).join(',')+'}';return JSON.stringify(value)}
export class SyncConflict extends Error{constructor(remote){super('A newer cloud copy exists');this.remote=remote}}
export class JourneySync {
  constructor({transport,readLocal,applyLocal,saveMeta,meta={},onStatus=()=>{}}){Object.assign(this,{transport,readLocal,applyLocal,saveMeta,onStatus});this.revision=meta.revision??null;this.base=meta.base??null;this.ready=false;this.conflict=null;this.busy=false;this.pending=false;this.dirty=!!meta.dirty;}
  persist(){this.saveMeta({revision:this.revision,base:this.base,dirty:this.dirty})}
  changed(){this.dirty=true;this.persist();this.onStatus(this.awaitingChoice?'choose':'pending',this.conflict)}
  validate(row){if(row&&(!Number.isSafeInteger(row.revision)||row.revision<1||!validSnapshot(row.payload)))throw Error('Invalid cloud snapshot');return row}
  async accept(row){this.validate(row);await this.applyLocal(structuredClone(row.payload));this.revision=row.revision;this.base=fingerprint(row.payload);this.dirty=false;this.ready=true;this.awaitingChoice=false;this.conflict=null;this.persist();this.onStatus('synced',row)}
  choice(row){this.conflict=row;this.awaitingChoice=true;this.ready=false;this.onStatus('choose',row);return'choose'}
  async connect(){this.onStatus('loading');try{const row=this.validate(await this.transport.read());const local=this.readLocal(),hash=fingerprint(local);if(!validSnapshot(local))throw Error('Invalid local snapshot');if(row&&hash===fingerprint(row.payload)){this.revision=row.revision;this.base=hash;this.dirty=false;this.ready=true;this.awaitingChoice=false;this.persist();this.onStatus('synced',row);return'synced'}
    if(row&&this.base&&hash===this.base&&!this.dirty){await this.accept(row);return'synced'}
    return this.choice(row);
  }catch(e){this.onStatus('error',e);throw e}}
  async choose(direction){const latest=this.validate(await this.transport.read());if(direction==='cloud'){if(!latest)throw Error('No cloud copy');await this.accept(latest);return}if(direction!=='local')throw Error('Invalid choice');this.revision=latest?.revision??0;this.ready=true;this.awaitingChoice=false;this.conflict=null;this.dirty=true;return this.tick()}
  async tick(){if(this.busy){this.pending=true;return}if(!this.ready)return;this.busy=true;this.pending=false;try{const row=this.validate(await this.transport.read()),current=this.readLocal();if(!validSnapshot(current))throw Error('Invalid local snapshot');const hash=fingerprint(current),remoteRevision=row?.revision??0;
    if(hash!==this.base)this.dirty=true;
    if(remoteRevision!==(this.revision??0)){if(this.dirty)return this.choice(row);if(row)await this.accept(row);else return this.choice(null);return}
    if(!this.dirty){this.onStatus('synced',row);return}
    const sent=structuredClone(current);const saved=this.validate(await this.transport.write(remoteRevision,sent));this.revision=saved.revision;this.base=fingerprint(sent);this.dirty=fingerprint(this.readLocal())!==this.base;this.persist();this.onStatus(this.dirty?'pending':'synced',saved);
  }catch(e){if(e.code==='PT409'||e.status===409){this.choice(this.validate(await this.transport.read()));return}this.onStatus('error',e);throw e}finally{this.busy=false;if(this.pending&&this.ready){this.pending=false;queueMicrotask(()=>this.tick().catch(()=>{}))}}}
}

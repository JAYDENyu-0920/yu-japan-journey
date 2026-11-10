export const regions=['京都府','大阪府','滋賀縣','和歌山縣'];
export function normalize(row){const name=row['景點名稱']||'',region=row['地區'],address=row['Google Maps']||'';if(!name||!regions.includes(region))return null;
const rules=[['京都府',/Kyoto|京都/i],['大阪府',/Osaka|大阪/i],['滋賀縣',/Shiga|滋賀/i],['和歌山縣',/Wakayama|和歌山/i]];
const actual=rules.filter(([,re])=>re.test(address));if(/\bNara\b|奈良|\bHyogo\b|兵庫|\bMie\b|三重県/i.test(address)||actual.length!==1||actual[0][0]!==region)return null;
let types=row['景點類型']||[];if(typeof types==='string')types=JSON.parse(types);return {id:row.id,name,region,types,address,parking:row['停車資訊']||'',road:row['道路注意事項']||'',notes:row['備註']||'',fee:row['料金']||'',duration:row['預計停留時間/時']??null,date:row['date:參觀日期:start']||null};}

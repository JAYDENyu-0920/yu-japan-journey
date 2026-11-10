# Yu's Japan Journey V1.1

2026/11/20–11/30 近畿自駕旅遊 PWA。網站：https://jaydenyu-0920.github.io/yu-japan-journey/

手機優先、每日行程、搜尋與府縣／類型篩選、收藏與參觀狀態、Google Maps 互動地圖及自駕導航、停車／道路備註、裝置內行程調整、JSON 備份匯入匯出、離線快取。

## 資料與同步

Notion 資料來源 `aa8a9edf-36bc-4c02-bd9c-ca69fd457b2f`。首次匯入 160 筆，公開 155 筆，排除地址無法確認或府縣不符的 5 筆。來源未填參觀日期，因此 11 天行程初始留白，不擅自分配路線。停車及停留時間缺值不補造。

啟用自動同步：在 Notion 建立有讀取權限的 internal integration，將此資料庫連接到它。將其金鑰放入 GitHub 儲存庫 Settings → Secrets and variables → Actions → New repository secret，名稱 `NOTION_TOKEN`。不要把金鑰放入網站或程式碼。手動執行 Publish journey 驗證，之後每小時第 7、37 分鐘嘗試更新（GitHub 排程可能延遲）。

只呼叫 Notion 讀取 API，不會回寫。輸出採欄位白名單及府縣地址驗證。資料庫中這些欄位會公開：名稱、地區、類型、地址、停車資訊、道路注意事項、備註、料金、停留時數、參觀日期。請勿在這些欄位填寫個人敏感資料。

同步失敗時保留上次成功快照，Actions 顯示警告，網站顯示最後成功同步時間。Actions cache 可能到期；若快取不可用會退回儲存庫內首次快照。

行程、住宿、收藏、參觀狀態只存在裝置 localStorage，不會跨裝置同步。可匯出備份轉移。離線地圖不支援。PWA 首次需連網，iPhone Safari 分享 → 加入主畫面。SVG 安裝圖示的顯示可能依系統而異。

## 開發及部署

不需安裝相依套件，Node.js 22：

```
node --test
node scripts/build.mjs
node scripts/serve.mjs
```

預覽 http://127.0.0.1:4173 。GitHub Settings → Pages → Source 選 GitHub Actions。`.github/workflows/pages.yml` 建置 dist 並發布。更新靜態資產後需更新 `sw.js` 快取版本。

即時天氣、路況及車程計算未包含於 V1.0，停留時數不含開車時間。

## V1.1 互動地圖

旅遊地圖可同時顯示每日行程、收藏、自選或所有已定位景點。自選可勾選及調整順序，再加入指定日期行程。編號依所選順序排列；虛線僅為順序示意，按「計算自駕路線」取得 OSRM 道路路線、距離與預估行車時間（不含路況與停留）。單次最多 20 站，缺少位置時須先定位。Google Maps 導航依手機可用的中途點數分段，每段最多 5 站。

底圖及景點來源 OpenStreetMap，元件 Leaflet 1.9.4（授權見 LEAFLET-LICENSE.txt），位置搜尋 Photon。預載位置比對來源名稱及郵遞區號；來源地址變更時不再沿用舊座標。待定位項目可搜尋候選位置並核對，或直接點地圖指定。個人校正與自選清單僅存在目前裝置，不在原行程備份內。地圖、搜尋和道路服務需要網路，服務不可用時會顯示提示，不以直線假裝道路路線。

/* ============================================================
   个人工作台 · 成果管理  — 交互逻辑
   ============================================================ */
(function(){
"use strict";

const STORAGE_KEY = "pw_results_v1";

/* ---------- 简约线性图标集（stroke 风格） ---------- */
const ICONS = {
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6C10.2 4.5 7.6 4 4 4v14.5c3.6 0 6.2.5 8 2 1.8-1.5 4.4-2 8-2V4c-3.6 0-6.2.5-8 2z"/><path d="M12 6v14.5"/></svg>',
  journal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7V3z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 15.5h5"/></svg>',
  conference: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.5 3.6 5.3 3.6 8.5s-1.2 6-3.6 8.5c-2.4-2.5-3.6-5.3-3.6-8.5s1.2-6 3.6-8.5z"/></svg>',
  patent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3.5a5.5 5.5 0 00-3.3 9.9c.7.6 1 1.2 1 2.1h4.6c0-.9.3-1.5 1-2.1A5.5 5.5 0 0012 3.5z"/></svg>',
  duty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.8-7 9.8-4.1-2-7-5.4-7-9.8V5.8L12 3z"/><path d="M8.5 11.5l2.4 2.4 4.6-4.6"/></svg>',
  "design-award": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v4.8a4 4 0 01-8 0V4z"/><path d="M8 5.5H5.5V7.5A3 3 0 008 10.5M16 5.5h2.5V7.5A3 3 0 0116 10.5"/><path d="M12 12.8v3.4M9 20h6M10.5 16.2h3"/></svg>',
  cert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="3.5" width="15" height="17" rx="2"/><path d="M8.5 8.5h7M8.5 12h7"/><path d="M12 13.8l1.2 1.2 2.3-2.5"/></svg>',
  other: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l1.7 4.9 4.9 1.7-4.9 1.7L12 16.7l-1.7-4.9-4.9-1.7 4.9-1.7L12 3.5z"/><path d="M18.5 17.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/></svg>',
  diploma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9L12 4l9.5 5-9.5 5L2.5 9z"/><path d="M6.5 11.5V16c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5v-4.5"/><path d="M21.5 9v5"/></svg>'
};

/* ---------- 类型配置（业绩材料分类） ---------- */
const TYPE_CFG = {
  book:          { label:"著作",         labelEn:"Books",             icon:ICONS.book,          color:"#059669", badge:"tb-book" },
  journal:       { label:"期刊论文",     labelEn:"Journal Articles",  icon:ICONS.journal,       color:"#2563eb", badge:"tb-journal" },
  conference:    { label:"国际会议论文", labelEn:"Conference Papers",  icon:ICONS.conference,    color:"#0891b2", badge:"tb-conference" },
  patent:        { label:"专利",         labelEn:"Patents",           icon:ICONS.patent,        color:"#7c3aed", badge:"tb-patent" },
  duty:          { label:"社会职责",     labelEn:"Professional Service", icon:ICONS.duty,        color:"#d97706", badge:"tb-duty" },
  "design-award":{ label:"设计奖项",     labelEn:"Design Awards",     icon:ICONS["design-award"], color:"#e11d48", badge:"tb-design-award" },
  cert:          { label:"职称证书",     labelEn:"Professional Title",  icon:ICONS.cert,          color:"#b45309", badge:"tb-cert" },
  diploma:       { label:"学历学位证书", labelEn:"Diplomas",          icon:ICONS.diploma,       color:"#4f46e5", badge:"tb-diploma" },
  other:         { label:"简历",         labelEn:"Resume",          icon:ICONS.other,         color:"#64748b", badge:"tb-other" }
};
/* 板块展示顺序（共 9 个，3×3 九宫格） */
const BLOCK_ORDER = ["book","journal","conference","patent","duty","design-award","cert","diploma","other"];
const STATUS_CFG = {
  ongoing: { label:"进行中", cls:"status-ongoing" },
  done:    { label:"已完成", cls:"status-done" }
};

/* ---------- 示例数据 ---------- */
const SEED = [
  { id:"r1", title:"《智能产品设计方法论》", type:"book", status:"done",  year:2024, tags:["工业设计","方法论"], link:"", desc:"个人独立编著，系统总结智能硬件与交互产品的设计方法体系，已由机械工业出版社出版，累计销量 1.8 万册。" },
  { id:"r2", title:"面向多模态交互的界面设计研究", type:"journal", status:"done",  year:2025, tags:["多模态","人机交互"], link:"", desc:"发表于《计算机辅助设计与图形学学报》2025 年第 4 期，提出多模态交互界面的设计评估框架。" },
  { id:"r3", title:"Designing Adaptive Interfaces for Smart Workspaces", type:"conference", status:"ongoing", year:2026, tags:["自适应界面","CHI"], link:"", desc:"探索智能办公场景下的自适应界面设计策略，已通过初审，计划投稿 CHI 2026。" },
  { id:"r4", title:"一种基于用户行为的界面自适应方法及装置", type:"patent", status:"done",  year:2025, tags:["发明专利"], link:"", desc:"发明专利，已获授权。提出基于用户行为数据的界面布局自适应调整方法，专利号 ZL2025xxxxxxx。" },
  { id:"r5", title:"中国工业设计协会 · 理事", type:"duty", status:"done",  year:2024, tags:["行业协会"], link:"", desc:"担任中国工业设计协会理事，参与行业标准研讨与年度评奖工作，任期 2024–2027。" },
  { id:"r6", title:"iF Design Award 2025 · 金奖", type:"design-award", status:"done",  year:2025, tags:["国际大奖"], link:"", desc:"主持设计的智能家居中控产品获 iF Design Award 2025 产品设计类金奖，作品在汉诺威展出。" },
  { id:"r7", title:"高级工程师（副高级）职称证书", type:"cert", status:"done",  year:2023, tags:["职称"], link:"", desc:"经省人社厅评审认定，取得高级工程师（副高级）职称，证书编号 GD2023xxxx。" },
  { id:"r8", title:"服务设计驱动创新的实践路径", type:"journal", status:"done", year:2024, tags:["服务设计"], link:"", desc:"发表于《装饰》2024 年第 9 期，结合 6 个企业案例总结服务设计驱动产品创新的实践方法。" },
  { id:"r9", title:"XX 大学设计学院 · 校外产业导师", type:"duty", status:"ongoing", year:2026, tags:["学术兼职"], link:"", desc:"受聘为 XX 大学设计学院校外产业导师，指导研究生毕业设计，每学期开设 2 次实践讲座。" },
  { id:"r10", title:"Red Dot 红点设计奖 · 概念设计", type:"design-award", status:"done", year:2023, tags:["国际大奖"], link:"", desc:"概念作品《便携式无障碍出行辅助设备》获 Red Dot 红点设计概念奖。" }
];

/* 旧版本类型 → 新类型 迁移映射 */
const TYPE_MIGRATE = { book:"book", paper:"journal", patent:"patent", award:"design-award", project:"other", other:"diploma" };

/* ---------- 状态 ---------- */
let results = [];
let currentView = "dashboard";
let filters = { type:"", status:"", year:"" };
let searchKw = "";
let editingId = null;   // 正在编辑的 id（新增时为临时 id）
let deletingId = null;  // 待删除的 id
let pendingId = null;   // 新增模式下临时成果 id
let draftAttachments = []; // 新增模式下暂存的附件元数据
let detailId = null;    // 详情弹窗中的成果 id
let previewUrl = null;  // 预览图片的 objectURL

/* ---------- 附件存储：IndexedDB（支持大文件） ---------- */
const DB_NAME = "pw_attachments_db";
let _dbPromise = null;
function getDB(){
  if(_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject)=>{
    try{
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e=>{
        const db = e.target.result;
        if(!db.objectStoreNames.contains("files")){
          db.createObjectStore("files", { keyPath:"id" });
        }
      };
      req.onsuccess = e=> resolve(e.target.result);
      req.onerror = e=> reject(e.target.error);
    }catch(err){ reject(err); }
  });
  return _dbPromise;
}
function filePut(id, blob){
  return getDB().then(db=> new Promise((resolve,reject)=>{
    const tx = db.transaction("files","readwrite");
    tx.objectStore("files").put({ id, blob });
    tx.oncomplete = ()=>resolve();
    tx.onerror = e=>reject(e.target.error);
  }));
}
function fileGet(id){
  return getDB().then(db=> new Promise((resolve,reject)=>{
    const tx = db.transaction("files","readonly");
    const req = tx.objectStore("files").get(id);
    req.onsuccess = ()=>resolve(req.result||null);
    req.onerror = e=>reject(e.target.error);
  }));
}
function fileDel(id){
  return getDB().then(db=> new Promise((resolve,reject)=>{
    const tx = db.transaction("files","readwrite");
    tx.objectStore("files").delete(id);
    tx.oncomplete = ()=>resolve();
    tx.onerror = e=>reject(e.target.error);
  }));
}

/* ---------- 工具 ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
function uid(){ return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    results = raw ? JSON.parse(raw) : null;
    if(!results || !Array.isArray(results)){ results = JSON.parse(JSON.stringify(SEED)); save(); }
  }catch(e){ results = JSON.parse(JSON.stringify(SEED)); save(); }
  // 旧版类型迁移到新版分类
  let migrated = false;
  results.forEach(r=>{
    if(r.type && !TYPE_CFG[r.type]){
      r.type = TYPE_MIGRATE[r.type] || "other";
      migrated = true;
    }
    if(r.attachments === undefined){ r.attachments = []; }
  });
  if(migrated) save();
  results.sort((a,b)=> (b.year-a.year) || (String(b.id).localeCompare(String(a.id))));
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(results)); }

function toast(msg, dur){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(()=> t.classList.remove("show"), dur || 2200);
}

/* ---------- 渲染：成果条目（通用） ---------- */
function itemHtml(r, withActions){
  const tc = TYPE_CFG[r.type] || TYPE_CFG.other;
  const sc = STATUS_CFG[r.status] || STATUS_CFG.done;
  const tags = (r.tags||[]).slice(0,3).map(t=>`<span class="tag-chip">${esc(t)}</span>`).join("");
  const attCount = (r.attachments||[]).length;
  const attBadge = `<button class="attach-badge ${attCount?"":"zero"}" data-act="detail" data-id="${r.id}" title="${attCount?"查看并下载材料附件":"暂无附件"}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
      ${attCount ? attCount+" 份材料" : "无材料"}
    </button>`;
  const actions = withActions ? `
    <div class="row-actions">
      <button class="icon-btn" data-act="detail" data-id="${r.id}" title="查看详情 / 材料">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button class="icon-btn" data-act="edit" data-id="${r.id}" title="编辑">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </button>
      <button class="icon-btn danger" data-act="del" data-id="${r.id}" title="删除">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
      </button>
    </div>` : "";
  return `
  <div class="result-item">
    <div class="type-badge ${tc.badge}">${tc.icon}</div>
    <div class="result-main">
      <div class="result-title">${esc(r.title)}</div>
      <div class="result-meta">
        <span class="status-pill ${sc.cls}">${sc.label}</span>
        <span class="meta-text">${tc.label} · ${r.year}年</span>
        ${tags}
        ${attBadge}
      </div>
    </div>
    ${actions}
  </div>`;
}

/* 板块卡片背景图（Unsplash 精选，加载失败时回退为纯色渐变） */

/* Logo：建筑抽象线条（摩天楼斜线轮廓） */
const LOGO_SVG = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'
  // 左侧窄楼（倾斜立面）
  + '<path d="M12 12 L17 10 L17 56 L12 58 Z" />'
  // 中央高大楼（更高）
  + '<path d="M20 8 L36 5 L36 52 L20 55 Z" />'
  // 中央楼窗户横线
  + '<line x1="20" y1="16" x2="36" y2="13" /><line x1="20" y1="24" x2="36" y2="21" /><line x1="20" y1="32" x2="36" y2="29" /><line x1="20" y1="40" x2="36" y2="37" />'
  // 中央楼垂直中线
  + '<line x1="28" y1="6.5" x2="28" y2="53.5" />'
  // 右侧楼
  + '<path d="M40 6 L50 4 L50 54 L40 56 Z" />'
  // 右侧楼窗户
  + '<line x1="40" y1="14" x2="50" y2="12" /><line x1="40" y1="22" x2="50" y2="20" /><line x1="40" y1="30" x2="50" y2="28" /><line x1="40" y1="38" x2="50" y2="36" />'
  // 底层平台
  + '<path d="M10 54 L52 49 L52 60 L10 62 Z" />'
  + '</svg>';
const BLOCK_IMG = {
  book:          "img/book.png",
  journal:       "img/journal.png",
  conference:    "img/conference.png",
  patent:        "img/patent.png",
  duty:          "img/duty.png",
  "design-award": "img/design-award.jpg",
  cert:          "img/cert.png",
  diploma:       "img/diploma.png",
  other:         "img/other.png"
};

/* ============================================================
   下载中心：零依赖 ZIP(STORE) 打包
   ============================================================ */
let dlSelected = new Set();

/* CRC32 */
const CRC_TABLE = (()=>{
  const t = new Uint32Array(256);
  for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c = (c&1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1); t[n]=c>>>0; }
  return t;
})();
function crc32(u8){
  let c = 0xFFFFFFFF;
  for(let i=0;i<u8.length;i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c>>>8);
  return (c ^ 0xFFFFFFFF)>>>0;
}
function dosDateTime(d){
  return {
    time: (d.getHours()<<11) | (d.getMinutes()<<5) | (d.getSeconds()>>1),
    date: ((Math.max(1980,d.getFullYear())-1980)<<9) | ((d.getMonth()+1)<<5) | d.getDate()
  };
}
function put16(u,o,v){ u[o]=v&0xFF; u[o+1]=(v>>8)&0xFF; }
function put32(u,o,v){ u[o]=v&0xFF; u[o+1]=(v>>8)&0xFF; u[o+2]=(v>>16)&0xFF; u[o+3]=(v>>24)&0xFF; }

async function buildZip(files){ // files: [{name, blob}]
  const enc = new TextEncoder();
  const parts = [], central = [];
  let offset = 0;
  for(const f of files){
    const data = new Uint8Array(await f.blob.arrayBuffer());
    const nameBytes = enc.encode(f.name);
    const crc = crc32(data);
    const dt = dosDateTime(new Date());
    const size = data.length;

    // 本地文件头
    const lh = new Uint8Array(30);
    lh[0]=0x50; lh[1]=0x4B; lh[2]=0x03; lh[3]=0x04;
    lh[4]=20; lh[5]=0;                    // version 2.0
    lh[6]=0x08; lh[7]=0x00;               // UTF-8 文件名
    put16(lh,8,0);                         // STORE（不压缩）
    put16(lh,10,dt.time); put16(lh,12,dt.date);
    put32(lh,14,crc);
    put32(lh,18,size); put32(lh,22,size);
    put16(lh,26,nameBytes.length); put16(lh,28,0);
    parts.push(lh, nameBytes, data);

    // 中央目录
    const ch = new Uint8Array(46);
    ch[0]=0x50; ch[1]=0x4B; ch[2]=0x01; ch[3]=0x02;
    put16(ch,4,20); put16(ch,6,20);
    put16(ch,8,0x0800);
    put16(ch,10,0);
    put16(ch,12,dt.time); put16(ch,14,dt.date);
    put32(ch,16,crc);
    put32(ch,20,size); put32(ch,24,size);
    put16(ch,28,nameBytes.length);
    put16(ch,30,0); put16(ch,32,0); put16(ch,34,0);
    put16(ch,36,0); put32(ch,38,0);
    put32(ch,42,offset);
    central.push(ch, nameBytes);
    offset += 30 + nameBytes.length + size;
  }

  // 中央目录结束记录
  const cdStart = offset;
  let cdSize = 0;
  for(const c of central) cdSize += c.length;
  const eocd = new Uint8Array(22);
  eocd[0]=0x50; eocd[1]=0x4B; eocd[2]=0x05; eocd[3]=0x06;
  put16(eocd,4,0); put16(eocd,6,0);
  put16(eocd,8,files.length); put16(eocd,10,files.length);
  put32(eocd,12,cdSize); put32(eocd,16,cdStart);
  put16(eocd,20,0);

  return new Blob([...parts, ...central, eocd], { type:"application/zip" });
}

function sanitizeName(s){
  return String(s==null?"":s).replace(/[\\/:*?"<>|\u0000-\u001f]/g,"_").trim() || "未命名";
}

/* 渲染板块选择列表 */
function renderDlTypes(){
  const list = BLOCK_ORDER.map(t=>{
    const cfg = TYPE_CFG[t];
    const rs = results.filter(r=>r.type===t);
    const attCount = rs.reduce((s,r)=> s + (r.attachments||[]).length, 0);
    return `
    <label class="dl-type ${attCount?"":"dl-empty"}" data-type="${t}">
      <input type="checkbox" value="${t}" ${dlSelected.has(t)?"checked":""} ${attCount?"":"disabled"}>
      <span class="dl-type-name">${cfg.label}</span>
      <span class="dl-type-count">${attCount ? `${attCount} ${attCount>1?"Files":"File"}` : "No files"}</span>
    </label>`;
  }).join("");
  $("#dlTypeList").innerHTML = list;
  updateDlInfo();
}

function updateDlInfo(){
  let attCount = 0, resCount = 0;
  dlSelected.forEach(t=>{
    const rs = results.filter(r=>r.type===t && (r.attachments||[]).length);
    resCount += rs.length;
    attCount += rs.reduce((s,r) => s + (r.attachments||[]).length, 0);
  });
  if(dlSelected.size){
    $("#dlInfo").textContent = `已选 ${dlSelected.size} 个板块 · ${resCount} 项成果 · ${attCount} 个附件  |  ${dlSelected.size} sections · ${resCount} items · ${attCount} files`;
  }else{
    $("#dlInfo").textContent = "未选择板块 · No section selected";
  }
}

/* ---------- 渲染：材料板块大色块 ---------- */

/* 打包下载所选板块 */
async function dlZip(){
  if(!dlSelected.size){ toast("请先勾选要打包的板块"); return; }
  const files = [];
  for(const t of dlSelected){
    const cfg = TYPE_CFG[t];
    const rs = results.filter(r=>r.type===t && (r.attachments||[]).length);
    for(const r of rs){
      for(const a of (r.attachments||[])){
        try{
          const rec = await fileGet(a.id);
          if(rec && rec.blob){
            files.push({ name: `${cfg.label}/${sanitizeName(r.title)}/${sanitizeName(a.name)}`, blob: rec.blob });
          }
        }catch(e){}
      }
    }
  }
  if(!files.length){ toast("所选板块暂无附件可下载"); return; }
  toast(`正在打包 ${files.length} 个附件…`);
  await new Promise(r=>setTimeout(r, 40));
  const zip = await buildZip(files);

  // ZIP 文件名按板块名称命名（单选=板块名；多选=板块名组合）
  const names = [...dlSelected].map(t=>TYPE_CFG[t].label);
  let zipName;
  if(names.length === 1) zipName = names[0] + ".zip";
  else if(names.length <= 3) zipName = names.join("+") + ".zip";
  else zipName = names.slice(0,3).join("+") + "等" + names.length + "个板块.zip";

  // 用 File 对象包装，避免某些浏览器把 objectURL 当作无文件名处理
  const file = new File([zip], zipName, { type: "application/zip" });
  const url = URL.createObjectURL(file);

  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 5000);
  toast(`✓ 已下载：${zipName}（${files.length} 个附件）`, 2800);
}

/* ============================================================
   数据备份 / 恢复（部署迁移用）
   ============================================================ */
/* 解析 STORE 模式 ZIP → [{name, data(ArrayBuffer)}] */
function parseZip(buf){
  return new Promise((resolve, reject)=>{
    try{
      const u8 = new Uint8Array(buf);
      const dv = new DataView(buf);
      // 定位 EOCD
      let eocd = -1;
      for(let i = u8.length - 22; i >= 0 && i >= u8.length - 65557; i--){
        if(u8[i]===0x50 && u8[i+1]===0x4B && u8[i+2]===0x05 && u8[i+3]===0x06){ eocd = i; break; }
      }
      if(eocd < 0) throw new Error("无法识别 ZIP 文件");
      const entryCount = dv.getUint16(eocd + 10, true);
      let cd = dv.getUint32(eocd + 16, true);
      const files = [];
      const dec = new TextDecoder();
      for(let n = 0; n < entryCount; n++){
        if(!(u8[cd]===0x50 && u8[cd+1]===0x4B && u8[cd+2]===0x01 && u8[cd+3]===0x02)) break;
        const method = dv.getUint16(cd + 10, true);
        if(method !== 0) throw new Error("仅支持未压缩的备份包（STORE）");
        const compSize = dv.getUint32(cd + 20, true);
        const nameLen = dv.getUint16(cd + 28, true);
        const extraLen = dv.getUint16(cd + 30, true);
        const commentLen = dv.getUint16(cd + 32, true);
        const lho = dv.getUint32(cd + 42, true);
        const nameBytes = u8.subarray(cd + 46, cd + 46 + nameLen);
        const name = dec.decode(nameBytes);
        if(!name.endsWith("/")){ // 跳过目录条目
          const dataStart = lho + 30 + nameLen + extraLen;
          files.push({ name, data: buf.slice(dataStart, dataStart + compSize) });
        }
        cd += 46 + nameLen + extraLen + commentLen;
      }
      resolve(files);
    }catch(e){ reject(e); }
  });
}

/* 导出备份：manifest.json + attachments/* */
async function exportBackup(){
  toast("正在打包备份…");
  await new Promise(r=>setTimeout(r, 30));
  const files = [{
    name: "manifest.json",
    blob: new Blob([JSON.stringify({ version:1, exportedAt:new Date().toISOString(), results }, null, 2)], { type:"application/json" })
  }];
  let att = 0;
  for(const r of results){
    for(const a of (r.attachments||[])){
      try{
        const rec = await fileGet(a.id);
        if(rec && rec.blob){ files.push({ name:"attachments/"+a.id, blob:rec.blob }); att++; }
      }catch(e){}
    }
  }
  const zip = await buildZip(files);
  const url = URL.createObjectURL(zip);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Yang Xu'S stage 数据备份_" + new Date().toISOString().slice(0,10) + ".zip";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 5000);
  toast(`✓ 备份完成：${results.length} 条成果，${att} 个附件`);
}

/* 导入备份：读取 zip → 写入 localStorage + IndexedDB */
async function importBackup(file){
  toast("正在解析备份包…");
  let files;
  try{ files = await parseZip(await file.arrayBuffer()); }
  catch(e){ toast("备份包解析失败：" + (e.message||"格式不支持")); return; }

  const man = files.find(f=>f.name==="manifest.json");
  if(!man){ toast("备份包缺少 manifest.json，无法恢复"); return; }
  let data;
  try{ data = JSON.parse(new TextDecoder().decode(man.data)); }
  catch(e){ toast("备份包数据损坏"); return; }
  const list = Array.isArray(data) ? data : (data.results||[]);
  if(!list.length){ toast("备份包中没有成果数据"); return; }

  // 恢复附件
  let att = 0;
  for(const f of files){
    if(!f.name.startsWith("attachments/")) continue;
    const id = f.name.slice("attachments/".length);
    try{ await filePut(id, new Blob([f.data])); att++; }catch(e){}
  }
  results = list;
  save();
  renderAll();
  renderDlTypes();
  toast(`✓ 恢复完成：${results.length} 条成果，${att} 个附件`);
}

/* ---------- 渲染：材料板块大色块 ---------- */
function renderBlocks(){
  const counts = {};
  results.forEach(r => counts[r.type] = (counts[r.type]||0)+1);
  const html = BLOCK_ORDER.map(k=>{
    const cfg = TYPE_CFG[k];
    const n = counts[k]||0;
    const countText = n ? `${n} ${n>1?"Items":"Item"}` : "Click to add";
    return `
    <button class="block-card ${n?"":"zero"}" data-block="${k}" style="--bc:${cfg.color}" title="查看「${cfg.label}」板块">
      <span class="block-bg" style="background-image:url('${BLOCK_IMG[k]}')"></span>
      <svg class="block-shape" viewBox="0 0 100 33.333" preserveAspectRatio="none">
        <polygon points="0,0 50,0 72,30 60,12 100,0 100,33.333 0,33.333" fill="rgba(29,59,138,0.7)"/>
      </svg>
      <div class="block-info">
        <div class="block-name">${cfg.label}</div>
        <div class="block-en">${cfg.labelEn}</div>
      </div>
      <div class="block-count">${countText}</div>
    </button>`;
  }).join("");
  $("#sectionBlocks").innerHTML = html;
}

/* ---------- 板块横幅（钻取状态） ---------- */
function updateBanner(){
  const b = $("#manageBanner");
  if(!b) return;
  if(filters.type && TYPE_CFG[filters.type]){
    b.hidden = false;
    const cfg = TYPE_CFG[filters.type];
    const cnt = results.filter(r=>r.type===filters.type).length;
    $("#bannerBadge").innerHTML = cfg.icon;
    $("#bannerBadge").className = "type-badge " + cfg.badge;
    $("#bannerName").textContent = cfg.label + "板块";
    $("#bannerCount").textContent = cnt ? `共 ${cnt} 项成果，点击条目查看详情并下载材料` : "该板块暂无成果，点击右上角「新增成果」录入";
  }else{
    b.hidden = true;
  }
}

/* ---------- 渲染：成果管理列表 ---------- */
function renderManage(){
  const kw = searchKw.trim().toLowerCase();
  let list = results.filter(r=>{
    if(filters.type && r.type!==filters.type) return false;
    if(filters.status && r.status!==filters.status) return false;
    if(filters.year && r.year!==Number(filters.year)) return false;
    if(kw){
      const hay = (r.title + " " + (r.tags||[]).join(" ") + " " + (r.desc||"")).toLowerCase();
      if(!hay.includes(kw)) return false;
    }
    return true;
  });
  $("#filterResult").textContent = `共 ${list.length} 条成果`;
  $("#manageEmpty").hidden = list.length !== 0;
  $("#manageList").innerHTML = list.map(r=>itemHtml(r,true)).join("");
  updateBanner();
}

/* ---------- 渲染：时间线 ---------- */
function renderTimeline(){
  const byYear = {};
  [...results].sort((a,b)=>b.year-a.year).forEach(r=>{
    (byYear[r.year] = byYear[r.year]||[]).push(r);
  });
  const years = Object.keys(byYear).map(Number).sort((a,b)=>b-a);
  if(!years.length){
    $("#timelineWrap").innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 6h10M4 12h16M4 18h7"/></svg><p>暂无成果记录</p></div>`;
    return;
  }
  $("#timelineWrap").innerHTML = years.map(y=>{
    const items = byYear[y].map(r=>{
      const tc = TYPE_CFG[r.type]||TYPE_CFG.other;
      const sc = STATUS_CFG[r.status]||STATUS_CFG.done;
      const tags = (r.tags||[]).map(t=>`<span class="tag-chip">${esc(t)}</span>`).join("");
      return `
      <div class="tl-item" style="cursor:pointer" data-act="detail" data-id="${r.id}" title="点击查看详情 / 下载材料">
        <div class="type-badge ${tc.badge}">${tc.icon}</div>
        <div class="tl-body">
          <div class="tl-title">${esc(r.title)}</div>
          <div class="tl-desc">${esc(r.desc||"暂无描述")}</div>
          <div class="tl-meta">
            <span class="status-pill ${sc.cls}">${sc.label}</span>
            <span class="meta-text">${tc.label}</span>
            ${tags}
            ${(r.attachments||[]).length?`<span class="attach-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>${(r.attachments||[]).length} 份材料</span>`:""}
            ${r.link?`<a class="meta-text" href="${esc(r.link)}" target="_blank" rel="noopener" style="color:#4f46e5;text-decoration:none">🔗 链接</a>`:""}
          </div>
        </div>
      </div>`;
    }).join("");
    return `<div class="tl-year">${y} 年</div>${items}`;
  }).join("");
}

/* ---------- 汇总渲染 ---------- */
function renderAll(){
  renderBlocks();
  renderManage();
  renderTimeline();
  renderDlTypes();
  populateYearOptions();
}

/* ---------- 年份选项 ---------- */
function populateYearOptions(){
  const years = [...new Set(results.map(r=>r.year))].sort((a,b)=>b-a);
  const cur = new Date().getFullYear();
  const all = new Set([...years]);
  for(let y=cur; y>=cur-8; y--) all.add(y);
  const opts = [...all].sort((a,b)=>b-a)
    .map(y=>`<option value="${y}" ${y===cur?"selected":""}>${y} 年</option>`).join("");
  $("#filterYear").innerHTML = `<option value="">全部年份</option>` + opts;
  $("#f-year").innerHTML = opts;
}

/* ---------- 视图切换 ---------- */
function switchView(v){
  currentView = v;
  $$(".nav-item").forEach(n=> n.classList.toggle("active", n.dataset.view===v));
  $$(".view").forEach(s=> s.classList.toggle("active", s.id===("view-"+v)));
  $("#backBtn").hidden = (v === "dashboard");
  if(v==="manage") updateBanner();
}

/* ---------- 模态框 ---------- */
function openModal(id, presetType){
  const isNew = !id;
  editingId = isNew ? uid() : id;      // 新增时先生成临时 id，附件可先上传
  pendingId = isNew ? editingId : null;
  draftAttachments = [];
  $("#modalTitle").textContent = isNew ? "新增成果" : "编辑成果";
  const f = isNew ? null : results.find(r=>r.id===id);
  $("#f-id").value = editingId;
  $("#f-title").value = f ? f.title : "";
  $("#f-type").value = isNew && presetType && TYPE_CFG[presetType] ? presetType : (f ? f.type : "book");
  $("#f-status").value = f ? f.status : "done";
  $("#f-year").value = f ? f.year : new Date().getFullYear();
  $("#f-tags").value = f ? (f.tags||[]).join(", ") : "";
  $("#f-link").value = f ? (f.link||"") : "";
  $("#f-desc").value = f ? (f.desc||"") : "";
  renderFormAttach();
  $("#modalMask").hidden = false;
  setTimeout(()=> $("#f-title").focus(), 60);
}
function closeModal(){
  // 新增模式下取消：清理已上传到 IndexedDB 的临时附件
  if(pendingId){
    draftAttachments.forEach(a=>{ try{ fileDel(a.id); }catch(e){} });
    draftAttachments = [];
    pendingId = null;
  }
  $("#modalMask").hidden = true;
  editingId = null;
}

function submitForm(){
  const title = $("#f-title").value.trim();
  if(!title){ toast("请填写成果标题"); $("#f-title").focus(); return; }
  const type = $("#f-type").value;
  const status = $("#f-status").value;
  const year = Number($("#f-year").value) || new Date().getFullYear();
  const tags = $("#f-tags").value.split(/[,，]/).map(s=>s.trim()).filter(Boolean);
  const link = $("#f-link").value.trim();
  const desc = $("#f-desc").value.trim();

  const existing = results.find(x=>x.id===editingId);
  if(existing){
    Object.assign(existing, { title, type, status, year, tags, link, desc });
    toast("成果已更新");
  }else{
    results.push({ id: editingId, title, type, status, year, tags, link, desc, attachments: draftAttachments.slice() });
    pendingId = null;
    draftAttachments = [];
    toast("成果已添加");
  }
  results.sort((a,b)=> (b.year-a.year) || (String(b.id).localeCompare(String(a.id))));
  save();
  closeModal();
  renderAll();
}

function openDel(id){
  deletingId = id;
  const r = results.find(x=>x.id===id);
  $("#delTargetTitle").textContent = r ? r.title : "";
  $("#delMask").hidden = false;
}
function closeDel(){ $("#delMask").hidden = true; deletingId = null; }
async function confirmDel(){
  const r = results.find(x=>x.id===deletingId);
  if(r && r.attachments && r.attachments.length){
    for(const a of r.attachments){ try{ await fileDel(a.id); }catch(e){} }
  }
  results = results.filter(x=>x.id!==deletingId);
  save();
  closeDel();
  renderAll();
  toast("成果已删除" + ((r&&r.attachments&&r.attachments.length) ? `（含 ${r.attachments.length} 个附件）` : ""));
}

/* ---------- 导出 ---------- */
function exportData(){
  const exportList = results.map(r=>{
    const { attachments, ...rest } = r;
    return { ...rest, attachments: (attachments||[]).map(a=>({ name:a.name, size:a.size, mime:a.mime, at:a.at })) };
  });
  const blob = new Blob([JSON.stringify(exportList, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Yang Xu'S stage 成果数据_" + new Date().toISOString().slice(0,10) + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  toast("已导出成果数据（附件文件本身不包含，仅记录文件名）");
}

/* 导出 Markdown 成果清单（按板块分类，附带描述与附件列表） */
function exportList(){
  if(!results.length){ toast("暂无成果可导出"); return; }
  const cfg = TYPE_CFG;
  const md = [];
  md.push(`# Yang Xu'S stage · 成果清单`);
  md.push(``);
  const totalAtt = results.reduce((s,r)=>s+(r.attachments||[]).length, 0);
  md.push(`- **导出时间**：${new Date().toLocaleString("zh-CN")}`);
  md.push(`- **成果总数**：${results.length} 项`);
  md.push(`- **附件总数**：${totalAtt} 个`);
  md.push(``);
  md.push(`---`);
  md.push(``);
  for(const k of BLOCK_ORDER){
    const items = results.filter(r=>r.type===k);
    if(!items.length) continue;
    const c = cfg[k];
    md.push(`## ${c.icon} ${c.label}（${c.labelEn}） · ${items.length} 项`);
    md.push(``);
    const sorted = [...items].sort((a,b)=>b.year - a.year);
    for(const r of sorted){
      const sc = STATUS_CFG[r.status] || STATUS_CFG.done;
      md.push(`### ${r.title || "(无标题)"}`);
      md.push(``);
      md.push(`- **类型**：${c.label}`);
      md.push(`- **年份**：${r.year}`);
      md.push(`- **状态**：${sc.label}`);
      if(r.tags && r.tags.length) md.push(`- **标签**：${r.tags.map(t=>`\`${t}\``).join("、")}`);
      if(r.link) md.push(`- **链接**：[查看](${r.link})`);
      const atts = r.attachments || [];
      if(r.desc){
        md.push(``);
        String(r.desc).split(/\n/).forEach(l=>md.push(`  ${l}`));
      }
      if(atts.length){
        md.push(``);
        md.push(`**附件（${atts.length}）**：`);
        atts.forEach(a => md.push(`- ${a.name} (${fmtSize(a.size)})`));
      }
      md.push(``);
      md.push(`---`);
      md.push(``);
    }
  }
  const text = md.join("\n");
  const blob = new Blob([text], { type:"text/markdown;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Yang Xu'S stage 成果清单_" + new Date().toISOString().slice(0,10) + ".md";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  toast(`✓ 已导出 ${results.length} 项成果清单（Markdown）`);
}

/* ============================================================
   附件系统
   ============================================================ */
function fmtSize(n){
  if(n==null) return "—";
  if(n < 1024) return n + " B";
  if(n < 1024*1024) return (n/1024).toFixed(1) + " KB";
  return (n/1024/1024).toFixed(1) + " MB";
}
function attachIcon(mime, name){
  const n = (name||"").toLowerCase();
  if((mime||"").startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/.test(n)) return { ico:"🖼️", cls:"is-img" };
  if((mime||"").includes("pdf") || /\.pdf$/.test(n)) return { ico:"📕", cls:"is-pdf" };
  if(/\.(doc|docx)$/.test(n)) return { ico:"📘", cls:"is-doc" };
  if(/\.(xls|xlsx|csv)$/.test(n)) return { ico:"📗", cls:"is-doc" };
  if(/\.(zip|rar|7z)$/.test(n)) return { ico:"🗜️", cls:"is-zip" };
  return { ico:"📎", cls:"" };
}
function attachItemHtml(a, editable){
  const ic = attachIcon(a.mime, a.name);
  const isImg = (a.mime||"").startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(a.name||"");
  const acts = `
    ${isImg?`<button class="icon-btn" data-aact="preview" data-aid="${a.id}" title="预览">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>`:""}
    <button class="icon-btn" data-aact="dl" data-aid="${a.id}" title="下载">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
    </button>
    ${editable?`<button class="icon-btn danger" data-aact="rm" data-aid="${a.id}" title="移除附件">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
      </button>`:""}`;
  return `<div class="attach-item">
    <div class="attach-ico ${ic.cls}">${ic.ico}</div>
    <div class="attach-main">
      <div class="attach-name" title="${esc(a.name)}">${esc(a.name)}</div>
      <div class="attach-size">${fmtSize(a.size)}</div>
    </div>
    <div class="attach-acts">${acts}</div>
  </div>`;
}

/* 当前表单对应的附件元数据 */
function formAttachments(){
  if(pendingId) return draftAttachments;
  const r = results.find(x=>x.id===editingId);
  return (r && r.attachments) || [];
}
function renderFormAttach(){
  const list = formAttachments();
  $("#formAttachList").innerHTML = list.length ? list.map(a=>attachItemHtml(a,true)).join("") : "";
}

/* 上传附件 */
async function handleAttachFiles(files){
  if(!editingId){ toast("请先填写成果标题"); return; }
  const arr = Array.from(files||[]);
  if(!arr.length) return;
  let ok = 0;
  for(const f of arr){
    if(!f || !f.size) continue;
    const id = uid();
    try{
      await filePut(id, f);
      const meta = { id, name:f.name, size:f.size, mime:f.type||"", at:Date.now() };
      if(pendingId){
        draftAttachments.push(meta);
      }else{
        const r = results.find(x=>x.id===editingId);
        if(r){ r.attachments = r.attachments||[]; r.attachments.push(meta); save(); }
      }
      ok++;
    }catch(e){ console.error("附件上传失败", e); }
  }
  renderFormAttach();
  toast(ok ? `已上传 ${ok} 个附件` : "上传失败，请重试");
}

/* 移除表单中的附件 */
async function removeFormAttach(aid){
  if(pendingId){
    draftAttachments = draftAttachments.filter(a=>a.id!==aid);
  }else{
    const r = results.find(x=>x.id===editingId);
    if(r){ r.attachments = (r.attachments||[]).filter(a=>a.id!==aid); save(); }
  }
  try{ await fileDel(aid); }catch(e){}
  renderFormAttach();
  toast("附件已移除");
}

/* ---------- 成果详情弹窗 ---------- */
function openDetail(id){
  const r = results.find(x=>x.id===id);
  if(!r) return;
  detailId = id;
  const tc = TYPE_CFG[r.type] || TYPE_CFG.other;
  const sc = STATUS_CFG[r.status] || STATUS_CFG.done;
  $("#detailBadge").innerHTML = tc.icon;
  $("#detailBadge").className = "type-badge " + tc.badge;
  $("#detailTitle").textContent = r.title;
  $("#detailMeta").innerHTML = `<span class="status-pill ${sc.cls}">${sc.label}</span><span>${tc.label} · ${r.year}年</span>`;
  $("#detailDesc").textContent = r.desc || "暂无描述";
  $("#detailTags").innerHTML = (r.tags||[]).map(t=>`<span class="tag-chip">${esc(t)}</span>`).join("")
    + (r.link ? `<a class="detail-link" href="${esc(r.link)}" target="_blank" rel="noopener">🔗 相关链接</a>` : "");
  const list = r.attachments || [];
  $("#detailAttachCount").textContent = list.length ? `(${list.length})` : "";
  $("#detailAttachEmpty").hidden = list.length !== 0;
  $("#detailAttachList").innerHTML = list.length ? list.map(a=>attachItemHtml(a,false)).join("") : "";
  $("#detailMask").hidden = false;
}
function closeDetail(){ $("#detailMask").hidden = true; detailId = null; }

/* ---------- 附件下载 / 预览 ---------- */
async function downloadAtt(aid){
  try{
    const rec = await fileGet(aid);
    if(!rec || !rec.blob){ toast("附件不存在或已被移除"); return; }
    const url = URL.createObjectURL(rec.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = rec.name || "attachment";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
  }catch(e){ toast("下载失败，请重试"); }
}
async function downloadAllAtt(){
  const r = results.find(x=>x.id===detailId);
  const list = (r && r.attachments) || [];
  if(!list.length){ toast("该成果暂无附件"); return; }
  for(const a of list) await downloadAtt(a.id);
  toast(`已开始下载 ${list.length} 个附件（浏览器可能拦截多个下载，请允许）`);
}
async function previewAtt(aid){
  window._previewAid = aid;
  try{
    const rec = await fileGet(aid);
    if(!rec || !rec.blob){ toast("附件不存在或已被移除"); return; }
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(rec.blob);
    $("#previewImg").src = previewUrl;
    $("#previewName").textContent = rec.name || "preview";
    $("#previewMask").hidden = false;
  }catch(e){ toast("预览失败"); }
}
function closePreview(){
  $("#previewMask").hidden = true;
  $("#previewImg").src = "";
  if(previewUrl){ URL.revokeObjectURL(previewUrl); previewUrl = null; }
}

/* ---------- 事件绑定 ---------- */
function bindEvents(){
  // 导航
  $$(".nav-item").forEach(n=> n.addEventListener("click", e=>{
    e.preventDefault();
    switchView(n.dataset.view);
  }));

  // 新增 / 编辑 / 删除
  $("#addBtn").addEventListener("click", ()=> openModal(null));
  $("#modalClose").addEventListener("click", closeModal);
  $("#formCancel").addEventListener("click", closeModal);
  $("#modalMask").addEventListener("click", e=>{ if(e.target===e.currentTarget) closeModal(); });
  $("#formSave").addEventListener("click", submitForm);
  $("#resultForm").addEventListener("keydown", e=>{ if(e.key==="Enter" && e.target.tagName!=="TEXTAREA"){ e.preventDefault(); submitForm(); } });

  // 附件上传
  $("#attachUploadBtn").addEventListener("click", ()=> $("#attachFileInput").click());
  $("#attachFileInput").addEventListener("change", e=>{
    handleAttachFiles(e.target.files);
    e.target.value = "";
  });

  // 详情弹窗
  $("#detailClose").addEventListener("click", closeDetail);
  $("#detailMask").addEventListener("click", e=>{ if(e.target===e.currentTarget) closeDetail(); });
  $("#detailEditBtn").addEventListener("click", ()=>{ const id = detailId; closeDetail(); if(id) openModal(id); });
  $("#detailDownloadAll").addEventListener("click", downloadAllAtt);

  // 图片预览
  $("#previewClose").addEventListener("click", closePreview);
  $("#previewMask").addEventListener("click", e=>{ if(e.target===e.currentTarget) closePreview(); });
  $("#previewDownload").addEventListener("click", ()=>{
    if(window._previewAid) downloadAtt(window._previewAid);
  });

  $("#delCancel").addEventListener("click", closeDel);
  $("#delConfirm").addEventListener("click", confirmDel);
  $("#delMask").addEventListener("click", e=>{ if(e.target===e.currentTarget) closeDel(); });

  // 列表行操作（事件委托）
  document.addEventListener("click", e=>{
    const btn = e.target.closest("[data-act]");
    if(!btn) return;
    const id = btn.dataset.id;
    if(btn.dataset.act==="detail") openDetail(id);
    if(btn.dataset.act==="edit") openModal(id);
    if(btn.dataset.act==="del") openDel(id);
  });

  // 附件操作（下载 / 移除 / 预览）
  document.addEventListener("click", e=>{
    const btn = e.target.closest("[data-aact]");
    if(!btn) return;
    const act = btn.dataset.aact;
    const aid = btn.dataset.aid;
    if(act==="dl") downloadAtt(aid);
    if(act==="rm") removeFormAttach(aid);
  });

  // 大色块板块钻取（空板块 → 直接进入新增，预选该类型）
  $("#sectionBlocks").addEventListener("click", e=>{
    const card = e.target.closest("[data-block]");
    if(!card) return;
    const t = card.dataset.block;
    const has = results.some(r=>r.type===t);
    if(has){
      filters.type = t;
      $("#filterType").value = t;
      switchView("manage");
      renderManage();
    }else{
      openModal(null, t);
    }
  });
  // 板块横幅：返回全部
  $("#bannerBack").addEventListener("click", ()=>{
    filters.type = "";
    $("#filterType").value = "";
    renderManage();
  });

  // 新增按钮（管理页：继承当前板块类型；顶栏：全局）
  $("#manageAddBtn").addEventListener("click", ()=> openModal(null, filters.type || null));
  // 返回键：回到工作台
  $("#backBtn").addEventListener("click", ()=> switchView("dashboard"));

  // 下载中心：勾选板块 / 全选切换
  $("#dlTypeList").addEventListener("change", e=>{
    const cb = e.target;
    if(cb && cb.type==="checkbox"){
      if(cb.checked) dlSelected.add(cb.value); else dlSelected.delete(cb.value);
      updateDlInfo();
    }
  });
  $("#dlToggle").addEventListener("click", ()=>{
    const cbs = [...$$("#dlTypeList input:not(:disabled)")];
    const allOn = cbs.length && cbs.every(c=>c.checked);
    if(allOn){
      cbs.forEach(c=>c.checked=false);
      dlSelected.clear();
    }else{
      cbs.forEach(c=>c.checked=true);
      dlSelected = new Set(cbs.map(c=>c.value));
    }
    updateDlInfo();
  });
  $("#dlZipBtn").addEventListener("click", dlZip);

  // 数据备份 / 恢复
  $("#backupBtn").addEventListener("click", exportBackup);
  $("#restoreBtn").addEventListener("click", ()=> $("#restoreInput").click());
  $("#restoreInput").addEventListener("change", e=>{
    const f = e.target.files && e.target.files[0];
    if(f) importBackup(f);
    e.target.value = "";
  });

  // 筛选 & 搜索
  $("#filterType").addEventListener("change", e=>{ filters.type = e.target.value; renderManage(); });
  $("#filterStatus").addEventListener("change", e=>{ filters.status = e.target.value; renderManage(); });
  $("#filterYear").addEventListener("change", e=>{ filters.year = e.target.value; renderManage(); });
  $("#globalSearch").addEventListener("input", e=>{ searchKw = e.target.value; renderManage(); });

  // 导出
  $("#exportBtn").addEventListener("click", exportData);
  $("#exportListBtn").addEventListener("click", exportList);

  // 键盘：Esc 关闭弹层
  document.addEventListener("keydown", e=>{
    if(e.key==="Escape"){ closeModal(); closeDel(); closeDetail(); closePreview(); }
  });
}

/* ---------- 启动 ---------- */
function init(){
  load();
  populateYearOptions();
  bindEvents();
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);
})();

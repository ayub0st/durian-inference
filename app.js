// ===== CONFIG =====
const ROBOFLOW_MODEL   = "durian-leaf-hpx1m";
const ROBOFLOW_VERSION = "1";
const ROBOFLOW_API_KEY = "qUdNbcOApV2SReomWRn7";

// Optional: mapping คำแนะนำอย่างง่าย (สามารถแก้/เพิ่มเองได้)
const ADVICE_MAP = {
  "LEAF_BLIGHT": {
    tips: ["กำจัดใบที่เป็นโรค", "ลดความชื้นในแปลง", "พ่นสารป้องกันเชื้อราตามคำแนะนำ"],
    fertilizer: ["NPK 13-13-21 ในช่วงฟื้นฟู"]
  },
  "PHOMOPSIS_LEAF_SPOT": {
    tips: ["ตัดแต่งกิ่ง โปร่งแสง", "เก็บเศษใบที่ร่วงไปทำลาย"],
    fertilizer: ["โพแทสเซียมเพื่อเสริมความแข็งแรง"]
  },
  "HEALTHY_LEAF": {
    tips: ["ดูแลความชื้นให้เหมาะสม", "เฝ้าระวังแมลงพาหะ"],
    fertilizer: ["สูตรเสมอ 15-15-15"]
  }
};

$(function(){
  $('#status').text('พร้อมทำงาน');
  $('#pickFile').on('click', (e)=>{ e.preventDefault(); $('#file').click(); });
  $('#file').on('change', handleFile);
  $('#runBtn').on('click', run);
  $('#clearBtn').on('click', clearAll);
  $('#copyBtn').on('click', copyJson);
  initDrop();
});

function initDrop(){
  const dz = document.getElementById('dropzone');
  ['dragenter','dragover','dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }));
  dz.addEventListener('dragover', () => dz.classList.add('hover'));
  dz.addEventListener('dragleave', () => dz.classList.remove('hover'));
  dz.addEventListener('drop', (e) => {
    dz.classList.remove('hover');
    const file = e.dataTransfer.files?.[0];
    if(file){ readAndPreview(file); $('#file')[0].files = e.dataTransfer.files; }
  });
}

function handleFile(e){
  const f = e.target.files?.[0];
  if(!f) return;
  readAndPreview(f);
}

function readAndPreview(file){
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      $('#preview').removeClass('hidden').find('img').attr('src', fr.result);
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

async function run(){
  try{
    $('#status').text('กำลังประมวลผล…');
    $('#output').text('Inferring…');
    const imageUrl = $('#url').val().trim();
    let base64 = '';

    if(!imageUrl){
      const f = $('#file')[0].files?.[0];
      if(!f){ alert('กรุณาเลือกรูปภาพหรือใส่ URL'); return; }
      const raw = await readAsDataURL(f);
      base64 = await resizeBase64(raw);
    }

    const base = `https://classify.roboflow.com/${encodeURIComponent(ROBOFLOW_MODEL)}/${encodeURIComponent(ROBOFLOW_VERSION)}?api_key=${encodeURIComponent(ROBOFLOW_API_KEY)}`;
    let res;
    if(imageUrl){
      res = await fetch(base + `&image=${encodeURIComponent(imageUrl)}`, { method:'POST' });
    }else{
      res = await fetch(base, { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body: base64 });
    }
    const j = await res.json();
    $('#output').text(JSON.stringify(j, null, 2));
    renderSummary(j);
    renderAdvice(j);
    $('#status').text('สำเร็จ');
  }catch(err){
    $('#status').text('เกิดข้อผิดพลาด');
    $('#output').text(String(err));
  }
}

function renderSummary(resp){
  const el = $('#summary');
  let list = [];
  if(Array.isArray(resp?.predictions)){
    list = resp.predictions.map(x => ({ cls: x.class || x.label || 'Unknown', conf: Number(x.confidence || x.score || 0) }));
    list.sort((a,b)=> b.conf - a.conf);
    const top = list.slice(0,5);
    el.html(top.length ? '<ol>' + top.map(i=>`<li><b>${i.cls}</b> — ${(i.conf*100).toFixed(1)}%</li>`).join('') + '</ol>' : '<em>ไม่มีผลลัพธ์</em>');
  }else if(Array.isArray(resp?.predicted_classes)){
    el.html('<ol>' + resp.predicted_classes.map(c => `<li><b>${c}</b></li>`).join('') + '</ol>');
  }else{
    el.html('<em>ไม่มีผลลัพธ์</em>');
  }
}

function renderAdvice(resp){
  const el = $('#advice');
  let candidates = [];
  if(Array.isArray(resp?.predictions)){
    candidates = resp.predictions.map(x => String(x.class || x.label || ''));
  }else if(Array.isArray(resp?.predicted_classes)){
    candidates = resp.predicted_classes.map(String);
  }
  const seen = new Set();
  const items = [];
  for(const c of candidates){
    const key = (c||'').toUpperCase().trim();
    if(!key || seen.has(key)) continue;
    seen.add(key);
    if(ADVICE_MAP[key]){
      const adv = ADVICE_MAP[key];
      items.push({ className: c, tips: adv.tips||[], fertilizer: adv.fertilizer||[] });
    }
  }
  if(!items.length){ el.html('<em>ยังไม่มีคำแนะนำ</em>'); return; }
  const html = items.map(a => `
    <div class="adv">
      <b>${a.className}</b>
      ${a.tips?.length ? '<ul>' + a.tips.map(t=>`<li>${t}</li>`).join('') + '</ul>' : ''}
      ${a.fertilizer?.length ? '<p><u>ปุ๋ยแนะนำ</u></p><ul>' + a.fertilizer.map(t=>`<li>${t}</li>`).join('') + '</ul>' : ''}
    </div>
  `).join('');
  el.html(html);
}

function clearAll(){
  $('#file').val(''); $('#url').val(''); $('#preview').addClass('hidden').find('img').attr('src','');
  $('#summary').html('<em>ยังไม่มีผลลัพธ์</em>');
  $('#advice').html('<em>ยังไม่มีคำแนะนำ</em>');
  $('#output').text('รอผลลัพธ์…');
  $('#status').text('พร้อมทำงาน');
}

function copyJson(){
  const txt = $('#output').text();
  navigator.clipboard.writeText(txt).then(()=>{
    $('#status').text('คัดลอก JSON แล้ว');
    setTimeout(()=> $('#status').text('พร้อมทำงาน'), 1500);
  });
}

function readAsDataURL(file){
  return new Promise((res,rej)=>{
    const fr = new FileReader();
    fr.onload = ()=> res(String(fr.result));
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

function resizeBase64(base64, max=1500){
  return new Promise((resolve)=>{
    const img = new Image();
    img.onload = ()=>{
      const c = document.createElement('canvas');
      let w = img.width, h = img.height;
      if(w>h && w>max){ h*=max/w; w=max } else if(h>=w && h>max){ w*=max/h; h=max }
      c.width = Math.round(w); c.height = Math.round(h);
      const ctx = c.getContext('2d'); ctx.drawImage(img,0,0,c.width,c.height);
      resolve(c.toDataURL('image/jpeg', 0.95));
    };
    img.src = base64;
  });
}

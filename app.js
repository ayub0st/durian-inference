// ===== CONFIG =====
const ROBOFLOW_MODEL   = "durian-leaf-hpx1m";
const ROBOFLOW_VERSION = "1";
const ROBOFLOW_API_KEY = "qUdNbcOApV2SReomWRn7";

// Leaf Gate (ตรวจว่ามีใบ)
const LEAF_SEG_MODEL   = "leaf-segmentation-xwbm5";
const LEAF_SEG_VERSION = "3";

// ===== ADVICE MAP =====
const ADVICE_MAP = {
  "ALGAL_LEAF_SPOT": {
    tips: ["ตัดใบที่เป็นโรคออกและเผาทำลาย","พ่นสารทองแดง (Copper) ตามฉลาก","ลดความชื้นในแปลง"],
    actives: ["Copper (ทองแดง)"],
    fertilizer: ["โพแทสเซียม (K)", "แคลเซียม-ซิลิกา"]
  },
  "ALLOCARIDARA_ATTACK": {
    tips: ["ใช้กับดักกาวเหนียวสีเหลือง","พ่นน้ำส้มควันไม้หรือน้ำสบู่อ่อน","ใช้เชื้อรา Beauveria bassiana หรือสาร Imidacloprid"],
    actives: ["Beauveria bassiana","Imidacloprid"],
    fertilizer: ["ฟอสฟอรัส (P)","โพแทสเซียม (K)","แมกนีเซียม (Mg)"]
  },
  "HEALTHY_LEAF": {
    tips: ["ดูแลความชื้นให้เหมาะสม","ใส่ปุ๋ยสม่ำเสมอ","เฝ้าระวังโรคและแมลง"],
    actives: [],
    fertilizer: ["สูตรเสมอ 15-15-15","เสริม B, Zn, Mg"]
  },
  "LEAF_BLIGHT": {
    tips: ["กำจัดใบที่เป็นโรคและเผาทำลาย","ตัดแต่งกิ่งให้โปร่ง","พ่นสารป้องกันเชื้อราตามฉลาก"],
    actives: ["Mancozeb","Chlorothalonil","Copper"],
    fertilizer: ["NPK 13-13-21","อินทรีย์ผสมฮิวมิคแอซิด"]
  },
  "LEAF_SPOT": {
    tips: ["เก็บใบที่ร่วงและเผาทำลาย","พ่นสาร Copper หรือ Mancozeb","ควบคุมความชื้นในสวน"],
    actives: ["Copper","Mancozeb"],
    fertilizer: ["โพแทสเซียมสูง (K)","Zn, Mn, B"]
  },
  "NO_DISEASE": {
    tips: ["ดูแลน้ำ-ปุ๋ยให้สมดุล","ตรวจสอบใบอย่างสม่ำเสมอ"],
    actives: [],
    fertilizer: ["25-7-7 หรือ 16-16-16 (ระยะใบอ่อน)","12-24-12 (เตรียมออกดอก)"]
  },
  "PHOMOPSIS_LEAF_SPOT": {
    tips: ["ตัดแต่งกิ่งให้โปร่งแสง","เก็บใบที่เป็นโรคและเศษใบไปทำลาย","พ่นสารป้องกันเชื้อรา (Carbendazim / Thiophanate-methyl)"],
    actives: ["Carbendazim","Thiophanate-methyl"],
    fertilizer: ["โพแทสเซียมสูง (K)","แคลเซียม-โบรอน (Ca-B)","ปุ๋ยอินทรีย์เสริม"]
  }
};

// ===== Utils =====
function normKey(s=""){ return s.trim().replace(/\s+/g,' ').replace(/_/g,' ').toUpperCase(); }
function byRef(k){ return ADVICE_MAP[normKey(k)] || null; }

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function chipLink(label, href){
  const safeHref = href.replace(/"/g,'%22');
  return `<span class="chip"><a href="${safeHref}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a></span>`;
}
function googleLabelQuery(active){
  return `https://www.google.com/search?q=${encodeURIComponent(`${active} ฉลาก การใช้พืช อ่านฉลาก`)}`;
}
function googleSafetyQuery(active){
  return `https://www.google.com/search?q=${encodeURIComponent(`${active} safety data sheet MSDS label`)}`;
}

// ===== Init =====
$(function(){
  $('#status').text('พร้อมทำงาน');
  $('#pickFile').on('click', (e)=>{ e.preventDefault(); $('#file').click(); });
  $('#file').on('change', handleFile);
  $('#runBtn').on('click', run);
  $('#resetBtn').on('click', resetAll);
  $('#copyBtn').on('click', copyJson);
  $('#devToggleBtn').on('click', toggleDevMode);
  initDrop();
});

// ===== Drag & Drop =====
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
      clearBoxes();
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
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

// ===== Core: Run =====
async function run(){
  try{
    setAlert(); // clear
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

    // 1) Leaf Gate
    const gate = await leafGate({ imageUrl, base64 });
    if(!gate.ok){
      setAlert('ไม่ใช่ภาพใบที่ตรวจจับได้ กรุณาอัปโหลดใหม่', 'error');
      $('#status').text('ไม่ผ่านการตรวจขั้นต้น');
      $('#summary').html('<em>ยกเลิกการวิเคราะห์ (ภาพไม่ใช่ใบ)</em>');
      $('#top3cards').addClass('hidden').empty();
      $('#advice-tips').html('<em>—</em>');
      $('#advice-actives').html('<em>—</em>');
      $('#advice-fert').html('<em>—</em>');
      $('#output').text(JSON.stringify(gate.raw || {error:'leaf gate failed'}, null, 2));
      clearBoxes();
      return;
    }else{
      setAlert('ผ่านการตรวจขั้นต้น: ตรวจพบใบในภาพ', 'ok');
    }

    // 2) Disease classification
    const base = `https://classify.roboflow.com/${encodeURIComponent(ROBOFLOW_MODEL)}/${encodeURIComponent(ROBOFLOW_VERSION)}?api_key=${encodeURIComponent(ROBOFLOW_API_KEY)}`;
    let res;
    if(imageUrl){
      res = await fetch(base + `&image=${encodeURIComponent(imageUrl)}`, { method:'POST' });
    }else{
      res = await fetch(base, { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body: base64 });
    }
    const j = await res.json();

    // developer JSON
    $('#output').text(JSON.stringify({ leaf_gate: gate.raw, disease: j }, null, 2));

    // render
    renderSummary(j);
    renderAdvice(j);
    $('#status').text('สำเร็จ');
  }catch(err){
    $('#status').text('เกิดข้อผิดพลาด');
    $('#output').text(String(err));
  }
}

// ===== Leaf Gate =====
async function leafGate({ imageUrl, base64 }){
  try{
    const url = `https://serverless.roboflow.com/${encodeURIComponent(LEAF_SEG_MODEL)}/${encodeURIComponent(LEAF_SEG_VERSION)}?api_key=${encodeURIComponent(ROBOFLOW_API_KEY)}`;
    let res;
    if(imageUrl){
      res = await fetch(url + `&image=${encodeURIComponent(imageUrl)}`, { method:'POST' });
    }else{
      res = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body: base64 });
    }
    const data = await res.json();
    const preds = Array.isArray(data?.predictions) ? data.predictions : [];
    const ok = preds.length > 0;
    return { ok, raw: data };
  }catch(e){
    // ถ้าติด CORS ให้ผ่าน (ไม่บล็อกการใช้งาน)
    return { ok: true, raw: { error: String(e), fallback: true } };
  }
}

// ===== Summary (Top3 + Box Top1) =====
function renderSummary(resp){
  const listDiv = $('#summary');
  const cardsDiv = $('#top3cards');

  if (Array.isArray(resp?.predictions) && resp.predictions.length){
    const list = resp.predictions.map(x => ({
      cls: x.class || x.label || 'Unknown',
      conf: Number(x.confidence || x.score || 0),
      box: { x:x.x, y:x.y, w:x.width, h:x.height }
    })).sort((a,b)=> b.conf - a.conf);

    const top3 = list.slice(0,3);

    const cardHtml = top3.map((it, idx) => `
      <div class="topcard">
        <span class="badge t${idx+1}">Top ${idx+1}</span>
        <div class="name">${escapeHtml(it.cls)}</div>
        <div class="pct">${(it.conf*100).toFixed(1)}%</div>
      </div>
    `).join('');
    cardsDiv.removeClass('hidden').html(cardHtml);

    const olHtml = '<ol>' + top3.map(i =>
      `<li><b>${escapeHtml(i.cls)}</b> — ${(i.conf*100).toFixed(1)}%</li>`
    ).join('') + '</ol>';
    listDiv.html(olHtml);

    if (top3[0] && top3[0].box) drawTopBox(top3[0]); else clearBoxes();
  } else if (Array.isArray(resp?.predicted_classes) && resp.predicted_classes.length){
    const top3 = resp.predicted_classes.slice(0,3);
    cardsDiv.removeClass('hidden').html(top3.map((c,i)=>`
      <div class="topcard">
        <span class="badge t${i+1}">Top ${i+1}</span>
        <div class="name">${escapeHtml(c)}</div>
      </div>
    `).join(''));
    listDiv.html('<ol>' + top3.map(c => `<li><b>${escapeHtml(c)}</b></li>`).join('') + '</ol>');
    clearBoxes();
  } else {
    cardsDiv.addClass('hidden').empty();
    listDiv.html('<em>ยังไม่มีผลลัพธ์</em>');
    clearBoxes();
  }
}

// ===== Advice (Tabs: tips / actives / fertilizer) =====
function renderAdvice(resp){
  let items = [];
  if (Array.isArray(resp?.predictions) && resp.predictions.length){
    const list = resp.predictions.map(x => ({
      cls: String(x.class || x.label || ''),
      conf: Number(x.confidence || x.score || 0)
    })).sort((a,b)=> b.conf - a.conf).slice(0,3);
    items = list.map(l => ({ cls: l.cls, conf: l.conf }));
  } else if (Array.isArray(resp?.predicted_classes) && resp.predicted_classes.length){
    items = resp.predicted_classes.slice(0,3).map(c => ({ cls: String(c), conf: null }));
  }

  const results = [];
  const seen = new Set();
  for (const it of items){
    const key = normKey(it.cls);
    if (seen.has(key)) continue;
    seen.add(key);
    const adv = byRef(key);
    if (!adv) continue;
    results.push({
      title: it.conf != null ? `${it.cls} — ${(it.conf*100).toFixed(1)}%` : it.cls,
      tips: adv.tips || [],
      actives: adv.actives || [],
      fertilizer: adv.fertilizer || []
    });
  }

  const tipsEl = $('#advice-tips');
  const actEl  = $('#advice-actives');
  const fertEl = $('#advice-fert');

  if (!results.length){
    tipsEl.html('<em>ยังไม่มีคำแนะนำ</em>');
    actEl.html('<em>ยังไม่มีรายการตัวยา</em>');
    fertEl.html('<em>ยังไม่มีรายการปุ๋ย</em>');
    return;
  }

  // คำแนะนำ (Tips)
  tipsEl.html(results.map(r => `
    <div class="advice-block">
      <div class="advice-title">${escapeHtml(r.title)}</div>
      ${r.tips.length ? '<ul class="advice-list">' + r.tips.map(t=>`<li>${escapeHtml(t)}</li>`).join('') + '</ul>' : '<em>—</em>'}
    </div>
  `).join(''));

  // ตัวยา (Actives) + ปุ่มลิงก์
  actEl.html(results.map(r => `
    <div class="advice-block">
      <div class="advice-title">${escapeHtml(r.title)}</div>
      ${r.actives.length ? `
        <div class="kv">${r.actives.map(ac => `<span class="pill">${escapeHtml(ac)}</span>`).join('')}</div>
        <div class="chips">
          ${r.actives.map(ac => chipLink(`อ่านฉลาก: ${ac}`, googleLabelQuery(ac))).join('')}
          ${r.actives.map(ac => chipLink(`ข้อมูลสาร: ${ac}`, googleSafetyQuery(ac))).join('')}
        </div>
      ` : '<em>—</em>'}
    </div>
  `).join(''));

  // ปุ๋ย (Fertilizer)
  fertEl.html(results.map(r => `
    <div class="advice-block">
      <div class="advice-title">${escapeHtml(r.title)}</div>
      ${r.fertilizer.length ? `<div class="kv">${r.fertilizer.map(f => `<span class="pill">${escapeHtml(f)}</span>`).join('')}</div>` : '<em>—</em>'}
    </div>
  `).join(''));
}

// ===== Tabs switch =====
$(document).on('click', '.tab', function(){
  $('.tab').removeClass('active');
  $(this).addClass('active');
  const which = $(this).data('tab'); // tips | actives | fert
  $('#advice-tips').toggleClass('hidden', which !== 'tips');
  $('#advice-actives').toggleClass('hidden', which !== 'actives');
  $('#advice-fert').toggleClass('hidden', which !== 'fert');
});

// ===== Dev mode toggle =====
let DEV_MODE = false;
function toggleDevMode(){
  DEV_MODE = !DEV_MODE;
  const panel = document.getElementById('devPanel');
  const btn   = document.getElementById('devToggleBtn');

  panel.classList.toggle('hidden', !DEV_MODE);
  btn.setAttribute('aria-expanded', DEV_MODE ? 'true' : 'false');
  btn.textContent = DEV_MODE ? 'ซ่อนโหมดนักพัฒนา' : 'โหมดนักพัฒนา';

  document.querySelectorAll('[data-dev-only]').forEach(el=>{
    el.classList.toggle('hidden', !DEV_MODE);
  });

  if(DEV_MODE && !document.getElementById('gateAlert').textContent.trim()){
    setAlert('Developer mode: จะแสดงผลตรวจใบ (Leaf Gate) และ JSON', 'ok');
  }
}

// ===== Alert helper =====
function setAlert(msg='', type=''){
  const box = $('#gateAlert');
  if(!msg){ box.addClass('hidden').removeClass('error ok').text(''); return; }
  box.removeClass('hidden').toggleClass('error', type==='error').toggleClass('ok', type==='ok').text(msg);
}

// ===== Clipboard =====
function copyJson(){
  const txt = $('#output').text();
  navigator.clipboard.writeText(txt).then(()=>{
    $('#status').text('คัดลอก JSON แล้ว');
    setTimeout(()=> $('#status').text('พร้อมทำงาน'), 1200);
  });
}

// ===== Reset =====
function resetAll(){
  window.location.reload();
}

(function(){
  // ===== Elements =====
  const img = document.getElementById('img');
  const stage = document.getElementById('stage');
  const imgUrl = document.getElementById('imgUrl');
  const loadBtn = document.getElementById('loadBtn');
  const drawBtn = document.getElementById('drawBtn');
  const jsonInput = document.getElementById('jsonInput');
  const toggleJson = document.getElementById('toggleJson');
  const themeToggle = document.getElementById('themeToggle');

  const top3List = document.getElementById('top3List');
  const paneAdvice = document.getElementById('pane-advice');
  const paneChem = document.getElementById('pane-chem');
  const paneFert = document.getElementById('pane-fert');
  const drugLinkBtn = document.getElementById('drugLinkBtn');

  // ===== handlers =====
  loadBtn.addEventListener('click', () => {
    const url = imgUrl.value.trim();
    if(!url){ alert('กรุณาใส่ Image URL'); return; }
    img.src = url;
  });

  drawBtn.addEventListener('click', () => {
    if (!img.complete || !img.naturalWidth) {
      alert('กรุณากด Load Image และรอให้รูปโหลดก่อน'); return;
    }
    let data;
    try { data = JSON.parse(jsonInput.value); }
    catch(e){ alert('JSON ไม่ถูกต้อง'); return; }

    buildTop3(data);
    fillAdvice(data);
    drawLeafBoxes(data);
  });

  toggleJson.addEventListener('click', () => {
    jsonInput.classList.toggle('hide');
  });

  // Tabs
  document.querySelectorAll('.tab[data-pane]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-pane');
      ['advice','chem','fert'].forEach(k=>{
        document.getElementById('pane-'+k).classList.toggle('hide', k!==target);
      })
    });
  });

  drugLinkBtn.addEventListener('click', () => {
    const active = paneAdvice.dataset.key || paneChem.dataset.key || paneFert.dataset.key;
    const k = active || 'HEALTHY_LEAF';
    const links = (ADVICE_MAP[k]?.links)||[];
    if(!links.length){ alert('ยังไม่มีลิงก์ตัวยาสำหรับคลาสนี้'); return; }
    window.open(links[0], '_blank');
  });

  // ===== Theme toggle =====
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
  });

  // ===== functions =====
  function buildTop3(data){
    top3List.innerHTML = '';
    const preds = (data?.leaf_gate?.predictions)||[];

    // รวมคะแนนตามคลาสโรค (ไม่รวม LEAF ซึ่งเป็นกรอบวัตถุ)
    const acc = {};
    preds.forEach(p => {
      const cls = String(p.class || p.label || '').toUpperCase();
      if(!cls || cls === 'LEAF') return;
      acc[cls] = (acc[cls]||0) + (Number(p.confidence)||0);
    });

    const items = Object.entries(acc).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const sum = items.reduce((s,[,v])=>s+v,0) || 1;

    items.forEach(([name,score])=>{
      const pct = Math.round((score/sum)*100);
      const row = document.createElement('div');
      row.className = 'disease';
      row.innerHTML = `
        <div class="name">${name.replaceAll('_',' ')}</div>
        <div class="bar"><span style="width:${pct}%"></span></div>
        <div class="pct">${pct}%</div>
      `;
      top3List.appendChild(row);
    });

    if(!items.length){
      const row = document.createElement('div');
      row.className = 'muted';
      row.textContent = 'ยังไม่มีคลาสโรคสำหรับคำนวณ Top-3';
      top3List.appendChild(row);
    }
  }

  function fillAdvice(data){
    const preds = (data?.leaf_gate?.predictions)||[];
    const diseasePred = preds
      .filter(p => String(p.class||'').toUpperCase() !== 'LEAF')
      .sort((a,b)=> (b.confidence||0) - (a.confidence||0))[0];

    const key = (diseasePred?.class || diseasePred?.label || 'HEALTHY_LEAF').toUpperCase();
    const info = ADVICE_MAP[key];
    const notFound = (txt) => `<span class="muted">${txt}</span>`;

    paneAdvice.dataset.key = key;
    paneChem.dataset.key = key;
    paneFert.dataset.key = key;

    paneAdvice.innerHTML = info?.tips?.length
      ? '<ul>' + info.tips.map(t=>`<li>${t}</li>`).join('') + '</ul>'
      : notFound('ยังไม่มีคำแนะนำ');

    paneChem.innerHTML = info?.actives?.length
      ? '<ul>' + info.actives.map(t=>`<li>${t}</li>`).join('') + '</ul>'
      : notFound('ยังไม่มีรายการตัวยา');

    paneFert.innerHTML = info?.fert?.length
      ? '<ul>' + info.fert.map(t=>`<li>${t}</li>`).join('') + '</ul>'
      : notFound('ยังไม่มีรายการปุ๋ย');
  }

  function drawLeafBoxes(data){
    // ลบกรอบเดิม
    [...stage.querySelectorAll('.box')].forEach(el=>el.remove());

    const preds = (data?.leaf_gate?.predictions)||[];
    const metaW = data?.leaf_gate?.image?.width || img.naturalWidth || 1;
    const metaH = data?.leaf_gate?.image?.height || img.naturalHeight || 1;

    const renderedW = img.clientWidth || img.naturalWidth || metaW;
    const renderedH = img.clientHeight || img.naturalHeight || metaH;

    const scaleX = renderedW / metaW;
    const scaleY = renderedH / metaH;

    preds.forEach((p)=>{
      const cls = String(p.class || p.label || '').toUpperCase();
      if(cls !== 'LEAF') return; // ใส่กรอบเฉพาะใบไม้

      const left = (p.x) * scaleX;
      const top = (p.y) * scaleY;
      const width = (p.width) * scaleX;
      const height = (p.height) * scaleY;

      const box = document.createElement('div');
      box.className = 'box';
      box.style.left = left + 'px';
      box.style.top = top + 'px';
      box.style.width = width + 'px';
      box.style.height = height + 'px';

      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.textContent = 'leaf • ' + Number(p.confidence||0).toFixed(2);

      box.appendChild(tag);
      stage.appendChild(box);
    });
  }
})();

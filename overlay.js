(function(global){
  function drawTopBox(item){
    const img = document.querySelector('#preview img');
    const canvas = document.getElementById('overlay');
    if(!img || !canvas || !item?.box) return;

    const dw = img.clientWidth, dh = img.clientHeight;
    const nw = img.naturalWidth || dw, nh = img.naturalHeight || dh;
    canvas.width = dw; canvas.height = dh;

    const sx = dw / nw, sy = dh / nh;
    const {x, y, w, h} = item.box;

    const left = (x - w/2) * sx;
    const top  = (y - h/2) * sy;
    const bw   = w * sx;
    const bh   = h * sy;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,dw,dh);

    ctx.strokeStyle = '#28d098';
    ctx.lineWidth = 3;
    ctx.strokeRect(left, top, bw, bh);

    const label = `${item.cls} ${(item.conf*100).toFixed(1)}%`;
    ctx.font = '12px Inter, system-ui, sans-serif';
    const pad = 4;
    const tw = ctx.measureText(label).width + pad*2;
    const th = 18;
    ctx.fillStyle = 'rgba(11,18,32,0.65)';
    ctx.fillRect(left, Math.max(0, top - th), tw, th);
    ctx.fillStyle = '#e6eeff';
    ctx.fillText(label, left + pad, Math.max(12, top - th + 12));
  }

  function clearBoxes(){
    const canvas = document.getElementById('overlay');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  global.drawTopBox = drawTopBox;
  global.clearBoxes = clearBoxes;
})(window);

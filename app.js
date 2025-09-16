// … (ส่วน CONFIG และ ADVICE_MAP คงเดิมของคุณ) …

$(function(){
  $('#status').text('พร้อมทำงาน');
  $('#pickFile').on('click', (e)=>{ e.preventDefault(); $('#file').click(); });
  $('#file').on('change', handleFile);
  $('#runBtn').on('click', run);

  // ปุ่มเดียว: Reset (ล้างทุกอย่าง รวมรูป เหมือนเพิ่งเปิดหน้า)
  $('#resetBtn').on('click', resetAll);

  $('#copyBtn').on('click', copyJson);
  initDrop();
});

// ===== Reset เดียว ล้างหมด (reload หน้าให้สถานะสะอาดสุด) =====
function resetAll(){
  // ถ้าต้องการไม่รีเฟรชทั้งหน้า ให้ใช้ clearAll(); return;
  location.reload(); // เหมือนเปิดใหม่ สะอาดสุด
}

// ===== ถ้าต้องการแบบไม่รีเฟรชทั้งหน้า ให้ใช้ฟังก์ชันนี้แทนได้ =====
function clearAll(){
  $('#file').val('');
  $('#url').val('');
  $('#preview').addClass('hidden').find('img').attr('src','');
  $('#summary').html('<em>ยังไม่มีผลลัพธ์</em>');
  $('#advice').html('<em>ยังไม่มีคำแนะนำ</em>');
  $('#output').text('รอผลลัพธ์…');
  $('#status').text('พร้อมทำงาน');
  setAlert(); // ซ่อนแถบแจ้งเตือน
}

// ===== ที่เหลือเหมือนเดิม (handleFile/readAndPreview/run/render… ฯลฯ) =====

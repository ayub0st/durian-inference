// === Advice Map ===
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

function normKey(s=""){ return s.trim().replace(/\s+/g,' ').replace(/_/g,' ').toUpperCase(); }
function byRef(k){ return ADVICE_MAP[normKey(k)] || null; }

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function chipLink(label, href){
  return `<span class="chip"><a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a></span>`;
}
function googleLabelQuery(active){ return `https://www.google.com/search?q=${encodeURIComponent(active+" ฉลาก")}`; }
function googleSafetyQuery(active){ return `https://www.google.com/search?q=${encodeURIComponent(active+" MSDS SDS")}`; }

// === Summary ===
function renderSummary(resp){
  const listDiv=$('#summary'), cardsDiv=$('#top3cards');
  if(Array.isArray(resp?.predictions)&&resp.predictions.length){

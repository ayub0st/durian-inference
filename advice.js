// แผนที่คำแนะนำ (แก้/เพิ่มได้ตามโปรเจกต์จริง)
const ADVICE_MAP = {
  "LEAF_BLIGHT": {
    tips: ["ตัดใบที่เป็นโรค", "ลดความชื้น", "พ่นสารป้องกันเชื้อราให้ตรงฉลาก"],
    actives: ["Mancozeb", "Chlorothalonil", "Copper oxychloride"],
    fert: ["NPK 13-13-21", "เสริมโพแทสเซียมช่วงฟื้นฟู"],
    links: ["https://agri.example/leaf-blight-guide"]
  },
  "PHOMOPSIS_LEAF_SPOT": {
    tips: ["ตัดแต่งกิ่งให้โปร่ง", "กำจัดเศษใบติดเชื้อ", "พ่นสารกลุ่มสโตรบิลูรินตามคำแนะนำ"],
    actives: ["Azoxystrobin", "Tebuconazole"],
    fert: ["สูตรเสมอ 15-15-15", "แคลเซียม-โบรอนเสริมความแข็งแรง"],
    links: ["https://agri.example/phomopsis-leaf-spot"]
  },
  "HEALTHY_LEAF": {
    tips: ["ดูแลการให้น้ำสม่ำเสมอ", "เฝ้าระวังแมลงพาหะ"],
    actives: [],
    fert: ["สูตรเสมอ 15-15-15"],
    links: ["https://agri.example/healthy-leaf"]
  }
};

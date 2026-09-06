# Requirements Document: THLOTTO-II

## 1. Overview & Business Goals
ระบบหวยออนไลน์ THLOTTO-II รองรับหวยครบทุกประเภท (รัฐบาล, ออมสิน, ธ.ก.ส., ฮานอย, ลาว, มาเลย์, หุ้นไทย, หุ้นต่างประเทศ, ล็อตโต้ 15 นาที และหวย 1 นาที) พร้อมระบบจัดการโควตาเลขอั้น/จ่ายครึ่ง และระบบออกรางวัลอัตโนมัติ/กึ่งอัตโนมัติ

## 2. Target Users & Roles
- **Customer (ผู้เล่น):** ซื้อหวย, ตรวจผลรางวัล, ฝาก-ถอนเงิน, ดูกระเป๋าเงิน
- **Admin / Operator:** ตั้งค่ากติกาหวย, อัตราจ่าย, จัดการงวดหวย, คีย์ผลรางวัล, ตรวจสอบรายงานบัญชี
- **Super Admin:** ควบคุมความปลอดภัย, สิทธิ์การใช้งาน, Audit Log

## 3. Active Feature Modules
1. **Lotto Rules & Matrix Engine:** [lottery-betting-matrix.md](file:///c:/Users/armyn/Downloads/THLOTTO-II/docs/lottery-betting-matrix.md)
2. **Architecture Blueprint:** [architecture.md](file:///c:/Users/armyn/Downloads/THLOTTO-II/docs/architecture.md)
3. **Technical Specification & Schema Contracts:** [technical-spec.md](file:///c:/Users/armyn/Downloads/THLOTTO-II/docs/technical-spec.md)

---
*(เอกสารนี้จะถูกอัปเดตและเพิ่มเติมอัตโนมัติทุกครั้งเมื่อรันขั้นตอน `Grill with Docs`)*

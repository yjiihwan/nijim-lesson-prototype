// 더미데이터 — 기준일 고정 2026-08-17(월). 전부 메모리, 새로고침 시 초기화.
window.DB = {
  TODAY: "2026-08-17",
  center: { id: "ct1", name: "엔짐 개봉점" },
  me: { member: "m1", teacher: "t1" },

  members: [
    { id: "m1", name: "김지은", phone: "010-1234-5678" },
    { id: "m2", name: "박서준", phone: "010-2345-6789" },
    { id: "m3", name: "이하늘", phone: "010-3456-7890" },
    { id: "m4", name: "최민아", phone: "010-4567-8901" },
  ],
  teachers: [
    { id: "t1", name: "박코치", subject: "PT" },
    { id: "t2", name: "이필라", subject: "필라테스" },
  ],

  // 수업 멤버십 상품 (validityDays=null → 유효기간 없음)
  products: [
    { id: "pr1", name: "PT 10회", kind: "private", sessions: 10, price: 1000000, validityDays: 30 },
    { id: "pr2", name: "PT 20회", kind: "private", sessions: 20, price: 1800000, validityDays: 90 },
    { id: "pr3", name: "필라테스 그룹 20회", kind: "group", sessions: 20, price: 600000, validityDays: 90 },
    { id: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group", sessions: 10, price: 350000, validityDays: null },
  ],

  // 내(김지은) 보유 수업권
  passes: [
    { id: "ps1", memberId: "m1", productId: "pr1", name: "PT 10회", kind: "private",
      total: 10, unitPrice: 100000, expiresAt: "2026-08-29", remaining: 6 },
    { id: "ps2", memberId: "m1", productId: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group",
      total: 10, unitPrice: 35000, expiresAt: null, remaining: 8 },
  ],

  // 수업권 원장 (append-only)
  ledger: [
    { passId: "ps1", delta: +10, reason: "구매", detail: "PT 10회 · 1,000,000원", at: "2026-07-30 14:02" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/2 (일) PT · 앱 확인", at: "2026-08-02 12:10" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/6 (목) PT · 앱 확인", at: "2026-08-06 12:05" },
    { passId: "ps1", delta: -1, reason: "기한 위반 취소", detail: "8/9 (일) PT · 21시간 전 취소", at: "2026-08-08 14:00" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/13 (목) PT · PIN 확인", at: "2026-08-13 12:03" },
    { passId: "ps2", delta: +10, reason: "구매", detail: "필라테스 그룹 10회 · 350,000원", at: "2026-08-01 10:11" },
    { passId: "ps2", delta: -1, reason: "수강 확인", detail: "8/5 (수) 필라테스 · 자동확정", at: "2026-08-06 10:00" },
    { passId: "ps2", delta: -1, reason: "수강 확인", detail: "8/12 (수) 필라테스 · 앱 확인", at: "2026-08-12 11:20" },
  ],

  // 수업 정의
  classes: [
    { id: "c1", title: "필라테스 기구 초급", teacherId: "t2", kind: "group", capacity: 6,
      schedule: "fixed", scheduleLabel: "매주 월·수 10:00", duration: 50,
      eligibility: "pass", eligibilityLabel: "필라테스 수업권 보유자" },
    { id: "c2", title: "PT 1:1", teacherId: "t1", kind: "private", capacity: 1,
      schedule: "arranged", scheduleLabel: "선생님과 조율", duration: 50,
      eligibility: "list", eligibilityLabel: "지정 회원만 (4명)" },
    { id: "c3", title: "새벽 버닝 크로스핏", teacherId: "t1", kind: "group", capacity: 4,
      schedule: "fixed", scheduleLabel: "매주 화·금 06:30", duration: 60,
      eligibility: "both", eligibilityLabel: "수업권 보유자 + 지정 회원" },
  ],

  // 회차 (이번 주)
  slots: [
    { id: "s1", classId: "c1", date: "2026-08-17", time: "10:00", booked: 4, status: "done" },
    { id: "s2", classId: "c1", date: "2026-08-19", time: "10:00", booked: 3, status: "scheduled" },
    { id: "s3", classId: "c1", date: "2026-08-24", time: "10:00", booked: 6, status: "scheduled", waitlist: 1 },
    { id: "s4", classId: "c3", date: "2026-08-18", time: "06:30", booked: 4, status: "scheduled", waitlist: 2 },
    { id: "s5", classId: "c3", date: "2026-08-21", time: "06:30", booked: 2, status: "scheduled" },
    { id: "s6", classId: "c2", date: "2026-08-18", time: "11:00", booked: 1, status: "scheduled", attendees: ["김지은"] },
    { id: "s7", classId: "c2", date: "2026-08-16", time: "11:00", booked: 1, status: "done", attendees: ["김지은"] },
    { id: "s8", classId: "c2", date: "2026-08-20", time: "19:00", booked: 1, status: "scheduled", attendees: ["최민아"] },
    { id: "s9", classId: "c2", date: "2026-08-17", time: "14:00", booked: 1, status: "scheduled", attendees: ["박서준"] },
    { id: "s10", classId: "c2", date: "2026-08-17", time: "09:00", booked: 1, status: "done", attendees: ["이하늘"] },
  ],

  // 내(김지은) 예약
  bookings: [
    { id: "bk1", slotId: "s6", passId: "ps1", status: "booked", label: "예약 확정" },
    { id: "bk2", slotId: "s4", passId: "ps2", status: "waitlisted", pos: 2, label: "대기 2번" },
    { id: "bk3", slotId: "s7", passId: "ps1", status: "confirm_wait", label: "수강 확인 대기" },
    { id: "bk4", slotId: "s2", passId: "ps2", status: "booked", label: "예약 확정" },
  ],

  // 선생님(박코치) 완료 보고 현황
  reports: [
    { id: "rp1", slotId: "s7", member: "김지은", status: "pending", method: null, label: "회원 확인 대기", at: "8/16 12:01 보고" },
    { id: "rp2", slotId: null, member: "박서준", desc: "8/13 (목) 19:00 PT", status: "confirmed", method: "PIN", label: "확인 완료", at: "8/13 20:12 확인" },
    { id: "rp3", slotId: null, member: "이하늘", desc: "8/12 (수) 18:00 PT", status: "auto", method: "자동확정", label: "자동확정", at: "8/13 18:00" },
    { id: "rp4", slotId: null, member: "최민아", desc: "8/11 (화) 06:30 크로스핏", status: "disputed", method: null, label: "이의제기", at: "8/12 09:30 접수" },
  ],

  // 센터 정책 (02 문서 P4·P5·P7)
  policy: {
    waitlist: true,            // P4-3 예약대기 허용
    cancelMode: "conditional", // P5-1 불가|conditional
    cancelHours: 24,           // P5-2
    signPrivate: true,         // P7-1 개인수업 수강확인 필수
    signGroup: false,          // P7-1 그룹수업
    methodApp: true, methodPin: true, // P7-2
    autoConfirmHours: 24,      // P7-3
    disputeDays: 7,            // P7-4
  },

  // 정산 (8월, 수강확인 성립분만)
  settlement: [
    { teacherId: "t1", teacher: "박코치", sessions: 12, autoCount: 4, amount: 1200000, pushed: false },
    { teacherId: "t2", teacher: "이필라", sessions: 18, autoCount: 1, amount: 630000, pushed: false },
  ],
};

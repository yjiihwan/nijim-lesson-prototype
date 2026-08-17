// 더미데이터 — 기준일 고정 2026-08-17(월) 12:00. 전부 메모리, 새로고침 시 초기화.
// v2: bookings가 좌석의 단일 진실(booked/대기 수는 파생 계산), 정산은 slines(라인) 동적 집계.
// 회원 원장은 실서비스에선 호스트 앱(니짐내짐 CRM) 참조 — 여기선 더미로 대체(06 문서).
window.DB = {
  TODAY: "2026-08-17",
  center: { id: "ct1", name: "엔짐 개봉점" },
  me: { member: "m1", teacher: "t1" },

  members: [
    { id: "m1", name: "김지은", phone: "010-1234-5678", pin: "0417" },
    { id: "m2", name: "박서준", phone: "010-2345-6789", pin: "1121" },
    { id: "m3", name: "이하늘", phone: "010-3456-7890", pin: "0731" },
    { id: "m4", name: "최민아", phone: "010-4567-8901", pin: "0555" },
    { id: "m5", name: "정우람", phone: "010-5678-9012", pin: "0808" },
    { id: "m6", name: "한소라", phone: "010-6789-0123", pin: "0909" },
    { id: "m7", name: "오세훈", phone: "010-7890-1234", pin: "1010" },
    { id: "m8", name: "유나래", phone: "010-8901-2345", pin: "1111" }, // 수업권 없음 (필터 데모)
    // 선생님의 호스트 앱 회원 계정 (staff=수강 회원 picker·즉시확정 목록에서 제외)
    { id: "m9", name: "박코치", phone: "010-9012-3456", pin: "2222", staff: true },
    { id: "m10", name: "이필라", phone: "010-0123-4567", pin: "3333", staff: true },
  ],
  // 시정①: 선생님 계정 = 호스트 앱 회원 계정(memberId) — 수업 개설 권한 판정에 사용 (02 P2-2)
  teachers: [
    { id: "t1", name: "박코치", subject: "PT", memberId: "m9" },
    { id: "t2", name: "이필라", subject: "필라테스", memberId: "m10" },
  ],

  // 수업 멤버십 상품 (validityDays=null → 유효기간 없음)
  products: [
    { id: "pr1", name: "PT 10회", kind: "private", sessions: 10, price: 1000000, validityDays: 30 },
    { id: "pr2", name: "PT 20회", kind: "private", sessions: 20, price: 1800000, validityDays: 90 },
    { id: "pr3", name: "필라테스 그룹 20회", kind: "group", sessions: 20, price: 600000, validityDays: 90 },
    { id: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group", sessions: 10, price: 350000, validityDays: null },
  ],

  // 보유 수업권 (전 회원 — 내역 화면은 m1 것만 표시)
  passes: [
    { id: "ps1", memberId: "m1", productId: "pr1", name: "PT 10회", kind: "private",
      total: 10, unitPrice: 100000, expiresAt: "2026-08-29", remaining: 6 },
    { id: "ps2", memberId: "m1", productId: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group",
      total: 10, unitPrice: 35000, expiresAt: null, remaining: 8 },
    { id: "ps3", memberId: "m1", productId: "pr3", name: "필라테스 그룹 20회", kind: "group",
      total: 20, unitPrice: 30000, expiresAt: "2026-08-10", remaining: 2 }, // 기간 만료 데모
    { id: "ps4", memberId: "m2", productId: "pr2", name: "PT 20회", kind: "private", total: 20, unitPrice: 90000, expiresAt: "2026-10-30", remaining: 11 },
    { id: "ps5", memberId: "m2", productId: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group", total: 10, unitPrice: 35000, expiresAt: null, remaining: 7 },
    { id: "ps6", memberId: "m3", productId: "pr1", name: "PT 10회", kind: "private", total: 10, unitPrice: 100000, expiresAt: "2026-08-20", remaining: 2 },
    { id: "ps7", memberId: "m3", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 30000, expiresAt: "2026-09-28", remaining: 9 },
    { id: "ps8", memberId: "m4", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 30000, expiresAt: "2026-09-15", remaining: 5 },
    { id: "ps9", memberId: "m5", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 30000, expiresAt: "2026-10-05", remaining: 14 },
    { id: "ps10", memberId: "m6", productId: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group", total: 10, unitPrice: 35000, expiresAt: null, remaining: 4 },
    { id: "ps11", memberId: "m7", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 30000, expiresAt: "2026-11-01", remaining: 17 },
    { id: "ps12", memberId: "m10", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 30000, expiresAt: "2026-12-31", remaining: 20 }, // 이필라: 멤버십 자격으로 수업 개설 (시정①)
  ],

  // 수업권 원장 (append-only) — m1 것만 시드
  ledger: [
    { passId: "ps1", delta: +10, reason: "구매", detail: "PT 10회 · 1,000,000원", at: "2026-07-30 14:02" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/2 (일) PT · 앱 확인", at: "2026-08-02 12:10" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/6 (목) PT · 앱 확인", at: "2026-08-06 12:05" },
    { passId: "ps1", delta: -1, reason: "기한 위반 취소", detail: "8/9 (일) PT · 21시간 전 취소", at: "2026-08-08 14:00" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/13 (목) PT · PIN 확인", at: "2026-08-13 12:03" },
    { passId: "ps2", delta: +10, reason: "구매", detail: "필라테스 그룹 10회 · 350,000원", at: "2026-08-01 10:11" },
    { passId: "ps2", delta: -1, reason: "수강 확인", detail: "8/5 (수) 필라테스 · 자동확정", at: "2026-08-06 10:00" },
    { passId: "ps2", delta: -1, reason: "수강 확인", detail: "8/12 (수) 필라테스 · 앱 확인", at: "2026-08-12 11:20" },
    { passId: "ps3", delta: +20, reason: "구매", detail: "필라테스 그룹 20회 · 600,000원", at: "2026-05-12 11:00" },
  ],

  // 수업 정의 — eligibility: pass(수업권 보유자)/list(지정 회원)/both(혼합)
  // pass·both → eligibleProductIds, list·both → memberIds. status: active|closed
  classes: [
    { id: "c1", title: "필라테스 기구 초급", teacherId: "t2", kind: "group", capacity: 6,
      schedule: "fixed", scheduleLabel: "매주 월·수 10:00", duration: 50,
      eligibility: "pass", eligibleProductIds: ["pr3", "pr4"], memberIds: [], status: "active" },
    { id: "c2", title: "PT 1:1", teacherId: "t1", kind: "private", capacity: 1,
      schedule: "arranged", scheduleLabel: "선생님과 조율", duration: 50,
      eligibility: "list", eligibleProductIds: ["pr1", "pr2"], memberIds: ["m1", "m2", "m3", "m4"], status: "active" },
    { id: "c3", title: "새벽 버닝 크로스핏", teacherId: "t1", kind: "group", capacity: 4,
      schedule: "fixed", scheduleLabel: "매주 화·금 06:30", duration: 60,
      eligibility: "both", eligibleProductIds: ["pr3", "pr4"], memberIds: ["m2", "m7"], status: "active" },
  ],

  // 회차 — 좌석·대기 수는 bookings에서 파생 (저장 안 함). adhoc=조율/즉시확정으로 생성
  slots: [
    { id: "s1", classId: "c1", date: "2026-08-17", time: "10:00", status: "done" },
    { id: "s2", classId: "c1", date: "2026-08-19", time: "10:00", status: "scheduled" },
    { id: "s3", classId: "c1", date: "2026-08-24", time: "10:00", status: "scheduled" },
    { id: "s4", classId: "c3", date: "2026-08-18", time: "06:30", status: "scheduled" },
    { id: "s5", classId: "c3", date: "2026-08-21", time: "06:30", status: "scheduled" },
    { id: "s6", classId: "c2", date: "2026-08-18", time: "11:00", status: "scheduled", adhoc: true },
    { id: "s7", classId: "c2", date: "2026-08-16", time: "11:00", status: "done", adhoc: true },
    { id: "s8", classId: "c2", date: "2026-08-20", time: "19:00", status: "scheduled", adhoc: true },
    { id: "s9", classId: "c2", date: "2026-08-17", time: "14:00", status: "scheduled", adhoc: true },
    { id: "s10", classId: "c2", date: "2026-08-17", time: "09:00", status: "done", adhoc: true },
  ],

  // 예약 — 전 회원 좌석의 단일 진실. policySnap=예약 시점 취소규정 스냅샷(02 문서, 소급 방지)
  bookings: [
    // s1 필라테스 8/17(종료·보고 전) 4명
    { id: "bk0", slotId: "s1", memberId: "m1", passId: "ps2", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA1", slotId: "s1", memberId: "m2", passId: "ps5", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA2", slotId: "s1", memberId: "m5", passId: "ps9", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA3", slotId: "s1", memberId: "m6", passId: "ps10", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    // s2 필라테스 8/19 3명
    { id: "bk4", slotId: "s2", memberId: "m1", passId: "ps2", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA4", slotId: "s2", memberId: "m5", passId: "ps9", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA5", slotId: "s2", memberId: "m6", passId: "ps10", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    // s3 필라테스 8/24 만석 6명
    { id: "bkA6", slotId: "s3", memberId: "m2", passId: "ps5", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA7", slotId: "s3", memberId: "m3", passId: "ps7", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA8", slotId: "s3", memberId: "m4", passId: "ps8", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA9", slotId: "s3", memberId: "m5", passId: "ps9", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA10", slotId: "s3", memberId: "m6", passId: "ps10", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA11", slotId: "s3", memberId: "m7", passId: "ps11", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    // s4 크로스핏 8/18 만석 4명 + 대기 2 (m3 1번, 나 2번)
    { id: "bkA12", slotId: "s4", memberId: "m2", passId: "ps5", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA13", slotId: "s4", memberId: "m5", passId: "ps9", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA14", slotId: "s4", memberId: "m6", passId: "ps10", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA15", slotId: "s4", memberId: "m7", passId: "ps11", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA16", slotId: "s4", memberId: "m3", passId: "ps7", status: "waitlisted", pos: 1, policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bk2", slotId: "s4", memberId: "m1", passId: "ps2", status: "waitlisted", pos: 2, policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    // s5 크로스핏 8/21 2명
    { id: "bkA17", slotId: "s5", memberId: "m2", passId: "ps5", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA18", slotId: "s5", memberId: "m4", passId: "ps8", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    // PT 1:1
    { id: "bk1", slotId: "s6", memberId: "m1", passId: "ps1", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bk3", slotId: "s7", memberId: "m1", passId: "ps1", status: "confirm_wait", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA19", slotId: "s8", memberId: "m4", passId: null, status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA20", slotId: "s9", memberId: "m2", passId: "ps4", status: "booked", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
    { id: "bkA21", slotId: "s10", memberId: "m3", passId: "ps6", status: "confirm_wait", policySnap: { cancelHours: 24, cancelMode: "conditional" } },
  ],

  // 조율 요청 (schedule_mode=arranged) — 확정 전엔 회차·예약 미생성 (ERD 원칙)
  arranges: [
    { id: "ar1", classId: "c2", memberId: "m2", passId: "ps4", date: "2026-08-21", time: "09:00",
      status: "pending", note: "출근 전 이른 시간 희망해요", at: "2026-08-16 20:30" },
  ],

  // 완료 보고·수강확인 (회차×회원 1행) — deducted=차감 성립 여부, lineId=정산 라인
  reports: [
    { id: "rp1", slotId: "s7", bookingId: "bk3", memberId: "m1", member: "김지은", status: "pending", method: null, label: "회원 확인 대기", at: "8/16 12:01 보고", deducted: false, lineId: null },
    { id: "rp5", slotId: "s10", bookingId: "bkA21", memberId: "m3", member: "이하늘", status: "pending", method: null, label: "회원 확인 대기", at: "8/17 10:05 보고", deducted: false, lineId: null },
    { id: "rp2", slotId: null, bookingId: null, memberId: "m2", member: "박서준", desc: "8/13 (목) 19:00 PT", status: "confirmed", method: "PIN", label: "확인 완료", at: "8/13 20:12 확인", deducted: true, lineId: "sl3" },
    { id: "rp3", slotId: null, bookingId: null, memberId: "m3", member: "이하늘", desc: "8/12 (수) 18:00 PT", status: "auto", method: "자동확정", label: "자동확정", at: "8/13 18:00", deducted: true, lineId: "sl4" },
    { id: "rp4", slotId: null, bookingId: null, memberId: "m4", member: "최민아", desc: "8/11 (화) 06:30 크로스핏", status: "disputed", method: null, label: "이의제기", at: "8/12 09:30 접수", deducted: true, lineId: "sl12" },
    // 노쇼 데모 시드 (형 확정 08-17) — noshow=이의 시 센터 중재 분기, teacherId·date·unitPrice=보상 정산·기한 계산용
    { id: "rp6", slotId: null, bookingId: null, memberId: "m6", member: "한소라", desc: "8/5 (수) 10:00 필라테스 기구 초급", teacherId: "t2", date: "2026-08-05", unitPrice: 35000, noshow: true, status: "noshow_final", method: "자동확정", autoFinal: true, label: "노쇼 확정 · 무이의 자동확정", at: "8/5 11:05 보고 · 8/12 무이의 자동확정", deducted: true, lineId: null },
    { id: "rp7", slotId: null, bookingId: null, memberId: "m7", member: "오세훈", desc: "8/12 (수) 10:00 필라테스 기구 초급", teacherId: "t2", date: "2026-08-12", unitPrice: 30000, noshow: true, status: "noshow_wait", method: null, label: "노쇼 보고 · 이의기간", at: "8/12 11:10 보고", deducted: false, lineId: null },
  ],

  // 센터 정책 (02 문서) — 예약·수업권엔 스냅샷으로 소급 안 됨
  policy: {
    waitlist: true,             // P4-3 예약대기 허용
    waitlistPromote: "auto",    // P4-4 자동(순번)/manual
    cancelMode: "conditional",  // P5-1 불가|conditional
    cancelHours: 24,            // P5-2
    noshowDeduct: true,         // P5-4 노쇼 차감 여부
    // P5-4b 형 확정(2026-08-17): teacher_report=보고→회원 즉시 통지→이의기간(P7-4) 무이의 시 자동 확정·차감,
    // 이의 건만 센터 중재. center_only=센터만 판정(대안 옵션). 이의기간 길이는 disputeDays(센터별, 기본 7일).
    noshowActor: "teacher_report",
    quickScope: "valid",        // P6-4 즉시확정 회원 표시: valid(유효 수업권 보유자만)/all/mine(담당만)
    signPrivate: true,          // P7-1 개인수업 수강확인 필수
    signGroup: false,           // P7-1 그룹수업
    methodApp: true, methodPin: true, // P7-2
    autoConfirmHours: 24,       // P7-3 (0=사용 안 함)
    autoWarnRate: 30,           // P7-5 자동확정 비율 경고 임계 %
    disputeDays: 7,             // P7-4
    // P9-1 형 확정(2026-08-17): 노쇼 보상은 센터별 설정 — none(없음·기본)/support(지원)
    noshowReward: "none",
    noshowRewardPrice: "normal", // 단가: normal(정상=수업권 회당 단가)/custom(별도 지정)
    noshowRewardCustom: 20000,   // 별도 단가(원) — customMode:"amount"일 때 사용
    // 별도 단가 방식: amount(고정 금액·원)/percent(수업료의 %). 키 없음=amount(v2.4까지 저장분 하위 호환).
    noshowRewardCustomMode: "amount",
    noshowRewardPercent: 30,     // percent 모드: 회당 단가(정상 단가)의 n% (0~100), 원 단위 반올림
    noshowRewardPush: "auto",    // 샐리 전달: auto(special rewardCodes push)/manual(샐리 수동 체크)
    // P2-2 (시정①) 수업 개설·관리 권한: 센터 지정 회원 or 자격 멤버십 보유 회원. 둘 다 비우면 센터만.
    classAuth: { memberIds: ["m9"], productIds: ["pr3"] }, // 박코치=센터 지정, 이필라=필라테스 그룹 멤버십 자격
    // P2-2b (v2.3) 선생님별 «지정 가능 회원 범위» — 키 없음 또는 mode:"all"=전체 회원(기본, v2.2까지 동작과 동일).
    // custom: productIds(멤버십 단위 전체) ∪ memberIds(멤버십 하위 개별 선택 회원). 수업 개설 «지정 회원»·즉시확정 목록에 적용.
    teacherScope: {
      t2: { mode: "custom", productIds: ["pr3"], memberIds: ["m2"] }, // 이필라: 필라테스 그룹 20회 전체 + 개별 박서준 (데모 시드)
    },
  },

  // 정산 라인 (8월) — 수강확인 성립 tx마다 1행. status: eligible|held(이의 보류)|removed(인용·무효화)
  slines: [],
};

// 8월 기확정분 시드 — 박코치(t1): PT 11회(자동 4) + 크로스핏 1회(이의로 보류), 이필라(t2): 필라테스 18회(자동 1)
(function seedSlines() {
  const L = window.DB.slines;
  const t1pt = [
    ["m2", "박서준", "8/2 (일) 11:00 PT", "PIN 확인", false],
    ["m3", "이하늘", "8/3 (월) 18:00 PT", "앱 확인", false],
    ["m2", "박서준", "8/13 (목) 19:00 PT", "PIN 확인", false], // sl3 = rp2
    ["m3", "이하늘", "8/12 (수) 18:00 PT", "자동확정", true],  // sl4 = rp3
    ["m1", "김지은", "8/2 (일) PT", "앱 확인", false],
    ["m1", "김지은", "8/6 (목) PT", "앱 확인", false],
    ["m2", "박서준", "8/7 (금) 19:00 PT", "자동확정", true],
    ["m3", "이하늘", "8/8 (토) 18:00 PT", "앱 확인", false],
    ["m1", "김지은", "8/13 (목) PT", "PIN 확인", false],
    ["m2", "박서준", "8/14 (금) 19:00 PT", "자동확정", true],
    ["m3", "이하늘", "8/15 (토) 18:00 PT", "자동확정", true],
  ];
  t1pt.forEach(([mid, name, desc, method, auto], i) => {
    L.push({ id: "sl" + (i + 1), teacherId: "t1", memberId: mid, member: name, desc, unitPrice: 100000, method, auto, status: "eligible", pushed: false, pushId: null });
  });
  L.push({ id: "sl12", teacherId: "t1", memberId: "m4", member: "최민아", desc: "8/11 (화) 06:30 크로스핏", unitPrice: 35000, method: "자동확정", auto: false, status: "held", pushed: false, pushId: null });
  for (let i = 0; i < 18; i++) {
    L.push({ id: "sl" + (13 + i), teacherId: "t2", memberId: null, member: "필라테스 수강회원", desc: `8/${3 + Math.floor(i / 3)} 필라테스 기구 초급`, unitPrice: 35000, method: i === 5 ? "자동확정" : "앱 확인", auto: i === 5, status: "eligible", pushed: false, pushId: null });
  }
})();

// v2.4 대규모 회원 시드 — 총 3,000명 (형 지적 08-17: 수천 명 센터에서 칩 전체 나열 UI 불가 → 검색 기반 선택 UI 검증용).
// 기명 데모 회원(m1~m10)·시나리오는 그대로 유지. LCG 결정적 생성 — 새로고침·테스트 간 동일 데이터.
(function seedScaleMembers() {
  const M = window.DB.members, P = window.DB.passes, prods = window.DB.products;
  const demoNames = new Set(M.map((m) => m.name));
  const SUR = "김이박최정강조윤장임한오서신권황안송전홍고문양손배백허유남심노하곽성차주우구민류";
  const GA = "지민서예도하주윤채현수시은태정소연재영준";
  const GB = "안은호원우연아영준희린솔빈결담율찬경환";
  let rng = 20260817;
  // 상위 비트 사용 — LCG 하위 비트는 주기가 짧아 % n 시 분포가 심하게 쏠림
  const rnd = (n) => ((rng = (rng * 1103515245 + 12345) % 2147483648), Math.floor((rng / 2147483648) * n));
  const EXPIRES = ["2026-09-15", "2026-10-20", "2026-11-30", "2026-12-31"];
  for (let i = 1; i <= 2990; i++) {
    let name = SUR[rnd(SUR.length)] + GA[rnd(GA.length)] + GB[rnd(GB.length)];
    while (demoNames.has(name)) name = SUR[rnd(SUR.length)] + GA[rnd(GA.length)] + GB[rnd(GB.length)];
    const s7 = String(i).padStart(7, "0");
    const m = { id: "gm" + i, name, phone: "010-9" + s7.slice(0, 3) + "-" + s7.slice(3), pin: "0000" };
    M.push(m);
    const roll = rnd(100);
    if (roll < 28) continue; // 28%는 수업권 미보유 (유효 수업권 필터 검증용)
    const npass = roll >= 88 ? 2 : 1;
    for (let k = 0; k < npass; k++) {
      const pr = prods[rnd(prods.length)];
      const expired = rnd(100) < 6; // 일부는 기간 만료 (만료 필터 검증용)
      const expiresAt = pr.validityDays == null ? null : expired ? "2026-08-01" : EXPIRES[rnd(EXPIRES.length)];
      P.push({ id: "gps" + i + "_" + k, memberId: m.id, productId: pr.id, name: pr.name, kind: pr.kind,
        total: pr.sessions, unitPrice: Math.floor(pr.price / pr.sessions), expiresAt, remaining: 1 + rnd(pr.sessions) });
    }
  }
})();

// v2.7 선생님 대규모 시드 — 32명 추가(총 34명, 직군 혼합. 형 지적 08-17: 선생님 수십 명 센터에서
// 정책 화면 P2-2·P2-2b가 표현 불가 → 검색·요약형 UI 검증용). 기명 데모(박코치 t1·이필라 t2)와
// 시나리오 시드(classAuth·teacherScope t2)는 그대로 유지. LCG 결정적 생성 — 새로고침·테스트 간 동일.
(function seedScaleTeachers() {
  const T = window.DB.teachers, M = window.DB.members, P = window.DB.passes;
  const used = new Set(M.map((m) => m.name));
  T.forEach((t) => used.add(t.name));
  const SUBJ = ["PT", "필라테스", "요가", "크로스핏", "수영", "GX"];
  const SUR = "김이박최정강조윤장임한오서신권황안송전홍고문양손배백허유남심노하곽성차주우구민류";
  const GA = "지민서예도하주윤채현수시은태정소연재영준";
  const GB = "안은호원우연아영준희린솔빈결담율찬경환";
  let rng = 20260818;
  // 상위 비트 사용 — LCG 하위 비트는 주기가 짧아 % n 시 분포가 심하게 쏠림
  const rnd = (n) => ((rng = (rng * 1103515245 + 12345) % 2147483648), Math.floor((rng / 2147483648) * n));
  for (let i = 3; i <= 34; i++) {
    let name = SUR[rnd(SUR.length)] + GA[rnd(GA.length)] + GB[rnd(GB.length)];
    while (used.has(name)) name = SUR[rnd(SUR.length)] + GA[rnd(GA.length)] + GB[rnd(GB.length)];
    used.add(name);
    const s4 = String(i).padStart(4, "0");
    const mid = "gtm" + i;
    M.push({ id: mid, name, phone: "010-8000-" + s4, pin: "0000", staff: true });
    T.push({ id: "gt" + i, name, subject: SUBJ[rnd(SUBJ.length)], memberId: mid });
    // 일부는 자격 멤버십(pr3) 보유 — «멤버십 자격» 권한 경로가 규모에서도 동작하는지 검증용
    if (i % 11 === 0) P.push({ id: "gtps" + i, memberId: mid, productId: "pr3", name: "필라테스 그룹 20회", kind: "group",
      total: 20, unitPrice: 30000, expiresAt: "2026-12-31", remaining: 20 });
  }
  // P2-2b 범위 시드 — 리스트 요약 표기가 다양하게 보이도록 (gt5=멤버십 2개, gt12=개별 회원 5명)
  const TS = window.DB.policy.teacherScope;
  TS.gt5 = { mode: "custom", productIds: ["pr1", "pr2"], memberIds: [] };
  TS.gt12 = { mode: "custom", productIds: [], memberIds: ["gm1", "gm2", "gm3", "gm4", "gm5"] };
})();

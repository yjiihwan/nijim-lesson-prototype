// 더미데이터 — 기준일 고정 2026-08-17(월) 12:00. 전부 메모리, 새로고침 시 초기화.
// v2: bookings가 좌석의 단일 진실(booked/대기 수는 파생 계산), 정산은 slines(라인) 동적 집계.
// v2.9 (형 지적 08-18): 할인 등록 사례 시드(ps9·ps13=회당 24,000원) + pass에 purchasePrice·listPrice
// 스냅샷 + slines 단가를 회원별 pass 스냅샷으로 통일 — 회원별·등록시기별 단가 차이가 화면에서 확인 가능.
// v2.13 (형 확정 08-18): PIN 전면 폐지 — 회원 pin 필드 제거, 확인 수단=앱 확인(원탭)/QR 확인(현장 일회용)/자동확정.
// 회원 원장은 실서비스에선 호스트 앱(니짐내짐 CRM) 참조 — 여기선 더미로 대체(06 문서).
// v2.18 (형 지시 08-18): UI가 지원하는 전 상태를 QA로 훑을 수 있게 케이스 시드 확장 — 파일 맨 끝 seedCases() 참조.
//   수업권: 이용 정지·횟수 소진 / 예약: 노쇼 확정·이의 인정 복원·기한 위반·센터 취소·본인 취소·폐강 취소·대기 승격 /
//   조율: 수락·거절·요청 취소 / 보고: 노쇼 이의 중재 대기·이의 인정 2종 / 상품: 이벤트 할인가(salePrice) / 폐강 수업.
window.DB = {
  TODAY: "2026-08-17",
  center: { id: "ct1", name: "엔짐 개봉점" },
  me: { member: "m1", teacher: "t1" },

  members: [
    { id: "m1", name: "김지은", phone: "010-1234-5678" },
    { id: "m2", name: "박서준", phone: "010-2345-6789" },
    { id: "m3", name: "이하늘", phone: "010-3456-7890" },
    { id: "m4", name: "최민아", phone: "010-4567-8901" },
    { id: "m5", name: "정우람", phone: "010-5678-9012" },
    { id: "m6", name: "한소라", phone: "010-6789-0123" },
    { id: "m7", name: "오세훈", phone: "010-7890-1234" },
    { id: "m8", name: "유나래", phone: "010-8901-2345" }, // 수업권 없음 (필터 데모)
    // 선생님의 호스트 앱 회원 계정 (staff=수강 회원 picker·즉시확정 목록에서 제외)
    { id: "m9", name: "박코치", phone: "010-9012-3456", staff: true },
    { id: "m10", name: "이필라", phone: "010-0123-4567", staff: true },
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
  // v2.9: unitPrice=floor(실구매가÷총횟수) 구매 시점 스냅샷 (05 문서). purchasePrice=실구매가·listPrice=구매 당시 정가
  // 스냅샷 — 할인 등록이면 unitPrice가 정가 회당과 달라지고, 이후 상품가 변경에도 소급되지 않는다.
  passes: [
    // v2.18: remaining=원장 합계와 일치 (ps1: 10-5, ps2: 10-3+1 — seedCases의 8/3 노쇼·8/10 확인·복원·8/14 확인 포함)
    { id: "ps1", memberId: "m1", productId: "pr1", name: "PT 10회", kind: "private",
      total: 10, unitPrice: 100000, purchasePrice: 1000000, listPrice: 1000000, expiresAt: "2026-08-29", remaining: 5 },
    { id: "ps2", memberId: "m1", productId: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group",
      total: 10, unitPrice: 35000, purchasePrice: 350000, listPrice: 350000, expiresAt: null, remaining: 7 },
    { id: "ps3", memberId: "m1", productId: "pr3", name: "필라테스 그룹 20회", kind: "group",
      total: 20, unitPrice: 30000, purchasePrice: 600000, listPrice: 600000, expiresAt: "2026-08-10", remaining: 2 }, // 기간 만료 데모 · 정가 등록
    // v2.9 할인 재등록 데모 — 같은 상품(pr3)인데 회당 24,000원 (재등록 할인 480,000원): ps3(30,000원)과 카드에서 단가 대비
    { id: "ps13", memberId: "m1", productId: "pr3", name: "필라테스 그룹 20회", kind: "group",
      total: 20, unitPrice: 24000, purchasePrice: 480000, listPrice: 600000, expiresAt: "2026-11-12", remaining: 18 },
    { id: "ps4", memberId: "m2", productId: "pr2", name: "PT 20회", kind: "private", total: 20, unitPrice: 90000, purchasePrice: 1800000, listPrice: 1800000, expiresAt: "2026-10-30", remaining: 11 },
    { id: "ps5", memberId: "m2", productId: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group", total: 10, unitPrice: 35000, purchasePrice: 350000, listPrice: 350000, expiresAt: null, remaining: 7 },
    { id: "ps6", memberId: "m3", productId: "pr1", name: "PT 10회", kind: "private", total: 10, unitPrice: 100000, purchasePrice: 1000000, listPrice: 1000000, expiresAt: "2026-08-20", remaining: 2 },
    { id: "ps7", memberId: "m3", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 30000, purchasePrice: 600000, listPrice: 600000, expiresAt: "2026-09-28", remaining: 9 },
    { id: "ps8", memberId: "m4", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 30000, purchasePrice: 600000, listPrice: 600000, expiresAt: "2026-09-15", remaining: 5 },
    // v2.9 할인 등록 데모 — 오픈 프로모션 480,000원 구매: 같은 pr3 정가 회원(30,000원)과 정산에서 단가가 갈린다
    { id: "ps9", memberId: "m5", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 24000, purchasePrice: 480000, listPrice: 600000, expiresAt: "2026-10-05", remaining: 14 },
    { id: "ps10", memberId: "m6", productId: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group", total: 10, unitPrice: 35000, expiresAt: null, remaining: 4 },
    { id: "ps11", memberId: "m7", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 30000, expiresAt: "2026-11-01", remaining: 17 },
    { id: "ps12", memberId: "m10", productId: "pr3", name: "필라테스 그룹 20회", kind: "group", total: 20, unitPrice: 30000, purchasePrice: 600000, listPrice: 600000, expiresAt: "2026-12-31", remaining: 20 }, // 이필라: 멤버십 자격으로 수업 개설 (시정①)
  ],

  // 수업권 원장 (append-only) — m1 것만 시드
  ledger: [
    { passId: "ps1", delta: +10, reason: "구매", detail: "PT 10회 · 1,000,000원", at: "2026-07-30 14:02" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/2 (일) PT · 앱 확인", at: "2026-08-02 12:10" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/6 (목) PT · 앱 확인", at: "2026-08-06 12:05" },
    { passId: "ps1", delta: -1, reason: "기한 위반 취소", detail: "8/9 (일) PT · 21시간 전 취소", at: "2026-08-08 14:00" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/13 (목) PT · QR 확인", at: "2026-08-13 12:03" },
    { passId: "ps2", delta: +10, reason: "구매", detail: "필라테스 그룹 10회 · 350,000원", at: "2026-08-01 10:11" },
    { passId: "ps2", delta: -1, reason: "수강 확인", detail: "8/5 (수) 필라테스 · 자동확정", at: "2026-08-06 10:00" },
    { passId: "ps2", delta: -1, reason: "수강 확인", detail: "8/12 (수) 필라테스 · 앱 확인", at: "2026-08-12 11:20" },
    { passId: "ps3", delta: +20, reason: "구매", detail: "필라테스 그룹 20회 · 600,000원", at: "2026-05-12 11:00" },
    { passId: "ps13", delta: +20, reason: "구매", detail: "필라테스 그룹 20회 · 480,000원 (정가 600,000원 · 재등록 할인)", at: "2026-08-14 10:20" },
    { passId: "ps13", delta: -1, reason: "수강 확인", detail: "8/14 (금) 필라테스 · 앱 확인", at: "2026-08-14 11:05" },
    { passId: "ps13", delta: -1, reason: "수강 확인", detail: "8/16 (일) 필라테스 · 앱 확인", at: "2026-08-16 11:02" },
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
    { id: "rp2", slotId: null, bookingId: null, memberId: "m2", member: "박서준", desc: "8/13 (목) 19:00 PT", status: "confirmed", method: "QR 확인", label: "확인 완료", at: "8/13 20:12 확인", deducted: true, lineId: "sl3" },
    { id: "rp3", slotId: null, bookingId: null, memberId: "m3", member: "이하늘", desc: "8/12 (수) 18:00 PT", status: "auto", method: "자동확정", label: "자동확정", at: "8/13 18:00", deducted: true, lineId: "sl4" },
    { id: "rp4", slotId: null, bookingId: null, memberId: "m4", member: "최민아", desc: "8/11 (화) 06:30 크로스핏", status: "disputed", method: null, label: "이의제기", at: "8/12 09:30 접수", deducted: true, lineId: "sl12" },
    // 노쇼 데모 시드 (형 확정 08-17) — noshow=이의 시 센터 중재 분기, teacherId·date·unitPrice=보상 정산·기한 계산용
    { id: "rp6", slotId: null, bookingId: null, memberId: "m6", member: "한소라", desc: "8/5 (수) 10:00 필라테스 기구 초급", teacherId: "t2", date: "2026-08-05", unitPrice: 35000, noshow: true, status: "noshow_final", method: "자동확정", autoFinal: true, label: "노쇼 확정 · 이의 없이 자동확정", at: "8/5 11:05 보고 · 8/12 이의 없이 자동확정", deducted: true, lineId: null },
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
    methodApp: true, methodQr: true, // P7-2 (v2.13: PIN 전면 폐지 → 현장 일회용 QR)
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
// v2.9: 라인 단가 = 각 회원 수업권(pass)의 구매 시점 스냅샷 — 회원별·등록시기별로 다르다 (일괄 단가 시드 폐기).
//   t1: PT 10회(100,000원) vs PT 20회(90,000원) 혼재. t2: 정가 30,000·35,000원 vs 할인 24,000원(ps9) 혼재.
(function seedSlines() {
  const L = window.DB.slines;
  const passOf = (pid) => window.DB.passes.find((p) => p.id === pid);
  const mk = (id, tid, mid, name, pid, desc, method, auto, status) => {
    const p = passOf(pid);
    L.push({ id, teacherId: tid, memberId: mid, member: name, passId: pid, passName: p.name, desc, unitPrice: p.unitPrice, method, auto, status, pushed: false, pushId: null });
  };
  const t1pt = [
    ["m2", "박서준", "ps4", "8/2 (일) 11:00 PT", "QR 확인", false],
    ["m3", "이하늘", "ps6", "8/3 (월) 18:00 PT", "앱 확인", false],
    ["m2", "박서준", "ps4", "8/13 (목) 19:00 PT", "QR 확인", false], // sl3 = rp2
    ["m3", "이하늘", "ps6", "8/12 (수) 18:00 PT", "자동확정", true],  // sl4 = rp3
    ["m1", "김지은", "ps1", "8/2 (일) PT", "앱 확인", false],
    ["m1", "김지은", "ps1", "8/6 (목) PT", "앱 확인", false],
    ["m2", "박서준", "ps4", "8/7 (금) 19:00 PT", "자동확정", true],
    ["m3", "이하늘", "ps6", "8/8 (토) 18:00 PT", "앱 확인", false],
    ["m1", "김지은", "ps1", "8/13 (목) PT", "QR 확인", false],
    ["m2", "박서준", "ps4", "8/14 (금) 19:00 PT", "자동확정", true],
    ["m3", "이하늘", "ps6", "8/15 (토) 18:00 PT", "자동확정", true],
  ];
  t1pt.forEach(([mid, name, pid, desc, method, auto], i) => mk("sl" + (i + 1), "t1", mid, name, pid, desc, method, auto, "eligible"));
  mk("sl12", "t1", "m4", "최민아", "ps8", "8/11 (화) 06:30 크로스핏", "자동확정", false, "held");
  // 필라테스 기구 초급 — 실제 수강 회원 6명 로테이션 ×3주. m5(정우람)=할인 24,000원이 정가 회원들과 같은 명세에 섞인다.
  const t2roster = [
    ["m1", "김지은", "ps2"],  // 35,000
    ["m2", "박서준", "ps5"],  // 35,000
    ["m3", "이하늘", "ps7"],  // 30,000
    ["m4", "최민아", "ps8"],  // 30,000
    ["m5", "정우람", "ps9"],  // 24,000 (할인 등록)
    ["m6", "한소라", "ps10"], // 35,000
  ];
  for (let i = 0; i < 18; i++) {
    const [mid, name, pid] = t2roster[i % 6];
    mk("sl" + (13 + i), "t2", mid, name, pid, `8/${3 + Math.floor(i / 3)} 필라테스 기구 초급`, i === 5 ? "자동확정" : "앱 확인", i === 5, "eligible");
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
    const m = { id: "gm" + i, name, phone: "010-9" + s7.slice(0, 3) + "-" + s7.slice(3) };
    M.push(m);
    const roll = rnd(100);
    if (roll < 28) continue; // 28%는 수업권 미보유 (유효 수업권 필터 검증용)
    const npass = roll >= 88 ? 2 : 1;
    for (let k = 0; k < npass; k++) {
      const pr = prods[rnd(prods.length)];
      const expired = rnd(100) < 6; // 일부는 기간 만료 (만료 필터 검증용)
      const expiresAt = pr.validityDays == null ? null : expired ? "2026-08-01" : EXPIRES[rnd(EXPIRES.length)];
      P.push({ id: "gps" + i + "_" + k, memberId: m.id, productId: pr.id, name: pr.name, kind: pr.kind,
        total: pr.sessions, unitPrice: Math.floor(pr.price / pr.sessions), purchasePrice: pr.price, listPrice: pr.price, expiresAt, remaining: 1 + rnd(pr.sessions) });
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
    M.push({ id: mid, name, phone: "010-8000-" + s4, staff: true });
    T.push({ id: "gt" + i, name, subject: SUBJ[rnd(SUBJ.length)], memberId: mid });
    // 일부는 자격 멤버십(pr3) 보유 — «멤버십 자격» 권한 경로가 규모에서도 동작하는지 검증용
    if (i % 11 === 0) P.push({ id: "gtps" + i, memberId: mid, productId: "pr3", name: "필라테스 그룹 20회", kind: "group",
      total: 20, unitPrice: 30000, purchasePrice: 600000, listPrice: 600000, expiresAt: "2026-12-31", remaining: 20 });
  }
  // P2-2b 범위 시드 — 리스트 요약 표기가 다양하게 보이도록 (gt5=멤버십 2개, gt12=개별 회원 5명)
  const TS = window.DB.policy.teacherScope;
  TS.gt5 = { mode: "custom", productIds: ["pr1", "pr2"], memberIds: [] };
  TS.gt12 = { mode: "custom", productIds: [], memberIds: ["gm1", "gm2", "gm3", "gm4", "gm5"] };
})();

// ── v2.18 케이스 시드 (형 지시 08-18: 최대한 여러 케이스 더미 데이터 → QA 검증) ──
// UI가 지원하지만 그동안 시드에 없어 화면으로 확인 불가였던 상태를 전부 노출한다.
// ⚠️ 대규모 LCG 시드(위 2개 IIFE) 뒤에서 실행 — products/members 배열 길이를 앞에서 바꾸면
// 난수 소비가 달라져 3,000명 데이터가 통째로 바뀌므로 반드시 이 위치에 append만 한다.
(function seedCases() {
  const D = window.DB;

  // 상품: 이벤트 할인가(salePrice) — 구매 화면 §2-3 조건부 이벤트 문법(빨간 캡·취소선·원형 배지) 실데이터
  D.products.push({ id: "pr5", name: "PT 30회 (이벤트)", kind: "private", sessions: 30,
    price: 2700000, salePrice: 2400000, validityDays: 180 });

  // 수업권(m1): 이용 정지(frozen) · 횟수 소진(exhausted) — 카드 «예약에 쓸 수 없어요» 상태 2종
  D.passes.push(
    { id: "ps14", memberId: "m1", productId: "pr2", name: "PT 20회", kind: "private", status: "frozen",
      total: 20, unitPrice: 90000, purchasePrice: 1800000, listPrice: 1800000, expiresAt: "2026-12-01", remaining: 19 },
    { id: "ps15", memberId: "m1", productId: "pr4", name: "필라테스 그룹 10회 (무기한)", kind: "group",
      total: 10, unitPrice: 35000, purchasePrice: 350000, listPrice: 350000, expiresAt: null, remaining: 0 },
  );

  // 폐강 수업 — 수업 관리 «폐강» 배지·사유, 회원 예약엔 «폐강으로 취소» 케이스로 연결
  D.classes.push({ id: "c4", title: "저녁 스트레칭 클래스", teacherId: "t2", kind: "group", capacity: 8,
    schedule: "fixed", scheduleLabel: "매주 금 19:00", duration: 50,
    eligibility: "pass", eligibleProductIds: ["pr3", "pr4"], memberIds: [], status: "closed",
    closedReason: "선생님 사정으로 수업 종료", closedAt: "2026-08-13 18:00" });

  // 지난 회차 — 회원(m1) «지난 예약» 상태 전 종류용 (센터 예약현황의 하드코딩 날짜 밖이라 다른 화면 영향 없음)
  D.slots.push(
    { id: "s11", classId: "c1", date: "2026-08-03", time: "10:00", status: "done" },
    { id: "s12", classId: "c1", date: "2026-08-10", time: "10:00", status: "done" },
    { id: "s13", classId: "c2", date: "2026-08-14", time: "11:00", status: "done", adhoc: true },
    { id: "s14", classId: "c2", date: "2026-08-09", time: "11:00", status: "done", adhoc: true },
    { id: "s15", classId: "c1", date: "2026-08-12", time: "10:00", status: "done" },
    { id: "s16", classId: "c1", date: "2026-08-05", time: "10:00", status: "done" },
    { id: "s17", classId: "c4", date: "2026-08-22", time: "19:00", status: "scheduled" },
    { id: "s18", classId: "c3", date: "2026-08-14", time: "06:30", status: "done" },
    { id: "s19", classId: "c3", date: "2026-08-25", time: "06:30", status: "scheduled" }, // 대기 승격(bkB9)용 — 기존 회차 좌석 불변
  );
  const SNAP = { cancelHours: 24, cancelMode: "conditional" };
  D.bookings.push(
    { id: "bkB1", slotId: "s11", memberId: "m1", passId: "ps2", status: "noshow_final", policySnap: SNAP },   // 노쇼 확정 (-1회)
    { id: "bkB2", slotId: "s12", memberId: "m1", passId: "ps2", status: "restored", policySnap: SNAP },      // 이의 인정 · 복원
    { id: "bkB3", slotId: "s13", memberId: "m1", passId: "ps1", status: "confirmed", policySnap: SNAP },     // 수강 완료 (이의기간 내 → «이의» 버튼)
    { id: "bkB4", slotId: "s14", memberId: "m1", passId: "ps1", status: "forfeited", policySnap: SNAP },     // 기한 위반 취소 (-1회)
    { id: "bkB5", slotId: "s15", memberId: "m1", passId: "ps2", status: "canceled", cancelBy: "center", policySnap: SNAP }, // 센터 취소
    { id: "bkB6", slotId: "s16", memberId: "m1", passId: "ps2", status: "canceled", policySnap: SNAP },      // 본인 취소
    { id: "bkB7", slotId: "s17", memberId: "m1", passId: "ps2", status: "class_closed", closeReason: "선생님 사정으로 수업 종료", policySnap: SNAP }, // 폐강으로 취소
    { id: "bkB8", slotId: "s18", memberId: "m1", passId: "ps2", status: "noshow_wait", policySnap: SNAP },   // 노쇼 보고됨 · 이의 가능 (홈 배너·탭 배지)
    { id: "bkB9", slotId: "s19", memberId: "m1", passId: "ps2", status: "booked", promoted: true, policySnap: SNAP }, // 예약 확정 (대기 승격)
  );

  // 조율 요청(m1·PT 1:1): 대기 · 수락 · 거절(사유) · 요청 취소 — 회원 화면에서 4상태 전부
  D.arranges.push(
    { id: "ar5", classId: "c2", memberId: "m1", passId: "ps1", date: "2026-08-20", time: "18:00",
      status: "pending", note: "퇴근 후 저녁 시간 희망해요", at: "2026-08-16 18:20" },
    { id: "ar2", classId: "c2", memberId: "m1", passId: "ps1", date: "2026-08-22", time: "10:00",
      status: "accepted", note: "주말 오전이면 좋아요", at: "2026-08-15 09:10" },
    { id: "ar3", classId: "c2", memberId: "m1", passId: "ps1", date: "2026-08-19", time: "07:00",
      status: "declined", reason: "이른 시간엔 다른 수업이 있어요", at: "2026-08-14 18:40" },
    { id: "ar4", classId: "c2", memberId: "m1", passId: "ps1", date: "2026-08-13", time: "20:00",
      status: "canceled", at: "2026-08-12 21:00" },
  );

  // 보고·수강확인: 노쇼 이의 중재 대기 / 이의 인정 2종(횟수 복원·노쇼 취소) / m1 노쇼 확정·이의기간
  D.reports.push(
    { id: "rp8", slotId: null, bookingId: null, memberId: "m4", member: "최민아", desc: "8/13 (목) 10:00 필라테스 기구 초급",
      teacherId: "t2", date: "2026-08-13", unitPrice: 30000, noshow: true, status: "disputed", method: null,
      disputeReason: "당일 아침에 미리 연락드렸어요", label: "노쇼 이의제기 · 센터 판단 대기",
      at: "8/13 11:00 보고 · 8/14 09:12 이의 접수", deducted: false, lineId: null },
    { id: "rp9", slotId: null, bookingId: null, memberId: "m2", member: "박서준", desc: "8/4 (화) 06:30 새벽 버닝 크로스핏",
      status: "resolved", method: null, label: "이의 인정 · 횟수 복원", at: "8/4 10:12 이의 접수 · 8/5 이의 인정",
      deducted: false, lineId: "sl31" },
    { id: "rp10", slotId: null, bookingId: null, memberId: "m5", member: "정우람", desc: "8/7 (금) 10:00 필라테스 기구 초급",
      teacherId: "t2", date: "2026-08-07", unitPrice: 24000, noshow: true, status: "resolved", method: null,
      label: "이의 인정 · 노쇼 취소", at: "8/7 11:20 보고 · 8/9 이의 인정", deducted: false, lineId: null },
    { id: "rp11", slotId: "s11", bookingId: "bkB1", memberId: "m1", member: "김지은", teacherId: "t2",
      date: "2026-08-03", unitPrice: 35000, noshow: true, status: "noshow_final", method: "자동확정", autoFinal: true,
      label: "노쇼 확정 · 이의 없이 자동확정", at: "8/3 11:02 보고 · 8/10 이의 없이 자동확정", deducted: true, lineId: null },
    { id: "rp12", slotId: "s18", bookingId: "bkB8", memberId: "m1", member: "김지은", teacherId: "t1",
      date: "2026-08-14", unitPrice: 35000, noshow: true, status: "noshow_wait", method: null,
      label: "노쇼 보고 · 이의기간", at: "8/14 07:40 보고", deducted: false, lineId: null },
    // bkB3(수강 완료)의 확인 기록 — 이의기간 내 이의 시 lineId(sl32)로 정산 라인 보류가 걸리는 경로용
    { id: "rp13", slotId: "s13", bookingId: "bkB3", memberId: "m1", member: "김지은",
      status: "confirmed", method: "앱 확인", label: "확인 완료", at: "8/14 12:30 확인", deducted: true, lineId: "sl32" },
  );

  // 정산 라인: 이의 인정으로 무효화된 라인(removed — 집계·화면 전 구간 제외) + bkB3 수강 완료분(eligible)
  D.slines.push(
    { id: "sl31", teacherId: "t1", memberId: "m2", member: "박서준", passId: "ps5", passName: "필라테스 그룹 10회 (무기한)",
      desc: "8/4 (화) 06:30 새벽 버닝 크로스핏", unitPrice: 35000, method: "앱 확인", auto: false, status: "removed", pushed: false, pushId: null },
    { id: "sl32", teacherId: "t1", memberId: "m1", member: "김지은", passId: "ps1", passName: "PT 10회",
      desc: "8/14 (금) 11:00 PT", unitPrice: 100000, method: "앱 확인", auto: false, status: "eligible", pushed: false, pushId: null },
  );

  // 원장(m1): 위 케이스와 잔여 횟수가 맞아떨어지게 — ps1=10-5, ps2=10-3+1, ps15=10-10 (전 회차 기록)
  D.ledger.push(
    { passId: "ps2", delta: -1, reason: "노쇼 확정", detail: "8/3 (월) 필라테스 기구 초급 · 이의 없이 자동확정", at: "2026-08-10 10:00" },
    { passId: "ps2", delta: -1, reason: "수강 확인", detail: "8/10 (월) 필라테스 기구 초급 · 앱 확인", at: "2026-08-10 11:05" },
    { passId: "ps2", delta: +1, reason: "이의 인정 · 복원", detail: "8/10 (월) 필라테스 기구 초급 · 센터 판단", at: "2026-08-12 15:30" },
    { passId: "ps1", delta: -1, reason: "수강 확인", detail: "8/14 (금) PT · 앱 확인", at: "2026-08-14 12:30" },
    { passId: "ps14", delta: +20, reason: "구매", detail: "PT 20회 · 1,800,000원", at: "2026-07-01 10:00" },
    { passId: "ps14", delta: -1, reason: "수강 확인", detail: "7/15 (수) PT · 앱 확인", at: "2026-07-15 12:00" },
    { passId: "ps15", delta: +10, reason: "구매", detail: "필라테스 그룹 10회 · 350,000원", at: "2026-06-01 10:00" },
  );
  // ps15 소진 이력 — 6/3~8/5 주 1회 수강 10회 전부 기록 (마지막 회차에 소진 표기)
  ["06-03", "06-10", "06-17", "06-24", "07-01", "07-08", "07-15", "07-22", "07-29", "08-05"].forEach((d, i) => {
    D.ledger.push({ passId: "ps15", delta: -1, reason: "수강 확인",
      detail: `${Number(d.slice(0, 2))}/${Number(d.slice(3))} 필라테스 · 앱 확인${i === 9 ? " — 마지막 회차, 횟수 소진" : ""}`,
      at: `2026-${d} 11:00` });
  });
})();

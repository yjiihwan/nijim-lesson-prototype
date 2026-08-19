/* 니짐내짐 레슨 관리 프로토타입 — 해시 라우팅 SPA (빌드 불필요)
   v2 (2026-08-17 보완): 감사 결함 35건 + 신규 4건 반영.
   v2.1 (2026-08-17 시정): 선생님 수업 개설·관리(수정·폐강) — 권한=센터 지정 회원 or 자격 멤버십 보유(02 P2-2).
   v2.2 (2026-08-17 형 확정 반영): ① P5-4b 노쇼=보고→통지→무이의 시 자동 확정·차감(이의 건만 센터 중재)
   ② P9-1 노쇼 보상=센터별 설정(없음/지원 — 정상·별도 단가, 샐리 자동 push·수동 체크) — 정산 미리보기 동적 반영.
   v2.3 (2026-08-17): P2-2b 선생님별 «지정 가능 회원 범위» — 전체/멤버십 단위/멤버십 하위 개별 회원 선택,
   수업 만들기 «지정 회원» picker·«바로 확정» 회원 목록에 적용(액션 재검증 포함). 미설정 기본값=전체 회원(02 문서).
   v2.4 (2026-08-17 형 지적): 회원 선택 전 지점을 검색 기반 공통 picker로 교체 — 이름·전화 검색+멤버십 필터+
   점진 로딩(전체 렌더 금지)+선택 칩 요약. 더미 회원 3,000명 규모에서 검증. 칩 전체 나열 UI 제거.
   v2.5 (2026-08-17): P9-1 별도 단가에 «수업료의 %» 방식 추가 — 회당 단가(정상 단가)×n%(0~100), 원 단위
   반올림(Math.round) 일관 적용. 설정 실시간 예시 미리보기. 기존 고정 금액 저장분(customMode 키 없음)=하위 호환.
   v2.7 (2026-08-17 형 지적): 정책 화면 선생님 권한 UI를 수십 명 규모 대응으로 개편 — P2-2 센터 지정
   선생님·자격 멤버십=요약+편집(검색·체크 리스트), P2-2b=검색 리스트(행=이름·직군·설정 요약)→행 탭 시
   상세 화면(#/c/policy/scope/:tid)에서 편집. 기능(전체/범위 지정·멤버십 단위·개별 회원)은 전부 유지.
   더미 선생님 32명 추가(총 34명, 직군 혼합) — 정산 화면은 내역 있는 선생님만 표시.
   v2.9 (2026-08-18 형 지적): 회원별·등록시기별 회당 단가 차이 화면 노출 — ① 센터 정산·내 정산에
   회차별 단가 명세(펼침: 날짜·회원·수업권명·회당 단가·확인 방식, 단가 다르면 그룹 구분) + 샐리 push
   미리보기 모달(회차별 unitPrice 노출 후 전송). ② 센터 수업권 판매·등록 흐름 신설 — 실구매가 입력
   (기본=정가), unitPrice=floor(실구매가÷총횟수) 스냅샷 저장(이후 상품가 변경 소급 없음, 05 문서).
   v2.11 (2026-08-18 형 지시): 회원 «수업 예약» 캘린더+리스트 혼합 개편 — 주간 스트립(주 이동 버튼·
   스와이프, 월 표시·월 시트 이동, 날짜별 예약가능·내예약 점 마커) + 선택 날짜 회차 리스트(시간순,
   잔여 정원·자격 배지·내 예약 상태·바로 예약), 조율 수업 상시 섹션, 빈 날짜 안내(가까운 수업일 이동).
   v2.13 (2026-08-18 형 확정): 수업완료 확인 PIN 전면 폐지 — ① 기본 경로=회원 본인 폰 원탭 확인
   (홈 «수업 확인 요청» 카드+탭바 배지, 확인 권한은 회원 계정에만 귀속·대리 확인 불가) ② 현장
   현장 확인=일회용 QR(해당 수업 1건 전용 토큰·5분 만료·재사용 불가, 프로토는 «회원 폰에서 열기»
   시뮬레이션) ③ 미확인 방치=기존 자동확정·이의 정책 유지(확인 대기/자동확정 안내 표기 정리).
   v2.14 (2026-08-18 형 시정): 회원 «멤버십/수업권» UI를 실서비스 «내 멤버십» 화면과 동일 문법으로
   재작업(끼워넣기 목적) — 카드=시설명+핑크 원형 화살표 배지/프로그램명/멤버십 라벨/큰 잔여 숫자+작은
   단위/회색 보조줄, 여러 장=좌우 페이징 캐러셀(이웃 카드 가장자리 노출, 터치+마우스 드래그), 액션은
   전부 «입장하기» 문법(풀폭 연회색 라운드+아이콘). 전용 화면 #/m/pass(내 멤버십 탭) 신설 —
   카드 캐러셀+수업 예약 버튼+상태 문구+멤버십 상세정보(선택 카드와 동기). 기존 다크 pass-card 폐지.
   v2.17 (2026-08-18 형 시정): 사용자 노출 문구 전수 정비 — ① 내부 스펙 코드(P*-*)·확정일(08-17)·기획서 투
   안내문 UI 전면 제거(주석으로만 유지) ② 개발·법률·한자 개조식 용어 교체(externalId·멱등→«한 번만 반영»,
   미생성·미성립→«수강확인이 안 돼 정산에 포함되지 않아요», 무이의→«이의가 없으면», 소급→«적용되지 않아요»,
   스냅샷→«구매/예약 시점 기준», 인용→«이의 인정») ③ 회원 홈 확인 카드 보조 버튼 «자세히 · 문제가 있어요»→
   «자세히 보기»(이의제기는 상세 화면에서) ④ 데모 전용 장치(회원 폰 열기·이의기간 경과)는 점선 demo-box+
   «프로토타입 데모» 캡션으로 실서비스 UI와 시각 구분. 정책 의미·동작은 무변경(문구만).
   v2.19 (2026-08-18): 센터 정산 화면 «엑셀로 내려받기» — 화면 집계를 그대로 .xlsx로 저장.
   외부 라이브러리 없이 zip(무압축)+시트 XML 직접 생성. 확정·이의 보류(합계 제외)·노쇼 보상 행 +
   마지막 합계 행. 파일명 니짐내짐_정산_<YYYY-MM>.xlsx. 화면 집계 로직(slines 동적 집계)과 동일 계산.
   v2.20 (2026-08-18): 센터 «예약 현황» 월간 캘린더+리스트 혼합 개편 — 회원 예약 캘린더(v2.11)와 같은
   디자인 문법(헤더 ‹월› 이동·월 시트·스와이프·점 마커·선택 날짜 리스트). 날짜 셀=수업 수+상태 점
   (예정·정원 마감·지난 수업), 조율 요청 희망일=주황 표식+선택 시 그 날 요청 함께 표시. 선생님·수업
   필터 칩(캘린더·리스트·조율 섹션 공통 적용). 리스트 항목 구성(시간·수업명·정원 바·상태 버튼)은 유지.
   v2.22 (2026-08-18 형 확정): 선생님발 스케줄 제안 3종 — ① 확정 예약 «일정 변경 제안»(새 시간+사유 →
   회원 수락 시 예약 이동·거절 시 기존 유지) ② «빈 시간 먼저 제안»(선생님이 빈 시간대+회원 지정 → 수락 시
   예약 생성, 자격검증 통과분만) ③ 조율 거절 시 «대안 시간 제안»(사유에 대안 일시를 붙여 회신 → 수락 시
   그 시간으로 예약 확정). 회원 «받은 제안» 인박스(#/m/proposals) 신설 — 선생님 인박스와 같은 구성.
   상태 4종(답변 대기/수락/거절/기한 만료)을 양쪽 인박스에서 동일 규칙(propState 파생)으로 표시.
   v2.23 (2026-08-18 형 확정 1안): 회원 홈 «수업 확인 요청» 카드 스태킹 — 확인 대기 2건까지는 기존
   개별 카드 그대로, 3건부터 «N건» 요약 카드 1장으로 접고 탭 시 목록(#/m/confirms)으로 이동. 목록은
   건별 수업명·일시·선생님+«받았어요» 원탭(확인=차감·정산 증빙이라 일괄 확인 버튼은 두지 않는다).
   확인마다 목록·탭 배지·요약 건수 즉시 갱신, 잔여 2건 이하가 되면 홈은 개별 카드 모드로 자연 복귀.
   검증 시드는 ?case=confirmstack 프리셋(data.js) — 기본 시드·기존 회귀 기대값 불변.
   v2.24 (2026-08-19 감사 1차 수정 8건): U2 다가오는 예약 일시 오름차순(예약+조율 단일 시간축) /
   U3 예약 취소 동선 — 회차 상세에 «예약 취소» 노출 + 홈 예약 행 탭 → 회차 상세 / U14 지난 회차를
   «수업 종료 · 보고 대기»로 분리하고 취소 버튼 제거 / A6 엑셀 내보내기에 화면 필터(월·선생님) 반영 /
   B9 노쇼 보상은 전송된 건이면 전송 시점 금액을 계속 표시 / U10 폐지된 «서명» 용어 제거(수강확인 관리) /
   U11 홈 탭 배지 = 확인 요청 카드와 같은 소스 / U17 로즈 배너 아이콘 교체·U22 캘린더 조율 표식을 셀 안으로.
   v2.25 (2026-08-19 형 확정 5건): ① 일정 변경 제안=1:1 수업 전용 — 그룹은 진입점 미노출 + 액션·수락
   단계에서도 거부, 못 오는 회원은 취소/거절 플로우로 안내 ② 선생님 시간 겹침=경고 후 강행 허용 —
   회차 생성·조율 수락·제안 보내기 시점에 같은 선생님 중첩 시간 검사 → 확인 모달([취소]/[그래도 진행]),
   진행하면 정상 확정되고 겹친 회차는 선생님·센터 화면에 «시간 겹침» 뱃지·배너 ③ 수업권 차감 우선순위=
   만료 임박 순(같으면 먼저 등록한 것) 자동 선택 + 예약 화면 «사용 수업권 (변경)»으로 회원이 직접 교체,
   예약 상세·내 예약·이용 내역에 차감 수업권 상시 표기 ④ 선생님·센터 화면을 회원 화면과 같은 디자인
   시스템(role-t/role-c)으로 통일 — 장식용 이모지 전면 제거·공용 라인 아이콘(IC) 대체, 기능·정보 구조 무변경
   ⑤ 회원 «예약» 탭 최상단 [캘린더 | 내 예약] 세그먼트 — 내 예약=다가올 예약+대기/확인 필요(지난 건은 제외).
   검증 시드 ?case=overlap (겹침 표시용).
   v2.26 (2026-08-19 형 확정): 수업 생성 진입점을 «수업 만들기» 하나로 통합 — 통합 전의 두 버튼
   (바로 확정 / 내 수업 관리)이 사실은 같은 «수업을 만드는» 행위이고 차이는 «회원을 누가 채우냐» 하나뿐이라서다.
   ① 선생님 «오늘»·센터 화면 = [+ 수업 만들기] 단일 진입점(#/t/create·#/c/create)
   ② 폼 = 수업 종류(기존 수업 or ＋새 수업)·날짜·시간 → «회원을 어떻게 채울까요?»
      ○ 회원 지정해서 바로 확정(통합 전 «바로 확정»: 검색 picker·그룹=정원/잔여석까지 복수·1:1=1명·전원 통과 시에만 확정)
      ○ 자리 열어두고 신청 받기(구 수업 개설: 예약 가능 회원 3모드 유지 + 빈 회차 개설 → 회원이 신청)
      모드 전환은 폼 상태(ccUI) 재렌더로 — 초기 렌더부터 모드별 노출(v2.6 회귀 방지). 실패 시 유령 수업 미생성.
   ③ 수정·폐강 = «일정» 탭 하위 뷰 [주간 일정 | 내 수업]으로 흡수(선생님) / 센터는 «수업» 탭 유지
   ④ 구 라우트는 리다이렉트(#/t/quick→#/t/create, #/c/quick→#/c/create, #/t/classes→#/t/schedule «내 수업»)
   ⑤ 통합 전 잔재 용어(«바로 확정»의 옛 이름) 전면 제거 — UI·토스트·안내문·정책 화면·주석. QA v226 57/57.
   구조 원칙: bookings=좌석의 단일 진실(정원·대기는 파생 계산), 정산=slines 라인 동적 집계,
   차감·정산라인·확인은 confirmTx 한 함수(04 원칙2), 취소규정은 예약 시점 스냅샷(02). */
(function () {
  const DB = window.DB;
  const NOW = new Date("2026-08-17T12:00:00+09:00"); // 데모 고정 현재시각
  const $app = document.getElementById("app");

  // ── 헬퍼 ──
  const won = (n) => n.toLocaleString("ko-KR") + "원";
  const DOW = ["일", "월", "화", "수", "목", "금", "토"];
  function dlabel(dateStr) {
    const d = new Date(dateStr + "T00:00:00+09:00");
    return `${d.getMonth() + 1}/${d.getDate()} (${DOW[d.getDay()]})`;
  }
  const cls = (id) => DB.classes.find((c) => c.id === id);
  const slot = (id) => DB.slots.find((s) => s.id === id);
  const teacher = (id) => DB.teachers.find((t) => t.id === id);
  const pass = (id) => DB.passes.find((p) => p.id === id);
  const member = (id) => DB.members.find((m) => m.id === id);
  const memberName = (id) => (member(id) || { name: "회원" }).name;
  const slotDesc = (s) => { const c = cls(s.classId); return `${dlabel(s.date)} ${s.time} · ${c.title}`; };
  const slotAt = (s) => new Date(`${s.date}T${s.time}:00+09:00`);
  const isPast = (s) => slotAt(s) <= NOW;
  function hoursUntil(s) { return (slotAt(s) - NOW) / 3600000; }
  function dday(dateStr) {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr + "T23:59:59+09:00") - NOW) / 86400000);
  }
  function addDays(dateStr, n) {
    // 정오 기준으로 더해 UTC 변환 시 날짜 밀림 방지
    const d = new Date(new Date(dateStr + "T12:00:00+09:00").getTime() + n * 86400000);
    return d.toISOString().slice(0, 10);
  }
  let seq = 100;
  const nid = (p) => p + seq++;
  const nowStamp = "2026-08-17 12:00";

  // ── 좌석·대기 파생 (bookings가 단일 진실) ──
  const SEAT = ["booked", "confirm_wait", "noshow_wait", "confirmed", "disputed"];
  const ACTIVE = ["booked", "waitlisted", "confirm_wait"]; // 중복 예약 판정용
  const seatBk = (slotId) => DB.bookings.filter((b) => b.slotId === slotId && SEAT.includes(b.status));
  const seatCount = (slotId) => seatBk(slotId).length;
  const waitBk = (slotId) => DB.bookings.filter((b) => b.slotId === slotId && b.status === "waitlisted").sort((a, b) => a.pos - b.pos);
  const attendeeNames = (slotId) => seatBk(slotId).map((b) => memberName(b.memberId));
  const myBk = () => DB.bookings.filter((b) => b.memberId === DB.me.member);
  const snapPolicy = () => ({ cancelHours: DB.policy.cancelHours, cancelMode: DB.policy.cancelMode });
  const line = (id) => DB.slines.find((l) => l.id === id);

  // ── 수업권 상태 (M-1: 기간 만료·소진·정지 판정) ──
  function passState(p) {
    if (p.status === "frozen") return "frozen";
    if (p.expiresAt && p.expiresAt < DB.TODAY) return "expired";
    if (p.remaining <= 0) return "exhausted";
    return "active";
  }
  const passUsable = (p) => passState(p) === "active";
  // v2.4: 회원 3,000명 규모 — 매 호출 전체 스캔 대신 memberId 인덱스 (passes는 append만 되므로 길이로 무효화)
  let passIdxLen = -1, passIdx = null;
  function passesOf(mid) {
    if (passIdxLen !== DB.passes.length) {
      passIdx = new Map();
      DB.passes.forEach((p) => { const a = passIdx.get(p.memberId); a ? a.push(p) : passIdx.set(p.memberId, [p]); });
      passIdxLen = DB.passes.length;
    }
    return passIdx.get(mid) || [];
  }

  // ── 시정①: 수업 개설·관리 권한 (02 P2-2) — 센터 지정 회원 or 자격 멤버십 보유 회원 ──
  function classAuth(t) {
    if (!t) return { ok: false };
    const A = DB.policy.classAuth || { memberIds: [], productIds: [] };
    if ((A.memberIds || []).includes(t.memberId)) return { ok: true, via: "센터 지정" };
    const p = passesOf(t.memberId).filter(passUsable).find((x) => (A.productIds || []).includes(x.productId));
    if (p) return { ok: true, via: `멤버십 자격 · ${p.name}` };
    return { ok: false };
  }

  // ── v2.3 (P2-2b): 선생님별 «지정 가능 회원 범위» ──
  // 범위 = productIds(멤버십 단위: 유효 수업권 보유 회원 전체) ∪ memberIds(멤버십 하위 개별 선택).
  // 미설정·mode:"all" = 전체 회원 (기본값 — v2.2까지의 동작과 동일, 02 문서).
  function tScope(tid) {
    const S = (DB.policy.teacherScope || {})[tid];
    return S && S.mode === "custom" ? S : { mode: "all", productIds: [], memberIds: [] };
  }
  function inTScope(tid, mid) {
    const S = tScope(tid);
    if (S.mode === "all") return true;
    if ((S.memberIds || []).includes(mid)) return true;
    return passesOf(mid).filter(passUsable).some((p) => (S.productIds || []).includes(p.productId));
  }
  const tScopeMembers = (tid) => DB.members.filter((m) => !m.staff && inTScope(tid, m.id));
  const holdersOf = (pid) => DB.members.filter((m) => !m.staff && passesOf(m.id).filter(passUsable).some((p) => p.productId === pid));
  function tScopeLabel(tid) {
    const S = tScope(tid);
    if (S.mode === "all") return "전체 회원";
    const parts = (S.productIds || []).map((pid) => (DB.products.find((p) => p.id === pid) || { name: pid }).name + " 전체");
    if ((S.memberIds || []).length) parts.push(`개별 ${S.memberIds.length.toLocaleString("ko-KR")}명`);
    return parts.length ? `${parts.join(" + ")} · 총 ${tScopeMembers(tid).length.toLocaleString("ko-KR")}명` : "빈 범위 — 지정 가능 회원 없음";
  }
  // v2.7: P2-2b 리스트 행 요약 — 상세 나열 대신 개수 요약 (수십 명 규모 리스트용)
  function tScopeShort(tid) {
    const S = tScope(tid);
    if (S.mode === "all") return "전체 회원";
    const np = (S.productIds || []).length, nm = (S.memberIds || []).length;
    const parts = [];
    if (np) parts.push(`멤버십 ${np}개`);
    if (nm) parts.push(`회원 ${nm.toLocaleString("ko-KR")}명`);
    return parts.length ? `범위 지정 · ${parts.join(" · ")} · 총 ${tScopeMembers(tid).length.toLocaleString("ko-KR")}명` : "범위 지정 · 빈 범위 — 지정 가능 회원 없음";
  }

  // ── 예약 자격 (M-3: eligibility 실검증) ──
  // v2.25 ③ (형 확정): 차감 우선순위 = 만료가 가장 임박한 수업권부터. 만료일이 같으면 먼저 등록된 것.
  // 기간 제한 없는 수업권(expiresAt=null)은 만료가 없으니 항상 뒤로 — 기한 있는 권을 먼저 소진시키는 게 회원에게 유리.
  const passSeq = (p) => DB.passes.indexOf(p);
  function byExpiry(list) {
    return list.slice().sort((a, b) => {
      if (a.expiresAt && b.expiresAt) { if (a.expiresAt !== b.expiresAt) return a.expiresAt < b.expiresAt ? -1 : 1; }
      else if (a.expiresAt) return -1;
      else if (b.expiresAt) return 1;
      return passSeq(a) - passSeq(b);
    });
  }
  // 이 수업에 쓸 수 있는 수업권 전체 — [0]=자동 선택되는 기본 수업권(만료 임박 순)
  function eligiblePasses(c, mid) {
    const mine = passesOf(mid).filter(passUsable);
    const byProduct = byExpiry(mine.filter((p) => (c.eligibleProductIds || []).includes(p.productId)));
    const byKind = byExpiry(mine.filter((p) => p.kind === c.kind && !byProduct.includes(p)));
    const listed = (c.memberIds || []).includes(mid);
    if (c.eligibility === "list") return listed ? byProduct.concat(byKind) : [];
    if (c.eligibility === "pass") return byProduct;
    // both(혼합): 지정 회원이거나 자격 수업권 보유
    return listed ? byProduct.concat(byKind) : byProduct;
  }
  const eligiblePass = (c, mid) => eligiblePasses(c, mid)[0] || null;

  // ── v2.25 ② 선생님 시간 겹침 (형 확정 B: 경고 후 강행 허용) ──
  // 같은 선생님의 [시작, 시작+수업시간) 구간이 겹치는 다른 회차. 차단하지 않고 확인 모달만 띄운다.
  const slotEndAt = (s) => new Date(slotAt(s).getTime() + ((cls(s.classId) || {}).duration || 50) * 60000);
  function overlapSlots(teacherId, date, time, duration, excludeIds) {
    const st = new Date(`${date}T${time}:00+09:00`), en = new Date(st.getTime() + (duration || 50) * 60000);
    const skip = excludeIds || [];
    return DB.slots.filter((s) => {
      if (s.status === "canceled" || skip.includes(s.id) || s.date !== date) return false;
      const c = cls(s.classId);
      if (!c || c.status === "closed" || c.teacherId !== teacherId) return false;
      return slotAt(s) < en && slotEndAt(s) > st;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }
  const slotOverlaps = (s) => { const c = cls(s.classId); return c ? overlapSlots(c.teacherId, s.date, s.time, c.duration, [s.id]) : []; };
  const overlapBadge = (s) => (slotOverlaps(s).length ? `<span class="badge b-danger">시간 겹침</span>` : "");
  // 겹침 확인 모달 — [취소] / [그래도 진행]. 진행을 누르면 보류해 둔 동작을 그대로 실행한다.
  let overlapPending = null;
  function overlapAsk(hits, onProceed) {
    overlapPending = onProceed;
    const lines = hits.map((s) => {
      const c = cls(s.classId);
      const who = attendeeNames(s.id);
      return `이미 <b>${s.time}</b>에 <b>${who.length ? `${who.join(", ")} 회원` : "예약자 없는"}</b> 수업(${c.title} · ${c.duration}분)이 있어요.`;
    }).join("<br>");
    modal(`<h3>선생님 시간이 겹쳐요</h3><p>${lines}<br>그래도 진행할까요?</p>
      <p class="muted small mt8">진행하면 두 회차 모두 선생님·센터 화면에 «시간 겹침»으로 표시돼요.</p>
      <div class="btn-row"><button class="btn ghost" onclick="App.overlapCancel()">취소</button>
      <button class="btn primary" onclick="App.overlapGo()">그래도 진행</button></div>`);
  }

  // ── v2.25 ① 일정 변경 제안 = 1:1(개인) 수업 전용 (형 확정 A) ──
  // 그룹수업은 진입점을 숨기는 데 그치지 않고 상태 로직에서도 거부한다 — 못 오는 회원은 취소/거절 플로우로.
  const isPrivateClass = (c) => !!c && (c.kind === "private" || c.capacity === 1);
  const CHANGE_GROUP_MSG = "그룹수업은 일정 변경 제안을 보낼 수 없어요. 못 오는 회원은 예약 취소(회원) 또는 센터 취소로 처리해 주세요.";
  function bookGuard(c, mid) {
    if (c.status === "closed") return { ok: false, msg: "폐강된 수업이에요." };
    if (c.eligibility === "list" && !(c.memberIds || []).includes(mid))
      return { ok: false, msg: "지정 회원만 예약할 수 있는 수업이에요. 센터에 문의해 주세요." };
    const p = eligiblePass(c, mid);
    if (!p) return { ok: false, msg: "이 수업에 쓸 수 있는 수업권이 없어요. (만료·소진 수업권은 쓸 수 없어요)" };
    return { ok: true, pass: p };
  }
  function eligLabel(c) {
    if (c.eligibility === "list") return `지정 회원만 (${(c.memberIds || []).length}명)`;
    if (c.eligibility === "both") return `수업권 + 지정 ${(c.memberIds || []).length}명`;
    return "수업권 보유자";
  }

  // ── v2.25 ③ 예약 화면 «사용 수업권 (변경)» — 기본=만료 임박 순 자동, 회원이 직접 다른 권으로 교체 ──
  // key: "s:<slotId>"(회차 예약) | "c:<classId>"(조율 요청). 선택은 화면 이탈 시 초기화 → 다시 기본값.
  let bookPass = {};
  const passCtxClass = (key) => (key.slice(0, 2) === "s:" ? cls((slot(key.slice(2)) || {}).classId) : cls(key.slice(2)));
  function chosenPass(key, list) {
    const pid = bookPass[key];
    return (pid && list.find((p) => p.id === pid)) || list[0] || null;
  }
  const passLine = (p) => `잔여 ${p.remaining}회 · ${p.expiresAt ? `${p.expiresAt.replaceAll("-", ".")}까지` : "기간 제한 없음"}`;
  // 예약 전 화면: 자동 선택된 수업권 + «변경». 예약 뒤에는 실제 차감될 수업권을 고정 표기(분쟁 방지).
  function passPickRow(key, sel, count) {
    return `<div class="pass-pick">
      <div class="pp-head"><span class="muted">사용 수업권</span>
        <button class="btn sm ghost pass-chg" onclick="App.passPick('${key}')">변경</button></div>
      <b class="pp-name">${sel.name}</b>
      <div class="muted small">${passLine(sel)} · 회당 ${won(sel.unitPrice)}</div>
      ${count > 1 ? `<div class="muted small mt4">쓸 수 있는 수업권이 ${count}장이에요 — 기본은 <b>만료가 임박한 것</b>부터 써요.</div>`
        : `<div class="muted small mt4">지금 이 수업에 쓸 수 있는 수업권은 1장이에요.</div>`}</div>`;
  }

  // ── 원장·확정 트랜잭션 ──
  function pushLedger(passId, delta, reason, detail) {
    DB.ledger.push({ passId, delta, reason, detail, at: nowStamp });
  }
  // 04 원칙2: 확인 성립 = 차감 + 정산라인 + 상태전환이 한 단위. S-6: 잔여>0 가드.
  function confirmTx(b, r, method) {
    const p = b && b.passId ? pass(b.passId) : null;
    if (!p) return { ok: false, msg: "연결된 수업권이 없어요. 센터에서 수업권 연결 후 처리할 수 있어요." };
    if (p.remaining <= 0) return { ok: false, msg: "잔여 횟수가 0회라 차감할 수 없어요. 센터에서 수업권 연장·추가 결제 후 처리하는 예외 절차로 넘어가요." };
    const s = slot(b.slotId); const c = cls(s.classId);
    p.remaining -= 1;
    pushLedger(p.id, -1, "수강 확인", `${slotDesc(s)} · ${method}`);
    const l = { id: nid("sl"), teacherId: c.teacherId, memberId: b.memberId, member: memberName(b.memberId), passId: p.id, passName: p.name, desc: slotDesc(s), unitPrice: p.unitPrice, method, auto: method === "자동확정", status: "eligible", pushed: false, pushId: null };
    DB.slines.push(l);
    b.status = "confirmed";
    if (r) { r.status = method === "자동확정" ? "auto" : "confirmed"; r.method = method; r.label = "확인 완료"; r.deducted = true; r.lineId = l.id; }
    return { ok: true };
  }
  function passForReport(r, b) {
    if (b && b.passId) return pass(b.passId);
    const mine = passesOf(r.memberId);
    return mine[0] || null;
  }

  // ── 노쇼 (형 확정 2026-08-17 · 02 P5-4b/P9-1) ──
  // 판정: 선생님 보고 → 회원 즉시 통지 → 이의기간 내 무이의 시 자동 확정·차감. 이의 건만 센터 중재.
  const noshowDeadline = (r) => addDays(r.date || (r.slotId ? slot(r.slotId).date : DB.TODAY), DB.policy.disputeDays);
  const noshowTeacher = (r) => r.teacherId || (r.slotId ? cls(slot(r.slotId).classId).teacherId : null);
  const noshowFinals = (tid) => DB.reports.filter((r) => r.status === "noshow_final" && noshowTeacher(r) === tid);
  // 보상 단가는 현재 정책으로 동적 계산 — 옵션 전환이 정산 미리보기에 즉시 반영
  // percent 모드: 해당 노쇼 회차의 수업권 회당 단가(정상 단가) × n% — 원 단위 반올림(Math.round) 일관 적용.
  // noshowRewardCustomMode 키 없음=amount (구버전 저장분 하위 호환).
  const pctAmount = (unit, pct) => Math.round(((unit || 0) * pct) / 100);
  const noshowUnit = (r) => {
    if (DB.policy.noshowRewardPrice !== "custom") return r.unitPrice || 0;
    if ((DB.policy.noshowRewardCustomMode || "amount") === "percent") return pctAmount(r.unitPrice, DB.policy.noshowRewardPercent || 0);
    return DB.policy.noshowRewardCustom;
  };
  // v2.24 B9: 표시·집계용 금액 — 샐리로 보낸 건은 전송 시점 스냅샷(rewardAmount)을 그대로 쓴다.
  // 미전송 건만 현재 정책으로 동적 계산(옵션 전환 즉시 반영이라는 원래 의도 유지).
  const noshowAmt = (r) => (r.rewardPushed && r.rewardAmount != null ? r.rewardAmount : noshowUnit(r));
  // 정산·설정 화면 공통 라벨 — 별도 단가의 두 방식(고정 금액/%)을 한 곳에서 표기
  const customPriceLabel = () => ((DB.policy.noshowRewardCustomMode || "amount") === "percent"
    ? `수업료의 ${DB.policy.noshowRewardPercent || 0}%`
    : `별도 단가 ${won(DB.policy.noshowRewardCustom)}`);
  // % 설정 실시간 예시 — 예시 단가 5만원 + 실제 시드 단가 반영
  const clampPct = (v) => Math.min(100, Math.max(0, parseInt(v, 10) || 0));
  const pctPreviewText = (pct) => {
    const p = clampPct(pct);
    return `예시: <b>${p}%</b> → 회당 단가 50,000원이면 <b>${won(pctAmount(50000, p))}</b> · 35,000원이면 <b>${won(pctAmount(35000, p))}</b> (원 단위 반올림)`;
  };
  const rewardOn = () => DB.policy.noshowReward === "support";
  function finalizeNoshow(r, mode) { // mode: "auto"(무이의 자동확정) | "reject"(이의 기각)
    const b = r.bookingId ? DB.bookings.find((x) => x.id === r.bookingId) : null;
    const p = passForReport(r, b);
    if (!p || p.remaining <= 0) return { ok: false, msg: "잔여 0회라 차감할 수 없어요 — 센터 예외처리로 넘어가요." };
    p.remaining -= 1;
    pushLedger(p.id, -1, mode === "auto" ? "노쇼 차감 (이의 없이 자동확정)" : "노쇼 차감 (이의 기각)", r.slotId ? slotDesc(slot(r.slotId)) : r.desc || "");
    r.status = "noshow_final"; r.deducted = true;
    if (mode === "auto") { r.autoFinal = true; r.method = "자동확정"; r.label = "노쇼 확정 · 이의 없이 자동확정"; }
    else { r.autoFinal = false; r.method = "센터 기각 확정"; r.label = "노쇼 확정 · 이의 기각"; }
    if (b) b.status = "noshow_final";
    return { ok: true };
  }

  // M-10: 대기 자동 승격 (P4-4)
  function promoteWaitlist(slotId) {
    if (DB.policy.waitlistPromote !== "auto") return;
    const s = slot(slotId);
    if (!s || s.status !== "scheduled") return;
    const c = cls(s.classId);
    while (seatCount(slotId) < c.capacity) {
      const q = waitBk(slotId);
      if (!q.length) break;
      const first = q[0];
      first.status = "booked";
      first.promoted = true;
      delete first.pos;
      q.slice(1).forEach((b) => (b.pos -= 1));
      if (first.memberId === DB.me.member) toast("대기하던 수업에 자리가 나서 예약이 확정됐어요! 🎉 알림을 보냈어요.");
    }
  }
  // 하-5: 조율·«수업 만들기»로 만든 회차가 비면 정리 (유령 슬롯 방지)
  function cleanupSlot(s) {
    if (s && s.adhoc && s.status === "scheduled" && seatCount(s.id) === 0 && waitBk(s.id).length === 0) s.status = "canceled";
  }

  // ── 모션 유틸 (Apple 스프링: damping ratio + response, 인터럽터블) ──
  const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)");
  function spring(opts) {
    const ratio = opts.damping == null ? 1 : opts.damping;
    const w0 = (2 * Math.PI) / (opts.response || 0.35);
    let x = opts.from, v = opts.velocity || 0;
    const target = opts.to;
    let raf, last = performance.now(), stopped = false;
    function frame(now) {
      if (stopped) return;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      v += (-w0 * w0 * (x - target) - 2 * ratio * w0 * v) * dt;
      x += v * dt;
      if (Math.abs(x - target) < 0.5 && Math.abs(v) < 20) {
        stopped = true; x = target; opts.onUpdate(x);
        opts.onDone && opts.onDone();
        return;
      }
      opts.onUpdate(x);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return {
      stop() { stopped = true; cancelAnimationFrame(raf); },
      get value() { return x; },
      get velocity() { return v; },
    };
  }
  const project = (v, rate = 0.998) => ((v / 1000) * rate) / (1 - rate);
  const rubberband = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * over);

  // ── 토스트 · 모달(바텀 시트) ──
  let toastTimer = null;
  function toast(msg) {
    document.querySelectorAll(".toast").forEach((el) => el.remove());
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.querySelector(".shell").appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 240);
    }, 2600);
  }
  let sheetCtl = null;
  function modal(html) {
    closeModal(true);
    const wrap = document.createElement("div");
    wrap.className = "modal-wrap";
    wrap.innerHTML = `<div class="modal-dim"></div><div class="modal" role="dialog" aria-modal="true"><div class="grabber" aria-hidden="true"></div>${html}</div>`;
    document.querySelector(".shell").appendChild(wrap);
    const sheet = wrap.querySelector(".modal");
    const dim = wrap.querySelector(".modal-dim");
    dim.addEventListener("click", () => closeModal());
    const H = sheet.getBoundingClientRect().height + 100;
    const ctl = { wrap, sheet, dim, H, y: H, anim: null };
    ctl.set = (y) => {
      ctl.y = y;
      const vis = y < 0 ? -rubberband(-y, H) : y;
      sheet.style.transform = `translateY(${vis}px)`;
      dim.style.opacity = Math.max(0, Math.min(1, 1 - y / H));
    };
    sheetCtl = ctl;
    if (REDUCE.matches) {
      ctl.set(0);
      wrap.style.opacity = "0";
      requestAnimationFrame(() => { wrap.style.transition = "opacity .2s ease"; wrap.style.opacity = "1"; });
    } else {
      ctl.set(H);
      ctl.anim = spring({ from: H, to: 0, damping: 0.85, response: 0.36, onUpdate: ctl.set, onDone: () => (ctl.anim = null) });
    }
    attachSheetDrag(ctl);
  }
  function attachSheetDrag(ctl) {
    let drag = null;
    ctl.sheet.addEventListener("pointerdown", (e) => {
      if (e.target.closest("input, textarea, select, button, a, .pd-list")) return; // .pd-list=push 미리보기 스크롤 영역 (v2.9)
      if (ctl.anim) { ctl.anim.stop(); ctl.anim = null; }
      drag = { startY: e.clientY, baseY: ctl.y, moved: false, hist: [[performance.now(), ctl.y]] };
      ctl.sheet.setPointerCapture(e.pointerId);
    });
    ctl.sheet.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.abs(dy) < 8) return;
      drag.moved = true;
      ctl.set(drag.baseY + dy);
      const now = performance.now();
      drag.hist.push([now, ctl.y]);
      while (drag.hist.length > 2 && now - drag.hist[0][0] > 100) drag.hist.shift();
    });
    const release = () => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) return;
      const [t0, y0] = d.hist[0], [t1, y1] = d.hist[d.hist.length - 1];
      const v = t1 > t0 ? ((y1 - y0) / (t1 - t0)) * 1000 : 0;
      if (ctl.y + project(v) > ctl.H * 0.42 && ctl.y > 0) {
        sheetCtl = null;
        if (REDUCE.matches) { ctl.wrap.remove(); return; }
        ctl.anim = spring({ from: ctl.y, to: ctl.H, velocity: v, damping: 1, response: 0.28, onUpdate: ctl.set, onDone: () => ctl.wrap.remove() });
      } else {
        if (REDUCE.matches) { ctl.set(0); return; }
        ctl.anim = spring({ from: ctl.y, to: 0, velocity: v, damping: Math.abs(v) > 40 ? 0.8 : 1, response: 0.34, onUpdate: ctl.set, onDone: () => (ctl.anim = null) });
      }
    };
    ctl.sheet.addEventListener("pointerup", release);
    ctl.sheet.addEventListener("pointercancel", release);
  }
  function closeModal(instant) {
    const ctl = sheetCtl;
    sheetCtl = null;
    document.querySelectorAll(".modal-wrap").forEach((el) => { if (!ctl || el !== ctl.wrap) el.remove(); });
    if (!ctl) return;
    ctl.anim && ctl.anim.stop();
    if (instant) { ctl.wrap.remove(); return; }
    if (REDUCE.matches) {
      ctl.wrap.style.transition = "opacity .18s ease";
      ctl.wrap.style.opacity = "0";
      setTimeout(() => ctl.wrap.remove(), 180);
      return;
    }
    spring({ from: ctl.y, to: ctl.H, damping: 1, response: 0.3, onUpdate: ctl.set, onDone: () => ctl.wrap.remove() });
  }

  // ── 상태 라벨 (M-7: 라벨은 상태에서 파생 — 화면 간 비동기 원천 차단) ──
  function bkBadge(b) {
    const map = {
      booked: [b.promoted ? "예약 확정 (대기 승격)" : "예약 확정", "b-green"],
      waitlisted: [`대기 ${b.pos}번`, "b-warn"],
      confirm_wait: ["수강 확인 대기", "b-rose"],
      noshow_wait: ["노쇼 보고됨 · 이의 가능", "b-warn"],
      confirmed: ["수강 완료", "b-blue"],
      disputed: ["이의제기 중", "b-warn"],
      canceled: [b.cancelBy === "center" ? "센터 취소" : "취소됨", "b-gray"],
      forfeited: ["기한 위반 취소 (-1회)", "b-danger"],
      class_closed: ["폐강으로 취소", "b-gray"],
      restored: ["이의 인정 · 복원", "b-gray"],
      noshow_final: ["노쇼 확정 (-1회)", "b-danger"],
    };
    const [label, badge] = map[b.status] || [b.status, "b-gray"];
    return { label, badge };
  }
  const RP_BADGE = { pending: "b-rose", confirmed: "b-green", auto: "b-warn", disputed: "b-danger", resolved: "b-gray", noshow_wait: "b-warn", noshow_final: "b-danger" };
  // M-8: 확정 후 이의제기 가능 기간 (P7-4)
  function disputeOpen(b) {
    if (["confirm_wait", "noshow_wait"].includes(b.status)) return true;
    if (b.status !== "confirmed") return false;
    const s = slot(b.slotId);
    return s && addDays(s.date, DB.policy.disputeDays) >= DB.TODAY;
  }

  // ── v2.22: 선생님발 제안 (①일정 변경 ②빈 시간 새 수업 ③조율 거절 대안) — arranges(회원발)와 대칭 ──
  // 상태는 저장값(pending/accepted/declined/canceled) + 파생(만료: pending인데 제안 일시 경과) — 양쪽 인박스 공통.
  const propAt = (p) => new Date(`${p.date}T${p.time}:00+09:00`);
  const propState = (p) => (p.status === "pending" && propAt(p) <= NOW ? "expired" : p.status);
  const PROP_KIND = { change: ["일정 변경 제안", "b-rose"], slot: ["새 수업 제안", "b-blue"], alt: ["대안 시간 제안", "b-warn"] };
  const PROP_ST = { pending: ["답변 대기", "b-warn"], accepted: ["수락 · 예약 확정", "b-green"], declined: ["거절됨", "b-gray"], canceled: ["철회함", "b-gray"], expired: ["기한 만료", "b-gray"] };
  const myProps = () => DB.proposals.filter((p) => p.memberId === DB.me.member);
  const myPendingProps = () => myProps().filter((p) => propState(p) === "pending");
  const tSentProps = () => DB.proposals.filter((p) => p.teacherId === DB.me.teacher);
  const pendingChangeFor = (bkId) => DB.proposals.some((p) => p.bookingId === bkId && p.kind === "change" && propState(p) === "pending");
  // 인박스 공통 아이템 — side: "m"(회원 받은 제안) | "t"(선생님 보낸 제안). 구성·스타일=조율 인박스(tl-item)와 통일.
  function propItemHtml(p, side) {
    const c = cls(p.classId);
    const st = propState(p);
    const [kl, kb] = PROP_KIND[p.kind];
    const [sl, sb] = PROP_ST[st];
    const who = side === "m" ? `${teacher(p.teacherId).name} 선생님` : `${memberName(p.memberId)} 회원`;
    const arr = p.arrangeId ? DB.arranges.find((a) => a.id === p.arrangeId) : null;
    return `<div class="tl-item"><span class="grow"><b>${who}</b> · ${c ? c.title : ""} <span class="badge ${kb}">${kl}</span>
      <div class="pp-shift">${p.kind === "change" ? `<span class="old">${p.origDesc || "기존 일정"}</span><span class="arw">→</span>`
        : arr ? `<span class="old">희망 ${dlabel(arr.date)} ${arr.time}</span><span class="arw">→</span>` : ""}<span class="new">${dlabel(p.date)} ${p.time}</span></div>
      ${p.note ? `<div class="muted small mt4">"${p.note}"</div>` : ""}
      <div class="muted small">${p.at} 제안</div>
      ${st === "pending" && side === "m" ? `<div class="btn-row">
        <button class="btn sm primary" onclick="App.propAccept('${p.id}')">수락${p.kind === "change" ? " (예약 변경)" : " (예약 확정)"}</button>
        <button class="btn sm ghost" onclick="App.propDeclineAsk('${p.id}')">거절${p.kind === "change" ? " (기존 유지)" : ""}</button></div>`
      : st === "pending" ? `<div class="mt4"><span class="badge ${sb}">회원 ${sl}</span></div>
        <div class="btn-row"><button class="btn sm ghost" onclick="App.propCancel('${p.id}')">제안 철회</button></div>`
      : `<div class="mt4"><span class="badge ${sb}">${sl}</span>${st === "declined" && p.declineReason ? ` <span class="muted small">사유: ${p.declineReason}</span>` : ""}${st === "expired" ? ` <span class="muted small">제안한 시간이 지나 자동 만료됐어요</span>` : ""}</div>`}
    </span></div>`;
  }

  // ── v2.25 ④ 공통 라인 아이콘 (형 확정 A: 선생님·센터 화면을 회원 화면과 같은 디자인 시스템으로) ──
  // 장식용 이모지를 전부 대체 — stroke=currentColor라 배너·탭·버튼의 색을 그대로 따라간다.
  const svgIc = (d, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra || ""}</svg>`;
  const IC = {
    home: svgIc(`<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.5V20a.8.8 0 0 0 .8.8h11.4a.8.8 0 0 0 .8-.8V9.5"/><path d="M9.8 20.5v-5.6a.8.8 0 0 1 .8-.8h2.8a.8.8 0 0 1 .8.8v5.6"/>`),
    cal: svgIc(`<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 2.8v4M16 2.8v4"/>`),
    calCheck: svgIc(`<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 2.8v4M16 2.8v4"/><path d="m9.5 15.5 2 2 3.5-3.8"/>`),
    today: svgIc(`<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 2.8v4M16 2.8v4"/><circle cx="12" cy="15.5" r="2.1"/>`),
    mail: svgIc(`<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.8 7.2 7.3 5.3a1.5 1.5 0 0 0 1.8 0l7.3-5.3"/>`),
    clip: svgIc(`<path d="M9 4.5h6M8.5 3h7a1 1 0 0 1 1 1v1.5h1.8a1.7 1.7 0 0 1 1.7 1.7V19a1.7 1.7 0 0 1-1.7 1.7H5.7A1.7 1.7 0 0 1 4 19V7.2a1.7 1.7 0 0 1 1.7-1.7h1.8V4a1 1 0 0 1 1-1Z"/><path d="m9 13.4 2 2 4-4.4"/>`),
    alert: svgIc(`<path d="M12 4.2 2.9 19.3h18.2Z"/><path d="M12 10v4"/><circle cx="12" cy="16.9" r=".9" fill="currentColor" stroke="none"/>`),
    info: svgIc(`<circle cx="12" cy="12" r="8.7"/><path d="M12 11.2v5.1"/><circle cx="12" cy="8.1" r=".95" fill="currentColor" stroke="none"/>`),
    ban: svgIc(`<circle cx="12" cy="12" r="8.7"/><path d="m6.2 6.2 11.6 11.6"/>`),
    bell: svgIc(`<path d="M18 9.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z"/><path d="M13.7 19.4a2 2 0 0 1-3.4 0"/>`),
    lock: svgIc(`<rect x="4.5" y="10.5" width="15" height="10" rx="2.3"/><path d="M8 10.5V7.7a4 4 0 0 1 8 0v2.8"/>`),
    unlock: svgIc(`<rect x="4.5" y="10.5" width="15" height="10" rx="2.3"/><path d="M8 10.5V7.7a4 4 0 0 1 7.6-1.8"/>`),
    clock: svgIc(`<circle cx="12" cy="12" r="8.7"/><path d="M12 6.9V12l3.3 2"/>`),
    bolt: svgIc(`<path d="M13.2 2.8 4.8 13.4h6L10.8 21.2l8.4-10.6h-6Z"/>`),
    users: svgIc(`<circle cx="9.2" cy="8.4" r="3.5"/><path d="M2.9 19.8a6.4 6.4 0 0 1 12.6 0"/><path d="M16.3 5.3a3.5 3.5 0 0 1 0 6.6M17.6 14.4a6.4 6.4 0 0 1 3.6 5.4"/>`),
    won: svgIc(`<circle cx="12" cy="12" r="8.7"/><path d="M7.6 9.1 9.5 15l2.5-4.6 2.5 4.6 1.9-5.9M7 11.4h10"/>`),
    ticket: svgIc(`<path d="M3.5 9V7a1.5 1.5 0 0 1 1.5-1.5h14A1.5 1.5 0 0 1 20.5 7v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16v-2a2.5 2.5 0 0 0 0-5Z"/><path d="M14 6v2.4M14 11v2M14 15.6V18" stroke-dasharray="0.1 3.2"/>`),
    receipt: svgIc(`<path d="M5.5 3.5h13V20.6l-2.2-1.4-2.2 1.4-2.1-1.4-2.1 1.4-2.2-1.4-2.2 1.4Z"/><path d="M9 8.2h6M9 11.8h6M9 15.4h3.6"/>`),
    gear: svgIc(`<circle cx="12" cy="12" r="3.1"/><path d="M19.6 14.2a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-2.6 1.1v.2a1.8 1.8 0 1 1-3.6 0v-.1a1.5 1.5 0 0 0-2.6-1.1l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0-1.1-2.6h-.2a1.8 1.8 0 1 1 0-3.6h.1a1.5 1.5 0 0 0 1.1-2.6l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.5 1.5 0 0 0 2.6-1.1v-.2a1.8 1.8 0 1 1 3.6 0v.1a1.5 1.5 0 0 0 2.6 1.1l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0 1.1 2.6h.2a1.8 1.8 0 1 1 0 3.6h-.1a1.5 1.5 0 0 0-1.4.9Z"/>`),
    down: svgIc(`<path d="M12 3.8v11.4M7.4 10.9 12 15.5l4.6-4.6"/><path d="M4.5 18.4v.9a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-.9"/>`),
    link: svgIc(`<path d="M10 13.6a3.8 3.8 0 0 0 5.7.4l2.6-2.6a3.8 3.8 0 0 0-5.4-5.4l-1.5 1.5"/><path d="M14 10.4a3.8 3.8 0 0 0-5.7-.4l-2.6 2.6a3.8 3.8 0 0 0 5.4 5.4l1.5-1.5"/>`),
    pause: svgIc(`<rect x="6.5" y="4.5" width="4" height="15" rx="1.4"/><rect x="13.5" y="4.5" width="4" height="15" rx="1.4"/>`),
    gift: svgIc(`<rect x="3.4" y="8.6" width="17.2" height="4.2" rx="1.2"/><path d="M4.8 12.8v6.4a1.4 1.4 0 0 0 1.4 1.4h11.6a1.4 1.4 0 0 0 1.4-1.4v-6.4M12 8.6v12"/><path d="M12 8.6S10.8 3.4 8.3 3.4a2.3 2.3 0 0 0 0 5.2Zm0 0s1.2-5.2 3.7-5.2a2.3 2.3 0 0 1 0 5.2Z"/>`),
    phone: svgIc(`<rect x="6.5" y="2.6" width="11" height="18.8" rx="2.6"/><path d="M10.6 18.6h2.8"/>`),
    fwd: svgIc(`<path d="M4 6.2 11 12l-7 5.8Z"/><path d="M12.8 6.2 19.8 12l-7 5.8Z"/>`),
    empty: svgIc(`<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 2.8v4M16 2.8v4"/><path d="M9.4 15.4h5.2"/>`),
  };
  IC.plus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;
  const icb = (k) => `<span class="ic">${IC[k]}</span>`;      // 배너 앞 아이콘
  const ici = (k) => `<span class="ic-inline">${IC[k]}</span>`; // 버튼·문장 안 아이콘

  // ── 셸 렌더 ──
  const ROLE_LABEL = { m: "회원", t: "선생님", c: "센터" };
  const TABS = {
    m: [["#/m/home", "홈"], ["#/m/book", "예약"], ["#/m/pass", "멤버십"], ["#/m/history", "내역"]],
    t: [["#/t/home", "오늘"], ["#/t/schedule", "일정"], ["#/t/inbox", "요청"], ["#/t/report", "보고"], ["#/t/earnings", "정산"]],
    c: [["#/c/home", "홈"], ["#/c/classes", "수업"], ["#/c/bookings", "예약"], ["#/c/settlement", "정산"], ["#/c/policy", "설정"]],
  };
  // v2.10: 회원 탭 라인 아이콘 → v2.25 ④ 선생님·센터 탭도 같은 아이콘 체계로 통일(라벨 기준 공용 맵)
  const TAB_SVG = {
    "홈": IC.home, "예약": IC.calCheck, "멤버십": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.8" y="5.5" width="18.4" height="13.5" rx="2.5"/><path d="M2.8 9.8h18.4M6.2 15h4.5"/></svg>`,
    "내역": IC.receipt, "오늘": IC.today, "일정": IC.cal, "요청": IC.mail, "보고": IC.clip,
    "정산": IC.won, "수업": IC.users, "설정": IC.gear,
  };
  // v2.13: 회원 «수업 확인 요청» — pending 보고가 실존하는 내 confirm_wait 예약 (푸시 대신 로그인 배지 시뮬레이션)
  const myConfirmWait = () => myBk().filter((b) => b.status === "confirm_wait" && DB.reports.some((r) => r.bookingId === b.id && r.status === "pending"));
  function shell(role, title, body, opts = {}) {
    const tabs = TABS[role] || [];
    const cur = location.hash.split("/").slice(0, 3).join("/");
    // v2.24 U11: 홈 탭 배지 = 홈 «수업 확인 요청» 카드와 같은 소스(myConfirmWait) — 한 화면에 4와 5가 동시에 뜨던 불일치 제거.
    // 노쇼 통지는 홈 경고 배너·«내 예약» 배지로 계속 노출된다.
    const mAlerts = role === "m" ? myConfirmWait().length : 0;
    return `
      <header class="hd"><div class="hd-in">
        ${opts.back ? `<button class="hd-back" onclick="history.back()" aria-label="뒤로">‹</button>` : ""}
        <div class="hd-title${opts.center ? " center" : ""}">${title}</div>
        <button class="hd-role" onclick="location.hash='#/'">역할: <b>${ROLE_LABEL[role] || "-"}</b></button>
      </div></header>
      <main class="screen${tabs.length ? "" : " no-tab"}">${body}</main>
      ${tabs.length ? `<nav class="tabbar">${tabs.map(([h, l]) =>
        `<a class="tab${h.startsWith(cur) && cur !== "#" ? " on" : ""}" href="${h}"><span class="ic">${TAB_SVG[l] || ""}${l === "홈" && mAlerts ? `<i class="tab-dot" aria-label="수업 확인 요청 ${mAlerts}건">${mAlerts}</i>` : ""}</span>${l}</a>`).join("")}</nav>` : ""}`;
  }

  // ══ 랜딩 ══
  function vLanding() {
    return `<main class="screen no-tab landing">
      <div class="badge b-rose">프로토타입 · ${DB.center.name}</div>
      <h1 class="mt12">니짐내짐 <b>레슨 관리</b><br>어떤 화면으로 볼까요?</h1>
      <p class="sub">PT·그룹수업의 판매 → 예약 → 수강확인 → 정산.<br>더미데이터로 동작해요 (새로고침 시 초기화).</p>
      <button class="role-card" onclick="location.hash='#/m/home'">
        <span class="em">🙋</span><span><span class="rt">회원</span><span class="rd">수업권 구매 · 예약 · 대기 · 취소 · 수강확인</span></span><span class="arrow">›</span></button>
      <button class="role-card" onclick="location.hash='#/t/home'">
        <span class="em">💪</span><span><span class="rt">선생님</span><span class="rd">수업 개설·관리 · 조율 인박스 · 완료 보고 · 정산</span></span><span class="arrow">›</span></button>
      <button class="role-card" onclick="location.hash='#/c/home'">
        <span class="em">🏢</span><span><span class="rt">센터 (사장·관리자)</span><span class="rd">상품·수업 개설 · 폐강 · 정책 · 예약 · 정산</span></span><span class="arrow">›</span></button>
    </main>`;
  }

  // ══ 회원 ══
  // v2.14: 실서비스 «내 멤버십» 카드 문법 — 시설명+핑크 원형 화살표 / 프로그램명 / 멤버십 라벨 /
  // 큰 잔여 숫자+작은 단위 / 회색 보조줄. 여러 장이면 페이징 캐러셀(이웃 카드 가장자리 노출).
  const myPasses = () => DB.passes.filter((p) => p.memberId === DB.me.member);
  let mpIdx = 0; // 캐러셀 활성 카드 — 상세정보 동기용, «내 멤버십» 이탈 시 초기화(render)
  const mpDisc = (p) => p.listPrice != null && p.unitPrice < Math.floor(p.listPrice / p.total); // v2.9 구매 시점 스냅샷 기준 할인 판정
  const MP_ARROW = `<span class="mp-arrow" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.2 1.6 6.8 5 3.2 8.4"/></svg></span>`;
  const MP_IC = {
    cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 2.8v4M16 2.8v4"/></svg>`,
    ticket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 9V7a1.5 1.5 0 0 1 1.5-1.5h14A1.5 1.5 0 0 1 20.5 7v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16v-2a2.5 2.5 0 0 0 0-5Z"/><path d="M14 6v2.4M14 11v2M14 15.6V18" stroke-dasharray="0.1 3.2"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3.5h14V20.5l-2.4-1.5-2.4 1.5-2.2-1.5-2.2 1.5-2.4-1.5L5 20.5Z"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5"/></svg>`,
  };
  const mpStateLabel = (st) => ({ expired: "기간 만료", exhausted: "횟수 소진", frozen: "이용 정지" }[st] || null);
  // 이 수업권으로 들을 수 있는 수업의 담당 선생님 (자격 상품 기준)
  const mpTeachers = (p) => [...new Set(DB.classes.filter((c) => c.status !== "closed" && (c.eligibleProductIds || []).includes(p.productId)).map((c) => teacher(c.teacherId).name))];
  function mpCard(p) {
    const st = passState(p);
    const bad = mpStateLabel(st);
    const dd = dday(p.expiresAt);
    return `<article class="mp-card${st !== "active" ? " off" : ""}">
      <div class="mp-fac"><span>${DB.center.name}</span>${MP_ARROW}</div>
      <div class="mp-prog">${p.name}</div>
      <div class="mp-plabel">${p.expiresAt ? `${p.expiresAt.replaceAll("-", ".")}까지 멤버십` : "기간 제한 없는 멤버십"}</div>
      <div class="mp-left"><b>${p.remaining}</b><span>회 남음</span><small>/ 총 ${p.total}회</small></div>
      <div class="mp-sub">회당 ${won(p.unitPrice)}${mpDisc(p) ? ` · <span class="d">할인 구매 (정가 회당 ${won(Math.floor(p.listPrice / p.total))})</span>` : ""}<br>${
        bad ? `<b class="warn">${bad}</b> · 예약에 쓸 수 없어요`
        : p.expiresAt ? `${p.kind === "private" ? "개인수업 1:1" : "그룹수업"} 이용가능 (D-${dd})` : `${p.kind === "private" ? "개인수업 1:1" : "그룹수업"} · 횟수 소진 시까지 이용가능`}</div>
    </article>`;
  }
  function mpCarousel(ps) {
    return `<div class="mp-carousel${ps.length === 1 ? " single" : ""}" onscroll="App.mpScroll(this)" onpointerdown="App.mpDrag(this, event)">${ps.map(mpCard).join("")}</div>`;
  }
  function mpDetail(p) {
    if (!p) return "";
    const bad = mpStateLabel(passState(p));
    const dd = dday(p.expiresAt);
    const ts = mpTeachers(p);
    return `<div class="mp-info">
      <b class="h">수업권 정보</b>
      <div class="l">멤버십명</div><div class="v">${p.name}</div>
      <div class="l">수업 종류</div><div class="v">${p.kind === "private" ? "개인수업 1:1" : "그룹수업"}</div>
      ${ts.length ? `<div class="l">담당 선생님</div><div class="v">${ts.join(" · ")} 선생님</div>` : ""}
      <div class="l">잔여 횟수</div><div class="v">${p.remaining}회 / 총 ${p.total}회</div>
      <div class="l">유효기간</div><div class="v">${p.expiresAt ? `${p.expiresAt.replaceAll("-", ".")} 까지${dd != null && dd >= 0 ? ` (D-${dd})` : ""}` : "기간 제한 없음 · 횟수 소진 시까지"}</div>
      <div class="l">회당 단가</div><div class="v">${won(p.unitPrice)}${mpDisc(p) ? ` — 할인 구매 (정가 회당 ${won(Math.floor(p.listPrice / p.total))})` : ""} · 구매 시점 기준</div>
      ${p.purchasePrice != null ? `<div class="l">구매 금액</div><div class="v">${won(p.purchasePrice)}</div>` : ""}
      <div class="l">이용 상태</div><div class="v">${bad ? `${bad} · 예약에 쓸 수 없어요` : "이용 가능"}</div>
    </div>
    <div class="mp-info">
      <b class="h">센터정보</b>
      <div class="l">센터명</div><div class="v">${DB.center.name}</div>
    </div>`;
  }
  function vMPass() {
    const ps = myPasses();
    const cur = ps[Math.min(mpIdx, Math.max(0, ps.length - 1))];
    return shell("m", "내 멤버십", `
      ${ps.length ? `${mpCarousel(ps)}
      <a class="mp-btn" href="#/m/book">${MP_IC.cal}수업 예약하기</a>
      <p class="mp-status">정상운영 중입니다.</p>
      <div class="mp-sec">멤버십 상세정보</div>
      <div id="mp-detail">${mpDetail(cur)}</div>
      <a class="mp-btn" href="#/m/history">${MP_IC.list}이용 내역 보기</a>`
      : `<div class="card flat mb-empty"><div class="em">🎟️</div><p class="muted mt8">보유한 멤버십이 없어요.</p></div>`}
      <a class="mp-btn" href="#/m/shop">${MP_IC.ticket}수업 멤버십 구매</a>`, { center: true });
  }
  // v2.24 U2: «다가오는 예약»은 일시 오름차순 — 목록의 존재 이유가 "다음 수업이 언제냐"라서.
  // v2.24 U14: 이미 끝난 회차는 여기서 제외(myEnded로 분리) — 예정 목록에 취소 버튼을 달고 남으면 오조작 차감 분쟁.
  const bkAt = (b) => slotAt(slot(b.slotId));
  const upcomingBase = () => myBk().filter((b) => {
    if (!["booked", "waitlisted"].includes(b.status)) return false;
    const s = slot(b.slotId);
    return s && s.status !== "canceled";
  });
  function myUpcoming() {
    return upcomingBase().filter((b) => !isPast(slot(b.slotId))).sort((a, b) => bkAt(a) - bkAt(b));
  }
  // 수업 시각이 지났는데 아직 선생님 완료 보고 전인 내 회차 — «수업 종료 · 보고 대기» (취소 불가)
  function myEnded() {
    return upcomingBase().filter((b) => isPast(slot(b.slotId))).sort((a, b) => bkAt(b) - bkAt(a));
  }
  function vMHome() {
    // S-1: 확인 카드는 pending 보고가 실존하는 confirm_wait 예약에만 (v2.13: 원탭 확인 카드)
    const confirmWait = myConfirmWait();
    const noshow = myBk().filter((b) => b.status === "noshow_wait");
    const upcoming = myUpcoming();
    const arrs = DB.arranges.filter((a) => a.memberId === DB.me.member && a.status === "pending");
    const auto = DB.policy.autoConfirmHours;
    return shell("m", "니짐내짐 레슨", `
      ${confirmWait.length >= 3 ? (() => {
        // v2.23 (형 확정 1안): 3건부터 요약 카드 1장으로 접기 — 홈 점유 방지. 확인은 목록에서 건별로만.
        const s0 = slot(confirmWait[0].slotId); const c0 = cls(s0.classId);
        return `<div class="card confirm-req" onclick="location.hash='#/m/confirms'" style="cursor:pointer">
        <div class="row"><span class="grow"><span class="badge b-rose">수업 확인 요청 ${confirmWait.length}건</span></span><span class="muted small">선생님 완료 보고</span></div>
        <b class="mt8" style="display:block;font-size:15px">확인을 기다리는 수업이 ${confirmWait.length}건 있어요</b>
        <div class="muted small mt4">${c0.title} · ${dlabel(s0.date)} ${s0.time} 외 ${confirmWait.length - 1}건</div>
        <button class="btn primary mt12" onclick="location.hash='#/m/confirms'">한 건씩 확인하기</button>
        <div class="muted small mt8" style="text-align:center">확인하면 수업권이 차감돼서, 한 건씩만 확인할 수 있어요</div>
      </div>`;
      })() : confirmWait.map((b) => {
        const s = slot(b.slotId); const c = cls(s.classId);
        return `<div class="card confirm-req">
        <div class="row"><span class="grow"><span class="badge b-rose">수업 확인 요청</span></span><span class="muted small">선생님 완료 보고</span></div>
        <b class="mt8" style="display:block;font-size:15px">${c.title}</b>
        <div class="muted small mt4">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div>
        <button class="btn primary mt12" onclick="App.confirmAttend('${b.id}')">받았어요 (수업 확인)</button>
        <button class="btn ghost mt8" onclick="location.hash='#/m/confirm/${b.id}'">자세히 보기</button>
        <div class="muted small mt8" style="text-align:center">${auto ? `무응답 시 보고 ${auto}시간 뒤 자동확정돼요` : "자동확정 없이 센터가 수동 처리해요"} · 확인은 내 계정에서만 가능해요</div>
      </div>`;
      }).join("")}
      ${noshow.map((b) => {
        const r = DB.reports.find((x) => x.bookingId === b.id && x.status === "noshow_wait");
        return `<button class="banner warn" onclick="location.hash='#/m/bookings'">
        <span class="ic">⚠️</span><span>${slotDesc(slot(b.slotId))} 회차가 <b>노쇼</b>로 보고됐어요. ${r ? `<b>${noshowDeadline(r).replaceAll("-", ".")}</b>까지 이의가 없으면 <b>자동 확정·1회 차감</b>돼요.` : ""} 사실과 다르면 이의제기해 주세요.</span></button>`;
      }).join("")}
      ${myPendingProps().length ? `<button class="banner" onclick="location.hash='#/m/proposals'">
        <span class="ic">📨</span><span>선생님이 보낸 일정 제안이 <b>${myPendingProps().length}건</b> 기다리고 있어요. <u>확인하기</u></span></button>` : ""}
      <div class="sec-title row">내 멤버십<a href="#/m/pass" class="small" style="margin-left:auto;color:var(--text-muted);font-weight:600">전체 보기 ›</a></div>
      ${mpCarousel(myPasses())}
      <a class="mp-btn" href="#/m/shop">${MP_IC.ticket}수업 멤버십 구매</a>
      <div class="sec-title row">다가오는 예약<a href="#/m/bookings" class="small" style="margin-left:auto;color:var(--text-muted);font-weight:600">전체 보기 ›</a></div>
      <div class="card flat">${(() => {
        // v2.24 U2: 예약(확정·대기)과 조율 희망일을 한 시간축에 병합해 오름차순.
        // v2.24 U3: 행 전체를 탭하면 그 회차 상세로 — 취소·변경 동선의 입구(조율 건은 «내 예약»으로).
        const rows = upcoming.map((b) => {
          const s = slot(b.slotId); const c = cls(s.classId); const bd = bkBadge(b);
          return { at: slotAt(s), html: `<div class="slot tapable" role="button" tabindex="0" onclick="location.hash='#/m/slot/${s.id}'"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${c.title}</span><div class="muted small">${dlabel(s.date)} · ${teacher(c.teacherId).name} 선생님</div></span>
          <span class="badge ${bd.badge}">${bd.label}</span><span class="chev" aria-hidden="true">›</span></div>` };
        }).concat(arrs.map((a) => {
          const c = cls(a.classId);
          return { at: new Date(`${a.date}T${a.time}:00+09:00`), html: `<div class="slot tapable" role="button" tabindex="0" onclick="location.hash='#/m/bookings'"><span class="time">${a.time}</span>
          <span class="grow"><span class="t">${c.title}</span><div class="muted small">${dlabel(a.date)} 희망 · 선생님 확인 중</div></span>
          <span class="badge b-warn">조율 대기</span><span class="chev" aria-hidden="true">›</span></div>` };
        })).sort((x, y) => x.at - y.at);
        return rows.length ? rows.map((r) => r.html).join("") : `<p class="muted">예약이 없어요.</p>`;
      })()}</div>
      <a class="btn primary mt8" href="#/m/book">수업 예약하기</a>`);
  }
  // v2.16: 실서비스 «멤버십 구매» 카드 문법 전면 교체 (purchase_ui_spec.md v1 — 실측 레드 사용, 브랜드 팔레트 치환 금지)
  function shopCard(p) {
    const sale = p.salePrice != null && p.salePrice < p.price; // §2-3 조건부 이벤트 문법 (데이터에 salePrice 있을 때만)
    const per = Math.floor((sale ? p.salePrice : p.price) / p.sessions);
    return `<button class="shop-card${sale ? " ev" : ""}" onclick="location.hash='#/m/shop/${p.id}'" aria-label="${p.name}">
      ${sale ? `<span class="sc-badge">이벤트<br>할인가</span>` : ""}
      <span class="sc-cap">${p.sessions}회</span>
      <span class="sc-band">${p.validityDays ? `${p.validityDays}일` : "기간 제한 없음"}</span>
      <span class="sc-price">${sale
        ? `<s class="sc-list">${won(p.price)}</s><b class="sc-sale">${won(p.salePrice)}</b><b class="sc-per-ev">회당 ${won(per)}</b>`
        : `<b class="sc-won">${won(p.price)}</b><span class="sc-per">회당 ${won(per)}</span>`}</span>
    </button>`;
  }
  function vMShop() {
    const section = (title, ps, notice) => `
      <h2 class="shop-h">${title}</h2>
      <div class="shop-row">${ps.map(shopCard).join("")}</div>
      <div class="shop-notice">${notice}</div>`;
    return shell("m", "수업 멤버십 구매", `<div class="shop">
      ${section("개인수업", DB.products.filter((p) => p.kind === "private"),
        "💡 횟수제 수업권이에요. 유효기간이 지나거나 횟수를 다 쓰면 만료돼요")}
      ${section("그룹수업", DB.products.filter((p) => p.kind === "group"),
        "💡 (무기한) 수업권은 기간 제한 없이 횟수만 차감돼요")}
    </div>`, { back: true });
  }
  function vMShopDetail(id) {
    const p = DB.products.find((x) => x.id === id);
    if (!p) return vMShop();
    // v2.18: 이벤트 할인가 상품 — 카드(§2-3)와 동일하게 상세·결제도 할인가 기준
    const sale = p.salePrice != null && p.salePrice < p.price;
    const pay = sale ? p.salePrice : p.price;
    return shell("m", p.name, `
      <div class="card">
        <span class="badge ${p.kind === "private" ? "b-rose" : "b-blue"}">${p.kind === "private" ? "개인수업 1:1" : "그룹수업"}</span>${sale ? ` <span class="badge b-danger">이벤트 할인가</span>` : ""}
        <div class="big mt8">${sale ? `<s style="font-size:15px;font-weight:600;color:var(--text-muted)">${won(p.price)}</s> ` : ""}${won(pay)}</div>
        <div class="divider"></div>
        <div class="row" style="justify-content:space-between"><span class="muted">횟수</span><b>${p.sessions}회 (회당 ${won(Math.floor(pay / p.sessions))})</b></div>
        <div class="row mt8" style="justify-content:space-between"><span class="muted">유효기간</span><b>${p.validityDays ? `구매일부터 ${p.validityDays}일` : "없음 · 횟수 소진 시까지"}</b></div>
        <div class="row mt8" style="justify-content:space-between"><span class="muted">취소 규정</span><b>수업 ${DB.policy.cancelHours}시간 전까지 무료</b></div>
      </div>
      <p class="muted small">구매 시점의 가격·조건이 그대로 보존돼요. 이후 상품이 바뀌어도 내 수업권은 영향받지 않아요.</p>
      <button class="btn primary mt12" onclick="App.buy('${p.id}')">${won(pay)} 결제하기</button>
      <p class="muted small mt8" style="text-align:center">프로토타입 — 실제 결제는 일어나지 않아요.</p>`, { back: true });
  }
  // v2.11 (형 지시 08-18): 회원 «수업 예약» — 주간 캘린더 스트립 + 날짜별 회차 리스트 혼합.
  // 조율(arranged) 수업은 날짜 필터에 묻히지 않게 캘린더 아래 상시 섹션.
  let mBookSel = null; // 선택 날짜 — 화면 이탈 시 초기화(render)
  const MB_MINE = ["booked", "waitlisted", "confirm_wait"]; // 캘린더 «내 예약» 점 판정
  function mbWeekStart(d) { const dt = new Date(d + "T12:00:00+09:00"); return addDays(d, -((dt.getDay() + 6) % 7)); }
  // 그날 회원에게 보이는 회차 — 고정 스케줄은 전부, 조율(adhoc) 회차는 내 예약분만 (남의 1:1 일정 비공개)
  function mbSlotsOn(date) {
    return DB.slots.filter((s) => {
      if (s.date !== date || s.status === "canceled") return false;
      const c = cls(s.classId);
      if (!c || c.status === "closed") return false;
      if (c.schedule === "fixed") return true;
      return DB.bookings.some((b) => b.slotId === s.id && b.memberId === DB.me.member && [...SEAT, "waitlisted"].includes(b.status));
    }).sort((a, b) => a.time.localeCompare(b.time));
  }
  const mbBookable = (s) => { const c = cls(s.classId); return !!c && c.status !== "closed" && c.schedule === "fixed" && s.status === "scheduled" && !isPast(s); };
  const mbMineOn = (date) => DB.bookings.some((b) => {
    if (b.memberId !== DB.me.member || !MB_MINE.includes(b.status)) return false;
    const s = slot(b.slotId);
    return s && s.status !== "canceled" && s.date === date;
  });
  function mbNearest(sel) {
    const dates = [...new Set(DB.slots.filter(mbBookable).map((s) => s.date))].sort();
    return dates.find((d) => d > sel) || dates.slice().reverse().find((d) => d < sel) || null;
  }
  // v2.21: 월간 그리드 셀 — 센터 예약(vCBookings)·정산(vCSettlement) 캘린더 공용 (월요일 시작)
  function monthCells(ym) {
    const [y, m] = ym.split("-").map(Number);
    const dim = new Date(y, m, 0).getDate();
    const lead = (new Date(`${ym}-01T12:00:00+09:00`).getDay() + 6) % 7;
    const cells = [...Array(lead).fill(null), ...Array.from({ length: dim }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`)];
    while (cells.length % 7) cells.push(null);
    return cells;
  }
  // v2.20: 월 이동 시트 — 회원(mbGoto)·센터(cbGoto)·정산(csGoto) 캘린더 공용. 회차가 있는 달+다음 달 노출
  function monthSheet(cur, gotoFn) {
    const months = [...new Set([...DB.slots.map((s) => s.date.slice(0, 7)), DB.TODAY.slice(0, 7)])].sort();
    const [ly, lm] = months[months.length - 1].split("-").map(Number);
    months.push(`${lm === 12 ? ly + 1 : ly}-${String((lm % 12) + 1).padStart(2, "0")}`);
    modal(`<h3>월 이동</h3>${months.map((ym) => {
      const [y, m] = ym.split("-").map(Number);
      const target = ym === DB.TODAY.slice(0, 7) ? DB.TODAY : `${ym}-01`;
      return `<button class="btn ${ym === cur ? "primary" : "ghost"} mt8" onclick="App.${gotoFn}('${target}')">${y}년 ${m}월</button>`;
    }).join("")}`);
  }
  // v2.25 ⑤ (형 확정 A): 예약 탭 최상단 [캘린더 | 내 예약] 세그먼트.
  // «내 예약» = 다가올 예약 + 대기/확인 필요. 지난 이력은 «내역» 탭·«내 예약 전체»에만 둔다(중복 노출 금지).
  let mBookTab = "cal";
  function vMBookSeg() {
    return `<div class="seg book-seg" role="tablist">
      <button role="tab" aria-selected="${mBookTab === "cal"}" class="${mBookTab === "cal" ? "on" : ""}" onclick="App.mbTab('cal')">캘린더</button>
      <button role="tab" aria-selected="${mBookTab === "mine"}" class="${mBookTab === "mine" ? "on" : ""}" onclick="App.mbTab('mine')">내 예약</button>
    </div>`;
  }
  function vMBookMine() {
    const up = myUpcoming();
    const ended = myEnded();
    const need = myBk().filter((b) => ["confirm_wait", "noshow_wait", "disputed"].includes(b.status));
    const arrs = DB.arranges.filter((a) => a.memberId === DB.me.member && a.status === "pending");
    const props = myPendingProps();
    const row = (b, endedRow) => {
      const s = slot(b.slotId); const c = cls(s.classId);
      const bd = endedRow ? { label: "수업 종료 · 보고 대기", badge: "b-gray" } : bkBadge(b);
      const bp = b.passId && pass(b.passId);
      return `<div class="slot tapable" role="button" tabindex="0" onclick="location.hash='#/m/slot/${s.id}'"><span class="time">${s.time}</span>
        <span class="grow"><span class="t">${c.title}</span>
          <div class="muted small">${dlabel(s.date)} · ${teacher(c.teacherId).name} 선생님</div>
          <div class="muted small">${bp ? `사용 수업권: ${bp.name}` : "수업권 미연결"}</div></span>
        <span class="badge ${bd.badge}">${bd.label}</span><span class="chev" aria-hidden="true">›</span></div>`;
    };
    return `
      <div class="sec-title">다가올 예약${up.length ? ` <span class="badge b-gray">${up.length}건</span>` : ""}</div>
      <div class="card flat">${up.length ? up.map((b) => row(b, false)).join("")
        : `<p class="muted">다가올 예약이 없어요. «캘린더»에서 수업을 골라 예약해 보세요.</p>`}</div>
      ${need.length ? `<div class="sec-title">확인 필요 <span class="badge b-rose">${need.length}건</span></div>
      <div class="card flat">${need.map((b) => {
        const s = slot(b.slotId); const c = cls(s.classId); const bd = bkBadge(b);
        return `<div class="slot"><span class="grow"><span class="t">${c.title}</span>
          <div class="muted small">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div></span>
          <span class="badge ${bd.badge}">${bd.label}</span>
          ${b.status === "confirm_wait" ? `<button class="btn sm primary" onclick="location.hash='#/m/confirm/${b.id}'">확인</button>` : ""}
          ${b.status === "noshow_wait" ? `<button class="btn sm ghost" onclick="App.askDispute('${b.id}')">이의제기</button>` : ""}</div>`;
      }).join("")}</div>` : ""}
      ${arrs.length ? `<div class="sec-title">조율 대기 <span class="badge b-warn">${arrs.length}건</span></div>
      <div class="card flat">${arrs.map((a) => {
        const c = cls(a.classId);
        return `<div class="slot"><span class="time">${a.time}</span>
          <span class="grow"><span class="t">${c.title}</span>
          <div class="muted small">${dlabel(a.date)} 희망 · 선생님 확인 중</div></span>
          <button class="btn sm ghost" onclick="App.arrangeCancel('${a.id}')">요청 취소</button></div>`;
      }).join("")}</div>` : ""}
      ${props.length ? `<button class="banner mt8" onclick="location.hash='#/m/proposals'">${icb("mail")}<span>선생님이 보낸 일정 제안이 <b>${props.length}건</b> 기다리고 있어요. <u>확인하기</u></span></button>` : ""}
      ${ended.length ? `<div class="sec-title">수업 종료 · 보고 대기</div>
      <div class="card flat">${ended.map((b) => row(b, true)).join("")}
        <p class="muted small mt8">수업 시각이 지난 회차예요. 선생님이 완료 보고를 하면 «수강 확인 대기»로 넘어가요.</p></div>` : ""}
      <a class="btn ghost mt8" href="#/m/bookings">지난 예약까지 전체 보기</a>
      <p class="muted small mt8" style="text-align:center">수업권 증감 기록은 «내역» 탭에서 볼 수 있어요.</p>`;
  }
  function vMBook() {
    if (mBookTab === "mine") return shell("m", "수업 예약", vMBookSeg() + vMBookMine());
    const sel = mBookSel || (mBookSel = DB.TODAY);
    const days = Array.from({ length: 7 }, (_, i) => addDays(mbWeekStart(sel), i));
    const selDt = new Date(sel + "T12:00:00+09:00");
    const list = mbSlotsOn(sel);
    const arranged = DB.classes.filter((c) => c.status !== "closed" && c.schedule === "arranged");
    const near = list.length ? null : mbNearest(sel);
    const item = (s) => {
      const c = cls(s.classId);
      const n = seatCount(s.id), w = waitBk(s.id).length, full = n >= c.capacity;
      const mine = DB.bookings.find((b) => b.slotId === s.id && b.memberId === DB.me.member && [...SEAT, "waitlisted"].includes(b.status));
      const past = isPast(s) || s.status !== "scheduled";
      let right;
      if (past) right = `<span class="badge b-gray">종료</span>`;
      else if (mine) right = "";
      else if (full) right = c.kind === "private" || !DB.policy.waitlist
        ? `<span class="badge b-danger">마감</span>`
        : `<button class="btn sm ghost" onclick="location.hash='#/m/slot/${s.id}'">대기</button>`;
      else right = `<button class="btn sm primary" onclick="location.hash='#/m/slot/${s.id}'">예약</button>`;
      return `<div class="slot mb-item">
        <button class="mb-main" onclick="location.hash='#/m/slot/${s.id}'">
          <span class="time">${s.time}</span>
          <span class="grow"><span class="t">${c.title}</span>
            <div class="muted small">${teacher(c.teacherId).name} 선생님 · ${c.duration}분 · ${past ? "지난 회차" : full ? `정원 마감${w ? ` · 대기 ${w}명` : ""}` : `잔여 ${c.capacity - n}자리`}</div>
            <div class="mt4 mb-badges"><span class="badge ${c.kind === "private" ? "b-rose" : "b-blue"}">${c.kind === "private" ? "개인 1:1" : `그룹 · 정원 ${c.capacity}명`}</span><span class="badge b-gray">${eligLabel(c)}</span>${mine ? `<span class="badge ${bkBadge(mine).badge}">${bkBadge(mine).label}</span>` : ""}</div></span>
        </button>
        ${right ? `<span class="mb-right">${right}</span>` : ""}</div>`;
    };
    return shell("m", "수업 예약", `
      ${vMBookSeg()}
      <div class="card mb-cal">
        <div class="mb-head">
          <button class="mb-nav" onclick="App.mbWeek(-1)" aria-label="이전 주">‹</button>
          <button class="mb-month" onclick="App.mbMonthSheet()">${selDt.getFullYear()}년 ${selDt.getMonth() + 1}월 <span class="car">▾</span></button>
          <button class="mb-nav" onclick="App.mbWeek(1)" aria-label="다음 주">›</button>
        </div>
        <div class="mb-strip">${days.map((d) => {
          const dt = new Date(d + "T12:00:00+09:00");
          const avail = DB.slots.some((s) => s.date === d && mbBookable(s));
          return `<button type="button" class="mb-day${d === sel ? " on" : ""}${d === DB.TODAY ? " today" : ""}${d < DB.TODAY ? " past" : ""}" onclick="App.mbDay('${d}')">
            <span class="dw">${DOW[dt.getDay()]}</span><span class="dn">${dt.getDate()}</span>
            <span class="mb-dots">${mbMineOn(d) ? `<i class="mine"></i>` : ""}${avail ? `<i class="av"></i>` : ""}</span></button>`;
        }).join("")}</div>
        <div class="mb-legend"><span><i class="av"></i>예약 가능한 수업</span><span><i class="mine"></i>내 예약</span></div>
      </div>
      <div class="sec-title">${dlabel(sel)} 수업</div>
      ${list.length ? `<div class="card flat">${list.map(item).join("")}</div>`
        : `<div class="card flat mb-empty"><div class="em">🗓️</div>
            <p class="muted mt8">이 날은 예약할 수 있는 수업이 없어요.</p>
            ${near ? `<button class="btn ghost mt12" onclick="App.mbDay('${near}')">가장 가까운 수업일 ${dlabel(near)}로 이동</button>` : ""}</div>`}
      <div class="sec-title">수시 조율 수업 <span class="muted small" style="font-weight:600">— 날짜와 무관하게 신청해요</span></div>
      ${arranged.length ? arranged.map((c) => {
        const pend = DB.arranges.filter((a) => a.memberId === DB.me.member && a.classId === c.id && a.status === "pending").length;
        return `<button class="card card-tap" onclick="location.hash='#/m/class/${c.id}'">
        <div class="row"><span class="grow"><b>${c.title}</b>
          <div class="muted small mt4">${teacher(c.teacherId).name} 선생님 · ${c.scheduleLabel} · ${c.duration}분</div>
          <div class="mt8"><span class="badge ${c.kind === "private" ? "b-rose" : "b-blue"}">${c.kind === "private" ? "개인 1:1" : `그룹 · 정원 ${c.capacity}명`}</span>
          <span class="badge b-gray">${eligLabel(c)}</span>${pend ? `<span class="badge b-warn">조율 대기 ${pend}건</span>` : ""}</div></span>
        <span class="arrow" style="color:var(--text-disabled)">›</span></div></button>`;
      }).join("") : `<div class="card flat"><p class="muted">수시 조율로 진행하는 수업이 없어요.</p></div>`}`);
  }
  function vMClass(id) {
    const c = cls(id);
    if (!c || c.status === "closed") return vMBook();
    const g = bookGuard(c, DB.me.member);
    if (c.schedule === "arranged") {
      const myArrs = DB.arranges.filter((a) => a.memberId === DB.me.member && a.classId === id && a.status === "pending");
      return shell("m", c.title, `
        <div class="card"><b>${teacher(c.teacherId).name} 선생님과 일정 조율</b>
          <p class="muted small mt4">이 수업은 고정 시간표가 없어요. 희망 일시를 보내면 <b>선생님이 수락해야</b> 예약이 확정돼요.</p></div>
        ${g.ok ? `<div class="card">
          <div class="field"><label>희망 날짜</label><input type="date" id="arr-date" value="2026-08-21" min="${DB.TODAY}"></div>
          <div class="field"><label>희망 시간</label><input type="time" id="arr-time" value="11:00"></div>
          <div class="field"><label>메모 (선택)</label><input type="text" id="arr-note" placeholder="예: 오전이면 좋아요"></div>
          <div class="divider"></div>
          ${(() => { const key = `c:${c.id}`; const cds = eligiblePasses(c, DB.me.member); const up = chosenPass(key, cds);
            return up ? passPickRow(key, up, cds.length) : ""; })()}
          <button class="btn primary mt12" onclick="App.requestArrange('${c.id}')">조율 요청 보내기</button>
        </div>
        <p class="muted small">선생님이 수락하면 예약이 자동 등록되고 알림을 보내드려요. 거절하면 사유를 알려드려요.</p>`
        : `<div class="banner warn"><span class="ic">🚫</span><span>${g.msg}</span></div>
           <a class="btn primary" href="#/m/shop">수업권 구매하러 가기</a>`}
        ${myArrs.length ? `<div class="sec-title">보낸 요청</div><div class="card flat">${myArrs.map((a) => `
          <div class="slot"><span class="grow"><b>${dlabel(a.date)} ${a.time}</b><div class="muted small">선생님 확인 중</div></span>
          <button class="btn sm ghost" onclick="App.arrangeCancel('${a.id}')">요청 취소</button></div>`).join("")}</div>` : ""}`, { back: true });
    }
    const slots = DB.slots.filter((s) => s.classId === id && s.status === "scheduled" && !isPast(s));
    return shell("m", c.title, `
      <div class="card flat"><div class="muted small">${teacher(c.teacherId).name} 선생님 · ${c.scheduleLabel} · 정원 ${c.capacity}명 · ${eligLabel(c)}</div></div>
      ${g.ok ? "" : `<div class="banner warn"><span class="ic">🚫</span><span>${g.msg}</span></div>`}
      <div class="sec-title">예약 가능 회차</div>
      <div class="card flat">${slots.length ? slots.map((s) => {
        const n = seatCount(s.id); const w = waitBk(s.id).length;
        const full = n >= c.capacity;
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${dlabel(s.date)}</span>
            <div class="cap-bar${full ? " full" : ""}"><i style="width:${Math.min(100, (n / c.capacity) * 100)}%"></i></div>
            <div class="muted small mt4">${n}/${c.capacity}명${w ? ` · 대기 ${w}명` : ""}</div></span>
          <button class="btn sm ${full ? "ghost" : "primary"}" onclick="location.hash='#/m/slot/${s.id}'">${full ? "마감" : "예약"}</button></div>`;
      }).join("") : `<p class="muted">예약 가능한 회차가 없어요.</p>`}</div>`, { back: true });
  }
  function vMSlot(id) {
    const s = slot(id);
    if (!s || s.status === "canceled") return vMBook();
    const c = cls(s.classId);
    const n = seatCount(s.id);
    const full = n >= c.capacity;
    const g = bookGuard(c, DB.me.member);
    const mine = DB.bookings.find((b) => b.slotId === id && b.memberId === DB.me.member && ACTIVE.includes(b.status));
    // v2.25 ③: 예약 전 = 자동 선택된 수업권 + «변경», 예약 뒤 = 실제로 차감될 수업권을 고정 표기(분쟁 방지)
    const pkey = `s:${id}`;
    const cands = eligiblePasses(c, DB.me.member);
    const usePass = mine ? (mine.passId && pass(mine.passId)) : chosenPass(pkey, cands);
    let action;
    if (mine) {
      const bd = bkBadge(mine);
      // v2.24 U17: 로즈(경고) 배너에 초록 ✅는 톤 충돌 — 금지 아이콘으로 교체.
      // v2.24 U3: 확정·대기 회차의 취소 입구를 여기에 노출(막다른 상세 화면 해소). 지난 회차는 취소 대신 안내.
      const canCancel = ["booked", "waitlisted"].includes(mine.status) && !isPast(s);
      action = `<div class="banner"><span class="ic">🚫</span><span>이 회차에 이미 <b>${bd.label}</b> 상태예요. 중복 예약은 안 돼요.</span></div>
        ${canCancel ? `<button class="btn danger-ghost" onclick="App.askCancel('${mine.id}')">${mine.status === "waitlisted" ? "예약대기 취소" : "예약 취소"}</button>
        <a class="btn ghost mt8" href="#/m/bookings">내 예약 전체 보기</a>`
        : `<div class="card flat"><div class="muted small">${isPast(s) ? "수업 시각이 지나 취소할 수 없어요. 선생님 완료 보고 뒤 «수강 확인»으로 넘어가요." : "이 상태에서는 취소할 수 없어요."}</div></div>
        <a class="btn ghost" href="#/m/bookings">내 예약 전체 보기</a>`}`;
    } else if (isPast(s)) {
      action = `<button class="btn primary" disabled>지난 회차는 예약할 수 없어요</button>`;
    } else if (!g.ok) {
      action = `<div class="banner warn"><span class="ic">🚫</span><span>${g.msg}</span></div><a class="btn primary" href="#/m/shop">수업권 구매하러 가기</a>`;
    } else if (full) {
      // 하-4: 개인(1:1) 수업은 대기 없음
      action = c.kind === "private" ? `<button class="btn primary" disabled>정원 마감 (1:1 수업은 대기를 받지 않아요)</button>`
        : DB.policy.waitlist
        ? `<button class="btn primary" onclick="App.joinWaitlist('${s.id}')">예약대기 신청 (${waitBk(s.id).length + 1}번째)</button>
           <p class="muted small mt8" style="text-align:center">자리가 나면 순번대로 자동 확정되고 알림을 보내드려요.</p>`
        : `<button class="btn primary" disabled>정원 마감 (이 센터는 대기를 받지 않아요)</button>`;
    } else {
      action = `<button class="btn primary" onclick="App.book('${s.id}')">예약하기</button>`;
    }
    return shell("m", "예약 확인", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${c.duration}분 · ${teacher(c.teacherId).name} 선생님</div>
        <div class="mt8"><span class="badge ${full ? "b-danger" : "b-green"}">${full ? `정원 마감 · 대기 ${waitBk(s.id).length}명` : `잔여 ${c.capacity - n}자리`}</span></div>
        <div class="divider"></div>
        ${mine
          ? `<div class="row" style="justify-content:space-between;gap:10px"><span class="muted">차감될 수업권</span>
             <span style="text-align:right"><b>${usePass ? usePass.name : "수업권 미연결"}</b>${usePass ? `<span class="muted small"> · ${passLine(usePass)}</span>` : ""}</span></div>
             <div class="hint">수강 확인이 끝나면 이 수업권에서 1회가 차감돼요. 무료 취소하면 차감은 일어나지 않아요.</div>`
          : usePass ? passPickRow(pkey, usePass, cands.length)
          : `<div class="row" style="justify-content:space-between"><span class="muted">사용 수업권</span><b>사용 가능한 수업권 없음</b></div>`}
      </div>
      <div class="banner warn"><span class="ic">ℹ️</span><span>취소는 수업 <b>${DB.policy.cancelHours}시간 전</b>까지 무료예요. 이후 취소하면 횟수가 차감돼요. 이 조건은 <b>예약 시점 기준으로 보존</b>돼요.</span></div>
      ${action}`, { back: true });
  }
  function vMBookings() {
    const mine = myBk();
    const arrs = DB.arranges.filter((a) => a.memberId === DB.me.member);
    // v2.24 U2·U14: 예정=미래 회차만 일시 오름차순, 이미 끝난 회차는 «수업 종료 · 보고 대기»로 분리(취소 버튼 없음)
    const act = myUpcoming();
    const ended = myEnded();
    const need = mine.filter((b) => ["confirm_wait", "noshow_wait", "disputed"].includes(b.status));
    const past = mine.filter((b) => ["canceled", "forfeited", "confirmed", "restored", "class_closed", "noshow_final"].includes(b.status) || (slot(b.slotId).status === "canceled" && b.status === "booked"));
    const item = (b, withCancel, endedRow) => {
      const s = slot(b.slotId); const c = cls(s.classId);
      // 종료 회차는 상태 원본(booked/waitlisted) 대신 «수업 종료 · 보고 대기»로 표기 — 예약 확정 라벨이 남으면 아직 취소 가능한 것처럼 읽힘
      const bd = endedRow ? { label: "수업 종료 · 보고 대기", badge: "b-gray" } : bkBadge(b);
      // v2.25 ③: 어떤 수업권이 쓰이는지 예약 목록에도 항상 표기 — 차감 분쟁 방지
      const bp = b.passId && pass(b.passId);
      return `<div class="slot"><span class="grow"><span class="t">${c.title}</span>
        <div class="muted small">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div>
        <div class="muted small">${bp ? `${["confirmed", "forfeited", "noshow_final"].includes(b.status) ? "차감" : "사용"} 수업권: ${bp.name}` : "수업권 미연결"}</div>
        ${b.status === "class_closed" ? `<div class="muted small">폐강 사유: ${b.closeReason || "-"}</div>` : ""}</span>
        <span class="badge ${bd.badge}">${bd.label}</span>
        ${withCancel && ["booked", "waitlisted"].includes(b.status) ? `<button class="btn sm ghost" onclick="App.askCancel('${b.id}')">취소</button>` : ""}
        ${b.status === "confirm_wait" ? `<button class="btn sm primary" onclick="location.hash='#/m/confirm/${b.id}'">확인</button>` : ""}
        ${["noshow_wait"].includes(b.status) ? `<button class="btn sm ghost" onclick="App.askDispute('${b.id}')">이의제기</button>` : ""}
        ${b.status === "confirmed" && disputeOpen(b) ? `<button class="btn sm ghost" onclick="App.askDispute('${b.id}')">이의</button>` : ""}</div>`;
    };
    const arrItem = (a) => {
      const c = cls(a.classId);
      const st = { pending: ["조율 대기", "b-warn"], accepted: ["수락 · 예약 확정", "b-green"], declined: ["거절됨", "b-gray"], canceled: ["요청 취소", "b-gray"] }[a.status];
      // v2.22: 거절 건에 선생님 대안 제안이 붙어 있으면 받은 제안으로 안내
      const alt = a.status === "declined" ? DB.proposals.find((p) => p.arrangeId === a.id && propState(p) === "pending") : null;
      return `<div class="slot"><span class="grow"><span class="t">${c.title}</span>
        <div class="muted small">${dlabel(a.date)} ${a.time} 희망${a.status === "declined" && a.reason ? ` · 사유: ${a.reason}` : ""}</div></span>
        <span class="badge ${st[1]}">${st[0]}</span>
        ${a.status === "pending" ? `<button class="btn sm ghost" onclick="App.arrangeCancel('${a.id}')">취소</button>` : ""}
        ${alt ? `<button class="btn sm primary" onclick="location.hash='#/m/proposals'">대안 제안 보기</button>` : ""}</div>`;
    };
    return shell("m", "내 예약", `
      <div class="sec-title">예정 · 대기</div>
      <div class="card flat">${act.length ? act.map((b) => item(b, true)).join("") : `<p class="muted">예약이 없어요.</p>`}</div>
      ${ended.length ? `<div class="sec-title">수업 종료 · 보고 대기</div>
      <div class="card flat">${ended.map((b) => item(b, false, true)).join("")}
        <p class="muted small mt8">수업 시각이 지난 회차예요. 선생님이 완료 보고를 하면 «수강 확인 대기»로 넘어가요. 이미 받은 수업이라 취소는 할 수 없어요.</p></div>` : ""}
      ${arrs.length ? `<div class="sec-title">조율 요청</div><div class="card flat">${arrs.map(arrItem).join("")}</div>` : ""}
      ${need.length ? `<div class="sec-title">확인 필요</div><div class="card flat">${need.map((b) => item(b, false)).join("")}</div>` : ""}
      ${past.length ? `<div class="sec-title">지난 예약</div><div class="card flat">${past.map((b) => item(b, false)).join("")}</div>` : ""}`, { back: true });
  }
  // v2.22: 회원 «받은 제안» 인박스 — 선생님 조율 인박스와 같은 구성(대기 중/처리됨)
  function vMProps() {
    const all = myProps();
    const pending = all.filter((p) => propState(p) === "pending");
    const done = all.filter((p) => propState(p) !== "pending");
    return shell("m", "받은 제안", `
      <p class="muted" style="margin-bottom:12px">선생님이 먼저 보낸 일정 제안이에요. 수락하면 바로 예약이 확정·변경되고, 거절하면 기존 일정이 그대로 유지돼요.</p>
      <div class="sec-title">대기 중 (${pending.length})</div>
      <div class="card flat">${pending.length ? pending.map((p) => propItemHtml(p, "m")).join("") : `<p class="muted">대기 중인 제안이 없어요.</p>`}</div>
      ${done.length ? `<div class="sec-title">처리됨</div><div class="card flat">${done.map((p) => propItemHtml(p, "m")).join("")}</div>` : ""}`, { back: true });
  }
  function vMConfirm(id) {
    const b = DB.bookings.find((x) => x.id === id);
    if (!b || b.memberId !== DB.me.member) return vMHome();
    const s = slot(b.slotId); const c = cls(s.classId);
    if (b.status === "confirmed") {
      return shell("m", "수강 확인", `<div class="card" style="text-align:center;padding:32px 16px">
        <div style="font-size:40px">✅</div><b style="font-size:17px">확인 완료!</b>
        <p class="muted mt8">${slotDesc(s)}<br>수업권 1회가 차감됐어요.</p></div>
        ${disputeOpen(b) ? `<button class="btn danger-ghost" onclick="App.askDispute('${b.id}')">문제가 있어요 (이의제기 · ${DB.policy.disputeDays}일 내)</button>` : ""}
        <a class="btn ghost mt8" href="#/m/home">홈으로</a>`, { back: true });
    }
    if (b.status === "disputed") {
      return shell("m", "수강 확인", `<div class="card" style="text-align:center;padding:32px 16px">
        <div style="font-size:40px">⏳</div><b style="font-size:17px">이의제기 심사 중</b>
        <p class="muted mt8">${slotDesc(s)}<br>센터가 확인하고 있어요. 결과가 나오면 알려드릴게요.</p></div>
        <a class="btn ghost" href="#/m/bookings">내 예약으로</a>`, { back: true });
    }
    // S-1: 완료 보고(pending)가 실존하는 confirm_wait만 확인 가능 — 미래·대기·조율 회차 직접 진입 차단
    const rp = DB.reports.find((r) => r.bookingId === b.id && r.status === "pending");
    if (b.status !== "confirm_wait" || !rp) {
      return shell("m", "수강 확인", `<div class="card" style="text-align:center;padding:32px 16px">
        <div style="font-size:40px">🔒</div><b style="font-size:17px">아직 확인할 단계가 아니에요</b>
        <p class="muted mt8">${slotDesc(s)}<br>수업이 끝나고 선생님이 완료 보고를 하면<br>그때 수강 확인을 요청드려요.</p></div>
        <a class="btn ghost" href="#/m/bookings">내 예약으로</a>`, { back: true });
    }
    const auto = DB.policy.autoConfirmHours;
    return shell("m", "수강 확인", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div>
        <div class="divider"></div>
        <p style="font-size:15px">수업을 이상 없이 받으셨나요?<br><span class="muted small">확인하면 수업권 1회가 차감되고, 이 기록으로 선생님 수업료가 정산돼요.</span></p></div>
      <div class="banner"><span class="ic">🔒</span><span>확인은 <b>회원 본인 계정</b>에서만 가능해요 — 선생님·센터가 대신 확인할 수 없어요. ${auto ? `${auto}시간 안에 응답이 없으면 자동확정되며,` : `자동확정 없이 센터가 수동 처리하며,`} 문제가 있으면 ${DB.policy.disputeDays}일 안에 이의제기할 수 있어요.</span></div>
      <button class="btn primary" onclick="App.confirmAttend('${b.id}')">받았어요 (수업 확인)</button>
      <button class="btn danger-ghost mt8" onclick="App.askDispute('${b.id}')">문제가 있어요 (이의제기)</button>`, { back: true });
  }
  // v2.23 (형 확정 1안): 확인 대기 3건+에서 홈 요약 카드가 여는 목록 — 건별 «받았어요»만 제공.
  // 일괄 확인 버튼 금지: 확인=회차 차감·정산 증빙이라 한 건씩 의식하고 누르게 하는 설계 취지.
  function vMConfirms() {
    const list = myConfirmWait();
    const auto = DB.policy.autoConfirmHours;
    return shell("m", "수업 확인 요청", `
      ${list.length ? `<p class="muted" style="margin-bottom:12px">확인을 기다리는 수업이 <b>${list.length}건</b> 있어요. 확인하면 수업권 1회가 차감되니 한 건씩 확인해 주세요.</p>
      ${list.map((b) => {
        const s = slot(b.slotId); const c = cls(s.classId);
        return `<div class="card confirm-req">
        <div class="row"><span class="grow"><b style="font-size:15px">${c.title}</b></span><span class="badge b-rose">확인 대기</span></div>
        <div class="muted small mt4">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div>
        <div class="row mt12" style="gap:8px">
          <button class="btn primary grow" onclick="App.confirmAttend('${b.id}')">받았어요 (수업 확인)</button>
          <button class="btn ghost" style="flex:0 0 auto;width:auto;padding-left:16px;padding-right:16px" onclick="location.hash='#/m/confirm/${b.id}'">자세히</button>
        </div>
      </div>`;
      }).join("")}
      <div class="muted small mt8" style="text-align:center">${auto ? `무응답 시 보고 ${auto}시간 뒤 자동확정돼요` : "자동확정 없이 센터가 수동 처리해요"} · 확인은 내 계정에서만 가능해요</div>`
      : `<div class="card flat" style="text-align:center;padding:32px 16px">
        <div style="font-size:40px">✅</div><b style="font-size:17px">모두 확인했어요</b>
        <p class="muted mt8">확인을 기다리는 수업이 없어요.</p></div>
      <a class="btn ghost mt8" href="#/m/home">홈으로</a>`}`, { back: true });
  }
  function vMHistory() {
    const mine = DB.passes.filter((p) => p.memberId === DB.me.member);
    return shell("m", "이용 내역", `
      <p class="muted" style="margin-bottom:12px">수업권별 증감 기록이에요 — <b>어느 수업권에서 차감됐는지</b> 아래 수업권 이름 아래로 나뉘어 있어요. 기본 차감 순서는 <b>만료가 임박한 수업권</b>부터예요(예약할 때 직접 바꿀 수 있어요). 기록은 수정·삭제되지 않아요.</p>
      ${mine.map((p) => `<div class="sec-title">${p.name}${passState(p) !== "active" ? ` <span class="badge b-gray">${{ expired: "기간 만료", exhausted: "소진", frozen: "정지" }[passState(p)]}</span>` : ""}</div>
        <div class="card flat"><ul class="ledger">${DB.ledger.filter((l) => l.passId === p.id).slice().reverse().map((l) => `
          <li><span class="delta ${l.delta < 0 ? "minus" : "plus"}">${l.delta > 0 ? "+" + l.delta : l.delta}</span>
          <span class="grow"><b>${l.reason}</b><div class="muted small">${l.detail}</div></span>
          <span class="muted small">${l.at.slice(5, 16)}</span></li>`).join("")}</ul></div>`).join("")}`);
  }

  // ══ 선생님 ══
  function tSlots() { return DB.slots.filter((s) => s.status !== "canceled" && cls(s.classId).teacherId === DB.me.teacher); }
  function tPendingArrs() {
    const myClassIds = DB.classes.filter((c) => c.teacherId === DB.me.teacher).map((c) => c.id);
    return DB.arranges.filter((a) => myClassIds.includes(a.classId) && a.status === "pending");
  }
  function vTHome() {
    const today = tSlots().filter((s) => s.date === DB.TODAY).sort((a, b) => a.time.localeCompare(b.time));
    const pending = DB.reports.filter((r) => r.status === "pending").length;
    const arrs = tPendingArrs().length;
    return shell("t", "박코치 선생님", `
      <div class="stat-grid">
        <div class="stat"><div class="k">오늘 수업</div><div class="v">${today.length}<small>회</small></div></div>
        <div class="stat"><div class="k">확인 대기</div><div class="v">${pending}<small>건</small></div></div>
      </div>
      ${arrs ? `<button class="banner" onclick="location.hash='#/t/inbox'">${icb("mail")}<span>회원 조율 요청이 <b>${arrs}건</b> 기다리고 있어요. <u>확인하기</u></span></button>` : ""}
      ${pending ? `<button class="banner" onclick="location.hash='#/t/report'">${icb("clip")}<span>회원 확인을 기다리는 수업이 ${pending}건 있어요.</span></button>` : ""}
      <div class="sec-title">오늘 일정 · ${dlabel(DB.TODAY)}</div>
      <div class="card flat">${today.length ? today.map((s) => {
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${cls(s.classId).title}</span><div class="muted small">${attendeeNames(s.id).join(", ") || "참석자 없음"}</div></span>
          ${overlapBadge(s)}<button class="btn sm ghost" onclick="location.hash='#/t/slot/${s.id}'">상세</button></div>`;
      }).join("") : `<p class="muted">오늘 수업이 없어요.</p>`}</div>
      <a class="btn primary mt8" href="#/t/create">${ici("plus")}수업 만들기</a>
      <p class="muted small mt8" style="text-align:center">회원을 지정해 바로 확정하거나, 자리만 열어두고 신청을 받을 수 있어요.<br>수업 수정·폐강은 «일정» 탭의 «내 수업»에서 해요.</p>`);
  }
  let tSchedDay = null; // 주간 일정 선택 요일 — 화면 이탈 시 초기화(render)
  // v2.26 (형 확정 08-19): «내 수업 관리»를 일정 탭 하위 뷰로 흡수 — 수정·폐강은 여기서 수업을 눌러서 한다.
  let tSchedTab = "cal";
  function vTSchedSeg() {
    return `<div class="seg book-seg" id="ts-seg" role="tablist">
      <button role="tab" aria-selected="${tSchedTab === "cal"}" class="${tSchedTab === "cal" ? "on" : ""}" onclick="App.tsTab('cal')">주간 일정</button>
      <button role="tab" aria-selected="${tSchedTab === "classes"}" class="${tSchedTab === "classes" ? "on" : ""}" onclick="App.tsTab('classes')">내 수업</button>
    </div>`;
  }
  function vTSchedule() {
    if (tSchedTab === "classes") return shell("t", "일정", vTSchedSeg() + classListHtml("t"));
    const days = ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"];
    const sel = days.includes(tSchedDay) ? tSchedDay : (days.includes(DB.TODAY) ? DB.TODAY : days[0]);
    const list = tSlots().filter((s) => s.date === sel).sort((a, b) => a.time.localeCompare(b.time));
    return shell("t", "일정", vTSchedSeg() + `
      <div class="daystrip">${days.map((d) => {
        const dt = new Date(d + "T00:00:00+09:00");
        return `<button type="button" class="day${d === sel ? " on" : ""}" onclick="App.schedDay('${d}')"><div class="dw">${DOW[dt.getDay()]}</div><div class="dn">${dt.getDate()}</div></button>`;
      }).join("")}</div>
      <div class="card flat">${list.length ? list.map((s) => {
        const c = cls(s.classId);
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${c.title}</span><div class="muted small">${dlabel(s.date)} · ${c.schedule === "fixed" ? "고정" : "조율"} · ${seatCount(s.id)}명</div></span>
          ${overlapBadge(s)}<button class="btn sm ghost" onclick="location.hash='#/t/slot/${s.id}'">상세</button></div>`;
      }).join("") : `<p class="muted">${dlabel(sel)}에는 수업이 없어요.</p>`}</div>`);
  }
  // B4: 조율 요청 인박스
  function vTInbox() {
    const myClassIds = DB.classes.filter((c) => c.teacherId === DB.me.teacher).map((c) => c.id);
    const all = DB.arranges.filter((a) => myClassIds.includes(a.classId));
    const pending = all.filter((a) => a.status === "pending");
    const done = all.filter((a) => a.status !== "pending");
    const item = (a) => {
      const c = cls(a.classId);
      const st = { accepted: ["수락됨", "b-green"], declined: ["거절됨", "b-gray"], canceled: ["회원 취소", "b-gray"] }[a.status];
      return `<div class="tl-item"><span class="grow"><b>${memberName(a.memberId)}</b> · ${c.title}
        <div class="muted small mt4">${dlabel(a.date)} ${a.time} 희망${a.note ? ` · "${a.note}"` : ""}</div>
        <div class="muted small">${a.at} 요청</div>
        ${a.status === "pending" ? `<div class="btn-row">
          <button class="btn sm primary" onclick="App.arrangeAccept('${a.id}')">수락 (예약 확정)</button>
          <button class="btn sm ghost" onclick="App.arrangeDeclineAsk('${a.id}')">거절</button></div>`
        : `<div class="mt4"><span class="badge ${st[1]}">${st[0]}</span>${a.reason ? ` <span class="muted small">사유: ${a.reason}</span>` : ""}</div>`}
      </span></div>`;
    };
    // v2.22: 보낸 제안(선생님발 3종) — 받은 요청과 같은 인박스에서 상태 확인
    const sent = tSentProps();
    const sentPend = sent.filter((p) => propState(p) === "pending");
    const sentDone = sent.filter((p) => propState(p) !== "pending");
    return shell("t", "조율 인박스", `
      <p class="muted" style="margin-bottom:12px">수락해야 회차·예약이 만들어져요. 수락 전엔 일정에 잡히지 않아요.</p>
      <div class="sec-title">받은 조율 요청 · 대기 중 (${pending.length})</div>
      <div class="card flat">${pending.length ? pending.map(item).join("") : `<p class="muted">대기 중인 요청이 없어요.</p>`}</div>
      ${done.length ? `<div class="sec-title">받은 조율 요청 · 처리됨</div><div class="card flat">${done.map(item).join("")}</div>` : ""}
      <a class="btn primary mt8" href="#/t/propose">${ici("mail")}빈 시간 먼저 제안하기</a>
      <p class="muted small mt8" style="text-align:center">확정된 1:1 예약을 옮기고 싶을 땐 일정 → 수업 상세에서 «변경 제안»을 보내요. 그룹수업은 변경 제안 없이 취소로만 처리해요.</p>
      <div class="sec-title">보낸 제안 · 답변 대기 (${sentPend.length})</div>
      <div class="card flat">${sentPend.length ? sentPend.map((p) => propItemHtml(p, "t")).join("") : `<p class="muted">답변을 기다리는 제안이 없어요.</p>`}</div>
      ${sentDone.length ? `<div class="sec-title">보낸 제안 · 처리됨</div><div class="card flat">${sentDone.map((p) => propItemHtml(p, "t")).join("")}</div>` : ""}`);
  }
  // v2.22 ②: 빈 시간 먼저 제안 — 선생님이 빈 시간대+회원을 골라 새 예약을 역제안 (수락 시에만 예약 생성)
  function vTPropose() {
    const classes = DB.classes.filter((c) => c.teacherId === DB.me.teacher && c.status !== "closed");
    const members = quickMembers("t");
    return shell("t", "빈 시간 먼저 제안", `
      <p class="muted" style="margin-bottom:12px">내 빈 시간을 골라 회원에게 «이 시간 어때요?» 하고 새 수업을 먼저 제안해요. 회원이 수락해야 예약이 만들어져요.</p>
      <div class="card">
        <div class="field"><label>회원</label>
          ${pickerHtml("pp-member", { pool: members })}
          <div class="hint">수업권 자격은 제안을 보낼 때와 회원이 수락할 때 다시 확인해요.</div></div>
        <div class="field"><label>수업</label><select id="pp-class">${classes.map((c) => `<option value="${c.id}">${c.title}</option>`).join("")}</select></div>
        <div class="field"><label>날짜</label><input type="date" id="pp-date" value="2026-08-22" min="${DB.TODAY}"></div>
        <div class="field"><label>시간</label><input type="time" id="pp-time" value="15:00"></div>
        <div class="field"><label>메모 (선택 · 회원에게 전달)</label><input type="text" id="pp-note" placeholder="예: 이 시간이 비어 있어요. 어떠세요?"></div>
        <button class="btn primary" onclick="App.proposeSlot()">제안 보내기</button>
      </div>
      <div class="banner">${icb("mail")}<span>제안을 보내면 회원에게 바로 알림이 가요. 회원이 <b>수락하기 전엔 일정에 잡히지 않고</b>, 거절하거나 시간이 지나면 제안은 사라져요.</span></div>`, { back: true });
  }
  function vTSlot(id) {
    const s = slot(id);
    if (!s || s.status === "canceled") return vTHome();
    const c = cls(s.classId);
    const done = s.status === "done";
    const seats = seatBk(s.id);
    const unreported = DB.bookings.filter((b) => b.slotId === s.id && b.status === "booked");
    const w = waitBk(s.id);
    const ov = slotOverlaps(s);
    // v2.25 ①: 일정 변경 제안은 1:1 수업 전용 — 그룹은 진입점 자체를 만들지 않는다.
    const priv = isPrivateClass(c);
    return shell("t", "수업 상세", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${c.duration}분</div>
        <div class="mt8"><span class="badge ${done ? "b-gray" : "b-green"}">${done ? "종료" : "예정"}</span>
        <span class="badge ${priv ? "b-rose" : "b-blue"}">${priv ? "개인 1:1" : `그룹 · ${seats.length}/${c.capacity}명`}</span>${w.length ? `<span class="badge b-warn">대기 ${w.length}명</span>` : ""}${ov.length ? `<span class="badge b-danger">시간 겹침 ${ov.length}건</span>` : ""}</div></div>
      ${ov.length ? `<div class="banner warn">${icb("alert")}<span>같은 시간대에 <b>${ov.map((o) => `${o.time} ${cls(o.classId).title}`).join(", ")}</b> 수업이 함께 잡혀 있어요. 확인하고 진행해 주세요.</span></div>` : ""}
      <div class="sec-title">참석자</div>
      <div class="card flat">${seats.length ? seats.map((b) => {
        const bd = bkBadge(b);
        // v2.22 ①: 확정(예정) 좌석엔 일정 변경 제안 — 이미 답변 대기 중이면 중복 제안 대신 상태 표시
        // v2.25 ①: 1:1 수업에서만. 그룹은 버튼을 렌더하지 않고 액션 자체도 거부한다.
        const canPropose = priv && !done && s.status === "scheduled" && !isPast(s) && b.status === "booked";
        return `<div class="slot"><span class="grow"><b>${memberName(b.memberId)}</b></span><span class="badge ${bd.badge}">${bd.label}</span>
          ${canPropose ? (pendingChangeFor(b.id) ? `<span class="badge b-warn">변경 제안 답변 대기</span>` : `<button class="btn sm ghost" onclick="App.propChangeAsk('${b.id}')">변경 제안</button>`) : ""}</div>`;
      }).join("") : `<p class="muted">참석자가 없어요.</p>`}
      ${!priv && !done && s.status === "scheduled" && !isPast(s) ? `<p class="muted small mt8">그룹수업은 회차 일정을 개별 회원에게 변경 제안할 수 없어요. 못 오는 회원은 <b>회원이 직접 예약을 취소</b>하거나 <b>센터에서 예약 취소</b>로 처리해 주세요. 회차 전체를 옮겨야 하면 센터에 요청해 주세요.</p>` : ""}</div>
      ${done ? (unreported.length
        ? `<button class="btn primary" onclick="App.reportAsk('${s.id}')">수업 완료 보고 (${unreported.length}명)</button>
           <p class="muted small mt8" style="text-align:center">참석·노쇼를 회원별로 표시해 보고해요.<br>회원이 확인해야 횟수 차감·정산 대상이 돼요.</p>`
        : `<div class="banner"><span class="ic">⏳</span><span>완료 보고됨 — 회원 확인·처리를 기다리고 있어요. 확인되어야 정산에 들어가요.</span></div>`)
        : `<button class="btn ghost" disabled style="color:var(--text-disabled)">수업 종료 후 완료 보고할 수 있어요</button>`}`, { back: true });
  }
  // B3: «회원 지정해서 바로 확정» — 회원 필터(센터 정책), 기존 회차 합류, 과거 차단(S-2)
  function quickMembers(role) {
    let list = DB.members.filter((m) => !m.staff); // 선생님 계정은 수강 회원 목록에서 제외
    const scope = DB.policy.quickScope;
    if (scope === "valid") list = list.filter((m) => passesOf(m.id).some(passUsable));
    else if (scope === "mine" && role === "t") {
      const myClassIds = DB.classes.filter((c) => c.teacherId === DB.me.teacher).map((c) => c.id);
      const mySlotIds = DB.slots.filter((s) => myClassIds.includes(s.classId)).map((s) => s.id);
      list = list.filter((m) => DB.bookings.some((b) => b.memberId === m.id && mySlotIds.includes(b.slotId)));
    }
    // P2-2b: 선생님은 센터가 설정한 «지정 가능 회원 범위» 안의 회원만
    if (role === "t") list = list.filter((m) => inTScope(DB.me.teacher, m.id));
    return list;
  }
  // 형 지적 08-17: 지정 확정도 그룹수업은 정원 한도 내 복수 선택 (1:1만 1명 제한 + 안내)
  function qkLimitOf(c, slotSel) {
    if (!c) return { max: 0, msg: "수업을 먼저 선택해 주세요." };
    if (c.kind === "private" || c.capacity === 1)
      return { max: 1, one: true, msg: `«${c.title}»은 1:1 수업이라 회원을 1명만 선택할 수 있어요.` };
    if (slotSel && slotSel !== "new") {
      const remain = Math.max(0, c.capacity - seatCount(slotSel));
      return { max: remain, msg: `이 회차는 잔여 ${remain}석까지만 선택할 수 있어요 (정원 ${c.capacity}명).` };
    }
    return { max: c.capacity, msg: `그룹수업은 정원(${c.capacity}명)까지 선택할 수 있어요.` };
  }
  function qkLimit() {
    const cid = (document.getElementById("qk-class") || {}).value;
    return qkLimitOf(cid ? cls(cid) : null, (document.getElementById("qk-slot") || {}).value);
  }
  const qkHintHtml = (lim) => lim.one
    ? `${ici("info")}<b>${lim.msg}</b>`
    : `그룹수업은 정원 한도까지 복수 선택할 수 있어요 — 지금은 최대 <b>${lim.max}명</b>.`;
  // ── v2.26 (형 확정 08-19): «수업 만들기» 통합 화면 ──
  // 기존 [바로 확정] + [수업 개설] 두 진입점을 하나로 합쳤다. 둘 다 «수업을 만드는» 행위이고
  // 차이는 «회원을 누가 채우냐»(assign=선생님이 지정 / open=회원이 신청) 하나뿐이라서다.
  // 폼 상태를 모듈 변수(ccUI)에 두는 이유: 모드 전환이 재렌더로 반영돼야 «초기 렌더부터 모드별 노출»이
  // 보장된다 — DOM style 토글만 쓰면 v2.6에서 고쳤던 «초기 렌더 미적용» 버그가 재발한다.
  let ccUI = null;
  const ccClasses = (role) => (role === "t" ? DB.classes.filter((c) => c.teacherId === DB.me.teacher) : DB.classes).filter((c) => c.status !== "closed");
  function ccState(role) {
    if (!ccUI || ccUI.role !== role) {
      const list = ccClasses(role);
      const first = list[0] || null;
      ccUI = { role, fill: "assign", classId: first ? first.id : "new", slotSel: "new",
        date: "2026-08-22", time: "11:00", title: "", teacherId: (DB.teachers[0] || {}).id,
        kind: "group", cap: "6", sched: "fixed", elig: first ? first.eligibility : "pass" };
    }
    return ccUI;
  }
  // 재렌더 전에 현재 입력값을 상태로 회수 — 모드를 바꿔도 입력한 값이 날아가지 않게
  function ccSync() {
    if (!ccUI) return;
    const val = (id) => { const el = document.getElementById(id); return el ? el.value : undefined; };
    const seg = (sel) => { const el = document.querySelector(sel); return el ? el.dataset.v : undefined; };
    const set = (k, v) => { if (v !== undefined) ccUI[k] = v; };
    set("date", val("qk-date")); set("time", val("qk-time")); set("slotSel", val("qk-slot"));
    set("title", val("nc-title")); set("teacherId", val("nc-teacher")); set("cap", val("nc-cap"));
    set("kind", seg("#nc-kind .on")); set("sched", seg("#nc-sched .on")); set("elig", seg("#nc-elig .on"));
  }
  // 폼이 «지금 만들려는 수업»의 정원·1:1 여부 — 아직 DB에 없는 새 수업도 같은 규칙으로 한도를 계산한다
  function ccDraftClass(role) {
    const U = ccState(role);
    const c = U.classId === "new" ? null : cls(U.classId);
    if (c) return c;
    const kind = U.kind;
    return { id: null, title: (U.title || "").trim() || "새 수업", kind,
      capacity: kind === "private" ? 1 : Math.max(1, parseInt(U.cap, 10) || 6) };
  }
  function ccLimit() {
    if (!ccUI) return qkLimit();
    return qkLimitOf(ccDraftClass(ccUI.role), ccUI.classId === "new" ? "new" : ccUI.slotSel);
  }
  function vCreate(role) {
    const r = role === "c" ? "c" : "t";
    const U = ccState(r);
    const me = r === "t" ? teacher(DB.me.teacher) : null;
    const auth = r === "t" ? classAuth(me) : { ok: true, via: "센터 관리자" };
    const classes = ccClasses(r);
    // 권한 없는 선생님도 «이미 있는 내 수업»에는 회차를 만들 수 있다(통합 전 «바로 확정»과 동일 권한). 새 수업 개설만 P2-2로 막는다.
    const isNew = U.classId === "new" || !cls(U.classId);
    const c = isNew ? null : cls(U.classId);
    if (isNew && !auth.ok) {
      return shell(r, "수업 만들기", `
        <div class="banner warn">${icb("lock")}<span><b>새 수업을 만들 권한이 없어요.</b> 센터관리자의 지정을 받거나 자격 멤버십(예: 그룹 필라테스)을 보유해야 해요.${classes.length ? " 이미 있는 내 수업에는 회차를 만들 수 있어요." : ""}</span></div>
        ${classes.length ? `<button class="btn primary" onclick="App.ccClass('${r}','${classes[0].id}')">내 수업으로 만들기</button>` : ""}`, { back: true });
    }
    const draft = ccDraftClass(r);
    const lim = ccLimit();
    const scopeLabel = { valid: "유효 수업권 보유자만", all: "전체 회원", mine: "담당 회원만" }[DB.policy.quickScope];
    const scoped = r === "t" && tScope(DB.me.teacher).mode === "custom";
    const joinable = c ? DB.slots.filter((x) => x.classId === c.id && x.status === "scheduled" && !isPast(x) && seatCount(x.id) < c.capacity) : [];
    const opt = (v, label, on) => `<option value="${v}"${on ? " selected" : ""}>${label}</option>`;
    const fillOpt = (v, title, desc) => `<button type="button" class="fill-opt${U.fill === v ? " on" : ""}" role="radio" aria-checked="${U.fill === v}" data-v="${v}" onclick="App.ccFill('${r}','${v}')">
      <span class="fo-dot" aria-hidden="true"></span><span class="grow"><b>${title}</b><span class="fo-d">${desc}</span></span></button>`;
    return shell(r, "수업 만들기", `
      <p class="muted" style="margin-bottom:12px">수업을 하나 만들어요. <b>회원을 지정해 바로 확정</b>하거나, <b>자리만 열어두고 신청</b>을 받을 수 있어요. 지난 일시로는 만들 수 없어요.</p>
      ${r === "t" && !auth.ok ? `<div class="banner warn">${icb("lock")}<span>새 수업을 만들 권한이 없어서 <b>이미 있는 내 수업</b>만 고를 수 있어요.</span></div>` : ""}
      <div class="card">
        <div class="field"><label>수업 종류</label>
          <select id="qk-class" onchange="App.ccClass('${r}', this.value)">
            ${classes.map((x) => opt(x.id, `${x.title} · ${x.kind === "private" ? "개인 1:1" : `그룹 ${x.capacity}명`}`, x.id === U.classId)).join("")}
            ${auth.ok ? opt("new", "＋ 새 수업 만들기", isNew) : ""}
          </select>
          ${c ? `<div class="hint">${teacher(c.teacherId).name} 선생님 · ${c.scheduleLabel} · ${eligLabel(c)}</div>`
              : `<div class="hint">새 수업을 만들면서 첫 회차까지 한 번에 만들어요.</div>`}</div>
        ${isNew ? `
        <div class="field"><label>수업명</label><input type="text" id="nc-title" value="${(U.title || "").replaceAll('"', "&quot;")}" placeholder="예: 저녁 요가 클래스"></div>
        ${r === "t" ? `<div class="field"><label>담당 선생님</label><input type="text" value="${me.name} (본인)" disabled><div class="hint">선생님이 만든 수업은 본인 담당으로 만들어져요.</div></div>`
          : `<div class="field"><label>담당 선생님</label><select id="nc-teacher">${DB.teachers.map((t) => opt(t.id, `${t.name} (${t.subject})`, t.id === U.teacherId)).join("")}</select></div>`}
        <div class="field"><label>종류</label><div class="seg" id="nc-kind">
          <button class="${U.kind === "group" ? "on" : ""}" data-v="group" onclick="App.ccSeg('${r}',this,'kind')">그룹 (다인)</button>
          <button class="${U.kind === "private" ? "on" : ""}" data-v="private" onclick="App.ccSeg('${r}',this,'kind')">개인 (1:1)</button></div></div>
        ${U.kind === "group" ? `<div class="field"><label>정원</label><input type="number" id="nc-cap" value="${U.cap}" min="1"></div>` : ""}
        <div class="field"><label>일정 방식</label><div class="seg" id="nc-sched">
          <button class="${U.sched === "fixed" ? "on" : ""}" data-v="fixed" onclick="App.ccSeg('${r}',this,'sched')">매주 고정</button>
          <button class="${U.sched === "arranged" ? "on" : ""}" data-v="arranged" onclick="App.ccSeg('${r}',this,'sched')">선생님과 조율</button></div>
          <div class="hint">보통 그룹=고정, 개인=조율이지만 자유롭게 선택할 수 있어요.</div></div>` : ""}
        ${U.fill === "assign" && c ? `<div class="field"><label>회차</label><select id="qk-slot" onchange="App.ccSlot('${r}', this.value)">
          ${opt("new", "새 일시로 만들기", U.slotSel === "new")}
          ${joinable.map((x) => opt(x.id, `${dlabel(x.date)} ${x.time} 기존 회차 합류 (${seatCount(x.id)}/${c.capacity}명)`, x.id === U.slotSel)).join("")}</select>
          <div class="hint">기존 회차를 고르면 아래 날짜·시간은 무시돼요.</div></div>` : ""}
        <div class="field"><label>날짜</label><input type="date" id="qk-date" value="${U.date}" min="${DB.TODAY}"></div>
        <div class="field"><label>시간</label><input type="time" id="qk-time" value="${U.time}"></div>
      </div>
      <div class="sec-title">회원을 어떻게 채울까요?</div>
      <div class="card">
        <div class="fill-opts" role="radiogroup" aria-label="회원을 어떻게 채울까요?" id="cc-fill">
          ${fillOpt("assign", "회원 지정해서 바로 확정", "회원을 골라 예약을 확정해요. 확정하면 회원에게 바로 알림이 가요.")}
          ${fillOpt("open", "자리 열어두고 신청 받기", "자리만 열어둬요. 회원이 «수업 예약»에서 신청하면 자리가 채워져요.")}
        </div>
        <div class="divider"></div>
        ${U.fill === "assign" ? `
        <div class="field"><label>회원 <span class="badge b-gray">${scopeLabel} · 센터 정책</span>${scoped ? ' <span class="badge b-rose">내 지정범위 적용</span>' : ""}</label>
          ${pickerHtml("qk-member", { multi: true, pool: quickMembers(r), limit: ccLimit })}
          <div class="hint" id="qk-cap-hint">${qkHintHtml(lim)}</div>
          <div class="hint">회원 목록은 니짐내짐(호스트 앱)의 회원 명단을 가져와요 — 프로토타입은 더미 데이터예요. 표시 범위는 센터 설정에서 바꿔요.${scoped ? ` 센터가 설정한 내 «지정 가능 회원 범위»(${tScopeLabel(DB.me.teacher)})가 함께 적용돼요.` : ""}</div></div>
        <button class="btn primary" onclick="App.ccSubmit('${r}')">${isNew ? "수업 만들고 바로 확정" : "바로 예약 확정"}</button>` : `
        <div class="field"><label>예약 가능 회원</label><div class="seg" id="nc-elig">
          <button class="${U.elig === "pass" ? "on" : ""}" data-v="pass" onclick="App.ccSeg('${r}',this,'elig')">수업권 보유자</button>
          <button class="${U.elig === "list" ? "on" : ""}" data-v="list" onclick="App.ccSeg('${r}',this,'elig')">회원 지정</button>
          <button class="${U.elig === "both" ? "on" : ""}" data-v="both" onclick="App.ccSeg('${r}',this,'elig')">혼합</button></div>
          <div class="hint">그룹수업도 특정 회원만 지정할 수 있어요.${c ? ` 이 설정을 바꾸면 «${c.title}» 수업 전체에 적용돼요.` : ""}</div></div>
        ${eligExtraHtml("nc", c, r, U.elig)}
        <button class="btn primary" onclick="App.ccSubmit('${r}')">${isNew ? "수업 만들고 자리 열기" : "자리 열고 신청 받기"}</button>`}
      </div>
      ${U.fill === "assign"
        ? `<div class="banner">${icb("bell")}<span>확정하면 회원에게 바로 알림이 가요. 회원 몰래 만드는 예약은 불가능해요. 수업권 자격도 함께 검증하고, 선택한 회원 <b>전원</b>이 가능할 때만 확정돼요. 같은 선생님 시간이 겹치면 확인 후 진행할 수 있어요.</span></div>`
        : `<div class="banner">${icb("calCheck")}<span>자리를 열어두면 «예약 가능 회원» 조건에 맞는 회원이 «수업 예약»에서 신청할 수 있어요. 신청이 들어오면 좌석이 바로 채워지고, 정원이 차면 마감돼요.</span></div>`}`, { back: true });
  }
  // 새 수업 객체를 «만들기만» 한다 — DB.classes push는 회차·예약 검증까지 통과한 뒤(ccAssign/ccOpen)에.
  // 중간에 실패해도 유령 수업이 남지 않게 하려는 것.
  function ccBuildClass(role) {
    const U = ccUI;
    if (role === "t" && !classAuth(teacher(DB.me.teacher)).ok) { toast("새 수업을 만들 권한이 없어요 — 센터 지정 또는 자격 멤버십이 필요해요."); return null; }
    const teacherId = role === "t" ? DB.me.teacher : (U.teacherId || DB.teachers[0].id);
    const kind = U.kind;
    const capacity = kind === "private" ? 1 : Math.max(1, parseInt(U.cap, 10) || 6);
    // «회원 지정해서 바로 확정»으로 만드는 수업은 고른 회원이 곧 예약 자격 — 별도 자격 설정을 묻지 않는다
    const elig = U.fill === "assign" ? "list" : U.elig;
    const prodIds = U.fill === "assign" ? [] : [...document.querySelectorAll("#nc-prods .chip.on")].map((b) => b.dataset.v);
    const memIds = U.fill === "assign" ? pkSelected("qk-member") : pkSelected("nc-mems");
    if (elig !== "pass" && !memIds.length) { toast(U.fill === "assign" ? "회원을 검색해 선택해 주세요." : "지정 회원을 1명 이상 선택해 주세요."); return null; }
    if (elig !== "list" && !prodIds.length) { toast("사용 가능한 수업권을 1개 이상 선택해 주세요."); return null; }
    // P2-2b 재검증: 선생님은 «지정 가능 회원 범위» 안의 회원만 (UI 필터만으론 부족 — 04 원칙)
    if (role === "t" && elig !== "pass") {
      const bad = memIds.filter((mid) => !inTScope(DB.me.teacher, mid));
      if (bad.length) { toast(`내 «지정 가능 회원 범위» 밖 회원이에요: ${bad.map(memberName).join(", ")} — 센터에 범위 확대를 요청해 주세요.`); return null; }
    }
    return { id: nid("c"), title: (U.title || "").trim() || "새 수업", teacherId, kind, capacity,
      schedule: U.sched, scheduleLabel: U.sched === "fixed" ? "매주 고정 (시간표 설정)" : "선생님과 조율", duration: 50,
      eligibility: elig, eligibleProductIds: elig === "list" ? [] : prodIds, memberIds: elig === "pass" ? [] : memIds, status: "active" };
  }
  const ccPastAsk = () => modal(`<h3>지난 일시로는 만들 수 없어요</h3><p>수업은 앞으로의 일시로만 만들 수 있어요. 지난 수업 처리(보고 누락 등)는 센터 관리자에게 사유와 함께 요청해 주세요 — 모든 예외 처리는 감사 기록에 남아요.</p>
    <div class="btn-row"><button class="btn primary" onclick="App.closeModal()">확인</button></div>`);
  function ccDone(role, msg) {
    delete pickers["qk-member"]; delete pickers["nc-mems"];
    ccUI = null;
    closeModal(true);
    toast(msg);
    location.hash = role === "c" ? "#/c/bookings" : "#/t/schedule";
  }
  // «회원 지정해서 바로 확정» — 통합 전 «바로 확정»과 동일 규칙: 자격은 회원별 검증, 전원 통과해야 확정(부분 확정 없음)
  function ccAssign(role, c, isNew) {
    const U = ccUI;
    const mids = pkSelected("qk-member");
    if (!mids.length) { toast("회원을 검색해 선택해 주세요."); return; }
    const joinId = !isNew && U.slotSel && U.slotSel !== "new" ? U.slotSel : null;
    const lim = qkLimitOf(c, joinId || "new");
    if (mids.length > lim.max) { toast(lim.msg); return; }
    const errs = [];
    const passOf = {};
    for (const mid of mids) {
      const m = member(mid);
      if (role === "t" && !inTScope(DB.me.teacher, mid)) { errs.push(`<b>${m.name}</b>: 내 «지정 가능 회원 범위» 밖이에요 — 센터에 범위 확대를 요청해 주세요.`); continue; }
      const g = bookGuard(c, mid);
      if (!g.ok) { errs.push(`<b>${m.name}</b>: ${g.msg}`); continue; }
      passOf[mid] = g.pass;
    }
    let sl = null, d, t;
    if (joinId) {
      sl = slot(joinId);
      if (seatCount(sl.id) + mids.length > c.capacity) errs.push(`정원 초과: 잔여 ${Math.max(0, c.capacity - seatCount(sl.id))}석인데 ${mids.length}명을 선택했어요.`);
      for (const mid of mids) if (DB.bookings.some((b) => b.slotId === sl.id && b.memberId === mid && ACTIVE.includes(b.status))) errs.push(`<b>${memberName(mid)}</b>: 이미 이 회차에 예약이 있어요.`);
    } else {
      d = U.date || "2026-08-22";
      t = U.time || "11:00";
      if (new Date(`${d}T${t}:00+09:00`) <= NOW) { ccPastAsk(); return; }
    }
    if (errs.length) {
      modal(`<h3>예약할 수 없어요</h3><p>선택 인원 전원이 가능해야 확정돼요 — 부분 확정은 하지 않아요.</p>
        <p class="mt8">${errs.join("<br>")}</p>
        <div class="btn-row"><button class="btn primary" onclick="App.closeModal()">확인</button></div>`);
      return;
    }
    const finish = () => {
      if (isNew) DB.classes.push(c);
      if (!sl) { sl = { id: nid("s"), classId: c.id, date: d, time: t, status: "scheduled", adhoc: true }; DB.slots.push(sl); }
      for (const mid of mids) DB.bookings.push({ id: nid("bk"), slotId: sl.id, memberId: mid, passId: passOf[mid].id, status: "booked", policySnap: snapPolicy() });
      const who = mids.length === 1 ? `${memberName(mids[0])} 회원` : `${memberName(mids[0])} 외 ${mids.length - 1}명`;
      ccDone(role, `${who} ${dlabel(sl.date)} ${sl.time} 예약 확정! 회원에게 알림을 보냈어요.`);
    };
    // v2.25 ②: 새 회차를 만들 때만 겹침 검사 — 기존 회차 합류는 이미 잡힌 시간이라 새 겹침이 안 생긴다.
    const hits = sl ? [] : overlapSlots(c.teacherId, d, t, c.duration, []);
    if (hits.length) { overlapAsk(hits, finish); return; }
    finish();
  }
  // «자리 열어두고 신청 받기» — 회차만 열고 좌석은 비워 둔다. 회원이 «수업 예약»에서 신청하면 채워진다.
  function ccOpen(role, c, isNew) {
    const U = ccUI;
    const d = U.date || "2026-08-22";
    const t = U.time || "11:00";
    if (new Date(`${d}T${t}:00+09:00`) <= NOW) { ccPastAsk(); return; }
    const elig = U.elig;
    const prodIds = [...document.querySelectorAll("#nc-prods .chip.on")].map((b) => b.dataset.v);
    const memIds = pkSelected("nc-mems");
    if (!isNew) {
      if (elig !== "pass" && !memIds.length) { toast("지정 회원을 1명 이상 선택해 주세요."); return; }
      if (elig !== "list" && !prodIds.length) { toast("사용 가능한 수업권을 1개 이상 선택해 주세요."); return; }
      // P2-2b 재검증: 신규 추가만 범위 검사 (기존 지정 회원은 소급 없이 유지 — updateClass와 같은 규칙)
      if (role === "t" && elig !== "pass") {
        const bad = memIds.filter((mid) => !inTScope(DB.me.teacher, mid) && !(c.memberIds || []).includes(mid));
        if (bad.length) { toast(`내 «지정 가능 회원 범위» 밖 회원이에요: ${bad.map(memberName).join(", ")} — 센터에 범위 확대를 요청해 주세요.`); return; }
      }
      if (DB.slots.some((x) => x.classId === c.id && x.date === d && x.time === t && x.status !== "canceled")) {
        toast("같은 수업의 같은 일시에 이미 회차가 있어요."); return;
      }
    }
    const finish = () => {
      if (isNew) DB.classes.push(c);
      else { c.eligibility = elig; c.eligibleProductIds = elig === "list" ? [] : prodIds; c.memberIds = elig === "pass" ? [] : memIds; }
      DB.slots.push({ id: nid("s"), classId: c.id, date: d, time: t, status: "scheduled", adhoc: true });
      ccDone(role, `«${c.title}» ${dlabel(d)} ${t} 자리를 열었어요. 조건에 맞는 회원이 «수업 예약»에서 신청할 수 있어요.`);
    };
    const hits = overlapSlots(c.teacherId, d, t, c.duration || 50, []);
    if (hits.length) { overlapAsk(hits, finish); return; }
    finish();
  }
  function vTReport() {
    const auto = DB.policy.autoConfirmHours;
    return shell("t", "완료 보고 현황", `
      <p class="muted" style="margin-bottom:12px">회원이 확인한 수업만 정산에 들어가요. 확인은 회원 본인 폰에서만 가능하고, 현장에선 일회용 QR로 바로 확인받을 수 있어요.</p>
      <div class="card flat">${DB.reports.map((r) => `
        <div class="tl-item"><span class="grow"><b>${r.member}</b> <span class="badge ${RP_BADGE[r.status] || "b-gray"}">${r.label}</span>
          <div class="muted small mt4">${r.slotId ? slotDesc(slot(r.slotId)) : r.desc}</div>
          <div class="muted small">${r.at}${r.method ? ` · ${r.method}` : ""}</div>
          ${r.status === "pending" ? `<div class="muted small">회원 폰으로 확인 요청이 갔어요 · ${auto ? `무응답 시 보고 ${auto}시간 뒤 자동확정 예정` : "자동확정 없음 — 센터 수동 처리"}</div>` : ""}
          ${r.status === "pending" && DB.policy.methodQr ? `<div class="btn-row"><button class="btn sm ghost" onclick="App.qrStart('${r.id}')">현장 QR 확인 (회원 폰 스캔)</button></div>` : ""}
        </span></div>`).join("")}</div>`);
  }
  // ── v2.9: 회차별 단가 명세 (형 지적 08-18 — 회원별·등록시기별 단가 차이를 화면에서 확인) ──
  // 단가 = 수업권 구매 시점 스냅샷(unitPrice=floor(실구매가÷총횟수), 05 문서). 단가가 섞이면 그룹으로 구분 표시.
  function unitGroups(lines) {
    const g = new Map();
    lines.forEach((l) => { const a = g.get(l.unitPrice); a ? a.push(l) : g.set(l.unitPrice, [l]); });
    return [...g.entries()].sort((a, b) => b[0] - a[0]);
  }
  // 할인 여부는 라인의 pass 스냅샷(listPrice)로 판정 — 현재 상품가와 무관 (소급 금지 원칙)
  function lineDisc(l) {
    const p = l.passId ? pass(l.passId) : null;
    return p && p.listPrice != null && l.unitPrice < Math.floor(p.listPrice / p.total);
  }
  const lineRowHtml = (l) => `<div class="pd-row"><span class="grow"><b>${l.member}</b> <span class="muted small">${l.desc}</span>
      <div class="muted small">${l.passName || "수업권"}${lineDisc(l) ? ' · <span class="pd-disc">할인 구매</span>' : ""} · ${l.method}${l.status === "held" ? " · 이의 심사 중" : ""}</div></span>
    <span class="pd-price">${won(l.unitPrice)}</span></div>`;
  function linesDetailHtml(elig, held) {
    if (!elig.length && !(held || []).length) return "";
    const groups = unitGroups(elig);
    return `<details class="pd"><summary>회차별 단가 명세 · ${elig.length}회${groups.length > 1 ? ` <span class="badge b-rose">단가 ${groups.length}종</span>` : ""}</summary>
      <div class="pd-note">회당 단가는 각 회원이 <b>구매한 시점의 가격</b>(실구매가÷총횟수) 기준이에요 — 같은 상품이라도 등록 시기·할인에 따라 달라요.</div>
      ${groups.map(([u, ls]) => `<div class="pd-group"><div class="pd-ghead">회당 <b>${won(u)}</b> × ${ls.length}회 = <b>${won(u * ls.length)}</b></div>${ls.map(lineRowHtml).join("")}</div>`).join("")}
      ${(held || []).length ? `<div class="pd-group"><div class="pd-ghead pd-held">이의 심사 중 ${held.length}건 — 집계·전송에서 빠져요</div>${held.map(lineRowHtml).join("")}</div>` : ""}
    </details>`;
  }
  function vTEarnings() {
    const lines = DB.slines.filter((l) => l.teacherId === DB.me.teacher);
    const elig = lines.filter((l) => l.status === "eligible");
    const held = lines.filter((l) => l.status === "held");
    const auto = elig.filter((l) => l.auto).length;
    const amount = elig.reduce((a, l) => a + l.unitPrice, 0);
    const ns = noshowFinals(DB.me.teacher);
    const nsAmt = rewardOn() ? ns.reduce((a, r) => a + noshowAmt(r), 0) : 0;
    return shell("t", "내 정산", `
      <div class="card"><div class="muted small">2026년 8월 · 수강확인 완료분</div>
        <div class="big mt4">${won(amount + nsAmt)}</div>
        <div class="muted small mt4">확정 ${elig.length}회 × 회당 단가 (수업권 구매가 기준)${nsAmt ? ` + 노쇼 보상` : ""}</div>
        <div class="divider"></div>
        <div class="row" style="justify-content:space-between"><span class="muted">앱·QR 확인</span><b>${elig.length - auto}회</b></div>
        <div class="row mt8" style="justify-content:space-between"><span class="muted">자동확정</span><b>${auto}회 ${auto ? '<span class="badge b-warn">검토 대상</span>' : ""}</b></div>
        ${rewardOn() && ns.length ? `<div class="row mt8" style="justify-content:space-between"><span class="muted">노쇼 보상 (센터 정책)</span><b>${ns.length}건 · ${won(nsAmt)}</b></div>` : ""}
        ${held.length ? `<div class="row mt8" style="justify-content:space-between"><span class="muted">이의 심사 중 (보류)</span><b>${held.length}회 <span class="badge b-danger">정산 제외 중</span></b></div>` : ""}
        ${linesDetailHtml(elig, held)}
      </div>
      <div class="banner">${icb("info")}<span>여기는 <b>정산 대상 금액</b>까지만 보여요. 배분율·공제·실지급액은 급여 시스템(샐리)에서 계산돼요.</span></div>`);
  }

  // ══ 센터 ══
  // 04 원칙: 무이의 자동확정된 노쇼도 "무응답 자동확정" 계열로 비율 경고에 포함 (형 확정 08-17)
  function autoStats(teacherId) {
    const lines = DB.slines.filter((l) => l.teacherId === teacherId && l.status !== "removed");
    const ns = noshowFinals(teacherId);
    const auto = lines.filter((l) => l.auto).length + ns.filter((r) => r.autoFinal).length;
    const total = lines.length + ns.length;
    return { auto, total, rate: total ? Math.round((auto / total) * 100) : 0 };
  }
  function vCHome() {
    const todaySlots = DB.slots.filter((s) => s.date === DB.TODAY && s.status !== "canceled");
    const disputes = DB.reports.filter((r) => r.status === "disputed").length;
    const pending = DB.reports.filter((r) => r.status === "pending").length;
    const arrs = DB.arranges.filter((a) => a.status === "pending").length;
    const weekSlots = DB.slots.filter((s) => s.status === "scheduled");
    const capSum = weekSlots.reduce((a, s) => a + cls(s.classId).capacity, 0);
    const seatSum = weekSlots.reduce((a, s) => a + seatCount(s.id), 0);
    const rate = capSum ? Math.round((seatSum / capSum) * 100) : 0;
    // 하-2: 자동확정 경고는 기능이 켜져 있고 임계 초과일 때만
    const warns = DB.policy.autoConfirmHours > 0
      ? DB.teachers.map((t) => ({ t, ...autoStats(t.id) })).filter((x) => x.total && x.rate >= DB.policy.autoWarnRate) : [];
    // v2.25 ②: 겹쳐서 강행한 회차는 센터도 한눈에 — 예정 회차만 집계
    const ovDays = DB.slots.filter((s) => s.status === "scheduled" && !isPast(s) && slotOverlaps(s).length);
    return shell("c", DB.center.name, `
      <div class="stat-grid">
        <div class="stat"><div class="k">오늘 수업</div><div class="v">${todaySlots.length}<small>회</small></div></div>
        <div class="stat"><div class="k">예약률 (예정 회차)</div><div class="v">${rate}<small>%</small></div></div>
        <div class="stat"><div class="k">확인 대기</div><div class="v">${pending}<small>건</small></div></div>
        <div class="stat"><div class="k">이의제기</div><div class="v" style="color:var(--danger)">${disputes}<small>건</small></div></div>
      </div>
      ${disputes ? `<button class="banner warn" onclick="location.hash='#/c/confirms'">${icb("alert")}<span>처리할 이의제기가 ${disputes}건 있어요. 해당 회차 정산은 보류 중이에요.</span></button>` : ""}
      ${arrs ? `<button class="banner" onclick="location.hash='#/c/bookings'">${icb("mail")}<span>선생님 확인 대기 중인 조율 요청 ${arrs}건.</span></button>` : ""}
      ${ovDays.length ? `<button class="banner warn" onclick="location.hash='#/c/bookings'">${icb("clock")}<span>선생님 시간이 겹치는 회차가 <b>${ovDays.length}건</b> 있어요. 예약 현황에서 확인해 주세요.</span></button>` : ""}
      ${warns.map((x) => `<button class="banner warn" onclick="location.hash='#/c/confirms'">${icb("clock")}<span>${x.t.name} 선생님 자동확정 비율 <b>${x.rate}%</b> — 임계(${DB.policy.autoWarnRate}%) 초과. 검토를 권장해요.</span></button>`).join("")}
      <div class="sec-title">바로가기</div>
      <div class="stat-grid">
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/create'"><div class="k">수업</div><div class="v" style="font-size:15px">${ici("plus")}수업 만들기</div></button>
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/confirms'"><div class="k">수강확인</div><div class="v" style="font-size:15px">${ici("clip")}수강확인 관리</div></button>
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/products'"><div class="k">판매</div><div class="v" style="font-size:15px">${ici("ticket")}수업상품 관리</div></button>
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/settlement'"><div class="k">월말</div><div class="v" style="font-size:15px">${ici("won")}정산·샐리 전송</div></button>
      </div>`);
  }
  // v2.9: 실구매가 → 회당 단가 스냅샷 미리보기 문구 (판매·등록 폼과 App.sellPreview가 공유)
  function sellUnitText(p, price) {
    const unit = Math.floor((price || 0) / p.sessions);
    const listUnit = Math.floor(p.price / p.sessions);
    return `회당 단가 = ${won(price || 0)} ÷ ${p.sessions}회 = <b>${won(unit)}</b>${price && price < p.price
      ? ` <span style="color:var(--link);font-weight:700">· 할인 등록 (정가 회당 ${won(listUnit)})</span>` : " (정가 등록)"}
      — 이후 상품 가격을 바꿔도 이 수업권의 단가는 그대로 유지돼요.`;
  }
  function vCProducts() {
    const p0 = DB.products[0];
    return shell("c", "수업상품 관리", `
      ${DB.products.map((p) => `<div class="card"><div class="row"><span class="grow"><b>${p.name}</b>
        <div class="muted small mt4">${p.kind === "private" ? "개인" : "그룹"} · ${p.sessions}회 · ${p.validityDays ? p.validityDays + "일" : "기간 제한 없음"}</div></span>
        <b>${won(p.price)}</b></div></div>`).join("")}
      <div class="sec-title">수업권 판매·등록</div>
      <div class="card">
        <div class="field"><label>회원</label>${pickerHtml("sell-mem", { multi: false, pool: DB.members.filter((m) => !m.staff) })}</div>
        <div class="field"><label>상품</label><select id="sell-prod" onchange="App.sellProd(this.value)">
          ${DB.products.map((p) => `<option value="${p.id}">${p.name} · 정가 ${won(p.price)}</option>`).join("")}</select></div>
        <div class="field"><label>실구매가 (원)</label><input type="number" id="sell-price" min="0" value="${p0.price}" oninput="App.sellPreview()">
          <div class="hint" id="sell-unit">${sellUnitText(p0, p0.price)}</div></div>
        <button class="btn primary" onclick="App.sellPass()">수업권 등록</button>
        <p class="muted small mt8">기본값은 정가예요. 프로모션·재등록 할인 등으로 실구매가가 다르면 그 금액을 입력해 주세요 —
          <b>회당 단가는 실구매가 ÷ 총횟수</b>(원 단위 버림)로 계산돼 구매 시점 기준으로 저장되고, 정산도 이 단가로 집계돼요.</p>
      </div>
      <div class="sec-title">새 상품 개설</div>
      <div class="card">
        <div class="field"><label>상품명</label><input type="text" id="np-name" placeholder="예: 필라테스 그룹 30회"></div>
        <div class="field"><label>수업 종류</label><div class="seg" id="np-kind">
          <button class="on" data-v="group" onclick="App.seg(this)">그룹수업</button>
          <button data-v="private" onclick="App.seg(this)">개인수업</button></div></div>
        <div class="field"><label>횟수 / 가격</label><div class="row">
          <input type="number" id="np-sessions" value="10" style="width:100%"><input type="number" id="np-price" value="500000" style="width:100%"></div></div>
        <div class="field"><label>유효기간 (일)</label><input type="number" id="np-days" value="90">
          <label class="check mt8"><input type="checkbox" id="np-nodays"> 유효기간 없음 — 횟수 소진 시까지</label>
          <div class="hint">기간 없이 횟수만으로 운영하는 센터 방식도 지원해요.</div></div>
        <button class="btn primary" onclick="App.createProduct()">상품 개설</button>
      </div>
      <p class="muted small">이미 판매된 수업권은 구매한 시점의 조건 그대로 보존돼요. 환불·이용정지 처리는 호스트 앱(CRM) 결제·회원 관리와 연동돼요.</p>`, { back: true });
  }
  // ── v2.4: 대규모 회원 «검색 기반 선택» 공통 컴포넌트 (형 지적 08-17: 수천 명 센터 — 칩 전체 나열 금지) ──
  // 사용처: 수업 만들기·수정 «지정 회원»(nc-mems/ec-mems), «바로 확정» 회원(qk-member), P2-2b 개별 회원(scope-*).
  // 상태: pickers[id] — 같은 해시(화면) 안에서만 유지, 화면 이동 시 초기화. 결과는 PK_PAGE씩 점진 로딩(전체 렌더 금지).
  // controlled(opts.commit): 선택의 진실=DB(P2-2b) — 토글은 커밋 함수로 위임. uncontrolled: 내부 Set, 저장 액션이 pkSelected로 읽음.
  const PK_PAGE = 40;
  const pickers = {};
  const pkSelected = (id) => (pickers[id] ? [...pickers[id].sel] : []);
  function pkState(id, opts) {
    let st = pickers[id];
    if (!st || st.hash !== location.hash) st = pickers[id] = { hash: location.hash, query: "", prod: "", shown: PK_PAGE, sel: new Set(opts.initial || []) };
    st.opts = opts;
    if (opts.selected) st.sel = new Set(opts.selected);
    return st;
  }
  function pkMatches(st) {
    const q = st.query.trim();
    const qd = q.replace(/\D/g, "");
    let list = st.opts.pool;
    if (st.prod) list = list.filter((m) => passesOf(m.id).filter(passUsable).some((p) => p.productId === st.prod));
    if (q) list = list.filter((m) => m.name.includes(q) || (qd.length >= 2 && m.phone.replace(/-/g, "").includes(qd)));
    return list;
  }
  function pkListHtml(id, st) {
    const all = pkMatches(st);
    const rows = all.slice(0, st.shown).map((m) => {
      const on = st.sel.has(m.id);
      const ps = passesOf(m.id).filter(passUsable);
      return `<button class="pk-row${on ? " on" : ""}" onclick="App.pkToggle('${id}','${m.id}')">
        <span class="grow"><b>${m.name}</b> <span class="muted small">${m.phone}</span>
          <div class="muted small">${ps.length ? ps.map((p) => p.name).join(" · ") : "유효 수업권 없음"}</div></span>
        <span class="pk-check">${on ? "✓" : "+"}</span></button>`;
    }).join("");
    return `${rows || '<p class="muted small" style="padding:12px">검색 결과가 없어요.</p>'}
      ${all.length > st.shown ? `<button class="pk-more" onclick="App.pkMore('${id}')">더 보기 (${st.shown}/${all.length.toLocaleString("ko-KR")}명)</button>` : ""}`;
  }
  function pkSelbarHtml(id, st) {
    if (!st.opts.multi) {
      const m = st.sel.size ? member([...st.sel][0]) : null;
      return m ? `<span class="pk-count">선택</span><button class="chip on sm" onclick="App.pkToggle('${id}','${m.id}')">${m.name} (${m.phone}) ✕</button>`
        : '<span class="muted small">아래에서 검색해 회원을 선택해 주세요.</span>';
    }
    const chips = [...st.sel].map((mid) => `<button class="chip on sm" onclick="App.pkToggle('${id}','${mid}')">${memberName(mid)} ✕</button>`).join("");
    return `<span class="pk-count">선택 ${st.sel.size.toLocaleString("ko-KR")}명</span>${chips || '<span class="muted small">선택된 회원이 없어요.</span>'}`;
  }
  function pickerHtml(id, opts) {
    const st = pkState(id, opts);
    return `<div class="pk" id="${id}">
      <div class="pk-selbar" id="${id}-selbar">${pkSelbarHtml(id, st)}</div>
      <div class="pk-tools">
        <input type="search" placeholder="이름·전화번호 검색" value="${st.query.replaceAll('"', "&quot;")}" oninput="App.pkQuery('${id}', this.value)" autocomplete="off" aria-label="회원 검색">
        <select onchange="App.pkProd('${id}', this.value)" aria-label="멤버십 필터"><option value="">멤버십 전체</option>
          ${DB.products.map((p) => `<option value="${p.id}"${st.prod === p.id ? " selected" : ""}>${p.name}</option>`).join("")}</select>
      </div>
      <div class="pk-total">총 ${st.opts.pool.length.toLocaleString("ko-KR")}명 — 검색·필터로 좁혀 선택해 주세요</div>
      <div class="pk-results" onscroll="App.pkScroll('${id}', this)"><div id="${id}-list">${pkListHtml(id, st)}</div></div>
    </div>`;
  }
  function pkRefresh(id) {
    const st = pickers[id];
    const list = document.getElementById(id + "-list");
    const bar = document.getElementById(id + "-selbar");
    if (list) list.innerHTML = pkListHtml(id, st);
    if (bar) bar.innerHTML = pkSelbarHtml(id, st);
  }

  // ── v2.7: 정책 화면 선생님 권한 UI (형 지적 08-17: 수십 명 규모) ──
  // polUI: 편집 펼침·검색어 — 같은 화면(해시) 안에서만 유지, 화면 이동 시 초기화.
  // 검색 입력은 해당 리스트 서브트리만 갱신(포커스 유지) — 토글·저장은 기존 액션이 전체 render.
  // 유지 범위=정책 화면군(#/c/policy·상세) — 상세 편집을 다녀와도 검색·펼침 맥락 유지, 밖으로 나가면 초기화(render에서).
  const polUI = { live: false, open: {}, q: {} };
  function polState() {
    if (!polUI.live) { polUI.live = true; polUI.open = {}; polUI.q = {}; }
    return polUI;
  }
  function polFilterTeachers(key) {
    const q = (polState().q[key] || "").trim();
    return q ? DB.teachers.filter((t) => t.name.includes(q) || t.subject.includes(q)) : DB.teachers;
  }
  const POL_EMPTY = '<p class="muted small" style="padding:12px">검색 결과가 없어요.</p>';
  // P2-2 센터 지정 선생님 — 체크 리스트
  function polAuthRows() {
    const on = new Set(DB.policy.classAuth.memberIds || []);
    return polFilterTeachers("auth").map((t) => `<button class="pk-row${on.has(t.memberId) ? " on" : ""}" onclick="App.authMember('${t.memberId}')">
        <span class="grow"><b>${t.name}</b> <span class="muted small">${t.subject}</span></span>
        <span class="pk-check">${on.has(t.memberId) ? "✓" : "+"}</span></button>`).join("") || POL_EMPTY;
  }
  // P2-2 자격 멤버십 — 체크 리스트 (멤버십도 늘어날 수 있어 동일 패턴)
  function polProdRows() {
    const q = (polState().q.prod || "").trim();
    const list = q ? DB.products.filter((p) => p.name.includes(q)) : DB.products;
    const on = new Set(DB.policy.classAuth.productIds || []);
    return list.map((p) => `<button class="pk-row${on.has(p.id) ? " on" : ""}" onclick="App.authProduct('${p.id}')">
        <span class="grow"><b>${p.name}</b> <span class="muted small">${p.kind === "private" ? "개인" : "그룹"} · ${p.sessions}회</span></span>
        <span class="pk-check">${on.has(p.id) ? "✓" : "+"}</span></button>`).join("") || POL_EMPTY;
  }
  // P2-2b 선생님 리스트 — 행=이름·직군·설정 요약, 탭하면 상세 화면에서 편집
  function polScopeRows() {
    return polFilterTeachers("scope").map((t) => `<button class="pk-row" onclick="location.hash='#/c/policy/scope/${t.id}'">
        <span class="grow"><b>${t.name}</b> <span class="muted small">${t.subject}</span>
          <div class="muted small">${tScopeShort(t.id)}</div></span>
        <span class="arrow">›</span></button>`).join("") || POL_EMPTY;
  }
  const polRows = { auth: polAuthRows, prod: polProdRows, scope: polScopeRows };
  // 접힘 요약: "지정 N명 — 박코치 외 N-1" (전체 나열 금지)
  function polSummary(names, unit) {
    if (!names.length) return "지정 없음";
    return `<b>지정 ${names.length.toLocaleString("ko-KR")}${unit}</b> — ${names[0]}${names.length > 1 ? ` 외 ${names.length - 1}` : ""}`;
  }
  // 요약+편집 블록 (P2-2 공용)
  function polEditBlock(key, summary, placeholder, totalLabel) {
    const U = polState();
    return `<div class="row"><span class="grow muted">${summary}</span>
        <button class="btn sm ghost" onclick="App.polOpen('${key}')">${U.open[key] ? "닫기" : "편집"}</button></div>
      ${U.open[key] ? `<div class="pk mt8">
        <div class="pk-tools"><input type="search" placeholder="${placeholder}" value="${(U.q[key] || "").replaceAll('"', "&quot;")}" oninput="App.polQuery('${key}', this.value)" autocomplete="off" aria-label="${placeholder}"></div>
        <div class="pk-total">${totalLabel}</div>
        <div class="pk-results"><div id="pol-${key}-list">${polRows[key]()}</div></div>
      </div>` : ""}`;
  }

  // B2: 회원 지정 picker + 자격 수업권 지정. v2.3: 선생님은 «지정 가능 회원 범위»(P2-2b) 안의 회원만
  function eligExtraHtml(prefix, c, role, modeOverride) {
    const selP = c ? c.eligibleProductIds || [] : ["pr3", "pr4"];
    const selM = c ? c.memberIds || [] : [];
    // 초기 렌더도 segElig와 같은 규칙 적용 — 안 하면 «수업권 보유자» 선택인데 지정 회원이 노출돼 혼합처럼 보임 (형 지적 08-17)
    const mode = modeOverride || (c ? c.eligibility : "pass");
    const scoped = role === "t" && tScope(DB.me.teacher).mode === "custom";
    // 기존 지정 회원은 범위 밖이어도 표시·유지 (저장 시 조용히 빠지는 사고 방지)
    const pool = DB.members.filter((m) => !m.staff && (!scoped || inTScope(DB.me.teacher, m.id) || selM.includes(m.id)));
    return `
      <div class="field" id="${prefix}-prod-wrap"${mode === "list" ? ' style="display:none"' : ""}><label>사용 가능 수업권 (예약자격)</label>
        <div class="chips" id="${prefix}-prods">${DB.products.map((p) => `<button class="chip${selP.includes(p.id) ? " on" : ""}" data-v="${p.id}" onclick="App.chip(this)">${p.name}</button>`).join("")}</div>
        <div class="hint">고른 수업권을 보유한 회원만 예약할 수 있어요.</div></div>
      <div class="field" id="${prefix}-mem-wrap"${mode === "pass" ? ' style="display:none"' : ""}><label>지정 회원${scoped ? ' <span class="badge b-rose">내 지정범위 적용</span>' : ""}</label>
        ${pickerHtml(prefix + "-mems", { multi: true, initial: selM, pool })}
        <div class="hint">${scoped ? `센터가 설정한 내 «지정 가능 회원 범위»(${tScopeLabel(DB.me.teacher)}) 안의 회원만 보여요. 기존 지정 회원은 범위 밖이어도 유지돼요.` : "회원 목록은 니짐내짐(호스트 앱)의 회원 명단을 가져와요 — 프로토타입은 더미 데이터예요."}</div></div>`;
  }
  // 시정①: 센터·선생님 공용 수업 관리 — 선생님은 본인 수업 + classAuth(P2-2) 권한 필요
  function classListHtml(role) {
    const isT = role === "t";
    const auth = isT ? classAuth(teacher(DB.me.teacher)) : { ok: true };
    const list = isT ? DB.classes.filter((c) => c.teacherId === DB.me.teacher) : DB.classes;
    const card = (c) => `<${auth.ok ? `button class="card card-tap" onclick="location.hash='#/${role}/class/${c.id}'"` : `div class="card"`}>
        <div class="row"><span class="grow"><b>${c.title}</b>${c.status === "closed" ? ' <span class="badge b-danger">폐강</span>' : ""}
        <div class="muted small mt4">${teacher(c.teacherId).name} · ${c.scheduleLabel}</div>
        <div class="mt8"><span class="badge ${c.kind === "private" ? "b-rose" : "b-blue"}">${c.kind === "private" ? "개인 1:1" : `그룹 ${c.capacity}명`}</span>
        <span class="badge b-gray">${eligLabel(c)}</span>
        <span class="badge ${c.schedule === "fixed" ? "b-green" : "b-warn"}">${c.schedule === "fixed" ? "고정 시간표" : "조율형"}</span></div>
        ${c.status === "closed" ? `<div class="muted small mt4">사유: ${c.closedReason}</div>` : ""}</span>
        ${auth.ok ? `<span class="arrow" style="color:var(--text-disabled)">›</span>` : ""}</div></${auth.ok ? "button" : "div"}>`;
    return `
      ${isT ? (auth.ok
        ? `<div class="banner" style="margin-bottom:14px">${icb("unlock")}<span>수업 만들기·관리 권한: <b>${auth.via}</b> — 내 수업의 개설·수정·폐강이 가능해요.</span></div>`
        : `<div class="banner warn" style="margin-bottom:14px">${icb("lock")}<span><b>수업 만들기·관리 권한이 없어요.</b> 센터관리자의 지정을 받거나 자격 멤버십(예: 그룹 필라테스)을 보유해야 해요. 센터에 문의해 주세요.</span></div>`)
        : `<a class="btn ghost" href="#/c/products" style="margin-bottom:14px">${ici("ticket")}수업상품 관리 ›</a>`}
      ${auth.ok ? `<a class="btn primary" href="#/${role}/create" style="margin-bottom:14px">${ici("plus")}수업 만들기</a>` : ""}
      <div class="sec-title">${isT ? "내 수업" : "수업 목록"} <span class="muted small" style="font-weight:600">— 눌러서 수정·폐강</span></div>
      ${list.length ? list.map(card).join("") : `<div class="card flat"><p class="muted">${isT ? "담당 수업이 없어요. «수업 만들기»로 첫 수업을 만들어 보세요." : "등록된 수업이 없어요."}</p></div>`}`;
  }
  // 시정①: 센터·선생님 공용 수업 관리 — 선생님은 본인 수업 + classAuth(P2-2) 권한 필요.
  // v2.26: 선생님 목록은 «일정» 탭 하위 뷰로 이동 — 이 화면은 센터 «수업» 탭 전용.
  function vClasses(role) {
    return shell(role, role === "t" ? "내 수업" : "수업 관리", classListHtml(role), role === "t" ? { back: true } : {});
  }
  // B1+시정①: 수업 수정·폐강 — 선생님은 본인 수업 + 권한 있을 때만
  function vClassManage(role, id) {
    const c = cls(id);
    if (!c) return vClasses(role);
    if (role === "t" && (c.teacherId !== DB.me.teacher || !classAuth(teacher(DB.me.teacher)).ok)) return vClasses(role);
    const future = DB.slots.filter((s) => s.classId === id && s.status === "scheduled" && !isPast(s));
    const affected = future.reduce((a, s) => a + DB.bookings.filter((b) => b.slotId === s.id && ["booked", "waitlisted"].includes(b.status)).length, 0);
    if (c.status === "closed") {
      return shell(role, c.title, `
        <div class="banner warn">${icb("ban")}<span><b>폐강된 수업</b> · ${c.closedAt || ""}<br>사유: ${c.closedReason}</span></div>
        <div class="card"><div class="muted small">폐강하면서 예정 회차의 예약은 자동으로 취소되고 회원에게 알림이 갔어요. 이미 진행된 회차의 정산은 그대로 유지돼요.</div></div>`, { back: true });
    }
    return shell(role, c.title, `
      <div class="card flat"><div class="muted small">${teacher(c.teacherId).name} 선생님 · ${c.scheduleLabel} · ${c.kind === "private" ? "개인 1:1" : `그룹 정원 ${c.capacity}명`} · 예정 회차 ${future.length}개 · 예약 ${affected}건</div></div>
      <div class="sec-title">수업 정보 수정</div>
      <div class="card">
        <div class="field"><label>수업명</label><input type="text" id="ec-title" value="${c.title.replaceAll('"', "&quot;")}"></div>
        ${c.kind === "group" ? `<div class="field"><label>정원</label><input type="number" id="ec-cap" value="${c.capacity}"><div class="hint">기존 예약 인원 미만으로는 줄일 수 없어요.</div></div>` : ""}
        <div class="field"><label>예약 가능 회원</label><div class="seg" id="ec-elig">
          <button${c.eligibility === "pass" ? ' class="on"' : ""} data-v="pass" onclick="App.segElig(this,'ec')">수업권 보유자</button>
          <button${c.eligibility === "list" ? ' class="on"' : ""} data-v="list" onclick="App.segElig(this,'ec')">회원 지정</button>
          <button${c.eligibility === "both" ? ' class="on"' : ""} data-v="both" onclick="App.segElig(this,'ec')">혼합</button></div></div>
        ${eligExtraHtml("ec", c, role)}
        <button class="btn primary" onclick="App.updateClass('${c.id}','${role}')">수정 저장</button>
        <div class="hint mt8">종류(그룹/개인)·일정 방식은 기존 예약 보호를 위해 수정할 수 없어요. 필요하면 폐강 후 새로 개설해 주세요.</div>
      </div>
      <div class="sec-title">폐강</div>
      <div class="card">
        <p class="muted small">폐강하면 예정 회차 ${future.length}개의 예약 ${affected}건이 자동취소되고 회원에게 알림이 가요. 아직 차감 전이라 횟수 손실은 없고, 이미 진행된 회차의 정산은 유지돼요. 폐강 사유는 필수 기록이에요.</p>
        <button class="btn danger-ghost mt8" onclick="App.askCloseClass('${c.id}','${role}')">이 수업 폐강하기</button>
      </div>`, { back: true });
  }
  // v2.20 (형 지시 08-18): 센터 «예약 현황» — 월간 캘린더+선택 날짜 리스트 혼합(회원 예약 캘린더와 같은 문법).
  // 날짜 셀=수업 수+상태 점(예정·정원 마감·지난 수업), 조율 요청 희망일=주황 표식. 선생님·수업 필터 공통 적용.
  let cbUI = { sel: null, teacher: "all", cls: "all" };
  function cbSlots() {
    return DB.slots.filter((s) => {
      if (s.status === "canceled") return false;
      const c = cls(s.classId);
      if (!c || c.status === "closed") return false;
      if (cbUI.teacher !== "all" && c.teacherId !== cbUI.teacher) return false;
      if (cbUI.cls !== "all" && s.classId !== cbUI.cls) return false;
      return true;
    });
  }
  function cbArrs() {
    return DB.arranges.filter((a) => {
      if (a.status !== "pending") return false;
      const c = cls(a.classId);
      if (!c) return false;
      if (cbUI.teacher !== "all" && c.teacherId !== cbUI.teacher) return false;
      if (cbUI.cls !== "all" && a.classId !== cbUI.cls) return false;
      return true;
    });
  }
  function vCBookings() {
    const sel = cbUI.sel || (cbUI.sel = DB.TODAY);
    const ym = sel.slice(0, 7);
    const [y, m] = ym.split("-").map(Number);
    const cells = monthCells(ym);
    const all = cbSlots();
    const byDate = {};
    all.forEach((s) => (byDate[s.date] = byDate[s.date] || []).push(s));
    const arrs = cbArrs();
    const arrDates = new Set(arrs.map((a) => a.date));
    const cell = (d) => {
      if (!d) return `<span class="cb-day blank"></span>`;
      const ss = byDate[d] || [];
      const st = new Set(ss.map((s) => (s.status === "done" || isPast(s)) ? "pd" : seatCount(s.id) >= cls(s.classId).capacity ? "fl" : "av"));
      return `<button type="button" class="cb-day${d === sel ? " on" : ""}${d === DB.TODAY ? " today" : ""}${d < DB.TODAY ? " past" : ""}" onclick="App.cbDay('${d}')" aria-label="${dlabel(d)}${ss.length ? ` · 수업 ${ss.length}건` : ""}${arrDates.has(d) ? " · 조율 확인 필요" : ""}">
        <span class="dn">${Number(d.slice(8))}</span>
        <span class="mb-dots">${["av", "fl", "pd"].filter((k) => st.has(k)).map((k) => `<i class="${k}"></i>`).join("")}${arrDates.has(d) ? `<i class="ar"></i>` : ""}</span>
        <span class="cnt">${ss.length ? `${ss.length}건` : ""}</span></button>`;
    };
    const fchip = (label, on, fn) => `<button type="button" class="cb-chip${on ? " on" : ""}" onclick="${fn}">${label}</button>`;
    const teachers = DB.teachers.filter((t) => DB.classes.some((c) => c.status !== "closed" && c.teacherId === t.id));
    const item = (s) => {
      const c = cls(s.classId); const n = seatCount(s.id); const w = waitBk(s.id).length;
      const full = n >= c.capacity;
      return `<div class="slot"><span class="time">${s.time}</span>
        <span class="grow"><span class="t">${c.title}</span>
          <div class="cap-bar${full ? " full" : ""}"><i style="width:${Math.min(100, (n / c.capacity) * 100)}%"></i></div>
          <div class="muted small mt4">${teacher(c.teacherId).name} · ${n}/${c.capacity}명${w ? ` · 대기 ${w}` : ""}</div></span>
        ${overlapBadge(s)}<button class="btn sm ghost" onclick="location.hash='#/c/slot/${s.id}'">${s.status === "done" ? "종료" : full ? "마감" : "상세"}</button></div>`;
    };
    const arrItem = (a) => {
      const c = cls(a.classId);
      return `<div class="slot"><span class="time">${a.time}</span>
        <span class="grow"><span class="t">${memberName(a.memberId)} · ${c.title}</span>
        <div class="muted small">${dlabel(a.date)} 희망 · ${teacher(c.teacherId).name} 선생님 인박스</div></span>
        <span class="badge b-warn">대기</span></div>`;
    };
    const list = (byDate[sel] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
    const dayArrs = arrs.filter((a) => a.date === sel).sort((a, b) => a.time.localeCompare(b.time));
    const near = list.length ? null : (() => {
      const dates = [...new Set(all.map((s) => s.date))].sort();
      return dates.find((d) => d > sel) || dates.slice().reverse().find((d) => d < sel) || null;
    })();
    return shell("c", "예약 현황", `
      <a class="btn ghost" href="#/c/create" style="margin-bottom:14px">${ici("plus")}수업 만들기</a>
      ${arrs.length ? `<div class="sec-title">조율 요청 (선생님 확인 대기) <span class="badge b-warn">${arrs.length}건</span></div>
      <div class="card flat">${arrs.map(arrItem).join("")}</div>` : ""}
      <div class="cb-filters">
        <div class="cb-frow"><span class="cb-flabel">선생님</span>${fchip("전체", cbUI.teacher === "all", "App.cbTeacher('all')")}${teachers.map((t) => fchip(`${t.name} 선생님`, cbUI.teacher === t.id, `App.cbTeacher('${t.id}')`)).join("")}</div>
        <div class="cb-frow"><span class="cb-flabel">수업</span>${fchip("전체", cbUI.cls === "all", "App.cbClass('all')")}${DB.classes.filter((c) => c.status !== "closed").map((c) => fchip(c.title, cbUI.cls === c.id, `App.cbClass('${c.id}')`)).join("")}</div>
      </div>
      <div class="card mb-cal">
        <div class="mb-head">
          <button class="mb-nav" onclick="App.cbMonth(-1)" aria-label="이전 달">‹</button>
          <button class="mb-month" onclick="App.cbMonthSheet()">${y}년 ${m}월 <span class="car">▾</span></button>
          <button class="mb-nav" onclick="App.cbMonth(1)" aria-label="다음 달">›</button>
        </div>
        <div class="cb-dow">${["월", "화", "수", "목", "금", "토", "일"].map((w) => `<span>${w}</span>`).join("")}</div>
        <div class="cb-grid">${cells.map(cell).join("")}</div>
        <div class="mb-legend cb-legend"><span><i class="av"></i>예정</span><span><i class="fl"></i>정원 마감</span><span><i class="pd"></i>지난 수업</span><span><i class="ar"></i>조율 확인 필요</span></div>
      </div>
      <div class="sec-title">${dlabel(sel)} 수업${sel === DB.TODAY ? ' <span class="badge b-rose">오늘</span>' : ""}</div>
      ${list.length ? `<div class="card flat">${list.map(item).join("")}</div>`
        : `<div class="card flat mb-empty"><div class="em">${IC.empty}</div>
            <p class="muted mt8">이 날은 수업이 없어요.</p>
            ${near ? `<button class="btn ghost mt12" onclick="App.cbDay('${near}')">수업이 있는 가장 가까운 날 ${dlabel(near)}로 이동</button>` : ""}</div>`}
      ${dayArrs.length ? `<div class="sec-title">이 날을 희망한 조율 요청</div><div class="card flat">${dayArrs.map(arrItem).join("")}</div>` : ""}`);
  }
  function vCSlot(id) {
    const s = slot(id);
    if (!s) return vCBookings();
    const c = cls(s.classId);
    const seats = seatBk(s.id);
    const w = waitBk(s.id);
    const ov = slotOverlaps(s);
    return shell("c", "회차 상세", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div>
        <div class="mt8"><span class="badge ${s.status === "done" ? "b-gray" : "b-green"}">${s.status === "done" ? "종료" : "예정"}</span>
        <span class="badge b-blue">${seats.length}/${c.capacity}명</span>${w.length ? `<span class="badge b-warn">대기 ${w.length}명</span>` : ""}${ov.length ? `<span class="badge b-danger">시간 겹침 ${ov.length}건</span>` : ""}</div></div>
      ${ov.length ? `<div class="banner warn">${icb("alert")}<span>${teacher(c.teacherId).name} 선생님이 같은 시간대에 <b>${ov.map((o) => `${o.time} ${cls(o.classId).title}`).join(", ")}</b> 수업도 맡고 있어요.</span></div>` : ""}
      <div class="sec-title">예약자</div>
      <div class="card flat">${seats.length ? seats.map((b) => {
        const bd = bkBadge(b);
        return `<div class="slot"><span class="grow"><b>${memberName(b.memberId)}</b><div class="muted small">${pass(b.passId) ? pass(b.passId).name : "수업권 미연결"}</div></span>
          <span class="badge ${bd.badge}">${bd.label}</span>
          ${b.status === "booked" && s.status === "scheduled" ? `<button class="btn sm ghost" onclick="App.centerCancelAsk('${b.id}')">취소</button>` : ""}</div>`;
      }).join("") : `<p class="muted">예약자가 없어요.</p>`}</div>
      ${w.length ? `<div class="sec-title">대기열</div><div class="card flat">${w.map((b) => `
        <div class="slot"><span class="grow"><b>${memberName(b.memberId)}</b></span><span class="badge b-warn">대기 ${b.pos}번</span></div>`).join("")}</div>
        <p class="muted small">자리가 나면 ${DB.policy.waitlistPromote === "auto" ? "순번대로 자동 확정돼요" : "센터가 수동으로 승격해요"}.</p>` : ""}`, { back: true });
  }
  function vCConfirms() {
    const warns = DB.policy.autoConfirmHours > 0
      ? DB.teachers.map((t) => ({ t, ...autoStats(t.id) })).filter((x) => x.total && x.rate >= DB.policy.autoWarnRate) : [];
    return shell("c", "수강확인 관리", `
      ${warns.map((x) => `<div class="banner warn">${icb("clock")}<span>${x.t.name} 자동확정 비율 <b>${x.rate}%</b> (임계 ${DB.policy.autoWarnRate}%). 자동확정 회차는 정산 전 검토를 권장해요.</span></div>`).join("")}
      <div class="sec-title">회차별 수강확인</div>
      <div class="card flat">${DB.reports.map((r) => `
        <div class="tl-item"><span class="grow"><b>${r.member}</b> <span class="badge ${RP_BADGE[r.status] || "b-gray"}">${r.label}</span>${r.autoFinal ? ` <span class="badge b-warn">무응답 자동확정</span>` : ""}
          <div class="muted small mt4">${r.slotId ? slotDesc(slot(r.slotId)) : r.desc}</div>
          <div class="muted small">${r.at}${r.method ? ` · 수단: ${r.method}` : ""}${r.disputeReason ? ` · 이의 사유: ${r.disputeReason}` : ""}</div>
          ${r.status === "pending" ? `<div class="muted small mt4">회원 폰 확인 대기 · ${DB.policy.autoConfirmHours ? `무응답 시 보고 ${DB.policy.autoConfirmHours}시간 뒤 자동확정 예정` : "자동확정 없음 — 센터 수동 처리"} · 이의제기는 ${DB.policy.disputeDays}일 안에 가능해요</div>` : ""}
          ${r.status === "disputed" ? (r.noshow ? `<div class="btn-row">
            <button class="btn sm primary" onclick="App.resolveDispute('${r.id}', true)">이의 인정 (노쇼 취소 · 차감 없음)</button>
            <button class="btn sm ghost" onclick="App.resolveDispute('${r.id}', false)">이의 기각 (노쇼 확정·차감)</button></div>` : `<div class="btn-row">
            <button class="btn sm primary" onclick="App.resolveDispute('${r.id}', true)">이의 인정 (횟수 복원)</button>
            <button class="btn sm ghost" onclick="App.resolveDispute('${r.id}', false)">이의 기각 (확정·차감)</button></div>`) : ""}
          ${r.status === "auto" ? `<div class="btn-row"><button class="btn sm ghost" onclick="App.overrideAuto('${r.id}')">자동확정 취소</button></div>` : ""}
          ${r.status === "noshow_wait" ? (DB.policy.noshowActor === "center_only" ? `<div class="btn-row">
            <button class="btn sm primary" onclick="App.resolveNoshow('${r.id}', true)">노쇼 확정 (차감)</button>
            <button class="btn sm ghost" onclick="App.resolveNoshow('${r.id}', false)">노쇼 취소 (차감 없음)</button></div>
            <div class="muted small mt4">센터만 판정 정책 — 센터가 직접 확정·취소를 결정해요.</div>` : `
            <div class="muted small mt4">회원에게 알림이 갔어요 · <b>${noshowDeadline(r).replaceAll("-", ".")}</b>까지 이의가 없으면 <b>자동 확정되고 횟수가 차감</b>돼요. 이의가 들어오면 센터가 판단해요.</div>
            <div class="demo-box"><span class="demo-cap">프로토타입 데모</span><button class="btn sm demo" onclick="App.noshowExpire('${r.id}')">${ici("fwd")}이의기간 경과</button></div>`) : ""}
        </span></div>`).join("")}</div>
      <p class="muted small">모든 확인에는 시각·기기 기록이 남고, 한 번 남은 기록은 바꾸거나 지울 수 없어요.</p>`, { back: true });
  }
  // ── 엑셀(.xlsx) 생성 — 외부 라이브러리 없이 무압축 zip + 시트 XML 직접 조립 ──
  const XLSX_CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  const xlsxCrc32 = (u) => { let c = -1; for (let i = 0; i < u.length; i++) c = XLSX_CRC_TABLE[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const xlsxXmlEsc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // rows: (string|number|null)[][] — 숫자는 숫자 셀로 넣어 엑셀에서 합계·수식이 바로 되게 한다
  function xlsxBytes(rows, colWidths) {
    const colRef = (i) => { let s = ""; for (i += 1; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s; return s; };
    const cell = (v, r, ci) => v == null || v === ""
      ? ""
      : typeof v === "number"
        ? `<c r="${colRef(ci)}${r}" t="n"><v>${v}</v></c>`
        : `<c r="${colRef(ci)}${r}" t="inlineStr"><is><t xml:space="preserve">${xlsxXmlEsc(v)}</t></is></c>`;
    const XMLH = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    const sheet = `${XMLH}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${(colWidths || []).map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols><sheetData>${rows.map((row, ri) => `<row r="${ri + 1}">${row.map((v, ci) => cell(v, ri + 1, ci)).join("")}</row>`).join("")}</sheetData></worksheet>`;
    const files = [
      ["[Content_Types].xml", `${XMLH}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
      ["_rels/.rels", `${XMLH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ["xl/workbook.xml", `${XMLH}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="정산 내역" sheetId="1" r:id="rId1"/></sheets></workbook>`],
      ["xl/_rels/workbook.xml.rels", `${XMLH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ["xl/styles.xml", `${XMLH}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Malgun Gothic"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`],
      ["xl/worksheets/sheet1.xml", sheet],
    ];
    const enc = new TextEncoder();
    const d = NOW; // 데모 고정 시각 — zip 타임스탬프도 고정해 같은 데이터=같은 파일
    const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    const parts = []; const central = []; let offset = 0;
    files.forEach(([name, text]) => {
      const nameB = enc.encode(name); const data = enc.encode(text); const crc = xlsxCrc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, nameB.length, true);
      parts.push(new Uint8Array(lh.buffer), nameB, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, nameB.length, true);
      ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), nameB);
      offset += 30 + nameB.length + data.length;
    });
    const cdSize = central.reduce((a, u) => a + u.length, 0);
    const eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true); eocd.setUint16(8, files.length, true); eocd.setUint16(10, files.length, true);
    eocd.setUint32(12, cdSize, true); eocd.setUint32(16, offset, true);
    const all = [...parts, ...central, new Uint8Array(eocd.buffer)];
    const out = new Uint8Array(all.reduce((a, u) => a + u.length, 0));
    let p = 0; all.forEach((u) => { out.set(u, p); p += u.length; });
    return out;
  }
  // v2.21: 정산 라인 desc 파싱 — 엑셀·정산 캘린더 공용.
  // desc 형식 두 가지 수용: "8/13 (목) 19:00 · PT"(슬롯) / "8/13 (목) 19:00 PT"·"8/8 수업명"(시드)
  const splitSlineDesc = (d) => {
    const m = (d || "").match(/^(\d{1,2}\/\d{1,2}(?:\s*\([^)]+\))?(?:\s+\d{1,2}:\d{2})?)(?:\s*·\s*|\s+)(.*)$/);
    return m ? [m[1], m[2]] : [d || "", ""];
  };
  const slineDate = (l) => { // 라인 desc 선두 "8/13 …" → "2026-08-13" (런타임 생성분=slotDesc 형식 동일)
    const m = (l.desc || "").match(/^(\d{1,2})\/(\d{1,2})/);
    return m ? `${DB.TODAY.slice(0, 4)}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}` : null;
  };
  const slineTime = (l) => { const m = (l.desc || "").match(/\d{1,2}:\d{2}/); return m ? m[0] : ""; };
  // 엑셀 행 구성 — vCSettlement와 같은 집계(확정=합계 포함, 이의 보류=제외 표기, 노쇼 보상=정책 지원 시 포함)
  // v2.24 A6: 화면에 적용된 필터(선택 월 csUI.sel · 선생님 csUI.teacher)를 그대로 반영.
  // 이전엔 전 기간·전 선생님을 무필터 집계해서, 데이터가 두 달 이상 쌓이면 화면과 다른 금액의 정산 파일이 나갔다.
  function settlementExportRows() {
    const split = splitSlineDesc;
    const ym = (csUI.sel || DB.TODAY).slice(0, 7);
    const tOk = (tid) => csUI.teacher === "all" || tid === csUI.teacher;
    const inYm = (d) => (d || "").slice(0, 7) === ym;
    const rows = [["수업일시", "수업명", "선생님", "회원", "수업권", "구분", "회당 단가(원)", "정산 금액(원)"]];
    let total = 0, cnt = 0, heldN = 0, nsCnt = 0;
    DB.teachers.filter((t) => tOk(t.id)).forEach((t) => {
      const lines = DB.slines.filter((l) => l.teacherId === t.id && inYm(slineDate(l)));
      lines.filter((l) => l.status === "eligible").forEach((l) => {
        const [when, title] = split(l.desc);
        rows.push([when, title, t.name, l.member, l.passName || "수업권", `수강 확인 완료 (${l.method})`, l.unitPrice, l.unitPrice]);
        total += l.unitPrice; cnt++;
      });
      lines.filter((l) => l.status === "held").forEach((l) => {
        const [when, title] = split(l.desc);
        rows.push([when, title, t.name, l.member, l.passName || "수업권", "이의 심사 중 — 합계에서 제외", l.unitPrice, ""]);
        heldN++;
      });
      if (rewardOn()) noshowFinals(t.id).filter((r) => inYm(r.date || (r.slotId ? slot(r.slotId).date : null))).forEach((r) => {
        const [when, title] = split(r.desc || (r.slotId ? slotDesc(slot(r.slotId)) : ""));
        const amt = noshowAmt(r);
        rows.push([when, title, t.name, r.member, "", "노쇼 보상 (센터 정책)", amt, amt]);
        total += amt; nsCnt++;
      });
    });
    rows.push([]);
    rows.push(["합계", `수강 확인 ${cnt}회${nsCnt ? ` + 노쇼 보상 ${nsCnt}건` : ""}${heldN ? ` · 이의 심사 중 ${heldN}건은 제외` : ""}`, "", "", "", "", "", total]);
    return { rows, total, cnt, heldN, nsCnt, ym, teacherName: csUI.teacher === "all" ? null : teacher(csUI.teacher).name };
  }
  // S-5: 정산 = 라인 동적 집계. held 제외·멱등 전송·전송 후 이의 경고
  // v2.21 (형 지시 08-18): 상단 월간 캘린더(날짜별 회차 수·상태 점) + 날짜 탭 시 그 날 내역 리스트.
  // 선생님 필터 칩은 캘린더·날짜 리스트·하단 선생님 카드에 공통 적용. 캘린더 문법=센터 예약(v2.20)·회원 캘린더 공용.
  let csUI = { sel: null, teacher: "all" };
  function vCSettlement() {
    const sel = csUI.sel || (csUI.sel = DB.TODAY);
    const ym = sel.slice(0, 7);
    const [y, m] = ym.split("-").map(Number);
    const tOk = (tid) => csUI.teacher === "all" || tid === csUI.teacher;
    const inYm = (d) => (d || "").slice(0, 7) === ym;
    const per = DB.teachers.filter((t) => tOk(t.id)).map((t) => {
      const lines = DB.slines.filter((l) => l.teacherId === t.id && inYm(slineDate(l)));
      const elig = lines.filter((l) => l.status === "eligible");
      const held = lines.filter((l) => l.status === "held");
      const unpushed = elig.filter((l) => !l.pushed);
      const pushed = elig.filter((l) => l.pushed);
      const pushedHeld = held.filter((l) => l.pushed);
      const auto = elig.filter((l) => l.auto).length;
      // P9-1 (형 확정 08-17): 노쇼 보상은 센터별 설정 — 확정(noshow_final) 건만, 현재 정책 단가로 동적 집계
      const ns = noshowFinals(t.id).filter((r) => inYm(r.date || (r.slotId ? slot(r.slotId).date : null)));
      const nsAmt = rewardOn() ? ns.reduce((a, r) => a + noshowAmt(r), 0) : 0;
      const nsUnpushed = rewardOn() && DB.policy.noshowRewardPush === "auto" ? ns.filter((r) => !r.rewardPushed) : [];
      return { t, elig, held, unpushed, pushed, pushedHeld, auto, ns, nsAmt, nsUnpushed, amount: elig.reduce((a, l) => a + l.unitPrice, 0) };
    })
      // v2.7: 선생님 수십 명 규모 — 이번 달 내역(정산 라인·노쇼)이 있는 선생님만 표시
      .filter((x) => x.elig.length || x.held.length || x.ns.length);
    const hiddenN = DB.teachers.length - per.length;
    const noshowN = DB.reports.filter((r) => ["noshow_wait", "noshow_final"].includes(r.status)).length;
    const rewardLabel = !rewardOn() ? "보상 없음 (기본)"
      : `보상 지원 · ${DB.policy.noshowRewardPrice === "custom" ? customPriceLabel() : "정상 단가"} · ${DB.policy.noshowRewardPush === "auto" ? "샐리 자동 전송" : "샐리에서 수동 체크"}`;
    // ── 캘린더 집계 (removed 제외 · 선생님 필터 반영) ──
    const monthLines = DB.slines.filter((l) => l.status !== "removed" && tOk(l.teacherId) && inYm(slineDate(l)));
    const byDate = {};
    monthLines.forEach((l) => (byDate[slineDate(l)] = byDate[slineDate(l)] || []).push(l));
    const nsByDate = {};
    if (rewardOn()) DB.reports.filter((r) => r.status === "noshow_final" && tOk(noshowTeacher(r)) && inYm(r.date || (r.slotId ? slot(r.slotId).date : null)))
      .forEach((r) => { const d = r.date || slot(r.slotId).date; (nsByDate[d] = nsByDate[d] || []).push(r); });
    const cells = monthCells(ym);
    const cell = (d) => {
      if (!d) return `<span class="cb-day blank"></span>`;
      const ls = byDate[d] || [];
      const nsl = nsByDate[d] || [];
      const n = ls.length + nsl.length;
      const st = new Set([...ls.map((l) => l.status === "held" ? "hd" : l.auto ? "au" : "cf"), ...nsl.map(() => "cf")]);
      return `<button type="button" class="cb-day${d === sel ? " on" : ""}${d === DB.TODAY ? " today" : ""}${d < DB.TODAY ? " past" : ""}" onclick="App.csDay('${d}')" aria-label="${dlabel(d)}${n ? ` · 정산 ${n}회` : ""}">
        <span class="dn">${Number(d.slice(8))}</span>
        <span class="mb-dots">${["cf", "au", "hd"].filter((k) => st.has(k)).map((k) => `<i class="${k}"></i>`).join("")}</span>
        <span class="cnt">${n ? `${n}회` : ""}</span></button>`;
    };
    const fchip = (label, on, fn) => `<button type="button" class="cb-chip${on ? " on" : ""}" onclick="${fn}">${label}</button>`;
    const chipTeachers = DB.teachers.filter((t) => DB.slines.some((l) => l.status !== "removed" && l.teacherId === t.id)
      || DB.reports.some((r) => r.status === "noshow_final" && noshowTeacher(r) === t.id));
    // ── 선택 날짜 내역 리스트 ──
    const lineItem = (l) => {
      const held = l.status === "held";
      const title = splitSlineDesc(l.desc)[1] || l.desc;
      return `<div class="slot"><span class="time">${slineTime(l) || "—"}</span>
        <span class="grow"><span class="t">${title}</span>
          <div class="muted small mt4">${teacher(l.teacherId).name} 선생님 · ${l.member} · 회당 ${won(l.unitPrice)}</div></span>
        <span class="cs-right"><span class="badge ${held ? "b-warn" : l.auto ? "b-blue" : "b-green"}">${held ? "보류" : l.auto ? "자동확정" : "확정"}</span>
          <b class="cs-amt${held ? " held" : ""}">${won(l.unitPrice)}</b></span></div>`;
    };
    const nsItem = (r) => {
      const title = splitSlineDesc(r.desc || (r.slotId ? slotDesc(slot(r.slotId)) : ""))[1] || "노쇼 회차";
      const tm = ((r.desc || "").match(/\d{1,2}:\d{2}/) || [""])[0];
      return `<div class="slot"><span class="time">${tm || "—"}</span>
        <span class="grow"><span class="t">${title}</span>
          <div class="muted small mt4">${(teacher(noshowTeacher(r)) || { name: "선생님" }).name} 선생님 · ${r.member} · 노쇼 보상 (센터 정책)</div></span>
        <span class="cs-right"><span class="badge b-rose">보상</span><b class="cs-amt">${won(noshowAmt(r))}</b></span></div>`;
    };
    const timeOf = (l) => slineTime(l) || "";
    const dayLines = (byDate[sel] || []).slice().sort((a, b) => timeOf(a).localeCompare(timeOf(b)));
    const dayNs = nsByDate[sel] || [];
    const dayN = dayLines.length + dayNs.length;
    const dayTotal = dayLines.filter((l) => l.status === "eligible").reduce((a, l) => a + l.unitPrice, 0) + dayNs.reduce((a, r) => a + noshowAmt(r), 0);
    const near = dayN ? null : (() => {
      const dates = [...new Set([...monthLines.map(slineDate), ...Object.keys(nsByDate)])].sort();
      return dates.find((d) => d > sel) || dates.slice().reverse().find((d) => d < sel) || null;
    })();
    return shell("c", `정산 · ${y}년 ${m}월`, `
      <p class="muted" style="margin-bottom:12px">회원 수강확인이 끝난 회차만 집계돼요. 이의제기 중인 회차는 자동으로 보류되고 전송에서 빠져요.</p>
      <div class="cb-filters">
        <div class="cb-frow"><span class="cb-flabel">선생님</span>${fchip("전체", csUI.teacher === "all", "App.csTeacher('all')")}${chipTeachers.map((t) => fchip(`${t.name} 선생님`, csUI.teacher === t.id, `App.csTeacher('${t.id}')`)).join("")}</div>
      </div>
      <div class="card mb-cal">
        <div class="mb-head">
          <button class="mb-nav" onclick="App.csMonth(-1)" aria-label="이전 달">‹</button>
          <button class="mb-month" onclick="App.csMonthSheet()">${y}년 ${m}월 <span class="car">▾</span></button>
          <button class="mb-nav" onclick="App.csMonth(1)" aria-label="다음 달">›</button>
        </div>
        <div class="cb-dow">${["월", "화", "수", "목", "금", "토", "일"].map((w) => `<span>${w}</span>`).join("")}</div>
        <div class="cb-grid cs-grid">${cells.map(cell).join("")}</div>
        <div class="mb-legend cb-legend"><span><i class="cf"></i>확정</span><span><i class="au"></i>자동확정</span><span><i class="hd"></i>보류 (이의 심사 중)</span></div>
      </div>
      <div class="sec-title">${dlabel(sel)} 정산 내역${dayN ? ` · ${dayN}회${dayTotal ? ` · ${won(dayTotal)}` : ""}` : ""}${sel === DB.TODAY ? ' <span class="badge b-rose">오늘</span>' : ""}</div>
      ${dayN ? `<div class="card flat">${dayLines.map(lineItem).join("")}${dayNs.map(nsItem).join("")}</div>`
        : `<div class="card flat mb-empty"><div class="em">${IC.won}</div>
            <p class="muted mt8">이 날은 정산 내역이 없어요.</p>
            ${near ? `<button class="btn ghost mt12" onclick="App.csDay('${near}')">정산 내역이 있는 가장 가까운 날 ${dlabel(near)}로 이동</button>` : ""}</div>`}
      <div class="sec-title">선생님별 정산</div>
      ${per.map((x) => `<div class="card"><div class="row"><span class="grow"><b>${x.t.name} 선생님</b>
          <div class="muted small mt4">확정 ${x.elig.length}회 (자동확정 ${x.auto}회 포함)${x.held.length ? ` · <b style="color:var(--danger)">보류 ${x.held.length}건</b>` : ""}</div></span>
          <span class="big">${won(x.amount)}</span></div>
        ${linesDetailHtml(x.elig, x.held)}
        ${x.held.length ? `<div class="banner warn mt12" style="margin-bottom:0">${icb("pause")}<span>이의 심사 중 ${x.held.length}건은 집계·전송에서 제외돼요. ${x.pushedHeld.length ? `이미 전송된 ${x.pushedHeld.length}건은 샐리에서 직접 취소해 주세요.` : ""}</span></div>` : ""}
        ${rewardOn() && x.ns.length ? `<div class="banner mt12" style="margin-bottom:0">${icb("gift")}<span>노쇼 보상 <b>${x.ns.length}건 · +${won(x.nsAmt)}</b> (${x.ns.every((r) => r.rewardPushed) ? "보낸 금액 기준" : DB.policy.noshowRewardPrice === "custom" ? customPriceLabel() : "정상 단가"}) — ${DB.policy.noshowRewardPush === "auto" ? `샐리로 자동 전송${x.ns.some((r) => r.rewardPushed) ? ` · 전송 완료 ${x.ns.filter((r) => r.rewardPushed).length}건` : ""}` : "샐리에서 수동 체크로 지급"}</span></div>` : ""}
        <div class="mt12">
          ${x.pushed.length ? `<span class="badge b-green">샐리 전송 완료 ${x.pushed.length}회 · ${x.pushed[x.pushed.length - 1].pushId}</span> ` : ""}
          ${x.unpushed.length || x.nsUnpushed.length ? `<button class="btn sm primary" onclick="App.sallyPush('${x.t.id}')">${(() => {
            const parts = [];
            if (x.unpushed.length) parts.push(`${x.unpushed.length}회`);
            if (x.nsUnpushed.length) parts.push(`보상 ${x.nsUnpushed.length}건`);
            return x.pushed.length ? `추가 ${parts.join(" + ")} 보내기` : `샐리로 보내기 (${parts.join(" + ")})`;
          })()}</button>` : x.pushed.length ? "" : `<span class="muted small">보낼 확정 회차가 없어요.</span>`}
        </div></div>`).join("")}
      ${per.length ? "" : `<div class="card flat"><div class="muted small">이 달에는 표시할 정산 내역이 없어요.</div></div>`}
      ${csUI.teacher === "all" && per.length && hiddenN > 0 ? `<div class="card flat"><div class="muted small">이번 달 정산 내역이 없는 선생님 <b>${hiddenN.toLocaleString("ko-KR")}명</b>은 표시하지 않아요.</div></div>` : ""}
      ${noshowN ? `<div class="card flat"><div class="muted small">노쇼 ${noshowN}건은 수강확인이 안 돼 정산에 포함되지 않았어요. 노쇼 보상은 현재 <b>${rewardLabel}</b>이에요 — <a href="#/c/policy" style="color:var(--link);font-weight:600">정책 설정에서 변경 ›</a></div></div>` : ""}
      <div class="card"><div class="row" style="gap:12px"><span class="grow"><b>엑셀로 내려받기</b>
        <div class="muted small mt4">지금 화면 그대로 — <b>${y}년 ${m}월</b>${csUI.teacher === "all" ? "" : ` · <b>${teacher(csUI.teacher).name} 선생님</b>`} 정산 내역을 엑셀 파일로 저장해요. 이의 심사 중인 회차는 제외 표시가 붙고, 마지막 줄에 합계가 들어 있어요.</div></span>
        <button class="btn sm" onclick="App.exportSettlement()">${ici("down")}내려받기</button></div></div>
      <div class="banner">${icb("link")}<span>배분율·공제·급여명세는 <b>샐리(급여 시스템)</b>가 계산해요. 여기서는 확정된 회차만 넘겨요. 같은 회차는 여러 번 보내도 한 번만 반영되니 안심하고 누르세요.</span></div>`);
  }
  function vCPolicy() {
    const P = DB.policy;
    const sw = (key, on) => `<button class="sw${on ? " on" : ""}" onclick="App.toggle('${key}')" aria-label="${key}"></button>`;
    const sel = (onchange, opts, cur) => `<select onchange="${onchange}">${opts.map(([v, l]) => `<option value="${v}"${String(cur) === String(v) ? " selected" : ""}>${l}</option>`).join("")}</select>`;
    return shell("c", "정책 설정", `
      <div class="sec-title">예약 · 대기</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">정원 마감 시 예약대기</div><div class="td">자리가 나면 순번대로 확정</div></span>${sw("waitlist", P.waitlist)}</div>
        <div class="toggle-row"><span><div class="tl">대기 자동 승격</div><div class="td">끄면 자리가 나도 센터가 직접 올려줘야 해요</div></span>${sw("waitlistAuto", P.waitlistPromote === "auto")}</div>
        <div class="toggle-row"><span><div class="tl">«회원 지정» 표시 범위</div><div class="td">«수업 만들기»에서 회원을 고를 때 보여줄 목록이에요</div></span>
          ${sel("App.setQuickScope(this.value)", [["valid", "유효 수업권 보유자만"], ["all", "전체 회원"], ["mine", "담당 회원만"]], P.quickScope)}</div>
      </div>
      <div class="sec-title">예약 취소 · 노쇼</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">조건부 취소 허용</div><div class="td">끄면 모든 취소 불가</div></span>${sw("cancelCond", P.cancelMode === "conditional")}</div>
        <div class="toggle-row"><span><div class="tl">취소 기한</div><div class="td">기한 지나 취소하면 횟수 차감</div></span>
          ${sel("App.setCancelHours(this.value)", [[6, "6시간 전"], [12, "12시간 전"], [24, "1일 전"], [48, "2일 전"], [72, "3일 전"]], P.cancelHours)}</div>
        <div class="toggle-row"><span><div class="tl">노쇼 시 횟수 차감</div><div class="td">끄면 노쇼여도 횟수를 차감하지 않아요</div></span>${sw("noshowDeduct", P.noshowDeduct)}</div>
        <div class="toggle-row"><span><div class="tl">노쇼 판정</div><div class="td">선생님이 노쇼를 보고하면 회원에게 알림이 가요. 아래 이의제기 기간 안에 이의가 없으면 자동 확정되고 횟수가 차감돼요. 이의가 들어온 건만 센터가 판단해요.</div></span>
          ${sel("App.setNoshowActor(this.value)", [["teacher_report", "선생님 보고 → 자동확정"], ["center_only", "센터만 판정"]], P.noshowActor)}</div>
      </div>
      <div class="sec-title">수강확인</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">개인수업 확인 필수</div><div class="td">회원이 확인해야 횟수가 차감되고 정산돼요</div></span>${sw("signPrivate", P.signPrivate)}</div>
        <div class="toggle-row"><span><div class="tl">그룹수업 확인 필수</div><div class="td">끄면 그룹수업은 출석 체크만으로 차감돼요 · 이의제기 기간은 그대로 유지돼요</div></span>${sw("signGroup", P.signGroup)}</div>
        <div class="toggle-row"><span><div class="tl">회원 앱 확인</div><div class="td">회원 본인 폰에서 원탭 확인 (기본 경로)</div></span>${sw("methodApp", P.methodApp)}</div>
        <div class="toggle-row"><span><div class="tl">현장 QR 확인</div><div class="td">선생님이 띄운 일회용 QR을 회원이 본인 폰으로 스캔해요 · 그 수업 1건에만 쓸 수 있고 몇 분 뒤 만료돼요</div></span>${sw("methodQr", P.methodQr)}</div>
        <div class="toggle-row"><span><div class="tl">무응답 자동확정</div><div class="td">알림을 2번 보낸 뒤에도 응답이 없으면 자동확정돼요 · 자동확정 표시가 남아요</div></span>
          ${sel("App.setAutoConfirm(this.value)", [[12, "12시간 후"], [24, "24시간 후"], [48, "48시간 후"], [0, "사용 안 함"]], P.autoConfirmHours)}</div>
        <div class="toggle-row"><span><div class="tl">이의제기 기간</div><div class="td">기간 안에 이의가 접수되면 그 회차 정산이 보류돼요</div></span>
          ${sel("App.setDispute(this.value)", [[3, "3일"], [7, "7일"], [14, "14일"]], P.disputeDays)}</div>
      </div>
      <div class="sec-title">수업 개설 권한 (선생님)</div>
      <div class="card">
        <div class="field"><label>센터 지정 선생님</label>
          ${polEditBlock("auth",
            polSummary((P.classAuth.memberIds || []).map((mid) => (DB.teachers.find((t) => t.memberId === mid) || { name: mid }).name), "명"),
            "선생님 이름·직군 검색", `선생님 총 ${DB.teachers.length.toLocaleString("ko-KR")}명 — 검색해 지정·해제해 주세요`)}
          <div class="hint">지정된 선생님은 본인 수업의 개설·수정·폐강이 가능해요.</div></div>
        <div class="field"><label>자격 멤버십</label>
          ${polEditBlock("prod",
            polSummary((P.classAuth.productIds || []).map((pid) => (DB.products.find((p) => p.id === pid) || { name: pid }).name), "개"),
            "멤버십 이름 검색", `멤버십 총 ${DB.products.length.toLocaleString("ko-KR")}개`)}
          <div class="hint">이 멤버십(유효 수업권)을 보유한 선생님 계정도 개설 권한을 가져요 — 예: 그룹 필라테스 멤버십.</div></div>
        <div class="muted small">${(() => {
          const authed = DB.teachers.filter((t) => classAuth(t).ok);
          const byCenter = authed.filter((t) => classAuth(t).via === "센터 지정").length;
          return `현재 개설 권한 보유: <b>${authed.length.toLocaleString("ko-KR")}명</b> / 선생님 ${DB.teachers.length.toLocaleString("ko-KR")}명 (센터 지정 ${byCenter}명 · 멤버십 자격 ${authed.length - byCenter}명)`;
        })()}<br>둘 다 비우면 수업 개설·관리는 센터만 가능해요. 선생님 계정은 호스트 앱(니짐내짐) 회원 계정과 연결돼요.</div>
      </div>
      <div class="sec-title">선생님별 지정 가능 회원 범위</div>
      <div class="card">
        <div class="pk">
          <div class="pk-tools"><input type="search" placeholder="선생님 이름·직군 검색" value="${(polState().q.scope || "").replaceAll('"', "&quot;")}" oninput="App.polQuery('scope', this.value)" autocomplete="off" aria-label="선생님 검색"></div>
          <div class="pk-total">선생님 총 ${DB.teachers.length.toLocaleString("ko-KR")}명 — 행을 누르면 범위를 설정해요</div>
          <div class="pk-results tall"><div id="pol-scope-list">${polScopeRows()}</div></div>
        </div>
        <div class="muted small mt8">범위를 설정하지 않으면 <b>전체 회원</b>이 기본이에요. 이 범위는 선생님이 수업을 만들 때 고르는 <b>«지정 회원» 목록</b>과 <b>«회원 지정해서 바로 확정» 회원 목록</b>에 적용돼요. 전체 회원으로 두거나, 멤버십 단위로 좁히거나, 멤버십 안에서 회원을 개별로 고를 수 있어요. 이미 만들어진 수업의 지정 회원은 바뀌지 않아요.</div>
      </div>
      <div class="sec-title">정산 · 샐리 연동</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">노쇼 회차 선생님 보상</div><div class="td">센터마다 방침이 달라 센터별로 설정해요 · 바꾸면 정산 미리보기에 바로 반영돼요</div></span>
          ${sel("App.setNoshowReward(this.value)", [["none", "보상 없음 (기본)"], ["support", "보상 지원"]], P.noshowReward)}</div>
        ${P.noshowReward === "support" ? `
        <div class="toggle-row"><span><div class="tl">보상 단가</div><div class="td">정상 단가=해당 수업권 회당 단가 그대로</div></span>
          ${sel("App.setNoshowRewardPrice(this.value)", [["normal", "정상 단가"], ["custom", "별도 단가 지정"]], P.noshowRewardPrice)}</div>
        ${P.noshowRewardPrice === "custom" ? `<div class="toggle-row"><span><div class="tl">별도 단가 방식</div><div class="td">고정 금액 또는 수업료 대비 비율</div></span>
          ${sel("App.setNoshowRewardCustomMode(this.value)", [["amount", "고정 금액(원)"], ["percent", "수업료의 %"]], P.noshowRewardCustomMode || "amount")}</div>
        ${(P.noshowRewardCustomMode || "amount") === "percent" ? `<div class="toggle-row"><span><div class="tl">보상 비율 (%)</div><div class="td">회당 단가(정상 단가)의 n% · 0~100 · 원 단위 반올림</div></span>
          <span style="display:inline-flex;align-items:center;gap:6px"><input type="number" min="0" max="100" value="${P.noshowRewardPercent}" oninput="App.previewNoshowPct(this.value)" onchange="App.setNoshowRewardPercent(this.value)" style="width:80px;border:1px solid var(--border-strong);border-radius:10px;padding:8px 10px;text-align:right;font-weight:700"><b>%</b></span></div>
        <div class="muted small" id="nsPctPreview" style="padding:0 4px 10px">${pctPreviewText(P.noshowRewardPercent)}</div>` : `<div class="toggle-row"><span><div class="tl">별도 단가 (원)</div><div class="td">노쇼 1건당 보상액</div></span>
          <input type="number" value="${P.noshowRewardCustom}" onchange="App.setNoshowRewardCustom(this.value)" style="width:110px;border:1px solid var(--border-strong);border-radius:10px;padding:8px 10px;text-align:right;font-weight:700"></div>`}` : ""}
        <div class="toggle-row"><span><div class="tl">샐리 전달 방식</div><div class="td">자동이면 샐리로 바로 보내요 · 수동이면 샐리에서 직접 체크해 지급해요</div></span>
          ${sel("App.setNoshowRewardPush(this.value)", [["auto", "자동 push"], ["manual", "샐리 수동 체크"]], P.noshowRewardPush)}</div>` : ""}
      </div>
      <p class="muted small">정책을 바꿔도 이미 잡힌 예약·구매한 수업권에는 적용되지 않아요 — 취소 조건은 예약할 때 기준으로 보존돼요.</p>`);
  }
  // v2.7: P2-2b 범위 편집 상세 화면 — 리스트 행 탭으로 진입 (인라인 전체 펼침 제거, 기능은 v2.3 그대로)
  function vCPolicyScope(tid) {
    const t = teacher(tid);
    if (!t) return vCPolicy();
    const S = tScope(tid);
    return shell("c", `회원 범위 · ${t.name}`, `
      <div class="card">
        <div class="field"><label>${t.name} 선생님 (${t.subject}) — 지정 가능 회원 범위</label>
          <div class="seg">
            <button${S.mode === "all" ? ' class="on"' : ""} onclick="App.scopeMode('${tid}','all')">전체 회원</button>
            <button${S.mode === "custom" ? ' class="on"' : ""} onclick="App.scopeMode('${tid}','custom')">범위 지정</button></div>
          ${S.mode === "custom" ? `<div class="scope-prod">
            <div class="muted small" style="font-weight:700;margin-bottom:6px">멤버십 단위 (보유 회원 전체 포함)</div>
            <div class="chips">${DB.products.map((p) => {
              const full = (S.productIds || []).includes(p.id);
              return `<button class="chip${full ? " on" : ""}" onclick="App.scopeProduct('${tid}','${p.id}')">${p.name} 전체 (${holdersOf(p.id).length.toLocaleString("ko-KR")}명)</button>`;
            }).join("")}</div>
            <div class="hint">«전체»를 켜면 그 멤버십의 유효 수업권 보유 회원 전체가 범위에 들어요. 일부 회원만 지정하려면 «전체»를 끄고 아래에서 검색해 개별 추가해 주세요.</div>
            <div class="mt8">${pickerHtml("scope-" + tid, { multi: true, selected: S.memberIds || [], pool: DB.members.filter((m) => !m.staff), commit: (mid) => App.scopeMember(tid, mid) })}</div>
          </div>` : ""}
          <div class="muted small mt4">현재 범위: <b>${tScopeLabel(tid)}</b></div>
        </div>
        <div class="muted small">범위를 설정하지 않으면 <b>전체 회원</b>이 기본이에요. 이 범위는 선생님이 수업을 만들 때 고르는 <b>«지정 회원» 목록</b>과 <b>«회원 지정해서 바로 확정» 회원 목록</b>에 적용돼요. 이미 만들어진 수업의 지정 회원은 바뀌지 않아요.</div>
      </div>
      <button class="btn ghost" onclick="location.hash='#/c/policy'">‹ 정책 설정으로 돌아가기</button>`, { back: true });
  }

  // ── v2.13: 현장 일회용 QR (04 수단 B — PIN 폐지 대체) ──
  // 토큰=완료 보고(rpId) 1건 전용·발급 후 5분 만료 표기·확인 성립 즉시 무효화(used). 회원 본인 계정만 확인 가능.
  const qrTokens = {};
  function qrSvg(token) {
    // 결정적 의사 QR — 토큰 문자열 해시로 데이터 셀 생성 (프로토타입 시각화용, 실서비스=실제 QR 라이브러리)
    const N = 21, cell = 8;
    let h = 5381;
    for (const ch of token) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
    const bit = (x, y) => { const v = (h ^ (x * 73856093) ^ (y * 19349663)) >>> 0; return ((v * 2654435761) >>> 0) % 100 < 46; };
    const inFinder = (x, y) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
    const rects = [];
    const finder = (fx, fy) => {
      rects.push(`<rect x="${fx * cell}" y="${fy * cell}" width="${7 * cell}" height="${7 * cell}" fill="#16161c"/>`);
      rects.push(`<rect x="${(fx + 1) * cell}" y="${(fy + 1) * cell}" width="${5 * cell}" height="${5 * cell}" fill="#fff"/>`);
      rects.push(`<rect x="${(fx + 2) * cell}" y="${(fy + 2) * cell}" width="${3 * cell}" height="${3 * cell}" fill="#16161c"/>`);
    };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++)
      if (!inFinder(x, y) && bit(x, y)) rects.push(`<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="#16161c"/>`);
    return `<svg class="qr-svg" viewBox="0 0 ${N * cell} ${N * cell}" role="img" aria-label="수강확인 QR 코드">${rects.join("")}</svg>`;
  }
  // 회원 측 QR 랜딩 (#/m/qr/:token) — 시뮬레이션: 실서비스에선 회원 폰 카메라 스캔이 이 화면을 연다
  function vMQr(token) {
    const errCard = (em, title, desc, backTo) => shell("m", "QR 수강 확인", `
      <div class="card" style="text-align:center;padding:32px 16px">
        <div style="font-size:40px">${em}</div><b style="font-size:17px">${title}</b>
        <p class="muted mt8">${desc}</p></div>
      <a class="btn ghost" href="${backTo || "#/m/home"}">돌아가기</a>`, { back: true });
    const t = qrTokens[token];
    if (!t) return errCard("⌛", "유효하지 않은 QR이에요", "만료됐거나 잘못된 코드예요.<br>선생님 화면에서 QR을 새로 띄워 주세요.");
    if (t.used) return errCard("🔒", "이미 사용된 QR이에요", "QR은 일회용이라 확인이 끝나면 바로 만료돼요.<br>다시 쓸 수 없어요.");
    const r = DB.reports.find((x) => x.id === t.rpId);
    const b = r && r.bookingId ? DB.bookings.find((x) => x.id === r.bookingId) : null;
    if (!r || !b || r.status !== "pending" || b.status !== "confirm_wait")
      return errCard("✅", "이미 처리된 수업이에요", "이 수업 건은 확인·처리가 끝났어요.<br>내 예약에서 상태를 확인해 주세요.", "#/m/bookings");
    // 확인 권한=회원 본인 계정 귀속 — 타 회원·타 수업 유용 불가
    if (b.memberId !== DB.me.member)
      return errCard("🚫", "내 수업의 QR이 아니에요", `이 QR은 <b>${r.member}</b> 회원의 해당 수업 1건 전용이에요.<br>다른 회원·다른 수업에는 쓸 수 없어요.`);
    const s = slot(b.slotId); const c = cls(s.classId);
    return shell("m", "QR 수강 확인", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div>
        <div class="divider"></div>
        <p style="font-size:15px">현장에서 QR로 확인 중이에요.<br><span class="muted small">확인하면 수업권 1회가 차감되고, 이 기록으로 선생님 수업료가 정산돼요.</span></p></div>
      <div class="banner"><span class="ic">🔐</span><span>이 QR은 <b>이 수업 1건 전용</b>이에요 · 발급 후 <b>5분 만료</b> · 확인이 끝나면 바로 만료돼 다시 쓸 수 없어요. 확인은 <b>회원 본인 계정</b>에서만 할 수 있어요.</span></div>
      <button class="btn primary" onclick="App.qrConfirm('${token}')">받았어요 (수업 확인)</button>
      <button class="btn danger-ghost mt8" onclick="App.askDispute('${b.id}')">문제가 있어요 (이의제기)</button>`, { back: true });
  }

  // ── 액션 ──
  const App = {
    closeModal,
    // v2.4: 검색 picker — 검색·필터·점진 로딩은 picker 서브트리만 갱신 (입력 포커스 유지, 전체 재렌더 금지)
    pkQuery(id, v) { const st = pickers[id]; if (!st) return; st.query = v; st.shown = PK_PAGE; pkRefresh(id); },
    pkProd(id, v) { const st = pickers[id]; if (!st) return; st.prod = v; st.shown = PK_PAGE; pkRefresh(id); },
    pkMore(id) { const st = pickers[id]; if (!st) return; st.shown += PK_PAGE; pkRefresh(id); },
    pkScroll(id, el) {
      const st = pickers[id]; if (!st) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60 && st.shown < pkMatches(st).length) { st.shown += PK_PAGE; pkRefresh(id); }
    },
    pkToggle(id, mid) {
      const st = pickers[id]; if (!st) return;
      if (st.opts.commit) { st.opts.commit(mid); return; } // controlled(P2-2b): DB가 진실 — 커밋이 재렌더
      if (!st.opts.multi) st.sel = st.sel.has(mid) ? new Set() : new Set([mid]);
      else if (st.sel.has(mid)) st.sel.delete(mid);
      else {
        // opts.limit: 추가 시점마다 재평가 — 수업·회차 셀렉트에 따라 한도가 실시간으로 달라짐
        const lim = st.opts.limit ? st.opts.limit() : null;
        if (lim && st.sel.size >= lim.max) { toast(lim.msg); return; }
        st.sel.add(mid);
      }
      pkRefresh(id);
    },
    tsTab(v) { tSchedTab = v; render(); },
    seg(btn) {
      btn.parentElement.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
    },
    segElig(btn, prefix) {
      App.seg(btn);
      const v = btn.dataset.v;
      const pw = document.getElementById(prefix + "-prod-wrap");
      const mw = document.getElementById(prefix + "-mem-wrap");
      if (pw) pw.style.display = v === "list" ? "none" : "";
      if (mw) mw.style.display = v === "pass" ? "none" : "";
    },
    chip(btn) { btn.classList.toggle("on"); },
    buy(pid) {
      const p = DB.products.find((x) => x.id === pid);
      const id = nid("ps");
      const exp = p.validityDays ? addDays(DB.TODAY, p.validityDays) : null;
      // 회원 자가 구매 = 판매가 결제(이벤트 할인가 있으면 할인가) — 동일한 구매 시점 스냅샷 로직
      const sale = p.salePrice != null && p.salePrice < p.price;
      const pay = sale ? p.salePrice : p.price;
      DB.passes.push({ id, memberId: DB.me.member, productId: p.id, name: p.name, kind: p.kind, total: p.sessions, unitPrice: Math.floor(pay / p.sessions), purchasePrice: pay, listPrice: p.price, expiresAt: exp, remaining: p.sessions });
      pushLedger(id, p.sessions, "구매", `${p.name} · ${won(pay)}${sale ? ` (정가 ${won(p.price)} · 이벤트 할인)` : ""}`);
      toast("구매 완료! 수업권이 지갑에 담겼어요 💪 (mock 결제)");
      location.hash = "#/m/home";
    },
    // v2.9: 센터 수업권 판매·등록 — 실구매가 입력, unitPrice=floor(실구매가÷총횟수) 스냅샷 (05 문서)
    sellProd(pid) {
      const p = DB.products.find((x) => x.id === pid);
      const priceEl = document.getElementById("sell-price");
      const unitEl = document.getElementById("sell-unit");
      if (priceEl) priceEl.value = p.price;
      if (unitEl) unitEl.innerHTML = sellUnitText(p, p.price);
    },
    sellPreview() {
      const p = DB.products.find((x) => x.id === document.getElementById("sell-prod").value);
      const price = Math.max(0, parseInt(document.getElementById("sell-price").value, 10) || 0);
      const unitEl = document.getElementById("sell-unit");
      if (unitEl) unitEl.innerHTML = sellUnitText(p, price);
    },
    sellPass() {
      const mid = pkSelected("sell-mem")[0];
      if (!mid) { toast("회원을 먼저 검색해 선택해 주세요."); return; }
      const p = DB.products.find((x) => x.id === document.getElementById("sell-prod").value);
      const price = Math.max(0, parseInt(document.getElementById("sell-price").value, 10) || 0);
      if (!price) { toast("실구매가를 입력해 주세요."); return; }
      const id = nid("ps");
      const exp = p.validityDays ? addDays(DB.TODAY, p.validityDays) : null;
      const unit = Math.floor(price / p.sessions);
      DB.passes.push({ id, memberId: mid, productId: p.id, name: p.name, kind: p.kind, total: p.sessions, unitPrice: unit, purchasePrice: price, listPrice: p.price, expiresAt: exp, remaining: p.sessions });
      pushLedger(id, p.sessions, "구매", `${p.name} · ${won(price)}${price < p.price ? ` (정가 ${won(p.price)} · 할인 등록)` : ""}`);
      delete pickers["sell-mem"];
      render();
      toast(`${memberName(mid)} 회원에게 ${p.name} 등록 완료 — 회당 ${won(unit)} 기준으로 저장했어요. (프로토타입 모의 결제)`);
    },
    book(slotId) {
      const s = slot(slotId);
      const c = cls(s.classId);
      const g = bookGuard(c, DB.me.member);
      if (!g.ok) { toast(g.msg); return; }
      if (isPast(s)) { toast("지난 회차는 예약할 수 없어요."); return; }
      // M-9: 같은 회차 중복 예약·대기 차단
      if (DB.bookings.some((b) => b.slotId === slotId && b.memberId === DB.me.member && ACTIVE.includes(b.status))) { toast("이미 이 회차에 예약·대기가 있어요."); return; }
      if (seatCount(slotId) >= c.capacity) { toast("정원이 마감됐어요."); render(); return; }
      // v2.25 ③: 회원이 «변경»으로 고른 수업권이 있으면 그것으로, 없으면 만료 임박 순 자동 선택
      const up = chosenPass(`s:${slotId}`, eligiblePasses(c, DB.me.member)) || g.pass;
      // S-3: 취소규정을 예약 시점에 스냅샷
      DB.bookings.push({ id: nid("bk"), slotId, memberId: DB.me.member, passId: up.id, status: "booked", policySnap: snapPolicy() });
      toast(`예약 완료! «${up.name}»에서 차감돼요. 취소 기한 조건은 지금 시점 기준으로 보존돼요.`);
      location.hash = "#/m/bookings";
    },
    joinWaitlist(slotId) {
      const s = slot(slotId);
      const c = cls(s.classId);
      if (c.kind === "private") { toast("1:1 수업은 대기를 받지 않아요."); return; }
      if (!DB.policy.waitlist) { toast("이 센터는 대기를 받지 않아요."); return; }
      const g = bookGuard(c, DB.me.member);
      if (!g.ok) { toast(g.msg); return; }
      if (DB.bookings.some((b) => b.slotId === slotId && b.memberId === DB.me.member && ACTIVE.includes(b.status))) { toast("이미 이 회차에 예약·대기가 있어요."); return; }
      const pos = waitBk(slotId).length + 1;
      const up = chosenPass(`s:${slotId}`, eligiblePasses(c, DB.me.member)) || g.pass;
      DB.bookings.push({ id: nid("bk"), slotId, memberId: DB.me.member, passId: up.id, status: "waitlisted", pos, policySnap: snapPolicy() });
      toast(`대기 ${pos}번으로 등록됐어요. 자리가 나면 알려드릴게요!`);
      location.hash = "#/m/bookings";
    },
    // M-2/B4: 조율 요청 — 회차·예약을 만들지 않고 선생님 인박스로
    requestArrange(classId) {
      const c = cls(classId);
      const g = bookGuard(c, DB.me.member);
      if (!g.ok) { toast(g.msg); return; }
      const d = document.getElementById("arr-date").value || "2026-08-21";
      const t = document.getElementById("arr-time").value || "11:00";
      if (new Date(`${d}T${t}:00+09:00`) <= NOW) { toast("지난 일시로는 요청할 수 없어요."); return; }
      if (DB.arranges.some((a) => a.classId === classId && a.memberId === DB.me.member && a.status === "pending" && a.date === d && a.time === t)) { toast("같은 일시로 보낸 요청이 이미 있어요."); return; }
      const note = (document.getElementById("arr-note") || { value: "" }).value.trim();
      const up = chosenPass(`c:${classId}`, eligiblePasses(c, DB.me.member)) || g.pass;
      DB.arranges.push({ id: nid("ar"), classId, memberId: DB.me.member, passId: up.id, date: d, time: t, status: "pending", note, at: nowStamp });
      toast(`${teacher(c.teacherId).name} 선생님에게 조율 요청을 보냈어요. 수락하면 예약이 확정돼요.`);
      location.hash = "#/m/bookings";
    },
    arrangeCancel(arId) {
      const a = DB.arranges.find((x) => x.id === arId);
      if (!a || a.status !== "pending") return;
      a.status = "canceled";
      render();
      toast("조율 요청을 취소했어요.");
    },
    arrangeAccept(arId) {
      const a = DB.arranges.find((x) => x.id === arId);
      if (!a || a.status !== "pending") return;
      const c = cls(a.classId);
      if (c.status === "closed") { a.status = "declined"; a.reason = "폐강된 수업"; render(); toast("폐강된 수업이라 자동 거절 처리했어요."); return; }
      if (new Date(`${a.date}T${a.time}:00+09:00`) <= NOW) { toast("이미 지난 일시라 수락할 수 없어요. 거절 후 다시 조율해 주세요."); return; }
      let p = a.passId ? pass(a.passId) : null;
      if (!p || !passUsable(p)) p = eligiblePass(c, a.memberId);
      if (!p) { toast("회원 수업권이 만료·소진돼 수락할 수 없어요. 회원에게 안내해 주세요."); return; }
      // v2.25 ②: 수락하면 그 시간에 회차가 생긴다 — 같은 선생님 수업과 겹치면 확인 후 강행 허용
      const accept = () => {
        const s = { id: nid("s"), classId: c.id, date: a.date, time: a.time, status: "scheduled", adhoc: true };
        DB.slots.push(s);
        DB.bookings.push({ id: nid("bk"), slotId: s.id, memberId: a.memberId, passId: p.id, status: "booked", policySnap: snapPolicy(), fromArrange: a.id });
        a.status = "accepted"; a.slotId = s.id;
        closeModal(true); render();
        toast(`수락했어요. ${memberName(a.memberId)} 회원에게 확정 알림이 갔어요.`);
      };
      const hits = overlapSlots(c.teacherId, a.date, a.time, c.duration, []);
      if (hits.length) { overlapAsk(hits, accept); return; }
      accept();
    },
    arrangeDeclineAsk(arId) {
      // v2.22 ③: 거절에 대안 시간을 붙여 역제안 (선택) — 회원이 수락하면 그 시간으로 예약 확정
      modal(`<h3>조율 요청 거절</h3><p>거절 사유를 적어 주세요. 회원에게 그대로 전달돼요.</p>
        <div class="field mt12"><textarea id="ar-reason" rows="2" placeholder="예: 그 시간엔 다른 수업이 있어요. 12시 이후는 어떠세요?" style="width:100%;border:1px solid var(--border-strong);border-radius:12px;padding:12px"></textarea></div>
        <div class="field"><label>가능한 대안 시간 (선택)</label>
          <div class="row" style="gap:8px"><input type="date" id="ar-alt-date" min="${DB.TODAY}" style="flex:1"><input type="time" id="ar-alt-time" style="flex:1"></div>
          <div class="hint">시간을 넣으면 «이 시간은 어때요?» 대안 제안이 함께 가요 — 회원이 수락하면 그 시간으로 예약이 확정돼요. 비워두면 사유만 전달돼요.</div></div>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">돌아가기</button>
        <button class="btn primary" onclick="App.arrangeDecline('${arId}')">거절 보내기</button></div>`);
    },
    arrangeDecline(arId) {
      const a = DB.arranges.find((x) => x.id === arId);
      if (!a || a.status !== "pending") return;
      const reason = (document.getElementById("ar-reason") || { value: "" }).value.trim() || "일정이 맞지 않아요";
      // v2.22 ③: 대안 시간이 있으면 거절과 함께 대안 제안 생성
      const ad = (document.getElementById("ar-alt-date") || { value: "" }).value;
      const at = (document.getElementById("ar-alt-time") || { value: "" }).value;
      if ((ad && !at) || (!ad && at)) { toast("대안 시간을 보내려면 날짜와 시간을 모두 입력해 주세요."); return; }
      if (ad && at && new Date(`${ad}T${at}:00+09:00`) <= NOW) { toast("지난 일시로는 대안을 제안할 수 없어요."); return; }
      a.status = "declined"; a.reason = reason;
      if (ad && at) {
        DB.proposals.push({ id: nid("pp"), kind: "alt", teacherId: cls(a.classId).teacherId, memberId: a.memberId,
          classId: a.classId, arrangeId: a.id, date: ad, time: at, note: reason, status: "pending", at: nowStamp });
        closeModal(); render();
        toast("거절하고 대안 시간을 함께 보냈어요. 회원이 수락하면 그 시간으로 예약이 확정돼요.");
        return;
      }
      closeModal(); render();
      toast("거절했어요. 사유가 회원에게 전달됐어요.");
    },
    // ── v2.22: 선생님발 제안 액션 ──
    // ① 확정 예약 «일정 변경 제안» — 새 시간+사유 입력 모달
    propChangeAsk(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      if (!b || b.status !== "booked") { toast("확정 상태의 예약만 변경 제안할 수 있어요."); return; }
      // v2.25 ①: 그룹수업 거부 — UI를 숨기는 것과 별개로 액션 레벨에서도 막는다.
      if (!isPrivateClass(cls(slot(b.slotId).classId))) { toast(CHANGE_GROUP_MSG); return; }
      if (pendingChangeFor(bkId)) { toast("이 예약에는 답변을 기다리는 변경 제안이 이미 있어요."); return; }
      const s = slot(b.slotId);
      modal(`<h3>일정 변경 제안</h3><p><b>${memberName(b.memberId)}</b> 회원 · ${slotDesc(s)}</p>
        <div class="field mt12"><label>새 날짜</label><input type="date" id="pc-date" value="${s.date}" min="${DB.TODAY}"></div>
        <div class="field"><label>새 시간</label><input type="time" id="pc-time" value="${s.time}"></div>
        <div class="field"><label>사유 (회원에게 전달)</label><textarea id="pc-reason" rows="2" placeholder="예: 그날 센터 행사가 있어 시간을 옮기고 싶어요" style="width:100%;border:1px solid var(--border-strong);border-radius:12px;padding:12px"></textarea></div>
        <p class="muted small">회원이 <b>수락하면 예약이 새 일시로 바뀌고</b>, 거절하면 기존 일정이 그대로 유지돼요.</p>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">돌아가기</button>
        <button class="btn primary" onclick="App.propChangeSend('${bkId}')">변경 제안 보내기</button></div>`);
    },
    propChangeSend(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      if (!b || b.status !== "booked") { closeModal(); toast("확정 상태의 예약만 변경 제안할 수 있어요."); return; }
      const s = slot(b.slotId); const c = cls(s.classId);
      if (!isPrivateClass(c)) { closeModal(); toast(CHANGE_GROUP_MSG); return; }
      if (pendingChangeFor(bkId)) { closeModal(); toast("이 예약에는 답변을 기다리는 변경 제안이 이미 있어요."); return; }
      const d = (document.getElementById("pc-date") || { value: "" }).value;
      const t = (document.getElementById("pc-time") || { value: "" }).value;
      if (!d || !t) { toast("새 날짜와 시간을 입력해 주세요."); return; }
      if (new Date(`${d}T${t}:00+09:00`) <= NOW) { toast("지난 일시로는 제안할 수 없어요."); return; }
      if (d === s.date && t === s.time) { toast("지금 일정과 같은 시간이에요 — 다른 시간을 골라 주세요."); return; }
      const reason = (document.getElementById("pc-reason") || { value: "" }).value.trim() || "일정 조정이 필요해요";
      // v2.25 ②: 새 시간에 내 다른 수업이 있으면 경고 후 강행 허용 (회원에게는 남의 일정이 노출되지 않게 보낼 때 확인)
      const send = () => {
        DB.proposals.push({ id: nid("pp"), kind: "change", teacherId: c.teacherId, memberId: b.memberId, classId: c.id,
          bookingId: bkId, origDesc: `${dlabel(s.date)} ${s.time}`, date: d, time: t, note: reason, status: "pending", at: nowStamp });
        closeModal(); render();
        toast(`${memberName(b.memberId)} 회원에게 변경 제안을 보냈어요. 수락하면 예약이 바뀌어요.`);
      };
      const hits = overlapSlots(c.teacherId, d, t, c.duration, [s.id]);
      if (hits.length) { overlapAsk(hits, send); return; }
      send();
    },
    // ② 빈 시간 먼저 제안 — 자격은 보낼 때 + 수락 시 이중 검증 (04 원칙)
    proposeSlot() {
      const mid = pkSelected("pp-member")[0];
      if (!mid) { toast("회원을 검색해 선택해 주세요."); return; }
      const c = cls((document.getElementById("pp-class") || { value: "" }).value);
      if (!c) { toast("수업을 선택해 주세요."); return; }
      if (!inTScope(DB.me.teacher, mid)) { toast("내 «지정 가능 회원 범위» 밖 회원이에요 — 센터에 범위 확대를 요청해 주세요."); return; }
      const g = bookGuard(c, mid);
      if (!g.ok) { toast(`${memberName(mid)}: ${g.msg}`); return; }
      const d = (document.getElementById("pp-date") || { value: "" }).value;
      const t = (document.getElementById("pp-time") || { value: "" }).value;
      if (!d || !t) { toast("날짜와 시간을 입력해 주세요."); return; }
      if (new Date(`${d}T${t}:00+09:00`) <= NOW) { toast("지난 일시로는 제안할 수 없어요."); return; }
      if (DB.proposals.some((p) => p.memberId === mid && p.classId === c.id && p.date === d && p.time === t && propState(p) === "pending")) { toast("같은 일시로 보낸 제안이 이미 있어요."); return; }
      const note = (document.getElementById("pp-note") || { value: "" }).value.trim();
      const send = () => {
        DB.proposals.push({ id: nid("pp"), kind: "slot", teacherId: DB.me.teacher, memberId: mid, classId: c.id,
          date: d, time: t, note, status: "pending", at: nowStamp });
        delete pickers["pp-member"];
        closeModal(true);
        toast(`${memberName(mid)} 회원에게 제안을 보냈어요. 수락하면 예약이 확정돼요.`);
        location.hash = "#/t/inbox";
      };
      const hits = overlapSlots(DB.me.teacher, d, t, c.duration, []);
      if (hits.length) { overlapAsk(hits, send); return; }
      send();
    },
    propCancel(ppId) {
      const p = DB.proposals.find((x) => x.id === ppId);
      if (!p || propState(p) !== "pending") return;
      p.status = "canceled";
      render();
      toast("제안을 철회했어요. 회원에게 알림이 가요.");
    },
    // 회원: 수락 — change=예약 이동, slot·alt=예약 생성 (조율 수락과 동일 검증)
    propAccept(ppId) {
      const p = DB.proposals.find((x) => x.id === ppId);
      if (!p || p.memberId !== DB.me.member || p.status !== "pending") return;
      if (propState(p) === "expired") { toast("제안한 시간이 이미 지나 만료됐어요."); render(); return; }
      const c = cls(p.classId);
      if (!c || c.status === "closed") { p.status = "canceled"; render(); toast("폐강된 수업이라 수락할 수 없어요."); return; }
      if (p.kind === "change") {
        // v2.25 ①: 그룹수업 변경 제안은 성립하지 않는다 — 옛 제안이 남아 있어도 수락 단계에서 거부.
        if (!isPrivateClass(c)) { p.status = "canceled"; render(); toast(CHANGE_GROUP_MSG); return; }
        const b = DB.bookings.find((x) => x.id === p.bookingId);
        const s0 = b && slot(b.slotId);
        if (!b || b.status !== "booked" || !s0 || s0.status !== "scheduled") {
          p.status = "canceled"; render(); toast("원래 예약이 취소되거나 바뀌어서 이 제안은 처리할 수 없어요."); return;
        }
        const ns = { id: nid("s"), classId: c.id, date: p.date, time: p.time, status: "scheduled", adhoc: true };
        DB.slots.push(ns);
        b.slotId = ns.id; b.fromProposal = p.id;
        p.status = "accepted"; p.slotId = ns.id;
        promoteWaitlist(s0.id); cleanupSlot(s0);
        render();
        toast(`예약이 ${dlabel(p.date)} ${p.time}로 변경됐어요. 선생님에게 알림이 갔어요.`);
        return;
      }
      const g = bookGuard(c, DB.me.member);
      if (!g.ok) { toast(g.msg); return; }
      if (DB.bookings.some((x) => { const s = slot(x.slotId); return x.memberId === DB.me.member && ACTIVE.includes(x.status) && s && s.status !== "canceled" && s.date === p.date && s.time === p.time; })) { toast("같은 일시에 이미 예약이 있어요."); return; }
      const ns = { id: nid("s"), classId: c.id, date: p.date, time: p.time, status: "scheduled", adhoc: true };
      DB.slots.push(ns);
      DB.bookings.push({ id: nid("bk"), slotId: ns.id, memberId: DB.me.member, passId: g.pass.id, status: "booked", policySnap: snapPolicy(), fromProposal: p.id });
      p.status = "accepted"; p.slotId = ns.id;
      render();
      toast(`수락했어요! ${dlabel(p.date)} ${p.time} 예약이 확정됐어요.`);
    },
    propDeclineAsk(ppId) {
      const p = DB.proposals.find((x) => x.id === ppId);
      if (!p || propState(p) !== "pending") return;
      modal(`<h3>제안 거절</h3><p>${p.kind === "change" ? "거절하면 기존 예약이 그대로 유지돼요." : "거절하면 이 제안은 사라져요."} 사유는 선생님에게 그대로 전달돼요.</p>
        <div class="field mt12"><textarea id="pp-reason" rows="2" placeholder="예: 그 시간엔 다른 일정이 있어요" style="width:100%;border:1px solid var(--border-strong);border-radius:12px;padding:12px"></textarea></div>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">돌아가기</button>
        <button class="btn primary" onclick="App.propDecline('${ppId}')">거절 보내기</button></div>`);
    },
    propDecline(ppId) {
      const p = DB.proposals.find((x) => x.id === ppId);
      if (!p || p.status !== "pending") return;
      p.declineReason = (document.getElementById("pp-reason") || { value: "" }).value.trim() || "일정이 맞지 않아요";
      p.status = "declined";
      closeModal(); render();
      toast(p.kind === "change" ? "거절했어요. 기존 예약은 그대로 유지돼요." : "거절했어요. 사유가 선생님에게 전달됐어요.");
    },
    askCancel(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      const s = slot(b.slotId);
      if (b.status === "waitlisted") {
        modal(`<h3>대기를 취소할까요?</h3><p>${slotDesc(s)}<br>대기 취소는 횟수 차감이 없어요.</p>
          <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">아니요</button>
          <button class="btn primary" onclick="App.doCancel('${bkId}', false)">대기 취소</button></div>`);
        return;
      }
      // S-3: 판정은 예약 시점 스냅샷만 사용 — 이후 정책 변경 소급 없음
      const snap = b.policySnap || snapPolicy();
      const h = hoursUntil(s);
      if (snap.cancelMode !== "conditional") {
        modal(`<h3>취소할 수 없어요</h3><p>예약 당시 규정상 취소가 불가한 예약이에요. 센터에 문의해 주세요.</p>
          <div class="btn-row"><button class="btn primary" onclick="App.closeModal()">확인</button></div>`);
        return;
      }
      if (h >= snap.cancelHours) {
        modal(`<h3>예약을 취소할까요?</h3><p>${slotDesc(s)}<br>예약 당시 기한(${snap.cancelHours}시간 전) 안이라 <b style="color:var(--success)">횟수 차감 없이</b> 취소돼요.</p>
          <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">아니요</button>
          <button class="btn primary" onclick="App.doCancel('${bkId}', false)">무료 취소</button></div>`);
      } else {
        modal(`<h3>⚠️ 지금 취소하면 1회 차감돼요</h3><p>${slotDesc(s)}<br>예약 당시 취소 기한(수업 ${snap.cancelHours}시간 전)이 지났어요. 지금 취소하면 <b style="color:var(--danger)">횟수 환불 없이 1회가 차감</b>돼요.</p>
          <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">그냥 둘게요</button>
          <button class="btn danger-ghost" onclick="App.doCancel('${bkId}', true)">차감하고 취소</button></div>`);
      }
    },
    doCancel(bkId, forfeit) {
      const b = DB.bookings.find((x) => x.id === bkId);
      const s = slot(b.slotId);
      const wasSeat = b.status === "booked";
      if (b.status === "waitlisted") {
        const myPos = b.pos;
        b.status = "canceled";
        waitBk(s.id).filter((x) => x.pos > myPos).forEach((x) => (x.pos -= 1));
        toast("대기를 취소했어요.");
      } else if (forfeit) {
        b.status = "forfeited";
        const p = b.passId && pass(b.passId);
        if (p && p.remaining > 0) {
          p.remaining -= 1;
          pushLedger(p.id, -1, "기한 위반 취소", slotDesc(s));
          toast("취소됐어요. 기한이 지나 1회가 차감됐어요.");
        } else {
          toast("취소됐어요. 잔여 0회라 차감 대신 센터 예외처리로 넘어가요.");
        }
      } else {
        b.status = "canceled";
        toast("취소됐어요. 횟수 차감은 없어요.");
      }
      if (wasSeat) promoteWaitlist(s.id);
      cleanupSlot(s);
      closeModal(); render();
    },
    centerCancelAsk(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      const s = slot(b.slotId);
      modal(`<h3>${memberName(b.memberId)} 회원 예약을 취소할까요?</h3><p>${slotDesc(s)}<br>센터 취소는 횟수 차감이 없고, 회원에게 알림이 가요.${waitBk(s.id).length ? " 대기 1번이 자동 승격돼요." : ""}</p>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">아니요</button>
        <button class="btn primary" onclick="App.centerCancel('${bkId}')">센터 취소</button></div>`);
    },
    centerCancel(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      if (!b || b.status !== "booked") { closeModal(); return; }
      const s = slot(b.slotId);
      b.status = "canceled"; b.cancelBy = "center";
      promoteWaitlist(s.id);
      cleanupSlot(s);
      closeModal(); render();
      toast(`${memberName(b.memberId)} 회원 예약을 취소했어요. 알림을 보냈어요.`);
    },
    // S-1: 상태·보고 검증 후에만 확인 성립. v2.13: 확인 권한=회원 본인 계정 귀속 (대리 확인 불가)
    confirmAttend(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      if (b && b.memberId !== DB.me.member) { toast("확인은 해당 수업 회원 본인 계정에서만 가능해요."); return; }
      const r = b && DB.reports.find((x) => x.bookingId === b.id && x.status === "pending");
      if (!b || b.status !== "confirm_wait" || !r) { toast("아직 확인할 단계가 아니에요 — 완료 보고 후에 확인할 수 있어요."); return; }
      const res = confirmTx(b, r, "앱 확인");
      if (!res.ok) { modal(`<h3>처리할 수 없어요</h3><p>${res.msg}</p><div class="btn-row"><button class="btn primary" onclick="App.closeModal()">확인</button></div>`); return; }
      render();
      toast("확인 완료! 수업권 1회가 차감됐어요.");
    },
    askDispute(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      const pre = b && ["confirm_wait", "noshow_wait"].includes(b.status);
      modal(`<h3>어떤 문제가 있었나요?</h3><p class="mt4">${pre ? "이의제기가 접수되면 확인·차감 없이 센터가 심사해요." : "이미 차감된 회차예요. 접수되면 정산이 보류되고, 이의가 인정되면 횟수가 복원돼요."}</p>
        <div class="field mt12"><textarea id="dp-reason" rows="3" placeholder="예: 이 수업을 받은 적이 없어요" style="width:100%;border:1px solid var(--border-strong);border-radius:12px;padding:12px"></textarea></div>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">돌아가기</button>
        <button class="btn primary" onclick="App.doDispute('${bkId}')">이의제기 접수</button></div>`);
    },
    doDispute(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      const reason = (document.getElementById("dp-reason") || { value: "" }).value.trim();
      const r = DB.reports.find((x) => x.bookingId === bkId && ["pending", "confirmed", "auto", "noshow_wait"].includes(x.status));
      const pre = ["confirm_wait", "noshow_wait"].includes(b.status);
      b.status = "disputed";
      if (r) {
        r.status = "disputed"; r.label = "이의제기"; r.disputeReason = reason || undefined;
        // S-5: 확정 후 이의 → 정산 라인 보류
        const l = r.lineId && line(r.lineId);
        if (l && l.status === "eligible") l.status = "held";
      }
      closeModal();
      location.hash = "#/m/bookings";
      toast(pre ? "접수됐어요. 확인·차감 없이 센터가 심사해요." : "접수됐어요. 차감은 유지된 채 정산이 보류돼요 — 이의가 인정되면 복원돼요.");
    },
    // 선생님 완료 보고 — 회원별 참석/노쇼 (M-11), 수강확인 필수 정책 분기 (M-6)
    reportAsk(slotId) {
      const s = slot(slotId);
      const c = cls(s.classId);
      const seats = DB.bookings.filter((b) => b.slotId === slotId && b.status === "booked");
      if (!seats.length) { toast("보고할 참석자가 없어요."); return; }
      const needConfirm = c.kind === "private" ? DB.policy.signPrivate : DB.policy.signGroup;
      modal(`<h3>수업 완료 보고</h3><p>${slotDesc(s)} · ${seats.length}명</p>
        ${seats.map((b) => `<div class="toggle-row"><span><div class="tl">${memberName(b.memberId)}</div></span>
          <div class="seg seg-sm" id="att-${b.id}" style="width:150px">
            <button class="on" data-v="attend" onclick="App.seg(this)">참석</button>
            <button data-v="noshow" onclick="App.seg(this)">노쇼</button></div></div>`).join("")}
        <p class="muted small mt8">${needConfirm
          ? "보고하면 각 회원에게 수강 확인 요청이 가요. 회원이 확인해야 차감·정산돼요."
          : `이 수업은 확인 생략(출석 체크) 정책이라 보고 즉시 차감돼요. 회원에게 즉시 알림이 가고 ${DB.policy.disputeDays}일 안에 이의제기할 수 있어요.`}
          ${DB.policy.noshowDeduct ? ` 노쇼로 보고하면 회원에게 바로 알림이 가고, ${DB.policy.disputeDays}일 안에 이의가 없으면 자동 확정되고 횟수가 차감돼요.` : " 노쇼는 차감 없이 종결돼요."}</p>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">취소</button>
        <button class="btn primary" onclick="App.submitReport('${slotId}')">보고하기</button></div>`);
    },
    submitReport(slotId) {
      const s = slot(slotId);
      const c = cls(s.classId);
      const needConfirm = c.kind === "private" ? DB.policy.signPrivate : DB.policy.signGroup;
      const seats = DB.bookings.filter((b) => b.slotId === slotId && b.status === "booked");
      let asked = 0, deducted = 0, noshow = 0;
      for (const b of seats) {
        const segEl = document.querySelector(`#att-${b.id} .on`);
        const v = segEl ? segEl.dataset.v : "attend";
        if (v === "noshow") {
          noshow++;
          if (DB.policy.noshowDeduct) {
            b.status = "noshow_wait";
            // 형 확정(08-17): 보고 즉시 회원 통지 → 무이의 시 자동 확정. unitPrice=보상 정산용 스냅샷(P9-1)
            const np = b.passId && pass(b.passId);
            DB.reports.unshift({ id: nid("rp"), slotId, bookingId: b.id, memberId: b.memberId, member: memberName(b.memberId), teacherId: c.teacherId, date: s.date, unitPrice: np ? np.unitPrice : 0, noshow: true, status: "noshow_wait", method: null, label: "노쇼 보고 · 이의기간", at: "8/17 12:00 보고", deducted: false, lineId: null });
          } else {
            b.status = "canceled"; b.cancelBy = "noshow";
          }
          continue;
        }
        const r = { id: nid("rp"), slotId, bookingId: b.id, memberId: b.memberId, member: memberName(b.memberId), status: "pending", method: null, label: "회원 확인 대기", at: "8/17 12:00 보고", deducted: false, lineId: null };
        DB.reports.unshift(r);
        if (needConfirm) {
          b.status = "confirm_wait"; asked++;
        } else {
          const res = confirmTx(b, r, "출석 체크");
          if (res.ok) deducted++;
          else { b.status = "confirm_wait"; r.label = "처리 보류 — " + res.msg; asked++; }
        }
      }
      closeModal(); render();
      const parts = [];
      if (asked) parts.push(`확인 요청 ${asked}명`);
      if (deducted) parts.push(`출석 체크 차감 ${deducted}명`);
      if (noshow) parts.push(DB.policy.noshowDeduct ? `노쇼 ${noshow}명 (회원에게 알림 · 이의 없으면 자동확정)` : `노쇼 ${noshow}명 (차감 없이 종결)`);
      toast(`완료 보고했어요 — ${parts.join(" · ")}.`);
    },
    // v2.13: 현장 일회용 QR (04 수단 B — PIN 폐지 대체). 선생님은 QR을 띄울 뿐, 확인 성립은 회원 계정에서만.
    qrStart(rpId) {
      const r = DB.reports.find((x) => x.id === rpId);
      const b = r && r.bookingId && DB.bookings.find((x) => x.id === r.bookingId);
      if (!r || !b || r.status !== "pending" || b.status !== "confirm_wait") { toast("QR을 띄울 수 없는 상태예요 — 이미 처리됐어요."); return; }
      const token = "qt" + seq++;
      qrTokens[token] = { rpId, used: false };
      modal(`<h3>현장 QR 확인</h3>
        <p><b>${r.member}</b> 회원 · ${r.slotId ? slotDesc(slot(r.slotId)) : r.desc}</p>
        <div class="qr-wrap">${qrSvg(token)}
          <div class="qr-meta">코드 <b>${token.toUpperCase()}</b> · 발급 후 <b>5분 만료</b></div></div>
        <p class="muted small">이 QR은 <b>이 수업 1건 전용</b>이에요 — 다른 수업이나 다른 회원에게는 쓸 수 없어요. 확인이 끝나면 <b>바로 만료돼 다시 쓸 수 없어요</b>. 회원이 <b>본인 폰 카메라</b>로 스캔하면 회원 화면에서 확인이 진행돼요 — 이 기기에서는 대신 확인할 수 없어요.</p>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">닫기</button></div>
        <div class="demo-box"><span class="demo-cap">프로토타입 데모 — 실서비스에선 회원이 폰 카메라로 스캔해요</span><button class="btn sm demo" onclick="App.qrOpen('${token}')">${ici("phone")}회원 폰 화면 열기</button></div>`);
    },
    // 프로토타입 시뮬레이션 — 실서비스에선 회원 폰 카메라 스캔이 이 링크를 연다
    qrOpen(token) { closeModal(true); location.hash = "#/m/qr/" + token; },
    qrConfirm(token) {
      const t = qrTokens[token];
      if (!t || t.used) { toast("이미 사용됐거나 만료된 QR이에요."); render(); return; }
      const r = DB.reports.find((x) => x.id === t.rpId);
      const b = r && r.bookingId && DB.bookings.find((x) => x.id === r.bookingId);
      if (!r || !b || r.status !== "pending" || b.status !== "confirm_wait") { toast("이미 처리된 수업이에요."); render(); return; }
      if (b.memberId !== DB.me.member) { toast("확인은 해당 수업 회원 본인 계정에서만 가능해요."); return; }
      const res = confirmTx(b, r, "QR 확인");
      if (!res.ok) { modal(`<h3>처리할 수 없어요</h3><p>${res.msg}</p><div class="btn-row"><button class="btn primary" onclick="App.closeModal()">확인</button></div>`); return; }
      t.used = true; // 확인 성립 즉시 무효화 — 재스캔 시 «이미 사용된 QR»
      location.hash = "#/m/confirm/" + b.id;
      toast("QR 확인 완료! 수업권 1회가 차감됐고 QR은 만료됐어요.");
    },
    // ── v2.26 «수업 만들기» 통합 폼 액션 ──
    // 모든 상태 변경은 ccSync()로 입력값을 회수한 뒤 render() — 모드별 노출이 «초기 렌더»부터 맞도록.
    ccClass(role, v) {
      ccSync();
      const U = ccState(role);
      const before = U.classId;
      U.classId = v || "new";
      U.slotSel = "new";
      const c = U.classId === "new" ? null : cls(U.classId);
      U.elig = c ? c.eligibility : "pass";
      if (before !== U.classId) delete pickers["nc-mems"]; // 수업이 바뀌면 지정 회원은 그 수업 기준으로 다시
      App.ccTrim(role);
      render();
    },
    ccSlot(role, v) {
      ccSync();
      ccState(role).slotSel = v || "new";
      // 회차 변경은 한도만 달라진다 — select를 통째로 새로 그리지 않고 힌트만 갱신(선택 흐름 유지)
      App.ccTrim(role);
      const h = document.getElementById("qk-cap-hint");
      if (h) h.innerHTML = qkHintHtml(ccLimit());
      pkRefresh("qk-member");
    },
    ccFill(role, v) {
      ccSync();
      ccState(role).fill = v;
      App.ccTrim(role);
      render();
    },
    ccSeg(role, btn, key) {
      App.seg(btn);
      ccSync();
      ccState(role)[key] = btn.dataset.v;
      App.ccTrim(role);
      render();
    },
    // 한도(1:1 전환·정원 축소·잔여석)를 넘긴 선택은 앞선 선택만 남기고 잘라낸다
    ccTrim(role) {
      ccState(role);
      const lim = ccLimit();
      const st = pickers["qk-member"];
      if (st && st.sel.size > lim.max) { st.sel = new Set([...st.sel].slice(0, lim.max)); toast(lim.msg); }
    },
    ccSubmit(role) {
      ccSync();
      const U = ccState(role);
      const isNew = U.classId === "new" || !cls(U.classId);
      let c;
      if (isNew) {
        c = ccBuildClass(role); // 아직 DB에 넣지 않는다 — 검증을 모두 통과해야 만들어진다
        if (!c) return;
      } else {
        c = cls(U.classId);
        if (role === "t" && c.teacherId !== DB.me.teacher) { toast("내 담당 수업만 만들 수 있어요."); return; }
      }
      return U.fill === "assign" ? ccAssign(role, c, isNew) : ccOpen(role, c, isNew);
    },
    // v2.25 ②: 겹침 확인 모달 — [그래도 진행]은 보류해 둔 동작을 그대로 실행(차단하지 않음)
    overlapGo() {
      const fn = overlapPending; overlapPending = null;
      closeModal(true);
      if (fn) fn();
    },
    overlapCancel() {
      overlapPending = null;
      closeModal();
      toast("취소했어요. 시간을 바꿔서 다시 진행해 주세요.");
    },
    // v2.25 ③: 예약 화면 «사용 수업권 (변경)» — 기본은 만료 임박 순, 회원이 직접 다른 권으로 교체
    passPick(key) {
      const c = passCtxClass(key);
      if (!c) return;
      const list = eligiblePasses(c, DB.me.member);
      if (!list.length) { toast("이 수업에 쓸 수 있는 수업권이 없어요."); return; }
      const sel = chosenPass(key, list);
      modal(`<h3>사용할 수업권 선택</h3>
        <p class="muted small">기본은 <b>만료가 가장 임박한 수업권</b>부터 써요 (만료일이 같으면 먼저 등록한 것). 다른 수업권으로 바꿀 수 있어요.</p>
        ${list.map((p, i) => `<button class="btn ${p.id === sel.id ? "primary" : "ghost"} mt8 pass-opt" onclick="App.passChoose('${key}','${p.id}')">
          ${p.name}<span class="po-sub">${passLine(p)} · 회당 ${won(p.unitPrice)}${i === 0 ? " · 기본 (만료 임박)" : ""}</span></button>`).join("")}
        ${list.length === 1 ? `<p class="muted small mt12">지금 이 수업에 쓸 수 있는 수업권은 1장이에요.</p>` : ""}
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">닫기</button></div>`);
    },
    passChoose(key, pid) {
      bookPass[key] = pid;
      closeModal(true); render();
      const p = pass(pid);
      if (p) toast(`«${p.name}»으로 바꿨어요. 예약하면 이 수업권에서 차감돼요.`);
    },
    createProduct() {
      const name = document.getElementById("np-name").value.trim() || "새 수업권";
      const kind = document.querySelector("#np-kind .on").dataset.v;
      const sessions = parseInt(document.getElementById("np-sessions").value, 10) || 10;
      const price = parseInt(document.getElementById("np-price").value, 10) || 0;
      const noDays = document.getElementById("np-nodays").checked;
      const days = noDays ? null : parseInt(document.getElementById("np-days").value, 10) || 90;
      DB.products.push({ id: nid("pr"), name, kind, sessions, price, validityDays: days });
      render();
      toast(`«${name}» 상품이 개설됐어요.`);
    },
    // 시정①: 선생님의 수정·폐강 가드 — 본인 수업 + 권한 보유
    teachGuard(id, role) {
      if (role !== "t") return true;
      const c = cls(id);
      if (!c || c.teacherId !== DB.me.teacher) { toast("내 담당 수업만 관리할 수 있어요."); return false; }
      if (!classAuth(teacher(DB.me.teacher)).ok) { toast("수업 관리 권한이 없어요 — 센터 지정 또는 자격 멤버십이 필요해요."); return false; }
      return true;
    },
    // B1: 수업 수정
    updateClass(id, role) {
      if (!App.teachGuard(id, role)) return;
      const c = cls(id);
      const title = document.getElementById("ec-title").value.trim() || c.title;
      let cap = c.capacity;
      if (c.kind === "group") {
        cap = parseInt(document.getElementById("ec-cap").value, 10) || c.capacity;
        const maxSeat = Math.max(0, ...DB.slots.filter((s) => s.classId === id && s.status === "scheduled").map((s) => seatCount(s.id)));
        if (cap < maxSeat) { toast(`정원을 ${maxSeat}명 미만으로 줄일 수 없어요 (예약 ${maxSeat}명 존재).`); return; }
      }
      const elig = document.querySelector("#ec-elig .on").dataset.v;
      const prodIds = [...document.querySelectorAll("#ec-prods .chip.on")].map((b) => b.dataset.v);
      const memIds = pkSelected("ec-mems");
      if (elig !== "pass" && !memIds.length) { toast("지정 회원을 1명 이상 선택해 주세요."); return; }
      if (elig !== "list" && !prodIds.length) { toast("사용 가능한 수업권을 1개 이상 선택해 주세요."); return; }
      // P2-2b 재검증: 신규 추가만 범위 검사 (기존 지정 회원은 소급 없이 유지)
      if (role === "t" && elig !== "pass") {
        const bad = memIds.filter((mid) => !inTScope(DB.me.teacher, mid) && !(c.memberIds || []).includes(mid));
        if (bad.length) { toast(`내 «지정 가능 회원 범위» 밖 회원이에요: ${bad.map(memberName).join(", ")} — 센터에 범위 확대를 요청해 주세요.`); return; }
      }
      c.title = title; c.capacity = cap;
      c.eligibility = elig;
      c.eligibleProductIds = elig === "list" ? [] : prodIds;
      c.memberIds = elig === "pass" ? [] : memIds;
      delete pickers["ec-mems"]; // 저장된 지정 회원 기준으로 picker 재초기화
      render();
      toast("수업 정보를 수정했어요. 기존 예약은 그대로 유지돼요.");
    },
    // B1: 폐강 — 사유 필수, 예정 예약 자동취소·알림, 진행분 정산 유지
    askCloseClass(id, role) {
      if (!App.teachGuard(id, role)) return;
      const c = cls(id);
      const future = DB.slots.filter((s) => s.classId === id && s.status === "scheduled" && !isPast(s));
      const affected = future.reduce((a, s) => a + DB.bookings.filter((b) => b.slotId === s.id && ["booked", "waitlisted"].includes(b.status)).length, 0);
      modal(`<h3>«${c.title}» 폐강</h3><p>예정 회차 ${future.length}개 · 예약 ${affected}건이 자동으로 취소되고 회원 ${affected}명에게 알림이 가요. 이미 진행된 회차의 정산은 그대로 유지돼요.</p>
        <div class="field mt12"><label>폐강 사유 (필수 · 회원에게 전달)</label>
        <textarea id="cc-reason" rows="2" placeholder="예: 강사 사정으로 9월부터 운영이 어려워요" style="width:100%;border:1px solid var(--border-strong);border-radius:12px;padding:12px"></textarea></div>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">돌아가기</button>
        <button class="btn danger-ghost" onclick="App.closeClass('${id}','${role || "c"}')">폐강 확정</button></div>`);
    },
    closeClass(id, role) {
      if (!App.teachGuard(id, role)) return;
      const reason = (document.getElementById("cc-reason") || { value: "" }).value.trim();
      if (!reason) { toast("폐강 사유를 입력해 주세요 — 필수 기록이에요."); return; }
      const c = cls(id);
      c.status = "closed"; c.closedReason = reason; c.closedAt = nowStamp;
      let n = 0;
      for (const s of DB.slots.filter((s) => s.classId === id && s.status === "scheduled")) {
        for (const b of DB.bookings.filter((b) => b.slotId === s.id && ["booked", "waitlisted"].includes(b.status))) {
          b.status = "class_closed"; b.closeReason = reason; n++;
          // 후차감 모델 — 예정 예약은 차감 전이라 복원할 횟수 없음. 위반취소·확정분(과거)은 건드리지 않음.
        }
        s.status = "canceled"; s.cancelReason = "폐강";
      }
      DB.arranges.filter((a) => a.classId === id && a.status === "pending").forEach((a) => { a.status = "declined"; a.reason = "폐강: " + reason; });
      closeModal();
      location.hash = role === "t" ? "#/t/classes" : "#/c/classes";
      toast(`폐강 처리됐어요. 예약 ${n}건 자동취소 · 회원 알림 발송. 진행된 회차의 정산은 유지돼요.`);
    },
    // S-4: 기각 = 확인 성립 → 같은 tx에서 차감+정산 라인
    resolveDispute(rpId, accept) {
      const r = DB.reports.find((x) => x.id === rpId);
      if (!r || r.status !== "disputed") return;
      const b = r.bookingId ? DB.bookings.find((x) => x.id === r.bookingId) : null;
      // 형 확정(08-17): 노쇼 이의만 센터 중재 — 인용=노쇼 취소(차감 없음), 기각=노쇼 확정·차감(정산 라인은 미생성)
      if (r.noshow) {
        if (accept) {
          r.status = "resolved"; r.label = "이의 인정 · 노쇼 취소";
          if (b) { b.status = "canceled"; b.cancelBy = "noshow_waived"; }
          render();
          toast("이의를 인정했어요. 노쇼가 취소되고 차감 없이 종결돼요. 회원·선생님에게 알림이 가요.");
        } else {
          const res = finalizeNoshow(r, "reject");
          if (!res.ok) { toast("기각 처리 불가 — " + res.msg); return; }
          render();
          toast("이의를 기각했어요. 노쇼 확정 — 1회 차감돼요. 회원에게 알림이 가요." + (rewardOn() ? " (센터 정책에 따라 보상 정산에 포함)" : ""));
        }
        return;
      }
      const l = r.lineId ? line(r.lineId) : null;
      if (accept) {
        if (r.deducted) {
          const p = passForReport(r, b);
          if (p) { p.remaining += 1; pushLedger(p.id, +1, "이의 인정 · 복원", r.slotId ? slotDesc(slot(r.slotId)) : r.desc || ""); }
          if (l) l.status = "removed";
          r.deducted = false;
        }
        r.status = "resolved"; r.label = "이의 인정 · 횟수 복원";
        if (b) b.status = "restored";
        render();
        toast("이의를 인정했어요. 횟수가 복원되고 정산에서 제외됐어요." + (l && l.pushed ? " 이미 전송된 회차는 샐리에서 정정해 주세요." : ""));
      } else {
        if (r.deducted) {
          if (l && l.status === "held") l.status = "eligible";
          r.status = r.method === "자동확정" ? "auto" : "confirmed"; r.label = "기각 · 확정 유지";
          if (b) b.status = "confirmed";
          render();
          toast("이의를 기각했어요. 확정·차감이 유지되고 사유가 회원에게 안내돼요.");
        } else if (b) {
          const res = confirmTx(b, r, "센터 기각 확정");
          if (!res.ok) { toast("기각 처리 불가 — " + res.msg); return; }
          r.label = "기각 · 확정 (1회 차감)";
          render();
          toast("이의를 기각했어요. 수강확인이 완료 처리돼 1회 차감되고 정산에 포함돼요. 회원에게 알림이 가요.");
        } else {
          r.status = "confirmed"; r.label = "기각 · 확정 유지";
          render();
          toast("이의를 기각했어요.");
        }
      }
    },
    overrideAuto(rpId) {
      const r = DB.reports.find((x) => x.id === rpId);
      if (!r || r.status !== "auto") return;
      const b = r.bookingId ? DB.bookings.find((x) => x.id === r.bookingId) : null;
      const l = r.lineId ? line(r.lineId) : null;
      if (l) l.status = "removed";
      if (r.deducted) {
        const p = passForReport(r, b);
        if (p) { p.remaining += 1; pushLedger(p.id, +1, "자동확정 취소 · 횟수 복원", r.slotId ? slotDesc(slot(r.slotId)) : r.desc || ""); }
        r.deducted = false;
      }
      r.status = "resolved"; r.label = "자동확정 취소 · 복원";
      if (b) b.status = "restored";
      render();
      toast("자동확정을 취소했어요. 횟수가 복원되고 정산에서 제외돼요." + (l && l.pushed ? " 이미 전송된 회차는 샐리에서 정정해 주세요." : ""));
    },
    // 형 확정(08-17): 이의기간 무이의 → 자동 확정·차감. 프로토타입은 기간 경과를 데모 버튼으로 시뮬레이션.
    noshowExpire(rpId) {
      const r = DB.reports.find((x) => x.id === rpId);
      if (!r || r.status !== "noshow_wait") return;
      const res = finalizeNoshow(r, "auto");
      if (!res.ok) { toast(res.msg); return; }
      render();
      toast("이의제기 기간이 지나 노쇼가 자동 확정되고 1회 차감됐어요. 확인 목록에는 «무응답 자동확정»으로 표시돼요." + (rewardOn() ? " 센터 보상 정책에 따라 정산 미리보기에 반영돼요." : ""));
    },
    // 센터만 판정(P5-4b 대안 옵션) 전용 — 기본 정책(무이의 자동확정)에선 노출되지 않음
    resolveNoshow(rpId, deduct) {
      const r = DB.reports.find((x) => x.id === rpId);
      if (!r || r.status !== "noshow_wait") return;
      const b = r.bookingId ? DB.bookings.find((x) => x.id === r.bookingId) : null;
      if (deduct) {
        const p = passForReport(r, b);
        if (!p || p.remaining <= 0) { toast("잔여 0회라 차감할 수 없어요 — 센터 예외처리로 넘어가요."); return; }
        p.remaining -= 1;
        pushLedger(p.id, -1, "노쇼 차감", r.slotId ? slotDesc(slot(r.slotId)) : r.desc || "");
        r.status = "noshow_final"; r.label = "노쇼 확정 · 차감"; r.deducted = true;
        if (b) b.status = "noshow_final";
        render();
        toast("노쇼 확정 — 1회 차감됐어요. 수강확인이 안 된 회차라 정산에는 포함되지 않아요. 회원에게 알림이 가요.");
      } else {
        r.status = "resolved"; r.label = "노쇼 취소 · 차감 없음";
        if (b) { b.status = "canceled"; b.cancelBy = "noshow_waived"; }
        render();
        toast("노쇼를 취소 처리했어요. 차감 없이 종결돼요.");
      }
    },
    // v2.9: push 전 미리보기 모달 — 회차별 unitPrice(구매 시점 스냅샷)를 전송 페이로드 그대로 노출 (05 NormalizedSession)
    sallyPush(tid) {
      const lines = DB.slines.filter((l) => l.teacherId === tid && l.status === "eligible" && !l.pushed);
      const held = DB.slines.filter((l) => l.teacherId === tid && l.status === "held").length;
      const rewards = rewardOn() && DB.policy.noshowRewardPush === "auto" ? noshowFinals(tid).filter((r) => !r.rewardPushed) : [];
      if (!lines.length && !rewards.length) { toast("보낼 확정 회차가 없어요." + (held ? ` (보류 ${held}건 제외)` : "")); return; }
      const groups = unitGroups(lines);
      const total = lines.reduce((a, l) => a + l.unitPrice, 0) + rewards.reduce((a, r) => a + noshowUnit(r), 0);
      modal(`<h3>샐리 push 미리보기 — ${teacher(tid).name} 선생님</h3>
        <p>회차마다 <b>구매 시점의 회당 단가</b>가 그대로 전송돼요. 배분율·공제는 샐리가 계산해요.</p>
        <div class="pd-list">
          ${groups.map(([u, ls]) => `<div class="pd-group"><div class="pd-ghead">회당 <b>${won(u)}</b> × ${ls.length}회</div>${ls.map(lineRowHtml).join("")}</div>`).join("")}
          ${rewards.length ? `<div class="pd-group"><div class="pd-ghead">노쇼 보상 ${rewards.length}건</div>${rewards.map((r) => `<div class="pd-row"><span class="grow"><b>${r.member}</b> <span class="muted small">${r.desc}</span><div class="muted small">노쇼 확정 · ${DB.policy.noshowRewardPrice === "custom" ? customPriceLabel() : "정상 단가"}</div></span><span class="pd-price">${won(noshowUnit(r))}</span></div>`).join("")}</div>` : ""}
        </div>
        <div class="row" style="justify-content:space-between;padding:4px 2px"><span class="muted">합계 ${lines.length}회${rewards.length ? ` + 보상 ${rewards.length}건` : ""}${held ? ` · 보류 ${held}건 제외` : ""}</span><b class="big">${won(total)}</b></div>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">닫기</button>
          <button class="btn primary" onclick="App.sallyPushDo('${tid}')">이대로 보내기</button></div>`);
    },
    // 멱등 push — eligible & 미전송만, held 제외. P9-1 auto 모드면 노쇼 보상(rewardCodes)도 함께 전송
    sallyPushDo(tid) {
      closeModal(true);
      const lines = DB.slines.filter((l) => l.teacherId === tid && l.status === "eligible" && !l.pushed);
      const held = DB.slines.filter((l) => l.teacherId === tid && l.status === "held").length;
      const rewards = rewardOn() && DB.policy.noshowRewardPush === "auto" ? noshowFinals(tid).filter((r) => !r.rewardPushed) : [];
      if (!lines.length && !rewards.length) { toast("보낼 확정 회차가 없어요." + (held ? ` (보류 ${held}건 제외)` : "")); return; }
      const pid = "sly_" + tid + "_202608_" + seq++;
      lines.forEach((l) => { l.pushed = true; l.pushId = pid; });
      // 전송 시점 금액 스냅샷 — 현재 정책 단가(noshowUnit: 고정 금액 또는 수업료 %·원 단위 반올림)로 확정
      rewards.forEach((r) => { r.rewardPushed = true; r.rewardPushId = pid; r.rewardAmount = noshowUnit(r); });
      render();
      const t = teacher(tid);
      const parts = [];
      if (lines.length) parts.push(`${lines.length}회`);
      if (rewards.length) parts.push(`노쇼 보상 ${rewards.length}건 · ${won(rewards.reduce((a, r) => a + r.rewardAmount, 0))}`);
      toast(`${t.name} 선생님 ${parts.join(" + ")}를 샐리로 보냈어요${held ? ` · 보류 ${held}건 제외` : ""}. 같은 회차는 다시 보내도 중복 반영되지 않아요. (프로토타입 모의 전송)`);
    },
    // v2.19: 정산 화면 «엑셀로 내려받기» — 화면 집계 그대로 .xlsx 저장, 마지막 행=합계
    exportSettlement() {
      const { rows, total, ym, teacherName } = settlementExportRows();
      const month = ym;
      const blob = new Blob([xlsxBytes(rows, [16, 30, 12, 12, 26, 30, 14, 14])], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `니짐내짐_정산_${month}${teacherName ? `_${teacherName}` : ""}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      const [my, mm] = month.split("-");
      toast(`엑셀 파일을 내려받았어요 — ${my}년 ${Number(mm)}월${teacherName ? ` · ${teacherName} 선생님` : ""} 합계 ${won(total)}. 지금 화면의 정산 내역이 그대로 담겨 있어요.`);
    },
    toggle(key) {
      const P = DB.policy;
      if (key === "cancelCond") P.cancelMode = P.cancelMode === "conditional" ? "none" : "conditional";
      else if (key === "waitlistAuto") P.waitlistPromote = P.waitlistPromote === "auto" ? "manual" : "auto";
      else P[key] = !P[key];
      // 스위치 썸이 먼저 움직이고(즉시 피드백) 재렌더는 그 뒤에 — 상태·문구는 동일
      const sw = typeof event !== "undefined" && event && event.target ? event.target.closest(".sw") : null;
      if (sw && !REDUCE.matches) {
        sw.classList.toggle("on");
        setTimeout(() => { render(); toast("저장됐어요. 기존 예약·수업권에는 적용되지 않아요."); }, 200);
      } else {
        render();
        toast("저장됐어요. 기존 예약·수업권에는 적용되지 않아요.");
      }
    },
    setCancelHours(v) { DB.policy.cancelHours = parseInt(v, 10); toast("취소 기한이 변경됐어요. 신규 예약부터 적용되고, 기존 예약은 예약 당시 조건이 유지돼요."); },
    setAutoConfirm(v) { DB.policy.autoConfirmHours = parseInt(v, 10); render(); toast("자동확정 설정이 변경됐어요."); },
    setDispute(v) { DB.policy.disputeDays = parseInt(v, 10); toast("이의제기 기간이 변경됐어요."); },
    setQuickScope(v) { DB.policy.quickScope = v; toast("«회원 지정» 표시 범위가 변경됐어요."); },
    setNoshowActor(v) { DB.policy.noshowActor = v; render(); toast(v === "center_only" ? "센터만 판정으로 변경했어요 — 노쇼 확정·취소를 센터가 직접 결정해요." : "선생님 보고 후 이의가 없으면 자동확정되는 방식이에요 (기본값)."); },
    // P9-1 (형 확정 08-17): 노쇼 보상 센터별 설정 — 변경 즉시 정산 미리보기 재계산
    setNoshowReward(v) { DB.policy.noshowReward = v; render(); toast(v === "support" ? "노쇼 보상을 지원해요 — 정산·샐리 전송 미리보기에 반영됐어요." : "노쇼 보상 없음(기본)으로 설정했어요."); },
    setNoshowRewardPrice(v) { DB.policy.noshowRewardPrice = v; render(); toast(v === "custom" ? "별도 단가로 보상해요 — 아래에서 금액을 지정해 주세요." : "정상 단가(수업권 회당 단가)로 보상해요."); },
    setNoshowRewardCustom(v) { DB.policy.noshowRewardCustom = Math.max(0, parseInt(v, 10) || 0); render(); toast(`별도 단가 ${won(DB.policy.noshowRewardCustom)}로 저장했어요.`); },
    setNoshowRewardCustomMode(v) { DB.policy.noshowRewardCustomMode = v; render(); toast(v === "percent" ? `수업료의 %로 보상해요 — 회당 단가(정상 단가) 기준, 원 단위 반올림.` : `고정 금액(원)으로 보상해요.`); },
    setNoshowRewardPercent(v) { DB.policy.noshowRewardPercent = Math.min(100, Math.max(0, parseInt(v, 10) || 0)); render(); toast(`수업료의 ${DB.policy.noshowRewardPercent}%로 저장했어요 — 정산 미리보기에 반영됐어요.`); },
    // oninput 실시간 예시 — 저장 전에도 미리보기 갱신 (포커스 유지 위해 부분 갱신)
    previewNoshowPct(v) { const el = document.getElementById("nsPctPreview"); if (el) el.innerHTML = pctPreviewText(v); },
    setNoshowRewardPush(v) { DB.policy.noshowRewardPush = v; render(); toast(v === "auto" ? "노쇼 보상을 샐리로 자동 전송해요." : "샐리에서 수동 체크로 지급해요 — 자동 전송에 포함되지 않아요."); },
    // v2.7: 정책 화면 요약+편집·검색 (검색은 리스트 서브트리만 갱신 — 입력 포커스 유지)
    polOpen(k) { const U = polState(); U.open[k] = !U.open[k]; render(); },
    polQuery(k, v) {
      const U = polState(); U.q[k] = v;
      const el = document.getElementById("pol-" + k + "-list");
      if (el) el.innerHTML = polRows[k]();
    },
    // 시정①: 수업 개설 권한 토글 (P2-2)
    authMember(mid) {
      const A = DB.policy.classAuth;
      A.memberIds = (A.memberIds || []).includes(mid) ? A.memberIds.filter((x) => x !== mid) : [...(A.memberIds || []), mid];
      render(); toast("수업 개설 권한이 변경됐어요. 이미 개설된 수업은 그대로 운영돼요.");
    },
    authProduct(pid) {
      const A = DB.policy.classAuth;
      A.productIds = (A.productIds || []).includes(pid) ? A.productIds.filter((x) => x !== pid) : [...(A.productIds || []), pid];
      render(); toast("자격 멤버십이 변경됐어요. 이미 개설된 수업은 그대로 운영돼요.");
    },
    // v2.3 (P2-2b): 선생님별 지정 가능 회원 범위 — 모드 전환 시 기존 선택은 보존(다시 켜면 복원)
    scopeMode(tid, mode) {
      const T = DB.policy.teacherScope || (DB.policy.teacherScope = {});
      T[tid] = { ...(T[tid] || { productIds: [], memberIds: [] }), mode };
      render(); toast(mode === "all" ? "전체 회원 범위로 설정했어요 (기본값)." : "범위 지정 — 멤버십 단위 또는 하위 개별 회원을 선택해 주세요.");
    },
    scopeProduct(tid, pid) {
      const S = (DB.policy.teacherScope || {})[tid];
      if (!S) return;
      S.productIds = (S.productIds || []).includes(pid) ? S.productIds.filter((x) => x !== pid) : [...(S.productIds || []), pid];
      render(); toast("지정 가능 회원 범위가 변경됐어요. 이미 만들어진 수업의 지정 회원은 바뀌지 않아요.");
    },
    // 주간 일정 요일 탭 선택
    schedDay(d) { tSchedDay = d; render(); },
    // v2.25 ⑤: 예약 탭 [캘린더 | 내 예약] 전환
    mbTab(k) { mBookTab = k; render(); },
    // v2.11: 회원 예약 캘린더 — 날짜 선택·주 이동·월 이동
    mbDay(d) { mBookSel = d; render(); },
    mbWeek(delta) { mBookSel = addDays(mBookSel || DB.TODAY, delta * 7); render(); },
    mbGoto(d) { mBookSel = d; closeModal(); render(); },
    mbMonthSheet() { monthSheet((mBookSel || DB.TODAY).slice(0, 7), "mbGoto"); },
    // v2.20: 센터 예약 캘린더 — 날짜 선택·월 이동·월 시트·선생님/수업 필터
    cbDay(d) { cbUI.sel = d; render(); },
    cbMonth(delta) {
      const [y, m] = (cbUI.sel || DB.TODAY).slice(0, 7).split("-").map(Number);
      const t = m - 1 + delta, ny = y + Math.floor(t / 12), nm = ((t % 12) + 12) % 12 + 1;
      const ym = `${ny}-${String(nm).padStart(2, "0")}`;
      cbUI.sel = ym === DB.TODAY.slice(0, 7) ? DB.TODAY : `${ym}-01`;
      render();
    },
    cbGoto(d) { cbUI.sel = d; closeModal(); render(); },
    cbMonthSheet() { monthSheet((cbUI.sel || DB.TODAY).slice(0, 7), "cbGoto"); },
    cbTeacher(id) { cbUI.teacher = id; render(); },
    cbClass(id) { cbUI.cls = id; render(); },
    // v2.21: 정산 캘린더 — 날짜 선택·월 이동·월 시트·선생님 필터 (센터 예약 캘린더와 같은 문법)
    csDay(d) { csUI.sel = d; render(); },
    csMonth(delta) {
      const [y, m] = (csUI.sel || DB.TODAY).slice(0, 7).split("-").map(Number);
      const t = m - 1 + delta, ny = y + Math.floor(t / 12), nm = ((t % 12) + 12) % 12 + 1;
      const ym = `${ny}-${String(nm).padStart(2, "0")}`;
      csUI.sel = ym === DB.TODAY.slice(0, 7) ? DB.TODAY : `${ym}-01`;
      render();
    },
    csGoto(d) { csUI.sel = d; closeModal(); render(); },
    csMonthSheet() { monthSheet((csUI.sel || DB.TODAY).slice(0, 7), "csGoto"); },
    csTeacher(id) { csUI.teacher = id; render(); },
    scopeMember(tid, mid) {
      const S = (DB.policy.teacherScope || {})[tid];
      if (!S) return;
      S.memberIds = (S.memberIds || []).includes(mid) ? S.memberIds.filter((x) => x !== mid) : [...(S.memberIds || []), mid];
      render(); toast("지정 가능 회원 범위가 변경됐어요. 이미 만들어진 수업의 지정 회원은 바뀌지 않아요.");
    },
    // v2.14: 멤버십 캐러셀 — 스크롤 스냅 위치 → 활성 카드 판정, 상세정보 동기 (rAF 스로틀)
    mpScroll(el) {
      if (el._raf) return;
      el._raf = requestAnimationFrame(() => {
        el._raf = null;
        const w = el.firstElementChild ? el.firstElementChild.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0) : 1;
        const i = Math.max(0, Math.min(Math.round(el.scrollLeft / w), el.children.length - 1));
        if (i === mpIdx) return;
        mpIdx = i;
        const d = document.getElementById("mp-detail");
        if (d) d.innerHTML = mpDetail(myPasses()[i]);
      });
    },
    // v2.14: PC 마우스 드래그 스와이프 — 터치는 네이티브 스크롤(스냅)에 맡김
    mpDrag(el, e) {
      if (e.pointerType !== "mouse" || el.children.length < 2) return;
      e.preventDefault();
      const sx = e.clientX, sl = el.scrollLeft;
      el.classList.add("drag"); // 드래그 중엔 스냅 해제 — 손끝을 그대로 따라오게
      const mv = (ev) => { el.scrollLeft = sl - (ev.clientX - sx); };
      const up = () => {
        window.removeEventListener("pointermove", mv);
        window.removeEventListener("pointerup", up);
        el.classList.remove("drag");
        const w = el.firstElementChild ? el.firstElementChild.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0) : 1;
        el.scrollTo({ left: Math.max(0, Math.round(el.scrollLeft / w)) * w, behavior: "smooth" });
      };
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up);
    },
  };
  window.App = App;

  // ── 라우터 ──
  const routes = [
    [/^#?\/?$/, vLanding],
    [/^#\/m\/home$/, vMHome],
    [/^#\/m\/pass$/, vMPass],
    [/^#\/m\/shop$/, vMShop],
    [/^#\/m\/shop\/(.+)$/, vMShopDetail],
    [/^#\/m\/book$/, vMBook],
    [/^#\/m\/class\/(.+)$/, vMClass],
    [/^#\/m\/slot\/(.+)$/, vMSlot],
    [/^#\/m\/bookings$/, vMBookings],
    [/^#\/m\/proposals$/, vMProps],
    [/^#\/m\/confirms$/, vMConfirms],
    [/^#\/m\/confirm\/(.+)$/, vMConfirm],
    [/^#\/m\/qr\/(.+)$/, vMQr],
    [/^#\/m\/history$/, vMHistory],
    [/^#\/t\/home$/, vTHome],
    [/^#\/t\/schedule$/, vTSchedule],
    [/^#\/t\/inbox$/, vTInbox],
    [/^#\/t\/propose$/, vTPropose],
    [/^#\/t\/slot\/(.+)$/, vTSlot],
    [/^#\/t\/create$/, () => vCreate("t")],
    [/^#\/t\/class\/(.+)$/, (id) => vClassManage("t", id)],
    [/^#\/t\/report$/, vTReport],
    [/^#\/t\/earnings$/, vTEarnings],
    [/^#\/c\/home$/, vCHome],
    [/^#\/c\/products$/, vCProducts],
    [/^#\/c\/classes$/, () => vClasses("c")],
    [/^#\/c\/class\/(.+)$/, (id) => vClassManage("c", id)],
    [/^#\/c\/bookings$/, vCBookings],
    [/^#\/c\/slot\/(.+)$/, vCSlot],
    [/^#\/c\/create$/, () => vCreate("c")],
    [/^#\/c\/confirms$/, vCConfirms],
    [/^#\/c\/settlement$/, vCSettlement],
    [/^#\/c\/policy$/, vCPolicy],
    [/^#\/c\/policy\/scope\/(.+)$/, vCPolicyScope],
  ];
  let lastHash = null;
  // v2.26: 통합 전 라우트(딥링크·즐겨찾기·폐강 후 복귀)는 새 화면으로 돌려보낸다.
  // «내 수업 관리»는 일정 탭 하위 뷰로 흡수됐으므로 탭까지 맞춰서 보낸다.
  const REDIRECTS = { "#/t/quick": "#/t/create", "#/c/quick": "#/c/create", "#/t/classes": "#/t/schedule" };
  function render() {
    const h0 = location.hash || "#/";
    if (REDIRECTS[h0]) {
      if (h0 === "#/t/classes") tSchedTab = "classes";
      history.replaceState(null, "", REDIRECTS[h0]);
      return render();
    }
    const h = location.hash || "#/";
    if (h !== lastHash) Object.keys(pickers).forEach((k) => { if (pickers[k].hash !== h) delete pickers[k]; }); // 화면 이동 시 picker 상태 초기화
    if (h !== lastHash && !h.startsWith("#/c/policy")) polUI.live = false; // v2.7: 정책 화면군 밖으로 나가면 검색·펼침 초기화
    if (h !== lastHash && h !== "#/t/schedule") tSchedDay = null; // v2.8: 주간 일정 이탈 시 요일 선택 초기화
    // v2.26: 일정 탭 하위 뷰 — 수업 상세(수정·폐강)를 다녀와도 «내 수업»에 그대로 돌아온다
    if (h !== lastHash && h !== "#/t/schedule" && !h.startsWith("#/t/class/")) tSchedTab = "cal";
    if (h !== lastHash && h !== "#/t/create" && h !== "#/c/create") ccUI = null; // v2.26: 수업 만들기 폼 초기화
    if (h !== lastHash && h !== "#/m/book") mBookSel = null; // v2.11: 예약 캘린더 이탈 시 날짜 선택 초기화
    // v2.20: 센터 캘린더 — 회차 상세를 다녀와도 날짜·필터 유지, 그 밖으로 나가면 초기화
    if (h !== lastHash && h !== "#/c/bookings" && !h.startsWith("#/c/slot/")) cbUI = { sel: null, teacher: "all", cls: "all" };
    if (h !== lastHash && h !== "#/c/settlement") csUI = { sel: null, teacher: "all" }; // v2.21: 정산 캘린더 이탈 시 초기화
    if (h !== lastHash && h !== "#/m/pass") mpIdx = 0; // v2.14: 멤버십 캐러셀 이탈 시 활성 카드 초기화
    if (h !== lastHash && h !== "#/m/book") mBookTab = "cal"; // v2.25 ⑤: 예약 탭 이탈 시 캘린더로 복귀
    if (h !== lastHash) bookPass = {}; // v2.25 ③: 화면 이동 시 «사용 수업권» 수동 선택 해제 → 기본(만료 임박) 복귀
    let body = null;
    for (const [re, fn] of routes) {
      const m = h.match(re);
      if (m) { body = fn(m[1]); break; }
    }
    const keepToasts = [...$app.querySelectorAll(".toast")]; // 화면 이동해도 토스트 유지
    const prevY = window.scrollY;
    // v2.10: 회원 화면 실서비스 앱 톤 → v2.25 ④ 선생님·센터도 같은 디자인 시스템(role-t/role-c)
    const roleSeg = h.split("/")[1];
    $app.classList.toggle("role-m", roleSeg === "m");
    $app.classList.toggle("role-t", roleSeg === "t");
    $app.classList.toggle("role-c", roleSeg === "c");
    $app.innerHTML = body != null ? body : vLanding();
    keepToasts.forEach((el) => $app.appendChild(el));
    // 같은 화면 내 상태 갱신(토글·커밋)은 스크롤 유지 — 화면 이동 시에만 최상단으로
    window.scrollTo(0, h !== lastHash ? 0 : prevY);
    // 화면 진입 모션은 해시 이동 시에만 — 같은 화면 내 상태 갱신엔 재생하지 않음
    if (h !== lastHash) {
      const sc = $app.querySelector(".screen");
      if (sc) sc.classList.add("enter");
    }
    lastHash = h;
  }
  // v2.11: 캘린더 좌우 스와이프 (수평 48px 이상 · 탭과 구분, 이후 클릭 1회 억제)
  // v2.20: 센터 월간 캘린더(.cb-grid)도 지원 — 회원 주간 스트립=주 이동, 센터=월 이동
  // v2.21: 정산 캘린더(.cs-grid)도 월 이동
  let mbSw = null, mbSwipedAt = 0;
  document.addEventListener("pointerdown", (e) => {
    const cal = e.target.closest(".mb-strip, .cb-grid");
    mbSw = cal ? { x: e.clientX, y: e.clientY, fn: cal.classList.contains("cs-grid") ? "csMonth" : cal.classList.contains("cb-grid") ? "cbMonth" : "mbWeek" } : null;
  }, { passive: true });
  document.addEventListener("pointerup", (e) => {
    if (!mbSw) return;
    const dx = e.clientX - mbSw.x, dy = e.clientY - mbSw.y, fn = mbSw.fn;
    mbSw = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      mbSwipedAt = performance.now();
      App[fn](dx < 0 ? 1 : -1);
    }
  }, { passive: true });
  document.addEventListener("click", (e) => {
    if (performance.now() - mbSwipedAt < 400 && e.target.closest(".mb-strip, .cb-grid")) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // 스크롤 에지: 콘텐츠가 헤더 밑으로 흐를 때만 경계선·그림자 표시
  window.addEventListener("scroll", () => {
    const hd = document.querySelector(".hd");
    if (hd) hd.classList.toggle("scrolled", window.scrollY > 4);
  }, { passive: true });
  window.addEventListener("hashchange", () => { closeModal(true); render(); });
  render();
})();

/* 니짐내짐 레슨 관리 프로토타입 — 해시 라우팅 SPA (빌드 불필요)
   v2 (2026-08-17 보완): 감사 결함 35건 + 신규 4건 반영.
   v2.1 (2026-08-17 시정): 선생님 수업 개설·관리(수정·폐강) — 권한=센터 지정 회원 or 자격 멤버십 보유(02 P2-2).
   v2.2 (2026-08-17 형 확정 반영): ① P5-4b 노쇼=보고→통지→무이의 시 자동 확정·차감(이의 건만 센터 중재)
   ② P9-1 노쇼 보상=센터별 설정(없음/지원 — 정상·별도 단가, 샐리 자동 push·수동 체크) — 정산 미리보기 동적 반영.
   v2.3 (2026-08-17): P2-2b 선생님별 «지정 가능 회원 범위» — 전체/멤버십 단위/멤버십 하위 개별 회원 선택,
   수업 개설 «지정 회원» picker·즉시확정 목록에 적용(액션 재검증 포함). 미설정 기본값=전체 회원(02 문서).
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
  function eligiblePass(c, mid) {
    const mine = passesOf(mid).filter(passUsable);
    const byProduct = mine.filter((p) => (c.eligibleProductIds || []).includes(p.productId));
    const byKind = mine.filter((p) => p.kind === c.kind);
    if (c.eligibility === "list") return c.memberIds.includes(mid) ? byProduct[0] || byKind[0] || null : null;
    if (c.eligibility === "pass") return byProduct[0] || null;
    // both(혼합): 지정 회원이거나 자격 수업권 보유
    if ((c.memberIds || []).includes(mid)) return byProduct[0] || byKind[0] || null;
    return byProduct[0] || null;
  }
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
    pushLedger(p.id, -1, mode === "auto" ? "노쇼 차감 (무이의 자동확정)" : "노쇼 차감 (이의 기각)", r.slotId ? slotDesc(slot(r.slotId)) : r.desc || "");
    r.status = "noshow_final"; r.deducted = true;
    if (mode === "auto") { r.autoFinal = true; r.method = "자동확정"; r.label = "노쇼 확정 · 무이의 자동확정"; }
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
  // 하-5: 조율·즉시확정으로 만든 회차가 비면 정리 (유령 슬롯 방지)
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
      restored: ["이의 인용 · 복원", "b-gray"],
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

  // ── 셸 렌더 ──
  const ROLE_LABEL = { m: "회원", t: "선생님", c: "센터" };
  const TABS = {
    m: [["#/m/home", "🏠", "홈"], ["#/m/book", "📅", "예약"], ["#/m/shop", "🎟️", "구매"], ["#/m/history", "📜", "내역"]],
    t: [["#/t/home", "🏠", "오늘"], ["#/t/schedule", "🗓️", "일정"], ["#/t/inbox", "📨", "요청"], ["#/t/report", "✅", "보고"], ["#/t/earnings", "💰", "정산"]],
    c: [["#/c/home", "🏠", "홈"], ["#/c/classes", "🧘", "수업"], ["#/c/bookings", "📅", "예약"], ["#/c/settlement", "💰", "정산"], ["#/c/policy", "⚙️", "설정"]],
  };
  // v2.10: 회원 탭만 실서비스 톤 라인 아이콘(stroke=currentColor → 활성 시 핑크)
  const M_TAB_SVG = {
    "홈": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.5V20a.8.8 0 0 0 .8.8h11.4a.8.8 0 0 0 .8-.8V9.5"/><path d="M9.8 20.5v-5.6a.8.8 0 0 1 .8-.8h2.8a.8.8 0 0 1 .8.8v5.6"/></svg>`,
    "예약": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 2.8v4M16 2.8v4"/><path d="m9.5 15.5 2 2 3.5-3.8"/></svg>`,
    "구매": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 9V7a1.5 1.5 0 0 1 1.5-1.5h14A1.5 1.5 0 0 1 20.5 7v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16v-2a2.5 2.5 0 0 0 0-5Z"/><path d="M14 6v2.4M14 11v2M14 15.6V18" stroke-dasharray="0.1 3.2"/></svg>`,
    "내역": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3.5h14V20.5l-2.4-1.5-2.4 1.5-2.2-1.5-2.2 1.5-2.4-1.5L5 20.5Z"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5"/></svg>`,
  };
  function shell(role, title, body, opts = {}) {
    const tabs = TABS[role] || [];
    const cur = location.hash.split("/").slice(0, 3).join("/");
    return `
      <header class="hd"><div class="hd-in">
        ${opts.back ? `<button class="hd-back" onclick="history.back()" aria-label="뒤로">‹</button>` : ""}
        <div class="hd-title">${title}</div>
        <button class="hd-role" onclick="location.hash='#/'">역할: <b>${ROLE_LABEL[role] || "-"}</b></button>
      </div></header>
      <main class="screen${tabs.length ? "" : " no-tab"}">${body}</main>
      ${tabs.length ? `<nav class="tabbar">${tabs.map(([h, ic, l]) =>
        `<a class="tab${h.startsWith(cur) && cur !== "#" ? " on" : ""}" href="${h}"><span class="ic">${role === "m" && M_TAB_SVG[l] ? M_TAB_SVG[l] : ic}</span>${l}</a>`).join("")}</nav>` : ""}`;
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
  function passCard(p) {
    const st = passState(p);
    const dd = dday(p.expiresAt);
    const pct = Math.round((Math.max(0, p.remaining) / p.total) * 100);
    const badge = st === "expired" ? `<span class="badge b-danger">기간 만료</span>`
      : st === "exhausted" ? `<span class="badge b-gray">횟수 소진</span>`
      : st === "frozen" ? `<span class="badge b-gray">이용 정지</span>`
      : p.expiresAt ? `<span class="badge ${dd <= 14 ? "b-warn" : "b-blue"}">D-${dd}</span>` : `<span class="badge b-green">기간 제한 없음</span>`;
    return `<div class="pass-card${st !== "active" ? " off" : ""}">
      <div class="row"><span class="name grow">${p.name}</span>${badge}</div>
      <div class="left">${p.remaining}회 <small>/ ${p.total}회 남음</small></div>
      <div class="meta">${p.expiresAt ? `${p.expiresAt.replaceAll("-", ".")} 까지 · ` : ""}회당 ${won(p.unitPrice)}${
        // v2.9: 구매 시점 스냅샷(listPrice) 기준 할인 표기 — 같은 상품이라도 등록 시기·할인 따라 회당 단가가 다름
        p.listPrice != null && p.unitPrice < Math.floor(p.listPrice / p.total) ? ` <span class="disc">할인 구매 (정가 회당 ${won(Math.floor(p.listPrice / p.total))})</span>` : ""
      }${st === "expired" ? " · 예약에 쓸 수 없어요" : ""}</div>
      <div class="pass-bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }
  function myUpcoming() {
    return myBk().filter((b) => {
      if (!["booked", "waitlisted"].includes(b.status)) return false;
      const s = slot(b.slotId);
      return s && s.status !== "canceled" && (s.status === "scheduled" || !isPast(s));
    });
  }
  function vMHome() {
    // S-1: 확인 배너는 pending 보고가 실존하는 confirm_wait 예약에만
    const confirmWait = myBk().filter((b) => b.status === "confirm_wait" && DB.reports.some((r) => r.bookingId === b.id && r.status === "pending"));
    const noshow = myBk().filter((b) => b.status === "noshow_wait");
    const upcoming = myUpcoming();
    const arrs = DB.arranges.filter((a) => a.memberId === DB.me.member && a.status === "pending");
    return shell("m", "니짐내짐 레슨", `
      ${confirmWait.map((b) => `<button class="banner" onclick="location.hash='#/m/confirm/${b.id}'">
        <span class="ic">✍️</span><span>${slotDesc(slot(b.slotId))} 수업, 잘 받으셨나요? <u>수강 확인하기</u></span></button>`).join("")}
      ${noshow.map((b) => {
        const r = DB.reports.find((x) => x.bookingId === b.id && x.status === "noshow_wait");
        return `<button class="banner warn" onclick="location.hash='#/m/bookings'">
        <span class="ic">⚠️</span><span>${slotDesc(slot(b.slotId))} 회차가 <b>노쇼</b>로 보고됐어요. ${r ? `<b>${noshowDeadline(r).replaceAll("-", ".")}</b>까지 이의가 없으면 <b>자동 확정·1회 차감</b>돼요.` : ""} 사실과 다르면 이의제기해 주세요.</span></button>`;
      }).join("")}
      <div class="sec-title">내 수업권</div>
      ${DB.passes.filter((p) => p.memberId === DB.me.member).map(passCard).join("")}
      <a class="btn ghost" href="#/m/shop">+ 수업 멤버십 구매</a>
      <div class="sec-title row">다가오는 예약<a href="#/m/bookings" class="small" style="margin-left:auto;color:var(--text-muted);font-weight:600">전체 보기 ›</a></div>
      <div class="card flat">${upcoming.length || arrs.length ? upcoming.map((b) => {
        const s = slot(b.slotId); const c = cls(s.classId); const bd = bkBadge(b);
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${c.title}</span><div class="muted small">${dlabel(s.date)} · ${teacher(c.teacherId).name} 선생님</div></span>
          <span class="badge ${bd.badge}">${bd.label}</span></div>`;
      }).join("") + arrs.map((a) => {
        const c = cls(a.classId);
        return `<div class="slot"><span class="time">${a.time}</span>
          <span class="grow"><span class="t">${c.title}</span><div class="muted small">${dlabel(a.date)} 희망 · 선생님 확인 중</div></span>
          <span class="badge b-warn">조율 대기</span></div>`;
      }).join("") : `<p class="muted">예약이 없어요.</p>`}</div>
      <a class="btn primary mt8" href="#/m/book">수업 예약하기</a>`);
  }
  function vMShop() {
    return shell("m", "수업 멤버십 구매", `
      <p class="muted" style="margin-bottom:12px">횟수제 수업권이에요. 유효기간이 지나거나 횟수를 다 쓰면 만료돼요.</p>
      ${DB.products.map((p) => `<button class="card card-tap" onclick="location.hash='#/m/shop/${p.id}'">
        <div class="row"><span class="grow"><b>${p.name}</b>
          <div class="muted small mt4">${p.kind === "private" ? "개인수업" : "그룹수업"} · ${p.sessions}회 · ${p.validityDays ? `${p.validityDays}일` : "기간 제한 없음"}</div></span>
        <span style="text-align:right"><span class="big">${won(p.price)}</span><div class="muted small">회당 ${won(Math.floor(p.price / p.sessions))}</div></span></div>
      </button>`).join("")}`, { back: true });
  }
  function vMShopDetail(id) {
    const p = DB.products.find((x) => x.id === id);
    if (!p) return vMShop();
    return shell("m", p.name, `
      <div class="card">
        <span class="badge ${p.kind === "private" ? "b-rose" : "b-blue"}">${p.kind === "private" ? "개인수업 1:1" : "그룹수업"}</span>
        <div class="big mt8">${won(p.price)}</div>
        <div class="divider"></div>
        <div class="row" style="justify-content:space-between"><span class="muted">횟수</span><b>${p.sessions}회 (회당 ${won(Math.floor(p.price / p.sessions))})</b></div>
        <div class="row mt8" style="justify-content:space-between"><span class="muted">유효기간</span><b>${p.validityDays ? `구매일부터 ${p.validityDays}일` : "없음 · 횟수 소진 시까지"}</b></div>
        <div class="row mt8" style="justify-content:space-between"><span class="muted">취소 규정</span><b>수업 ${DB.policy.cancelHours}시간 전까지 무료</b></div>
      </div>
      <p class="muted small">구매 시점의 가격·조건이 그대로 보존돼요. 이후 상품이 바뀌어도 내 수업권은 영향받지 않아요.</p>
      <button class="btn primary mt12" onclick="App.buy('${p.id}')">${won(p.price)} 결제하기</button>
      <p class="muted small mt8" style="text-align:center">프로토타입 — 실제 결제는 일어나지 않아요.</p>`, { back: true });
  }
  function vMBook() {
    const list = DB.classes.filter((c) => c.status !== "closed");
    return shell("m", "수업 예약", `
      ${list.map((c) => `<button class="card card-tap" onclick="location.hash='#/m/class/${c.id}'">
        <div class="row"><span class="grow"><b>${c.title}</b>
          <div class="muted small mt4">${teacher(c.teacherId).name} 선생님 · ${c.scheduleLabel} · ${c.duration}분</div>
          <div class="mt8"><span class="badge ${c.kind === "private" ? "b-rose" : "b-blue"}">${c.kind === "private" ? "개인 1:1" : `그룹 · 정원 ${c.capacity}명`}</span>
          <span class="badge b-gray">${eligLabel(c)}</span></div></span>
        <span class="arrow" style="color:var(--text-disabled)">›</span></div></button>`).join("")}`);
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
          <button class="btn primary" onclick="App.requestArrange('${c.id}')">조율 요청 보내기</button>
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
    let action;
    if (mine) {
      const bd = bkBadge(mine);
      action = `<div class="banner"><span class="ic">✅</span><span>이 회차에 이미 <b>${bd.label}</b> 상태예요. 중복 예약은 안 돼요.</span></div>`;
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
        <div class="row" style="justify-content:space-between"><span class="muted">사용 수업권</span><b>${g.ok ? `${g.pass.name} (잔여 ${g.pass.remaining}회)` : "사용 가능한 수업권 없음"}</b></div>
      </div>
      <div class="banner warn"><span class="ic">ℹ️</span><span>취소는 수업 <b>${DB.policy.cancelHours}시간 전</b>까지 무료예요. 이후 취소하면 횟수가 차감돼요. 이 조건은 <b>예약 시점 기준으로 보존</b>돼요.</span></div>
      ${action}`, { back: true });
  }
  function vMBookings() {
    const mine = myBk();
    const arrs = DB.arranges.filter((a) => a.memberId === DB.me.member);
    const act = mine.filter((b) => ["booked", "waitlisted"].includes(b.status) && slot(b.slotId).status !== "canceled");
    const need = mine.filter((b) => ["confirm_wait", "noshow_wait", "disputed"].includes(b.status));
    const past = mine.filter((b) => ["canceled", "forfeited", "confirmed", "restored", "class_closed", "noshow_final"].includes(b.status) || (slot(b.slotId).status === "canceled" && b.status === "booked"));
    const item = (b, withCancel) => {
      const s = slot(b.slotId); const c = cls(s.classId); const bd = bkBadge(b);
      return `<div class="slot"><span class="grow"><span class="t">${c.title}</span>
        <div class="muted small">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div>
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
      return `<div class="slot"><span class="grow"><span class="t">${c.title}</span>
        <div class="muted small">${dlabel(a.date)} ${a.time} 희망${a.status === "declined" && a.reason ? ` · 사유: ${a.reason}` : ""}</div></span>
        <span class="badge ${st[1]}">${st[0]}</span>
        ${a.status === "pending" ? `<button class="btn sm ghost" onclick="App.arrangeCancel('${a.id}')">취소</button>` : ""}</div>`;
    };
    return shell("m", "내 예약", `
      <div class="sec-title">예정 · 대기</div>
      <div class="card flat">${act.length ? act.map((b) => item(b, true)).join("") : `<p class="muted">예약이 없어요.</p>`}</div>
      ${arrs.length ? `<div class="sec-title">조율 요청</div><div class="card flat">${arrs.map(arrItem).join("")}</div>` : ""}
      ${need.length ? `<div class="sec-title">확인 필요</div><div class="card flat">${need.map((b) => item(b, false)).join("")}</div>` : ""}
      ${past.length ? `<div class="sec-title">지난 예약</div><div class="card flat">${past.map((b) => item(b, false)).join("")}</div>` : ""}`, { back: true });
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
      <div class="banner"><span class="ic">🔒</span><span>확인은 <b>회원 본인 계정</b>에서만 가능해요. ${auto ? `${auto}시간 안에 응답이 없으면 자동확정되며,` : `자동확정 없이 센터가 수동 처리하며,`} 문제가 있으면 ${DB.policy.disputeDays}일 안에 이의제기할 수 있어요.</span></div>
      <button class="btn primary" onclick="App.confirmAttend('${b.id}')">네, 이상 없이 수강했어요</button>
      <button class="btn danger-ghost mt8" onclick="App.askDispute('${b.id}')">문제가 있어요 (이의제기)</button>`, { back: true });
  }
  function vMHistory() {
    const mine = DB.passes.filter((p) => p.memberId === DB.me.member);
    return shell("m", "이용 내역", `
      <p class="muted" style="margin-bottom:12px">수업권의 모든 증감 기록이에요. 기록은 수정·삭제되지 않아요.</p>
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
      ${arrs ? `<button class="banner" onclick="location.hash='#/t/inbox'"><span class="ic">📨</span><span>회원 조율 요청이 <b>${arrs}건</b> 기다리고 있어요. <u>확인하기</u></span></button>` : ""}
      ${pending ? `<button class="banner" onclick="location.hash='#/t/report'"><span class="ic">✍️</span><span>회원 확인을 기다리는 수업이 ${pending}건 있어요.</span></button>` : ""}
      <div class="sec-title">오늘 일정 · ${dlabel(DB.TODAY)}</div>
      <div class="card flat">${today.length ? today.map((s) => {
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${cls(s.classId).title}</span><div class="muted small">${attendeeNames(s.id).join(", ") || "참석자 없음"}</div></span>
          <button class="btn sm ghost" onclick="location.hash='#/t/slot/${s.id}'">상세</button></div>`;
      }).join("") : `<p class="muted">오늘 수업이 없어요.</p>`}</div>
      <a class="btn primary mt8" href="#/t/quick">+ 즉시 예약확정</a>
      <a class="btn ghost mt8" href="#/t/classes">🧘 내 수업 관리 (개설·수정·폐강)</a>
      <p class="muted small mt8" style="text-align:center">즉시확정 시 회원에게 바로 알림이 가요.</p>`);
  }
  let tSchedDay = null; // 주간 일정 선택 요일 — 화면 이탈 시 초기화(render)
  function vTSchedule() {
    const days = ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"];
    const sel = days.includes(tSchedDay) ? tSchedDay : (days.includes(DB.TODAY) ? DB.TODAY : days[0]);
    const list = tSlots().filter((s) => s.date === sel).sort((a, b) => a.time.localeCompare(b.time));
    return shell("t", "주간 일정", `
      <div class="daystrip">${days.map((d) => {
        const dt = new Date(d + "T00:00:00+09:00");
        return `<button type="button" class="day${d === sel ? " on" : ""}" onclick="App.schedDay('${d}')"><div class="dw">${DOW[dt.getDay()]}</div><div class="dn">${dt.getDate()}</div></button>`;
      }).join("")}</div>
      <div class="card flat">${list.length ? list.map((s) => {
        const c = cls(s.classId);
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${c.title}</span><div class="muted small">${dlabel(s.date)} · ${c.schedule === "fixed" ? "고정" : "조율"} · ${seatCount(s.id)}명</div></span>
          <button class="btn sm ghost" onclick="location.hash='#/t/slot/${s.id}'">상세</button></div>`;
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
    return shell("t", "조율 요청 인박스", `
      <p class="muted" style="margin-bottom:12px">수락해야 회차·예약이 만들어져요. 수락 전엔 일정에 잡히지 않아요.</p>
      <div class="sec-title">대기 중 (${pending.length})</div>
      <div class="card flat">${pending.length ? pending.map(item).join("") : `<p class="muted">대기 중인 요청이 없어요.</p>`}</div>
      ${done.length ? `<div class="sec-title">처리됨</div><div class="card flat">${done.map(item).join("")}</div>` : ""}`);
  }
  function vTSlot(id) {
    const s = slot(id);
    if (!s || s.status === "canceled") return vTHome();
    const c = cls(s.classId);
    const done = s.status === "done";
    const seats = seatBk(s.id);
    const unreported = DB.bookings.filter((b) => b.slotId === s.id && b.status === "booked");
    const w = waitBk(s.id);
    return shell("t", "수업 상세", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${c.duration}분</div>
        <div class="mt8"><span class="badge ${done ? "b-gray" : "b-green"}">${done ? "종료" : "예정"}</span>
        <span class="badge b-blue">${seats.length}/${c.capacity}명</span>${w.length ? `<span class="badge b-warn">대기 ${w.length}명</span>` : ""}</div></div>
      <div class="sec-title">참석자</div>
      <div class="card flat">${seats.length ? seats.map((b) => {
        const bd = bkBadge(b);
        return `<div class="slot"><span class="grow"><b>${memberName(b.memberId)}</b></span><span class="badge ${bd.badge}">${bd.label}</span></div>`;
      }).join("") : `<p class="muted">참석자가 없어요.</p>`}</div>
      ${done ? (unreported.length
        ? `<button class="btn primary" onclick="App.reportAsk('${s.id}')">수업 완료 보고 (${unreported.length}명)</button>
           <p class="muted small mt8" style="text-align:center">참석·노쇼를 회원별로 표시해 보고해요.<br>회원이 확인해야 횟수 차감·정산 대상이 돼요.</p>`
        : `<div class="banner"><span class="ic">⏳</span><span>완료 보고됨 — 회원 확인·처리를 기다리고 있어요. 확인되어야 정산에 들어가요.</span></div>`)
        : `<button class="btn ghost" disabled style="color:var(--text-disabled)">수업 종료 후 완료 보고할 수 있어요</button>`}`, { back: true });
  }
  // B3: 즉시확정 — 회원 필터(센터 정책), 기존 회차 합류, 과거 차단(S-2)
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
  // 형 지적 08-17: 즉시확정도 그룹수업은 정원 한도 내 복수 선택 (1:1만 1명 제한 + 안내)
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
    ? `⚠️ <b>${lim.msg}</b>`
    : `그룹수업은 정원 한도까지 복수 선택할 수 있어요 — 지금은 최대 <b>${lim.max}명</b>.`;
  function vTQuick(role) {
    const r = role || "t";
    const classes = (r === "t" ? DB.classes.filter((c) => c.teacherId === DB.me.teacher) : DB.classes).filter((c) => c.status !== "closed");
    const members = quickMembers(r);
    const scopeLabel = { valid: "유효 수업권 보유자만", all: "전체 회원", mine: "담당 회원만" }[DB.policy.quickScope];
    const firstClass = classes[0];
    const joinable = firstClass ? DB.slots.filter((s) => s.classId === firstClass.id && s.status === "scheduled" && !isPast(s) && seatCount(s.id) < firstClass.capacity) : [];
    return shell(r, "즉시 예약확정", `
      <p class="muted" style="margin-bottom:12px">예약 절차 없이 일자와 회원을 골라 바로 확정해요. 지난 일시로는 만들 수 없어요.</p>
      <div class="card">
        <div class="field"><label>회원 <span class="badge b-gray">${scopeLabel} · 센터 정책</span>${r === "t" && tScope(DB.me.teacher).mode === "custom" ? ' <span class="badge b-rose">내 지정범위 적용</span>' : ""}</label>
          ${pickerHtml("qk-member", { multi: true, pool: members, limit: qkLimit })}
          <div class="hint" id="qk-cap-hint">${qkHintHtml(qkLimitOf(firstClass, "new"))}</div>
          <div class="hint">회원 목록은 니짐내짐(호스트 앱) 회원 원장을 참조해요 — 프로토타입은 더미. 표시 범위는 센터 설정에서 바꿔요.${r === "t" && tScope(DB.me.teacher).mode === "custom" ? ` 센터가 설정한 내 «지정 가능 회원 범위»(${tScopeLabel(DB.me.teacher)})가 함께 적용돼요 (P2-2b).` : ""}</div></div>
        <div class="field"><label>수업</label><select id="qk-class" onchange="App.quickClassChange('${r}')">${classes.map((c) => `<option value="${c.id}">${c.title}</option>`).join("")}</select></div>
        <div class="field"><label>회차</label><select id="qk-slot" onchange="App.quickSlotChange()">
          <option value="new">새 일시로 만들기</option>
          ${joinable.map((s) => `<option value="${s.id}">${dlabel(s.date)} ${s.time} 기존 회차 합류 (${seatCount(s.id)}/${cls(s.classId).capacity}명)</option>`).join("")}</select>
          <div class="hint">기존 회차를 고르면 아래 날짜·시간은 무시돼요.</div></div>
        <div class="field"><label>날짜</label><input type="date" id="qk-date" value="2026-08-22" min="${DB.TODAY}"></div>
        <div class="field"><label>시간</label><input type="time" id="qk-time" value="11:00"></div>
        <button class="btn primary" onclick="App.quickBook('${r}')">바로 예약 확정</button>
      </div>
      <div class="banner"><span class="ic">🔔</span><span>확정 즉시 회원에게 알림이 가요. 회원 몰래 만드는 예약은 불가능해요. 수업권 자격도 함께 검증해요.</span></div>`, { back: true });
  }
  function vTReport() {
    return shell("t", "완료 보고 현황", `
      <p class="muted" style="margin-bottom:12px">회원이 확인한 수업만 정산에 들어가요. 자동확정 건은 별도 표시돼요.</p>
      <div class="card flat">${DB.reports.map((r) => `
        <div class="tl-item"><span class="grow"><b>${r.member}</b> <span class="badge ${RP_BADGE[r.status] || "b-gray"}">${r.label}</span>
          <div class="muted small mt4">${r.slotId ? slotDesc(slot(r.slotId)) : r.desc}</div>
          <div class="muted small">${r.at}${r.method ? ` · ${r.method}` : ""}</div>
          ${r.status === "pending" && DB.policy.methodPin ? `<div class="btn-row"><button class="btn sm ghost" onclick="App.pinStart('${r.id}')">현장 PIN 확인 (회원 입력)</button></div>` : ""}
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
      <div class="pd-note">회당 단가는 각 회원 수업권의 <b>구매 시점 스냅샷</b>(실구매가÷총횟수)이에요 — 같은 상품이라도 등록 시기·할인에 따라 달라요.</div>
      ${groups.map(([u, ls]) => `<div class="pd-group"><div class="pd-ghead">회당 <b>${won(u)}</b> × ${ls.length}회 = <b>${won(u * ls.length)}</b></div>${ls.map(lineRowHtml).join("")}</div>`).join("")}
      ${(held || []).length ? `<div class="pd-group"><div class="pd-ghead pd-held">이의 심사 중 ${held.length}건 — 집계·전송 제외</div>${held.map(lineRowHtml).join("")}</div>` : ""}
    </details>`;
  }
  function vTEarnings() {
    const lines = DB.slines.filter((l) => l.teacherId === DB.me.teacher);
    const elig = lines.filter((l) => l.status === "eligible");
    const held = lines.filter((l) => l.status === "held");
    const auto = elig.filter((l) => l.auto).length;
    const amount = elig.reduce((a, l) => a + l.unitPrice, 0);
    const ns = noshowFinals(DB.me.teacher);
    const nsAmt = rewardOn() ? ns.reduce((a, r) => a + noshowUnit(r), 0) : 0;
    return shell("t", "내 정산", `
      <div class="card"><div class="muted small">2026년 8월 · 수강확인 성립분</div>
        <div class="big mt4">${won(amount + nsAmt)}</div>
        <div class="muted small mt4">확정 ${elig.length}회 × 회당 단가 (수업권 구매가 기준)${nsAmt ? ` + 노쇼 보상` : ""}</div>
        <div class="divider"></div>
        <div class="row" style="justify-content:space-between"><span class="muted">앱·PIN 확인</span><b>${elig.length - auto}회</b></div>
        <div class="row mt8" style="justify-content:space-between"><span class="muted">자동확정</span><b>${auto}회 ${auto ? '<span class="badge b-warn">검토 대상</span>' : ""}</b></div>
        ${rewardOn() && ns.length ? `<div class="row mt8" style="justify-content:space-between"><span class="muted">노쇼 보상 (센터 정책)</span><b>${ns.length}건 · ${won(nsAmt)}</b></div>` : ""}
        ${held.length ? `<div class="row mt8" style="justify-content:space-between"><span class="muted">이의 심사 중 (보류)</span><b>${held.length}회 <span class="badge b-danger">정산 제외 중</span></b></div>` : ""}
        ${linesDetailHtml(elig, held)}
      </div>
      <div class="banner"><span class="ic">💡</span><span>여기는 <b>정산 대상 금액</b>까지만 보여요. 배분율·공제·실지급액은 급여 시스템(샐리)에서 계산돼요.</span></div>`);
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
    return shell("c", DB.center.name, `
      <div class="stat-grid">
        <div class="stat"><div class="k">오늘 수업</div><div class="v">${todaySlots.length}<small>회</small></div></div>
        <div class="stat"><div class="k">예약률 (예정 회차)</div><div class="v">${rate}<small>%</small></div></div>
        <div class="stat"><div class="k">확인 대기</div><div class="v">${pending}<small>건</small></div></div>
        <div class="stat"><div class="k">이의제기</div><div class="v" style="color:var(--danger)">${disputes}<small>건</small></div></div>
      </div>
      ${disputes ? `<button class="banner warn" onclick="location.hash='#/c/confirms'"><span class="ic">⚠️</span><span>처리할 이의제기가 ${disputes}건 있어요. 해당 회차 정산은 보류 중이에요.</span></button>` : ""}
      ${arrs ? `<button class="banner" onclick="location.hash='#/c/bookings'"><span class="ic">📨</span><span>선생님 확인 대기 중인 조율 요청 ${arrs}건.</span></button>` : ""}
      ${warns.map((x) => `<button class="banner warn" onclick="location.hash='#/c/confirms'"><span class="ic">🤖</span><span>${x.t.name} 선생님 자동확정 비율 <b>${x.rate}%</b> — 임계(${DB.policy.autoWarnRate}%) 초과. 검토를 권장해요.</span></button>`).join("")}
      <div class="sec-title">바로가기</div>
      <div class="stat-grid">
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/quick'"><div class="k">예약</div><div class="v" style="font-size:15px">⚡ 즉시 예약확정</div></button>
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/confirms'"><div class="k">수강확인</div><div class="v" style="font-size:15px">✍️ 완료·서명 관리</div></button>
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/products'"><div class="k">판매</div><div class="v" style="font-size:15px">🎟️ 수업상품 관리</div></button>
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/settlement'"><div class="k">월말</div><div class="v" style="font-size:15px">💰 정산·샐리 전송</div></button>
      </div>`);
  }
  // v2.9: 실구매가 → 회당 단가 스냅샷 미리보기 문구 (판매·등록 폼과 App.sellPreview가 공유)
  function sellUnitText(p, price) {
    const unit = Math.floor((price || 0) / p.sessions);
    const listUnit = Math.floor(p.price / p.sessions);
    return `회당 단가 스냅샷 = ${won(price || 0)} ÷ ${p.sessions}회 = <b>${won(unit)}</b>${price && price < p.price
      ? ` <span style="color:var(--link);font-weight:700">· 할인 등록 (정가 회당 ${won(listUnit)})</span>` : " (정가 등록)"}
      — 이후 상품가를 바꿔도 이 수업권엔 소급되지 않아요.`;
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
          <b>회당 단가 = floor(실구매가 ÷ 총횟수)</b>가 구매 시점 스냅샷으로 저장되고, 정산도 이 단가로 집계돼요.</p>
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
      <p class="muted small">이미 판매된 수업권은 구매 시점 조건이 스냅샷으로 보존돼요. 환불·이용정지 처리는 호스트 앱(CRM) 결제·회원 관리와 연동돼요.</p>`, { back: true });
  }
  // ── v2.4: 대규모 회원 «검색 기반 선택» 공통 컴포넌트 (형 지적 08-17: 수천 명 센터 — 칩 전체 나열 금지) ──
  // 사용처: 수업 개설·수정 «지정 회원»(nc-mems/ec-mems), 즉시확정 회원(qk-member, 단일), P2-2b 개별 회원(scope-*).
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
  function eligExtraHtml(prefix, c, role) {
    const selP = c ? c.eligibleProductIds || [] : ["pr3", "pr4"];
    const selM = c ? c.memberIds || [] : [];
    // 초기 렌더도 segElig와 같은 규칙 적용 — 안 하면 «수업권 보유자» 선택인데 지정 회원이 노출돼 혼합처럼 보임 (형 지적 08-17)
    const mode = c ? c.eligibility : "pass";
    const scoped = role === "t" && tScope(DB.me.teacher).mode === "custom";
    // 기존 지정 회원은 범위 밖이어도 표시·유지 (저장 시 조용히 빠지는 사고 방지)
    const pool = DB.members.filter((m) => !m.staff && (!scoped || inTScope(DB.me.teacher, m.id) || selM.includes(m.id)));
    return `
      <div class="field" id="${prefix}-prod-wrap"${mode === "list" ? ' style="display:none"' : ""}><label>사용 가능 수업권 (예약자격)</label>
        <div class="chips" id="${prefix}-prods">${DB.products.map((p) => `<button class="chip${selP.includes(p.id) ? " on" : ""}" data-v="${p.id}" onclick="App.chip(this)">${p.name}</button>`).join("")}</div>
        <div class="hint">고른 수업권을 보유한 회원만 예약할 수 있어요.</div></div>
      <div class="field" id="${prefix}-mem-wrap"${mode === "pass" ? ' style="display:none"' : ""}><label>지정 회원${scoped ? ' <span class="badge b-rose">내 지정범위 적용</span>' : ""}</label>
        ${pickerHtml(prefix + "-mems", { multi: true, initial: selM, pool })}
        <div class="hint">${scoped ? `센터가 설정한 내 «지정 가능 회원 범위»(${tScopeLabel(DB.me.teacher)}) 안의 회원만 보여요. 기존 지정 회원은 범위 밖이어도 유지돼요.` : "회원 목록은 니짐내짐(호스트 앱) 회원 원장을 참조해요 — 프로토타입은 더미."}</div></div>`;
  }
  // 시정①: 센터·선생님 공용 수업 관리 — 선생님은 본인 수업 + classAuth(P2-2) 권한 필요
  function vClasses(role) {
    const isT = role === "t";
    const me = isT ? teacher(DB.me.teacher) : null;
    const auth = isT ? classAuth(me) : { ok: true };
    const list = isT ? DB.classes.filter((c) => c.teacherId === DB.me.teacher) : DB.classes;
    const card = (c) => `<${auth.ok ? `button class="card card-tap" onclick="location.hash='#/${role}/class/${c.id}'"` : `div class="card"`}>
        <div class="row"><span class="grow"><b>${c.title}</b>${c.status === "closed" ? ' <span class="badge b-danger">폐강</span>' : ""}
        <div class="muted small mt4">${teacher(c.teacherId).name} · ${c.scheduleLabel}</div>
        <div class="mt8"><span class="badge ${c.kind === "private" ? "b-rose" : "b-blue"}">${c.kind === "private" ? "개인 1:1" : `그룹 ${c.capacity}명`}</span>
        <span class="badge b-gray">${eligLabel(c)}</span>
        <span class="badge ${c.schedule === "fixed" ? "b-green" : "b-warn"}">${c.schedule === "fixed" ? "고정 시간표" : "조율형"}</span></div>
        ${c.status === "closed" ? `<div class="muted small mt4">사유: ${c.closedReason}</div>` : ""}</span>
        ${auth.ok ? `<span class="arrow" style="color:var(--text-disabled)">›</span>` : ""}</div></${auth.ok ? "button" : "div"}>`;
    return shell(role, isT ? "내 수업 관리" : "수업 관리", `
      ${isT ? (auth.ok
        ? `<div class="banner" style="margin-bottom:14px"><span class="ic">🔓</span><span>수업 개설·관리 권한: <b>${auth.via}</b> — 내 수업의 개설·수정·폐강이 가능해요.</span></div>`
        : `<div class="banner warn" style="margin-bottom:14px"><span class="ic">🔒</span><span><b>수업 개설·관리 권한이 없어요.</b> 센터관리자의 지정을 받거나 자격 멤버십(예: 그룹 필라테스)을 보유해야 해요. 센터에 문의해 주세요.</span></div>`)
        : `<a class="btn ghost" href="#/c/products" style="margin-bottom:14px">🎟️ 수업상품 관리 ›</a>`}
      ${list.length ? list.map(card).join("") : `<div class="card flat"><p class="muted">담당 수업이 없어요.</p></div>`}
      ${auth.ok ? `<div class="sec-title">새 수업 개설</div>
      <div class="card">
        <div class="field"><label>수업명</label><input type="text" id="nc-title" placeholder="예: 저녁 요가 클래스"></div>
        ${isT ? `<div class="field"><label>담당 선생님</label><input type="text" value="${me.name} (본인)" disabled><div class="hint">선생님 개설 수업은 본인 담당으로 만들어져요.</div></div>`
          : `<div class="field"><label>담당 선생님</label><select id="nc-teacher">${DB.teachers.map((t) => `<option value="${t.id}">${t.name} (${t.subject})</option>`).join("")}</select></div>`}
        <div class="field"><label>종류</label><div class="seg" id="nc-kind">
          <button class="on" data-v="group" onclick="App.seg(this)">그룹 (다인)</button>
          <button data-v="private" onclick="App.seg(this)">개인 (1:1)</button></div></div>
        <div class="field"><label>정원</label><input type="number" id="nc-cap" value="6"></div>
        <div class="field"><label>일정 방식</label><div class="seg" id="nc-sched">
          <button class="on" data-v="fixed" onclick="App.seg(this)">매주 고정</button>
          <button data-v="arranged" onclick="App.seg(this)">선생님과 조율</button></div>
          <div class="hint">보통 그룹=고정, 개인=조율이지만 자유롭게 선택할 수 있어요.</div></div>
        <div class="field"><label>예약 가능 회원</label><div class="seg" id="nc-elig">
          <button class="on" data-v="pass" onclick="App.segElig(this,'nc')">수업권 보유자</button>
          <button data-v="list" onclick="App.segElig(this,'nc')">회원 지정</button>
          <button data-v="both" onclick="App.segElig(this,'nc')">혼합</button></div>
          <div class="hint">그룹수업도 특정 회원만 지정할 수 있어요.</div></div>
        ${eligExtraHtml("nc", null, role)}
        <button class="btn primary" onclick="App.createClass('${role}')">수업 개설</button>
      </div>` : ""}`, isT ? { back: true } : {});
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
        <div class="banner warn"><span class="ic">🚫</span><span><b>폐강된 수업</b> · ${c.closedAt || ""}<br>사유: ${c.closedReason}</span></div>
        <div class="card"><div class="muted small">폐강 시점에 예정 회차의 예약은 자동취소·알림 처리됐고, 이미 진행된 회차의 정산 귀속은 그대로 유지돼요.</div></div>`, { back: true });
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
  function vCBookings() {
    const days = ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-24"];
    const arrs = DB.arranges.filter((a) => a.status === "pending");
    return shell("c", "예약 현황", `
      <a class="btn ghost" href="#/c/quick" style="margin-bottom:14px">⚡ 즉시 예약확정</a>
      ${arrs.length ? `<div class="sec-title">조율 요청 (선생님 확인 대기)</div>
      <div class="card flat">${arrs.map((a) => {
        const c = cls(a.classId);
        return `<div class="slot"><span class="time">${a.time}</span>
          <span class="grow"><span class="t">${memberName(a.memberId)} · ${c.title}</span>
          <div class="muted small">${dlabel(a.date)} 희망 · ${teacher(c.teacherId).name} 선생님 인박스</div></span>
          <span class="badge b-warn">대기</span></div>`;
      }).join("")}</div>` : ""}
      ${days.map((d) => {
        const ss = DB.slots.filter((s) => s.date === d && s.status !== "canceled").sort((a, b) => a.time.localeCompare(b.time));
        if (!ss.length) return "";
        return `<div class="sec-title">${dlabel(d)}${d === DB.TODAY ? ' <span class="badge b-rose">오늘</span>' : ""}</div>
        <div class="card flat">${ss.map((s) => {
          const c = cls(s.classId); const n = seatCount(s.id); const w = waitBk(s.id).length;
          const full = n >= c.capacity;
          return `<div class="slot"><span class="time">${s.time}</span>
            <span class="grow"><span class="t">${c.title}</span>
              <div class="cap-bar${full ? " full" : ""}"><i style="width:${Math.min(100, (n / c.capacity) * 100)}%"></i></div>
              <div class="muted small mt4">${teacher(c.teacherId).name} · ${n}/${c.capacity}명${w ? ` · 대기 ${w}` : ""}</div></span>
            <button class="btn sm ghost" onclick="location.hash='#/c/slot/${s.id}'">${s.status === "done" ? "종료" : full ? "마감" : "상세"}</button></div>`;
        }).join("")}</div>`;
      }).join("")}`);
  }
  function vCSlot(id) {
    const s = slot(id);
    if (!s) return vCBookings();
    const c = cls(s.classId);
    const seats = seatBk(s.id);
    const w = waitBk(s.id);
    return shell("c", "회차 상세", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div>
        <div class="mt8"><span class="badge ${s.status === "done" ? "b-gray" : "b-green"}">${s.status === "done" ? "종료" : "예정"}</span>
        <span class="badge b-blue">${seats.length}/${c.capacity}명</span>${w.length ? `<span class="badge b-warn">대기 ${w.length}명</span>` : ""}</div></div>
      <div class="sec-title">예약자</div>
      <div class="card flat">${seats.length ? seats.map((b) => {
        const bd = bkBadge(b);
        return `<div class="slot"><span class="grow"><b>${memberName(b.memberId)}</b><div class="muted small">${pass(b.passId) ? pass(b.passId).name : "수업권 미연결"}</div></span>
          <span class="badge ${bd.badge}">${bd.label}</span>
          ${b.status === "booked" && s.status === "scheduled" ? `<button class="btn sm ghost" onclick="App.centerCancelAsk('${b.id}')">취소</button>` : ""}</div>`;
      }).join("") : `<p class="muted">예약자가 없어요.</p>`}</div>
      ${w.length ? `<div class="sec-title">대기열</div><div class="card flat">${w.map((b) => `
        <div class="slot"><span class="grow"><b>${memberName(b.memberId)}</b></span><span class="badge b-warn">대기 ${b.pos}번</span></div>`).join("")}</div>
        <p class="muted small">자리가 나면 ${DB.policy.waitlistPromote === "auto" ? "순번대로 자동 확정돼요" : "센터가 수동으로 승격해요"} (P4-4).</p>` : ""}`, { back: true });
  }
  function vCConfirms() {
    const warns = DB.policy.autoConfirmHours > 0
      ? DB.teachers.map((t) => ({ t, ...autoStats(t.id) })).filter((x) => x.total && x.rate >= DB.policy.autoWarnRate) : [];
    return shell("c", "완료·서명 관리", `
      ${warns.map((x) => `<div class="banner warn"><span class="ic">🤖</span><span>${x.t.name} 자동확정 비율 <b>${x.rate}%</b> (임계 ${DB.policy.autoWarnRate}%). 자동확정 회차는 정산 전 검토를 권장해요.</span></div>`).join("")}
      <div class="sec-title">회차별 수강확인</div>
      <div class="card flat">${DB.reports.map((r) => `
        <div class="tl-item"><span class="grow"><b>${r.member}</b> <span class="badge ${RP_BADGE[r.status] || "b-gray"}">${r.label}</span>${r.autoFinal ? ` <span class="badge b-warn">무응답 자동확정</span>` : ""}
          <div class="muted small mt4">${r.slotId ? slotDesc(slot(r.slotId)) : r.desc}</div>
          <div class="muted small">${r.at}${r.method ? ` · 수단: ${r.method}` : ""}${r.disputeReason ? ` · 이의 사유: ${r.disputeReason}` : ""}</div>
          ${r.status === "disputed" ? (r.noshow ? `<div class="btn-row">
            <button class="btn sm primary" onclick="App.resolveDispute('${r.id}', true)">인용 (노쇼 취소 · 차감 없음)</button>
            <button class="btn sm ghost" onclick="App.resolveDispute('${r.id}', false)">기각 (노쇼 확정·차감)</button></div>` : `<div class="btn-row">
            <button class="btn sm primary" onclick="App.resolveDispute('${r.id}', true)">인용 (횟수 복원)</button>
            <button class="btn sm ghost" onclick="App.resolveDispute('${r.id}', false)">기각 (확정·차감)</button></div>`) : ""}
          ${r.status === "auto" ? `<div class="btn-row"><button class="btn sm ghost" onclick="App.overrideAuto('${r.id}')">자동확정 무효화</button></div>` : ""}
          ${r.status === "noshow_wait" ? (DB.policy.noshowActor === "center_only" ? `<div class="btn-row">
            <button class="btn sm primary" onclick="App.resolveNoshow('${r.id}', true)">노쇼 확정 (차감)</button>
            <button class="btn sm ghost" onclick="App.resolveNoshow('${r.id}', false)">노쇼 취소 (차감 없음)</button></div>
            <div class="muted small mt4">센터만 판정 정책 — 센터가 직접 확정·취소를 결정해요.</div>` : `
            <div class="muted small mt4">회원 통지됨 · 이의기간 <b>~${noshowDeadline(r).replaceAll("-", ".")}</b> — 무이의 시 <b>자동 확정·차감</b>, 이의 건만 센터 중재 (형 확정 08-17)</div>
            <div class="btn-row"><button class="btn sm ghost" onclick="App.noshowExpire('${r.id}')">⏩ 이의기간 경과 (데모)</button></div>`) : ""}
        </span></div>`).join("")}</div>
      <p class="muted small">모든 확인에는 시각·기기 기록이 남고, 기록은 사후 수정이 불가능해요(원장·해시체인).</p>`, { back: true });
  }
  // S-5: 정산 = 라인 동적 집계. held 제외·멱등 전송·전송 후 이의 경고
  function vCSettlement() {
    const per = DB.teachers.map((t) => {
      const lines = DB.slines.filter((l) => l.teacherId === t.id);
      const elig = lines.filter((l) => l.status === "eligible");
      const held = lines.filter((l) => l.status === "held");
      const unpushed = elig.filter((l) => !l.pushed);
      const pushed = elig.filter((l) => l.pushed);
      const pushedHeld = held.filter((l) => l.pushed);
      const auto = elig.filter((l) => l.auto).length;
      // P9-1 (형 확정 08-17): 노쇼 보상은 센터별 설정 — 확정(noshow_final) 건만, 현재 정책 단가로 동적 집계
      const ns = noshowFinals(t.id);
      const nsAmt = rewardOn() ? ns.reduce((a, r) => a + noshowUnit(r), 0) : 0;
      const nsUnpushed = rewardOn() && DB.policy.noshowRewardPush === "auto" ? ns.filter((r) => !r.rewardPushed) : [];
      return { t, elig, held, unpushed, pushed, pushedHeld, auto, ns, nsAmt, nsUnpushed, amount: elig.reduce((a, l) => a + l.unitPrice, 0) };
    })
      // v2.7: 선생님 수십 명 규모 — 이번 달 내역(정산 라인·노쇼)이 있는 선생님만 표시
      .filter((x) => x.elig.length || x.held.length || x.ns.length);
    const hiddenN = DB.teachers.length - per.length;
    const noshowN = DB.reports.filter((r) => ["noshow_wait", "noshow_final"].includes(r.status)).length;
    const rewardLabel = !rewardOn() ? "보상 없음 (기본)"
      : `보상 지원 · ${DB.policy.noshowRewardPrice === "custom" ? customPriceLabel() : "정상 단가"} · ${DB.policy.noshowRewardPush === "auto" ? "샐리 자동 push (rewardCodes)" : "샐리 수동 체크"}`;
    return shell("c", "정산 · 2026년 8월", `
      <p class="muted" style="margin-bottom:12px">수강확인이 성립한 회차만 집계돼요. 이의제기 중인 회차는 자동 보류되고 전송에서 빠져요.</p>
      ${per.map((x) => `<div class="card"><div class="row"><span class="grow"><b>${x.t.name} 선생님</b>
          <div class="muted small mt4">확정 ${x.elig.length}회 (자동확정 ${x.auto}회 포함)${x.held.length ? ` · <b style="color:var(--danger)">보류 ${x.held.length}건</b>` : ""}</div></span>
          <span class="big">${won(x.amount)}</span></div>
        ${linesDetailHtml(x.elig, x.held)}
        ${x.held.length ? `<div class="banner warn mt12" style="margin-bottom:0"><span class="ic">⏸️</span><span>이의 심사 중 ${x.held.length}건은 집계·전송에서 제외돼요. ${x.pushedHeld.length ? `이미 전송된 ${x.pushedHeld.length}건은 샐리 쪽 정정(DELETE externalId)이 필요해요.` : ""}</span></div>` : ""}
        ${rewardOn() && x.ns.length ? `<div class="banner mt12" style="margin-bottom:0"><span class="ic">🎗️</span><span>노쇼 보상 <b>${x.ns.length}건 · +${won(x.nsAmt)}</b> (${DB.policy.noshowRewardPrice === "custom" ? customPriceLabel() : "정상 단가"}) — ${DB.policy.noshowRewardPush === "auto" ? `샐리 자동 push(special rewardCodes)${x.ns.some((r) => r.rewardPushed) ? ` · 전송 완료 ${x.ns.filter((r) => r.rewardPushed).length}건` : ""}` : "샐리에서 수동 체크로 지급"}</span></div>` : ""}
        <div class="mt12">
          ${x.pushed.length ? `<span class="badge b-green">샐리 전송 완료 ${x.pushed.length}회 · ${x.pushed[x.pushed.length - 1].pushId}</span> ` : ""}
          ${x.unpushed.length || x.nsUnpushed.length ? `<button class="btn sm primary" onclick="App.sallyPush('${x.t.id}')">${(() => {
            const parts = [];
            if (x.unpushed.length) parts.push(`${x.unpushed.length}회`);
            if (x.nsUnpushed.length) parts.push(`보상 ${x.nsUnpushed.length}건`);
            return x.pushed.length ? `추가 ${parts.join(" + ")} 보내기` : `샐리로 보내기 (${parts.join(" + ")})`;
          })()}</button>` : x.pushed.length ? "" : `<span class="muted small">보낼 확정 회차가 없어요.</span>`}
        </div></div>`).join("")}
      ${hiddenN > 0 ? `<div class="card flat"><div class="muted small">이번 달 정산 내역이 없는 선생님 <b>${hiddenN.toLocaleString("ko-KR")}명</b>은 표시하지 않아요.</div></div>` : ""}
      ${noshowN ? `<div class="card flat"><div class="muted small">노쇼 ${noshowN}건 — 정산 라인 미생성(수강확인 미성립). 선생님 보상: <b>${rewardLabel}</b> · P9-1 형 확정(08-17) 센터별 설정 — <a href="#/c/policy" style="color:var(--link);font-weight:600">정책 설정 ›</a></div></div>` : ""}
      <div class="banner"><span class="ic">🔗</span><span>배분율·공제·급여명세는 <b>샐리(급여 시스템)</b>가 계산해요. 여기서는 사실(확정 회차)만 넘겨요. externalId 멱등이라 같은 회차는 두 번 전송되지 않아요.</span></div>`);
  }
  function vCPolicy() {
    const P = DB.policy;
    const sw = (key, on) => `<button class="sw${on ? " on" : ""}" onclick="App.toggle('${key}')" aria-label="${key}"></button>`;
    const sel = (onchange, opts, cur) => `<select onchange="${onchange}">${opts.map(([v, l]) => `<option value="${v}"${String(cur) === String(v) ? " selected" : ""}>${l}</option>`).join("")}</select>`;
    return shell("c", "정책 설정", `
      <div class="sec-title">예약 · 대기</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">정원 마감 시 예약대기</div><div class="td">자리가 나면 순번대로 확정</div></span>${sw("waitlist", P.waitlist)}</div>
        <div class="toggle-row"><span><div class="tl">대기 자동 승격</div><div class="td">끄면 센터가 수동으로 승격 (P4-4)</div></span>${sw("waitlistAuto", P.waitlistPromote === "auto")}</div>
        <div class="toggle-row"><span><div class="tl">즉시확정 회원 표시 범위</div><div class="td">즉시 예약확정 화면의 회원 목록 (P6-4)</div></span>
          ${sel("App.setQuickScope(this.value)", [["valid", "유효 수업권 보유자만"], ["all", "전체 회원"], ["mine", "담당 회원만"]], P.quickScope)}</div>
      </div>
      <div class="sec-title">예약 취소 · 노쇼</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">조건부 취소 허용</div><div class="td">끄면 모든 취소 불가</div></span>${sw("cancelCond", P.cancelMode === "conditional")}</div>
        <div class="toggle-row"><span><div class="tl">취소 기한</div><div class="td">기한 지나 취소하면 횟수 차감</div></span>
          ${sel("App.setCancelHours(this.value)", [[6, "6시간 전"], [12, "12시간 전"], [24, "1일 전"], [48, "2일 전"], [72, "3일 전"]], P.cancelHours)}</div>
        <div class="toggle-row"><span><div class="tl">노쇼 시 횟수 차감</div><div class="td">P5-4 · 끄면 차감 없이 종결</div></span>${sw("noshowDeduct", P.noshowDeduct)}</div>
        <div class="toggle-row"><span><div class="tl">노쇼 판정</div><div class="td">P5-4b 형 확정(08-17): 보고→통지→무이의 시 자동 확정·차감, 이의 건만 센터 중재. 이의기간=아래 이의제기 기간</div></span>
          ${sel("App.setNoshowActor(this.value)", [["teacher_report", "선생님 보고 → 무이의 자동확정"], ["center_only", "센터만 판정"]], P.noshowActor)}</div>
      </div>
      <div class="sec-title">수강확인 (서명)</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">개인수업 확인 필수</div><div class="td">회원 확인 없이는 차감·정산 안 됨</div></span>${sw("signPrivate", P.signPrivate)}</div>
        <div class="toggle-row"><span><div class="tl">그룹수업 확인 필수</div><div class="td">끄면 그룹은 출석 체크만으로 차감 (이의기간은 유지)</div></span>${sw("signGroup", P.signGroup)}</div>
        <div class="toggle-row"><span><div class="tl">회원 앱 확인</div><div class="td">본인 계정·기기에서 탭 확인</div></span>${sw("methodApp", P.methodApp)}</div>
        <div class="toggle-row"><span><div class="tl">회원 PIN 확인</div><div class="td">현장에서 회원이 직접 PIN 입력</div></span>${sw("methodPin", P.methodPin)}</div>
        <div class="toggle-row"><span><div class="tl">무응답 자동확정</div><div class="td">리마인드 2회 후 자동확정 · 별도 표시</div></span>
          ${sel("App.setAutoConfirm(this.value)", [[12, "12시간 후"], [24, "24시간 후"], [48, "48시간 후"], [0, "사용 안 함"]], P.autoConfirmHours)}</div>
        <div class="toggle-row"><span><div class="tl">이의제기 기간</div><div class="td">기간 내 접수 시 정산 보류</div></span>
          ${sel("App.setDispute(this.value)", [[3, "3일"], [7, "7일"], [14, "14일"]], P.disputeDays)}</div>
      </div>
      <div class="sec-title">수업 개설 권한 (선생님) · P2-2</div>
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
      <div class="sec-title">선생님별 지정 가능 회원 범위 · P2-2b</div>
      <div class="card">
        <div class="pk">
          <div class="pk-tools"><input type="search" placeholder="선생님 이름·직군 검색" value="${(polState().q.scope || "").replaceAll('"', "&quot;")}" oninput="App.polQuery('scope', this.value)" autocomplete="off" aria-label="선생님 검색"></div>
          <div class="pk-total">선생님 총 ${DB.teachers.length.toLocaleString("ko-KR")}명 — 행을 누르면 범위를 설정해요</div>
          <div class="pk-results tall"><div id="pol-scope-list">${polScopeRows()}</div></div>
        </div>
        <div class="muted small mt8">범위 미설정(기본)=<b>전체 회원</b>. 이 범위는 선생님의 <b>수업 개설 시 «지정 회원» 선택 목록</b>과 <b>즉시 예약확정 회원 목록</b>에 적용돼요. 단계는 ① 전체 회원 → ② 멤버십 단위(유효 수업권 보유 회원 전체) → ③ 멤버십 하위 개별 회원 선택. 이미 개설된 수업의 지정 회원에는 소급되지 않아요.</div>
      </div>
      <div class="sec-title">정산 · 샐리 연동</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">노쇼 회차 선생님 보상</div><div class="td">P9-1 형 확정(08-17): 센터마다 방침이 달라 센터별 설정 — 정산 미리보기에 즉시 반영</div></span>
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
        <div class="toggle-row"><span><div class="tl">샐리 전달 방식</div><div class="td">자동=special 보상(rewardCodes) push (05 문서) / 수동=샐리에서 직접 체크</div></span>
          ${sel("App.setNoshowRewardPush(this.value)", [["auto", "자동 push"], ["manual", "샐리 수동 체크"]], P.noshowRewardPush)}</div>` : ""}
      </div>
      <p class="muted small">정책을 바꿔도 이미 잡힌 예약·구매한 수업권에는 소급되지 않아요 — 취소규정은 예약 시점에 스냅샷으로 보존돼요.</p>`);
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
        <div class="muted small">범위 미설정(기본)=<b>전체 회원</b>. 이 범위는 선생님의 <b>수업 개설 시 «지정 회원» 선택 목록</b>과 <b>즉시 예약확정 회원 목록</b>에 적용돼요. 이미 개설된 수업의 지정 회원에는 소급되지 않아요.</div>
      </div>
      <button class="btn ghost" onclick="location.hash='#/c/policy'">‹ 정책 설정으로 돌아가기</button>`, { back: true });
  }

  // ── 액션 ──
  const pinTries = {}, pinLocked = {};
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
      // 회원 자가 구매 = 정가 결제 — 동일한 구매 시점 스냅샷 로직(실구매가=정가)
      DB.passes.push({ id, memberId: DB.me.member, productId: p.id, name: p.name, kind: p.kind, total: p.sessions, unitPrice: Math.floor(p.price / p.sessions), purchasePrice: p.price, listPrice: p.price, expiresAt: exp, remaining: p.sessions });
      pushLedger(id, p.sessions, "구매", `${p.name} · ${won(p.price)}`);
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
      toast(`${memberName(mid)} 회원에게 ${p.name} 등록 완료 — 회당 ${won(unit)} 스냅샷 (mock 결제)`);
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
      // S-3: 취소규정을 예약 시점에 스냅샷
      DB.bookings.push({ id: nid("bk"), slotId, memberId: DB.me.member, passId: g.pass.id, status: "booked", policySnap: snapPolicy() });
      toast("예약 완료! 취소 기한 조건은 지금 시점 기준으로 보존돼요.");
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
      DB.bookings.push({ id: nid("bk"), slotId, memberId: DB.me.member, passId: g.pass.id, status: "waitlisted", pos, policySnap: snapPolicy() });
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
      DB.arranges.push({ id: nid("ar"), classId, memberId: DB.me.member, passId: g.pass.id, date: d, time: t, status: "pending", note, at: nowStamp });
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
      const s = { id: nid("s"), classId: c.id, date: a.date, time: a.time, status: "scheduled", adhoc: true };
      DB.slots.push(s);
      DB.bookings.push({ id: nid("bk"), slotId: s.id, memberId: a.memberId, passId: p.id, status: "booked", policySnap: snapPolicy(), fromArrange: a.id });
      a.status = "accepted"; a.slotId = s.id;
      render();
      toast(`수락했어요. ${memberName(a.memberId)} 회원에게 확정 알림이 갔어요.`);
    },
    arrangeDeclineAsk(arId) {
      modal(`<h3>조율 요청 거절</h3><p>거절 사유를 적어 주세요. 회원에게 그대로 전달돼요.</p>
        <div class="field mt12"><textarea id="ar-reason" rows="2" placeholder="예: 그 시간엔 다른 수업이 있어요. 12시 이후는 어떠세요?" style="width:100%;border:1px solid var(--border-strong);border-radius:12px;padding:12px"></textarea></div>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">돌아가기</button>
        <button class="btn primary" onclick="App.arrangeDecline('${arId}')">거절 보내기</button></div>`);
    },
    arrangeDecline(arId) {
      const a = DB.arranges.find((x) => x.id === arId);
      if (!a || a.status !== "pending") return;
      const reason = (document.getElementById("ar-reason") || { value: "" }).value.trim() || "일정이 맞지 않아요";
      a.status = "declined"; a.reason = reason;
      closeModal(); render();
      toast("거절했어요. 사유가 회원에게 전달됐어요.");
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
    // S-1: 상태·보고 검증 후에만 확인 성립
    confirmAttend(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
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
      modal(`<h3>어떤 문제가 있었나요?</h3><p class="mt4">${pre ? "이의제기가 접수되면 확인·차감 없이 센터가 심사해요." : "이미 차감된 회차예요. 접수되면 정산이 보류되고, 인용되면 횟수가 복원돼요."}</p>
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
      toast(pre ? "접수됐어요. 확인·차감 없이 센터가 심사해요." : "접수됐어요. 차감은 유지된 채 정산이 보류돼요 — 인용되면 복원돼요.");
    },
    // 선생님 완료 보고 — 회원별 참석/노쇼 (M-11), 서명 정책 분기 (M-6)
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
          ${DB.policy.noshowDeduct ? ` 노쇼는 회원에게 즉시 통지되고, 이의기간(${DB.policy.disputeDays}일) 내 이의가 없으면 자동 확정·차감돼요.` : " 노쇼는 차감 없이 종결돼요."}</p>
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
      if (noshow) parts.push(DB.policy.noshowDeduct ? `노쇼 ${noshow}명 (회원 즉시 통지 · 무이의 시 자동확정)` : `노쇼 ${noshow}명 (차감 없이 종결)`);
      toast(`완료 보고했어요 — ${parts.join(" · ")}.`);
    },
    // 하-1: 회원 PIN 확인 목업 (04 수단 B)
    pinStart(rpId) {
      if (pinLocked[rpId]) { toast("PIN 확인이 잠겨 있어요. 회원·센터에 알림이 갔어요."); return; }
      modal(`<h3>회원 PIN 확인</h3><p>기기를 회원에게 건네주세요. <b>회원 본인이 직접</b> PIN을 입력해요 — 선생님 화면에 PIN이 보이지 않아요.</p>
        <div class="field mt12"><input type="password" id="pin-input" inputmode="numeric" maxlength="4" placeholder="PIN 4자리" autocomplete="off" style="text-align:center;letter-spacing:10px;font-size:22px;font-weight:800"></div>
        <p class="muted small">5회 실패 시 잠기고 회원·센터에 알림이 가요. (데모 PIN — 김지은: 0417)</p>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">취소</button>
        <button class="btn primary" onclick="App.pinSubmit('${rpId}')">확인</button></div>`);
    },
    pinSubmit(rpId) {
      const r = DB.reports.find((x) => x.id === rpId);
      const m = member(r.memberId);
      const v = (document.getElementById("pin-input") || { value: "" }).value;
      if (!m || pinLocked[rpId]) { closeModal(); return; }
      if (v !== m.pin) {
        pinTries[rpId] = (pinTries[rpId] || 0) + 1;
        if (pinTries[rpId] >= 5) {
          pinLocked[rpId] = true;
          closeModal(); render();
          toast("5회 실패 — PIN 확인이 잠겼어요. 회원·센터에 알림을 보냈어요.");
          return;
        }
        toast(`PIN이 달라요 (${pinTries[rpId]}/5)`);
        return;
      }
      const b = r.bookingId && DB.bookings.find((x) => x.id === r.bookingId);
      if (!b || b.status !== "confirm_wait" || r.status !== "pending") { closeModal(); toast("확인할 수 없는 상태예요."); return; }
      const res = confirmTx(b, r, "PIN 확인");
      closeModal();
      if (!res.ok) { toast(res.msg); return; }
      render();
      toast(`${m.name} 회원 PIN 확인 완료! 1회 차감됐어요.`);
    },
    // S-2: 과거 일시 즉시확정 차단 + 자격검증 + 기존 회차 합류
    quickClassChange(role) {
      const cid = document.getElementById("qk-class").value;
      const c = cls(cid);
      const joinable = DB.slots.filter((s) => s.classId === cid && s.status === "scheduled" && !isPast(s) && seatCount(s.id) < c.capacity);
      document.getElementById("qk-slot").innerHTML = `<option value="new">새 일시로 만들기</option>` +
        joinable.map((s) => `<option value="${s.id}">${dlabel(s.date)} ${s.time} 기존 회차 합류 (${seatCount(s.id)}/${c.capacity}명)</option>`).join("");
      App.quickSlotChange();
    },
    // 수업·회차 변경 시 선택 한도 재계산 — 한도 초과분은 앞선 선택만 남기고 잘라냄 (1:1 전환 등)
    quickSlotChange() {
      const lim = qkLimit();
      const st = pickers["qk-member"];
      if (st && st.sel.size > lim.max) {
        st.sel = new Set([...st.sel].slice(0, lim.max));
        toast(lim.msg);
        pkRefresh("qk-member");
      }
      const h = document.getElementById("qk-cap-hint");
      if (h) h.innerHTML = qkHintHtml(lim);
    },
    // 형 지적 08-17: 복수 회원 일괄 확정 — 전원 가능해야 확정(부분 확정 없음), 자격은 회원별 검증
    quickBook(role) {
      const mids = pkSelected("qk-member");
      const c = cls(document.getElementById("qk-class").value);
      if (!mids.length) { toast("회원을 검색해 선택해 주세요."); return; }
      if (!c) { toast("수업을 선택해 주세요."); return; }
      const lim = qkLimit();
      if (mids.length > lim.max) { toast(lim.msg); return; }
      const errs = [];
      const passOf = {};
      for (const mid of mids) {
        const m = member(mid);
        // P2-2b 재검증 (목록 필터만으론 부족 — 04 원칙)
        if (role === "t" && !inTScope(DB.me.teacher, mid)) { errs.push(`<b>${m.name}</b>: 내 «지정 가능 회원 범위» 밖이에요 — 센터에 범위 확대를 요청해 주세요.`); continue; }
        const g = bookGuard(c, mid);
        if (!g.ok) { errs.push(`<b>${m.name}</b>: ${g.msg}`); continue; }
        passOf[mid] = g.pass;
      }
      const slotSel = document.getElementById("qk-slot").value;
      let s = null, d, t;
      if (slotSel && slotSel !== "new") {
        s = slot(slotSel);
        if (seatCount(s.id) + mids.length > c.capacity) errs.push(`정원 초과: 잔여 ${Math.max(0, c.capacity - seatCount(s.id))}석인데 ${mids.length}명을 선택했어요.`);
        for (const mid of mids) if (DB.bookings.some((b) => b.slotId === s.id && b.memberId === mid && ACTIVE.includes(b.status))) errs.push(`<b>${memberName(mid)}</b>: 이미 이 회차에 예약이 있어요.`);
      } else {
        d = document.getElementById("qk-date").value || "2026-08-22";
        t = document.getElementById("qk-time").value || "11:00";
        if (new Date(`${d}T${t}:00+09:00`) <= NOW) {
          modal(`<h3>지난 일시로는 확정할 수 없어요</h3><p>즉시확정은 앞으로의 수업만 만들 수 있어요. 지난 수업 처리(보고 누락 등)는 센터 관리자에게 사유와 함께 요청해 주세요 — 모든 예외 처리는 감사 기록에 남아요.</p>
            <div class="btn-row"><button class="btn primary" onclick="App.closeModal()">확인</button></div>`);
          return;
        }
      }
      if (errs.length) {
        modal(`<h3>예약할 수 없어요</h3><p>선택 인원 전원이 가능해야 확정돼요 — 부분 확정은 하지 않아요.</p>
          <p class="mt8">${errs.join("<br>")}</p>
          <div class="btn-row"><button class="btn primary" onclick="App.closeModal()">확인</button></div>`);
        return;
      }
      if (!s) { s = { id: nid("s"), classId: c.id, date: d, time: t, status: "scheduled", adhoc: true }; DB.slots.push(s); }
      for (const mid of mids) DB.bookings.push({ id: nid("bk"), slotId: s.id, memberId: mid, passId: passOf[mid].id, status: "booked", policySnap: snapPolicy() });
      const who = mids.length === 1 ? `${memberName(mids[0])} 회원` : `${memberName(mids[0])} 외 ${mids.length - 1}명`;
      toast(`${who} ${dlabel(s.date)} ${s.time} 예약 확정! 회원에게 알림을 보냈어요.`);
      location.hash = role === "c" ? "#/c/bookings" : "#/t/schedule";
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
    // 시정①: 선생님 개설은 classAuth 재검증(UI 숨김만으론 부족 — 04 원칙) + 본인 담당 고정
    createClass(role) {
      let teacherId;
      if (role === "t") {
        if (!classAuth(teacher(DB.me.teacher)).ok) { toast("수업 개설 권한이 없어요 — 센터 지정 또는 자격 멤버십이 필요해요."); return; }
        teacherId = DB.me.teacher;
      } else {
        teacherId = document.getElementById("nc-teacher").value;
      }
      const title = document.getElementById("nc-title").value.trim() || "새 수업";
      const kind = document.querySelector("#nc-kind .on").dataset.v;
      const sched = document.querySelector("#nc-sched .on").dataset.v;
      const elig = document.querySelector("#nc-elig .on").dataset.v;
      const cap = kind === "private" ? 1 : parseInt(document.getElementById("nc-cap").value, 10) || 6;
      const prodIds = [...document.querySelectorAll("#nc-prods .chip.on")].map((b) => b.dataset.v);
      const memIds = pkSelected("nc-mems");
      // M-4: 자격 데이터 실검증
      if (elig !== "pass" && !memIds.length) { toast("지정 회원을 1명 이상 선택해 주세요."); return; }
      if (elig !== "list" && !prodIds.length) { toast("사용 가능한 수업권을 1개 이상 선택해 주세요."); return; }
      // P2-2b 재검증: 선생님은 «지정 가능 회원 범위» 안의 회원만 지정 가능
      if (role === "t" && elig !== "pass") {
        const bad = memIds.filter((mid) => !inTScope(DB.me.teacher, mid));
        if (bad.length) { toast(`내 «지정 가능 회원 범위» 밖 회원이에요: ${bad.map(memberName).join(", ")} — 센터에 범위 확대를 요청해 주세요.`); return; }
      }
      DB.classes.push({ id: nid("c"), title, teacherId, kind, capacity: cap,
        schedule: sched, scheduleLabel: sched === "fixed" ? "매주 고정 (시간표 설정)" : "선생님과 조율", duration: 50,
        eligibility: elig, eligibleProductIds: elig === "list" ? [] : prodIds, memberIds: elig === "pass" ? [] : memIds, status: "active" });
      delete pickers["nc-mems"]; // 개설 폼 리셋 (입력란은 재렌더로 초기화되므로 picker 선택도 함께)
      render();
      toast(`«${title}» 수업이 개설됐어요.`);
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
      modal(`<h3>«${c.title}» 폐강</h3><p>예정 회차 ${future.length}개 · 예약 ${affected}건이 자동취소되고 회원 ${affected}명에게 알림이 가요. 이미 진행된 회차의 정산 귀속은 유지돼요.</p>
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
          r.status = "resolved"; r.label = "이의 인용 · 노쇼 취소";
          if (b) { b.status = "canceled"; b.cancelBy = "noshow_waived"; }
          render();
          toast("이의를 인용했어요. 노쇼가 취소되고 차감 없이 종결돼요. 회원·선생님에게 통지돼요.");
        } else {
          const res = finalizeNoshow(r, "reject");
          if (!res.ok) { toast("기각 처리 불가 — " + res.msg); return; }
          render();
          toast("이의를 기각했어요. 노쇼 확정 — 1회 차감돼요. 회원에게 통지돼요." + (rewardOn() ? " (센터 정책에 따라 보상 정산에 포함)" : ""));
        }
        return;
      }
      const l = r.lineId ? line(r.lineId) : null;
      if (accept) {
        if (r.deducted) {
          const p = passForReport(r, b);
          if (p) { p.remaining += 1; pushLedger(p.id, +1, "이의 인용 복원", r.slotId ? slotDesc(slot(r.slotId)) : r.desc || ""); }
          if (l) l.status = "removed";
          r.deducted = false;
        }
        r.status = "resolved"; r.label = "인용 · 횟수 복원";
        if (b) b.status = "restored";
        render();
        toast("이의를 인용했어요. 횟수가 복원되고 정산에서 제외됐어요." + (l && l.pushed ? " (전송분은 샐리 정정 필요)" : ""));
      } else {
        if (r.deducted) {
          if (l && l.status === "held") l.status = "eligible";
          r.status = r.method === "자동확정" ? "auto" : "confirmed"; r.label = "기각 · 확정 유지";
          if (b) b.status = "confirmed";
          render();
          toast("이의를 기각했어요. 확정·차감이 유지되고 사유가 회원에게 통지돼요.");
        } else if (b) {
          const res = confirmTx(b, r, "센터 기각 확정");
          if (!res.ok) { toast("기각 처리 불가 — " + res.msg); return; }
          r.label = "기각 · 확정 (1회 차감)";
          render();
          toast("이의를 기각했어요. 확인이 성립해 1회 차감·정산 편입됐어요. 회원에게 통지돼요.");
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
        if (p) { p.remaining += 1; pushLedger(p.id, +1, "자동확정 무효화 복원", r.slotId ? slotDesc(slot(r.slotId)) : r.desc || ""); }
        r.deducted = false;
      }
      r.status = "resolved"; r.label = "자동확정 무효화 · 복원";
      if (b) b.status = "restored";
      render();
      toast("자동확정을 무효화했어요. 횟수가 복원되고 정산에서 제외돼요." + (l && l.pushed ? " (전송분은 샐리 정정 필요)" : ""));
    },
    // 형 확정(08-17): 이의기간 무이의 → 자동 확정·차감. 프로토타입은 기간 경과를 데모 버튼으로 시뮬레이션.
    noshowExpire(rpId) {
      const r = DB.reports.find((x) => x.id === rpId);
      if (!r || r.status !== "noshow_wait") return;
      const res = finalizeNoshow(r, "auto");
      if (!res.ok) { toast(res.msg); return; }
      render();
      toast("이의기간 경과 — 무이의 자동확정으로 1회 차감됐어요. «무응답 자동확정» 계열로 표시되고 비율 경고에 포함돼요." + (rewardOn() ? " 센터 보상 정책에 따라 정산 미리보기에 반영돼요." : ""));
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
        toast("노쇼 확정 — 1회 차감됐어요. 정산 라인은 만들지 않아요(수강확인 미성립). 회원에게 통지돼요.");
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
        <p>회차마다 <b>unitPrice(회당 단가 · 구매 시점 스냅샷)</b>가 개별 전송돼요. 배분율·공제는 샐리가 계산해요.</p>
        <div class="pd-list">
          ${groups.map(([u, ls]) => `<div class="pd-group"><div class="pd-ghead">unitPrice <b>${won(u)}</b> × ${ls.length}회</div>${ls.map(lineRowHtml).join("")}</div>`).join("")}
          ${rewards.length ? `<div class="pd-group"><div class="pd-ghead">노쇼 보상 (special rewardCodes) ${rewards.length}건</div>${rewards.map((r) => `<div class="pd-row"><span class="grow"><b>${r.member}</b> <span class="muted small">${r.desc}</span><div class="muted small">노쇼 확정 · ${DB.policy.noshowRewardPrice === "custom" ? customPriceLabel() : "정상 단가"}</div></span><span class="pd-price">${won(noshowUnit(r))}</span></div>`).join("")}</div>` : ""}
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
      if (rewards.length) parts.push(`노쇼 보상 ${rewards.length}건 · ${won(rewards.reduce((a, r) => a + r.rewardAmount, 0))} (special rewardCodes)`);
      toast(`${t.name} 선생님 ${parts.join(" + ")}를 샐리로 보냈어요${held ? ` · 보류 ${held}건 제외` : ""}. (externalId 멱등 · mock)`);
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
        setTimeout(() => { render(); toast("저장됐어요. 기존 예약·수업권에는 소급되지 않아요."); }, 200);
      } else {
        render();
        toast("저장됐어요. 기존 예약·수업권에는 소급되지 않아요.");
      }
    },
    setCancelHours(v) { DB.policy.cancelHours = parseInt(v, 10); toast("취소 기한이 변경됐어요. (신규 예약부터 적용 — 기존 예약은 스냅샷 유지)"); },
    setAutoConfirm(v) { DB.policy.autoConfirmHours = parseInt(v, 10); render(); toast("자동확정 설정이 변경됐어요."); },
    setDispute(v) { DB.policy.disputeDays = parseInt(v, 10); toast("이의제기 기간이 변경됐어요."); },
    setQuickScope(v) { DB.policy.quickScope = v; toast("즉시확정 회원 표시 범위가 변경됐어요."); },
    setNoshowActor(v) { DB.policy.noshowActor = v; render(); toast(v === "center_only" ? "센터만 판정으로 변경했어요 — 노쇼 확정·취소를 센터가 직접 결정해요." : "선생님 보고 → 무이의 자동확정 방식이에요 (형 확정 08-17 기본값)."); },
    // P9-1 (형 확정 08-17): 노쇼 보상 센터별 설정 — 변경 즉시 정산 미리보기 재계산
    setNoshowReward(v) { DB.policy.noshowReward = v; render(); toast(v === "support" ? "노쇼 보상을 지원해요 — 정산·샐리 전송 미리보기에 반영됐어요." : "노쇼 보상 없음(기본)으로 설정했어요."); },
    setNoshowRewardPrice(v) { DB.policy.noshowRewardPrice = v; render(); toast(v === "custom" ? "별도 단가로 보상해요 — 아래에서 금액을 지정해 주세요." : "정상 단가(수업권 회당 단가)로 보상해요."); },
    setNoshowRewardCustom(v) { DB.policy.noshowRewardCustom = Math.max(0, parseInt(v, 10) || 0); render(); toast(`별도 단가 ${won(DB.policy.noshowRewardCustom)}로 저장했어요.`); },
    setNoshowRewardCustomMode(v) { DB.policy.noshowRewardCustomMode = v; render(); toast(v === "percent" ? `수업료의 %로 보상해요 — 회당 단가(정상 단가) 기준, 원 단위 반올림.` : `고정 금액(원)으로 보상해요.`); },
    setNoshowRewardPercent(v) { DB.policy.noshowRewardPercent = Math.min(100, Math.max(0, parseInt(v, 10) || 0)); render(); toast(`수업료의 ${DB.policy.noshowRewardPercent}%로 저장했어요 — 정산 미리보기에 반영됐어요.`); },
    // oninput 실시간 예시 — 저장 전에도 미리보기 갱신 (포커스 유지 위해 부분 갱신)
    previewNoshowPct(v) { const el = document.getElementById("nsPctPreview"); if (el) el.innerHTML = pctPreviewText(v); },
    setNoshowRewardPush(v) { DB.policy.noshowRewardPush = v; render(); toast(v === "auto" ? "샐리 자동 push(special rewardCodes)로 전달해요." : "샐리에서 수동 체크로 지급해요 — push에 포함되지 않아요."); },
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
      render(); toast("지정 가능 회원 범위가 변경됐어요. 이미 개설된 수업의 지정 회원에는 소급되지 않아요.");
    },
    // 주간 일정 요일 탭 선택
    schedDay(d) { tSchedDay = d; render(); },
    scopeMember(tid, mid) {
      const S = (DB.policy.teacherScope || {})[tid];
      if (!S) return;
      S.memberIds = (S.memberIds || []).includes(mid) ? S.memberIds.filter((x) => x !== mid) : [...(S.memberIds || []), mid];
      render(); toast("지정 가능 회원 범위가 변경됐어요. 이미 개설된 수업의 지정 회원에는 소급되지 않아요.");
    },
  };
  window.App = App;

  // ── 라우터 ──
  const routes = [
    [/^#?\/?$/, vLanding],
    [/^#\/m\/home$/, vMHome],
    [/^#\/m\/shop$/, vMShop],
    [/^#\/m\/shop\/(.+)$/, vMShopDetail],
    [/^#\/m\/book$/, vMBook],
    [/^#\/m\/class\/(.+)$/, vMClass],
    [/^#\/m\/slot\/(.+)$/, vMSlot],
    [/^#\/m\/bookings$/, vMBookings],
    [/^#\/m\/confirm\/(.+)$/, vMConfirm],
    [/^#\/m\/history$/, vMHistory],
    [/^#\/t\/home$/, vTHome],
    [/^#\/t\/schedule$/, vTSchedule],
    [/^#\/t\/inbox$/, vTInbox],
    [/^#\/t\/slot\/(.+)$/, vTSlot],
    [/^#\/t\/quick$/, () => vTQuick("t")],
    [/^#\/t\/classes$/, () => vClasses("t")],
    [/^#\/t\/class\/(.+)$/, (id) => vClassManage("t", id)],
    [/^#\/t\/report$/, vTReport],
    [/^#\/t\/earnings$/, vTEarnings],
    [/^#\/c\/home$/, vCHome],
    [/^#\/c\/products$/, vCProducts],
    [/^#\/c\/classes$/, () => vClasses("c")],
    [/^#\/c\/class\/(.+)$/, (id) => vClassManage("c", id)],
    [/^#\/c\/bookings$/, vCBookings],
    [/^#\/c\/slot\/(.+)$/, vCSlot],
    [/^#\/c\/quick$/, () => vTQuick("c")],
    [/^#\/c\/confirms$/, vCConfirms],
    [/^#\/c\/settlement$/, vCSettlement],
    [/^#\/c\/policy$/, vCPolicy],
    [/^#\/c\/policy\/scope\/(.+)$/, vCPolicyScope],
  ];
  let lastHash = null;
  function render() {
    const h = location.hash || "#/";
    if (h !== lastHash) Object.keys(pickers).forEach((k) => { if (pickers[k].hash !== h) delete pickers[k]; }); // 화면 이동 시 picker 상태 초기화
    if (h !== lastHash && !h.startsWith("#/c/policy")) polUI.live = false; // v2.7: 정책 화면군 밖으로 나가면 검색·펼침 초기화
    if (h !== lastHash && h !== "#/t/schedule") tSchedDay = null; // v2.8: 주간 일정 이탈 시 요일 선택 초기화
    let body = null;
    for (const [re, fn] of routes) {
      const m = h.match(re);
      if (m) { body = fn(m[1]); break; }
    }
    const keepToasts = [...$app.querySelectorAll(".toast")]; // 화면 이동해도 토스트 유지
    const prevY = window.scrollY;
    // v2.10: 회원 화면만 실서비스 앱 톤(role-m 스코프) — 선생님·센터는 기존 톤 유지
    $app.classList.toggle("role-m", h.split("/")[1] === "m");
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
  // 스크롤 에지: 콘텐츠가 헤더 밑으로 흐를 때만 경계선·그림자 표시
  window.addEventListener("scroll", () => {
    const hd = document.querySelector(".hd");
    if (hd) hd.classList.toggle("scrolled", window.scrollY > 4);
  }, { passive: true });
  window.addEventListener("hashchange", () => { closeModal(true); render(); });
  render();
})();

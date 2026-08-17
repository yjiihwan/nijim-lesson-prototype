/* 니짐내짐 레슨 관리 프로토타입 — 해시 라우팅 SPA (빌드 불필요) */
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
  const slotDesc = (s) => { const c = cls(s.classId); return `${dlabel(s.date)} ${s.time} · ${c.title}`; };
  function hoursUntil(s) {
    return (new Date(`${s.date}T${s.time}:00+09:00`) - NOW) / 3600000;
  }
  function dday(dateStr) {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr + "T23:59:59+09:00") - NOW) / 86400000);
  }
  function addDays(dateStr, n) {
    // 정오 기준으로 더해 UTC 변환 시 날짜 밀림 방지
    const d = new Date(new Date(dateStr + "T12:00:00+09:00").getTime() + n * 86400000);
    return d.toISOString().slice(0, 10);
  }

  // ── 모션 유틸 (Apple 스프링: damping ratio + response, 인터럽터블) ──
  const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)");
  function spring(opts) {
    // opts: from, to, velocity(px/s), damping(비율, 1=임계감쇠), response(초), onUpdate, onDone
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
  // 모멘텀 프로젝션(iOS 스크롤 감속과 동일) · 러버밴드(경계 저항)
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
  let sheetCtl = null; // 열려 있는 시트의 상태 (y·스프링 핸들)
  function modal(html) {
    closeModal(true);
    const wrap = document.createElement("div");
    wrap.className = "modal-wrap";
    wrap.innerHTML = `<div class="modal-dim"></div><div class="modal" role="dialog" aria-modal="true"><div class="grabber" aria-hidden="true"></div>${html}</div>`;
    document.querySelector(".shell").appendChild(wrap);
    const sheet = wrap.querySelector(".modal");
    const dim = wrap.querySelector(".modal-dim");
    dim.addEventListener("click", () => closeModal());
    const H = sheet.getBoundingClientRect().height + 100; // ::before 스커트 포함
    const ctl = { wrap, sheet, dim, H, y: H, anim: null };
    ctl.set = (y) => {
      ctl.y = y;
      const vis = y < 0 ? -rubberband(-y, H) : y; // 위로 끌면 러버밴드 저항
      sheet.style.transform = `translateY(${vis}px)`;
      dim.style.opacity = Math.max(0, Math.min(1, 1 - y / H)); // 딤은 시트 위치에 1:1 연동
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
      if (e.target.closest("input, textarea, select, button, a")) return;
      if (ctl.anim) { ctl.anim.stop(); ctl.anim = null; } // 비행 중에도 그 자리에서 잡힘
      drag = { startY: e.clientY, baseY: ctl.y, moved: false, hist: [[performance.now(), ctl.y]] };
      ctl.sheet.setPointerCapture(e.pointerId);
    });
    ctl.sheet.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.abs(dy) < 8) return; // 히스테리시스
      drag.moved = true;
      ctl.set(drag.baseY + dy); // 1:1 트래킹 (잡은 지점 기준)
      const now = performance.now();
      drag.hist.push([now, ctl.y]);
      while (drag.hist.length > 2 && now - drag.hist[0][0] > 100) drag.hist.shift();
    });
    const release = () => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) return;
      const [t0, y0] = d.hist[0], [t1, y1] = d.hist[d.hist.length - 1];
      const v = t1 > t0 ? ((y1 - y0) / (t1 - t0)) * 1000 : 0; // 릴리즈 속도 px/s
      if (ctl.y + project(v) > ctl.H * 0.42 && ctl.y > 0) {
        // 모멘텀이 아래를 향함 → 닫힘. 속도를 스프링에 그대로 핸드오프
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

  // ── 셸 렌더 ──
  const ROLE_LABEL = { m: "회원", t: "선생님", c: "센터" };
  const TABS = {
    m: [["#/m/home", "🏠", "홈"], ["#/m/book", "📅", "예약"], ["#/m/shop", "🎟️", "구매"], ["#/m/history", "📜", "내역"]],
    t: [["#/t/home", "🏠", "오늘"], ["#/t/schedule", "🗓️", "일정"], ["#/t/report", "✅", "보고"], ["#/t/earnings", "💰", "정산"]],
    c: [["#/c/home", "🏠", "홈"], ["#/c/products", "🎟️", "상품"], ["#/c/classes", "🧘", "수업"], ["#/c/bookings", "📅", "예약"], ["#/c/settlement", "💰", "정산"]],
  };
  function shell(role, title, body, opts = {}) {
    const tabs = TABS[role] || [];
    const cur = location.hash.split("/").slice(0, 3).join("/");
    return `
      <header class="hd"><div class="hd-in">
        ${opts.back ? `<button class="hd-back" onclick="history.back()" aria-label="뒤로">‹</button>` : ""}
        <div class="hd-title">${title}</div>
        ${role === "c" ? `<button class="hd-role" onclick="location.hash='#/c/policy'">⚙️ 정책</button>` : ""}
        <button class="hd-role" onclick="location.hash='#/'">역할: <b>${ROLE_LABEL[role] || "-"}</b></button>
      </div></header>
      <main class="screen${tabs.length ? "" : " no-tab"}">${body}</main>
      ${tabs.length ? `<nav class="tabbar">${tabs.map(([h, ic, l]) =>
        `<a class="tab${h.startsWith(cur) && cur !== "#" ? " on" : ""}" href="${h}"><span class="ic">${ic}</span>${l}</a>`).join("")}</nav>` : ""}`;
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
        <span class="em">💪</span><span><span class="rt">선생님</span><span class="rd">내 수업 · 즉시 예약확정 · 완료 보고 · 정산</span></span><span class="arrow">›</span></button>
      <button class="role-card" onclick="location.hash='#/c/home'">
        <span class="em">🏢</span><span><span class="rt">센터 (사장·관리자)</span><span class="rd">상품·수업 개설 · 정책 설정 · 예약 현황 · 정산</span></span><span class="arrow">›</span></button>
    </main>`;
  }

  // ══ 회원 ══
  function passCard(p) {
    const dd = dday(p.expiresAt);
    const pct = Math.round((p.remaining / p.total) * 100);
    return `<div class="pass-card">
      <div class="row"><span class="name grow">${p.name}</span>
        <span class="badge ${p.expiresAt ? (dd <= 14 ? "b-warn" : "b-blue") : "b-green"}">${p.expiresAt ? `D-${dd}` : "기간 제한 없음"}</span></div>
      <div class="left">${p.remaining}회 <small>/ ${p.total}회 남음</small></div>
      <div class="meta">${p.expiresAt ? `${p.expiresAt.replaceAll("-", ".")} 까지 · ` : ""}회당 ${won(p.unitPrice)}</div>
      <div class="pass-bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }
  function vMHome() {
    const confirmWait = DB.bookings.filter((b) => b.status === "confirm_wait");
    const upcoming = DB.bookings.filter((b) => ["booked", "waitlisted", "arrange_wait"].includes(b.status));
    return shell("m", "니짐내짐 레슨", `
      ${confirmWait.map((b) => `<button class="banner" onclick="location.hash='#/m/confirm/${b.id}'">
        <span class="ic">✍️</span><span>${slotDesc(slot(b.slotId))} 수업, 잘 받으셨나요? <u>수강 확인하기</u></span></button>`).join("")}
      <div class="sec-title">내 수업권</div>
      ${DB.passes.map(passCard).join("")}
      <a class="btn ghost" href="#/m/shop">+ 수업 멤버십 구매</a>
      <div class="sec-title row">다가오는 예약<a href="#/m/bookings" class="small" style="margin-left:auto;color:var(--text-muted);font-weight:600">전체 보기 ›</a></div>
      <div class="card flat">${upcoming.length ? upcoming.map((b) => {
        const s = slot(b.slotId); const c = cls(s.classId);
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${c.title}</span><div class="muted small">${dlabel(s.date)} · ${teacher(c.teacherId).name} 선생님</div></span>
          <span class="badge ${["waitlisted", "arrange_wait"].includes(b.status) ? "b-warn" : "b-green"}">${b.label}</span></div>`;
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
    return shell("m", "수업 예약", `
      ${DB.classes.map((c) => `<button class="card card-tap" onclick="location.hash='#/m/class/${c.id}'">
        <div class="row"><span class="grow"><b>${c.title}</b>
          <div class="muted small mt4">${teacher(c.teacherId).name} 선생님 · ${c.scheduleLabel} · ${c.duration}분</div>
          <div class="mt8"><span class="badge ${c.kind === "private" ? "b-rose" : "b-blue"}">${c.kind === "private" ? "개인 1:1" : `그룹 · 정원 ${c.capacity}명`}</span>
          <span class="badge b-gray">${c.eligibilityLabel}</span></div></span>
        <span class="arrow" style="color:var(--text-disabled)">›</span></div></button>`).join("")}`);
  }
  function vMClass(id) {
    const c = cls(id);
    if (!c) return vMBook();
    if (c.schedule === "arranged") {
      return shell("m", c.title, `
        <div class="card"><b>${teacher(c.teacherId).name} 선생님과 일정 조율</b>
          <p class="muted small mt4">이 수업은 고정 시간표가 없어요. 희망 일시를 보내면 선생님이 확인 후 확정해 드려요.</p></div>
        <div class="card">
          <div class="field"><label>희망 날짜</label><input type="date" id="arr-date" value="2026-08-21"></div>
          <div class="field"><label>희망 시간</label><input type="time" id="arr-time" value="11:00"></div>
          <button class="btn primary" onclick="App.requestArrange('${c.id}')">조율 요청 보내기</button>
        </div>
        <p class="muted small">확정되면 예약이 자동 등록되고 알림을 보내드려요.</p>`, { back: true });
    }
    const slots = DB.slots.filter((s) => s.classId === id && s.status === "scheduled");
    return shell("m", c.title, `
      <div class="card flat"><div class="muted small">${teacher(c.teacherId).name} 선생님 · ${c.scheduleLabel} · 정원 ${c.capacity}명</div></div>
      <div class="sec-title">예약 가능 회차</div>
      <div class="card flat">${slots.map((s) => {
        const full = s.booked >= c.capacity;
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${dlabel(s.date)}</span>
            <div class="cap-bar${full ? " full" : ""}"><i style="width:${Math.min(100, (s.booked / c.capacity) * 100)}%"></i></div>
            <div class="muted small mt4">${s.booked}/${c.capacity}명${s.waitlist ? ` · 대기 ${s.waitlist}명` : ""}</div></span>
          <button class="btn sm ${full ? "ghost" : "primary"}" onclick="location.hash='#/m/slot/${s.id}'">${full ? "대기" : "예약"}</button></div>`;
      }).join("")}</div>`, { back: true });
  }
  function vMSlot(id) {
    const s = slot(id);
    if (!s) return vMBook();
    const c = cls(s.classId);
    const full = s.booked >= c.capacity;
    const myPass = DB.passes.find((p) => p.kind === c.kind && p.remaining > 0);
    return shell("m", "예약 확인", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${c.duration}분 · ${teacher(c.teacherId).name} 선생님</div>
        <div class="mt8"><span class="badge ${full ? "b-danger" : "b-green"}">${full ? `정원 마감 · 대기 ${s.waitlist || 0}명` : `잔여 ${c.capacity - s.booked}자리`}</span></div>
        <div class="divider"></div>
        <div class="row" style="justify-content:space-between"><span class="muted">사용 수업권</span><b>${myPass ? `${myPass.name} (잔여 ${myPass.remaining}회)` : "보유 수업권 없음"}</b></div>
      </div>
      <div class="banner warn"><span class="ic">ℹ️</span><span>취소는 수업 <b>${DB.policy.cancelHours}시간 전</b>까지 무료예요. 이후 취소하면 횟수가 차감돼요. (예약 시점 기준으로 보존)</span></div>
      ${myPass ? (full
        ? (DB.policy.waitlist
          ? `<button class="btn primary" onclick="App.joinWaitlist('${s.id}','${myPass.id}')">예약대기 신청 (${(s.waitlist || 0) + 1}번째)</button>
             <p class="muted small mt8" style="text-align:center">자리가 나면 순번대로 자동 확정되고 알림을 보내드려요.</p>`
          : `<button class="btn primary" disabled>정원 마감 (이 센터는 대기를 받지 않아요)</button>`)
        : `<button class="btn primary" onclick="App.book('${s.id}','${myPass.id}')">예약하기</button>`)
        : `<a class="btn primary" href="#/m/shop">수업권 구매하러 가기</a>`}`, { back: true });
  }
  function vMBookings() {
    const act = DB.bookings.filter((b) => ["booked", "waitlisted", "confirm_wait", "arrange_wait"].includes(b.status));
    const past = DB.bookings.filter((b) => ["canceled", "forfeited", "confirmed", "disputed"].includes(b.status));
    const item = (b, withCancel) => {
      const s = slot(b.slotId); const c = cls(s.classId);
      const badge = { booked: "b-green", waitlisted: "b-warn", arrange_wait: "b-warn", confirm_wait: "b-rose", canceled: "b-gray", forfeited: "b-danger", confirmed: "b-blue", disputed: "b-warn" }[b.status];
      return `<div class="slot"><span class="grow"><span class="t">${c.title}</span>
        <div class="muted small">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div></span>
        <span class="badge ${badge}">${b.label}</span>
        ${withCancel && b.status !== "confirm_wait" ? `<button class="btn sm ghost" onclick="App.askCancel('${b.id}')">취소</button>` : ""}
        ${b.status === "confirm_wait" ? `<button class="btn sm primary" onclick="location.hash='#/m/confirm/${b.id}'">확인</button>` : ""}</div>`;
    };
    return shell("m", "내 예약", `
      <div class="sec-title">예정 · 대기</div>
      <div class="card flat">${act.length ? act.map((b) => item(b, true)).join("") : `<p class="muted">예약이 없어요.</p>`}</div>
      ${past.length ? `<div class="sec-title">지난 예약</div><div class="card flat">${past.map((b) => item(b, false)).join("")}</div>` : ""}`, { back: true });
  }
  function vMConfirm(id) {
    const b = DB.bookings.find((x) => x.id === id);
    if (!b) return vMHome();
    const s = slot(b.slotId); const c = cls(s.classId);
    if (b.status === "confirmed") {
      return shell("m", "수강 확인", `<div class="card" style="text-align:center;padding:32px 16px">
        <div style="font-size:40px">✅</div><b style="font-size:17px">확인 완료!</b>
        <p class="muted mt8">${slotDesc(s)}<br>수업권 1회가 차감됐어요.</p></div>
        <a class="btn ghost" href="#/m/home">홈으로</a>`, { back: true });
    }
    return shell("m", "수강 확인", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${teacher(c.teacherId).name} 선생님</div>
        <div class="divider"></div>
        <p style="font-size:15px">수업을 이상 없이 받으셨나요?<br><span class="muted small">확인하면 수업권 1회가 차감되고, 이 기록으로 선생님 수업료가 정산돼요.</span></p></div>
      <div class="banner"><span class="ic">🔒</span><span>확인은 <b>회원 본인 계정</b>에서만 가능해요. ${DB.policy.autoConfirmHours}시간 안에 응답이 없으면 자동확정되며, 문제가 있으면 ${DB.policy.disputeDays}일 안에 이의제기할 수 있어요.</span></div>
      <button class="btn primary" onclick="App.confirmAttend('${b.id}')">네, 이상 없이 수강했어요</button>
      <button class="btn danger-ghost mt8" onclick="App.askDispute('${b.id}')">문제가 있어요 (이의제기)</button>`, { back: true });
  }
  function vMHistory() {
    return shell("m", "이용 내역", `
      <p class="muted" style="margin-bottom:12px">수업권의 모든 증감 기록이에요. 기록은 수정·삭제되지 않아요.</p>
      ${DB.passes.map((p) => `<div class="sec-title">${p.name}</div>
        <div class="card flat"><ul class="ledger">${DB.ledger.filter((l) => l.passId === p.id).slice().reverse().map((l) => `
          <li><span class="delta ${l.delta < 0 ? "minus" : "plus"}">${l.delta > 0 ? "+" + l.delta : l.delta}</span>
          <span class="grow"><b>${l.reason}</b><div class="muted small">${l.detail}</div></span>
          <span class="muted small">${l.at.slice(5, 16)}</span></li>`).join("")}</ul></div>`).join("")}`);
  }

  // ══ 선생님 ══
  function tSlots() { return DB.slots.filter((s) => cls(s.classId).teacherId === DB.me.teacher); }
  function vTHome() {
    const today = tSlots().filter((s) => s.date === DB.TODAY).sort((a, b) => a.time.localeCompare(b.time));
    const pending = DB.reports.filter((r) => r.status === "pending").length;
    return shell("t", "박코치 선생님", `
      <div class="stat-grid">
        <div class="stat"><div class="k">오늘 수업</div><div class="v">${today.length}<small>회</small></div></div>
        <div class="stat"><div class="k">확인 대기</div><div class="v">${pending}<small>건</small></div></div>
      </div>
      ${pending ? `<button class="banner" onclick="location.hash='#/t/report'"><span class="ic">✍️</span><span>회원 확인을 기다리는 수업이 ${pending}건 있어요.</span></button>` : ""}
      <div class="sec-title">오늘 일정 · ${dlabel(DB.TODAY)}</div>
      <div class="card flat">${today.length ? today.map((s) => {
        const c = cls(s.classId);
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${c.title}</span><div class="muted small">${(s.attendees || []).join(", ") || `${s.booked}명`}</div></span>
          <button class="btn sm ghost" onclick="location.hash='#/t/slot/${s.id}'">상세</button></div>`;
      }).join("") : `<p class="muted">오늘 수업이 없어요.</p>`}</div>
      <a class="btn primary mt8" href="#/t/quick">+ 즉시 예약확정</a>
      <p class="muted small mt8" style="text-align:center">즉시확정 시 회원에게 바로 알림이 가요.</p>`);
  }
  function vTSchedule() {
    const days = ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"];
    const all = tSlots().filter((s) => days.includes(s.date)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return shell("t", "주간 일정", `
      <div class="daystrip">${days.map((d) => {
        const dt = new Date(d + "T00:00:00+09:00");
        return `<div class="day${d === DB.TODAY ? " on" : ""}"><div class="dw">${DOW[dt.getDay()]}</div><div class="dn">${dt.getDate()}</div></div>`;
      }).join("")}</div>
      <div class="card flat">${all.map((s) => {
        const c = cls(s.classId);
        return `<div class="slot"><span class="time">${s.time}</span>
          <span class="grow"><span class="t">${c.title}</span><div class="muted small">${dlabel(s.date)} · ${c.schedule === "fixed" ? "고정" : "조율"} · ${s.booked}명</div></span>
          <button class="btn sm ghost" onclick="location.hash='#/t/slot/${s.id}'">상세</button></div>`;
      }).join("")}</div>`);
  }
  function vTSlot(id) {
    const s = slot(id);
    if (!s) return vTHome();
    const c = cls(s.classId);
    const done = s.status === "done";
    const reported = DB.reports.some((r) => r.slotId === s.id);
    return shell("t", "수업 상세", `
      <div class="card"><b>${c.title}</b>
        <div class="muted mt4">${dlabel(s.date)} ${s.time} · ${c.duration}분</div>
        <div class="mt8"><span class="badge ${done ? "b-gray" : "b-green"}">${done ? "종료" : "예정"}</span>
        <span class="badge b-blue">${s.booked}/${c.capacity}명</span>${s.waitlist ? `<span class="badge b-warn">대기 ${s.waitlist}명</span>` : ""}</div></div>
      <div class="sec-title">참석자</div>
      <div class="card flat">${(s.attendees || ["김지은"]).map((n) => `<div class="slot"><span class="grow"><b>${n}</b></span><span class="badge b-green">예약 확정</span></div>`).join("")}</div>
      ${done ? (reported
        ? `<div class="banner"><span class="ic">⏳</span><span>완료 보고됨 — 회원 확인을 기다리고 있어요. 확인되어야 정산에 들어가요.</span></div>`
        : `<button class="btn primary" onclick="App.reportDone('${s.id}')">수업 완료 보고</button>
           <p class="muted small mt8" style="text-align:center">보고하면 회원에게 수강 확인 요청이 가요.<br>회원이 확인해야 횟수 차감·정산 대상이 돼요.</p>`)
        : `<button class="btn ghost" disabled style="color:var(--text-disabled)">수업 종료 후 완료 보고할 수 있어요</button>`}`, { back: true });
  }
  function vTQuick(role) {
    const r = role || "t";
    const classes = r === "t" ? DB.classes.filter((c) => c.teacherId === DB.me.teacher) : DB.classes;
    return shell(r, "즉시 예약확정", `
      <p class="muted" style="margin-bottom:12px">예약 절차 없이 일자와 회원을 골라 바로 확정해요.</p>
      <div class="card">
        <div class="field"><label>회원</label><select id="qk-member">${DB.members.map((m) => `<option value="${m.id}">${m.name} (${m.phone})</option>`).join("")}</select></div>
        <div class="field"><label>수업</label><select id="qk-class">${classes.map((c) => `<option value="${c.id}">${c.title}</option>`).join("")}</select></div>
        <div class="field"><label>날짜</label><input type="date" id="qk-date" value="2026-08-22"></div>
        <div class="field"><label>시간</label><input type="time" id="qk-time" value="11:00"></div>
        <button class="btn primary" onclick="App.quickBook('${r}')">바로 예약 확정</button>
      </div>
      <div class="banner"><span class="ic">🔔</span><span>확정 즉시 회원에게 알림이 가요. 회원 몰래 만드는 예약은 불가능해요.</span></div>`, { back: true });
  }
  function vTReport() {
    const badge = { pending: "b-rose", confirmed: "b-green", auto: "b-warn", disputed: "b-danger", resolved: "b-gray" };
    return shell("t", "완료 보고 현황", `
      <p class="muted" style="margin-bottom:12px">회원이 확인한 수업만 정산에 들어가요. 자동확정 건은 별도 표시돼요.</p>
      <div class="card flat">${DB.reports.map((r) => `
        <div class="slot"><span class="grow"><b>${r.member}</b>
          <div class="muted small">${r.slotId ? slotDesc(slot(r.slotId)) : r.desc}</div>
          <div class="muted small">${r.at}${r.method ? ` · ${r.method}` : ""}</div></span>
        <span class="badge ${badge[r.status]}">${r.label}</span></div>`).join("")}</div>`);
  }
  function vTEarnings() {
    const st = DB.settlement.find((x) => x.teacherId === DB.me.teacher);
    return shell("t", "내 정산", `
      <div class="card"><div class="muted small">2026년 8월 · 수강확인 성립분</div>
        <div class="big mt4">${won(st.amount)}</div>
        <div class="muted small mt4">확정 ${st.sessions}회 × 회당 단가 (수업권 구매가 기준)</div>
        <div class="divider"></div>
        <div class="row" style="justify-content:space-between"><span class="muted">앱·PIN 확인</span><b>${st.sessions - st.autoCount}회</b></div>
        <div class="row mt8" style="justify-content:space-between"><span class="muted">자동확정</span><b>${st.autoCount}회 <span class="badge b-warn">검토 대상</span></b></div>
      </div>
      <div class="banner"><span class="ic">💡</span><span>여기는 <b>정산 대상 금액</b>까지만 보여요. 배분율·공제·실지급액은 급여 시스템(샐리)에서 계산돼요.</span></div>`);
  }

  // ══ 센터 ══
  function vCHome() {
    const todaySlots = DB.slots.filter((s) => s.date === DB.TODAY);
    const disputes = DB.reports.filter((r) => r.status === "disputed").length;
    const pending = DB.reports.filter((r) => r.status === "pending").length;
    return shell("c", DB.center.name, `
      <div class="stat-grid">
        <div class="stat"><div class="k">오늘 수업</div><div class="v">${todaySlots.length}<small>회</small></div></div>
        <div class="stat"><div class="k">예약률 (주간)</div><div class="v">78<small>%</small></div></div>
        <div class="stat"><div class="k">확인 대기</div><div class="v">${pending}<small>건</small></div></div>
        <div class="stat"><div class="k">이의제기</div><div class="v" style="color:var(--danger)">${disputes}<small>건</small></div></div>
      </div>
      ${disputes ? `<button class="banner warn" onclick="location.hash='#/c/confirms'"><span class="ic">⚠️</span><span>처리할 이의제기가 ${disputes}건 있어요. 해당 회차 정산은 보류 중이에요.</span></button>` : ""}
      <button class="banner warn" onclick="location.hash='#/c/confirms'"><span class="ic">🤖</span><span>박코치 선생님 자동확정 비율 <b>33%</b> — 임계(30%) 초과. 검토를 권장해요.</span></button>
      <div class="sec-title">바로가기</div>
      <div class="stat-grid">
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/quick'"><div class="k">예약</div><div class="v" style="font-size:15px">⚡ 즉시 예약확정</div></button>
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/confirms'"><div class="k">수강확인</div><div class="v" style="font-size:15px">✍️ 완료·서명 관리</div></button>
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/policy'"><div class="k">운영</div><div class="v" style="font-size:15px">⚙️ 정책 설정</div></button>
        <button class="stat" style="text-align:left" onclick="location.hash='#/c/settlement'"><div class="k">월말</div><div class="v" style="font-size:15px">💰 정산·샐리 전송</div></button>
      </div>`);
  }
  function vCProducts() {
    return shell("c", "수업상품 관리", `
      ${DB.products.map((p) => `<div class="card"><div class="row"><span class="grow"><b>${p.name}</b>
        <div class="muted small mt4">${p.kind === "private" ? "개인" : "그룹"} · ${p.sessions}회 · ${p.validityDays ? p.validityDays + "일" : "기간 제한 없음"}</div></span>
        <b>${won(p.price)}</b></div></div>`).join("")}
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
      </div>`);
  }
  function vCClasses() {
    return shell("c", "수업 관리", `
      ${DB.classes.map((c) => `<div class="card"><b>${c.title}</b>
        <div class="muted small mt4">${teacher(c.teacherId).name} · ${c.scheduleLabel}</div>
        <div class="mt8"><span class="badge ${c.kind === "private" ? "b-rose" : "b-blue"}">${c.kind === "private" ? "개인 1:1" : `그룹 ${c.capacity}명`}</span>
        <span class="badge b-gray">${c.eligibilityLabel}</span>
        <span class="badge ${c.schedule === "fixed" ? "b-green" : "b-warn"}">${c.schedule === "fixed" ? "고정 시간표" : "조율형"}</span></div></div>`).join("")}
      <div class="sec-title">새 수업 개설</div>
      <div class="card">
        <div class="field"><label>수업명</label><input type="text" id="nc-title" placeholder="예: 저녁 요가 클래스"></div>
        <div class="field"><label>담당 선생님</label><select id="nc-teacher">${DB.teachers.map((t) => `<option value="${t.id}">${t.name} (${t.subject})</option>`).join("")}</select></div>
        <div class="field"><label>종류</label><div class="seg" id="nc-kind">
          <button class="on" data-v="group" onclick="App.seg(this)">그룹 (다인)</button>
          <button data-v="private" onclick="App.seg(this)">개인 (1:1)</button></div></div>
        <div class="field"><label>정원</label><input type="number" id="nc-cap" value="6"></div>
        <div class="field"><label>일정 방식</label><div class="seg" id="nc-sched">
          <button class="on" data-v="fixed" onclick="App.seg(this)">매주 고정</button>
          <button data-v="arranged" onclick="App.seg(this)">선생님과 조율</button></div>
          <div class="hint">보통 그룹=고정, 개인=조율이지만 자유롭게 선택할 수 있어요.</div></div>
        <div class="field"><label>예약 가능 회원</label><div class="seg" id="nc-elig">
          <button class="on" data-v="pass" onclick="App.seg(this)">수업권 보유자</button>
          <button data-v="list" onclick="App.seg(this)">회원 지정</button>
          <button data-v="both" onclick="App.seg(this)">혼합</button></div>
          <div class="hint">그룹수업도 특정 회원만 지정할 수 있어요.</div></div>
        <button class="btn primary" onclick="App.createClass()">수업 개설</button>
      </div>`);
  }
  function vCBookings() {
    const days = ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21"];
    return shell("c", "예약 현황", `
      <a class="btn ghost" href="#/c/quick" style="margin-bottom:14px">⚡ 즉시 예약확정</a>
      ${days.map((d) => {
        const ss = DB.slots.filter((s) => s.date === d).sort((a, b) => a.time.localeCompare(b.time));
        if (!ss.length) return "";
        return `<div class="sec-title">${dlabel(d)}${d === DB.TODAY ? ' <span class="badge b-rose">오늘</span>' : ""}</div>
        <div class="card flat">${ss.map((s) => {
          const c = cls(s.classId); const full = s.booked >= c.capacity;
          return `<div class="slot"><span class="time">${s.time}</span>
            <span class="grow"><span class="t">${c.title}</span>
              <div class="cap-bar${full ? " full" : ""}"><i style="width:${Math.min(100, (s.booked / c.capacity) * 100)}%"></i></div>
              <div class="muted small mt4">${teacher(c.teacherId).name} · ${s.booked}/${c.capacity}명${s.waitlist ? ` · 대기 ${s.waitlist}` : ""}</div></span>
            <span class="badge ${s.status === "done" ? "b-gray" : full ? "b-danger" : "b-green"}">${s.status === "done" ? "종료" : full ? "마감" : "접수중"}</span></div>`;
        }).join("")}</div>`;
      }).join("")}`);
  }
  function vCConfirms() {
    const badge = { pending: "b-rose", confirmed: "b-green", auto: "b-warn", disputed: "b-danger", resolved: "b-gray" };
    return shell("c", "완료·서명 관리", `
      <div class="banner warn"><span class="ic">🤖</span><span>박코치 자동확정 비율 <b>33%</b> (임계 30%). 자동확정 회차는 정산 전 검토를 권장해요.</span></div>
      <div class="sec-title">회차별 수강확인</div>
      <div class="card flat">${DB.reports.map((r) => `
        <div class="tl-item"><span class="grow"><b>${r.member}</b> <span class="badge ${badge[r.status]}">${r.label}</span>
          <div class="muted small mt4">${r.slotId ? slotDesc(slot(r.slotId)) : r.desc}</div>
          <div class="muted small">${r.at}${r.method ? ` · 수단: ${r.method}` : ""}</div>
          ${r.status === "disputed" ? `<div class="btn-row">
            <button class="btn sm primary" onclick="App.resolveDispute('${r.id}', true)">인용 (횟수 복원)</button>
            <button class="btn sm ghost" onclick="App.resolveDispute('${r.id}', false)">기각</button></div>` : ""}
          ${r.status === "auto" ? `<div class="btn-row"><button class="btn sm ghost" onclick="App.overrideAuto('${r.id}')">자동확정 무효화</button></div>` : ""}
        </span></div>`).join("")}</div>
      <p class="muted small">모든 확인에는 시각·기기 기록이 남고, 기록은 사후 수정이 불가능해요(원장·해시체인).</p>`);
  }
  function vCSettlement() {
    return shell("c", "정산 · 2026년 8월", `
      <p class="muted" style="margin-bottom:12px">수강확인이 성립한 회차만 집계돼요. 이의제기 중인 회차는 자동 보류돼요.</p>
      ${DB.settlement.map((st) => `<div class="card"><div class="row"><span class="grow"><b>${st.teacher} 선생님</b>
          <div class="muted small mt4">확정 ${st.sessions}회 (자동확정 ${st.autoCount}회 포함)</div></span>
          <span class="big">${won(st.amount)}</span></div>
        <div class="mt12">${st.pushed
          ? `<span class="badge b-green">샐리 전송 완료 · ${st.pushId}</span>`
          : `<button class="btn sm primary" onclick="App.sallyPush('${st.teacherId}')">샐리로 보내기</button>`}</div></div>`).join("")}
      <div class="banner"><span class="ic">🔗</span><span>배분율·공제·급여명세는 <b>샐리(급여 시스템)</b>가 계산해요. 여기서는 사실(확정 회차)만 넘겨요. 같은 회차는 두 번 전송되지 않아요.</span></div>`);
  }
  function vCPolicy() {
    const P = DB.policy;
    const sw = (key, on) => `<button class="sw${on ? " on" : ""}" onclick="App.toggle('${key}')" aria-label="${key}"></button>`;
    return shell("c", "정책 설정", `
      <div class="sec-title">예약 · 대기</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">정원 마감 시 예약대기</div><div class="td">자리가 나면 순번대로 자동 확정</div></span>${sw("waitlist", P.waitlist)}</div>
      </div>
      <div class="sec-title">예약 취소</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">조건부 취소 허용</div><div class="td">끄면 모든 취소 불가</div></span>${sw("cancelCond", P.cancelMode === "conditional")}</div>
        <div class="toggle-row"><span><div class="tl">취소 기한</div><div class="td">기한 지나 취소하면 횟수 차감</div></span>
          <select style="border:1px solid var(--border-strong);border-radius:10px;padding:8px" onchange="App.setCancelHours(this.value)">
            ${[6, 12, 24, 48, 72].map((h) => `<option value="${h}"${P.cancelHours === h ? " selected" : ""}>${h >= 24 ? h / 24 + "일" : h + "시간"} 전</option>`).join("")}</select></div>
      </div>
      <div class="sec-title">수강확인 (서명)</div>
      <div class="card flat">
        <div class="toggle-row"><span><div class="tl">개인수업 확인 필수</div><div class="td">회원 확인 없이는 차감·정산 안 됨</div></span>${sw("signPrivate", P.signPrivate)}</div>
        <div class="toggle-row"><span><div class="tl">그룹수업 확인 필수</div><div class="td">끄면 그룹은 출석 체크만으로 차감</div></span>${sw("signGroup", P.signGroup)}</div>
        <div class="toggle-row"><span><div class="tl">회원 앱 확인</div><div class="td">본인 계정·기기에서 탭 확인</div></span>${sw("methodApp", P.methodApp)}</div>
        <div class="toggle-row"><span><div class="tl">회원 PIN 확인</div><div class="td">현장에서 회원이 직접 PIN 입력</div></span>${sw("methodPin", P.methodPin)}</div>
        <div class="toggle-row"><span><div class="tl">무응답 자동확정</div><div class="td">리마인드 2회 후 자동확정 · 별도 표시</div></span>
          <select style="border:1px solid var(--border-strong);border-radius:10px;padding:8px" onchange="App.setAutoConfirm(this.value)">
            ${[12, 24, 48, 0].map((h) => `<option value="${h}"${P.autoConfirmHours === h ? " selected" : ""}>${h ? h + "시간 후" : "사용 안 함"}</option>`).join("")}</select></div>
        <div class="toggle-row"><span><div class="tl">이의제기 기간</div><div class="td">기간 내 접수 시 정산 보류</div></span>
          <select style="border:1px solid var(--border-strong);border-radius:10px;padding:8px" onchange="App.setDispute(this.value)">
            ${[3, 7, 14].map((d) => `<option value="${d}"${P.disputeDays === d ? " selected" : ""}>${d}일</option>`).join("")}</select></div>
      </div>
      <p class="muted small">정책을 바꿔도 이미 잡힌 예약·구매한 수업권에는 소급되지 않아요.</p>`, { back: true });
  }

  // ── 액션 ──
  const App = {
    closeModal,
    seg(btn) {
      btn.parentElement.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
    },
    buy(pid) {
      const p = DB.products.find((x) => x.id === pid);
      const id = "ps" + (DB.passes.length + 1);
      const exp = p.validityDays ? addDays(DB.TODAY, p.validityDays) : null;
      DB.passes.push({ id, memberId: "m1", productId: p.id, name: p.name, kind: p.kind, total: p.sessions, unitPrice: Math.floor(p.price / p.sessions), expiresAt: exp, remaining: p.sessions });
      DB.ledger.push({ passId: id, delta: p.sessions, reason: "구매", detail: `${p.name} · ${won(p.price)}`, at: "2026-08-17 12:00" });
      toast("구매 완료! 수업권이 지갑에 담겼어요 💪 (mock 결제)");
      location.hash = "#/m/home";
    },
    book(slotId, passId) {
      const s = slot(slotId);
      s.booked += 1;
      DB.bookings.push({ id: "bk" + (DB.bookings.length + 1), slotId, passId, status: "booked", label: "예약 확정" });
      toast("예약 완료! 취소 기한 전까지는 횟수 차감이 없어요.");
      location.hash = "#/m/bookings";
    },
    joinWaitlist(slotId, passId) {
      const s = slot(slotId);
      s.waitlist = (s.waitlist || 0) + 1;
      DB.bookings.push({ id: "bk" + (DB.bookings.length + 1), slotId, passId, status: "waitlisted", pos: s.waitlist, label: `대기 ${s.waitlist}번` });
      toast(`대기 ${s.waitlist}번으로 등록됐어요. 자리가 나면 알려드릴게요!`);
      location.hash = "#/m/bookings";
    },
    requestArrange(classId) {
      const c = cls(classId);
      const d = document.getElementById("arr-date").value || "2026-08-21";
      const t = document.getElementById("arr-time").value || "11:00";
      const s = { id: "s" + (DB.slots.length + 1), classId, date: d, time: t, booked: 1, status: "scheduled", attendees: ["김지은"] };
      DB.slots.push(s);
      const myPass = DB.passes.find((p) => p.kind === c.kind && p.remaining > 0);
      DB.bookings.push({ id: "bk" + (DB.bookings.length + 1), slotId: s.id, passId: myPass ? myPass.id : null, status: "arrange_wait", label: "조율 확인 대기" });
      toast(`${teacher(c.teacherId).name} 선생님에게 조율 요청을 보냈어요.`);
      location.hash = "#/m/bookings";
    },
    askCancel(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      const s = slot(b.slotId);
      if (b.status === "waitlisted" || b.status === "arrange_wait") {
        const isWait = b.status === "waitlisted";
        modal(`<h3>${isWait ? "대기를" : "조율 요청을"} 취소할까요?</h3><p>${slotDesc(s)}<br>${isWait ? "대기" : "조율 요청"} 취소는 횟수 차감이 없어요.</p>
          <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">아니요</button>
          <button class="btn primary" onclick="App.doCancel('${bkId}', false)">${isWait ? "대기" : "요청"} 취소</button></div>`);
        return;
      }
      const h = hoursUntil(s);
      if (DB.policy.cancelMode !== "conditional") {
        modal(`<h3>취소할 수 없어요</h3><p>이 센터는 예약 취소를 받지 않아요. 센터에 문의해 주세요.</p>
          <div class="btn-row"><button class="btn primary" onclick="App.closeModal()">확인</button></div>`);
        return;
      }
      if (h >= DB.policy.cancelHours) {
        modal(`<h3>예약을 취소할까요?</h3><p>${slotDesc(s)}<br>기한(${DB.policy.cancelHours}시간 전) 안이라 <b style="color:var(--success)">횟수 차감 없이</b> 취소돼요.</p>
          <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">아니요</button>
          <button class="btn primary" onclick="App.doCancel('${bkId}', false)">무료 취소</button></div>`);
      } else {
        modal(`<h3>⚠️ 지금 취소하면 1회 차감돼요</h3><p>${slotDesc(s)}<br>취소 기한(수업 ${DB.policy.cancelHours}시간 전)이 지났어요. 지금 취소하면 <b style="color:var(--danger)">횟수 환불 없이 1회가 차감</b>돼요.</p>
          <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">그냥 둘게요</button>
          <button class="btn danger-ghost" onclick="App.doCancel('${bkId}', true)">차감하고 취소</button></div>`);
      }
    },
    doCancel(bkId, forfeit) {
      const b = DB.bookings.find((x) => x.id === bkId);
      const s = slot(b.slotId);
      if (b.status === "waitlisted") s.waitlist = Math.max(0, (s.waitlist || 0) - 1);
      else s.booked = Math.max(0, s.booked - 1);
      if (forfeit) {
        b.status = "forfeited"; b.label = "기한 위반 취소 (-1회)";
        const p = b.passId && pass(b.passId);
        if (p) {
          p.remaining -= 1;
          DB.ledger.push({ passId: p.id, delta: -1, reason: "기한 위반 취소", detail: slotDesc(s), at: "2026-08-17 12:00" });
        }
        toast("취소됐어요. 기한이 지나 1회가 차감됐어요.");
      } else {
        b.status = "canceled"; b.label = "취소됨";
        toast("취소됐어요. 횟수 차감은 없어요.");
      }
      closeModal(); render();
    },
    confirmAttend(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      const s = slot(b.slotId);
      b.status = "confirmed"; b.label = "수강 완료";
      const p = pass(b.passId); p.remaining -= 1;
      DB.ledger.push({ passId: p.id, delta: -1, reason: "수강 확인", detail: `${slotDesc(s)} · 앱 확인`, at: "2026-08-17 12:00" });
      const rp = DB.reports.find((r) => r.slotId === s.id);
      if (rp) { rp.status = "confirmed"; rp.label = "확인 완료"; rp.method = "앱 확인"; }
      render();
      toast("확인 완료! 수업권 1회가 차감됐어요.");
    },
    askDispute(bkId) {
      modal(`<h3>어떤 문제가 있었나요?</h3><p class="mt4">이의제기가 접수되면 이 회차의 차감·정산이 보류되고 센터가 확인해요.</p>
        <div class="field mt12"><textarea id="dp-reason" rows="3" placeholder="예: 이 수업을 받은 적이 없어요" style="width:100%;border:1px solid var(--border-strong);border-radius:12px;padding:12px"></textarea></div>
        <div class="btn-row"><button class="btn ghost" onclick="App.closeModal()">돌아가기</button>
        <button class="btn primary" onclick="App.doDispute('${bkId}')">이의제기 접수</button></div>`);
    },
    doDispute(bkId) {
      const b = DB.bookings.find((x) => x.id === bkId);
      b.status = "disputed"; b.label = "이의제기 중";
      const rp = DB.reports.find((r) => r.slotId === b.slotId);
      if (rp) { rp.status = "disputed"; rp.label = "이의제기"; }
      closeModal();
      location.hash = "#/m/bookings";
      toast("접수됐어요. 처리될 때까지 차감·정산이 보류돼요.");
    },
    reportDone(slotId) {
      const s = slot(slotId);
      DB.reports.unshift({ id: "rp" + (DB.reports.length + 1), slotId, member: (s.attendees || ["김지은"])[0], status: "pending", method: null, label: "회원 확인 대기", at: "8/17 12:00 보고" });
      render();
      toast("완료 보고됐어요. 회원에게 수강 확인 요청을 보냈어요.");
    },
    quickBook(role) {
      const m = DB.members.find((x) => x.id === document.getElementById("qk-member").value);
      const cid = document.getElementById("qk-class").value;
      const c = cls(cid);
      const d = document.getElementById("qk-date").value || "2026-08-22";
      const t = document.getElementById("qk-time").value || "11:00";
      const s = { id: "s" + (DB.slots.length + 1), classId: cid, date: d, time: t, booked: 1, status: "scheduled", attendees: [m.name] };
      DB.slots.push(s);
      if (m.id === DB.me.member) {
        const myPass = DB.passes.find((p) => p.kind === c.kind && p.remaining > 0);
        DB.bookings.push({ id: "bk" + (DB.bookings.length + 1), slotId: s.id, passId: myPass ? myPass.id : null, status: "booked", label: "예약 확정" });
      }
      toast(`${m.name} 회원 ${dlabel(d)} ${t} 예약 확정! 회원에게 알림을 보냈어요.`);
      location.hash = role === "c" ? "#/c/bookings" : "#/t/schedule";
    },
    createProduct() {
      const name = document.getElementById("np-name").value.trim() || "새 수업권";
      const kind = document.querySelector("#np-kind .on").dataset.v;
      const sessions = parseInt(document.getElementById("np-sessions").value, 10) || 10;
      const price = parseInt(document.getElementById("np-price").value, 10) || 0;
      const noDays = document.getElementById("np-nodays").checked;
      const days = noDays ? null : parseInt(document.getElementById("np-days").value, 10) || 90;
      DB.products.push({ id: "pr" + (DB.products.length + 1), name, kind, sessions, price, validityDays: days });
      render();
      toast(`«${name}» 상품이 개설됐어요.`);
    },
    createClass() {
      const title = document.getElementById("nc-title").value.trim() || "새 수업";
      const teacherId = document.getElementById("nc-teacher").value;
      const kind = document.querySelector("#nc-kind .on").dataset.v;
      const sched = document.querySelector("#nc-sched .on").dataset.v;
      const elig = document.querySelector("#nc-elig .on").dataset.v;
      const cap = kind === "private" ? 1 : parseInt(document.getElementById("nc-cap").value, 10) || 6;
      DB.classes.push({ id: "c" + (DB.classes.length + 1), title, teacherId, kind, capacity: cap,
        schedule: sched, scheduleLabel: sched === "fixed" ? "매주 고정 (시간표 설정)" : "선생님과 조율", duration: 50,
        eligibility: elig, eligibilityLabel: elig === "pass" ? "수업권 보유자" : elig === "list" ? "지정 회원만" : "수업권 + 지정 회원" });
      render();
      toast(`«${title}» 수업이 개설됐어요.`);
    },
    resolveDispute(rpId, accept) {
      const r = DB.reports.find((x) => x.id === rpId);
      if (accept) { r.status = "resolved"; r.label = "인용 · 횟수 복원"; toast("이의를 인용했어요. 횟수가 복원되고 정산에서 제외돼요."); }
      else { r.status = "confirmed"; r.label = "기각 · 확정 유지"; toast("이의를 기각했어요. 사유가 기록되고 회원에게 통지돼요."); }
      render();
    },
    overrideAuto(rpId) {
      const r = DB.reports.find((x) => x.id === rpId);
      r.status = "resolved"; r.label = "자동확정 무효화 · 복원";
      render();
      toast("자동확정을 무효화했어요. 횟수가 복원되고 정산에서 제외돼요.");
    },
    sallyPush(tid) {
      const st = DB.settlement.find((x) => x.teacherId === tid);
      st.pushed = true; st.pushId = "sly_" + tid + "_202608";
      render();
      toast(`${st.teacher} 선생님 ${st.sessions}회를 샐리로 보냈어요. (멱등 전송 · mock)`);
    },
    toggle(key) {
      const P = DB.policy;
      if (key === "cancelCond") P.cancelMode = P.cancelMode === "conditional" ? "none" : "conditional";
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
    setCancelHours(v) { DB.policy.cancelHours = parseInt(v, 10); toast("취소 기한이 변경됐어요. (신규 예약부터 적용)"); },
    setAutoConfirm(v) { DB.policy.autoConfirmHours = parseInt(v, 10); toast("자동확정 설정이 변경됐어요."); },
    setDispute(v) { DB.policy.disputeDays = parseInt(v, 10); toast("이의제기 기간이 변경됐어요."); },
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
    [/^#\/t\/slot\/(.+)$/, vTSlot],
    [/^#\/t\/quick$/, () => vTQuick("t")],
    [/^#\/t\/report$/, vTReport],
    [/^#\/t\/earnings$/, vTEarnings],
    [/^#\/c\/home$/, vCHome],
    [/^#\/c\/products$/, vCProducts],
    [/^#\/c\/classes$/, vCClasses],
    [/^#\/c\/bookings$/, vCBookings],
    [/^#\/c\/quick$/, () => vTQuick("c")],
    [/^#\/c\/confirms$/, vCConfirms],
    [/^#\/c\/settlement$/, vCSettlement],
    [/^#\/c\/policy$/, vCPolicy],
  ];
  let lastHash = null;
  function render() {
    const h = location.hash || "#/";
    let body = null;
    for (const [re, fn] of routes) {
      const m = h.match(re);
      if (m) { body = fn(m[1]); break; }
    }
    const keepToasts = [...$app.querySelectorAll(".toast")]; // 화면 이동해도 토스트 유지
    $app.innerHTML = body != null ? body : vLanding();
    keepToasts.forEach((el) => $app.appendChild(el));
    window.scrollTo(0, 0);
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

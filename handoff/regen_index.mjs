import fs from "fs";
const P = "/Users/ideagent/dev_workspace/brands/nijim/projects/lesson_mgmt_20260817/prototype/app.js";
let lines = fs.readFileSync(P, "utf8").split("\n");
const pad = (s, w) => String(s).padEnd(w, " ");
const scan = () => {
  const secs = [], svr = [], pure = [];
  lines.forEach((L, i) => {
    let m;
    if ((m = L.match(/^\s*\/\/ \[구역 (\d+)\] (.+)$/))) secs.push([i + 1, m[1], m[2]]);
    if ((m = L.match(/^\s*\/\/ (🧮\[순수\]|📐\[규칙\]) ([A-Za-z_$][\w$]*)/))) pure.push([i + 1, m[2], m[1].includes("규칙") ? "📐" : "🧮"]);
    if (L.includes("// [SERVER]") && !L.includes("검색:")) {
      let name = "?";
      for (let j = i + 1; j < Math.min(i + 12, lines.length); j++) {
        const t = lines[j];
        if (/^\s*\/\//.test(t)) continue;
        const g = t.match(/^\s*(?:function|const)\s+([A-Za-z_$][\w$]*)/) || t.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/);
        if (/^\s*if \(\/\^#/.test(t)) name = "역할 라우트 가드";
        else if (g && !/^(if|for|while|return|switch|else)$/.test(g[1])) name = g[1];
        break;
      }
      svr.push([i + 1, name]);
    }
  });
  return { secs, svr, pure };
};
const swap = (startNeedle, endNeedle, build) => {
  const a = lines.findIndex((L) => L.includes(startNeedle));
  const b = lines.findIndex((L) => L.includes(endNeedle));
  if (a < 0 || b < 0 || b <= a) { console.error("블록 못 찾음:", startNeedle); process.exit(1); }
  lines.splice(a, b - a, ...build());
};
// 길이가 바뀌면 줄번호도 바뀌므로 «길이 고정»될 때까지 2회 돌린다
for (let pass = 0; pass < 3; pass++) {
  const { secs, svr, pure } = scan();
  swap("── 구역 (검색", "── 🧮 도메인 순수", () => {
    const o = ["   ── 구역 (검색: «[구역 ») ──────────────────────────────────────────────────────"];
    secs.forEach(([n, no, t]) => o.push(`   ${pad(n, 6)} [구역 ${no}] ${t}`));
    o.push("");
    return o;
  });
  swap("── 🧮 도메인 순수", "── 🔒 [SERVER] 마커", () => {
    const o = ["   ── 🧮 도메인 순수 함수 / 📐 규칙 (검색: «🧮[순수]» · 입력/출력/불변식 주석이 붙어 있다) ──",
      "   실서버로 옮길 때 «그대로 옮겨도 되는» 계산 로직이다. 화면·DOM 을 읽지 않는다."];
    pure.forEach(([n, nm, ic]) => o.push(`   ${pad(n, 6)} ${ic} ${nm}`));
    o.push("");
    return o;
  });
  swap("── 🔒 [SERVER] 마커", "── 🧭 역할별 라우트", () => {
    const o = [`   ── 🔒 [SERVER] 마커 ${svr.length}곳 (검색: «[SERVER]») ─────────────────────────────`,
      "   🔴프론트가 계산·판정하지만 실서버에서는 «서버가 권위» 여야 하는 자리다.",
      "   이 로직을 클라이언트 신뢰 그대로 이식하면 그 자리가 곧 조작 취약점이 된다."];
    for (let i = 0; i < svr.length; i += 3) o.push("   " + svr.slice(i, i + 3).map(([n, nm]) => pad(`${n} ${nm}`, 30)).join("").trimEnd());
    o.push("");
    return o;
  });
}
fs.writeFileSync(P, lines.join("\n"));
const { secs, svr, pure } = scan();
console.log(`재생성 — 구역 ${secs.length} · 순수/규칙 ${pure.length} · SERVER ${svr.length} · 이름미상 ${svr.filter(x=>x[1]==="?").length}`);

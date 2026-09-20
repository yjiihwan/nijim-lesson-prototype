# 반복 회차 8주 롤링 배치 — 실서비스 인계 사양
작성 2026-09-20 · 근거 `lesson_recur_design_20260917.md` §4 (형 확정 2026-09-17 «매일 새벽 자동 실행»)
프로토타입 대응 코드 `prototype/app.js` — `recurRollAll(trigger)` / `rollWatch()` / `App.recurRollNow()`

## 1. 확정 사양

| 항목 | 값 |
|---|---|
| 주기 | **매일 1회, 새벽 04:00 KST** |
| 시간대 | **Asia/Seoul 고정.** UTC 스케줄러를 쓴다면 `19:00 UTC` (= 익일 04:00 KST). ⛔UTC 자정 기준으로 돌리면 날짜 경계가 9시간 밀려 «오늘»이 하루 어긋난다 |
| 대상 | `recurs` 중 `active = true` 이고, 그 수업(`classes`)이 `closed` 가 아닌 것 전부 |
| 동작 | 오늘 기준 **8주(ROLL_WEEKS=8) 지평선**까지 아직 없는 회차를 생성 |
| 멱등성 | **필수.** 두 번 돌아도 회차가 늘지 않아야 한다 (§3) |
| 실패 처리 | **규칙 단위 try/catch.** 한 규칙이 실패해도 나머지는 계속. 실패분은 로그에 남기고 **다음 날 자동 재시도**(별도 재시도 큐 불필요 — 매일 도는 배치가 곧 재시도다) |
| 로그 | 실행 시각 · trigger · 처리한 규칙 수 · 생성한 회차 수 · 실패한 규칙 id 목록 |
| 알림 | 배치 자체는 회원 알림을 만들지 않는다 (자리를 «여는» 동작뿐) |

**04:00인 이유:** 심야 예약이 끝난 뒤이고, 가장 이른 새벽 수업(시드 06:30) 시작 전이다.

## 2. 의사 코드

```
04:00 KST 매일:
  log = { at: now, trigger: "batch", rules: 0, made: 0, failed: [] }
  for r in recurs where r.active and class(r.classId).status != "closed":
      try:
          made += generateSlots(r, from = max(r.startDate, today), to = today + 56d)
      catch e:
          log.failed.push(r.id); logError(r.id, e)   # ⛔전체 트랜잭션을 롤백하지 마라
  persist(log)
```

생성 루프에는 상한이 있어야 한다(프로토타입 `RECUR_MAX_DAYS = 400`). 규칙 데이터가 깨져도 무한 루프로 가지 않게 하는 안전핀이다.

## 3. 멱등성 — 중복 키에 `recurId`를 반드시 포함 (🔴필수)

회차 «이미 있음» 판정 키는 다음과 같다. **v2.63까지는 `recurId`가 빠져 있었고, 요일 변경(규칙 교체)을 도입하면 옛 규칙과 새 규칙이 잠시 공존하므로 서로의 회차를 흡수하는 사고가 난다.**

```
존재 판정 = slots 중
    classId = r.classId AND date = d AND time = r.time AND status != 'canceled'
    AND (recurId IS NULL OR recurId = r.id)      -- ★ 이 줄이 v2.64에서 추가된 부분
```

- `recurId IS NULL`(주인 없는 회차 = 사람이 직접 만든 회차)은 **종전대로 흡수**한다. 같은 일시에 회차를 둘로 만들지 않기 위해서다.
- 다른 규칙이 소유한 회차(`recurId = 다른 규칙`)는 **흡수하지도, 그 자리에 새로 만들지도 않는다.** 자리를 뺏지 않는 것이 원칙이다.
- DB 레벨 보강 권장: `UNIQUE (class_id, date, time) WHERE status <> 'canceled'` 부분 유니크 인덱스. 배치가 동시에 두 번 떠도 중복이 물리적으로 막힌다.

## 4. 부팅/접속 시 롤링은 «지우지 말고» 남겨 둘 것

프로토타입은 앱이 열릴 때 `recurRollAll("boot")`를 한 번 돌리고, 열려 있는 채 날짜가 바뀌면 `rollWatch()`가 다시 돌린다(`setInterval` 60초 + `visibilitychange`).

실서비스에서도 **배치가 실패한 날의 안전망**으로 같은 성격의 보정 경로를 하나 남기길 권한다 (예: 반복 설정 화면 진입 시 그 수업만 보정). 멱등이므로 중복 생성 위험은 없다.

## 5. 모니터링 권장치

- 배치가 **24시간 넘게 성공 기록이 없으면** 알림. (아무도 앱을 안 열어도 회차가 안 늘어나는 상태가 조용히 이어지는 게 가장 위험하다)
- `failed` 목록이 **이틀 연속 같은 규칙 id**를 담으면 알림 — 데이터가 깨진 규칙이다.
- 하루 생성량이 평소의 3배를 넘으면 알림 — 지평선 설정이나 시각 계산이 어긋났을 가능성.

## 6. 프로토타입에서의 취급 (그대로 옮기면 안 되는 부분)

프로토타입엔 서버가 없어 진짜 배치를 돌리지 못한다. 대신 **«날짜 바뀜 감지 후 롤링»**으로 동작만 흉내 낸다.
- `kstToday()` = `new Date(Date.now() + 9h).toISOString().slice(0,10)` — 브라우저 타임존과 무관하게 KST 날짜를 얻는다.
- 60초마다 비교해 날이 바뀌면 재실행. 탭을 다시 열 때(`visibilitychange`)도 검사.
- QA·인계 확인용 수동 트리거: 콘솔에서 `App.recurRollNow("manual")` → `{ made, failed }` 반환. 몇 번을 불러도 `made`는 0이어야 정상이다(멱등 확인).

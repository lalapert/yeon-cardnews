# @yeon.virel 뉴스 카드 — 감시·제작·게시 지침

매시간 한 번 실행되는 감시 작업(클라우드 루틴)이 이 문서를 그대로 따른다. 한 번 실행에 **최대 1개**만 게시한다.
게시할 만한 게 없으면 아무것도 만들지 말고 기록만 남기고 끝낸다. (억지로 올리는 것보다 안 올리는 게 낫다.)

- 계정: Instagram `@yeon.virel` (Metricool brand `7763847`, 시간대 `Asia/Seoul`)
- 저장소: `lalapert/yeon-cardnews` (공개). **모든 명령은 저장소 최상위 폴더에서 실행한다.**
- 엔진: `engine/` (`render.mjs`, `publish.mjs`, `state.mjs`, `templates.mjs`, `git.mjs`, `fonts/`)
- 게시물 폴더: `posts/YYYY-MM-DD_HHMM_<영문-슬러그>/`
- 기록: `state/posted.jsonl`, `state/monitor.log` (git으로 저장되므로 매 실행이 이전 실행 기록을 본다)

---

## 0. 준비

```
git fetch -q origin main && git checkout -q -B main origin/main   # 최신 main 위에서 시작 (클라우드는 브랜치 없이 시작할 수 있음)
[ -d node_modules ] || npm run setup      # playwright-core 설치 (클라우드에는 Chromium이 미리 깔려 있음)
```

## 1. 페이스 확인

```
node engine/state.mjs status
```

- `leftToday` 가 0 → 오늘은 끝. `node engine/state.mjs skip "daily cap"` 후 종료.
- `canPostNormal` 이 false 이고 `canPostBreaking` 만 true → **초대형 속보(9점 이상)만** 올릴 수 있다.
- `upcomingScheduled` 에 예약이 남아 있으면 그 시각과 2시간 이상 떨어뜨려 예약한다.
- `recentTopics` (최근 3일, draft 포함) 와 같은 이야기는 다시 올리지 않는다. 같은 사건이라도 **결정적인 새 전개**(결과 확정, 수치 대폭 변경 등)가 있을 때만 "후속"으로 올린다.

## 2. 뉴스 훑기

WebSearch(standard)로 아래를 한 번에 병렬로 찾는다. 최근 12시간 이내 소식 위주.

- 오늘 주요 뉴스 / 속보 (국내)
- 경제: 코스피·환율·금리·부동산·물가·세금
- 국제 대형 뉴스 (미국·중국·일본·중동·전쟁·선거 등 한국에 영향 큰 것)
- IT·테크 (대형 서비스 장애·해킹·개인정보 유출, 빅테크, AI)
- 정부 발표 / 오늘부터 시행 / 달라지는 제도 (한국인이 알아두면 돈·시간 아끼는 것)

후보를 3~5개 뽑고 아래 점수로 고른다.

| 항목 | 점수 |
|---|---|
| 한국인의 돈·안전·일상에 직접 영향 | 0~4 |
| 규모·의외성 (역대 최대, 급락, 첫 시행 등) | 0~3 |
| 신선도 (2시간 이내 2, 12시간 이내 1) | 0~2 |
| 숫자나 대비로 한눈에 보여줄 수 있음 | 0~1 |

- **7점 이상만 게시.** 9점 이상 + 2시간 이내 = 초대형 속보 (`urgency: "breaking"`, 간격 규칙 예외).
- 7점 미만뿐이면 `node engine/state.mjs skip "<후보 요약과 최고점>"` 후 종료.

## 3. 사실 확인 (가장 중요)

- 카드에 들어가는 **모든 숫자·날짜·고유명사**는 서로 다른 매체 2곳 이상, 또는 공식 1차 출처(정부·기관 보도자료, 기업 공시, 법원, 통계청) 1곳에서 확인한다. 고른 기사를 WebSearch(extended)로 다시 검색해 교차 확인하고, 필요하면 WebFetch로 원문을 읽는다.
- 매체마다 숫자가 다르면 공식 출처를 쓰거나, 그 숫자를 빼고 표현을 바꾼다.
- 아직 확정되지 않은 것(행정예고, 법안 발의, 추진, 검토, 전망)은 반드시 "확정 아님"·"추진"·"전망"을 표지에 표시한다.
- 확인한 링크와 핵심 사실을 `sources.txt` 에 적는다. 못 확인한 것은 카드에 넣지 않는다.

## 4. 제목은 자극적으로 — 단, 사실 범위 안에서

대표 요청: **더 자극적인 제목.** 스크롤을 멈추게 만드는 게 목표다. 쓰는 기술:

- 숫자 충격: "하루 만에 -5.28%", "6,246억 역대 최대", "10배"
- 대비·반전: "아무리 줄여도 표시 못 했다", "믿었는데 수수료만 49.7억"
- 질문: "또 2년 미루나?", "내 정보도 털렸을까?"
- 손해 회피: "모르면 손해", "이번 주까지만"
- 짧고 굵게: 표지 제목 2줄(최대 3줄), 한 줄 12자 안팎

**절대 넘지 말 선:**
- 출처에 없는 크기·결과를 만들지 않는다. ("폭락"은 실제 급락일 때만, "역대 최대"는 출처가 그렇게 말할 때만)
- 추측·예언 금지 ("이제 끝났다", "곧 망한다", "OOO 구속 임박")
- 건강 공포 조장 금지 (공식 기관 근거 없는 "먹으면 위험")
- 사망·재난·사고는 자극 대신 사실과 존중. 희생자 수를 흥밋거리처럼 쓰지 않는다. 필요하면 도움받을 곳을 넣는다.
- 개인 실명(일반인·피해자·피의자)과 확정 안 된 혐의를 쓰지 않는다. 공인·기업은 확인된 사실만.
- 정치: 결과와 결정만 중립적으로. 조롱·편들기·투표 권유 금지.
- 투자: 매수·매도 권유, 가격 예측 금지. 시장 게시물은 `codeNote` 에 `투자 권유 아님`.

나쁜 예 → 좋은 예
- "코스피 폭망, 개미 다 죽는다" → "코스피, 하루 만에 -5.28%" + "300포인트 증발"
- "쿠팡 끝장났다" → "쿠팡에 6,246억 / 역대 최대 철퇴"
- "가상자산 세금 없어진다" → "가상자산 세금 / 또 2년 미루나?" + 막대 "확정 아님 · 국회 논의 남아"

## 5. 슬라이드 구성 (3~5장)

카드뉴스 3원칙: ① 표지는 한 문장으로 궁금하게 ② 정답을 바로 주지 말고 문제→답답함→"하지만"→정답 ③ 초보도 바로 이해하는 쉬운 말.

기본 흐름 (상황에 맞게 조정):
1. `cover` — 훅. 큰 숫자/변화/대결 중 하나를 꼭 넣는다.
2. 무슨 일인가 / 지금은 이렇다 (`story`, `stats`, `bars`, `grid`)
3. 하지만 / 핵심 (`kicker: "하지만"`, `hot: true`)
4. 나한테 뭐가 달라지나 / 정리 (`checklist`, `timeline`)

글자는 각 장 본문 2문장 이내. 어려운 한자어·전문용어는 풀어 쓴다. 사진·AI 이미지는 쓰지 않는다 (코드로 그린 카드만).

### post.json 형식

```json
{
  "topic": "한 줄 주제 (중복 확인용)",
  "keywords": ["핵심어", "..."],
  "urgency": "normal | breaking",
  "handle": "@yeon.virel",
  "date": "2026.11.06",
  "category": "국내 · 경제",          // 국내/해외 · 경제/IT/생활/국제/사회
  "badge": "속보",                    // 선택. 초대형 속보일 때만
  "source": "식약처 행정예고 2026.11.06 · 연합뉴스 보도",
  "codeNote": "정보 제공용 그래픽",     // 시장·투자 관련이면 "투자 권유 아님"
  "slides": [ ... ]
}
```

위 `//` 주석은 설명용이다. 실제 post.json 에는 넣지 않는다 (넣으면 JSON 오류).
색 테마(`theme`)는 넣지 않는다 — 엔진 기본값(`templates.mjs` 의 `DEFAULT_THEME`)을 쓴다.
제목 줄 앞에 `!` 를 붙이면 그 줄이 강조 그라데이션. 본문에는 `<b>굵게</b>`, `<em>강조색</em>` 만 쓴다.

### 레이아웃

- `cover`: `headline`(2~3줄), 그리고 아래 중 하나
  - `number: {value:"6,246억", unit:"원", unitSub:"역대 최대"}`
  - `change: {from:"21", to:"223", unit:"개", unitSub:"식품유형"}`
  - `vs: {left:{v:"52.3%", l:"민주당", hi:true}, right:{v:"47.7%", l:"공화당"}, mid:"VS"}`
  - `stamps: [{top:"나트륨", main:"덜 짠", bottom:"저감"}]` (1~2개, 짧은 단어 도장) + number/change 함께 가능
  - 선택: `heroLabel`(숫자 아래 한 줄), `pill`(요약 한 줄), `bar`(띠: 확정 아님·주의 등)
- `story`: `kicker`, `headline`, `body` — 글 위주
- `stats`: `items:[{v:"5,383<small>p</small>", l:"코스피 종가", d:"전일 대비", hi:true}]` 2~4개
- `bars`: `items:[{label:"서울", value:12.4, display:"12.4%", hi:true}]` 3~6개 (value 는 막대 길이용 숫자)
- `grid`: `total`(≤240), `on`, `mode:"before"|"after"`, `legend:[{color:"on|off|old|add", text}]` — "N개 중 M개" 비율
- `timeline`: `steps:[{when:"11.26", what:"의견 마감", sub:"설명", hi:true}]` 3~5개
- `checklist`: `items:[{icon, title, desc}]` 최대 3개, `cta` 선택 (`"저장해두고 꺼내 보세요"` 등)
  - icon: search, box, calendar, money, alert, phone, shield, globe, chart, check
- `quote`: `quote`, `who` — 출처에 실제로 나온 발언만, 그대로 인용

## 6. 렌더링 + 눈으로 검수

```
node engine/render.mjs posts/<id>
```

- 종료 코드 2 = 글자 넘침·폰트 문제. 경고를 보고 글을 줄이거나 줄 수를 줄여 다시 렌더.
- 종료 코드 0 이어도 **모든 slide_N.png 를 Read 로 직접 열어 확인**: 글자 잘림, 겹침, 오타, 숫자가 sources.txt 와 같은지, 제목 맞춤법.
- 3번 고쳐도 안 되면 게시하지 말고 `skip` 기록 후 종료.

## 7. 캡션 (`caption.txt`)

- 1줄째: 표지 훅을 사실대로 풀어쓴 문장 (표지보다 더 자극적이면 안 됨)
- 3~6줄: 핵심 사실, 필요하면 `✔️` 목록
- 마무리 한 줄: 저장·공유 유도 (팔로우 구걸·링크 금지)
- 해시태그 6~10개, `#뉴스브리프` 항상 포함. 전체 2,000자 이내.

## 8. 게시

1. 이미지 올리기 (게시물 폴더를 커밋·푸시하고 공개 주소가 열리는지 확인):
   ```
   node engine/publish.mjs posts/<id>
   ```
   종료 코드가 0이 아니면 게시하지 말고 `skip` 기록 후 종료. 출력 JSON 의 `urls` 를 쓴다.
2. Metricool `createScheduledPost`:
   - `blogId`: `"7763847"`
   - `date`: 지금으로부터 10분 뒤, 5분 단위로 올림 (예: `2026-11-07T09:15:00+09:00`). 과거 시각 불가.
   - `info` (JSON 문자열):
     ```json
     {"autoPublish":true,"draft":false,"descendants":[],"firstCommentText":"","hasNotReadNotes":false,
      "shortener":false,"smartLinkData":{"ids":[]},"providers":[{"network":"instagram"}],
      "publicationDate":{"dateTime":"2026-11-07T09:15:00","timezone":"Asia/Seoul"},
      "media":["<publish.mjs 의 urls 순서대로>"],
      "mediaAltText":["슬라이드별 한 줄 설명"],
      "text":"<caption.txt 내용>",
      "instagramData":{"type":"POST","isAiGenerated":false}}
     ```
   - 오류가 나면 **바로 다시 만들지 말 것** (중복 게시 위험). `getScheduledPosts` 로 그 시간대에 이미 생겼는지 먼저 확인하고, 없을 때만 한 번 더 시도. 그래도 실패하면 기록 후 종료.
3. 기록 (응답의 `plannerUrl`, `id`, `uuid` 사용 — 기록은 자동으로 커밋·푸시된다):
   ```
   node engine/state.mjs record posts/<id> "<plannerUrl>" "<date>" "<id>" "<uuid>"
   ```

## 9. 끝

마지막에 한 줄로 보고: 게시했으면 "게시 예약: <표지 제목> (<시각>)", 아니면 "건너뜀: <이유>".

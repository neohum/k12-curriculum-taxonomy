# 🌐 K-12 Curriculum Cognitive Hierarchy Taxonomy & Scaffolding Engine
> **2022 개정 K-12 전과목 인지위계 온톨로지 & 인터랙티브 웹 대시보드**  
> *(Marble Skill Taxonomy(withmarbleapp/os-taxonomy)를 기반으로 한 한국어 K-12 전과목 확장 오픈소스 프로젝트)*

[![Code License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Data License: ODbL 1.0 / CC BY-SA 4.0](https://img.shields.io/badge/data-ODbL%201.0%20%2F%20CC%20BY--SA%204.0-orange.svg)](NOTICE.md)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](package.json)
[![Tests Passing](https://img.shields.io/badge/tests-79%20passed-success.svg)](tests/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-informational.svg)](package.json)

---

## 📖 프로젝트 개요 (Overview)

Marble이 공개한 초등 중심의 **Marble Skill Taxonomy([withmarbleapp/os-taxonomy](https://github.com/withmarbleapp/os-taxonomy), 영문 토픽 1,861개, 선수관계 그래프, 교수학습 연구)**의 영문 토픽(Mathematics·Science·English·History 등 9개 분야)에 **직접 작성한 한국 2022 개정 교육과정 성취기준**을 연결해 보는 **실험 단계**의 온톨로지 엔진 및 독립형 시각화 대시보드입니다. 한국 성취기준은 고시 원문에서 추출한 것이 아니며, 공식 원문 기반 데이터로 교체하는 작업이 진행 중입니다(아래 "알려진 한계" 절 참고).

- **Zero External Dependencies**: 외부 npm 라이브러리 설치(`npm install`) 없이 순수 Node.js 내장 런타임만으로 100% 즉시 구동.
- **Spiral Progression DAG Backtracking**: 고등학교 미적분의 학습 결손이 발생했을 때, 중학교 일차방정식을 거쳐 초등학교 3학년 '등분할과 분수'까지 인과 사슬을 1ms 내로 역추적.
- **Piaget & Vygotsky Concrete Scaffolding**: 인지 발달 단계(구체적 조작기 ➔ 형식적 조작기)에 맞춘 4대 구체 조작기 시뮬레이터(분수막대, 10칸판, 양팔저울, 빛반사) 및 3-9-3 수업 발문 비계 생성.
- **Standalone Web Dashboard**: 내장된 단독 웹서버를 통해 브라우저에서 즉시 인터랙티브 그래프, 결손 진단기, 교구 시뮬레이터를 조작 가능.

---

## 🚀 빠른 시작 (Quick Start)

어떠한 무거운 의존성 설치도 필요하지 않습니다. 클론 후 `npm start` 명령 하나로 로컬 웹서버가 기동되며 브라우저에서 대시보드를 바로 열람할 수 있습니다.

```bash
# 1. 저장소 클론
git clone https://github.com/neohum/k12-curriculum-taxonomy.git
cd k12-curriculum-taxonomy

# 2. 로컬 웹 서버 실행 (Node.js 18+ 권장, 외부 설치 불필요)
npm start
# 또는
npm run dev

# 3. 브라우저에서 확인
# http://localhost:3000
```

---

## 🖥️ 주요 기능 및 대시보드 구성

### 1. K-12 나선형 교육과정 인과 네트워크 그래프
- 초1부터 고3까지 이어지는 8대 교과의 성취기준과 선수학습 의존성(Prerequisite DAG)을 시각화.
- 대표 나선형 인과 사슬:
  - `fractions_to_calculus`: 초3 등분할 ➔ 초5 분수 곱나눗셈 ➔ 중1 일차방정식 ➔ 중2 일차함수 ➔ 고2 미분계수
  - `reading_comprehension`: 초1 낱말 읽기 ➔ 초4 문장 성분 ➔ 중3 논증 구조 ➔ 고3 비판적 독서
  - `ratio_to_economy`: 초6 비와 비율 ➔ 중2 일차함수 그래프 ➔ 고1 통합사회 시장경제 균형가격
  - `music_harmony_chain`: 초3 리듬/음계 ➔ 중1 화음 구조 ➔ 고등 화성학 및 악곡 분석

### 2. 선수학습 결손 진단 및 역추적 (Diagnostic Backtracking)
- 학생이 특정 고학년 성취기준에서 오개념을 보일 때, 최하위 기초 결손 노드(`earliestFoundationalGap`)를 자동 판별.
- 1:1 맞춤형 진단 평가 문항 및 오답 유형별 피드백 자동 생성.

### 3. 피아제 구체 조작기 시뮬레이터 (Manipulative Simulations)
- **분수 막대 (`fraction-bars`)**: 분할 및 크기 비교 2D 인터랙티브 교구
- **10칸 판 (`ten-frame`)**: 묶음 수세기 및 10의 보수 바둑알 교구
- **양팔 저울 (`balance-scale`)**: 2D Canvas 물리 등호 균형 조작기
- **빛 반사 실험실 (`light-reflection`)**: 광학 레이 및 스넬/전반사 시뮬레이터

---

## 📡 HTTP REST API 사양

내장 서버 기동 시 제공되는 고성능 마이크로서비스 API입니다.

| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `GET` | `/` or `/dashboard` | 인터랙티브 웹 대시보드 HTML 서빙 |
| `GET` | `/api/health` | 서버 상태, 가동 시간, 공식 성취기준 수(`standardsCount`)와 손작성 성취기준 수(`handwrittenStandardsCount`) |
| `GET` | `/api/taxonomy/standards` | **고시 원문** 성취기준 검색 (`?query=일차함수&subject=수학&schoolLevel=MS&gradeBand=3~4&id=b8:[9수02-15]&limit=20`) |
| `GET` | `/api/taxonomy/chains` | K-12 나선형 인과 체인 전체 목록 조회 (손작성 기반, `dataBasis` 표시) |
| `GET` | `/api/taxonomy/chain/:key` | 특정 나선형 인과 사슬 상세 위계 조회 (손작성 기반) |
| `POST` | `/api/taxonomy/diagnose` | 성취기준 코드 기반 선수학습 결손 경로 역추적 (손작성 기반) |
| `POST` | `/api/taxonomy/lesson-scaffold`| 3-9-3 수업 지도안 비계 및 추천 구체 조작기 자동 생성 (손작성 기반) |
| `POST` | `/api/taxonomy/tag-content` | 교재·활동지 텍스트에 **고시 원문** 성취기준 자동 태깅 |

### 공식 성취기준과 손작성 데이터

- `/api/taxonomy/standards`와 `/api/taxonomy/tag-content`는 기본으로 `data/kr-2022/standards.json`(교육부 고시
  제2022-33호 원문 추출본)을 씁니다. 항목에는 `source: "official"`, 고유 `id`, 원문 `code`·`text`, 별책·쪽
  (`citation`)이 붙습니다. `statement`는 예전 응답과 같은 이름으로 `text`를 그대로 넣은 하위 호환 필드입니다.
- 원문은 같은 코드를 두 번 쓰는 경우가 있어(12개 코드) 항목 구분은 `id`로 합니다. `?query=[12스문01-01]`은 두 항목을 모두 돌려줍니다.
- 예전 손작성 데이터는 `?source=handwritten`일 때만 나오고, 그때 응답과 항목에 `official: false`와 경고 문구가 붙습니다.
- 진단·수업 비계·나선형 사슬 응답에는 `dataBasis`(`label: "비공식 손작성 성취기준 기반"`)가 붙습니다.
- 공식 성취기준과 손작성 데이터(오개념·교구·피아제 단계·선수관계)를 잇는 근거는 검토 화면(`/review/`)이 저장하는
  `review/kr2022-remap/decisions.json`의 **교사 결정**뿐입니다. 키는 검토 화면과 같은 `원래 코드#손작성 문장 sha256 앞 12자리`로
  맞춥니다. `accept-candidate`·`choose-other`이고 `officialId`가 standards.json에 있을 때만 연결하고, `discard`는
  그 손작성 항목에 기댄 응답의 `dataBasis`에 폐기 표시(`discarded: true`)를 붙이며, `defer`는 연결하지 않습니다.
  자동 재매핑 결과(`matched` 포함)는 쓰지 않습니다. 파일이 없거나 형식(`schemaVersion` 1, `decisions` 객체)이 다르면
  연결 없이 동작하므로, 그때 공식 태깅 결과의 선수학습 역추적(`foundationalPrerequisites` 등)은 비어 있습니다.

---

## 🧪 테스트 실행

Node.js 내장 테스트 러너를 통해 79개의 통합 및 단위 검증 스위트를 즉시 실행할 수 있습니다.

```bash
npm test
```

```
ℹ tests 79
ℹ suites 0
ℹ pass 79
ℹ fail 0
ℹ duration_ms ~300ms
```

---

## 📂 디렉터리 구조 (Repository Layout)

```
k12-curriculum-taxonomy/
├── data/
│   └── os-taxonomy/                 # Marble os-taxonomy 원본 데이터(ODbL/CC BY-SA) & K-12 인과 사슬 JSON
├── public/
│   ├── index.html                   # 독립형 인터랙티브 웹 대시보드
│   └── simulations/                 # 4대 피아제 구체 조작기 독립 HTML
├── src/
│   ├── core/                        # 코어 인지 위계 온톨로지 엔진
│   │   ├── taxonomy/
│   │   │   ├── Korea2022K12CurriculumAdapter.mjs  # 2022 개정 K-12 전과목 성취기준
│   │   │   ├── TaxonomyGraphEngine.mjs            # DAG 인덱싱 & 인과 역추적
│   │   │   ├── CognitiveScaffoldingEngine.mjs     # 3-9-3 수업 비계 엔진
│   │   │   ├── DiagnosticAssessmentEngine.mjs     # 결손 진단 평가 문항 생성
│   │   │   └── ManipulativeSimulationGenerator.mjs# 교구 시뮬레이터 생성기
│   ├── sdk/                         # 프론트엔드/Node 겸용 유니버설 클라이언트 SDK
│   └── server/
│       ├── index.mjs                # CLI 및 원클릭 서버 실행 엔트리포인트
│       └── K12TaxonomyServer.mjs    # 고성능 Zero-dependency HTTP 서버
├── tests/                           # 79개 무결성 테스트 스위트
├── package.json                     # 프로젝트 매니페스트 (Zero external npm deps)
├── LICENSE                          # MIT License (코드)
├── NOTICE.md                        # 데이터 출처·라이선스 (Marble, ODbL 1.0 / CC BY-SA 4.0)
└── README.md                        # 본 문서
```

---

## ⚠️ 알려진 한계 (Known Limitations)

- **검색·태깅은 고시 원문, 진단·비계는 아직 손작성입니다.** 성취기준 검색(`/api/taxonomy/standards`),
  콘텐츠 태깅(`/api/taxonomy/tag-content`, `MarketCurriculumTagger`), 대시보드의 성취기준 목록은
  교육부 고시 제2022-33호 원문(`data/kr-2022/standards.json`)을 씁니다. 지식 그래프, 결손 진단, 3-9-3 수업 비계,
  교구 추천, 나선형 사슬은 여전히 아래의 손작성 성취기준을 쓰며, API 응답의 `dataBasis`와 대시보드의
  '비공식 데이터' 배지로 표시합니다. `LessonLabCurriculumBridge`와 `Korea2022CurriculumAdapter`도 아직 손작성입니다.
- **태깅 순위는 검증되지 않았습니다.** 공식 태깅은 문자 bigram TF-IDF 코사인으로 후보를 고르며, 하한값(0.1)은
  표본 몇 개를 보고 정한 값입니다. 결과는 후보로만 보세요.
- **손작성 성취기준은 고시 원문에서 추출한 것이 아닙니다.** `scripts/build-k12-full-ontology.mjs`,
  `src/core/taxonomy/Korea2022CurriculumAdapter.mjs`,
  `src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs`에 들어 있는 성취기준 문장·학년 배정·
  키워드·오개념 설명은 2022 개정 교육과정 고시 문서를 기계적으로 옮긴 것이 아니라 **직접 작성한
  것**입니다. 문장이 공식 성취기준과 다를 수 있으므로 공식 자료로 인용하지 마세요.
- **성취기준 코드 형식이 공식과 다릅니다.** 공식 코드는 학년군의 **끝 학년** 숫자를 씁니다
  (예: 초등 1~2학년군 수학 `[2수01-01]`, 3~4학년군 과학 `[4과01-01]`, 중학교 `[9…]`).
  이 저장소에는 `[1수01-02]`, `[1국01-01]`, `[3과01-01]`처럼 개별 학년 숫자를 붙인 비공식
  코드가 섞여 있습니다. 공식 코드와 같은 모양이라도 내용이 공식 성취기준과 일치한다는 보장은 없습니다.
- **Marble 토픽 매핑(`mappedTopicIds`)도 직접 작성한 것**이며, Marble 쪽에서 검토·승인한 정렬이 아닙니다.
- **교체 작업 진행 중:** 손작성 데이터에 붙은 오개념·교구·피아제 단계·선수관계는 사람이 손작성↔공식 연결을
  확인(`review/kr2022-remap/decisions.json`)한 뒤에 공식 성취기준으로 옮길 예정입니다. 그 전까지 손작성 기반
  기능은 시연·연구용으로만 취급해 주세요.

---

## 📄 라이선스 (License)

이 저장소는 **코드와 데이터의 라이선스가 다릅니다.** 자세한 내용은 [NOTICE.md](NOTICE.md)를 보세요.

- **코드**: [MIT License](LICENSE)
- **`data/os-taxonomy/`의 Marble 원본 데이터** (`topics.json`, `dependencies.json`, `clusters.json`,
  `teaching-research.json`): 데이터베이스는 [ODbL 1.0](data/os-taxonomy/LICENSE),
  Marble이 작성한 텍스트는 [CC BY-SA 4.0](data/os-taxonomy/LICENSE-CONTENT).
  두 라이선스 모두 **동일조건(share-alike)** 이므로, 이 데이터를 수정하거나 다른 데이터와 섞어 만든
  파생 데이터베이스를 공개할 때는 같은 라이선스로 공개해야 합니다.

출처 표기 (원본이 요구하는 형식):

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).

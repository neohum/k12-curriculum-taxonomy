# NOTICE — 출처와 라이선스

이 저장소는 **코드와 데이터의 라이선스가 다릅니다.** 사용·재배포 전에 아래를 확인해 주세요.

| 대상 | 라이선스 |
| :--- | :--- |
| 코드 (`src/`, `scripts/`, `public/`, `tests/` 등 저장소 작성 코드) | [MIT](LICENSE) (단, 파일 안에 내장된 Marble 토픽 매핑 값 `mappedTopicIds` 등은 [ODbL 1.0](data/os-taxonomy/LICENSE) — 아래 "동일조건 의무" 참고) |
| `data/os-taxonomy/topics.json`, `dependencies.json`, `clusters.json`, `teaching-research.json` (Marble 원본 데이터) | 데이터베이스: [ODbL 1.0](data/os-taxonomy/LICENSE) / Marble 작성 텍스트: [CC BY-SA 4.0](data/os-taxonomy/LICENSE-CONTENT) |
| `data/os-taxonomy/k12-causal-chains.json` | 저장소 작성 데이터로 Marble 토픽 ID를 포함하지 않으므로 저장소 [MIT](LICENSE) 적용 |

> 이 문서는 출처 표기와 라이선스 조건을 정리한 것이며 법률 자문이 아닙니다.

---

## 1. Marble Skill Taxonomy (`data/os-taxonomy/`)

`data/os-taxonomy/`의 네 파일은 OpenStax가 아니라 **Marble**이 공개한
[withmarbleapp/os-taxonomy](https://github.com/withmarbleapp/os-taxonomy) 데이터입니다.
(이전 README와 `package.json`에 "OpenStax"로 잘못 적혀 있던 것을 이 문서에서 바로잡습니다.)

### 출처 표기 (원본이 요구하는 형식)

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).

### 가져온 버전

- 원본 저장소: https://github.com/withmarbleapp/os-taxonomy
- 원본 커밋: [`663a7d6d6d0efe84fbc4ec4bfdaf526c8c511d7a`](https://github.com/withmarbleapp/os-taxonomy/commit/663a7d6d6d0efe84fbc4ec4bfdaf526c8c511d7a)
  (2026-11-02, "Make colon assessment conditional on the specified style")
- 대응 관계: 네 파일 모두 해당 커밋의 `data/` 파일과 **바이트 단위로 동일**합니다
  (git blob SHA 대조). 즉 원본 파일 자체는 수정하지 않았습니다.
  - `topics.json` (토픽 1,861개, SHA-256 `9fa13213a843108771276a894fa5b73552724593b02a5e412d97c7adc4f4306c`)
  - `dependencies.json` (선수관계 간선 4,003개)
  - `clusters.json` (클러스터 176개)
  - `teaching-research.json` (연구 레코드 1,049개, `exportedAt` 2026-11-02T21:58:18.320Z)

### 원본의 라이선스 구성 (원본 README "License" 절 요약)

| 층위 | 라이선스 |
| :--- | :--- |
| 데이터베이스 — 수집·구조·ID, 토픽↔토픽 및 토픽↔성취기준 관계 | ODbL 1.0 — 상업 이용 가능, **출처 표기**, **동일조건(share-alike)** |
| Marble이 작성한 텍스트 — 토픽 `description`/`name`/`evidence`/`assessmentPrompt`, 의존관계 `reason`, 클러스터 `summary`, 교수학습 연구 본문 | CC BY-SA 4.0 — 출처 표기 + 동일조건 |
| `curriculum-standards.json` — 제3자 교육과정 원문 | Marble이 재라이선스할 수 없음, 출처별 원 라이선스 적용 |

이 저장소에는 `curriculum-standards.json`(및 `curriculum-alignments.json`)이 **포함되어 있지 않습니다.**
`topics.json`의 `standards` 필드에는 `ccss-math:…`, `ngss-k5:…`, `acara-v9:…` 같은
**성취기준 코드(식별자)만** 들어 있으며 성취기준 원문은 없습니다. 해당 성취기준을
사용할 때의 출처별 고지(예: "NGSS is a registered trademark of WestEd. …")는 원본의
[PROVENANCE.md](https://github.com/withmarbleapp/os-taxonomy/blob/main/PROVENANCE.md)를 따릅니다.

`teaching-research.json`은 제3자 연구·도서·교육과정을 참조합니다. 원본 PROVENANCE.md에
따르면 위 라이선스는 Marble의 기여분에만 적용되고, 참조된 제3자 저작물은 각자의 원 라이선스를
따릅니다. 이 파일은 Marble 스스로 밝히듯 "에이전트가 작성한 교수 연구·활동 제안이며 실증 검증된
처치가 아닙니다."

### 동일조건(share-alike) 의무

- ODbL 1.0 4.4항에 따라, 이 데이터베이스를 수정·확장하거나 **다른 데이터와 섞어 만든 파생
  데이터베이스(Derivative Database)를 공개 사용**하는 경우, 그 파생 데이터베이스도
  **ODbL 1.0(또는 호환 라이선스)으로 공개**해야 합니다. Marble 작성 텍스트를 개작한 경우도
  CC BY-SA 4.0의 동일조건이 적용됩니다.
- 반면 데이터베이스를 이용해 만든 **산출물(Produced Work)** — 예: 앱, 화면, 보고서 — 은
  그 산출물 자체를 공개할 의무는 없고, 출처 고지를 붙이면 됩니다(ODbL 4.3항). 다만 산출물이
  **파생 데이터베이스**로부터 만들어졌다면 그 파생 데이터베이스(또는 변경분)를 함께 제공해야
  합니다(ODbL 4.6항).
- 이 저장소에서 한국 성취기준을 Marble 토픽 ID(`mt_…`)에 연결한 매핑 데이터
  (`src/core/taxonomy/Korea2022CurriculumAdapter.mjs`,
  `src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs`의 `mappedTopicIds` 등)는 Marble 데이터베이스와
  결합해 쓰이므로, 파생 데이터베이스에 해당하는 범위에서 **ODbL 1.0으로 제공**합니다.
  즉 `src/`·`scripts/` 안에 들어 있는 `mappedTopicIds` 등 매핑 값은 그 파일의 라이선스(MIT)와
  별개로 ODbL 1.0이 적용됩니다.
  이 매핑을 가져다 다시 공개하는 경우에도 같은 조건이 적용됩니다. 두 파일 맨 위에도 같은
  내용의 라이선스 헤더 주석을 달았습니다.

## 2. 이 저장소에서 추가·변경한 것

Marble 원본 파일은 수정하지 않았고, 다음을 별도 파일로 추가했습니다.

- 2022 개정 교육과정 한국 성취기준 목록과 그에 대한 Marble 토픽 매핑(위 어댑터·스크립트)
- 초·중·고 인과 사슬 데이터 `data/os-taxonomy/k12-causal-chains.json` (저장소 작성)
- 그래프 탐색·진단·수업 비계 엔진과 웹 대시보드(코드, MIT)

한국 성취기준 데이터의 출처와 한계는 [README](README.md)의 "알려진 한계" 절을 참고하세요.

## 알려진 한계

- Marble 토픽 매핑 값은 아직 코드 파일(위 두 어댑터) 안에 내장되어 있습니다. 매핑 값을 별도
  JSON 데이터 파일로 물리적으로 분리하는 일은 공식 성취기준 원문 기반 교체 작업(별도 PR)에서
  함께 하며, 이번 정정에서는 하지 않습니다.
- `mappedTopicIds`에 든 값이 모두 실제 Marble 토픽 ID는 아닙니다. 커밋 시점에 `topics.json`과
  대조한 결과, `Korea2022CurriculumAdapter.mjs`는 고유 ID 54개 중 53개가,
  `Korea2022K12CurriculumAdapter.mjs`는 109개 중 32개가 실제 Marble ID였고 나머지는 직접 만든
  임시 ID입니다. `scripts/build-k12-full-ontology.mjs`의 `mappedTopicIds`(`mt_1su01_02` 등)는
  모두 임시 ID로, Marble ID를 담고 있지 않습니다.

## 3. 원문 라이선스 전문

- ODbL 1.0: [`data/os-taxonomy/LICENSE`](data/os-taxonomy/LICENSE) (원본 저장소 `LICENSE` 그대로)
- CC BY-SA 4.0: [`data/os-taxonomy/LICENSE-CONTENT`](data/os-taxonomy/LICENSE-CONTENT) (원본 저장소 `LICENSE-CONTENT` 그대로)

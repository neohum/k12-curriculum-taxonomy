import fs from "node:fs";
import path from "node:path";

// Define the comprehensive grade-specific additions to complete 초1 ~ 고3
export const GRADE_COMPLETION_STANDARDS = [
  // ==========================================
  // 초1 (Grade 1): 초등 1학년 기초 성취기준
  // ==========================================
  {
    code: "[1수01-02]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "수와 연산",
    statement: "일의 자리, 십의 자리의 자릿값을 이해하고 50 이하의 두 자리 수를 모형으로 나타낼 수 있다.",
    keywords: ["자릿값", "십의 자리", "일의 자리", "두 자리 수", "수모형"],
    mappedTopicIds: ["mt_1su01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "ten-frame",
    misconception: "십의 자리와 일의 자리 숫자의 위치를 바꾸어 14를 41로 인지하는 자릿값 위치 착각"
  },
  {
    code: "[1수01-03]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "수와 연산",
    statement: "하나의 수를 두 수로 가르기와 두 수를 하나의 수로 모으기 활동을 통해 10의 보수 개념을 형성한다.",
    keywords: ["수 가르기", "수 모으기", "10의 보수", "수 감각"],
    mappedTopicIds: ["mt_1su01_03"],
    piagetStage: "Concrete Operational",
    manipulative: "ten-frame",
    misconception: "모으기와 가르기가 서로 반대 연산임을 이해하지 못하고 독립된 셈으로 취급하는 분절 오개념"
  },
  {
    code: "[1수01-04]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "수와 연산",
    statement: "합이 9 이하인 한 자리 수의 덧셈과 한 자리 수의 뺄셈을 바둑알 구체물로 조작하여 계산할 수 있다.",
    keywords: ["한 자리 수 덧셈", "한 자리 수 뺄셈", "덧셈의 기초", "구체물 조작"],
    mappedTopicIds: ["mt_1su01_04"],
    piagetStage: "Concrete Operational",
    manipulative: "ten-frame",
    misconception: "덧셈에서 더해지는 수부터 이어세지 않고 항상 1부터 다시 세는 비효율적 수세기 오류"
  },
  {
    code: "[1수02-01]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "도형과 측정",
    statement: "교실 및 생활 주변 구체물에서 상자 모양, 둥근기둥 모양, 공 모양을 찾아 직관적으로 분류할 수 있다.",
    keywords: ["상자 모양", "둥근기둥 모양", "공 모양", "직관적 분류", "입체도형 기초"],
    mappedTopicIds: ["mt_1su02_01"],
    piagetStage: "Concrete Operational",
    manipulative: "pattern-blocks",
    misconception: "평면 원과 입체 공 모양을 구별하지 못하고 평면과 입체를 동일시하는 조작 결손"
  },
  {
    code: "[1수03-01]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "변화와 관계",
    statement: "물체나 무늬의 배열에서 일정한 규칙을 찾아 말이나 그림으로 나타낼 수 있다.",
    keywords: ["규칙 찾기", "무늬 배열", "반복 패턴", "수량 규칙"],
    mappedTopicIds: ["mt_1su03_01"],
    piagetStage: "Concrete Operational",
    manipulative: "pattern-blocks",
    misconception: "반복되는 마디(주기)를 확인하지 않고 직전 물체 색깔만 임의로 따라가는 패턴 인식 부족"
  },
  {
    code: "[1국01-01]",
    subject: "국어",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "문해력 기초",
    statement: "한글 자모의 이름과 소리값을 알고 낱말을 바르게 읽고 쓴다.",
    keywords: ["한글 자모", "소리값", "자음", "모음", "글자 쓰기"],
    mappedTopicIds: ["mt_1kor01_01"],
    piagetStage: "Concrete Operational",
    manipulative: "sentence-blocks",
    misconception: "자음 'ㄱ, ㄴ'의 이름(기역, 니은)과 음소 소리값(/g/, /n/)을 혼동하여 읽는 오류"
  },
  {
    code: "[1국01-02]",
    subject: "국어",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "문해력 기초",
    statement: "글자와 낱말의 관계를 이해하고 기초적인 일상 어휘를 사용하여 생각이나 느낌을 말한다.",
    keywords: ["낱말", "일상 어휘", "어휘 표현", "소리내어 읽기"],
    mappedTopicIds: ["mt_1kor01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "sentence-blocks",
    misconception: "음절 단위 띄어쓰기를 지키지 않고 말하는 호흡대로 글자를 붙여 쓰는 음절 분절 결손"
  },
  {
    code: "[1바01-01]",
    subject: "도덕",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "학교와 나 (바른생활)",
    statement: "학교생활의 기본 규칙과 일과를 알고 스스로 실천하는 기본 생활 습관을 형성한다.",
    keywords: ["학교생활", "기본 규칙", "생활 습관", "교실 배려"],
    mappedTopicIds: ["mt_1mor01_01"],
    piagetStage: "Concrete Operational",
    manipulative: "concept-matrix",
    misconception: "자신의 행동이 타인에게 미치는 영향을 인지하지 못하는 초기 자기중심적 관점"
  },
  {
    code: "[1슬01-01]",
    subject: "과학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "자연과 계절 (슬기로운생활)",
    statement: "봄과 여름의 자연환경과 날씨의 변화를 오감으로 관찰하고 계절의 특징을 탐색한다.",
    keywords: ["봄과 여름", "자연 관찰", "계절 변화", "오감 탐색"],
    mappedTopicIds: ["mt_1sci01_01"],
    piagetStage: "Concrete Operational",
    manipulative: "timeline-board",
    misconception: "계절 변화를 기온이나 태양의 움직임이 아닌 사람의 감정이나 옷차림 때문으로 의인화하는 오류"
  },

  // ==========================================
  // 초2 (Grade 2): 초등 2학년 핵심 성취기준
  // ==========================================
  {
    code: "[2수01-03]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "수와 연산",
    statement: "네 자리 이하의 수의 자릿값을 이해하고 1000까지의 크기를 수직선과 수모형으로 비교한다.",
    keywords: ["네 자리 수", "1000", "수직선", "크기 비교", "자릿값 체계"],
    mappedTopicIds: ["mt_2su01_03"],
    piagetStage: "Concrete Operational",
    manipulative: "place-value-blocks",
    misconception: "105를 15로 읽거나 3040을 34로 판정하는 0의 자릿값 자리채움 의미 결손"
  },
  {
    code: "[2수01-06]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "수와 연산",
    statement: "두 자리 수의 범위에서 받아올림이 있는 덧셈과 받아내림이 있는 뺄셈의 계산 원리를 수모형으로 조작한다.",
    keywords: ["받아올림", "받아내림", "두 자리 수 덧셈", "두 자리 수 뺄셈"],
    mappedTopicIds: ["mt_2su01_06"],
    piagetStage: "Concrete Operational",
    manipulative: "place-value-blocks",
    misconception: "일의 자리에서 받아올린 10을 십의 자리에 더하지 않고 떨어뜨려 계산하는 연산 누락"
  },
  {
    code: "[2수01-10]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "수와 연산",
    statement: "곱셈구구(2단~9단)의 규칙을 발견하고 묶어 세기와 배의 관계를 직관적으로 설명한다.",
    keywords: ["곱셈구구", "구구단", "묶어 세기", "배의 개념", "동수누가"],
    mappedTopicIds: ["mt_2su01_10"],
    piagetStage: "Concrete Operational",
    manipulative: "array-grid",
    misconception: "곱셈구구를 음운으로만 암기하여 7×6의 결과를 모를 때 7×5+7로 추론하지 못하는 기계적 고착"
  },
  {
    code: "[2수02-02]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "도형과 측정",
    statement: "삼각형, 사각형, 원의 특징을 구성 요소(변, 꼭짓점)를 중심으로 비교하고 칠교판으로 모양을 맞춘다.",
    keywords: ["변", "꼭짓점", "삼각형", "사각형", "칠교판"],
    mappedTopicIds: ["mt_2su02_02"],
    piagetStage: "Concrete Operational",
    manipulative: "geoboard",
    misconception: "회전되어 꼭짓점이 아래로 향한 삼각형을 삼각형이 아니라고 판정하는 공간 정향 고착"
  },
  {
    code: "[2수03-02]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "도형과 측정",
    statement: "자(cm)를 사용하여 구체물의 길이를 직접 재어보고 길이의 덧셈과 뺄셈을 어림한다.",
    keywords: ["길이 재기", "센티미터", "cm", "어림하기", "길이의 합과 차"],
    mappedTopicIds: ["mt_2su03_02"],
    piagetStage: "Concrete Operational",
    manipulative: "ruler",
    misconception: "자의 시작 눈금 '0'이 아닌 자의 끝부분이나 눈금 '1'에 물체를 맞추어 측정하는 시작점 오차"
  },
  {
    code: "[2수03-03]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "도형과 측정",
    statement: "시계의 시침과 분침을 보고 '몇 시 몇 분', '몇 시 몇 분 전'을 바르게 읽고 하루의 일과를 시간으로 나타낸다.",
    keywords: ["시각", "시간", "시침", "분침", "시각 읽기"],
    mappedTopicIds: ["mt_2su03_03"],
    piagetStage: "Concrete Operational",
    manipulative: "clock-manipulative",
    misconception: "시침이 2와 3 사이에 있을 때 분침이 50분을 가리키면 3시 50분으로 앞당겨 판독하는 오류"
  },
  {
    code: "[2국01-02]",
    subject: "국어",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "문장과 표현",
    statement: "문장 부호(마침표, 물음표, 느낌표, 쉼표)의 쓰임을 알고 생각이나 느낌을 완전한 문장으로 쓴다.",
    keywords: ["문장 부호", "마침표", "물음표", "느낌표", "완전한 문장"],
    mappedTopicIds: ["mt_2kor01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "sentence-blocks",
    misconception: "주어와 서술어의 호응을 맞추지 않고 생각나는 단어를 나열만 하는 불완전 문장 작성"
  },
  {
    code: "[2국02-02]",
    subject: "국어",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "읽기와 문학",
    statement: "인물의 처지와 마음을 헤아리며 동시나 짧은 이야기의 줄거리를 파악하고 이어질 내용을 상상한다.",
    keywords: ["인물의 마음", "줄거리", "동시", "이야기 상상", "감상"],
    mappedTopicIds: ["mt_2kor02_02"],
    piagetStage: "Concrete Operational",
    manipulative: "concept-matrix",
    misconception: "이야기 속 인물의 감정을 글의 단서에서 찾지 않고 자신의 기분대로만 단정하는 주관 편향"
  },
  {
    code: "[2즐01-02]",
    subject: "체육",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "신체활동 (즐거운생활)",
    statement: "신체 움직임과 리듬을 결합하여 다양한 규칙이 있는 모둠 신체 놀이에 즐겁게 참여한다.",
    keywords: ["신체 놀이", "리듬 움직임", "협동 활동", "기본 규칙 준수"],
    mappedTopicIds: ["mt_2pe01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "pattern-blocks",
    misconception: "승패에만 집착하여 함께하는 놀이 규칙을 어기거나 친구를 배제하는 협응 미숙"
  },
  {
    code: "[2음01-01]",
    subject: "음악",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초2",
    domain: "음악 표현",
    statement: "다양한 신체 타악기와 소리 악기를 활용하여 2박자와 3박자의 리듬감을 익히고 노래 부른다.",
    keywords: ["신체 타악기", "2박자", "3박자", "박자감", "리듬치기"],
    mappedTopicIds: ["mt_2mus01_01"],
    piagetStage: "Concrete Operational",
    manipulative: "rhythm-matrix",
    misconception: "빠르기가 빨라질 때 박자의 간격이 불규칙해지며 강약을 일정하게 유지하지 못하는 박자 일탈"
  },

  // ==========================================
  // 초4 (Grade 4): 초등 4학년 핵심 성취기준
  // ==========================================
  {
    code: "[4수01-05]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초4",
    domain: "수와 연산",
    statement: "세 자리 수와 두 자리 수의 곱셈 원리를 자릿값에 근거하여 이해하고 어림과 정확한 계산을 수행한다.",
    keywords: ["세 자리 수 곱셈", "두 자리 수 곱셈", "자릿값 곱셈", "어림셈"],
    mappedTopicIds: ["mt_4su01_05"],
    piagetStage: "Concrete Operational",
    manipulative: "place-value-blocks",
    misconception: "십의 자리 수를 곱할 때 계산 결과 끝에 0을 붙이지 않아 자릿값을 한 칸 밀려 쓰는 오류"
  },
  {
    code: "[4수01-06]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초4",
    domain: "수와 연산",
    statement: "두 자리 수로 나누는 나눗셈의 계산 원리를 이해하고 몫과 나머지를 구하며 검산식을 세운다.",
    keywords: ["두 자리 수 나눗셈", "몫과 나머지", "검산식", "나눗셈 어림"],
    mappedTopicIds: ["mt_4su01_06"],
    piagetStage: "Concrete Operational",
    manipulative: "fraction-bars",
    misconception: "나머지가 나누는 수보다 커도 몫을 올리지 않고 그대로 두는 나눗셈 검산 미숙"
  },
  {
    code: "[4수02-03]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초4",
    domain: "도형과 측정",
    statement: "각도기를 사용하여 각의 크기를 측정하고, 직각·예각·둔각을 분류하며 삼각형의 세 각의 크기의 합이 180도임을 설명한다.",
    keywords: ["각도기", "예각", "직각", "둔각", "삼각형 각의 합 180도"],
    mappedTopicIds: ["mt_4su02_03"],
    piagetStage: "Concrete Operational",
    manipulative: "protractor",
    misconception: "변의 길이가 긴 각이 변의 길이가 짧은 각보다 각도가 더 크다고 착각하는 변 길이 편향"
  },
  {
    code: "[4수02-05]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초4",
    domain: "도형과 측정",
    statement: "사다리꼴, 평행사변형, 마름모, 직사각형, 정사각형의 성질을 탐구하고 포함 관계를 설명한다.",
    keywords: ["사다리꼴", "평행사변형", "마름모", "직사각형", "정사각형", "도형의 성질"],
    mappedTopicIds: ["mt_4su02_05"],
    piagetStage: "Concrete Operational",
    manipulative: "geoboard",
    misconception: "정사각형은 직사각형이나 마름모가 될 수 없다고 생각하는 배타적 도형 분류 오류"
  },
  {
    code: "[4과01-02]",
    subject: "과학",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초4",
    domain: "물질의 상태 (물질)",
    statement: "물이 얼 때와 얼음이 녹을 때의 부피와 무게 변화를 관찰하고 물의 상태 변화를 분자 모형으로 설명한다.",
    keywords: ["물의 상태 변화", "얼음", "수증기", "부피 변화", "무게 보존"],
    mappedTopicIds: ["mt_4sci01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "balance-scale",
    misconception: "물이 얼음이 되면 부피가 늘어나므로 무게도 더 무거워졌을 것이라는 질량 비보존 착각"
  },
  {
    code: "[4과04-01]",
    subject: "과학",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초4",
    domain: "지층과 화석 (지구)",
    statement: "퇴적암의 형성 과정과 지층이 만들어지는 원리를 줄무늬 지층 모형을 통해 설명하고 화석의 가치를 탐구한다.",
    keywords: ["지층", "퇴적암", "화석", "퇴적 작용", "과거 환경 복원"],
    mappedTopicIds: ["mt_4sci04_01"],
    piagetStage: "Concrete Operational",
    manipulative: "timeline-board",
    misconception: "지층이 아래에서부터 차례로 쌓인다는 퇴적 원리를 반대로 생각하여 윗층이 가장 오래되었다고 여기는 오류"
  },
  {
    code: "[4사01-02]",
    subject: "사회",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초4",
    domain: "촌락과 도시 (지리/사회)",
    statement: "촌락과 도시의 인구 분포, 주요 시설, 산업 형태의 차이를 비교하고 상호 보완적인 교류 관계를 탐색한다.",
    keywords: ["촌락", "도시", "인구 집중", "산업 분업", "상호 교류"],
    mappedTopicIds: ["mt_4soc01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "concept-matrix",
    misconception: "촌락은 일방적으로 도시로부터 문물을 공급받기만 하는 낙후된 지역이라는 편견"
  },
  {
    code: "[4도01-02]",
    subject: "도덕",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초4",
    domain: "사회 공동체 윤리",
    statement: "사이버 공간에서의 예절과 개인정보 보호의 중요성을 알고 디지털 시민으로서 정직하게 소통한다.",
    keywords: ["디지털 윤리", "사이버 언어예절", "개인정보 보호", "저작권 존중"],
    mappedTopicIds: ["mt_4mor01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "concept-matrix",
    misconception: "가상공간은 익명성이 보장되므로 현실의 도덕 규범을 지키지 않아도 무방하다는 착각"
  },
  {
    code: "[4영01-02]",
    subject: "영어",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초4",
    domain: "이해와 표현",
    statement: "쉽고 간단한 낱말이나 어구를 읽고 소리와 철자의 관계를 파악하며 그림과 연결하여 의미를 이해한다.",
    keywords: ["파닉스 기초", "낱말 읽기", "소리와 철자", "어구 의미"],
    mappedTopicIds: ["mt_4eng01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "sentence-blocks",
    misconception: "영어 철자를 파닉스 소리가 아닌 알파벳 문자명으로 글자마다 쪼개어 읽으려는 습관"
  },

  // ==========================================
  // 초6 (Grade 6): 초등 6학년 핵심 성취기준
  // ==========================================
  {
    code: "[6수02-04]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "변화와 관계",
    statement: "비례식의 성질(외항의 곱은 내항의 곱과 같다)을 이해하고 미지수가 있는 비례식을 해결한다.",
    keywords: ["비례식", "외항과 내항", "비례배분", "비의 성질"],
    mappedTopicIds: ["mt_6su02_04"],
    piagetStage: "Concrete Operational",
    manipulative: "balance-scale",
    misconception: "비례식 a:b = c:d 에서 덧셈 관계(a+k = b+k)로 착각하여 비례 곱셈성을 왜곡하는 가법적 편향"
  },
  {
    code: "[6수03-02]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "도형과 측정",
    statement: "원주율(π)의 뜻을 지름과 원주의 비로 탐구하고, 원을 잘게 등분할하여 직사각형 모양으로 재배열하여 원의 넓이 공식을 유도한다.",
    keywords: ["원주율", "원의 넓이", "등분할 재배열", "원주", "지름"],
    mappedTopicIds: ["mt_6su03_02"],
    piagetStage: "Concrete Operational",
    manipulative: "fraction-bars",
    misconception: "원주율 파이(π)를 원의 크기에 따라 변하는 변수로 오해하거나 3.14로만 고정된 유리수로 생각하는 오개념"
  },
  {
    code: "[6수03-05]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "도형과 측정",
    statement: "각기둥, 각뿔, 원기둥, 원뿔의 전개도를 이해하고 직육면체의 겉넓이와 부피 구하는 원리를 단위부피 누적으로 도출한다.",
    keywords: ["각기둥", "원기둥", "전개도", "겉넓이", "부피", "단위부피"],
    mappedTopicIds: ["mt_6su03_05"],
    piagetStage: "Concrete Operational",
    manipulative: "pattern-blocks",
    misconception: "입체도형의 겉넓이(면적 단위 cm²)와 부피(공간 단위 cm³)의 차원을 구별하지 못하는 단위 혼용"
  },
  {
    code: "[6과01-02]",
    subject: "과학",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "지구와 우주 (지구)",
    statement: "지구 자전축의 기울기와 공전으로 인해 태양의 남중 고도가 변하고 계절의 변화가 일어남을 전등과 지구본 모형으로 논증한다.",
    keywords: ["남중 고도", "계절의 변화", "지구 공전", "자전축 기울기", "낮의 길이"],
    mappedTopicIds: ["mt_6sci01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "light-reflection",
    misconception: "계절 변화가 여름에는 지구가 태양에 가깝고 겨울에는 멀기 때문이라는 가장 흔한 천문 오개념"
  },
  {
    code: "[6과05-02]",
    subject: "과학",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "에너지와 파동 (물리)",
    statement: "볼록렌즈와 오목렌즈를 통과하는 빛의 굴절 경로를 관찰하고 안경, 현미경, 망원경의 광학적 작동 원리를 탐구한다.",
    keywords: ["빛의 굴절", "볼록렌즈", "오목렌즈", "초점", "상의 맺힘"],
    mappedTopicIds: ["mt_6sci05_02"],
    piagetStage: "Concrete Operational",
    manipulative: "light-reflection",
    misconception: "렌즈를 통과하면 빛이 직진하지 않고 휘어지지만 그 이유가 매질에 따른 빛의 속력 차이라는 굴절 본질 미인식"
  },
  {
    code: "[6과08-02]",
    subject: "과학",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "전기와 자기 (물리)",
    statement: "전류가 흐르는 전선 주위에 자기장이 형성됨을 나침반으로 확인하고 전자석의 성질과 이용 사례를 탐구한다.",
    keywords: ["전류와 자기장", "전자석", "나침반", "코일", "전자기 유도 기초"],
    mappedTopicIds: ["mt_6sci08_02"],
    piagetStage: "Concrete Operational",
    manipulative: "balance-scale",
    misconception: "전자석은 영구자석과 완전히 같아서 전류가 흐르지 않아도 언제나 자성을 유지할 것이라는 오해"
  },
  {
    code: "[6과09-02]",
    subject: "과학",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "물질의 반응 (화학)",
    statement: "산성 용액과 염기성 용액을 섞을 때 일어나는 중화 반응을 온도 변화와 지시약 색 변화로 관찰하고 중화 원리를 설명한다.",
    keywords: ["중화 반응", "산과 염기", "지시약", "수소이온", "수산화이온"],
    mappedTopicIds: ["mt_6sci09_02"],
    piagetStage: "Concrete Operational",
    manipulative: "concept-matrix",
    misconception: "산성과 염기성을 섞으면 무조건 유독 가스가 발생하거나 폭발한다는 극단적 편견"
  },
  {
    code: "[6사01-02]",
    subject: "사회",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "대한민국의 발전 (역사/사회)",
    statement: "6·25 전쟁의 비극과 분단의 아픔을 알고 평화 통일을 위한 노력과 민주주의 발전 과정을 조사한다.",
    keywords: ["6·25 전쟁", "분단", "평화 통일", "민주화 운동", "시민 참여"],
    mappedTopicIds: ["mt_6soc01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "timeline-board",
    misconception: "민주주의는 특정 영웅적 지도자에 의해서만 발전하며 일반 시민의 참여는 미미하다는 소극적 역사관"
  },
  {
    code: "[6실01-02]",
    subject: "정보",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "알고리즘과 프로그래밍",
    statement: "순차, 선택, 반복 구조를 활용하여 실생활의 문제를 해결하는 블록 프로그래밍을 설계하고 디버깅한다.",
    keywords: ["순차 구조", "선택 구조 (if)", "반복 구조 (loop)", "블록 코딩", "디버깅"],
    mappedTopicIds: ["mt_6info01_02"],
    piagetStage: "Concrete Operational",
    manipulative: "concept-matrix",
    misconception: "조건문의 판단 시점을 실행 내내 지속되는 조건으로 착각하여 즉시 탈출 조건을 누락하는 무한 루프 버그"
  },

  // ==========================================
  // 고3 (Grade 12): 고등학교 3학년 심화·융합 성취기준
  // ==========================================
  {
    code: "[12미적2-01-01]",
    subject: "수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "초월함수의 미분법 (미적분Ⅱ)",
    statement: "지수함수, 로그함수, 삼각함수의 덧셈정리와 극한을 구하고 합성함수, 매개변수, 음함수 미분법으로 도함수를 계산한다.",
    keywords: ["초월함수 미분", "삼각함수 덧셈정리", "자연로그 밑 e", "합성함수 미분법", "음함수 미분"],
    mappedTopicIds: ["mt_12calc2_01_01"],
    piagetStage: "Formal Operational",
    manipulative: "gradient-descent-surface",
    misconception: "lim(x->0) (sin x)/x = 1 공식을 각도가 라디안(radian)이 아닌 도(degree) 단위일 때도 그대로 적용하는 오류"
  },
  {
    code: "[12미적2-02-01]",
    subject: "수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "초월함수의 적분법 (미적분Ⅱ)",
    statement: "치환적분법과 부분적분법의 수학적 원리를 이해하고 복잡한 초월함수의 부정적분과 정적분을 능숙하게 계산한다.",
    keywords: ["치환적분법", "부분적분법", "정적분의 급수 표현", "입체도형 부피 적분"],
    mappedTopicIds: ["mt_12calc2_02_01"],
    piagetStage: "Formal Operational",
    manipulative: "fraction-bars",
    misconception: "부분적분 공식 ∫u v' dx = uv - ∫u' v dx 적용 시 미분할 함수와 적분할 함수의 우선순위를 거꾸로 지정하여 계산 발산"
  },
  {
    code: "[12인수01-01]",
    subject: "수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "인공지능 최적화 (인공지능 수학)",
    statement: "인공지능 손실함수의 최솟값을 구하기 위해 편미분과 경사하강법(Gradient Descent)의 수리적 원리를 적용한다.",
    keywords: ["경사하강법", "편미분", "손실함수", "학습률", "최적화"],
    mappedTopicIds: ["mt_12aimath01_01"],
    piagetStage: "Formal Operational",
    manipulative: "gradient-descent-surface",
    misconception: "경사하강법에서 학습률(learning rate)이 너무 크면 손실함수가 최소점으로 수렴하지 않고 발산한다는 동적 수렴성 간과"
  },
  {
    code: "[12경수01-01]",
    subject: "수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "금융과 수열 (경제 수학)",
    statement: "등비수열의 합 공식을 활용하여 단리와 복리 이자 계산, 원리합계, 연금의 현재가치 및 미래가치를 수리적으로 평가한다.",
    keywords: ["원리합계", "복리 계산", "등비수열의 합", "연금의 현재가치", "금융 수학"],
    mappedTopicIds: ["mt_12econmath01_01"],
    piagetStage: "Formal Operational",
    manipulative: "balance-scale",
    misconception: "기수불(연초 납입)과 기말불(연말 납입)의 첫 항 이자 발생 유무를 구분하지 않고 동일한 공식을 기계적 대입"
  },
  {
    code: "[12고물01-01]",
    subject: "과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "양자역학과 상대성 (고급 물리학)",
    statement: "빛과 물질의 파동-입자 이중성과 불확정성 원리를 이해하고 슈뢰딩거 확률파동의 물리적 의미를 해석한다.",
    keywords: ["물질파", "파동-입자 이중성", "불확정성 원리", "슈뢰딩거 방정식", "확률 밀도"],
    mappedTopicIds: ["mt_12advphy01_01"],
    piagetStage: "Formal Operational",
    manipulative: "light-reflection",
    misconception: "전자의 궤도를 행성 궤도와 같은 결정론적 궤적으로만 생각하여 확률적 오비탈 구름 개념을 수용하지 못하는 고전적 집착"
  },
  {
    code: "[12고화01-01]",
    subject: "과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "화학 열역학과 평형 (고급 화학)",
    statement: "엔탈피(ΔH), 엔트로피(ΔS), 깁스 자유에너지(ΔG)의 상관관계로 화학 반응의 자발성을 판정하고 평형상수(K)를 계산한다.",
    keywords: ["깁스 자유에너지", "엔트로피", "반응의 자발성", "평형상수", "르 샤틀리에 원리"],
    mappedTopicIds: ["mt_12advchem01_01"],
    piagetStage: "Formal Operational",
    manipulative: "balance-scale",
    misconception: "평형 상태에서 정반응과 역반응의 속도가 같아 겉보기에 변화가 없는 동적 평형을 반응이 완전히 멈춘 정적 상태로 오해"
  },
  {
    code: "[12고생01-01]",
    subject: "과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "유전자 발현과 조작 (고급 생명과학)",
    statement: "원핵세포의 오페론 모델과 진핵세포의 전사 조절 인자 기전을 비교하고 CRISPR-Cas9 유전자 가위 기술의 메커니즘을 분석한다.",
    keywords: ["락 오페론", "전사 조절", "CRISPR-Cas9", "유전자 가위", "분자생물학"],
    mappedTopicIds: ["mt_12advbio01_01"],
    piagetStage: "Formal Operational",
    manipulative: "concept-matrix",
    misconception: "젖당 오페론에서 젖당이 없을 때 억제 단백질이 작동 부위에 결합하는 메커니즘을 프로모터 자체의 물리적 파괴로 왜곡"
  },
  {
    code: "[12고지01-01]",
    subject: "과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "우주론과 지구 시스템 (고급 지구과학)",
    statement: "우주 배경 복사 관측 데이터와 적색편이 증거를 토대로 대폭발(Big Bang) 우주론 및 암흑에너지에 의한 우주 가속 팽창을 논증한다.",
    keywords: ["빅뱅 우주론", "우주 배경 복사", "적색편이", "암흑에너지", "가속 팽창"],
    mappedTopicIds: ["mt_12advearth01_01"],
    piagetStage: "Formal Operational",
    manipulative: "timeline-board",
    misconception: "우주 팽창을 3차원 빈 공간 속에서 물질이 사방으로 튀어나가는 폭발로 상상하여 시공간 자체의 팽창을 인식하지 못함"
  },
  {
    code: "[12심국01-01]",
    subject: "국어",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "비판적 논증과 학술 담화 (심화 국어)",
    statement: "학술 연구 논문과 공공 정책 보고서의 논증 타당성(주장, 이유, 전제, 반박 수용)을 다층적으로 비판 검증하고 학술 에세이를 쓴다.",
    keywords: ["논증 구조", "톨민 논증 모형", "학술 텍스트 분석", "비판적 담화", "학술적 글쓰기"],
    mappedTopicIds: ["mt_12advkor01_01"],
    piagetStage: "Formal Operational",
    manipulative: "concept-matrix",
    misconception: "통계적 상관관계(correlation)를 인과관계(causation)로 비약하여 잘못된 전제를 참인 결론으로 유도하는 논리적 오류"
  },
  {
    code: "[12심영01-01]",
    subject: "영어",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "학술 담화와 영문 에세이 (심화 영어)",
    statement: "인문·사회·과학 분야의 영문 학술 논문을 정독하여 저자의 핵심 논지와 함축적 의미를 추론하고 학술 서평을 영문으로 작성한다.",
    keywords: ["학술 영어 독해", "논지 추론", "비판적 독해", "영문 에세이", "학술 서평"],
    mappedTopicIds: ["mt_12adveng01_01"],
    piagetStage: "Formal Operational",
    manipulative: "sentence-blocks",
    misconception: "복합 종속절과 도치 구문이 얽힌 문장에서 표면적 단어 의미만 병렬 조합하여 문장 전체의 수식 관계를 왜곡하는 오류"
  },
  {
    code: "[12데과01-01]",
    subject: "정보",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "머신러닝과 데이터 모델링 (데이터 과학)",
    statement: "다변량 회귀분석, 결정 트리, k-평균 군집화 모델의 수학적 원리를 이해하고 파이썬 코드로 학습 및 과적합 방지 규제(Regularization)를 구현한다.",
    keywords: ["머신러닝", "회귀분석", "결정 트리", "과적합 방지", "L1/L2 규제", "파이썬 데이터 분석"],
    mappedTopicIds: ["mt_12datasci01_01"],
    piagetStage: "Formal Operational",
    manipulative: "gradient-descent-surface",
    misconception: "학습 데이터셋(Training Set)에 대한 정확도가 100%에 도달하면 최적의 모델이라고 착각하는 과적합(Overfitting) 무지"
  },
  {
    code: "[12현철01-01]",
    subject: "도덕",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "인공지능과 정의론 (현대 사회와 철학)",
    statement: "자율주행차 딜레마, AI 알고리즘 편향성, 분배 정의 문제를 롤스의 무지의 베일과 칸트의 의무론을 적용하여 윤리적으로 성찰한다.",
    keywords: ["무지의 베일", "롤스 정의론", "칸트 의무론", "인공지능 윤리", "알고리즘 공정성"],
    mappedTopicIds: ["mt_12phil01_01"],
    piagetStage: "Formal Operational",
    manipulative: "concept-matrix",
    misconception: "윤리적 갈등 해결을 단순히 다수의 이익에 부합하면 정당화된다는 조야한 공리주의 계산으로만 환원하는 오류"
  },
  {
    code: "[12융과01-01]",
    subject: "과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "에너지와 지속가능성 (융합과학 탐구)",
    statement: "기후위기 대응을 위한 탄소중립 기술, 태양전지 광전효과, 수소연료전지의 산화-환원 반응을 융합적으로 분석하고 모델을 설계한다.",
    keywords: ["탄소중립", "광전효과", "수소연료전지", "산화-환원", "에너지 융합 설계"],
    mappedTopicIds: ["mt_12fusion01_01"],
    piagetStage: "Formal Operational",
    manipulative: "balance-scale",
    misconception: "신재생에너지 변환 시 열역학 제2법칙에 따른 불가피한 에너지 분산과 엔트로피 증가 손실을 간과하는 영구기관적 착각"
  },
  {
    code: "[12공일01-01]",
    subject: "기술·가정",
    schoolLevel: "HS",
    gradeCluster: "고등학교",
    grade: "고3",
    domain: "공학 설계와 신소재 (공학 일반)",
    statement: "공학적 문제해결 프로세스(요구사항 분석-설계-시제품 제작-평가)를 거쳐 지속가능한 미래 사회를 위한 스마트 시스템을 설계한다.",
    keywords: ["공학 설계 프로세스", "스마트 시스템", "시제품 제작", "최적화 설계", "피드백 제어"],
    mappedTopicIds: ["mt_12enggen01_01"],
    piagetStage: "Formal Operational",
    manipulative: "concept-matrix",
    misconception: "공학 설계를 미적 디자인이나 단순 발명 아이디어만으로 여기고 수리적 계산과 물성 검증 단계를 생략하는 비공학적 접근"
  }
];

// Additional Spiral Dependencies connecting the new standards across 초1 -> 초2 -> 초3 -> 초4 -> 초5 -> 초6 -> 중1 -> 중2 -> 중3 -> 고1 -> 고2 -> 고3
export const ADDITIONAL_K12_DEPENDENCIES = [
  // Elementary Math Progression (초1 -> 초2 -> 초3 -> 초4 -> 초5 -> 초6)
  {
    topicId: "[1수01-02]",
    prerequisiteId: "[1수01-01]",
    strength: "hard",
    reason: "100 이하 두 자리 수 자릿값 이해를 위해 100까지의 수 개념과 수 세기 선수학습 필수"
  },
  {
    topicId: "[1수01-03]",
    prerequisiteId: "[1수01-02]",
    strength: "hard",
    reason: "10의 보수 및 가르기·모으기를 위해 일의 자리와 십의 자리 수량 감각 선수학습 필수"
  },
  {
    topicId: "[1수01-04]",
    prerequisiteId: "[1수01-03]",
    strength: "hard",
    reason: "한 자리 수 덧셈과 뺄셈 계산을 위해 두 수의 가르기와 모으기 직관 선수학습 필수"
  },
  {
    topicId: "[2수01-01]",
    prerequisiteId: "[1수01-02]",
    strength: "hard",
    reason: "세 자리 수 및 네 자리 수의 자릿값 이해를 위해 십의 자리, 일의 자리 자릿값 체계 선수학습 필수"
  },
  {
    topicId: "[2수01-06]",
    prerequisiteId: "[1수01-04]",
    strength: "hard",
    reason: "받아올림·받아내림이 있는 두 자리 수 연산을 위해 기본 한 자리 수 덧셈과 뺄셈 숙달 필수"
  },
  {
    topicId: "[2수01-08]",
    prerequisiteId: "[2수01-06]",
    strength: "hard",
    reason: "곱셈의 의미(동수누가)를 이해하기 위해 덧셈의 원리와 계산 숙달 필수"
  },
  {
    topicId: "[2수01-10]",
    prerequisiteId: "[2수01-08]",
    strength: "hard",
    reason: "곱셈구구(구구단) 완성을 위해 곱셈식과 묶어 세기 원리 선수학습 필수"
  },
  {
    topicId: "[4수01-01]",
    prerequisiteId: "[2수01-01]",
    strength: "hard",
    reason: "10000 이상 큰 수(만, 억, 조)의 십진 자릿값을 위해 세 자리 수, 네 자리 수 자릿값 체계 선수학습 필수"
  },
  {
    topicId: "[4수01-05]",
    prerequisiteId: "[2수01-10]",
    strength: "hard",
    reason: "세 자리 수와 두 자리 수의 곱셈을 위해 곱셈구구 및 자릿값 분배법칙 선수학습 필수"
  },
  {
    topicId: "[4수01-06]",
    prerequisiteId: "[4수01-05]",
    strength: "hard",
    reason: "두 자리 수 나눗셈과 검산식 이해를 위해 곱셈의 자릿값 어림 계산 선수학습 필수"
  },
  {
    topicId: "[4수01-07]",
    prerequisiteId: "[1수01-04]",
    strength: "hard",
    reason: "분모가 같은 분수의 덧셈에서 분자끼리의 덧셈을 위해 기본 자연수 덧셈 선수학습 필수"
  },
  {
    topicId: "[6수01-02]",
    prerequisiteId: "[4수01-06]",
    strength: "hard",
    reason: "분수 나누기 자연수의 등분할 원리를 위해 자연수의 나눗셈 원리 선수학습 필수"
  },
  {
    topicId: "[6수02-04]",
    prerequisiteId: "[6수02-01]",
    strength: "hard",
    reason: "비례식의 성질(외항의 곱 = 내항의 곱)을 위해 비와 비율의 기준량·비교량 개념 선수학습 필수"
  },
  {
    topicId: "[6수03-02]",
    prerequisiteId: "[6수02-01]",
    strength: "hard",
    reason: "원주율(지름에 대한 둘레의 비)과 원의 넓이를 위해 비와 비율 및 직사각형 넓이 선수학습 필수"
  },

  // High School Grade 12 Advanced Math & AI
  {
    topicId: "[12미적2-01-01]",
    prerequisiteId: "[12미적1-02-01]",
    strength: "hard",
    reason: "초월함수의 미분법을 위해 다항함수의 미분계수, 도함수 및 삼각함수 기본 성질 선수학습 필수"
  },
  {
    topicId: "[12미적2-02-01]",
    prerequisiteId: "[12미적2-01-01]",
    strength: "hard",
    reason: "초월함수의 치환적분법 및 부분적분법을 위해 합성함수 미분법과 곱의 미분법 선수학습 필수"
  },
  {
    topicId: "[12인수01-01]",
    prerequisiteId: "[12미적1-02-01]",
    strength: "hard",
    reason: "인공지능 경사하강법(Gradient Descent) 최적화를 위해 미분계수(기울기) 및 순간변화율 선수학습 필수"
  },
  {
    topicId: "[12경수01-01]",
    prerequisiteId: "[12대수03-01]",
    strength: "hard",
    reason: "복리 원리합계 및 연금의 가치 계산을 위해 등비수열의 일반항과 합 공식 선수학습 필수"
  },
  {
    topicId: "[12기하01-01]",
    prerequisiteId: "[10공수1-05]",
    strength: "hard",
    reason: "이차곡선(포물선, 타원, 쌍곡선)의 방정식을 위해 고1 이차방정식 및 도형의 방정식 선수학습 필수"
  },

  // Science Progression (초1 -> 초4 -> 초6 -> 중 -> 고1 -> 고2 -> 고3)
  {
    topicId: "[4과01-02]",
    prerequisiteId: "[1슬01-01]",
    strength: "hard",
    reason: "물의 세 가지 상태 변화 관찰을 위해 1학년 날씨와 계절의 감각적 탐색 선수학습 필수"
  },
  {
    topicId: "[6과01-02]",
    prerequisiteId: "[4과01-02]",
    strength: "hard",
    reason: "계절에 따른 기온과 태양 남중 고도 변화를 위해 물의 상태와 날씨 기초 선수학습 필수"
  },
  {
    topicId: "[6과05-02]",
    prerequisiteId: "[6과05-01]",
    strength: "hard",
    reason: "렌즈에 의한 빛의 굴절과 광학기기 원리를 위해 평면거울의 빛의 반사 법칙 선수학습 필수"
  },
  {
    topicId: "[6과08-02]",
    prerequisiteId: "[6과08-01]",
    strength: "hard",
    reason: "전류에 의한 자기장(전자석)을 위해 전구의 직렬·병렬 회로와 전류 흐름 선수학습 필수"
  },
  {
    topicId: "[6과09-02]",
    prerequisiteId: "[6과09-01]",
    strength: "hard",
    reason: "산과 염기의 중화 반응 관찰을 위해 지시약의 색 변화 및 산성·염기성 용액의 성질 선수학습 필수"
  },
  {
    topicId: "[12고물01-01]",
    prerequisiteId: "[12물리03-01]",
    strength: "hard",
    reason: "빛과 물질의 파동-입자 이중성 및 양자역학을 위해 파동의 간섭·굴절 및 전자기파 선수학습 필수"
  },
  {
    topicId: "[12고화01-01]",
    prerequisiteId: "[12화학01-01]",
    strength: "hard",
    reason: "깁스 자유에너지와 화학 평형을 위해 화학반응식의 양적 관계와 몰(mole) 선수학습 필수"
  },
  {
    topicId: "[12고생01-01]",
    prerequisiteId: "[12생명01-02]",
    strength: "hard",
    reason: "유전자 발현 조절과 CRISPR 유전자 가위를 위해 감수분열, DNA 구조 및 유전 정보 전달 선수학습 필수"
  },
  {
    topicId: "[12고지01-01]",
    prerequisiteId: "[12지구01-01]",
    strength: "hard",
    reason: "빅뱅 우주론과 암흑에너지 팽창을 위해 판 구조론, 지질 시대 및 별의 분광학적 관측 선수학습 필수"
  },
  {
    topicId: "[12융과01-01]",
    prerequisiteId: "[10통과03-01]",
    strength: "hard",
    reason: "탄소중립 신재생에너지 융합 설계를 위해 통합과학 역학적 시스템 및 화학 변화 선수학습 필수"
  },

  // Korean & English Progression (초1 -> 초2 -> 초4 -> 초6 -> 중 -> 고1 -> 고2 -> 고3)
  {
    topicId: "[2국01-02]",
    prerequisiteId: "[1국01-01]",
    strength: "soft",
    reason: "문장 부호를 갖춘 완전한 문장 작성을 위해 한글 자모의 음소와 낱말 쓰기 선수학습 권장"
  },
  {
    topicId: "[6국01-03]",
    prerequisiteId: "[4국02-01]",
    strength: "hard",
    reason: "낱말의 짜임(어근과 접사)과 품사 분류를 위해 문장 성분과 문맥적 어휘 선수학습 필수"
  },
  {
    topicId: "[12심국01-01]",
    prerequisiteId: "[12독작01-01]",
    strength: "hard",
    reason: "학술 연구 논문의 비판적 논증 검증을 위해 독서와 작문의 논증적 글쓰기 구조 선수학습 필수"
  },
  {
    topicId: "[4영01-02]",
    prerequisiteId: "[3영01-01]",
    strength: "hard",
    reason: "파닉스 기반 단어 읽기를 위해 알파벳 대소문자 식별 및 기초 소리값 선수학습 필수"
  },
  {
    topicId: "[6영01-01]",
    prerequisiteId: "[4영01-02]",
    strength: "hard",
    reason: "문맥 속 중심 내용 파악을 위해 기초 어휘와 파닉스 단어 읽기 선수학습 필수"
  },
  {
    topicId: "[12심영01-01]",
    prerequisiteId: "[12영독작01-01]",
    strength: "hard",
    reason: "학술 영문 논문 독해와 에세이 작성을 위해 영어 독해와 작문의 복문 구조 분석 선수학습 필수"
  },

  // Social & Ethics Progression (초1 -> 초4 -> 초6 -> 중 -> 고1 -> 고2 -> 고3)
  {
    topicId: "[4사01-02]",
    prerequisiteId: "[3사01-01]",
    strength: "hard",
    reason: "촌락과 도시의 교류 분석을 위해 우리 고장의 지리적 모습과 생활 양식 선수학습 필수"
  },
  {
    topicId: "[6사01-02]",
    prerequisiteId: "[4사01-02]",
    strength: "hard",
    reason: "분단과 민주화 발전 과정 탐구를 위해 지역 사회의 인구·산업 구조와 시민 기본권 선수학습 필수"
  },
  {
    topicId: "[12현철01-01]",
    prerequisiteId: "[12생윤01-01]",
    strength: "hard",
    reason: "AI 윤리와 롤스 정의론 적용을 위해 생활과 윤리의 윤리적 쟁점 분석 기법 선수학습 필수"
  },

  // Informatics Progression (초6 -> 중 -> 고1 -> 고3)
  {
    topicId: "[6실01-02]",
    prerequisiteId: "[6실01-01]",
    strength: "hard",
    reason: "순차·선택·반복 제어 블록 코딩 디버깅을 위해 기초 블록 조립 및 알고리즘 순서도 선수학습 필수"
  },
  {
    topicId: "[9정02-01]",
    prerequisiteId: "[6실01-02]",
    strength: "hard",
    reason: "중학교 텍스트 프로그래밍 제어 구조를 위해 초등 블록 코딩 알고리즘 문제해결 선수학습 필수"
  },
  {
    topicId: "[12데과01-01]",
    prerequisiteId: "[10정01-01]",
    strength: "hard",
    reason: "머신러닝 회귀분석 및 결정 트리 구현을 위해 고1 정보 알고리즘과 데이터 모델링 선수학습 필수"
  }
];

console.log("Grade Completion Standards:", GRADE_COMPLETION_STANDARDS.length);
console.log("Additional K-12 Dependencies:", ADDITIONAL_K12_DEPENDENCIES.length);

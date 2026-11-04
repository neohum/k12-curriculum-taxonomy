/**
 * Korea 2022 Revised Curriculum Adapter for withmarbleapp/os-taxonomy
 *
 * Bridges the Korean Ministry of Education 2022 Revised Elementary Curriculum
 * (2022 개정 초등 교육과정) with the Marble open-source micro-skills taxonomy.
 */

/**
 * Bidirectional Korean-English educational terminology dictionary.
 */
export const KOREAN_TERMINOLOGY_DICTIONARY = Object.freeze({
  // 수학 (Mathematics) - 수와 연산 & 분수/소수
  "분수": { en: "Fractions", domain: "Fractions", subject: "Mathematics" },
  "분모": { en: "Denominator", domain: "Fractions", subject: "Mathematics" },
  "분자": { en: "Numerator", domain: "Fractions", subject: "Mathematics" },
  "단위분수": { en: "Unit Fraction", domain: "Fractions", subject: "Mathematics" },
  "진분수": { en: "Proper Fraction", domain: "Fractions", subject: "Mathematics" },
  "가분수": { en: "Improper Fraction", domain: "Fractions", subject: "Mathematics" },
  "대분수": { en: "Mixed Number", domain: "Fractions", subject: "Mathematics" },
  "동분모": { en: "Like Denominators", domain: "Fractions", subject: "Mathematics" },
  "이분모": { en: "Unlike Denominators", domain: "Fractions", subject: "Mathematics" },
  "약분": { en: "Simplifying Fractions", domain: "Fractions", subject: "Mathematics" },
  "통분": { en: "Common Denominator", domain: "Fractions", subject: "Mathematics" },
  "기약분수": { en: "Irreducible Fraction", domain: "Fractions", subject: "Mathematics" },
  "소수": { en: "Decimals", domain: "Fractions", subject: "Mathematics" },
  "소수점": { en: "Decimal Point", domain: "Fractions", subject: "Mathematics" },
  "자릿값": { en: "Place Value", domain: "Number Representation & Place Value", subject: "Mathematics" },
  "위치적 기수법": { en: "Positional Notation", domain: "Number Representation & Place Value", subject: "Mathematics" },
  "큰 수": { en: "Large Numbers", domain: "Number Representation & Place Value", subject: "Mathematics" },
  "수 모으기와 가르기": { en: "Number Bonds", domain: "Addition & Subtraction", subject: "Mathematics" },
  "덧셈": { en: "Addition", domain: "Addition & Subtraction", subject: "Mathematics" },
  "뺄셈": { en: "Subtraction", domain: "Addition & Subtraction", subject: "Mathematics" },
  "역연산": { en: "Inverse Operations", domain: "Addition & Subtraction", subject: "Mathematics" },
  "곱셈": { en: "Multiplication", domain: "Multiplication & Division", subject: "Mathematics" },
  "나눗셈": { en: "Division", domain: "Multiplication & Division", subject: "Mathematics" },
  "곱셈구구": { en: "Multiplication Tables", domain: "Multiplication & Division", subject: "Mathematics" },
  "약수": { en: "Factors", domain: "Multiplication & Division", subject: "Mathematics" },
  "배수": { en: "Multiples", domain: "Multiplication & Division", subject: "Mathematics" },
  "최대공약수": { en: "Greatest Common Factor", domain: "Multiplication & Division", subject: "Mathematics" },
  "최소공배수": { en: "Least Common Multiple", domain: "Multiplication & Division", subject: "Mathematics" },
  "비와 비율": { en: "Ratio & Proportion", domain: "Ratio & Proportion", subject: "Mathematics" },
  "백분율": { en: "Percentage", domain: "Ratio & Proportion", subject: "Mathematics" },
  "비례식": { en: "Proportions", domain: "Ratio & Proportion", subject: "Mathematics" },

  // 수학 - 도형 & 측정
  "직선": { en: "Line", domain: "Geometry", subject: "Mathematics" },
  "선분": { en: "Line Segment", domain: "Geometry", subject: "Mathematics" },
  "반직선": { en: "Ray", domain: "Geometry", subject: "Mathematics" },
  "각도": { en: "Angles", domain: "Geometry", subject: "Mathematics" },
  "직각": { en: "Right Angle", domain: "Geometry", subject: "Mathematics" },
  "직육면체": { en: "Cuboid", domain: "Geometry", subject: "Mathematics" },
  "정육면체": { en: "Cube", domain: "Geometry", subject: "Mathematics" },
  "전개도": { en: "Net", domain: "Geometry", subject: "Mathematics" },
  "겨냥도": { en: "Perspective Diagram", domain: "Geometry", subject: "Mathematics" },
  "원주율": { en: "Pi", domain: "Geometry", subject: "Mathematics" },
  "원의 넓이": { en: "Area of Circle", domain: "Geometry", subject: "Mathematics" },
  "둘레": { en: "Perimeter", domain: "Measurement", subject: "Mathematics" },
  "부피": { en: "Volume", domain: "Measurement", subject: "Mathematics" },
  "겉넓이": { en: "Surface Area", domain: "Measurement", subject: "Mathematics" },

  // 과학 (Science)
  "광합성": { en: "Photosynthesis", domain: "Organisms & Life Processes", subject: "Science" },
  "증산 작용": { en: "Transpiration", domain: "Organisms & Life Processes", subject: "Science" },
  "식물의 구조": { en: "Plant Structure", domain: "Organisms & Life Processes", subject: "Science" },
  "소화계": { en: "Digestive System", domain: "Organisms & Life Processes", subject: "Science" },
  "순환계": { en: "Circulatory System", domain: "Organisms & Life Processes", subject: "Science" },
  "호흡계": { en: "Respiratory System", domain: "Organisms & Life Processes", subject: "Science" },
  "생태계": { en: "Ecosystems", domain: "Ecosystems & Habitats", subject: "Science" },
  "먹이사슬": { en: "Food Chain", domain: "Ecosystems & Habitats", subject: "Science" },
  "전기 회로": { en: "Electric Circuit", domain: "Energy", subject: "Science" },
  "직렬연결": { en: "Series Circuit", domain: "Energy", subject: "Science" },
  "병렬연결": { en: "Parallel Circuit", domain: "Energy", subject: "Science" },
  "도체": { en: "Conductor", domain: "Energy", subject: "Science" },
  "부도체": { en: "Insulator", domain: "Energy", subject: "Science" },
  "자석": { en: "Magnets", domain: "Forces & Motion", subject: "Science" },
  "자기장": { en: "Magnetic Field", domain: "Forces & Motion", subject: "Science" },
  "소리의 성질": { en: "Sound & Vibrations", domain: "Waves, Light & Sound", subject: "Science" },
  "진동": { en: "Vibration", domain: "Waves, Light & Sound", subject: "Science" },
  "빛의 반사": { en: "Reflection of Light", domain: "Waves, Light & Sound", subject: "Science" },
  "빛의 굴절": { en: "Refraction of Light", domain: "Waves, Light & Sound", subject: "Science" },
  "그림자": { en: "Shadows", domain: "Waves, Light & Sound", subject: "Science" },
  "물질의 상태": { en: "States of Matter", domain: "Matter & Materials", subject: "Science" },
  "용해": { en: "Dissolving", domain: "Matter & Materials", subject: "Science" },
  "용해도": { en: "Solubility", domain: "Matter & Materials", subject: "Science" },
  "지진": { en: "Earthquake", domain: "Earth's Systems", subject: "Science" },
  "화산": { en: "Volcano", domain: "Earth's Systems", subject: "Science" },
  "지층": { en: "Rock Layers", domain: "Earth's Systems", subject: "Science" },
  "화석": { en: "Fossils", domain: "Earth's Systems", subject: "Science" },
  "자전": { en: "Rotation", domain: "Space Systems & Earth's History", subject: "Science" },
  "공전": { en: "Revolution", domain: "Space Systems & Earth's History", subject: "Science" },

  // 실과 / 컴퓨팅 (SW & Computing)
  "알고리즘": { en: "Algorithm", domain: "Algorithms & Programming", subject: "Computing" },
  "순차": { en: "Sequence", domain: "Algorithms & Programming", subject: "Computing" },
  "선택": { en: "Selection", domain: "Algorithms & Programming", subject: "Computing" },
  "반복": { en: "Loops", domain: "Algorithms & Programming", subject: "Computing" },
  "디버깅": { en: "Debugging", domain: "Algorithms & Programming", subject: "Computing" },
  "블록 코딩": { en: "Visual Programming", domain: "Algorithms & Programming", subject: "Computing" },
  "변수": { en: "Variables", domain: "Algorithms & Programming", subject: "Computing" },
  "이벤트": { en: "Concurrent Events", domain: "Algorithms & Programming", subject: "Computing" },
  "조건문": { en: "Decisions and Input", domain: "Algorithms & Programming", subject: "Computing" }
});

/**
 * 2022 Revised Elementary Curriculum Standards Dataset
 * Cover math ([2수01-01] ~ [6수05-02]), science ([3과01-01] ~ [6과08-03]),
 * and computing/SW ([6실04-01] ~ [6실04-05]).
 */
export const KOREA_2022_STANDARDS = [
  // ----------------------------------------------------
  // 수학: 초등 1~2학년군 (2수)
  // ----------------------------------------------------
  {
    code: "[2수01-01]",
    subject: "수학",
    gradeCluster: "초등 1~2학년군",
    domain: "수와 연산",
    statement: "0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.",
    keywords: ["0과 100까지의 수", "수 세기", "수 읽기", "수 쓰기"],
    mappedTopicIds: ["mt_b3f9sJ3-L1", "mt_lMz9nAs7VO"]
  },
  {
    code: "[2수01-02]",
    subject: "수학",
    gradeCluster: "초등 1~2학년군",
    domain: "수와 연산",
    statement: "일의 자리, 십의 자리의 자릿값을 이해하고, 100 이하의 두 자리 수를 다양한 방법으로 나타낼 수 있다.",
    keywords: ["자릿값", "십의 자리", "일의 자리", "두 자리 수"],
    mappedTopicIds: ["mt_jY7uf0Cb7o", "mt_lC_Q5mSL_I"]
  },
  {
    code: "[2수01-04]",
    subject: "수학",
    gradeCluster: "초등 1~2학년군",
    domain: "수와 연산",
    statement: "하나의 수를 두 수로 가르기와 두 수를 하나의 수로 모으기를 할 수 있다.",
    keywords: ["가르기", "모으기", "수 모으기와 가르기", "수 결합"],
    mappedTopicIds: ["mt_nyK25mNOeR", "mt_20WfHhnL39"]
  },
  {
    code: "[2수01-05]",
    subject: "수학",
    gradeCluster: "초등 1~2학년군",
    domain: "수와 연산",
    statement: "덧셈과 뺄셈의 의미를 이해하고, 덧셈과 뺄셈의 역연산 관계를 설명할 수 있다.",
    keywords: ["덧셈", "뺄셈", "역연산", "연산의 역관계"],
    mappedTopicIds: ["mt_ehGS_uVSJv"]
  },
  {
    code: "[2수01-08]",
    subject: "수학",
    gradeCluster: "초등 1~2학년군",
    domain: "수와 연산",
    statement: "곱셈의 의미(동수누가, 묶어 세기)를 이해하고, 곱셈식을 나타낼 수 있다.",
    keywords: ["곱셈", "묶어 세기", "동수누가", "곱셈식"],
    mappedTopicIds: ["mt_gtTl3R5buH"]
  },
  {
    code: "[2수01-09]",
    subject: "수학",
    gradeCluster: "초등 1~2학년군",
    domain: "수와 연산",
    statement: "곱셈구구를 이해하고, 곱셈구구를 계산할 수 있다.",
    keywords: ["곱셈구구", "구구단", "곱셈표"],
    mappedTopicIds: ["mt_gtTl3R5buH", "mt_18fK9sQdIz"]
  },
  {
    code: "[2수02-01]",
    subject: "수학",
    gradeCluster: "초등 1~2학년군",
    domain: "도형과 측정",
    statement: "원, 삼각형, 사각형 모양을 직관적으로 분류하고 특징을 찾을 수 있다.",
    keywords: ["도형", "원", "삼각형", "사각형", "평면도형"],
    mappedTopicIds: ["mt_fEuoBYw6bU"]
  },
  {
    code: "[2수03-01]",
    subject: "수학",
    gradeCluster: "초등 1~2학년군",
    domain: "도형과 측정",
    statement: "구체물의 길이, 들이, 무게, 넓이를 비교하여 각각 '길다/짧다', '많다/적다', '무겁다/가볍다', '넓다/좁다'로 나타낼 수 있다.",
    keywords: ["양의 비교", "길이", "들이", "무게", "넓이"],
    mappedTopicIds: ["mt_BFJ-ch_8QU", "mt_bnwHo5wfCD"]
  },

  // ----------------------------------------------------
  // 수학: 초등 3~4학년군 (4수)
  // ----------------------------------------------------
  {
    code: "[4수01-01]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "수와 연산",
    statement: "10000 이상의 큰 수의 자릿값과 위치적 기수법을 이해하고, 수를 읽고 쓸 수 있다.",
    keywords: ["큰 수", "10000 이상의 수", "자릿값", "위치적 기수법"],
    mappedTopicIds: ["mt_lC_Q5mSL_I", "mt_jY7uf0Cb7o", "mt_JwP9QFv6gQ"]
  },
  {
    code: "[4수01-04]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "수와 연산",
    statement: "곱하는 수가 한 자리 수 또는 두 자리 수인 곱셈의 계산 원리를 이해하고 계산할 수 있다.",
    keywords: ["곱셈", "두 자리 수 곱셈", "세 자리 수 곱셈"],
    mappedTopicIds: ["mt_18fK9sQdIz", "mt_gtTl3R5buH"]
  },
  {
    code: "[4수01-07]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "수와 연산",
    statement: "양의 등분할을 통하여 분수를 이해하고, 분수를 쓰고 읽을 수 있다.",
    keywords: ["분수", "등분할", "분자", "분모", "단위분수", "진분수"],
    mappedTopicIds: ["mt_ndGqFPWyen", "mt_Kr3IyA6m-O"]
  },
  {
    code: "[4수01-08]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "수와 연산",
    statement: "단위분수, 진분수, 가분수, 대분수를 알고, 그 관계를 이해한다.",
    keywords: ["단위분수", "진분수", "가분수", "대분수"],
    mappedTopicIds: ["mt_ndGqFPWyen", "mt_Kr3IyA6m-O", "mt_FP-mjXaq3B"]
  },
  {
    code: "[4수01-09]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "수와 연산",
    statement: "분모가 같은 분수의 크기를 비교할 수 있다.",
    keywords: ["분수 크기 비교", "동분모", "분모가 같은 분수"],
    mappedTopicIds: ["mt_ndGqFPWyen", "mt_Kr3IyA6m-O"]
  },
  {
    code: "[4수01-10]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "수와 연산",
    statement: "분모가 같은 분수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.",
    keywords: ["분수의 덧셈", "분수의 뺄셈", "동분모 분수 덧셈", "동분모 덧셈뺄셈"],
    mappedTopicIds: ["mt_a1FdAsRKOF"]
  },
  {
    code: "[4수01-11]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "수와 연산",
    statement: "소수 두 자리 수와 소수 세 자리 수를 이해하고 읽고 쓸 수 있다.",
    keywords: ["소수", "소수점", "소수 두 자리 수", "소수 세 자리 수"],
    mappedTopicIds: ["mt_YzM5goBctT", "mt_IegHBHERVa", "mt_933BohS9BH"]
  },
  {
    code: "[4수01-12]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "수와 연산",
    statement: "소수의 크기를 비교할 수 있다.",
    keywords: ["소수 비교", "소수의 크기", "소수 크기 비교"],
    mappedTopicIds: ["mt_IegHBHERVa", "mt_933BohS9BH"]
  },
  {
    code: "[4수02-02]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "도형과 측정",
    statement: "각과 직각을 이해하고, 직각삼각형, 직사각형, 정사각형을 구별할 수 있다.",
    keywords: ["각", "직각", "직각삼각형", "직사각형", "정사각형"],
    mappedTopicIds: ["mt_TdV9YGJEoY", "mt_fEuoBYw6bU"]
  },
  {
    code: "[4수05-02]",
    subject: "수학",
    gradeCluster: "초등 3~4학년군",
    domain: "자료와 가능성",
    statement: "연속적인 변량에 대한 자료를 수집하여 꺾은선그래프로 나타내고 해석할 수 있다.",
    keywords: ["자료 수집", "꺾은선그래프", "표", "그래프 해석"],
    mappedTopicIds: ["mt_ebQURBOsM5", "mt_gTI7MuS-y8"]
  },

  // ----------------------------------------------------
  // 수학: 초등 5~6학년군 (6수)
  // ----------------------------------------------------
  {
    code: "[6수01-01]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "수와 연산",
    statement: "약수, 공약수, 최대공약수의 개념을 이해하고 구할 수 있다.",
    keywords: ["약수", "공약수", "최대공약수"],
    mappedTopicIds: ["mt_FP-mjXaq3B", "mt_18fK9sQdIz"]
  },
  {
    code: "[6수01-02]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "수와 연산",
    statement: "배수, 공배수, 최소공배수의 개념을 이해하고 구할 수 있다.",
    keywords: ["배수", "공배수", "최소공배수"],
    mappedTopicIds: ["mt_FP-mjXaq3B", "mt_gtTl3R5buH"]
  },
  {
    code: "[6수01-03]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "수와 연산",
    statement: "분수의 성질을 이용하여 크기가 같은 분수를 만들 수 있다.",
    keywords: ["크기가 같은 분수", "분수의 성질", "동치분수"],
    mappedTopicIds: ["mt_FbDKeLfBCo", "mt_FP-mjXaq3B"]
  },
  {
    code: "[6수01-04]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "수와 연산",
    statement: "약분과 통분을 이해하고, 분수를 약분하거나 통분할 수 있다.",
    keywords: ["약분", "통분", "공통분모", "기약분수"],
    mappedTopicIds: ["mt_FP-mjXaq3B", "mt_SXbZ3bC9z7", "mt_NaqEP8xDhZ"]
  },
  {
    code: "[6수01-06]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "수와 연산",
    statement: "분모가 다른 분수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.",
    keywords: ["이분모 분수 덧셈", "이분모 덧셈뺄셈", "통분 덧셈"],
    mappedTopicIds: ["mt_SXbZ3bC9z7", "mt_NaqEP8xDhZ"]
  },
  {
    code: "[6수02-01]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "변화와 관계",
    statement: "두 양의 크기를 비교하는 방법을 알고, 비와 비율의 의미를 이해한다.",
    keywords: ["비", "비율", "비와 비율", "기준량", "비교하는 양"],
    mappedTopicIds: ["mt_SXbZ3bC9z7", "mt_NaqEP8xDhZ"]
  },
  {
    code: "[6수02-02]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "변화와 관계",
    statement: "비율을 백분율로 나타내고, 실생활 상황에서 백분율을 사용할 수 있다.",
    keywords: ["백분율", "퍼센트", "%", "할인율"],
    mappedTopicIds: ["mt_NaqEP8xDhZ"]
  },
  {
    code: "[6수03-01]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "도형과 측정",
    statement: "직육면체와 정육면체를 알고, 구성 요소와 성질을 이해한다.",
    keywords: ["직육면체", "정육면체", "면", "모서리", "꼭짓점"],
    mappedTopicIds: ["mt_nRksLqt-iR", "mt_fEuoBYw6bU"]
  },
  {
    code: "[6수03-03]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "도형과 측정",
    statement: "원주율을 이해하고, 원주와 원의 넓이를 구할 수 있다.",
    keywords: ["원주", "원주율", "원의 넓이", "원"],
    mappedTopicIds: ["mt_b4lbTOJYwI"]
  },
  {
    code: "[6수03-04]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "도형과 측정",
    statement: "직육면체의 겉넓이와 부피를 구하는 방법을 이해하고 계산할 수 있다.",
    keywords: ["직육면체 겉넓이", "직육면체 부피", "부피", "겉넓이"],
    mappedTopicIds: ["mt_n0AlyLQwC9", "mt_nRksLqt-iR"]
  },
  {
    code: "[6수05-02]",
    subject: "수학",
    gradeCluster: "초등 5~6학년군",
    domain: "자료와 가능성",
    statement: "비율그래프(띠그래프, 원그래프)를 알고, 이를 해석하여 문제를 해결할 수 있다.",
    keywords: ["띠그래프", "원그래프", "비율그래프", "자료 해석"],
    mappedTopicIds: ["mt_BdAeZJUOir", "mt_8atyuvPUZc"]
  },

  // ----------------------------------------------------
  // 과학: 초등 3~4학년군 (4과)
  // ----------------------------------------------------
  {
    code: "[4과02-01]",
    subject: "과학",
    gradeCluster: "초등 3~4학년군",
    domain: "물질과 에너지 (물리)",
    statement: "자석 사이에 작용하는 힘(인력, 척력)을 관찰하고 자석의 성질을 설명할 수 있다.",
    keywords: ["자석", "인력", "척력", "자석의 극", "자석의 성질"],
    mappedTopicIds: ["mt_NNNbPccwB4"]
  },
  {
    code: "[4과04-01]",
    subject: "과학",
    gradeCluster: "초등 3~4학년군",
    domain: "생명과 지구 (생물)",
    statement: "여러 가지 식물의 씨가 싹터서 자라며 꽃을 피우고 열매를 맺는 한살이 과정을 관찰할 수 있다.",
    keywords: ["식물의 한살이", "씨앗", "발아", "꽃", "열매"],
    mappedTopicIds: ["mt_xT6jPzyj92", "mt_L1469gt34A"]
  },
  {
    code: "[4과05-01]",
    subject: "과학",
    gradeCluster: "초등 3~4학년군",
    domain: "물질과 에너지 (물리)",
    statement: "물체가 진동하여 소리가 발생하는 현상을 관찰하고 소리의 세기와 높낮이를 비교할 수 있다.",
    keywords: ["소리", "진동", "소리의 세기", "소리의 높낮이", "소리의 성질"],
    mappedTopicIds: ["mt__00ZSLnB7p", "mt_VBl1T1sFCM"]
  },
  {
    code: "[4과06-01]",
    subject: "과학",
    gradeCluster: "초등 3~4학년군",
    domain: "물질과 에너지 (화학)",
    statement: "고체, 액체, 기체의 상태를 관찰하고 물질의 상태에 따른 특징을 비교할 수 있다.",
    keywords: ["물질의 상태", "고체", "액체", "기체"],
    mappedTopicIds: ["mt_LKagN9GJPX", "mt_0_K-GrKQpd"]
  },
  {
    code: "[4과07-01]",
    subject: "과학",
    gradeCluster: "초등 3~4학년군",
    domain: "물질과 에너지 (물리)",
    statement: "빛이 곧게 나아가는 성질(직진)과 거울에 반사되는 성질을 관찰할 수 있다.",
    keywords: ["빛", "빛의 직진", "반사", "거울", "빛의 반사"],
    mappedTopicIds: ["mt_NzCNuABT3E"]
  },
  {
    code: "[4과08-01]",
    subject: "과학",
    gradeCluster: "초등 3~4학년군",
    domain: "물질과 에너지 (물리)",
    statement: "그림자가 생기는 원리를 탐구하고, 물체와 광원 사이의 거리에 따른 그림자의 크기 변화를 설명할 수 있다.",
    keywords: ["그림자", "그림자의 원리", "광원", "그림자의 크기"],
    mappedTopicIds: ["mt_NzCNuABT3E", "mt_K1-HopEJAB"]
  },
  {
    code: "[4과09-01]",
    subject: "과학",
    gradeCluster: "초등 3~4학년군",
    domain: "생명과 지구 (지구과학)",
    statement: "화산과 지진 활동의 특징을 조사하고, 지진 발생 시 안전한 대처 방법을 익힌다.",
    keywords: ["화산", "지진", "화산 활동", "지진 대피", "안전 대처"],
    mappedTopicIds: ["mt_0_K-GrKQpd", "mt_LKagN9GJPX"]
  },
  {
    code: "[4과10-01]",
    subject: "과학",
    gradeCluster: "초등 3~4학년군",
    domain: "생명과 지구 (지구과학)",
    statement: "퇴적암으로 이루어진 지층의 형성 과정과 화석의 특징을 관찰하여 과거 환경을 추론할 수 있다.",
    keywords: ["지층", "화석", "퇴적암", "지층의 형성"],
    mappedTopicIds: ["mt_0_K-GrKQpd"]
  },

  // ----------------------------------------------------
  // 과학: 초등 5~6학년군 (6과)
  // ----------------------------------------------------
  {
    code: "[6과01-01]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "물질과 에너지 (물리)",
    statement: "전지, 전구, 전선을 연결하여 전구에 불이 켜지는 전기 회로를 구성할 수 있다.",
    keywords: ["전기 회로", "전지", "전구", "전선", "회로 구성", "닫힌 회로"],
    mappedTopicIds: ["mt_NNNbPccwB4", "mt_NzCNuABT3E", "mt_NzNLYDb9CZ"]
  },
  {
    code: "[6과01-02]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "물질과 에너지 (물리)",
    statement: "전구의 직렬연결과 병렬연결의 특징을 비교하고, 스위치로 회로를 제어할 수 있다.",
    keywords: ["직렬연결", "병렬연결", "스위치", "회로 기호"],
    mappedTopicIds: ["mt_NzCNuABT3E", "mt_NzNLYDb9CZ"]
  },
  {
    code: "[6과01-03]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "물질과 에너지 (물리)",
    statement: "전기가 잘 통하는 도체와 통하지 않는 부도체를 구별하고 전기 안전 수칙을 지킨다.",
    keywords: ["도체", "부도체", "절연체", "전기 안전"],
    mappedTopicIds: ["mt_NzCNuABT3E"]
  },
  {
    code: "[6과02-03]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "생명과 지구 (지구과학)",
    statement: "지구의 자전과 공전 모형을 통해 낮과 밤의 반복과 계절의 변화를 설명할 수 있다.",
    keywords: ["지구 자전", "지구 공전", "낮과 밤", "계절의 변화"],
    mappedTopicIds: ["mt_LKagN9GJPX"]
  },
  {
    code: "[6과04-01]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "물질과 에너지 (화학)",
    statement: "온도에 따른 용질의 용해도 변화를 관찰하고, 용액의 진하기를 비교할 수 있다.",
    keywords: ["용해", "용해도", "용질", "용매", "용액"],
    mappedTopicIds: ["mt_0_K-GrKQpd"]
  },
  {
    code: "[6과06-01]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "생명과 지구 (생물)",
    statement: "생태계의 생물 요소(생산자, 소비자, 분해자)와 비생물 요소의 상호작용 및 먹이사슬을 이해한다.",
    keywords: ["생태계", "생산자", "소비자", "분해자", "먹이사슬"],
    mappedTopicIds: ["mt_AylKwhbDWM", "mt_PYPs2yD2sn"]
  },
  {
    code: "[6과07-01]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "생명과 지구 (생물)",
    statement: "빛과 이산화탄소, 물을 이용하여 잎에서 광합성이 일어나 녹말이 생성됨을 설명할 수 있다.",
    keywords: ["광합성", "엽록체", "녹말", "빛", "이산화탄소", "산소"],
    mappedTopicIds: ["mt_PYPs2yD2sn", "mt_3-ii06P4YS"]
  },
  {
    code: "[6과07-02]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "생명과 지구 (생물)",
    statement: "뿌리에서 흡수한 물이 줄기를 거쳐 잎으로 이동하고 증산 작용에 의해 방출됨을 설명할 수 있다.",
    keywords: ["증산 작용", "뿌리", "줄기", "잎", "물 이동"],
    mappedTopicIds: ["mt_3-ii06P4YS", "mt_8VA40Tumth"]
  },
  {
    code: "[6과08-01]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "생명과 지구 (생물)",
    statement: "소화계, 순환계, 호흡계, 배설계의 구조와 기능을 설명하고 각 기관의 유기적 관계를 이해한다.",
    keywords: ["소화계", "순환계", "호흡계", "배설계", "기관계"],
    mappedTopicIds: ["mt_YSyjTZfjvv", "mt_2x-EwdBsgl"]
  },
  {
    code: "[6과08-03]",
    subject: "과학",
    gradeCluster: "초등 5~6학년군",
    domain: "생명과 지구 (생물)",
    statement: "운동과 균형 잡힌 식습관, 유해 약물 예방 등 건강한 생활 습관의 중요성을 설명할 수 있다.",
    keywords: ["건강 습관", "식습관", "운동", "약물 예방"],
    mappedTopicIds: ["mt_2x-EwdBsgl"]
  },

  // ----------------------------------------------------
  // 실과 (컴퓨팅 / SW): 초등 5~6학년군 (6실)
  // ----------------------------------------------------
  {
    code: "[6실04-01]",
    subject: "실과(컴퓨팅)",
    gradeCluster: "초등 5~6학년군",
    domain: "소프트웨어와 프로그래밍",
    statement: "실생활의 문제를 해결하는 절차를 탐색하고, 알고리즘(순차, 선택, 반복)으로 설계할 수 있다.",
    keywords: ["알고리즘", "순차", "선택", "반복", "절차적 사고", "문제 해결"],
    mappedTopicIds: ["mt__p5n8z5soJ", "mt_iqmt8wL26h"]
  },
  {
    code: "[6실04-02]",
    subject: "실과(컴퓨팅)",
    gradeCluster: "초등 5~6학년군",
    domain: "소프트웨어와 프로그래밍",
    statement: "블록 기반 프로그래밍 도구의 기초 기능을 익혀 간단한 프로그램을 작성할 수 있다.",
    keywords: ["블록 코딩", "프로그래밍 기초", "스크래치", "첫 프로그램"],
    mappedTopicIds: ["mt_sPV503BQnI"]
  },
  {
    code: "[6실04-03]",
    subject: "실과(컴퓨팅)",
    gradeCluster: "초등 5~6학년군",
    domain: "소프트웨어와 프로그래밍",
    statement: "순차, 선택, 반복 구조를 활용하여 실생활 문제를 해결하는 프로그램을 작성할 수 있다.",
    keywords: ["제어 구조", "순차 구조", "선택 구조", "반복 구조", "조건문", "루프"],
    mappedTopicIds: ["mt_6XbAmdmjDb", "mt_nfGAtwqSvP", "mt_XXpEz9tyu6"]
  },
  {
    code: "[6실04-04]",
    subject: "실과(컴퓨팅)",
    gradeCluster: "초등 5~6학년군",
    domain: "소프트웨어와 프로그래밍",
    statement: "작성한 프로그램을 검사하고 오류를 발견하여 수정(디버깅)할 수 있다.",
    keywords: ["디버깅", "오류 수정", "테스트", "버그"],
    mappedTopicIds: ["mt_5UtPmgdoQ9"]
  },
  {
    code: "[6실04-05]",
    subject: "실과(컴퓨팅)",
    gradeCluster: "초등 5~6학년군",
    domain: "소프트웨어와 프로그래밍",
    statement: "인공지능과 소프트웨어가 사회에 미치는 긍정적·부정적 영향을 이해하고 정보 윤리를 실천한다.",
    keywords: ["정보 윤리", "인공지능 윤리", "소프트웨어 사회 영향"],
    mappedTopicIds: ["mt__p5n8z5soJ"]
  }
];

/**
 * Korea 2022 Curriculum Adapter
 */
export class Korea2022CurriculumAdapter {
  /**
   * @param {Object} [options]
   * @param {import('./TaxonomyGraphEngine.mjs').TaxonomyGraphEngine} [options.graphEngine]
   */
  constructor(options = {}) {
    this.graphEngine = options.graphEngine || null;
    this.standardsByCode = new Map();
    this.topicToStandards = new Map();

    this.initIndexes();
  }

  setGraphEngine(engine) {
    this.graphEngine = engine;
  }

  initIndexes() {
    this.standardsByCode.clear();
    this.topicToStandards.clear();

    for (const std of KOREA_2022_STANDARDS) {
      // Normal code e.g. "[4수01-07]"
      this.standardsByCode.set(std.code, std);
      // Stripped code e.g. "4수01-07"
      const bareCode = std.code.replace(/[[\]]/g, "");
      this.standardsByCode.set(bareCode, std);

      // Map topics back to standards
      for (const tid of std.mappedTopicIds) {
        if (!this.topicToStandards.has(tid)) {
          this.topicToStandards.set(tid, []);
        }
        this.topicToStandards.get(tid).push(std.code);
      }
    }
  }

  /**
   * Normalizes standard code (e.g. "4수01-07" -> "[4수01-07]")
   */
  normalizeCode(code = "") {
    const trimmed = code.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      return trimmed;
    }
    return `[${trimmed}]`;
  }

  /**
   * Returns standard info and mapped micro-topics.
   * @param {string} code e.g. "[4수01-07]" or "4수01-07"
   * @returns {Object|null}
   */
  getKoreanStandard(code) {
    if (!code) return null;
    const cleanCode = code.trim();
    const rawStd = this.standardsByCode.get(cleanCode) || 
                   this.standardsByCode.get(this.normalizeCode(cleanCode));

    if (!rawStd) return null;

    let mappedTopics = [];
    if (this.graphEngine) {
      mappedTopics = rawStd.mappedTopicIds.map(tid => {
        const topic = this.graphEngine.getTopic(tid);
        return topic || { id: tid, name: "Topic Unresolved" };
      });
    } else {
      mappedTopics = rawStd.mappedTopicIds.map(tid => ({ id: tid }));
    }

    return {
      ...rawStd,
      mappedTopics,
      mappedTopicsCount: mappedTopics.length
    };
  }

  /**
   * Bidirectional Korean-English terminology translation.
   * @param {string} term
   * @returns {Object|null}
   */
  translateTerm(term = "") {
    const trimmed = term.trim();
    // Direct Korean key lookup
    if (KOREAN_TERMINOLOGY_DICTIONARY[trimmed]) {
      return {
        korean: trimmed,
        ...KOREAN_TERMINOLOGY_DICTIONARY[trimmed]
      };
    }

    // Reverse lookup by English
    const lower = trimmed.toLowerCase();
    for (const [ko, val] of Object.entries(KOREAN_TERMINOLOGY_DICTIONARY)) {
      if (val.en.toLowerCase() === lower || val.en.toLowerCase().includes(lower)) {
        return {
          korean: ko,
          ...val
        };
      }
    }

    return null;
  }

  /**
   * Searches Korean standards or Marble micro-topics by Korean term or standard code.
   * Essential for Korean elementary teachers looking up curriculum resources.
   *
   * @param {string} query
   * @param {Object} [options]
   * @param {number} [options.limit=20]
   * @returns {Object}
   */
  searchByKoreanStandardOrKeyword(query = "", { limit = 20 } = {}) {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return { query, standards: [], topics: [], matchedTerms: [] };
    }

    const lowerQuery = cleanQuery.toLowerCase();
    const matchedStandards = [];
    const matchedTerms = [];
    const matchedTopicIds = new Set();

    // 1. Check if direct standard code lookup
    const normalizedCode = this.normalizeCode(cleanQuery);
    if (this.standardsByCode.has(cleanQuery) || this.standardsByCode.has(normalizedCode)) {
      const std = this.getKoreanStandard(cleanQuery) || this.getKoreanStandard(normalizedCode);
      if (std) {
        matchedStandards.push(std);
        for (const tid of std.mappedTopicIds) {
          matchedTopicIds.add(tid);
        }
      }
    }

    // 2. Search standards by Korean keyword in statement, domain, or keywords
    for (const std of KOREA_2022_STANDARDS) {
      if (matchedStandards.some(s => s.code === std.code)) continue;

      const codeMatch = std.code.toLowerCase().includes(lowerQuery);
      const statementMatch = std.statement.toLowerCase().includes(lowerQuery);
      const domainMatch = std.domain.toLowerCase().includes(lowerQuery);
      const keywordMatch = std.keywords.some(k => k.toLowerCase().includes(lowerQuery));

      if (codeMatch || statementMatch || domainMatch || keywordMatch) {
        matchedStandards.push(this.getKoreanStandard(std.code));
        for (const tid of std.mappedTopicIds) {
          matchedTopicIds.add(tid);
        }
      }
    }

    // 3. Search terminology dictionary for concept translations
    for (const [ko, meta] of Object.entries(KOREAN_TERMINOLOGY_DICTIONARY)) {
      if (ko.includes(cleanQuery) || meta.en.toLowerCase().includes(lowerQuery)) {
        matchedTerms.push({
          korean: ko,
          english: meta.en,
          domain: meta.domain,
          subject: meta.subject
        });
      }
    }

    // 4. Resolve micro-topics from graph engine
    let topics = [];
    if (this.graphEngine) {
      // Direct mapped topics from matched standards
      for (const tid of matchedTopicIds) {
        const top = this.graphEngine.getTopic(tid);
        if (top) topics.push(top);
      }

      // If terminology matched, search taxonomy by English terms
      for (const term of matchedTerms) {
        const searchHits = this.graphEngine.searchTopics(term.english, {
          subject: term.subject,
          limit: 10
        });
        for (const hit of searchHits) {
          if (!topics.some(t => t.id === hit.id)) {
            topics.push(hit);
          }
        }
      }
    } else {
      // Return stub objects with IDs
      topics = Array.from(matchedTopicIds).map(id => ({ id }));
    }

    const slicedStandards = matchedStandards.slice(0, limit);
    const slicedTopics = topics.slice(0, limit);

    return {
      query: cleanQuery,
      standards: slicedStandards,
      standardsCount: matchedStandards.length,
      topics: slicedTopics,
      topicsCount: topics.length,
      matchedTerms
    };
  }

  /**
   * Reverse mapping: Given a Marble topicId, finds the Korean standard(s) it addresses.
   * @param {string} topicId
   * @returns {Array<Object>}
   */
  mapTopicToStandards(topicId) {
    const codes = this.topicToStandards.get(topicId) || [];
    return codes.map(c => this.getKoreanStandard(c));
  }
}

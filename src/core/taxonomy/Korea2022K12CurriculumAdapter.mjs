/**
 * Korea 2022 Revised K-12 Curriculum Adapter
 *
 * Bridges the Korean Ministry of Education 2022 Revised Curriculum from Grade 1 to 12
 * (초등학교 1학년 ~ 고등학교 3학년) across Elementary (ES), Middle (MS), and High School (HS),
 * aligning Korean National Standards with cognitive developmental stages (Piaget)
 * and spiral prerequisite graphs.
 */

import { KOREAN_TERMINOLOGY_DICTIONARY, KOREA_2022_STANDARDS } from "./Korea2022CurriculumAdapter.mjs";

/**
 * Expanded K-12 Terminology Localization Dictionary (초·중·고 연계 용어 사전)
 */
export const K12_TERMINOLOGY_DICTIONARY = Object.freeze({
  ...Object.fromEntries(
    Object.entries(KOREAN_TERMINOLOGY_DICTIONARY).map(([k, v]) => [k, { ...v, schoolLevel: v.schoolLevel || "ES" }])
  ),

  // 중학교 수학 (MS Mathematics)
  "소인수": { en: "Prime Factor", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "MS" },
  "소인수분해": { en: "Prime Factorization", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "MS" },
  "정수": { en: "Integers", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "MS" },
  "유리수": { en: "Rational Numbers", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "MS" },
  "절댓값": { en: "Absolute Value", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "MS" },
  "순환소수": { en: "Repeating Decimals", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "MS" },
  "제곱근": { en: "Square Root", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "MS" },
  "무리수": { en: "Irrational Numbers", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "MS" },
  "실수": { en: "Real Numbers", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "MS" },
  "문자와 식": { en: "Variables & Expressions", domain: "Algebra", subject: "Mathematics", schoolLevel: "MS" },
  "일차방정식": { en: "Linear Equation", domain: "Algebra", subject: "Mathematics", schoolLevel: "MS" },
  "연립방정식": { en: "System of Linear Equations", domain: "Algebra", subject: "Mathematics", schoolLevel: "MS" },
  "연립일차방정식": { en: "System of Linear Equations", domain: "Algebra", subject: "Mathematics", schoolLevel: "MS" },
  "일차부등식": { en: "Linear Inequality", domain: "Algebra", subject: "Mathematics", schoolLevel: "MS" },
  "이차방정식": { en: "Quadratic Equation", domain: "Algebra", subject: "Mathematics", schoolLevel: "MS" },
  "인수분해": { en: "Factorization", domain: "Algebra", subject: "Mathematics", schoolLevel: "MS" },
  "근의 공식": { en: "Quadratic Formula", domain: "Algebra", subject: "Mathematics", schoolLevel: "MS" },
  "좌표평면": { en: "Coordinate Plane", domain: "Functions", subject: "Mathematics", schoolLevel: "MS" },
  "순서쌍": { en: "Ordered Pair", domain: "Functions", subject: "Mathematics", schoolLevel: "MS" },
  "기울기": { en: "Slope / Gradient", domain: "Functions", subject: "Mathematics", schoolLevel: "MS" },
  "절편": { en: "Intercept", domain: "Functions", subject: "Mathematics", schoolLevel: "MS" },
  "일차함수": { en: "Linear Function", domain: "Functions", subject: "Mathematics", schoolLevel: "MS" },
  "이차함수": { en: "Quadratic Function", domain: "Functions", subject: "Mathematics", schoolLevel: "MS" },
  "피타고라스": { en: "Pythagorean Theorem", domain: "Geometry", subject: "Mathematics", schoolLevel: "MS" },
  "피타고라스 정리": { en: "Pythagorean Theorem", domain: "Geometry", subject: "Mathematics", schoolLevel: "MS" },
  "삼각비": { en: "Trigonometric Ratios", domain: "Geometry", subject: "Mathematics", schoolLevel: "MS" },
  "닮음": { en: "Similarity", domain: "Geometry", subject: "Mathematics", schoolLevel: "MS" },
  "상자그림": { en: "Box Plot", domain: "Statistics & Probability", subject: "Mathematics", schoolLevel: "MS" },
  "사분위수": { en: "Quartiles", domain: "Statistics & Probability", subject: "Mathematics", schoolLevel: "MS" },
  "산포도": { en: "Measures of Dispersion", domain: "Statistics & Probability", subject: "Mathematics", schoolLevel: "MS" },
  "표준편차": { en: "Standard Deviation", domain: "Statistics & Probability", subject: "Mathematics", schoolLevel: "MS" },
  "분산": { en: "Variance", domain: "Statistics & Probability", subject: "Mathematics", schoolLevel: "MS" },

  // 중학교 과학 (MS Science)
  "상태변화": { en: "Changes of State", domain: "Matter & Materials", subject: "Science", schoolLevel: "MS" },
  "빛과 파동": { en: "Light & Waves", domain: "Waves, Light & Sound", subject: "Science", schoolLevel: "MS" },
  "기권과 날씨": { en: "Atmosphere & Weather", domain: "Earth's Systems", subject: "Science", schoolLevel: "MS" },
  "동물과 에너지": { en: "Animals & Energy", domain: "Organisms & Life Processes", subject: "Science", schoolLevel: "MS" },
  "비열": { en: "Specific Heat", domain: "Energy", subject: "Science", schoolLevel: "MS" },
  "열팽창": { en: "Thermal Expansion", domain: "Energy", subject: "Science", schoolLevel: "MS" },
  "역학적 에너지": { en: "Mechanical Energy", domain: "Energy", subject: "Science", schoolLevel: "MS" },
  "감수분열": { en: "Meiosis", domain: "Genetics & Reproduction", subject: "Science", schoolLevel: "MS" },
  "멘델 유전": { en: "Mendelian Inheritance", domain: "Genetics & Reproduction", subject: "Science", schoolLevel: "MS" },
  "질량 보존 법칙": { en: "Law of Conservation of Mass", domain: "Chemical Reactions", subject: "Science", schoolLevel: "MS" },
  "일정 성분비 법칙": { en: "Law of Definite Proportions", domain: "Chemical Reactions", subject: "Science", schoolLevel: "MS" },

  // 고등학교 수학 (HS Mathematics - 공통수학, 대수, 미적분)
  "다항식": { en: "Polynomial", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "나머지정리": { en: "Remainder Theorem", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "조립제법": { en: "Synthetic Division", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "복소수": { en: "Complex Numbers", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "판별식": { en: "Discriminant", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "행렬": { en: "Matrix", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "행렬 연산": { en: "Matrix Operations", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "평면좌표": { en: "Coordinate Geometry", domain: "Geometry", subject: "Mathematics", schoolLevel: "HS" },
  "직선의 방정식": { en: "Equation of a Line", domain: "Geometry", subject: "Mathematics", schoolLevel: "HS" },
  "원의 방정식": { en: "Equation of a Circle", domain: "Geometry", subject: "Mathematics", schoolLevel: "HS" },
  "집합": { en: "Set", domain: "Logic & Sets", subject: "Mathematics", schoolLevel: "HS" },
  "명제": { en: "Proposition / Logic", domain: "Logic & Sets", subject: "Mathematics", schoolLevel: "HS" },
  "합성함수": { en: "Composite Function", domain: "Functions", subject: "Mathematics", schoolLevel: "HS" },
  "역함수": { en: "Inverse Function", domain: "Functions", subject: "Mathematics", schoolLevel: "HS" },
  "지수와 로그": { en: "Exponents & Logarithms", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "상용로그": { en: "Common Logarithm", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "삼각함수": { en: "Trigonometric Functions", domain: "Functions", subject: "Mathematics", schoolLevel: "HS" },
  "호도법": { en: "Radian Measure", domain: "Functions", subject: "Mathematics", schoolLevel: "HS" },
  "수열": { en: "Sequences & Series", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "등차수열": { en: "Arithmetic Progression", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "등비수열": { en: "Geometric Progression", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "수학적 귀납법": { en: "Mathematical Induction", domain: "Algebra", subject: "Mathematics", schoolLevel: "HS" },
  "극한": { en: "Limit", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "수열의 극한": { en: "Limit of a Sequence", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "함수의 극한": { en: "Limit of a Function", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "연속": { en: "Continuity", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "미분계수": { en: "Differential Coefficient", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "순간변화율": { en: "Instantaneous Rate of Change", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "도함수": { en: "Derivative", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "접선의 방정식": { en: "Tangent Line Equation", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "극대와 극소": { en: "Local Maxima & Minima", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "부정적분": { en: "Indefinite Integral", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "정적분": { en: "Definite Integral", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "정적분의 넓이": { en: "Area by Definite Integral", domain: "Calculus", subject: "Mathematics", schoolLevel: "HS" },
  "벡터": { en: "Vector", domain: "Geometry & Vectors", subject: "Mathematics", schoolLevel: "HS" },

  // 고등학교 과학 / 물리 / 인공지능 (HS Science / Physics / AI)
  "뉴턴 역학": { en: "Newtonian Mechanics", domain: "Forces & Motion", subject: "Science", schoolLevel: "HS" },
  "뉴턴 운동 법칙": { en: "Newton's Laws of Motion", domain: "Forces & Motion", subject: "Science", schoolLevel: "HS" },
  "운동량과 충격량": { en: "Momentum & Impulse", domain: "Forces & Motion", subject: "Science", schoolLevel: "HS" },
  "전자기 유도": { en: "Electromagnetic Induction", domain: "Electromagnetism", subject: "Science", schoolLevel: "HS" },
  "패러데이 법칙": { en: "Faraday's Law", domain: "Electromagnetism", subject: "Science", schoolLevel: "HS" },
  "파동의 간섭": { en: "Wave Interference", domain: "Waves & Optics", subject: "Science", schoolLevel: "HS" },
  "광전 효과": { en: "Photoelectric Effect", domain: "Quantum Physics", subject: "Science", schoolLevel: "HS" },
  "인공지능": { en: "Artificial Intelligence", domain: "Artificial Intelligence", subject: "Computing", schoolLevel: "MS" },
  "머신러닝": { en: "Machine Learning", domain: "Artificial Intelligence", subject: "Computing", schoolLevel: "HS" },
  "지도학습": { en: "Supervised Learning", domain: "Artificial Intelligence", subject: "Computing", schoolLevel: "HS" },
  "비지도학습": { en: "Unsupervised Learning", domain: "Artificial Intelligence", subject: "Computing", schoolLevel: "HS" },
  "강화학습": { en: "Reinforcement Learning", domain: "Artificial Intelligence", subject: "Computing", schoolLevel: "HS" },
  "손실함수": { en: "Loss Function", domain: "Artificial Intelligence", subject: "Computing", schoolLevel: "HS" },

  // 국어과 (Korean)
  "자모": { en: "Consonants and Vowels", domain: "Korean Orthography", subject: "Korean", schoolLevel: "ES" },
  "음절": { en: "Syllable", domain: "Korean Phonology", subject: "Korean", schoolLevel: "ES" },
  "문장 성분": { en: "Sentence Components", domain: "Korean Grammar", subject: "Korean", schoolLevel: "ES" },
  "띄어쓰기": { en: "Word Spacing", domain: "Korean Orthography", subject: "Korean", schoolLevel: "ES" },
  "주어": { en: "Subject", domain: "Korean Grammar", subject: "Korean", schoolLevel: "ES" },
  "서술어": { en: "Predicate", domain: "Korean Grammar", subject: "Korean", schoolLevel: "ES" },
  "목적어": { en: "Object", domain: "Korean Grammar", subject: "Korean", schoolLevel: "ES" },
  "보어": { en: "Complement", domain: "Korean Grammar", subject: "Korean", schoolLevel: "MS" },
  "품사": { en: "Parts of Speech", domain: "Korean Grammar", subject: "Korean", schoolLevel: "MS" },
  "체언": { en: "Substantives", domain: "Korean Grammar", subject: "Korean", schoolLevel: "MS" },
  "용언": { en: "Predicates", domain: "Korean Grammar", subject: "Korean", schoolLevel: "MS" },
  "음운 변동": { en: "Phonological Alternation", domain: "Korean Phonology", subject: "Korean", schoolLevel: "MS" },
  "비음화": { en: "Nasalization", domain: "Korean Phonology", subject: "Korean", schoolLevel: "MS" },
  "구개음화": { en: "Palatalization", domain: "Korean Phonology", subject: "Korean", schoolLevel: "MS" },
  "유음화": { en: "Lateralization", domain: "Korean Phonology", subject: "Korean", schoolLevel: "MS" },
  "설명문": { en: "Expository Text", domain: "Korean Reading", subject: "Korean", schoolLevel: "MS" },
  "논설문": { en: "Persuasive / Argumentative Essay", domain: "Korean Reading", subject: "Korean", schoolLevel: "MS" },
  "담화 표지": { en: "Discourse Marker", domain: "Korean Discourse", subject: "Korean", schoolLevel: "HS" },
  "훈민정음": { en: "Hunminjeongeum", domain: "History of Korean Language", subject: "Korean", schoolLevel: "HS" },
  "중세국어": { en: "Middle Korean", domain: "History of Korean Language", subject: "Korean", schoolLevel: "HS" },
  "문학 비평": { en: "Literary Criticism", domain: "Korean Literature", subject: "Korean", schoolLevel: "HS" },
  "사실적 독해": { en: "Literal Comprehension", domain: "Korean Reading", subject: "Korean", schoolLevel: "ES" },
  "추론적 독해": { en: "Inferential Comprehension", domain: "Korean Reading", subject: "Korean", schoolLevel: "ES" },
  "비판적 독해": { en: "Critical Reading", domain: "Korean Reading", subject: "Korean", schoolLevel: "MS" },

  // 수학과 추가 (Mathematics - Additional)
  "어림하기": { en: "Estimation", domain: "Number & Operation", subject: "Mathematics", schoolLevel: "ES" },
  "경우의 수": { en: "Number of Cases", domain: "Probability & Statistics", subject: "Mathematics", schoolLevel: "MS" },
  "순열": { en: "Permutation", domain: "Probability & Statistics", subject: "Mathematics", schoolLevel: "HS" },
  "조합": { en: "Combination", domain: "Probability & Statistics", subject: "Mathematics", schoolLevel: "HS" },
  "조건부확률": { en: "Conditional Probability", domain: "Probability & Statistics", subject: "Mathematics", schoolLevel: "HS" },
  "독립사건": { en: "Independent Events", domain: "Probability & Statistics", subject: "Mathematics", schoolLevel: "HS" },
  "정규분포": { en: "Normal Distribution", domain: "Probability & Statistics", subject: "Mathematics", schoolLevel: "HS" },
  "이차곡선": { en: "Conic Sections", domain: "Geometry", subject: "Mathematics", schoolLevel: "HS" },
  "포물선": { en: "Parabola", domain: "Geometry", subject: "Mathematics", schoolLevel: "HS" },
  "타원": { en: "Ellipse", domain: "Geometry", subject: "Mathematics", schoolLevel: "HS" },
  "쌍곡선": { en: "Hyperbola", domain: "Geometry", subject: "Mathematics", schoolLevel: "HS" },

  // 영어과 (English)
  "파닉스": { en: "Phonics", domain: "English Reading", subject: "English", schoolLevel: "ES" },
  "알파벳": { en: "Alphabet", domain: "English Basics", subject: "English", schoolLevel: "ES" },
  "인칭대명사": { en: "Personal Pronoun", domain: "English Grammar", subject: "English", schoolLevel: "ES" },
  "be동사": { en: "Be Verb", domain: "English Grammar", subject: "English", schoolLevel: "ES" },
  "일반동사": { en: "Action Verb", domain: "English Grammar", subject: "English", schoolLevel: "ES" },
  "5형식": { en: "Five Sentence Patterns", domain: "English Grammar", subject: "English", schoolLevel: "MS" },
  "현재완료": { en: "Present Perfect Tense", domain: "English Grammar", subject: "English", schoolLevel: "MS" },
  "관계대명사": { en: "Relative Pronoun", domain: "English Grammar", subject: "English", schoolLevel: "MS" },
  "관계부사": { en: "Relative Adverb", domain: "English Grammar", subject: "English", schoolLevel: "MS" },
  "접속사": { en: "Conjunction", domain: "English Grammar", subject: "English", schoolLevel: "MS" },
  "가정법": { en: "Subjunctive Mood", domain: "English Grammar", subject: "English", schoolLevel: "HS" },
  "분사구문": { en: "Participle Clause", domain: "English Grammar", subject: "English", schoolLevel: "HS" },
  "구문 독해": { en: "Syntax-based Reading Comprehension", domain: "English Reading", subject: "English", schoolLevel: "HS" },
  "빈칸 추론": { en: "Cloze Inference", domain: "English Reading", subject: "English", schoolLevel: "HS" },
  "패러프레이징": { en: "Paraphrasing", domain: "English Writing", subject: "English", schoolLevel: "HS" },

  // 사회·역사과 (Social Studies / History / Geography / Civics / Economics)
  "방위표": { en: "Compass Rose", domain: "Geography", subject: "Social Studies", schoolLevel: "ES" },
  "축척": { en: "Map Scale", domain: "Geography", subject: "Social Studies", schoolLevel: "ES" },
  "시장 경제": { en: "Market Economy", domain: "Economics", subject: "Social Studies", schoolLevel: "ES" },
  "수요와 공급": { en: "Supply and Demand", domain: "Economics", subject: "Social Studies", schoolLevel: "MS" },
  "균형 가격": { en: "Equilibrium Price", domain: "Economics", subject: "Social Studies", schoolLevel: "MS" },
  "삼국 시대": { en: "Three Kingdoms of Korea", domain: "Korean History", subject: "History", schoolLevel: "MS" },
  "대한민국 임시정부": { en: "Provisional Government of the Republic of Korea", domain: "Modern Korean History", subject: "History", schoolLevel: "MS" },
  "분배적 정의": { en: "Distributive Justice", domain: "Civics & Ethics", subject: "Social Studies", schoolLevel: "HS" },
  "헌법": { en: "Constitution", domain: "Law & Politics", subject: "Social Studies", schoolLevel: "HS" },
  "기본권": { en: "Fundamental Human Rights", domain: "Law & Politics", subject: "Social Studies", schoolLevel: "HS" },
  "환율": { en: "Exchange Rate", domain: "Macroeconomics", subject: "Economics", schoolLevel: "HS" },
  "이자율": { en: "Interest Rate", domain: "Macroeconomics", subject: "Economics", schoolLevel: "HS" },
  "인플레이션": { en: "Inflation", domain: "Macroeconomics", subject: "Economics", schoolLevel: "HS" },
  "사회문화 현상": { en: "Sociocultural Phenomena", domain: "Sociology", subject: "Social Studies", schoolLevel: "HS" },
  "양적 연구": { en: "Quantitative Research", domain: "Sociology", subject: "Social Studies", schoolLevel: "HS" },

  // 도덕·윤리과 (Moral Education / Ethics)
  "도덕적 배려": { en: "Moral Caring", domain: "Moral Principles", subject: "Ethics", schoolLevel: "ES" },
  "공정성": { en: "Fairness", domain: "Moral Principles", subject: "Ethics", schoolLevel: "ES" },
  "생명 존중": { en: "Reverence for Life", domain: "Bioethics", subject: "Ethics", schoolLevel: "ES" },
  "도덕적 자아": { en: "Moral Self-Identity", domain: "Personal Ethics", subject: "Ethics", schoolLevel: "MS" },
  "사회 정의": { en: "Social Justice", domain: "Social Ethics", subject: "Ethics", schoolLevel: "MS" },
  "응용윤리": { en: "Applied Ethics", domain: "Applied Ethics", subject: "Ethics", schoolLevel: "HS" },
  "생명의료윤리": { en: "Bioethics", domain: "Applied Ethics", subject: "Ethics", schoolLevel: "HS" },
  "의무론": { en: "Deontology", domain: "Ethical Theories", subject: "Ethics", schoolLevel: "HS" },
  "공리주의": { en: "Utilitarianism", domain: "Ethical Theories", subject: "Ethics", schoolLevel: "HS" },
  "롤스의 정의론": { en: "Rawls' Theory of Justice", domain: "Political Philosophy", subject: "Ethics", schoolLevel: "HS" },
  "무지의 베일": { en: "Veil of Ignorance", domain: "Political Philosophy", subject: "Ethics", schoolLevel: "HS" },

  // 과학과 추가 (Science - Chemistry, Biology, Earth Science)
  "몰": { en: "Mole (Unit)", domain: "Chemistry", subject: "Science", schoolLevel: "HS" },
  "아보가드로수": { en: "Avogadro's Number", domain: "Chemistry", subject: "Science", schoolLevel: "HS" },
  "중화 반응": { en: "Neutralization Reaction", domain: "Chemistry", subject: "Science", schoolLevel: "HS" },
  "산화 환원": { en: "Redox Reaction", domain: "Chemistry", subject: "Science", schoolLevel: "HS" },
  "세포 호흡": { en: "Cellular Respiration", domain: "Biology", subject: "Science", schoolLevel: "HS" },
  "판 구조론": { en: "Plate Tectonics", domain: "Earth Science", subject: "Science", schoolLevel: "HS" },
  "대륙 이동설": { en: "Continental Drift", domain: "Earth Science", subject: "Science", schoolLevel: "HS" },

  // 정보·기술·AI과 (Informatics, Tech, AI)
  "추상화": { en: "Abstraction", domain: "Computational Thinking", subject: "Computing", schoolLevel: "MS" },
  "문제 분해": { en: "Decomposition", domain: "Computational Thinking", subject: "Computing", schoolLevel: "MS" },
  "자료구조": { en: "Data Structure", domain: "Computer Science", subject: "Computing", schoolLevel: "HS" },
  "스택": { en: "Stack", domain: "Computer Science", subject: "Computing", schoolLevel: "HS" },
  "큐": { en: "Queue", domain: "Computer Science", subject: "Computing", schoolLevel: "HS" },
  "시간 복잡도": { en: "Time Complexity", domain: "Computer Science", subject: "Computing", schoolLevel: "HS" },
  "기술 혁신": { en: "Technological Innovation", domain: "Technology Systems", subject: "Technology", schoolLevel: "MS" },
  "지식 재산권": { en: "Intellectual Property", domain: "Technology Systems", subject: "Technology", schoolLevel: "MS" },

  // 체육·음악·미술 (Arts & Physical Education)
  "기본 움직임": { en: "Fundamental Movement Skills", domain: "Movement", subject: "Physical Education", schoolLevel: "ES" },
  "이동 기술": { en: "Locomotor Skills", domain: "Movement", subject: "Physical Education", schoolLevel: "ES" },
  "영역형 경쟁": { en: "Invasion Games", domain: "Sports", subject: "Physical Education", schoolLevel: "MS" },
  "네트형 경쟁": { en: "Net/Wall Games", domain: "Sports", subject: "Physical Education", schoolLevel: "MS" },
  "운동 생리학": { en: "Exercise Physiology", domain: "Health", subject: "Physical Education", schoolLevel: "HS" },
  "계이름": { en: "Solfège / Syllable Names", domain: "Music Basics", subject: "Music", schoolLevel: "ES" },
  "다장조": { en: "C Major", domain: "Music Theory", subject: "Music", schoolLevel: "ES" },
  "3화음": { en: "Triad Chord", domain: "Harmony", subject: "Music", schoolLevel: "MS" },
  "화성 진행": { en: "Chord Progression", domain: "Harmony", subject: "Music", schoolLevel: "MS" },
  "악곡 분석": { en: "Musical Analysis", domain: "Music History & Analysis", subject: "Music", schoolLevel: "HS" },
  "대위법": { en: "Counterpoint", domain: "Music Composition", subject: "Music", schoolLevel: "HS" },
  "조형 요소": { en: "Elements of Art", domain: "Visual Arts", subject: "Visual Arts", schoolLevel: "ES" },
  "원근법": { en: "Perspective", domain: "Visual Arts", subject: "Visual Arts", schoolLevel: "MS" },
  "투시원근법": { en: "Linear Perspective", domain: "Visual Arts", subject: "Visual Arts", schoolLevel: "MS" },
  "조형 원리": { en: "Principles of Design", domain: "Visual Arts", subject: "Visual Arts", schoolLevel: "MS" },
  "현대 미술 비평": { en: "Contemporary Art Criticism", domain: "Art Criticism", subject: "Visual Arts", schoolLevel: "HS" },
  "시각문화": { en: "Visual Culture", domain: "Visual Arts", subject: "Visual Arts", schoolLevel: "HS" }
});

/**
 * Elementary additions to bridge [1수01-01] and [3과01-01]
 */
const ELEMENTARY_ADDITIONS = [
  {
    code: "[1수01-01]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "수와 연산",
    statement: "0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.",
    keywords: ["0과 100까지의 수", "수 세기", "수 읽기", "수 쓰기"],
    mappedTopicIds: ["mt_b3f9sJ3-L1", "mt_lMz9nAs7VO"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[3과01-01]",
    subject: "과학",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초3",
    domain: "생명과 지구 (생물)",
    statement: "여러 가지 동물의 생김새와 특징을 관찰하고 서식지에 따른 특징을 비교할 수 있다.",
    keywords: ["동물의 특징", "생김새", "서식지", "동물 관찰"],
    mappedTopicIds: ["mt_xT6jPzyj92"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[2국01-01]",
    subject: "국어",
    schoolLevel: "ES",
    gradeCluster: "초등 1~2학년군",
    grade: "초1",
    domain: "문해력과 기초 국어",
    statement: "한글 자모의 이름과 소리값을 알고 낱말을 바르게 읽고 쓴다.",
    keywords: ["한글 자모", "낱말", "글자 읽기", "낱말 쓰기", "자음과 모음"],
    mappedTopicIds: ["mt_b3f9sJ3-L1"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[4국02-01]",
    subject: "국어",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초3",
    domain: "문법과 문장",
    statement: "문장의 기본 성분을 알고 문장 부호와 띄어쓰기를 바르게 하여 글을 쓴다.",
    keywords: ["문장 성분", "띄어쓰기", "문장 부호", "주어", "서술어"],
    mappedTopicIds: ["mt_jY7uf0Cb7o"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[6국03-02]",
    subject: "국어",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초5",
    domain: "읽기와 독해",
    statement: "글의 구조(문단)를 파악하고 사실적 독해와 추론적 독해를 바탕으로 주제를 파악한다.",
    keywords: ["문단", "사실적 독해", "추론적 독해", "주제 파악", "중심 생각"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[4수01-03]",
    subject: "수학",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초3",
    domain: "수와 연산",
    statement: "세 자리 수의 덧셈과 뺄셈의 계산 원리를 이해하고 어림과 정확한 계산을 수행할 수 있다.",
    keywords: ["세 자리 수 덧셈", "세 자리 수 뺄셈", "받아올림", "받아내림", "어림하기"],
    mappedTopicIds: ["mt_ehGS_uVSJv"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[4영01-01]",
    subject: "영어",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초3",
    domain: "파닉스와 낱말",
    statement: "알파벳 글자의 이름과 소리를 식별하고 기초적인 낱말을 소리 내어 읽는다.",
    keywords: ["알파벳 소리", "파닉스", "기초 낱말 읽기", "음소 인식"],
    mappedTopicIds: ["mt_b3f9sJ3-L1"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[6영02-02]",
    subject: "영어",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초5",
    domain: "문장과 표현",
    statement: "일상생활에 관한 기초 문장 표현과 인칭대명사, 기본 시제를 활용하여 표현한다.",
    keywords: ["기초 문장 표현", "인칭대명사", "be동사", "일반동사 현재형"],
    mappedTopicIds: ["mt_jY7uf0Cb7o"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[4사01-01]",
    subject: "사회",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초3",
    domain: "지리 인식",
    statement: "우리 고장의 모습을 살펴보고 지도에서 방위표, 기호, 범례, 축척을 읽는 방법을 익힌다.",
    keywords: ["우리 고장", "지도 읽기", "방위표", "기호와 범례", "축척"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[6사02-01]",
    subject: "사회",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초5",
    domain: "경제 생활",
    statement: "우리나라의 경제 성장 과정과 시장의 역할, 가계와 기업의 경제 활동을 이해한다.",
    keywords: ["경제 성장", "시장 경제", "가계", "기업", "합리적 선택"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[6사03-02]",
    subject: "사회",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초6",
    domain: "역사 탐구",
    statement: "조선 후기 사회 변혁과 실학사상, 서민 문화의 발달 및 주요 인물의 활동을 탐구한다.",
    keywords: ["조선 후기", "사회 변혁", "실학", "서민 문화", "역사 인물"],
    mappedTopicIds: ["mt_18fK9sQdIz"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[4도01-01]",
    subject: "도덕",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초3",
    domain: "자신과의 관계 / 타인과의 관계",
    statement: "타인에 대한 도덕적 배려의 중요성을 깨닫고 학교와 사회의 규칙을 성실히 준수한다.",
    keywords: ["도덕적 배려", "규칙 준수", "배려와 존중", "정직", "공동체 규범"],
    mappedTopicIds: ["mt_b3f9sJ3-L1"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[6도02-02]",
    subject: "도덕",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초5",
    domain: "사회·공동체 / 자연과의 관계",
    statement: "공정성의 의미를 알고 생명 존중 및 자연과의 공존을 위한 도덕적 실천 의지를 기른다.",
    keywords: ["공정성", "생명 존중", "자연과의 공존", "도덕적 실천", "정의감"],
    mappedTopicIds: ["mt_jY7uf0Cb7o"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[4체01-01]",
    subject: "체육",
    schoolLevel: "ES",
    gradeCluster: "초등 3~4학년군",
    grade: "초3",
    domain: "신체활동과 움직임",
    statement: "달리기, 도약하기 등 기본 움직임과 이동 기술을 익히고 신체 조절 능력을 기른다.",
    keywords: ["기본 움직임", "이동 기술", "비이동 움직임", "신체 협응", "운동 기초"],
    mappedTopicIds: ["mt_b3f9sJ3-L1"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[6음01-01]",
    subject: "음악",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초5",
    domain: "음악 표현",
    statement: "기본 리듬 패턴과 다장조 계이름을 읽고 정확한 음정으로 노래 부르거나 악기를 연주한다.",
    keywords: ["리듬", "계이름", "다장조", "가창", "악기 연주", "음높이"],
    mappedTopicIds: ["mt_jY7uf0Cb7o"],
    piagetStage: "Concrete Operational"
  },
  {
    code: "[6미01-01]",
    subject: "미술",
    schoolLevel: "ES",
    gradeCluster: "초등 5~6학년군",
    grade: "초5",
    domain: "조형과 표현",
    statement: "점, 선, 면, 색, 형태 등 기본 조형 요소를 탐색하고 자신의 느낌과 생각을 창의적으로 표현한다.",
    keywords: ["조형 요소", "점·선·면", "색상과 명도", "형태", "창의적 표현"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Concrete Operational"
  }
];

/**
 * Middle School (MS, 중1~3) Standards
 */
const MIDDLE_SCHOOL_STANDARDS = [
  // ----------------------------------------------------
  // 중학교 수학: 9수01 (수와 연산: 소인수분해, 정수와 유리수)
  // ----------------------------------------------------
  {
    code: "[9수01-01]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "소인수분해의 뜻을 알고, 자연수를 소인수분해할 수 있다.",
    keywords: ["소인수", "소수", "합성수", "거듭제곱", "소인수분해"],
    mappedTopicIds: ["mt_FP-mjXaq3B", "mt_18fK9sQdIz"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-02]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "소인수분해를 이용하여 최대공약수와 최소공배수를 구할 수 있다.",
    keywords: ["최대공약수", "최소공배수", "소인수분해 활용", "공약수", "공배수"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-03]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "양의 정수, 음의 정수, 0의 개념을 이해하고, 정수를 분류할 수 있다.",
    keywords: ["양의 정수", "음의 정수", "정수", "부호", "0"],
    mappedTopicIds: ["mt_jY7uf0Cb7o"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-04]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "유리수의 개념을 이해하고, 수직선 위에 정수와 유리수를 나타낼 수 있다.",
    keywords: ["유리수", "수직선", "분수 표현", "양의 유리수", "음의 유리수"],
    mappedTopicIds: ["mt_SXbZ3bC9z7", "mt_NaqEP8xDhZ"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-05]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "정수와 유리수의 절댓값의 뜻을 알고, 수의 대소 관계를 판단할 수 있다.",
    keywords: ["절댓값", "대소 관계", "부등호"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-06]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "정수와 유리수의 덧셈과 뺄셈의 계산 원리를 이해하고 계산할 수 있다.",
    keywords: ["정수 덧셈", "정수 뺄셈", "유리수 덧셈", "유리수 뺄셈"],
    mappedTopicIds: ["mt_ehGS_uVSJv", "mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-07]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "덧셈의 교환법칙과 결합법칙을 이해하고 이를 활용하여 계산할 수 있다.",
    keywords: ["교환법칙", "결합법칙", "덧셈 법칙"],
    mappedTopicIds: ["mt_ehGS_uVSJv"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-08]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "정수와 유리수의 곱셈과 나눗셈의 원리를 이해하고 계산할 수 있다.",
    keywords: ["정수 곱셈", "유리수 곱셈", "역수", "정수 나눗셈"],
    mappedTopicIds: ["mt_18fK9sQdIz"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-09]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "곱셈의 교환법칙, 결합법칙, 분배법칙을 이해하고 이를 계산에 적용할 수 있다.",
    keywords: ["분배법칙", "곱셈 법칙", "전개"],
    mappedTopicIds: ["mt_18fK9sQdIz"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-10]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "수와 연산",
    statement: "정수와 유리수의 사칙혼합계산을 능숙하게 수행할 수 있다.",
    keywords: ["사칙혼합계산", "연산 순서", "거듭제곱 계산"],
    mappedTopicIds: ["mt_18fK9sQdIz", "mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-11]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "수와 연산",
    statement: "유리수와 순환소수의 관계를 이해하고, 분수를 유한소수나 순환소수로 판별할 수 있다.",
    keywords: ["유한소수", "무한소수", "순환소수", "순환마디"],
    mappedTopicIds: ["mt_YzM5goBctT", "mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-12]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "수와 연산",
    statement: "순환소수를 분수로 나타내어 순환소수가 유리수임을 설명할 수 있다.",
    keywords: ["순환소수 분수 변환", "순환소수 표현"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-13]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "수와 연산",
    statement: "제곱근의 뜻과 성질을 이해하고, 무리수의 개념을 안다.",
    keywords: ["제곱근", "근호", "루트", "무리수", "실수"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수01-14]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "수와 연산",
    statement: "근호를 포함한 식의 사칙계산을 할 수 있다.",
    keywords: ["근호 계산", "분모의 유리화", "제곱근 사칙연산"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 수학: 9수02 (문자와 식: 일차방정식, 부등식, 이차방정식, 인수분해)
  // ----------------------------------------------------
  {
    code: "[9수02-01]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "문자와 식",
    statement: "문자를 사용하여 구체적인 상황을 식으로 나타낼 수 있다.",
    keywords: ["문자와 식", "곱셈 기호 생략", "나눗셈 기호 생략"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-02]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "문자와 식",
    statement: "식의 값을 구할 수 있고 일차식의 의미를 이해한다.",
    keywords: ["식의 값", "대입", "일차식", "항", "계수", "상수항"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-03]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "문자와 식",
    statement: "일차식의 덧셈과 뺄셈의 원리를 이해하고 계산할 수 있다.",
    keywords: ["동류항", "일차식 덧셈", "일차식 뺄셈"],
    mappedTopicIds: ["mt_ehGS_uVSJv"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-04]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "문자와 식",
    statement: "일차방정식과 그 해의 의미를 알고, 등식의 성질을 이용하여 일차방정식을 풀 수 있다.",
    keywords: ["방정식", "방정식의 해", "등식의 성질", "이항", "일차방정식"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-05]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "문자와 식",
    statement: "미지수가 2개인 연립일차방정식을 풀고 실생활 문제를 해결할 수 있다.",
    keywords: ["연립방정식", "가감법", "대입법", "연립일차방정식"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-06]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "문자와 식",
    statement: "다항식의 곱셈 공식과 인수분해의 의미를 알고, 기본 공식을 활용할 수 있다.",
    keywords: ["곱셈 공식", "인수분해", "공통인수", "완전제곱식"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-07]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "문자와 식",
    statement: "다항식의 인수분해를 이용하여 복합적인 식을 변형할 수 있다.",
    keywords: ["인수분해 활용", "치환 인수분해", "복잡한 식"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-08]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "문자와 식",
    statement: "부등식과 그 해의 의미를 알고, 부등식의 기본 성질을 이해한다.",
    keywords: ["부등식", "부등식의 해", "부등식의 성질"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-09]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "문자와 식",
    statement: "일차부등식을 풀고 그 해를 수직선 위에 나타낼 수 있다.",
    keywords: ["일차부등식", "부등식 풀이", "부등식 수직선"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-10]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "문자와 식",
    statement: "이차방정식과 그 해의 의미를 이해한다.",
    keywords: ["이차방정식", "이차방정식의 해", "근"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-11]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "문자와 식",
    statement: "인수분해를 이용하여 이차방정식을 풀 수 있다.",
    keywords: ["인수분해 이차방정식", "중근"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-12]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "문자와 식",
    statement: "제곱근과 완전제곱식을 이용하여 이차방정식을 풀고 근의 공식을 유도할 수 있다.",
    keywords: ["완전제곱식", "근의 공식", "제곱근 풀이"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수02-13]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "문자와 식",
    statement: "이차방정식을 활용하여 실생활 문제를 해결할 수 있다.",
    keywords: ["이차방정식 활용", "실생활 문제"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 수학: 9수03 (함수: 좌표평면, 일차함수, 이차함수)
  // ----------------------------------------------------
  {
    code: "[9수03-01]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "함수",
    statement: "순서쌍과 좌표평면을 이해하고, 점의 좌표를 나타낼 수 있다.",
    keywords: ["순서쌍", "좌표평면", "x축", "y축", "원점", "사분면"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수03-02]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "함수",
    statement: "다양한 상황을 그래프로 나타내고, 그래프의 형태를 해석할 수 있다.",
    keywords: ["그래프 해석", "변화율", "상황 그래프"],
    mappedTopicIds: ["mt_ebQURBOsM5", "mt_gTI7MuS-y8"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수03-03]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "함수",
    statement: "일차함수의 의미를 알고, 그 그래프의 기울기와 절편을 이해한다.",
    keywords: ["일차함수", "기울기", "x절편", "y절편", "변화율"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수03-04]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "함수",
    statement: "일차함수 y=ax+b의 그래프의 성질을 알고 평행이동을 설명할 수 있다.",
    keywords: ["일차함수 그래프", "평행이동", "직선의 기울기"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수03-05]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "함수",
    statement: "일차함수의 식을 구하고 실생활 문제를 해결할 수 있다.",
    keywords: ["일차함수 식 구하기", "실생활 일차함수"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수03-06]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "함수",
    statement: "일차함수와 일차방정식의 관계를 좌표평면 상에서 이해한다.",
    keywords: ["일차함수와 일차방정식", "직선의 방정식", "교점의 좌표"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수03-07]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "함수",
    statement: "이차함수의 의미를 알고 y=ax^2의 그래프의 성질을 이해한다.",
    keywords: ["이차함수", "포물선", "꼭짓점", "축의 방정식"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수03-08]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "함수",
    statement: "이차함수 y=a(x-p)^2+q의 그래프를 그리고 그 성질을 설명할 수 있다.",
    keywords: ["이차함수 표준형", "평행이동", "꼭짓점 좌표", "축"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 수학: 9수04 (기하: 합동, 닮음, 피타고라스 정리, 삼각비)
  // ----------------------------------------------------
  {
    code: "[9수04-01]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "기하",
    statement: "점, 선, 면, 각의 기본 성질과 평행선의 동위각, 엇각을 이해한다.",
    keywords: ["평행선", "동위각", "엇각", "교각"],
    mappedTopicIds: ["mt_TdV9YGJEoY"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-02]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "기하",
    statement: "삼각형의 작도와 합동 조건(SSS, SAS, ASA)을 이해하고 판별할 수 있다.",
    keywords: ["삼각형 작도", "삼각형 합동", "SSS", "SAS", "ASA"],
    mappedTopicIds: ["mt_fEuoBYw6bU"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-03]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "기하",
    statement: "다각형의 내각과 외각의 크기의 합을 구할 수 있다.",
    keywords: ["다각형 내각", "다각형 외각"],
    mappedTopicIds: ["mt_fEuoBYw6bU"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-04]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "기하",
    statement: "부채꼴의 중심각과 호의 길이, 넓이 사이의 관계를 이해하고 계산할 수 있다.",
    keywords: ["부채꼴", "호의 길이", "부채꼴 넓이", "원주율"],
    mappedTopicIds: ["mt_b4lbTOJYwI"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-05]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "기하",
    statement: "기둥과 뿔의 겉넓이와 부피를 구할 수 있다.",
    keywords: ["입체도형 겉넓이", "입체도형 부피", "기둥과 뿔"],
    mappedTopicIds: ["mt_n0AlyLQwC9"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-06]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "기하",
    statement: "이등변삼각형의 성질과 직각삼각형의 합동 조건(RHS, RHA)을 설명할 수 있다.",
    keywords: ["이등변삼각형", "직각삼각형 합동", "RHS", "RHA"],
    mappedTopicIds: ["mt_fEuoBYw6bU"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-07]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "기하",
    statement: "삼각형의 외심과 내심의 성질을 이해하고 활용할 수 있다.",
    keywords: ["외심", "내심", "외접원", "내접원"],
    mappedTopicIds: ["mt_fEuoBYw6bU"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-08]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "기하",
    statement: "평행사변형과 여러 가지 사각형의 성질을 설명할 수 있다.",
    keywords: ["평행사변형", "직사각형", "마름모", "정사각형", "사다리꼴"],
    mappedTopicIds: ["mt_fEuoBYw6bU"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-09]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "기하",
    statement: "도형의 닮음의 뜻과 삼각형의 닮음 조건(AA, SAS, SSS)을 이해한다.",
    keywords: ["닮음", "닮음비", "삼각형 닮음", "AA 닮음"],
    mappedTopicIds: ["mt_fEuoBYw6bU"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-10]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "기하",
    statement: "피타고라스 정리를 이해하고 다양한 방법으로 증명할 수 있다.",
    keywords: ["피타고라스", "피타고라스 정리", "직각삼각형", "빗변"],
    mappedTopicIds: ["mt_TdV9YGJEoY"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-11]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "기하",
    statement: "피타고라스 정리를 활용하여 직각삼각형의 변의 길이를 구할 수 있다.",
    keywords: ["피타고라스 활용", "변의 길이"],
    mappedTopicIds: ["mt_TdV9YGJEoY"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수04-12]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "기하",
    statement: "삼각비(사인, 코사인, 탄젠트)의 뜻을 알고 특수각의 삼각비를 계산할 수 있다.",
    keywords: ["삼각비", "사인", "코사인", "탄젠트", "sin", "cos", "tan"],
    mappedTopicIds: ["mt_TdV9YGJEoY"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 수학: 9수05 (확률과 통계: 도수분포, 확률, 대푯값, 상자그림)
  // ----------------------------------------------------
  {
    code: "[9수05-01]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "확률과 통계",
    statement: "줄기와 잎 그림, 도수분포표를 작성하고 자료를 해석할 수 있다.",
    keywords: ["줄기와 잎 그림", "도수분포표", "계급", "도수"],
    mappedTopicIds: ["mt_BdAeZJUOir"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수05-02]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "확률과 통계",
    statement: "히스토그램과 도수분포다각형을 그리고 자료의 분포 상태를 파악할 수 있다.",
    keywords: ["히스토그램", "도수분포다각형"],
    mappedTopicIds: ["mt_BdAeZJUOir"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수05-03]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "확률과 통계",
    statement: "상대도수를 구하고 그 분포를 그래프로 나타내어 비교할 수 있다.",
    keywords: ["상대도수", "상대도수 분포"],
    mappedTopicIds: ["mt_BdAeZJUOir"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수05-04]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "확률과 통계",
    statement: "사건과 경우의 수의 개념을 이해하고 합과 곱의 법칙을 적용할 수 있다.",
    keywords: ["경우의 수", "사건", "합의 법칙", "곱의 법칙"],
    mappedTopicIds: ["mt_BdAeZJUOir"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수05-05]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "확률과 통계",
    statement: "확률의 기본 성질을 이해하고 간단한 확률을 계산할 수 있다.",
    keywords: ["확률", "확률의 계산", "확률의 성질"],
    mappedTopicIds: ["mt_BdAeZJUOir"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수05-06]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "확률과 통계",
    statement: "대푯값(평균, 중앙값, 최빈값)의 뜻을 알고 상황에 적절한 대푯값을 선택할 수 있다.",
    keywords: ["대푯값", "평균", "중앙값", "최빈값"],
    mappedTopicIds: ["mt_BdAeZJUOir"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수05-07]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "확률과 통계",
    statement: "산포도(분산, 표준편차)의 뜻을 알고 이를 구하여 자료의 흩어짐을 비교할 수 있다.",
    keywords: ["산포도", "분산", "표준편차", "편차"],
    mappedTopicIds: ["mt_BdAeZJUOir"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9수05-08]",
    subject: "수학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "확률과 통계",
    statement: "사분위수와 상자그림(box plot)을 작성하여 자료의 분포를 종합적으로 해석할 수 있다.",
    keywords: ["상자그림", "사분위수", "box plot", "최댓값", "최솟값"],
    mappedTopicIds: ["mt_BdAeZJUOir"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 과학: 9과01 ~ 9과10 (물질, 빛과 파동, 기권, 생명, 에너지, 화학반응)
  // ----------------------------------------------------
  {
    code: "[9과01-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "물질의 상태변화",
    statement: "물질의 세 가지 상태와 상태 변화(융해, 응고, 기화, 액화, 승화)를 입자 모형으로 설명할 수 있다.",
    keywords: ["상태변화", "융해", "응고", "기화", "액화", "승화", "입자 모형"],
    mappedTopicIds: ["mt_LKagN9GJPX"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과02-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "빛과 파동",
    statement: "빛의 합성, 거울과 렌즈에 의한 상의 관찰을 통해 빛의 성질을 설명할 수 있다.",
    keywords: ["빛의 합성", "평면거울", "볼록렌즈", "오목렌즈", "상"],
    mappedTopicIds: ["mt_NzCNuABT3E"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과02-02]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "빛과 파동",
    statement: "파동의 발생과 전파, 소리의 3요소(세기, 높낮이, 맵시)를 파동의 특징과 관련지을 수 있다.",
    keywords: ["파동", "진폭", "진동수", "파장", "소리의 3요소"],
    mappedTopicIds: ["mt__00ZSLnB7p"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과03-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "기권과 날씨",
    statement: "기권의 층상 구조(대류권, 성층권, 중간권, 열권)와 대기 순환의 기본 원리를 설명할 수 있다.",
    keywords: ["기권", "대류권", "성층권", "오존층", "대기 순환"],
    mappedTopicIds: ["mt_LKagN9GJPX"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과03-02]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "기권과 날씨",
    statement: "구름의 생성과 강수 과정, 기압과 날씨 변화를 기상 관측 자료로 해석할 수 있다.",
    keywords: ["구름 생성", "상대 습도", "강수", "기압", "날씨"],
    mappedTopicIds: ["mt_LKagN9GJPX"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과04-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "식물과 광합성",
    statement: "광합성과 호흡의 관계를 이해하고, 광합성에 영향을 주는 환경 요인을 탐구할 수 있다.",
    keywords: ["광합성", "식물 호흡", "엽록체", "빛의 세기", "이산화탄소 농도"],
    mappedTopicIds: ["mt_PYPs2yD2sn", "mt_3-ii06P4YS"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과04-02]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "식물과 광합성",
    statement: "증산 작용의 역할과 기공의 구조 및 개폐 원리를 설명할 수 있다.",
    keywords: ["증산 작용", "기공", "공변세포", "수분 상승"],
    mappedTopicIds: ["mt_3-ii06P4YS"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과05-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "동물과 에너지",
    statement: "소화, 순환, 호흡, 배설 기관계의 구조와 작용을 통해 에너지를 얻는 과정을 설명할 수 있다.",
    keywords: ["소화계", "순환계", "호흡계", "배설계", "세포 호흡", "ATP"],
    mappedTopicIds: ["mt_YSyjTZfjvv"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과05-02]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "동물과 에너지",
    statement: "각 기관계의 통합적 작용과 항상성 유지의 중요성을 이해한다.",
    keywords: ["기관계 통합", "에너지 대사", "항상성"],
    mappedTopicIds: ["mt_YSyjTZfjvv"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과06-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "물질의 특성",
    statement: "물질의 고유한 특성인 밀도, 녹는점, 끓는점, 용해도를 이해하고 물질을 구별할 수 있다.",
    keywords: ["물질의 특성", "밀도", "녹는점", "끓는점", "용해도"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과06-02]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "물질의 특성",
    statement: "물질의 특성 차이를 이용하여 다양한 혼합물을 분리할 수 있다.",
    keywords: ["혼합물 분리", "분별증류", "재결정", "추출", "크로마토그래피"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과07-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "열과 비열",
    statement: "열의 이동(전도, 대류, 복사)과 비열의 개념을 알고 열용량과 온도 변화를 정량적으로 계산할 수 있다.",
    keywords: ["열 이동", "전도", "대류", "복사", "비열", "열용량"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과07-02]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "열과 비열",
    statement: "물질의 열팽창 현상을 입자 운동과 관련지어 설명할 수 있다.",
    keywords: ["열팽창", "바이메탈", "온도 변화"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과08-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "운동과 에너지",
    statement: "속력의 개념을 알고, 등속 직선 운동과 자유 낙하 운동의 특징을 비교할 수 있다.",
    keywords: ["속력", "등속 직선 운동", "자유 낙하", "중력 가속도"],
    mappedTopicIds: ["mt_NNNbPccwB4"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과08-02]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "운동과 에너지",
    statement: "과학에서의 일과 역학적 에너지(운동에너지, 위치에너지) 보존 법칙을 정량적으로 설명할 수 있다.",
    keywords: ["일", "역학적 에너지", "운동에너지", "위치에너지", "역학적 에너지 보존"],
    mappedTopicIds: ["mt_NNNbPccwB4"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과09-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "생식과 유전",
    statement: "체세포분열과 감수분열의 특징을 비교하고 생식세포 형성 과정을 설명할 수 있다.",
    keywords: ["체세포분열", "감수분열", "생식세포", "염색체"],
    mappedTopicIds: ["mt_YSyjTZfjvv"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과09-02]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "생식과 유전",
    statement: "멘델의 유전 원리(분리의 법칙, 독립의 법칙)를 이해하고 사람의 유전 형질 분석에 적용할 수 있다.",
    keywords: ["멘델 유전", "분리의 법칙", "독립의 법칙", "유전자형", "표현형"],
    mappedTopicIds: ["mt_YSyjTZfjvv"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과10-01]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "화학반응의 규칙성",
    statement: "물리 변화와 화학 변화를 물질의 입자 배열 관점에서 구별할 수 있다.",
    keywords: ["물리 변화", "화학 변화", "원자 배열", "새로운 물질"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과10-02]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "화학반응의 규칙성",
    statement: "화학 반응식으로 화학 반응을 나타내고, 질량 보존 법칙을 확인할 수 있다.",
    keywords: ["화학 반응식", "질량 보존 법칙", "계수 맞추기"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9과10-06]",
    subject: "과학",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "화학반응의 규칙성",
    statement: "일정 성분비 법칙과 기체 반응 법칙을 이해하고, 화학 반응 시의 에너지 출입을 설명할 수 있다.",
    keywords: ["일정 성분비 법칙", "기체 반응 법칙", "발열 반응", "흡열 반응"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 정보: 9정01 ~ 9정04 (컴퓨팅 시스템, 자료와 정보, 알고리즘/프로그래밍, AI)
  // ----------------------------------------------------
  {
    code: "[9정01-01]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "컴퓨팅 시스템",
    statement: "컴퓨팅 시스템의 하드웨어와 소프트웨어의 상호작용 및 동작 원리를 설명할 수 있다.",
    keywords: ["컴퓨팅 시스템", "하드웨어", "소프트웨어", "입출력 장치"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 국어: 9국
  // ----------------------------------------------------
  {
    code: "[9국01-02]",
    subject: "국어",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "문법",
    statement: "품사의 분류 기준과 각 품사의 특성을 이해하고 국어 생활에 적용한다.",
    keywords: ["품사의 분류와 특성", "품사", "체언", "용언", "수식언", "관계언", "독립언"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9국02-03]",
    subject: "국어",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "문법",
    statement: "음운의 체계를 이해하고 음운의 변동 규칙(비음화, 유음화, 구개음화 등)을 탐구한다.",
    keywords: ["음운의 변동", "음운 체계", "비음화", "유음화", "구개음화", "표준 발음"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9국03-01]",
    subject: "국어",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "읽기",
    statement: "설명문과 논설문의 구조적 특성을 파악하고 사실과 의견, 타당성과 공정성을 비판적으로 독해한다.",
    keywords: ["설명문과 논설문의 비판적 독해", "설명문", "논설문", "비판적 독해", "논증 구조"],
    mappedTopicIds: ["mt_18fK9sQdIz"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 영어: 9영
  // ----------------------------------------------------
  {
    code: "[9영01-03]",
    subject: "영어",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "문법과 문형",
    statement: "기본 5형식 문형의 구조와 기본 시제(현재, 과거, 미래, 현재완료)의 의미를 이해하고 문장을 구성한다.",
    keywords: ["기본 5형식 문형과 시제", "5형식", "문장 형식", "현재완료", "시제"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9영02-02]",
    subject: "영어",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "문법과 연결어",
    statement: "접속사와 관계대명사를 활용하여 복합 문장을 구성하고 문장 간의 논리적 연결 관계를 파악한다.",
    keywords: ["접속사와 관계대명사", "관계대명사", "접속사", "관계부사", "복문"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9영03-01]",
    subject: "영어",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "독해와 담화",
    statement: "다양한 주제의 단락을 읽고 주제, 요지, 중심 생각을 정확히 파악한다.",
    keywords: ["단락 독해와 주제 파악", "단락 독해", "주제 파악", "요지 추론", "중심 생각"],
    mappedTopicIds: ["mt_18fK9sQdIz"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 사회·역사: 9사, 9역
  // ----------------------------------------------------
  {
    code: "[9사01-01]",
    subject: "사회",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "지리",
    statement: "자연환경(기후, 지형)의 특성과 인간 생활의 상호작용을 파악하고 세계 주요 지역의 생활 양식을 비교한다.",
    keywords: ["자연환경과 인간 생활", "자연환경", "기후", "지형", "인간 생활"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9사05-02]",
    subject: "사회",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "경제",
    statement: "시장에서 수요 법칙과 공급 법칙에 의해 시장 가격이 결정되고 변동하는 원리를 그래프로 설명한다.",
    keywords: ["시장 가격의 결정과 변동", "수요와 공급", "균형 가격", "수요 곡선", "공급 곡선"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9역01-03]",
    subject: "역사",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "한국사",
    statement: "고조선과 삼국 및 가야, 남북국 시대의 성립과 발전 등 고대 한국사의 전개 과정을 파악한다.",
    keywords: ["고대 한국사의 전개", "고대 한국사", "삼국 시대", "고구려", "백제", "신라", "통일신라", "발해"],
    mappedTopicIds: ["mt_18fK9sQdIz"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9역04-02]",
    subject: "역사",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "한국사",
    statement: "조선 사회의 변혁과 개항 이후 근대화 운동, 일제 강점기 독립운동과 대한민국 정부 수립의 근현대사를 종합한다.",
    keywords: ["조선 사회와 근현대사", "조선 사회", "근현대사", "개항", "독립운동", "대한민국 정부 수립"],
    mappedTopicIds: ["mt_18fK9sQdIz"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 도덕: 9도
  // ----------------------------------------------------
  {
    code: "[9도01-01]",
    subject: "도덕",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "자신과의 관계",
    statement: "도덕적 자아정체성을 확립하고 타자와의 관계에서 공감과 도덕적 갈등 해결 능력을 함양한다.",
    keywords: ["도덕적 자아와 타자 관계", "도덕적 자아", "타자 관계", "공감", "자아정체성"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9도03-02]",
    subject: "도덕",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "사회·국가·지구공동체",
    statement: "사회 정의의 요청과 평화의 소중함을 인식하고 인권 보장과 정의로운 공동체 실현에 동참한다.",
    keywords: ["사회 정의와 평화", "사회 정의", "평화", "인권", "정의로운 사회"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 기술·가정: 9기
  // ----------------------------------------------------
  {
    code: "[9기01-02]",
    subject: "기술·가정",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "기술 시스템",
    statement: "발명과 기술 혁신의 과정을 이해하고 지식 재산권 보호와 창의적 문제 해결을 위한 공학 설계를 수행한다.",
    keywords: ["발명과 기술 혁신", "발명", "기술 혁신", "지식 재산권", "특허", "공학 설계"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },

  // ----------------------------------------------------
  // 중학교 체육·음악·미술: 9체, 9음, 9미
  // ----------------------------------------------------
  {
    code: "[9체02-01]",
    subject: "체육",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "스포츠와 경쟁",
    statement: "네트형 및 영역형 스포츠의 경기 규칙과 공간 창출, 협동 전술을 적용하여 경기에 참여한다.",
    keywords: ["네트형/영역형 스포츠 전술", "네트형 스포츠", "영역형 스포츠", "스포츠 전술", "포메이션"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9음02-01]",
    subject: "음악",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "음악 요소와 개념",
    statement: "다장조 및 단조 음계의 구조를 이해하고 주요 3화음(I, IV, V)의 화성 진행을 분석한다.",
    keywords: ["3화음과 다장조/단조 음계", "3화음", "다장조", "단조 음계", "화성 진행", "코드"],
    mappedTopicIds: ["mt_SXbZ3bC9z7"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9미02-01]",
    subject: "미술",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "조형 원리와 공간",
    statement: "투시원근법, 비례, 균형 등 조형 원리를 이해하고 3차원 공간감과 입체감을 표현한다.",
    keywords: ["원근법과 비례의 조형 원리", "원근법", "비례", "조형 원리", "투시도", "공간감"],
    mappedTopicIds: ["mt_18fK9sQdIz"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9정01-02]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "컴퓨팅 시스템",
    statement: "유무선 네트워크와 인터넷의 기본 동작 원리 및 프로토콜을 이해한다.",
    keywords: ["네트워크", "인터넷", "프로토콜", "IP 주소"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9정02-01]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중1",
    domain: "자료와 정보",
    statement: "문자, 수, 그림, 소리 등 다양한 자료의 2진 디지털 표현 방법을 이해한다.",
    keywords: ["이진수", "디지털 표현", "비트와 바이트", "자료 인코딩"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9정02-02]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "자료와 정보",
    statement: "빅데이터의 특징과 가치를 이해하고 데이터를 구조화하여 분석할 수 있다.",
    keywords: ["빅데이터", "데이터 구조화", "데이터 분석", "시각화"],
    mappedTopicIds: ["mt_BdAeZJUOir"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9정03-01]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "알고리즘과 프로그래밍",
    statement: "문제 해결을 위해 알고리즘을 설계하고 순서도나 의사코드로 명확히 표현할 수 있다.",
    keywords: ["알고리즘 설계", "순서도", "의사코드", "추상화"],
    mappedTopicIds: ["mt__p5n8z5soJ", "mt_iqmt8wL26h"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9정03-02]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "알고리즘과 프로그래밍",
    statement: "텍스트 기반 프로그래밍 언어의 변수, 자료형, 연산자를 사용하여 코드를 작성할 수 있다.",
    keywords: ["텍스트 프로그래밍", "변수", "자료형", "연산자"],
    mappedTopicIds: ["mt_sPV503BQnI"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9정03-03]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중2",
    domain: "알고리즘과 프로그래밍",
    statement: "순차, 선택, 반복 구조를 활용하여 제어 흐름을 설계하고 프로그램을 구현할 수 있다.",
    keywords: ["제어구조", "순차", "선택구조(if)", "반복구조(for/while)"],
    mappedTopicIds: ["mt_6XbAmdmjDb", "mt_nfGAtwqSvP", "mt_XXpEz9tyu6"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9정03-04]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "알고리즘과 프로그래밍",
    statement: "함수를 정의하고 호출하여 코드를 모듈화하고 재사용할 수 있다.",
    keywords: ["함수", "매개변수", "반환값", "모듈화"],
    mappedTopicIds: ["mt_sPV503BQnI"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9정04-01]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "인공지능 기초",
    statement: "인공지능의 기본 개념과 원리를 알고 규칙 기반 및 데이터 기반 학습의 차이를 설명할 수 있다.",
    keywords: ["인공지능 기초", "머신러닝 개념", "지능형 시스템"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Early Formal Operational"
  },
  {
    code: "[9정04-06]",
    subject: "정보",
    schoolLevel: "MS",
    gradeCluster: "중학교 1~3학년군",
    grade: "중3",
    domain: "인공지능 기초",
    statement: "인공지능 윤리와 사회적 영향(편향성, 프라이버시)을 이해하고 책임 있는 디지털 시민성을 실천한다.",
    keywords: ["인공지능 윤리", "알고리즘 편향", "디지털 시민성"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Early Formal Operational"
  }
];

/**
 * High School (HS, 고1~3) Standards
 */
const HIGH_SCHOOL_STANDARDS = [
  // ----------------------------------------------------
  // 고등학교 수학: 10공수1 (공통수학1: 다항식, 복소수, 이차방정식, 이차함수, 행렬)
  // ----------------------------------------------------
  {
    code: "[10공수1-01]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "다항식",
    statement: "다항식의 사칙연산을 수행하고 곱셈 공식을 활용하여 식을 전개할 수 있다.",
    keywords: ["다항식 연산", "곱셈 공식", "식의 전개"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수1-02]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "다항식",
    statement: "항등식의 성질을 이해하고, 나머지정리와 인수정리, 조립제법을 활용하여 다항식을 나눌 수 있다.",
    keywords: ["나머지정리", "인수정리", "조립제법", "항등식"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수1-03]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "다항식",
    statement: "다양한 다항식의 인수분해 공식을 이해하고 복잡한 다항식을 인수분해할 수 있다.",
    keywords: ["인수분해", "고차식 인수분해", "인수분해 공식"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수1-04]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "방정식과 부등식",
    statement: "복소수의 뜻과 연산을 이해하고, 이차방정식의 판별식과 근과 계수의 관계를 설명할 수 있다.",
    keywords: ["복소수", "허수", "켤레복소수", "판별식", "근과 계수의 관계"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수1-05]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "방정식과 부등식",
    statement: "이차함수의 그래프와 직선의 위치 관계를 이해하고, 이차함수의 최대·최소를 구할 수 있다.",
    keywords: ["이차함수와 직선", "이차함수 최대최소", "접선"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수1-06]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "행렬",
    statement: "행렬의 개념을 알고 행렬의 덧셈, 뺄셈, 실수배, 곱셈 연산을 수행할 수 있다.",
    keywords: ["행렬", "행렬의 덧셈", "행렬의 곱셈", "단위행렬"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 수학: 10공수2 (공통수학2: 평면좌표, 직선, 원, 집합과 명제, 함수)
  // ----------------------------------------------------
  {
    code: "[10공수2-01]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "도형의 방정식",
    statement: "좌표평면에서 두 점 사이의 거리와 선분의 내분점, 외분점을 구할 수 있다.",
    keywords: ["평면좌표", "두 점 사이의 거리", "내분점", "외분점"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수2-02]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "도형의 방정식",
    statement: "직선의 방정식을 구하고, 두 직선의 평행과 수직 조건 및 점과 직선 사이의 거리를 계산할 수 있다.",
    keywords: ["직선의 방정식", "기울기", "수직 조건", "점과 직선 사이의 거리"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수2-03]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "도형의 방정식",
    statement: "원의 방정식을 구하고 원과 직선의 위치 관계 및 접선의 방정식을 해결할 수 있다.",
    keywords: ["원의 방정식", "접선의 방정식", "현의 길이"],
    mappedTopicIds: ["mt_b4lbTOJYwI"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수2-04]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "도형의 방정식",
    statement: "도형의 평행이동과 대칭이동을 좌표와 방정식으로 나타낼 수 있다.",
    keywords: ["평행이동", "대칭이동", "x축 대칭", "원점 대칭"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수2-05]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "집합과 명제",
    statement: "집합의 연산과 명제의 참·거짓, 조건과 진리집합, 필요충분조건을 판별할 수 있다.",
    keywords: ["집합", "명제", "필요충분조건", "역과 대우", "귀류법"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10공수2-06]",
    subject: "공통수학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "함수",
    statement: "함수의 정의와 일대일대응을 이해하고 합성함수와 역함수를 구할 수 있다.",
    keywords: ["함수", "일대일대응", "합성함수", "역함수"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 수학: 12대수 (대수: 지수와 로그, 삼각함수, 수열)
  // ----------------------------------------------------
  {
    code: "[12대수01-01]",
    subject: "대수",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "지수함수와 로그함수",
    statement: "거듭제곱과 거듭제곱근의 뜻을 알고 지수의 범위를 유리수와 실수로 확장할 수 있다.",
    keywords: ["거듭제곱근", "지수의 확장", "지수법칙"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12대수01-02]",
    subject: "대수",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "지수함수와 로그함수",
    statement: "로그의 뜻과 성질을 이해하고 상용로그를 활용할 수 있다.",
    keywords: ["로그", "로그 성질", "상용로그", "밑 변환"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12대수01-03]",
    subject: "대수",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "지수함수와 로그함수",
    statement: "지수함수와 로그함수의 그래프를 그리고 그 성질을 설명할 수 있다.",
    keywords: ["지수함수", "로그함수", "점근선", "역함수 관계"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12대수02-01]",
    subject: "대수",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "삼각함수",
    statement: "일반각과 호도법의 뜻을 알고 삼각함수(sin, cos, tan)의 정의를 설명할 수 있다.",
    keywords: ["일반각", "호도법", "라디안", "삼각함수"],
    mappedTopicIds: ["mt_TdV9YGJEoY"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12대수02-02]",
    subject: "대수",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "삼각함수",
    statement: "삼각함수의 그래프를 그리고 주기와 최대·최소를 구할 수 있다.",
    keywords: ["삼각함수 그래프", "주기", "진폭", "삼각방정식"],
    mappedTopicIds: ["mt_TdV9YGJEoY"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12대수03-01]",
    subject: "대수",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "수열",
    statement: "등차수열의 뜻을 알고 일반항과 등차수열의 첫째항부터 제n항까지의 합을 구할 수 있다.",
    keywords: ["등차수열", "공차", "등차수열의 합"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12대수03-02]",
    subject: "대수",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "수열",
    statement: "등비수열의 뜻을 알고 일반항과 등비수열의 합을 구할 수 있다.",
    keywords: ["등비수열", "공비", "등비수열의 합"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12대수03-08]",
    subject: "대수",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "수열",
    statement: "수열의 귀납적 정의를 이해하고 수학적 귀납법을 이용하여 명제를 증명할 수 있다.",
    keywords: ["수학적 귀납법", "귀납적 정의", "점화식"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 수학: 12미적1 (미적분1: 함수의 극한, 미분, 적분)
  // ----------------------------------------------------
  {
    code: "[12미적1-01-01]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "함수의 극한과 연속",
    statement: "수열의 수렴과 발산의 뜻을 알고 수열의 극한에 관한 기본 성질을 이해한다.",
    keywords: ["수열의 극한", "수렴", "발산", "극한값"],
    mappedTopicIds: ["mt_FP-mjXaq3B"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미적1-01-02]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "함수의 극한과 연속",
    statement: "함수의 극한의 뜻을 알고 좌극한과 우극한을 구하며 극한값을 계산할 수 있다.",
    keywords: ["함수의 극한", "좌극한", "우극한", "부정형 극한"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미적1-01-03]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "함수의 극한과 연속",
    statement: "함수의 연속과 불연속의 뜻을 알고 연속함수의 성질과 사잇값 정리를 설명할 수 있다.",
    keywords: ["함수의 연속", "불연속", "사잇값 정리", "최대최소정리"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미적1-02-01]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "미분",
    statement: "미분계수의 뜻을 알고 그 기하학적 의미(접선의 기울기, 순간변화율)를 설명할 수 있다.",
    keywords: ["미분계수", "순간변화율", "평균변화율", "접선의 기울기"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미적1-02-02]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "미분",
    statement: "도함수의 뜻을 알고 다항함수의 도함수를 구할 수 있다.",
    keywords: ["도함수", "미분법", "거듭제곱 미분", "곱의 미분"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미적1-02-03]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "미분",
    statement: "접선의 방정식을 구하고 롤의 정리와 평균값 정리를 이해한다.",
    keywords: ["접선의 방정식", "롤의 정리", "평균값 정리"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미적1-02-04]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "미분",
    statement: "함수의 증가와 감소, 극대와 극소를 판정하고 함수의 그래프 개형을 그릴 수 있다.",
    keywords: ["증가와 감소", "극대", "극소", "변곡점", "그래프 개형"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미적1-03-01]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "적분",
    statement: "부정적분의 뜻을 알고 다항함수의 부정적분을 구할 수 있다.",
    keywords: ["부정적분", "적분상수", "역도함수"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미적1-03-02]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "적분",
    statement: "정적분의 뜻을 알고 미적분의 기본 정리를 이용하여 정적분을 계산할 수 있다.",
    keywords: ["정적분", "미적분의 기본 정리", "구분구적법"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미적1-03-06]",
    subject: "미적분",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "적분",
    statement: "정적분을 활용하여 곡선과 좌표축 사이의 넓이 및 속도와 거리를 계산할 수 있다.",
    keywords: ["정적분 넓이", "두 곡선 사이의 넓이", "속도와 거리"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 과학: 10통과 (통합과학 1·2)
  // ----------------------------------------------------
  {
    code: "[10통과1-01]",
    subject: "통합과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "물질과 규칙성",
    statement: "빅뱅 우주론에 따른 원소의 생성 과정과 수소, 헬륨의 우주 구성비를 설명할 수 있다.",
    keywords: ["빅뱅", "우주 초기 원소", "수소", "헬륨"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10통과1-02]",
    subject: "통합과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "물질과 규칙성",
    statement: "지구와 생명체를 구성하는 주요 원소들의 주기성과 화학적 규칙성을 설명할 수 있다.",
    keywords: ["주기율표", "족과 주기", "알칼리 금속", "할로젠"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10통과1-04]",
    subject: "통합과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "물질과 규칙성",
    statement: "이온 결합과 공유 결합의 형성 과정을 원자가 전자 배치로 설명하고 물질의 특성을 비교할 수 있다.",
    keywords: ["화학 결합", "이온 결합", "공유 결합", "전기 전도성"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10통과2-01]",
    subject: "통합과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "시스템과 상호작용",
    statement: "중력의 작용에 의한 지구 역학적 시스템과 자유 낙하 및 수평 투사 운동을 분석할 수 있다.",
    keywords: ["중력", "자유 낙하", "수평 투사 운동", "포물선 운동"],
    mappedTopicIds: ["mt_NNNbPccwB4"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10통과2-02]",
    subject: "통합과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "시스템과 상호작용",
    statement: "운동량과 충격량의 관계를 이해하고 충돌 시 충격력을 줄이는 안전장치의 원리를 설명할 수 있다.",
    keywords: ["운동량", "충격량", "충돌 시간", "안전장치", "에어백"],
    mappedTopicIds: ["mt_NNNbPccwB4"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10통과2-08]",
    subject: "통합과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "생태계와 환경",
    statement: "생태계 구성 요소의 상호작용과 먹이그물, 에너지 흐름을 통해 생태계 평형의 원리를 설명할 수 있다.",
    keywords: ["생태계 평형", "먹이그물", "생태 피라미드", "환경 변화"],
    mappedTopicIds: ["mt_AylKwhbDWM"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 물리학: 12물리 (역학, 전자기, 파동과 양자)
  // ----------------------------------------------------
  {
    code: "[12물리01-01]",
    subject: "물리학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "역학적 시스템",
    statement: "뉴턴의 운동 제1, 2, 3법칙을 적용하여 물체의 운동 상태 변화와 힘의 상호작용을 정량적으로 해석할 수 있다.",
    keywords: ["뉴턴 운동 법칙", "관성", "가속도 법칙(F=ma)", "작용 반작용"],
    mappedTopicIds: ["mt_NNNbPccwB4"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12물리01-02]",
    subject: "물리학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "역학적 시스템",
    statement: "운동량 보존 법칙을 이해하고 일차원 탄성 및 비탄성 충돌 현상을 분석할 수 있다.",
    keywords: ["운동량 보존", "탄성 충돌", "비탄성 충돌"],
    mappedTopicIds: ["mt_NNNbPccwB4"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12물리02-01]",
    subject: "물리학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "전자기장",
    statement: "전하 사이에 작용하는 전기력과 쿨롱 법칙을 이해하고 정전기 유도 현상을 설명할 수 있다.",
    keywords: ["전기력", "쿨롱 법칙", "정전기 유도", "유전 분극"],
    mappedTopicIds: ["mt_NzCNuABT3E"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12물리02-02]",
    subject: "물리학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "전자기장",
    statement: "전류에 의한 자기장과 패러데이 전자기 유도 법칙을 설명하고 발전기의 원리를 이해한다.",
    keywords: ["전자기 유도", "패러데이 법칙", "렌츠의 법칙", "유도 기전력"],
    mappedTopicIds: ["mt_NNNbPccwB4"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12물리03-01]",
    subject: "물리학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "파동과 빛",
    statement: "파동의 굴절, 간섭, 회절 현상을 파동 이론으로 설명할 수 있다.",
    keywords: ["파동의 굴절", "스넬의 법칙", "파동의 간섭", "회절"],
    mappedTopicIds: ["mt_NzCNuABT3E"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12물리03-05]",
    subject: "물리학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "양자물리",
    statement: "광전 효과를 광양자설로 설명하고 빛의 입자성과 파동성의 이중성을 이해한다.",
    keywords: ["광전 효과", "광양자설", "빛의 이중성", "일함수"],
    mappedTopicIds: ["mt_NzCNuABT3E"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 정보/AI: 12인기 (인공지능 기초)
  // ----------------------------------------------------
  {
    code: "[12인기01-01]",
    subject: "인공지능 기초",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "인공지능의 이해",
    statement: "인공지능의 개념과 에이전트의 구조, 문제 해결을 위한 탐색 알고리즘을 이해한다.",
    keywords: ["인공지능", "에이전트", "상태 공간", "탐색 알고리즘"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12인기02-01]",
    subject: "인공지능 기초",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "머신러닝과 딥러닝",
    statement: "지도학습, 비지도학습, 강화학습의 차이와 머신러닝의 학습 원리를 설명할 수 있다.",
    keywords: ["머신러닝", "지도학습", "비지도학습", "강화학습", "데이터셋"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12인기02-02]",
    subject: "인공지능 기초",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "머신러닝과 딥러닝",
    statement: "선형 회귀와 분류 모델의 원리를 이해하고 손실함수와 경사하강법을 통한 최적화를 설명할 수 있다.",
    keywords: ["선형 회귀", "분류", "손실함수", "경사하강법", "최적화"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12인기03-04]",
    subject: "인공지능 기초",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "인공지능 윤리",
    statement: "인공지능의 공정성, 투명성, 책임성 및 설명 가능한 인공지능(XAI)의 필요성을 설명할 수 있다.",
    keywords: ["인공지능 윤리", "알고리즘 공정성", "설명 가능성", "XAI"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 국어: 10공국, 12독작, 12화언, 12문학
  // ----------------------------------------------------
  {
    code: "[10공국01-02]",
    subject: "공통국어",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "문법과 담화",
    statement: "문장 표현의 적절성과 담화 표지, 맥락을 고려하여 효과적인 의사소통을 수행한다.",
    keywords: ["문장 표현과 담화 표지", "문장 표현", "담화 표지", "맥락", "응결성", "의사소통"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12독작02-01]",
    subject: "독서와 작문",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "독서와 작문",
    statement: "학술적 텍스트를 심층 분석하고 논리적 근거를 바탕으로 학술적·논리적 작문을 수행한다.",
    keywords: ["학술적 텍스트 분석 및 논리적 작문", "학술적 텍스트", "논리적 작문", "심층 분석", "논증 에세이"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12화언03-02]",
    subject: "화법과 언어",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "국어사 및 언어 구조",
    statement: "훈민정음의 창제 원리와 중세국어의 음운·문법적 특징 및 국어사적 변천을 탐구한다.",
    keywords: ["국어사 및 중세국어", "국어사", "중세국어", "훈민정음", "언어 변천"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12문학02-03]",
    subject: "문학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "한국 문학사",
    statement: "한국 문학사의 전개 과정과 대표 작품을 시대적·사회적 맥락에서 비평적으로 수용한다.",
    keywords: ["한국 문학사 및 비평", "한국 문학사", "문학 비평", "고전문학", "현대문학"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 수학 추가: 12확통, 12기하
  // ----------------------------------------------------
  {
    code: "[12확통01-01]",
    subject: "확률과 통계",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "경우의 수와 확률",
    statement: "원순열, 중복순열, 중복조합을 이해하고 순열과 조합을 활용하여 복합 경우의 수를 계산한다.",
    keywords: ["순열과 조합", "순열", "조합", "중복순열", "중복조합", "확률과 통계"],
    mappedTopicIds: ["mt_nyK25mNOeR"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12기하01-01]",
    subject: "기하",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "이차곡선",
    statement: "포물선, 타원, 쌍곡선의 정의를 이해하고 이차곡선의 방정식을 유도하며 기하학적 성질을 탐구한다.",
    keywords: ["이차곡선", "포물선", "타원", "쌍곡선", "초점", "기하"],
    mappedTopicIds: ["mt_b4lbTOJYwI"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 영어: 10공영, 12영1, 12영독작
  // ----------------------------------------------------
  {
    code: "[10공영01-02]",
    subject: "공통영어",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "구문과 담화",
    statement: "복합 절 구조(명사절, 부사절, 형용사절)와 담화 연결 표지를 파악하여 글의 응집성과 논리적 흐름을 이해한다.",
    keywords: ["복합 절과 담화 구조", "복합 절", "담화 구조", "응집성", "구문 분석"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12영1-02-01]",
    subject: "영어Ⅰ",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "학술 독해",
    statement: "수능 및 학술 지문의 복잡한 구문을 독해하고 빈칸 추론과 함축적 의미를 논리적으로 연역한다.",
    keywords: ["수능/학술 지문 구문 독해 및 추론", "구문 독해", "빈칸 추론", "함축 의미", "수능 영어"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12영독작03-01]",
    subject: "영어 독해와 작문",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "학술 작문",
    statement: "다양한 시사 및 학술 주제에 대해 논리적 표현과 적절한 담화 구조를 갖춘 에세이를 작성한다.",
    keywords: ["에세이 작성과 논리적 표현", "에세이 작성", "논리적 표현", "영작문", "패러프레이징"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 사회·역사: 10통사, 12한사, 12경제, 12정법, 12사문
  // ----------------------------------------------------
  {
    code: "[10통사1-01-01]",
    subject: "통합사회",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "인간, 사회, 환경과 행복",
    statement: "행복과 삶의 진정한 의미를 시간적, 공간적, 사회적, 윤리적 통합 관점에서 다각도로 탐색한다.",
    keywords: ["행복과 삶의 의미", "행복", "삶의 의미", "통합적 관점", "삶의 질"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[10통사2-01-02]",
    subject: "통합사회",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "사회 정의와 불평등",
    statement: "자유와 평등의 조화 및 분배적 정의의 기준을 탐색하고 사회 정의 실현 방안을 제안한다.",
    keywords: ["자유와 평등, 정의의 실현", "자유와 평등", "사회 정의", "분배적 정의", "정의의 실현"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12한사01-02]",
    subject: "한국사",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "한국 근현대사",
    statement: "개항기 자주독립 국가 수립 노력과 일제 식민지 지배 체제 및 민족 독립운동의 전개 과정을 사료로 분석한다.",
    keywords: ["한국 근현대사의 전개", "한국 근현대사", "식민 통치", "민족 독립운동", "대한민국 임시정부"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12경제01-02]",
    subject: "경제",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "국민 경제와 국제 경제",
    statement: "환율과 이자율의 결정 및 변동 원리를 이해하고 거시경제 지표(물가, 실업, GDP)의 상호 연관성을 분석한다.",
    keywords: ["환율·이자율과 거시경제 변동", "환율", "이자율", "거시경제", "물가", "경제성장"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12정법01-01]",
    subject: "정치와 법",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "민주주의와 헌법",
    statement: "민주주의의 본질과 법치주의, 대한민국 헌법의 기본 원리 및 기본권 보장 체계를 수호한다.",
    keywords: ["민주주의와 헌법 수호", "민주주의", "헌법", "기본권 보장", "법치주의"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12사문01-01]",
    subject: "사회·문화",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "사회문화 현상의 탐구",
    statement: "자연 현상과 사회문화 현상의 특성을 비교하고 양적 연구와 질적 연구 등 과학적 탐구 방법론을 이해한다.",
    keywords: ["사회문화 현상의 이해", "사회문화 현상", "양적 연구", "질적 연구", "연구 방법론"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 도덕·윤리: 12생윤, 12윤사
  // ----------------------------------------------------
  {
    code: "[12생윤01-02]",
    subject: "생활과 윤리",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "응용윤리의 세계",
    statement: "현대 사회의 다양한 윤리적 쟁점(생명의료, 환경, 정보 등)에 응용윤리학 이론을 적용하여 합리적 해결책을 도출한다.",
    keywords: ["현대 사회의 윤리적 쟁점과 응용윤리", "생활과 윤리", "응용윤리", "생명의료윤리", "환경윤리"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12윤사02-01]",
    subject: "윤리와 사상",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "서양 윤리 사상",
    statement: "칸트의 의무론, 벤담과 밀의 공리주의, 롤스의 정의론 등 서양 근현대 규범윤리 체계를 비판적으로 비교·분석한다.",
    keywords: ["칸트의 의무론, 공리주의, 롤스의 정의론", "칸트 의무론", "공리주의", "롤스 정의론", "무지의 베일"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 과학: 12화학, 12생명, 12지구
  // ----------------------------------------------------
  {
    code: "[12화학01-01]",
    subject: "화학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "물질의 양과 화학 반응",
    statement: "몰(mol)과 아보가드로수를 이해하고 화학 반응식을 바탕으로 양적 관계를 계산할 수 있다.",
    keywords: ["화학 반응의 양적 관계", "몰", "아보가드로수", "화학 반응식", "한계 반응물"],
    mappedTopicIds: ["mt_NzCNuABT3E"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12생명01-01]",
    subject: "생명과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "생명 활동과 물질대사",
    statement: "세포 호흡과 광합성을 통한 에너지 전환 과정과 ATP의 역할을 분자 수준에서 설명할 수 있다.",
    keywords: ["세포 호흡과 광합성", "세포 호흡", "광합성", "ATP", "물질대사"],
    mappedTopicIds: ["mt_AylKwhbDWM"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12지구01-01]",
    subject: "지구과학",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "지권의 변동",
    statement: "판 구조론의 정립 과정과 판 경계에서의 지질 현상(지진, 화산 활동)을 맨틀 대류와 연결하여 해석한다.",
    keywords: ["판 구조론과 지질 현상", "판 구조론", "대륙 이동설", "판의 경계", "맨틀 대류"],
    mappedTopicIds: ["mt_0_K-GrKQpd"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 정보·AI: 12정, 12인기
  // ----------------------------------------------------
  {
    code: "[12정02-01]",
    subject: "정보",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "자료구조와 알고리즘",
    statement: "배열, 스택, 큐, 트리 등 다양한 자료구조를 추상화하고 알고리즘의 시간 및 공간 복잡도를 분석한다.",
    keywords: ["자료구조와 추상화", "자료구조", "스택", "큐", "시간 복잡도", "추상화"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12인기01-02]",
    subject: "인공지능 기초",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "인공지능의 원리와 학습",
    statement: "인공지능의 원리와 머신러닝 학습 모델(선형 모델, 신경망 기초)의 작동 메커니즘을 이해한다.",
    keywords: ["인공지능의 원리와 머신러닝 학습 모델", "인공지능 원리", "머신러닝 학습 모델", "신경망 기초", "파라미터 최적화"],
    mappedTopicIds: ["mt__p5n8z5soJ"],
    piagetStage: "Formal Operational"
  },

  // ----------------------------------------------------
  // 고등학교 체육·음악·미술: 10체, 12음, 12미
  // ----------------------------------------------------
  {
    code: "[10체01-02]",
    subject: "체육",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고1",
    domain: "건강과 운동 생리학",
    statement: "운동 생리학적 원리를 바탕으로 개인 맞춤형 체력 관리 계획을 수립하고 평생 건강 관리 습관을 실천한다.",
    keywords: ["평생 건강 관리와 운동 생리학", "평생 건강 관리", "운동 생리학", "체력 증진", "트레이닝"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12음01-02]",
    subject: "음악",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "음악사 및 악곡 분석",
    statement: "시대별 음악 양식의 특징을 비교하고 다성음악 및 복합 화성 구조를 심층적으로 분석하며 감상한다.",
    keywords: ["악곡 분석과 음악사 감상", "악곡 분석", "음악사 감상", "화성 분석", "대위법", "소나타 형식"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  },
  {
    code: "[12미02-01]",
    subject: "미술",
    schoolLevel: "HS",
    gradeCluster: "고등학교 1~3학년군",
    grade: "고2",
    domain: "미술 비평과 시각문화",
    statement: "현대 미술의 다양한 담론과 시각문화 매체를 비평적으로 분석하고 미술 작품의 다원적 가치를 평가한다.",
    keywords: ["현대 미술 비평과 시각문화", "현대 미술 비평", "시각문화", "포스트모더니즘", "미술사", "비평적 담론"],
    mappedTopicIds: ["mt_ebQURBOsM5"],
    piagetStage: "Formal Operational"
  }
];

/**
 * Elementary standards enriched with schoolLevel: "ES"
 */
const ENRICHED_ELEMENTARY_STANDARDS = KOREA_2022_STANDARDS.map(s => {
  let grade = s.grade;
  if (!grade && s.gradeCluster) {
    if (s.gradeCluster.includes("1~2")) grade = "초1~2";
    else if (s.gradeCluster.includes("3~4")) grade = "초3~4";
    else if (s.gradeCluster.includes("5~6")) grade = "초5~6";
    else grade = "초등";
  }
  return {
    ...s,
    grade: grade || "초등",
    schoolLevel: "ES",
    piagetStage: s.piagetStage || "Concrete Operational"
  };
});

/**
 * Unified full K-12 Korean 2022 Curriculum Standards Collection
 */
export const K12_STANDARDS = Object.freeze([
  ...ELEMENTARY_ADDITIONS,
  ...ENRICHED_ELEMENTARY_STANDARDS,
  ...MIDDLE_SCHOOL_STANDARDS,
  ...HIGH_SCHOOL_STANDARDS
]);

/**
 * K-12 Cross-Grade Spiral Prerequisite Dependencies
 * Explicitly connects High School standards back to Middle School and Elementary School foundation standards.
 */
export const K12_CURRICULUM_DEPENDENCIES = Object.freeze([
  // Calculus Chain: [12미적1-02-01] ➔ [9수03-03] ➔ [6수01-06]
  {
    topicId: "[12미적1-02-01]",
    prerequisiteId: "[9수03-03]",
    strength: "hard",
    reason: "미분계수의 순간변화율을 이해하기 위해서는 중학교 일차함수의 기울기(평균변화율) 및 좌표평면 표상 선수학습 필수"
  },
  {
    topicId: "[9수03-03]",
    prerequisiteId: "[6수01-06]",
    strength: "hard",
    reason: "일차함수 기울기(두 점 사이의 분수 형태 변화율 계산)를 구하기 위해서는 초등 분수 덧셈·나눗셈 및 비와 비율 선수학습 필수"
  },
  {
    topicId: "[12미적1-03-06]",
    prerequisiteId: "[12미적1-02-01]",
    strength: "hard",
    reason: "정적분의 넓이 및 활용 문제를 해결하기 위해서는 미분계수와 도함수의 기하학적 성질 선수학습 필수"
  },

  // Algebra Chain: [10공수1-03] ➔ [9수02-06] ➔ [9수02-01] ➔ [6수01-01]
  {
    topicId: "[10공수1-03]",
    prerequisiteId: "[9수02-06]",
    strength: "hard",
    reason: "고등학교 복잡한 다항식의 인수분해를 위해 중학교 기본 인수분해 공식 선수학습 필수"
  },
  {
    topicId: "[9수02-06]",
    prerequisiteId: "[9수02-01]",
    strength: "hard",
    reason: "인수분해를 위해 문자와 식, 다항식의 곱셈과 전개 선수학습 필수"
  },
  {
    topicId: "[9수02-01]",
    prerequisiteId: "[6수01-01]",
    strength: "hard",
    reason: "문자와 식의 공통인수 묶기를 위해 초등 약수와 배수 개념 선수학습 필수"
  },

  // Balance to Matrix Chain: [10공수1-06] ➔ [9수02-05] ➔ [6수02-01]
  {
    topicId: "[10공수1-06]",
    prerequisiteId: "[9수02-05]",
    strength: "hard",
    reason: "행렬의 연산 및 연립방정식 행렬 표현을 위해 중학교 연립일차방정식 선수학습 필수"
  },
  {
    topicId: "[9수02-05]",
    prerequisiteId: "[6수02-01]",
    strength: "hard",
    reason: "연립방정식의 비례 관계 및 계수 관계를 위해 초등 비와 비율 선수학습 필수"
  },

  // Light to Optics Chain: [12물리03-01] ➔ [9과02-01] ➔ [4과07-01]
  {
    topicId: "[12물리03-01]",
    prerequisiteId: "[9과02-01]",
    strength: "hard",
    reason: "파동의 굴절과 간섭 현상을 이해하기 위해 중학교 빛과 파동(렌즈와 상) 선수학습 필수"
  },
  {
    topicId: "[9과02-01]",
    prerequisiteId: "[4과07-01]",
    strength: "hard",
    reason: "빛과 파동의 성질을 탐구하기 위해 초등 빛의 직진과 반사 선수학습 필수"
  },

  // Mechanics Chain: [12물리01-01] ➔ [9과08-01] ➔ [4과02-01]
  {
    topicId: "[12물리01-01]",
    prerequisiteId: "[9과08-01]",
    strength: "hard",
    reason: "뉴턴 운동 법칙을 적용하기 위해 중학교 속력과 등속·자유낙하 운동 선수학습 필수"
  },
  {
    topicId: "[9과08-01]",
    prerequisiteId: "[4과02-01]",
    strength: "hard",
    reason: "물체의 운동과 힘의 효과를 이해하기 위해 초등 힘과 자석의 상호작용 선수학습 필수"
  },

  // Code to AI Chain: [12인기02-01] ➔ [9정03-03] ➔ [6실04-01]
  {
    topicId: "[12인기02-01]",
    prerequisiteId: "[9정03-03]",
    strength: "hard",
    reason: "머신러닝 학습 알고리즘 이해를 위해 중학교 텍스트 기반 제어구조(순차, 선택, 반복) 프로그래밍 선수학습 필수"
  },
  {
    topicId: "[9정03-03]",
    prerequisiteId: "[6실04-01]",
    strength: "hard",
    reason: "텍스트 프로그래밍 제어구조 작성을 위해 초등 알고리즘과 절차적 문제 해결 기초 선수학습 필수"
  },

  // Reading Comprehension Chain: [12독작02-01] ➔ [10공국01-02] ➔ [9국03-01] ➔ [6국03-02] ➔ [4국02-01] ➔ [2국01-01]
  {
    topicId: "[12독작02-01]",
    prerequisiteId: "[10공국01-02]",
    strength: "hard",
    reason: "학술적 텍스트 심층 분석과 논리적 작문을 위해 고교 공통국어의 문장 표현과 담화 표지 선수학습 필수"
  },
  {
    topicId: "[10공국01-02]",
    prerequisiteId: "[9국03-01]",
    strength: "hard",
    reason: "담화 표지와 맥락 이해를 위해 중학교 설명문·논설문의 비판적 독해 선수학습 필수"
  },
  {
    topicId: "[9국03-01]",
    prerequisiteId: "[6국03-02]",
    strength: "hard",
    reason: "비판적 독해와 타당성 검증을 위해 초등 사실적·추론적 독해 및 문단 중심생각 파악 선수학습 필수"
  },
  {
    topicId: "[6국03-02]",
    prerequisiteId: "[4국02-01]",
    strength: "hard",
    reason: "문단 독해를 위해 초등 기초 문장 성분(주어, 서술어)과 띄어쓰기 선수학습 필수"
  },
  {
    topicId: "[4국02-01]",
    prerequisiteId: "[2국01-01]",
    strength: "hard",
    reason: "문장 성분과 문장 쓰기를 위해 한글 자모와 기초 낱말 읽기·쓰기 선수학습 필수"
  },

  // English Grammar Ladder: [12영1-02-01] ➔ [10공영01-02] ➔ [9영02-02] ➔ [9영01-03] ➔ [6영02-02] ➔ [4영01-01]
  {
    topicId: "[12영1-02-01]",
    prerequisiteId: "[10공영01-02]",
    strength: "hard",
    reason: "수능 및 학술 지문 추론 독해를 위해 공통영어의 복합 절 및 담화 구조 분석 선수학습 필수"
  },
  {
    topicId: "[10공영01-02]",
    prerequisiteId: "[9영02-02]",
    strength: "hard",
    reason: "복합 절 구조 이해를 위해 중학교 접속사와 관계대명사 복문 선수학습 필수"
  },
  {
    topicId: "[9영02-02]",
    prerequisiteId: "[9영01-03]",
    strength: "hard",
    reason: "복문 연결을 위해 중학교 기본 5형식 문형과 기본 시제 선수학습 필수"
  },
  {
    topicId: "[9영01-03]",
    prerequisiteId: "[6영02-02]",
    strength: "hard",
    reason: "5형식 문장 구성을 위해 초등 기초 일상 문장과 인칭대명사 선수학습 필수"
  },
  {
    topicId: "[6영02-02]",
    prerequisiteId: "[4영01-01]",
    strength: "hard",
    reason: "문장 표현을 위해 알파벳 소리와 기초 낱말 읽기(파닉스) 선수학습 필수"
  },

  // Ratio to Economy Chain: [12경제01-02] ➔ [9사05-02] ➔ [6수01-06]
  {
    topicId: "[12경제01-02]",
    prerequisiteId: "[9사05-02]",
    strength: "hard",
    reason: "환율·이자율 거시경제 분석을 위해 중학교 시장 가격 결정(수요·공급 곡선) 선수학습 필수"
  },
  {
    topicId: "[9사05-02]",
    prerequisiteId: "[6수01-06]",
    strength: "hard",
    reason: "수요·공급 곡선의 가격 대비 수량 비율 관계 이해를 위해 초등 비와 비율 및 분수 연산 선수학습 필수"
  },

  // Ethics Justice Evolution Chain: [12윤사02-01] ➔ [10통사2-01-02] ➔ [9도03-02] ➔ [4도01-01]
  {
    topicId: "[12윤사02-01]",
    prerequisiteId: "[10통사2-01-02]",
    strength: "hard",
    reason: "칸트·롤스의 규범윤리 정의론 분석을 위해 공통 통합사회의 자유와 평등, 분배 정의 실현 선수학습 필수"
  },
  {
    topicId: "[10통사2-01-02]",
    prerequisiteId: "[9도03-02]",
    strength: "hard",
    reason: "분배 정의 실현 방안 탐색을 위해 중학교 사회 정의와 인권 보장 기초 선수학습 필수"
  },
  {
    topicId: "[9도03-02]",
    prerequisiteId: "[4도01-01]",
    strength: "hard",
    reason: "사회 정의와 공공성 인식을 위해 초등 도덕적 배려와 규칙 준수 태도 선수학습 필수"
  },

  // Music Harmony Chain: [12음01-02] ➔ [9음02-01] ➔ [6음01-01]
  {
    topicId: "[12음01-02]",
    prerequisiteId: "[9음02-01]",
    strength: "hard",
    reason: "악곡의 복합 화성 분석을 위해 중학교 주요 3화음과 다장조/단조 음계 구조 선수학습 필수"
  },
  {
    topicId: "[9음02-01]",
    prerequisiteId: "[6음01-01]",
    strength: "hard",
    reason: "3화음 화성 학습을 위해 초등 다장조 계이름 읽기와 기본 리듬 가창 선수학습 필수"
  },

  // Art Perspective Chain: [12미02-01] ➔ [9미02-01] ➔ [6미01-01]
  {
    topicId: "[12미02-01]",
    prerequisiteId: "[9미02-01]",
    strength: "hard",
    reason: "현대 시각문화 및 공간 예술 비평을 위해 중학교 투시원근법과 비례의 조형 원리 선수학습 필수"
  },
  {
    topicId: "[9미02-01]",
    prerequisiteId: "[6미01-01]",
    strength: "hard",
    reason: "3차원 원근법 표현을 위해 초등 점·선·면·색의 기본 조형 요소 탐색 선수학습 필수"
  }
]);

/**
 * Spiral Curriculum Progression Chains (초 ➔ 중 ➔ 고 나선형 교육과정 체계)
 */
export const SPIRAL_CURRICULUM_CHAINS = Object.freeze({
  fractions_to_calculus: {
    key: "fractions_to_calculus",
    title: "분수 연산에서 미분·적분학으로 이어지는 변화율 나선형 체계",
    description: "초등 분수·비율의 구체적 조작에서 출발하여, 중학교 일차함수의 기울기(기호적 표상)를 거쳐, 고등학교 미분계수(순간변화율) 및 정적분의 연속적 변화율로 심화 확장되는 인지 발달 궤적.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 5~6학년군",
        standardCode: "[6수01-06]",
        standardTitle: "분모가 다른 분수의 덧셈과 뺄셈",
        concept: "두 양의 비와 분수의 연산 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "분수 막대, 영역 모델 등 구체물을 조작하여 등분할 및 공통단위(통분) 형성"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9수03-03]",
        standardTitle: "일차함수의 의미와 기울기",
        concept: "좌표평면 상의 두 점 사이의 평균변화율(기울기 a = Δy/Δx) (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "직관적 그래프와 좌표평면을 통해 x의 증가량에 대한 y의 증가량 비를 대수적 기호로 일반화"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12미적1-02-01]",
        standardTitle: "미분계수와 순간변화율",
        concept: "평균변화율의 극한으로서의 순간변화율 f'(a) = lim Δx->0 (Δy/Δx) (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "할선의 기울기가 접선의 기울기로 수렴하는 동적 시각화 및 무한소 극한 기호의 형식적 연역"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12미적1-03-06]",
        standardTitle: "정적분의 활용과 넓이",
        concept: "연속적 변화량의 누적 및 곡선 사이의 정적분 넓이 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "구분구적법의 직사각형 분할 극한과 미적분의 기본 정리를 통한 연속 합 개념 완성"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "구체적 수치 연산(분수)에서 대수적 변화율(기울기 a = Δy/Δx)과 기호적 함수 관계로 전이"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "고정된 두 점 사이의 평균변화율에서 무한소 극한(Δx ➔ 0)을 취하는 순간변화율 및 미분 개념으로의 형식적 도약"
      }
    ]
  },

  arithmetic_to_algebra: {
    key: "arithmetic_to_algebra",
    title: "산술 연산에서 대수 방정식 및 다항식 구조로의 확장 체계",
    description: "초등 구체적 연산 및 역관계에서, 중학교 문자와 식, 일차·이차방정식을 거쳐, 고등학교 다항식 나머지정리와 복소수 체계로 심화되는 대수적 추상화 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 1~2학년군",
        standardCode: "[2수01-05]",
        standardTitle: "덧셈과 뺄셈의 역연산 관계",
        concept: "수 모으기와 가르기, 등식의 직관적 균형 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "바둑알, 수 모형, 양팔저울 조작을 통한 연산 역관계 체득"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9수02-04]",
        standardTitle: "일차방정식과 등식의 성질",
        concept: "문자 x의 도입, 등식의 성질을 활용한 미지수 해법 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "대수 타일 및 양팔저울 등식 모형을 통한 이항 법칙의 기호화"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9수02-06]",
        standardTitle: "다항식의 인수분해",
        concept: "다항식 전개의 역연산으로서의 인수분해 구조 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "면적 분할 모델을 통한 (x+a)(x+b) 전개와 인수분해의 시각적 확인"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[10공수1-03]",
        standardTitle: "다항식의 인수분해와 나머지정리",
        concept: "조립제법, 인수정리, 고차 다항식의 대수적 구조 분해 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "다항식 환 구조에서의 대수적 분해 및 추상적 연역 추론"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "구체적 숫자 산술에서 미지수 문자(x)와 방정식 구조로의 대수적 전이"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "이차방정식 해법에서 복소수 체계 및 일반 고차 다항식 구조로의 완전한 형식적 연역"
      }
    ]
  },

  balance_to_matrix: {
    key: "balance_to_matrix",
    title: "비와 비율에서 다변수 연립방정식과 행렬 대수로의 확장 체계",
    description: "초등 비와 비율의 균형 개념에서 출발하여, 중학교 미지수가 2개인 연립일차방정식을 거쳐, 고등학교 다차원 선형 변환 및 행렬 대수로 발전하는 수리 구조 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 5~6학년군",
        standardCode: "[6수02-01]",
        standardTitle: "비와 비율의 의미",
        concept: "기준량과 비교하는 양의 비율적 관계 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "실물 비례 배분(음료 혼합, 축척) 활동을 통한 비율 직관화"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9수02-05]",
        standardTitle: "연립일차방정식",
        concept: "두 조건의 동시 만족 및 가감법·대입법 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "두 직선의 교점 시각화 및 대수적 소거법 훈련"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[10공수1-06]",
        standardTitle: "행렬과 그 연산",
        concept: "다차원 데이터의 테이블 구조화 및 행렬 곱셈 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "다차원 변량 결합 및 행렬곱의 선형 결합 해석"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "단일 비례 관계에서 다변수 동시 제약 조건(연립방정식)으로의 이행"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "개별 미지수 소거 연산에서 다차원 데이터 행렬 대수로의 추상화"
      }
    ]
  },

  light_to_optics: {
    key: "light_to_optics",
    title: "빛의 직진·반사에서 파동 광학 및 광전 효과로의 발전 체계",
    description: "초등 빛의 직진·그림자 관찰에서, 중학교 빛의 합성·거울·렌즈 상 형성을 거쳐, 고등학교 파동 간섭·회절 및 빛의 이중성(양자론)으로 도약하는 물리 과학 탐구 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 3~4학년군",
        standardCode: "[4과07-01]",
        standardTitle: "빛의 직진과 반사",
        concept: "빛의 직진, 거울을 이용한 빛의 방향 변화 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "손전등, 거울, 그림자 상자 실험을 통한 직관적 관찰"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9과02-01]",
        standardTitle: "빛과 파동 (빛의 분산과 렌즈)",
        concept: "빛의 굴절, 프리즘에 의한 분산, 볼록/오목렌즈의 상 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "광선 추적 시뮬레이터 및 렌즈 상 작도법 훈련"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12물리03-01]",
        standardTitle: "파동의 굴절과 간섭",
        concept: "빛의 파동성, 스넬의 법칙, 영의 이중슬릿 간섭 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "간섭 무늬 분석 및 파동 방정식의 수학적 증명"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12물리03-05]",
        standardTitle: "빛의 이중성과 광전 효과",
        concept: "아인슈타인 광양자설, 광전 효과, 파동-입자 이중성 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "가변 전압 광전효과 시뮬레이션 및 일함수 에너지 분석"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "단순 직진·반사 현상에서 기하광학적 굴절과 렌즈 상 작도로의 인지 확장"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "기하 광학에서 전자기파 파동 이론 및 광양자설(양자역학)의 입자성으로의 패러다임 전환"
      }
    ]
  },

  force_and_motion: {
    key: "force_and_motion",
    title: "힘의 관찰에서 등속 운동 및 뉴턴 역학 법칙으로의 체계",
    description: "초등 자석과 물체의 힘 관찰에서, 중학교 속력과 역학적 에너지 보존을 거쳐, 고등학교 뉴턴 운동 법칙(F=ma)과 충격량 분석으로 완성되는 역학 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 3~4학년군",
        standardCode: "[4과02-01]",
        standardTitle: "자석의 성질과 힘",
        concept: "인력과 척력, 물체 사이의 힘 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "자석과 쇠구슬 밀고 당기기 조작 활동"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9과08-01]",
        standardTitle: "물체의 운동과 속력",
        concept: "시간-거리 그래프, 등속 운동, 자유 낙하 가속 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "시간기록계 및 속도-시간 그래프 해석"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12물리01-01]",
        standardTitle: "뉴턴의 운동 법칙",
        concept: "제1법칙(관성), 제2법칙(가속도 F=ma), 제3법칙(작용 반작용) (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "자유물체도(Free Body Diagram) 작성 및 벡터 합 연역"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "정성적 힘의 관찰에서 속력 및 시간-거리 그래프의 정량화로 전이"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "단순 속력 계산에서 가속도 벡터와 뉴턴 운동 방정식의 연역적 체계화"
      }
    ]
  },

  code_to_ai: {
    key: "code_to_ai",
    title: "블록 제어구조에서 텍스트 프로그래밍 및 인공지능 머신러닝으로의 체계",
    description: "초등 블록 코딩(순차/선택/반복)에서, 중학교 텍스트 기반 함수 프로그래밍을 거쳐, 고등학교 머신러닝 지도학습 및 최적화 손실함수 구현으로 이어지는 컴퓨팅 사고력 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 5~6학년군",
        standardCode: "[6실04-03]",
        standardTitle: "제어 구조(순차, 선택, 반복) 블록 프로그래밍",
        concept: "블록 결합을 통한 절차적 문제 해결 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "스크래치/엔트리 블록을 시각적으로 조립하며 즉각적 동작 피드백 확인"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9정03-03]",
        standardTitle: "텍스트 프로그래밍 제어구조 및 함수",
        concept: "문법 기반 코딩, 조건문/반복문 조합, 함수 모듈화 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "파이썬 문법과 제어 흐름 추적, 디버거를 통한 변수 상태 추적"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12인기02-01]",
        standardTitle: "머신러닝 패러다임과 지도학습 모델",
        concept: "데이터 기반 파라미터 학습, 손실함수 최소화 경사하강법 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "선형 회귀 모델 훈련, 손실 곡선 분석, 하이퍼파라미터 튜닝"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "시각적 블록 조작에서 추상적 텍스트 문법 및 함수 모듈화로 전이"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "명시적 규칙 작성(Rule-based)에서 데이터로부터 패턴을 학습하는 머신러닝 최적화로 패러다임 전환"
      }
    ]
  },

  reading_comprehension: {
    key: "reading_comprehension",
    title: "기초 자모·단어 읽기에서 비판적·학술적 텍스트 독해와 논리적 작문으로의 나선형 체계",
    description: "초등 한글 자모와 기초 낱말 해득, 문장 성분과 문단 파악에서 출발하여, 중학교 설명문·논설문의 비판적 독해를 거쳐, 고등학교 담화 맥락 분석 및 학술적 텍스트 심층 작문으로 완성되는 국어 독서·작문 발달 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 1~2학년군",
        standardCode: "[2국01-01]",
        standardTitle: "한글 자모와 낱말 읽기·쓰기",
        concept: "한글 자모의 소리값과 기초 낱말 해득 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "자모 결합 카드와 그림 낱말 카드를 이용한 음소-문자 대응 직관적 조작 활동"
      },
      {
        schoolLevel: "ES",
        gradeCluster: "초등 3~4학년군",
        standardCode: "[4국02-01]",
        standardTitle: "문장 성분과 띄어쓰기",
        concept: "문장의 기본 골격(주어, 서술어, 목적어)과 어절 단위 표기 규칙 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "문장 성분 색깔 띠 분할 및 문장 부호 퍼즐을 통한 통사적 구조화"
      },
      {
        schoolLevel: "ES",
        gradeCluster: "초등 5~6학년군",
        standardCode: "[6국03-02]",
        standardTitle: "문단과 사실적/추론적 독해",
        concept: "문단 간 중심 생각 파악, 텍스트 단서 기반 숨겨진 의미 추론 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "문단 마인드맵과 육하원칙 질문표를 통한 사실적·추론적 읽기 비계 설정"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9국03-01]",
        standardTitle: "설명문과 논설문의 비판적 독해",
        concept: "설명문과 논설문의 논증 타당성, 신뢰성, 공정성 비판적 검증 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "주장-근거 삼단논법 분석표와 오류 분석 워크시트를 통한 논리적 비판 훈련"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[10공국01-02]",
        standardTitle: "문장 표현과 담화 표지",
        concept: "맥락과 담화 표지(접속어, 지시어)의 응결성을 고려한 입체적 텍스트 구조 분석 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "담화 연결망 도식화와 화자·청자 맥락 변인 분석을 통한 거시적 텍스트 독해"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12독작02-01]",
        standardTitle: "학술적 텍스트 분석 및 논리적 작문",
        concept: "학술 논문 및 고차 비평문 심층 분석과 연역적·귀납적 논증 에세이 산출 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "학술 문헌 메타분석, 반론 고려 반박 구조화 및 학술적 글쓰기 루브릭 적용"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "단순 문단 중심 사실적·추론적 내용 이해에서 논증 구조의 타당성 및 논리적 오류를 검증하는 비판적 사고로의 전환"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "비판적 읽기에서 나아가 학술 담론 맥락을 포괄하는 메타인지적 텍스트 분석 및 학술적 논증 작문으로의 형식적 도약"
      }
    ]
  },

  english_grammar_ladder: {
    key: "english_grammar_ladder",
    title: "알파벳 소리 인식에서 복합 구문 독해 및 수능·학술 지문 추론으로의 나선형 영어 체계",
    description: "초등 음소 파닉스와 기초 일상 문장에서 출발하여, 중학교 5형식 문형과 관계대명사 복문을 거쳐, 고등학교 복합 절 구문 독해 및 논리적 학술 에세이 작문으로 확장되는 영어 의사소통·인지 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 3~4학년군",
        standardCode: "[4영01-01]",
        standardTitle: "알파벳 소리와 낱말 읽기",
        concept: "철자와 소리의 음소 대응 규칙(파닉스)과 기초 어휘 음성 인식 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "플래시 카드, 소리-철자 매칭 게임을 통한 직관적 파닉스 훈련"
      },
      {
        schoolLevel: "ES",
        gradeCluster: "초등 5~6학년군",
        standardCode: "[6영02-02]",
        standardTitle: "기초 일상 문장 표현과 인칭대명사",
        concept: "주어-동사 호응(be동사/일반동사), 인칭대명사 격 변화 및 기초 시제 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "문장 패턴 블록 맞추기와 상황극을 통한 기초 문형 체화"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9영01-03]",
        standardTitle: "기본 5형식 문형과 시제",
        concept: "문장의 5형식(SV, SVO, SVC, SVOO, SVOC) 구조화 및 완료 시제 체계 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "문장 성분 문형 분석 다이어그램과 시간선(Timeline)을 통한 시제 매핑"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9영02-02]",
        standardTitle: "접속사와 관계대명사",
        concept: "종속접속사(명사절, 부사절)와 관계대명사를 활용한 복합 문장 구조 결합 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "두 단문을 관계사로 합성하는 문장 합성 훈련 및 선행사-관계사 연결선 시각화"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[10공영01-02]",
        standardTitle: "복합 절과 담화 구조",
        concept: "복합 절 내포 구조, 분사구문, 도치 구문 및 담화 연결사를 통한 텍스트 일관성 파악 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "복합 수식어구 구문 청킹(Chunking) 및 논리적 담화 전개 다이어그램 작성"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12영1-02-01]",
        standardTitle: "수능/학술 지문 구문 독해 및 추론",
        concept: "고난도 추상적 수능 및 대학 교양 수준 지문의 함축적 의미와 빈칸 논리적 추론 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "패러프레이징 비교 분석, 주제문과 논리적 지지 문장 간의 연역적 귀결 추론"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "단순 암기식 일상 회화 문장에서 문장 성분(5형식)과 종속 관계(관계사)의 형식적 문법 체계로의 전환"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "단일 문장 단위 구문 분석에서 복잡한 학술 텍스트의 논리적 맥락 추론 및 빈칸 연역적 추론으로의 형식적 도약"
      }
    ]
  },

  ratio_to_economy: {
    key: "ratio_to_economy",
    title: "비와 비율에서 시장 수요·공급 곡선 및 거시경제 지표로의 확장 체계",
    description: "초등 비와 비율의 수리적 균형 조작에서, 중학교 가격에 따른 수요·공급 곡선 교차(균형 가격)를 거쳐, 고등학교 환율·이자율과 거시경제 변동의 다변수 상관관계 분석으로 심화되는 경제-수학 융합 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 5~6학년군",
        standardCode: "[6수01-06]",
        standardTitle: "분모가 다른 분수의 덧셈과 뺄셈 및 비와 비율",
        concept: "기준량과 비교하는 양의 비율 관계 및 공통 단위 통분 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "용액 농도 혼합, 지도 축척 등 실물 비례 조작 활동을 통한 비와 비율 체득"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9사05-02]",
        standardTitle: "시장 가격의 결정과 변동 (수요·공급 곡선)",
        concept: "가격-수량 좌표평면 상의 우하향 수요곡선과 우상향 공급곡선의 교점(균형 가격) (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "수요·공급 그래프 시뮬레이션 및 가격 변동에 따른 균형점 이동 추적 훈련"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12경제01-02]",
        standardTitle: "환율·이자율과 거시경제 변동",
        concept: "국제 외환 시장의 외환 수급에 따른 환율 변동과 이자율, 물가, GDP 간의 복합 거시경제 메커니즘 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "환율 변동에 따른 수출입 손익 계산 및 중앙은행 기준금리 정책 파급 경로 모형화"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "구체적 두 수치의 비율 관계에서 가격과 거래량 사이의 상호작용 곡선(함수적 관계)으로의 개념 전이"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "단일 재화 시장 균형에서 국가 간 개방 경제의 환율·이자율·물가가 얽힌 다변수 거시경제 체계로의 형식적 확장"
      }
    ]
  },

  ethics_justice_evolution: {
    key: "ethics_justice_evolution",
    title: "도덕적 배려에서 사회 정의와 규범윤리 정의론으로의 나선형 인지 발달 체계",
    description: "초등 공감과 규칙 준수의 구체적 조작에서 출발하여, 중학교 공공선과 사회 정의의 원리를 거쳐, 고등학교 롤스의 정의론(무지의 베일) 및 규범윤리 철학으로 도약하는 도덕성 발달 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 3~4학년군",
        standardCode: "[4도01-01]",
        standardTitle: "도덕적 배려와 규칙 준수",
        concept: "타인에 대한 정서적 공감, 배려 실천 및 학급 공동체 규칙 준수 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "역할 놀이(Role-playing)와 딜레마 이야기 토의를 통한 공감과 규칙 내면화"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9도03-02]",
        standardTitle: "사회 정의와 평화",
        concept: "법과 제도의 공정성, 기본적 인권 보장 및 사회적 약자 배려의 정의관 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "사회적 불평등 사례 분석 및 모의 재판 활동을 통한 제도적 정의 탐구"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[10통사2-01-02]",
        standardTitle: "자유와 평등, 정의의 실현",
        concept: "자유주의적 권리와 평등주의적 분배의 조화, 절차적 정의와 실질적 정의 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "복지 제도 설계 프로젝트 및 적극적 우대조치(Affirmative Action) 찬반 토론"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12윤사02-01]",
        standardTitle: "칸트의 의무론, 공리주의, 롤스의 정의론",
        concept: "칸트의 정언명령, 벤담·밀의 최대다수 최대행복, 롤스의 원초적 입장과 차등의 원칙 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "가설적 '무지의 베일' 사고 실험 설계 및 윤리적 난제(트롤리 딜레마) 철학적 논증"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "개인 간 정서적 배려와 순응적 규칙 준수에서 사회 구조와 제도의 법적·절차적 정의 검토로 확장"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "현실의 사회 문제 분석에서 무지의 베일, 정언명령 등 추상적 가설적 사고 실험을 통한 형식적 규범윤리 체계화"
      }
    ]
  },

  music_harmony_chain: {
    key: "music_harmony_chain",
    title: "단선율 가창에서 3화음 반주 및 복합 화성 악곡 분석으로의 나선형 음악 체계",
    description: "초등 계이름과 기본 리듬 가창에서, 중학교 다장조/단조 음계 및 주요 3화음(I, IV, V) 화성 진행을 거쳐, 고등학교 다성음악 대위법과 음악사적 악곡 심층 분석으로 발전하는 음악 인지 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 5~6학년군",
        standardCode: "[6음01-01]",
        standardTitle: "리듬과 계이름 가창",
        concept: "음높이(피치) 인식, 다장조 계이름 읽기 및 신체 표현을 동반한 리듬 연주 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "코다이 손기호, 리듬 카드 및 건반 타악기 조작을 통한 음고·리듬 체감"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9음02-01]",
        standardTitle: "3화음과 다장조/단조 음계",
        concept: "음정(간격)의 수학적 이해, 음계 구성음(토닉, 도미넌트)과 기본 3화음(I, IV, V) 화성 기능 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "코드 반주 악기(우쿨렐레, 건반) 연주 및 화음 카덴츠(종지법) 청음 훈련"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12음01-02]",
        standardTitle: "악곡 분석과 음악사 감상",
        concept: "바로크 대위법(푸가), 고전 소나타 형식 구조, 낭만/현대의 화성 확장 및 시대별 양식사 분석 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "총보(Full Score) 악보 리딩, 화성학적 로마자 분석 및 음악사 맥락 비평문 작성"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "단선율 청각 경험에서 3개 음이 결합된 화음 구조와 기능 화성 진행의 기호적 체계화로 전이"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "기본 3화음 반주 기능에서 다성음악의 독립 선율선(대위)과 복합 소나타 악곡 형식의 연역적 분석으로 도약"
      }
    ]
  },

  art_perspective_chain: {
    key: "art_perspective_chain",
    title: "조형 요소 탐색에서 3차원 투시원근법 및 현대 미술 비평으로의 시각예술 체계",
    description: "초등 점·선·면·색 조형 요소의 평면적 탐색에서, 중학교 3차원 공간감의 원근법과 비례 원리를 거쳐, 고등학교 현대 시각문화 담론 및 다원적 미술 비평으로 심화되는 조형-비평 체계.",
    stages: [
      {
        schoolLevel: "ES",
        gradeCluster: "초등 5~6학년군",
        standardCode: "[6미01-01]",
        standardTitle: "조형 요소 점·선·면·색",
        concept: "점, 선, 면, 색, 형태 등 기초 조형 요소의 시각적·촉각적 탐색 및 평면적 구성 (Concrete Operational)",
        piagetStage: "Concrete Operational",
        pedagogicalScaffolding: "색종이 콜라주, 물감 혼색 실습 및 촉각 질감 카드를 통한 조형 요소 실험"
      },
      {
        schoolLevel: "MS",
        gradeCluster: "중학교 1~3학년군",
        standardCode: "[9미02-01]",
        standardTitle: "원근법과 비례의 조형 원리",
        concept: "소실점과 눈높이를 이용한 1소점·2소점 투시원근법 및 인체·공간의 비례 원리 (Early Formal Operational)",
        piagetStage: "Early Formal Operational",
        pedagogicalScaffolding: "투명 아크릴판 투시장치 작도 및 소실점 안내선을 이용한 풍경 드로잉"
      },
      {
        schoolLevel: "HS",
        gradeCluster: "고등학교 1~3학년군",
        standardCode: "[12미02-01]",
        standardTitle: "현대 미술 비평과 시각문화",
        concept: "재현을 넘어선 개념 미술, 미디어아트, 포스트모더니즘 미술 담론과 시각문화 비평 (Formal Operational)",
        piagetStage: "Formal Operational",
        pedagogicalScaffolding: "펠드먼(Feldman) 미술 비평 4단계(서술-분석-해석-평가) 적용 및 전시 큐레이팅 보고서 작성"
      }
    ],
    transitions: [
      {
        from: "ES",
        to: "MS",
        piagetTransition: "Concrete Operational ➔ Early Formal Operational",
        cognitiveShift: "평면적 감각 요소(점·선·면)에서 기하학적 투시도법과 수학적 비례를 이용한 3차원 공간 표현으로의 전이"
      },
      {
        from: "MS",
        to: "HS",
        piagetTransition: "Early Formal Operational ➔ Formal Operational",
        cognitiveShift: "조형적 시각 재현 기법에서 작품에 내재된 철학적 개념과 사회문화적 담론을 해석하는 비평적 사고로의 도약"
      }
    ]
  }
});

export const K12_SPIRAL_CHAINS = SPIRAL_CURRICULUM_CHAINS;
export const KOREA_2022_K12_STANDARDS = K12_STANDARDS;

export const SUBJECT_TO_CLUSTER = Object.freeze({
  "국어": "국어", "공통국어": "국어", "독서와 작문": "국어", "화법과 언어": "국어", "문학": "국어", "korean": "국어",
  "영어": "영어", "공통영어": "영어", "영어Ⅰ": "영어", "영어1": "영어", "영어 독해와 작문": "영어", "english": "영어",
  "수학": "수학", "공통수학": "수학", "대수": "수학", "미적분": "수학", "확률과 통계": "수학", "기하": "수학", "mathematics": "수학", "math": "수학",
  "사회": "사회", "통합사회": "사회", "한국사": "사회", "역사": "사회", "경제": "사회", "정치와 법": "사회", "사회·문화": "사회", "social studies": "사회", "social": "사회",
  "도덕": "도덕", "생활과 윤리": "도덕", "윤리와 사상": "도덕", "moral": "도덕", "ethics": "도덕", "moral education": "도덕",
  "과학": "과학", "통합과학": "과학", "물리학": "과학", "화학": "과학", "생명과학": "과학", "지구과학": "과학", "science": "과학", "physics": "과학",
  "실과": "정보", "기술·가정": "정보", "정보": "정보", "인공지능 기초": "정보", "computing": "정보", "informatics": "정보",
  "체육": "체육", "음악": "음악", "미술": "미술", "music": "음악", "art": "미술", "physical education": "체육"
});

/**
 * Korea 2022 K-12 Curriculum Adapter
 */
export class Korea2022K12CurriculumAdapter {
  /**
   * @param {Object} [options]
   * @param {Object} [options.graphEngine]
   */
  constructor(options = {}) {
    this.graphEngine = options.graphEngine || null;
    this.standardsByCode = new Map();
    this.standardsBySchoolLevel = new Map([
      ["ES", []],
      ["MS", []],
      ["HS", []]
    ]);
    this.topicToStandards = new Map();

    this.initIndexes();
  }

  setGraphEngine(engine) {
    this.graphEngine = engine;
  }

  initIndexes() {
    this.standardsByCode.clear();
    this.standardsBySchoolLevel.set("ES", []);
    this.standardsBySchoolLevel.set("MS", []);
    this.standardsBySchoolLevel.set("HS", []);
    this.topicToStandards.clear();

    for (const std of K12_STANDARDS) {
      // Index by full bracketed code
      this.standardsByCode.set(std.code, std);

      // Index by bare code without brackets
      const bareCode = std.code.replace(/[[\]]/g, "");
      this.standardsByCode.set(bareCode, std);

      // Index by school level
      const level = std.schoolLevel || "ES";
      if (!this.standardsBySchoolLevel.has(level)) {
        this.standardsBySchoolLevel.set(level, []);
      }
      this.standardsBySchoolLevel.get(level).push(std);

      // Map micro-topics back to standards
      for (const tid of std.mappedTopicIds || []) {
        if (!this.topicToStandards.has(tid)) {
          this.topicToStandards.set(tid, []);
        }
        this.topicToStandards.get(tid).push(std.code);
      }
    }
  }

  /**
   * Normalizes standard code (e.g. "9수01-01" -> "[9수01-01]")
   */
  normalizeCode(code = "") {
    const trimmed = (code || "").trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      return trimmed;
    }
    return `[${trimmed}]`;
  }

  /**
   * Resolves standard details, school level (ES/MS/HS), grade, subject, and mapped micro-topic ID.
   *
   * @param {string} code e.g. "[9수01-01]" or "9수01-01"
   * @returns {Object|null}
   */
  getK12Standard(code) {
    if (!code) return null;
    const cleanCode = code.trim();
    const normalized = this.normalizeCode(cleanCode);
    const bare = cleanCode.replace(/[[\]]/g, "");

    const rawStd = this.standardsByCode.get(cleanCode) || 
                   this.standardsByCode.get(normalized) || 
                   this.standardsByCode.get(bare);

    if (!rawStd) return null;

    let mappedTopics = [];
    if (this.graphEngine) {
      mappedTopics = (rawStd.mappedTopicIds || []).map(tid => {
        const topic = this.graphEngine.getTopic(tid);
        return topic || { id: tid, name: rawStd.statement, schoolLevel: rawStd.schoolLevel };
      });
    } else {
      mappedTopics = (rawStd.mappedTopicIds || []).map(tid => ({
        id: tid,
        name: rawStd.statement,
        schoolLevel: rawStd.schoolLevel
      }));
    }

    return {
      ...rawStd,
      mappedTopics,
      mappedTopicsCount: mappedTopics.length
    };
  }

  /**
   * Traces the spiral curriculum progression across ES ➔ MS ➔ HS.
   * Supported concept keys:
   * - 'fractions_to_calculus'
   * - 'arithmetic_to_algebra'
   * - 'balance_to_matrix'
   * - 'light_to_optics'
   * - 'force_and_motion' / 'mechanics'
   * - 'code_to_ai'
   *
   * @param {string} conceptKey
   * @returns {Object|null}
   */
  getSpiralCurriculumChain(conceptKey) {
    if (!conceptKey) return null;
    const key = conceptKey.trim().toLowerCase();

    // Map aliases
    let resolvedKey = key;
    if (key === "mechanics") resolvedKey = "force_and_motion";
    if (key === "fractions_to_derivative" || key === "calculus") resolvedKey = "fractions_to_calculus";
    if (key === "algebra") resolvedKey = "arithmetic_to_algebra";
    if (key === "matrix") resolvedKey = "balance_to_matrix";
    if (key === "optics" || key === "light") resolvedKey = "light_to_optics";
    if (key === "ai" || key === "computing") resolvedKey = "code_to_ai";
    if (key === "reading" || key === "korean") resolvedKey = "reading_comprehension";
    if (key === "english" || key === "grammar") resolvedKey = "english_grammar_ladder";
    if (key === "economy" || key === "ratio_economy") resolvedKey = "ratio_to_economy";
    if (key === "ethics" || key === "justice") resolvedKey = "ethics_justice_evolution";
    if (key === "music" || key === "harmony") resolvedKey = "music_harmony_chain";
    if (key === "art" || key === "perspective") resolvedKey = "art_perspective_chain";

    const chain = SPIRAL_CURRICULUM_CHAINS[resolvedKey];
    if (!chain) return null;

    // Enrich stages with live standard resolution
    const enrichedStages = chain.stages.map(st => {
      const std = this.getK12Standard(st.standardCode);
      return {
        ...st,
        standard: std
      };
    });

    return {
      ...chain,
      stages: enrichedStages,
      stagesCount: enrichedStages.length
    };
  }

  /**
   * Searches Korean K-12 standards by keyword, code, domain, or statement.
   * Can be optionally filtered by schoolLevel ('ES' | 'MS' | 'HS') and subject.
   *
   * @param {string} query
   * @param {Object} [options]
   * @param {"ES"|"MS"|"HS"|"ALL"} [options.schoolLevel]
   * @param {string} [options.subject]
   * @param {number} [options.limit=20]
   * @returns {Array<Object>}
   */
  searchK12Standards(query = "", { schoolLevel = null, subject = null, limit = 20 } = {}) {
    const cleanQuery = (query || "").trim().toLowerCase();
    const cleanSchoolLevel = schoolLevel ? schoolLevel.trim().toUpperCase() : null;
    const cleanSubject = subject ? subject.trim().toLowerCase() : null;
    const mappedSubject = cleanSubject ? (SUBJECT_TO_CLUSTER[cleanSubject] || cleanSubject).toLowerCase() : null;

    const results = [];
    const seenCodes = new Set();

    // 1. Direct standard code check
    if (cleanQuery) {
      const direct = this.getK12Standard(cleanQuery);
      if (direct) {
        let match = true;
        if (cleanSchoolLevel && cleanSchoolLevel !== "ALL" && direct.schoolLevel !== cleanSchoolLevel) {
          match = false;
        }
        if (mappedSubject) {
          const directMatch = direct.subject.toLowerCase().includes(mappedSubject) || (cleanSubject && direct.subject.toLowerCase().includes(cleanSubject));
          const cluster = (SUBJECT_TO_CLUSTER[direct.subject] || "").toLowerCase();
          const clusterMatch = cluster.includes(mappedSubject);
          if (!directMatch && !clusterMatch) {
            match = false;
          }
        }
        if (match) {
          results.push({ standard: direct, score: 200 });
          seenCodes.add(direct.code);
        }
      }
    }

    // 2. Iterate all K-12 standards
    for (const std of K12_STANDARDS) {
      if (seenCodes.has(std.code)) continue;

      // School level filter
      if (cleanSchoolLevel && cleanSchoolLevel !== "ALL" && std.schoolLevel !== cleanSchoolLevel) {
        continue;
      }

      // Subject filter
      if (mappedSubject) {
        const directMatch = std.subject.toLowerCase().includes(mappedSubject) || (cleanSubject && std.subject.toLowerCase().includes(cleanSubject));
        const cluster = (SUBJECT_TO_CLUSTER[std.subject] || "").toLowerCase();
        const clusterMatch = cluster.includes(mappedSubject);
        if (!directMatch && !clusterMatch) {
          continue;
        }
      }

      if (!cleanQuery) {
        results.push({ standard: this.getK12Standard(std.code), score: 10 });
        seenCodes.add(std.code);
        continue;
      }

      const codeMatch = std.code.toLowerCase().includes(cleanQuery);
      const statementMatch = std.statement.toLowerCase().includes(cleanQuery);
      const domainMatch = (std.domain || "").toLowerCase().includes(cleanQuery);
      const keywordMatch = (std.keywords || []).some(k => k.toLowerCase().includes(cleanQuery));

      let score = 0;
      if (codeMatch) score += 100;
      if (statementMatch) score += 60;
      if (domainMatch) score += 40;
      if (keywordMatch) score += 50;

      if (score > 0) {
        results.push({ standard: this.getK12Standard(std.code), score });
        seenCodes.add(std.code);
      }
    }

    results.sort((a, b) => b.score - a.score);

    const sliced = (typeof limit === "number" && limit > 0)
      ? results.slice(0, limit)
      : results;

    return sliced.map(r => r.standard);
  }

  /**
   * Bidirectional Korean-English terminology translation.
   *
   * @param {string} term
   * @returns {Object|null}
   */
  translateTerm(term = "") {
    const trimmed = (term || "").trim();
    if (!trimmed) return null;

    // Direct Korean lookup
    if (K12_TERMINOLOGY_DICTIONARY[trimmed]) {
      return {
        korean: trimmed,
        ...K12_TERMINOLOGY_DICTIONARY[trimmed]
      };
    }

    // Reverse lookup by English
    const lower = trimmed.toLowerCase();
    for (const [ko, val] of Object.entries(K12_TERMINOLOGY_DICTIONARY)) {
      if (val.en.toLowerCase() === lower) {
        return {
          korean: ko,
          ...val
        };
      }
    }
    for (const [ko, val] of Object.entries(K12_TERMINOLOGY_DICTIONARY)) {
      if (val.en.toLowerCase().includes(lower)) {
        return {
          korean: ko,
          ...val
        };
      }
    }

    return null;
  }

  /**
   * Reverse mapping: Given a micro-topic ID, finds all K-12 standards addressing it.
   *
   * @param {string} topicId
   * @returns {Array<Object>}
   */
  mapTopicToStandards(topicId) {
    const codes = this.topicToStandards.get(topicId) || [];
    return codes.map(c => this.getK12Standard(c)).filter(Boolean);
  }
}


import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { extractBook } from '../scripts/kr2022/extract-standards.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data/kr-2022/standards.json');
const doc = JSON.parse(readFileSync(DATA, 'utf8'));
const byId = new Map(doc.standards.map((s) => [s.id, s]));
// 원문에서 코드가 겹치지 않는 항목만 코드로 찾는다
const byCode = new Map();
for (const s of doc.standards) byCode.set(s.code, byCode.has(s.code) ? null : s);

// 학년(군) 끝 학년 숫자 + 교과·과목 약호 + (선택적 '-') + 영역 2자리 - 번호 2자리
const CODE = /^\[(2|4|6|9|10|12)[가-힣A-Za-zⅠⅡ()0-9]+?-?\d{2}-\d{2}\]$/;
const LEVEL_BY_GRADE = { 2: 'ES', 4: 'ES', 6: 'ES', 9: 'MS', 10: 'HS', 12: 'HS' };

test('kr2022: 최상위 스키마와 출처 정보', () => {
  assert.equal(doc.schemaVersion, 1);
  assert.equal(doc.source.notice, '교육부 고시 제2022-33호');
  assert.equal(doc.source.noticeDate, '2022-12-22');
  assert.match(doc.source.copyrightBasis, /저작권법 제7조/);
  assert.ok(Array.isArray(doc.source.files) && doc.source.files.length > 0);
  for (const f of doc.source.files) {
    assert.match(f.book, /^별책 \d+$/);
    assert.equal(typeof f.subject, 'string');
    assert.match(f.url, /^https:\/\/www\.ncic\.re\.kr\/inv\/org\/download\.do\?/);
    assert.match(f.retrievedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/);
    assert.match(f.sha256, /^[0-9a-f]{64}$/);
  }
});

test('kr2022: 성취기준 항목 스키마', () => {
  const keys = ['id', 'code', 'subject', 'course', 'schoolLevel', 'gradeBand', 'domain', 'text', 'source', 'parseWarning', 'codeConflict'].sort();
  const books = new Set(doc.source.files.map((f) => f.book));
  for (const s of doc.standards) {
    assert.deepEqual(Object.keys(s).sort(), keys, s.code);
    assert.ok(['ES', 'MS', 'HS'].includes(s.schoolLevel), s.code);
    assert.equal(typeof s.subject, 'string');
    assert.ok(s.subject.length > 0);
    assert.equal(typeof s.course, 'string', `${s.code} course`);
    assert.equal(typeof s.gradeBand, 'string');
    assert.ok(s.domain === null || (typeof s.domain === 'string' && s.domain.length > 0), s.code);
    assert.equal(typeof s.text, 'string');
    assert.ok(s.text.length >= 5, s.code);
    assert.equal(s.text, s.text.trim(), `${s.code} 앞뒤 공백`);
    assert.ok(books.has(s.source.book), s.code);
    assert.ok(s.source.page === null || (Number.isInteger(s.source.page) && s.source.page > 0), s.code);
    assert.ok(s.parseWarning === null || (typeof s.parseWarning === 'string' && s.parseWarning.length > 0));
    assert.match(s.id, /^b\d+:\[[^\]]+\](#\d+)?$/, s.id);
    assert.ok(s.id.startsWith(`b${s.source.book.match(/\d+/)[0]}:${s.code}`), s.id);
    if (s.codeConflict !== null) {
      assert.ok(['same-book-duplicate', 'cross-subject'].includes(s.codeConflict.kind), s.id);
      assert.equal(typeof s.codeConflict.note, 'string');
    }
  }
});

test('kr2022: 코드 형식과 학교급 일치', () => {
  for (const s of doc.standards) {
    assert.match(s.code, CODE, s.code);
    const grade = s.code.match(/^\[(\d{1,2})/)[1];
    assert.equal(s.schoolLevel, LEVEL_BY_GRADE[grade], s.code);
  }
  // 손으로 쓴 이전 데이터의 잘못된 형식([1수01-02] 등)이 섞이지 않았는지
  assert.ok(!doc.standards.some((s) => /^\[(1|3|5|7|8|11)[가-힣]/.test(s.code)));
});

test('kr2022: id는 고유하고, 원문에서 겹치는 코드는 정확히 이 12개다', () => {
  assert.equal(byId.size, doc.standards.length);
  const groups = new Map();
  for (const s of doc.standards) (groups.get(s.code) ?? groups.set(s.code, []).get(s.code)).push(s.id);
  const dup = Object.fromEntries([...groups].filter(([, ids]) => ids.length > 1));
  const cross = (code, a, b) => [code, [`b${a}:${code}`, `b${b}:${code}`]];
  assert.deepEqual(dup, Object.fromEntries([
    cross('[12스문01-01]', 11, 16), cross('[12스문01-02]', 11, 16), cross('[12스문01-03]', 11, 16),
    ...['01-01', '01-02', '01-03', '01-04', '02-01', '02-02', '02-03', '02-04'].map((n) => cross(`[12심독${n}]`, 14, 16)),
    ['[12스경02-02]', ['b21:[12스경02-02]', 'b21:[12스경02-02]#2']],
  ]));
  // 겹치는 코드의 항목에만 codeConflict가 있다
  for (const s of doc.standards) {
    const shared = groups.get(s.code).length > 1;
    assert.equal(s.codeConflict !== null, shared, s.id);
    if (shared) assert.equal(s.codeConflict.kind, s.code === '[12스경02-02]' ? 'same-book-duplicate' : 'cross-subject', s.id);
  }
  assert.equal(byId.get('b21:[12스경02-02]#2').text, '스포츠 행정 및 경영 분야의 관리 사례를 탐색하며 기초적인 실무를 경험한다.');
  assert.equal(byId.get('b16:[12심독01-01]').course, '심화 독일어');
  assert.equal(byId.get('b14:[12심독01-01]').course, '심화 영어 독해와 작문');
});

test('kr2022: 필드 출처 표시(fieldProvenance)', () => {
  const fp = doc.fieldProvenance;
  assert.equal(fp.text, 'verbatim');
  assert.equal(fp.code, 'verbatim');
  for (const k of ['subject', 'course', 'domain', 'id']) assert.equal(fp[k], 'derived-from-structure', k);
  for (const k of ['schoolLevel', 'gradeBand']) assert.equal(fp[k], 'derived-from-code', k);
  const verbatim = Object.entries(fp).filter(([, v]) => v === 'verbatim').map(([k]) => k).sort();
  assert.deepEqual(verbatim, ['code', 'text']);
  assert.match(doc.fieldProvenanceNotes.code, /4사01-01.*12연몸02-04/s);
  assert.match(doc.source.copyrightBasis, /제7조 제2호/);
  assert.match(doc.source.copyrightBasis, /공공누리 제2유형/);
  assert.match(doc.source.copyrightBasis, /법률 자문이 아니/);
});

test('kr2022: 교과별 개수 스냅숏', () => {
  const counts = {};
  for (const s of doc.standards) counts[s.subject] = (counts[s.subject] ?? 0) + 1;
  assert.deepEqual(counts, {
    국어: 257,
    도덕: 103,
    사회: 414,
    수학: 435,
    과학: 473,
    실과: 39,
    '기술·가정': 176,
    정보: 105,
    체육: 148,
    음악: 76,
    미술: 75,
    영어: 270,
    '바른 생활': 16,
    '슬기로운 생활': 16,
    '즐거운 생활': 16,
    제2외국어: 607,
    한문: 45,
    환경: 19,
    보건: 26,
    '진로와 직업': 14,
    '과학 계열 선택 과목': 389,
    '체육 계열 선택 과목': 91,
    '예술 계열 선택 교과': 486,
  });
  assert.equal(doc.standards.length, 4296);
  // 외부 근거: 이민구·류성림(2023), 한국학교수학회논문집 26(4) — "2022 개정 초등수학 교육과정에서 성취기준의 총 개수는 121개"
  assert.equal(doc.standards.filter((s) => s.subject === '수학' && s.schoolLevel === 'ES').length, 121);
});

// 아래 문장은 PDF(pdftotext) 원문 줄을 직접 보고 확인했다. 줄바꿈만 이어 붙였다.
// [12화실02-12]의 '내림을 현상을'처럼 원문의 오기도 그대로 둔다.
test('kr2022: 원문 샘플 34개와 정확히 일치', () => {
  const samples = {
    '[10공수2-01-02]': '두 직선의 평행 조건과 수직 조건을 탐구하고 이해한다.',
    '[2즐04-03]': '생각이나 느낌을 살려 전시나 공연 활동을 한다.',
    '[12무대02-01]': '무대에서 제공되는 빛의 특성을 이해하고, 연극 공연에서 무대조명의 역할을 탐구한다.',
    '[12촬조02-03]': '조명의 위치와 방향에 따른 화면의 차이를 이해하고, 피사체를 중심으로 여러 각도에 따른 조명 방식을 익힌다.',
    '[4수03-19]': '실생활 문제 상황과 연결하여 들이의 덧셈과 뺄셈을 할 수 있다.',
    '[12생활02-05]': '패션디자인과 머천다이징에 대한 이해를 바탕으로 패션상품을 기획하고 디자인을 하며 하나의 브랜드를 기획한다.',
    '[12고물04-06]': '쿼크, 렙톤, 매개 입자의 특성과 핵분열과 핵융합의 기본 과정, 별에서의 핵융합 반응과 플라스마에 관해 설명할 수 있다.',
    '[12시창01-03]': '시에서 심상이 나타내는 특징을 바탕으로 감각의 구체화 과정을 이해한다.',
    '[12화실02-12]': '증기압 내림을 현상을 관찰하고, 이를 열역학 관점에서 설명할 수 있다.',
    '[12데과01-02]': '정형 데이터와 비정형 데이터를 구분하고, 데이터 속성에서 데이터의 잠재적 가치를 파악한다.',
    '[2국05-04]': '시나 노래, 이야기에 흥미를 가진다.',
    '[12정치01-03]': '민주 정치의 역사적 발전 과정을 이해하고, 현대 민주 정치의 다양한 사상적 배경을 비교⋅분석한다.',
    '[4국01-01]': '중요한 내용과 주제를 파악하며 듣고 그 내용을 요약한다.',
    '[2수01-01]': '수의 필요성을 인식하면서 0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.',
    '[6과01-01]': '지층의 특징을 알고, 지층의 형성 과정을 모형으로 표현할 수 있다.',
    '[2바01-01]': '학교 생활 습관과 학습 습관을 형성하여 안전하고 건강하게 생활한다.',
    '[6실01-01]': '아동기의 발달 특징을 이해하고 성장발달에 필요한 조건과 방법을 탐색한다.',
    '[9과01-01]': '과학적 탐구 방법을 이해하고, 일상생활의 문제에 대한 과학적 해결 방안을 제안할 수 있다.',
    '[4도01-01]': '자신의 감정을 소중히 여기며 존중하는 태도를 바탕으로 내가 누구인가를 탐구한다.',
    '[9사(지리)01-01]': '세계 여러 지역의 특성을 해당 지역의 위치와 자연⋅인문환경을 고려하여 추론한다.',
    '[9역01-01]': '역사와 역사 탐구의 의미를 파악하고, 역사 학습의 목적을 다각도로 탐색한다.',
    '[10통사1-01-01]': '인간, 사회, 환경을 바라보는 시간적, 공간적, 사회적, 윤리적 관점의 의미와 특징을 사례를 통해 파악한다.',
    '[9국01-01]': '화자의 의도와 관점을 추론하며 듣는다.',
    '[12문학01-01]': '문학이 인간과 세계에 대한 이해를 돕고, 삶의 의미를 깨닫게 하며, 정서적⋅미적으로 삶을 고양함을 이해한다.',
    '[9영01-01]': '단어, 어구, 문장을 듣고 연음이나 축약된 소리를 식별한다.',
    '[6체01-01]': '건강 체력과 운동 체력의 의미와 요소를 파악하고 다양한 운동 방법을 탐색한다.',
    '[9음01-01]': '다양한 주법과 표현 기법을 향상시켜 노래나 악기로 개성 있게 연주한다.',
    '[6미01-01]': '다양한 감각과 매체를 활용하여 자신과 대상을 탐색할 수 있다.',
    '[9기가01-01]': '자아 존중감을 향상시키고 긍정적인 자아 정체성을 형성하기 위해 청소년기의 발달 특징을 자신의 발달 특징과 연결 지어 자신을 총체적으로 이해한다.',
    '[9정01-01]': '컴퓨팅 시스템의 구성요소와 동작 원리를 이해하고, 운영 체제의 기능을 분석한다.',
    '[9환01-01]': '일상생활이 환경에 미치는 영향과 환경이 일상생활에 미치는 영향을 조사하여 인간과 환경의 관계를 탐색하고, 환경에 대한 우리의 역할과 책임을 인식한다.',
    '[9한01-01]': '한자의 모양⋅음⋅뜻을 구별한다.',
    '[12물리01-01]': '물체에 작용하는 알짜힘과 돌림힘이 0일 때 평형을 이룸을 알고, 다양한 구조물의 안정성을 분석할 수 있다.',
    '[10한사1-01-01]': '고대 국가의 형성과 성장 과정을 파악한다.',
  };
  for (const [code, text] of Object.entries(samples)) {
    const s = byCode.get(code);
    assert.ok(s, `${code} 없음(또는 원문 코드 중복)`);
    assert.equal(s.text, text, code);
    assert.equal(s.parseWarning, null, code);
  }
  const math = byCode.get('[2수01-01]');
  assert.equal(math.subject, '수학');
  assert.equal(math.gradeBand, '초등학교 1~2학년');
  assert.equal(math.domain, '수와 연산');
  assert.equal(math.source.book, '별책 8');
});

test('kr2022: 원문 이상은 고치지 않고 parseWarning으로 남긴다', () => {
  // 원문 코드가 '[4사01–01]'(en dash) — 코드만 정규화, 경고 기록
  assert.match(byCode.get('[4사01-01]').parseWarning, /4사01–01/);
  // 원문에 여는 대괄호가 빠진 '12연몸02-04]'
  assert.match(byCode.get('[12연몸02-04]').parseWarning, /여는 대괄호 누락/);
  // 수식 개체는 경고 없이 평문화하지 않는다
  assert.match(byCode.get('[10공수2-01-07]').parseWarning, /수식 개체/);
});

test('kr2022: extractBook 이 해설 영역의 코드 문단을 성취기준으로 세지 않는다', () => {
  const paragraphs = [
    '1. 성격 및 목표',
    '나. 성취기준',
    '[초등학교 1∼2학년]',
    '(1) 수와 연산',
    '[2수01-01] 첫 문장이다.',
    '[2수01-02] 둘째 문장이다.',
    '(가) 성취기준 해설',
    '[2수01-01] 해설 문장이므로 제외된다.',
    '(나) 성취기준 적용 시 고려 사항',
    '(2) 변화와 관계',
    '[2수02-01] 셋째 문장이다.',
    '3. 교수⋅학습 및 평가',
    '[2수02-01] 범위 밖이라 제외된다.',
  ];
  const rows = extractBook(paragraphs, { book: '별책 8', subject: '수학' });
  assert.deepEqual(rows.map((r) => [r.code, r.body, r.domain]), [
    ['[2수01-01]', '첫 문장이다.', '수와 연산'],
    ['[2수01-02]', '둘째 문장이다.', '수와 연산'],
    ['[2수02-01]', '셋째 문장이다.', '변화와 관계'],
  ]);
});

test('kr2022: 원문 전체 재추출이 standards.json과 바이트 동일 (KR2022_RAW_DIR 있을 때만)', (t) => {
  const raw = process.env.KR2022_RAW_DIR;
  if (!raw || !existsSync(raw)) {
    console.log('[kr2022] KR2022_RAW_DIR가 없어 원문 재추출 비교를 건너뜁니다(skip).');
    t.skip('KR2022_RAW_DIR not set');
    return;
  }
  const out = path.join(mkdtempSync(path.join(tmpdir(), 'kr2022-')), 'standards.json');
  const r = spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/kr2022/extract-standards.mjs'), '--raw-dir', raw, '--out', out, '--no-report'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(readFileSync(out).equals(readFileSync(DATA)), '재추출 결과가 커밋된 standards.json과 다르다');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractBook } from '../scripts/kr2022/extract-standards.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data/kr-2022/standards.json');
const doc = JSON.parse(readFileSync(DATA, 'utf8'));
const byCode = new Map(doc.standards.map((s) => [s.code, s]));

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
  const keys = ['code', 'subject', 'course', 'schoolLevel', 'gradeBand', 'domain', 'text', 'source', 'parseWarning'].sort();
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

test('kr2022: 코드 중복 없음', () => {
  assert.equal(byCode.size, doc.standards.length);
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
    제2외국어: 596,
    한문: 45,
    환경: 19,
    보건: 26,
    '진로와 직업': 14,
    '과학 계열 선택 과목': 389,
    '체육 계열 선택 과목': 90,
    '예술 계열 선택 교과': 486,
  });
  assert.equal(doc.standards.length, 4284);
  // 외부 근거: 이민구·류성림(2023), 한국학교수학회논문집 26(4) — "2022 개정 초등수학 교육과정에서 성취기준의 총 개수는 121개"
  assert.equal(doc.standards.filter((s) => s.subject === '수학' && s.schoolLevel === 'ES').length, 121);
});

test('kr2022: 원문 샘플과 정확히 일치 (PDF 원문에서 직접 확인한 문장)', () => {
  const samples = {
    '[2수01-01]': '수의 필요성을 인식하면서 0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.',
    '[4국01-01]': '중요한 내용과 주제를 파악하며 듣고 그 내용을 요약한다.',
    '[2바01-01]': '학교 생활 습관과 학습 습관을 형성하여 안전하고 건강하게 생활한다.',
    '[6실01-01]': '아동기의 발달 특징을 이해하고 성장발달에 필요한 조건과 방법을 탐색한다.',
    '[9과01-01]': '과학적 탐구 방법을 이해하고, 일상생활의 문제에 대한 과학적 해결 방안을 제안할 수 있다.',
  };
  for (const [code, text] of Object.entries(samples)) {
    const s = byCode.get(code);
    assert.ok(s, `${code} 없음`);
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

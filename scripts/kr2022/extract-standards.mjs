#!/usr/bin/env node
// 2022 개정 교육과정(교육부 고시 제2022-33호) 별책 원문에서 성취기준(코드+문장)을 추출한다.
//
// 사용법:
//   node scripts/kr2022/extract-standards.mjs --raw-dir <원문 폴더> [--out data/kr-2022/standards.json]
//
// <원문 폴더>에는 data/kr-2022/sources.json 에 적힌 HWP/PDF 파일이 그 파일명으로 있어야 한다.
// 파일마다 sha256을 확인하고, 다르면 중단한다(다른 판본을 조용히 섞지 않기 위해).
//
// 원칙
// - 문장 본문은 HWP 문단 텍스트를 그대로 쓴다(앞뒤 공백만 제거). HWP 문단에는 화면 줄바꿈이 없어
//   PDF처럼 줄 잇기를 추측할 필요가 없다.
// - 같은 문장을 PDF(pdftotext) 텍스트와 공백을 무시하고 대조해 쪽 번호를 찾는다. 대조가 안 되면
//   parseWarning 에 남긴다. 문장은 고치지 않는다.
// - 수식 개체는 한컴 수식 스크립트로만 존재한다. 한 글자 변수(x, y=x 등)와 times/div 만 평문으로
//   옮기고, 나머지는 {{EQ:스크립트}} 로 남긴다. 어느 경우든 parseWarning 에 적는다.
// - 코드 표기의 대시 변형(–, −)은 '-'로 정규화하고 parseWarning 에 원래 표기를 적는다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hwpParagraphs } from './lib/hwp5.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');

function parseArgs(argv) {
  const args = { out: join(repoRoot, 'data/kr-2022/standards.json'), sources: join(repoRoot, 'data/kr-2022/sources.json') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--raw-dir') args.rawDir = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--sources') args.sources = argv[++i];
    else if (a === '--report') args.report = argv[++i];
    else if (a === '--no-report') args.noReport = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  if (!args.rawDir) throw new Error('--raw-dir <dir> is required');
  args.report ??= join(dirname(args.out), 'extraction-report.json');
  return args;
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

function loadVerified(rawDir, file) {
  const buf = readFileSync(join(rawDir, file.fileName));
  const got = sha256(buf);
  if (got !== file.sha256) throw new Error(`sha256 mismatch for ${file.fileName}: expected ${file.sha256}, got ${got}`);
  return buf;
}

// ---- 코드 ----------------------------------------------------------------
// [학년(군) 숫자][교과·과목 약호][-]영역 2자리-번호 2자리]. 약호에는 숫자·로마숫자·괄호가 올 수 있다
// (예: [10공수1-01-01], [12미적Ⅰ-02-03], [9사(지리)01-01]).
const DASH = '[-–−‐]';
// 원문에 여는 대괄호가 빠진 경우가 있어(별책 22 '12연몸02-04] …') '['는 선택으로 받고 경고를 남긴다.
const CODE_AT_START = new RegExp(`^\\[?(\\d{1,2})([^\\[\\]\\s\\d–−‐-][^\\[\\]\\s]*?)${DASH}?(\\d{2})${DASH}(\\d{2})\\](?=\\s)`);
export const CODE_FORMAT = /^\[(2|4|6|9|10|12)[^\[\]\s\d-][^\[\]\s]*?-?\d{2}-\d{2}\]$/;

function normalizeCode(raw) {
  return (raw.startsWith('[') ? raw : `[${raw}`).replace(/[–−‐]/g, '-');
}

function schoolLevelOf(grade) {
  if (grade === '2' || grade === '4' || grade === '6') return 'ES';
  if (grade === '9') return 'MS';
  if (grade === '10' || grade === '12') return 'HS';
  return null;
}

// ---- 수식 ----------------------------------------------------------------
const EQ = /\{\{EQ:([\s\S]*?)\}\}/g;
function renderEquations(text) {
  const notes = [];
  const out = text.replace(EQ, (m, script) => {
    const s = script.replace(/[`~\s]/g, '');
    if (s === 'times') { notes.push('times→×'); return '×'; }
    if (s === 'div') { notes.push('div→÷'); return '÷'; }
    // 한 글자 변수와 숫자·기본 연산자만으로 된 수식(두 글자 이상 이어진 영문 없음)
    if (/^[A-Za-z0-9=+\-<>(),.]+$/.test(s) && !/[A-Za-z]{2}/.test(s)) { notes.push(s); return s; }
    notes.push(`{{EQ:${script}}}`);
    return m;
  });
  const kept = (out.match(EQ) || []).length;
  let warning = null;
  if (notes.length) {
    warning = kept
      ? `수식 개체 ${notes.length}개 중 ${kept}개는 한컴 수식 스크립트를 {{EQ:…}}로 보존함`
      : `수식 개체 ${notes.length}개를 평문으로 옮김: ${notes.join(', ')}`;
  }
  return { text: out, warning };
}

// ---- PDF 대조 ------------------------------------------------------------
function pdfPages(pdfPath) {
  const r = spawnSync('pdftotext', ['-enc', 'UTF-8', pdfPath, '-'], { maxBuffer: 1 << 28, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`pdftotext failed for ${pdfPath}: ${r.stderr}`);
  return r.stdout.split('\f');
}

// 공백·사적영역 글리프(PDF 글꼴 매핑 실패)·대시 변형을 무시하고 비교한다.
const squash = (s) => s.replace(/[\s\ue000-\uf8ff]/g, '').replace(/[–−‐]/g, '-').replace(/[･·⋅∙]/g, '·');

// 반환: { page, exact }. exact=true 는 코드 바로 뒤에 문장 전체가 (수식 자리 말고는) 빈틈없이
// 이어서 나온다는 뜻이다. 수식 자리에는 PDF가 글리프를 어떻게 뽑았는지 알 수 없어 40자까지 허용한다.
// exact 대조가 실패하면 코드+첫 12자만으로 쪽만 찾는다(exact=false).
function locateInPdf(pagesSquashed, code, textNoEq) {
  const head = squash(code);
  const parts = squash(textNoEq).split('\u0000');
  const tryAt = (window) => {
    let pos = head.length;
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];
      if (!seg) continue;
      const at = window.indexOf(seg, pos);
      const gapAllowed = i > 0 ? 40 : 0; // 첫 조각 앞에 수식이 없으면 코드 바로 뒤여야 한다
      if (at === -1 || at - pos > gapAllowed) return false;
      pos = at + seg.length;
    }
    return true;
  };
  let loose = null;
  const probe = head + (parts[0] || '').slice(0, 12);
  for (let p = 0; p < pagesSquashed.length; p++) {
    let idx = pagesSquashed[p].indexOf(head);
    while (idx !== -1) {
      const window = pagesSquashed[p].slice(idx) + (pagesSquashed[p + 1] ?? '');
      if (tryAt(window)) return { page: p + 1, exact: true };
      if (loose === null && window.startsWith(probe)) loose = p + 1;
      idx = pagesSquashed[p].indexOf(head, idx + 1);
    }
  }
  return { page: loose, exact: false };
}

// ---- 구조 추적 ------------------------------------------------------------
const GRADE_HEADING = /^\[(초등학교|중학교|고등학교)\s*([0-9]\s*[~∼]\s*[0-9]\s*학년)?[^\]]*\]$/;
const DOMAIN_HEADING = /^\((\d{1,2})\)\s*(.+)$/;
const SECTION_RESET = /^(\d\.\s|가\.\s*내용 체계|다\.\s)/;
const EXPL_HEADING = /^\((가|나|다)\)\s*성취기준/;
const COURSE_PREFIX = /^(일반 선택|진로 선택|융합 선택|공통)( 과목)?\s*[-–]\s*/;

function gradeBandOf(code, gradeHeading) {
  const g = code.match(/^\[(\d{1,2})/)[1];
  if (g === '2') return '초등학교 1~2학년';
  if (g === '4') return '초등학교 3~4학년';
  if (g === '6') return '초등학교 5~6학년';
  if (g === '9') return '중학교 1~3학년';
  if (g === '10') return '고등학교 공통 과목';
  if (g === '12') return '고등학교 선택 과목';
  return gradeHeading;
}

function looksLikeTitle(s) {
  return s.length > 0 && s.length <= 40 && !/[.。]$/.test(s) && !/^\[(그림|표)/.test(s) && !/[‘’]/.test(s.slice(0, 1));
}

function pickCourse(chapterTitle, bracketCourses, abbr) {
  const title = (chapterTitle || '').replace(COURSE_PREFIX, '').trim();
  const parts = title.split(/\s*,\s*/).filter(Boolean);
  const candidates = [...new Set([...bracketCourses, ...parts])];
  if (candidates.length <= 1) return title || null;
  const tail = abbr.match(/([0-9]|[ⅠⅡⅢ])$/);
  if (tail) {
    const hit = candidates.find((c) => c.replace(/\s+/g, '').endsWith(tail[1]));
    if (hit) return hit.replace(/\s+(?=[0-9ⅠⅡⅢ]$)/, '');
  }
  return title || null;
}

export function extractBook(paragraphs, book) {
  const found = [];
  let region = 'none';
  let gradeHeading = null;
  let domain = null;
  let chapterTitle = null;
  let bracketCourses = [];
  let lastShort = null;

  for (let i = 0; i < paragraphs.length; i++) {
    const raw = paragraphs[i];
    const s = raw.trim();
    if (!s) continue;

    if (s === '1. 성격 및 목표') {
      chapterTitle = lastShort;
      bracketCourses = [];
      region = 'none';
      continue;
    }
    const br = s.match(/^\[([^\]]+)\]$/);
    if (br && !CODE_AT_START.test(s + ' ')) {
      if (GRADE_HEADING.test(s)) {
        gradeHeading = s.slice(1, -1);
        if (region !== 'none') region = 'list';
      } else if (/[가-힣A-Za-z]\s*[0-9ⅠⅡⅢ]$/.test(br[1]) && !/별표|예시|그림|표/.test(br[1])) {
        bracketCourses.push(br[1].trim());
      }
      continue;
    }
    if (/^나\.\s*성취기준/.test(s)) { region = 'list'; domain = null; continue; }
    if (EXPL_HEADING.test(s)) { region = 'expl'; continue; }
    const dm = s.match(DOMAIN_HEADING);
    if (dm && region !== 'none' && !CODE_AT_START.test(s)) {
      domain = dm[2].trim();
      region = 'list';
      continue;
    }
    if (SECTION_RESET.test(s)) { region = 'none'; continue; }

    const m = s.match(CODE_AT_START);
    if (m) {
      if (region !== 'list') continue;
      const rawCode = m[0];
      const code = normalizeCode(rawCode);
      const body = s.slice(rawCode.length).trim();
      found.push({ index: i, rawCode, code, grade: m[1], abbr: m[2], body, domain, gradeHeading, chapterTitle, bracketCourses: [...bracketCourses] });
      continue;
    }
    if (looksLikeTitle(s)) lastShort = s;
  }
  return found.map((f) => ({ ...f, book: book.book, subject: book.subjectFor?.(f) ?? book.subject }));
}

// 별책 하나에 여러 교과가 들어 있는 경우의 교과명(코드 약호 기준)
const SUBJECT_BY_ABBR = {
  '별책 10': (f) => {
    if (f.abbr === '실') return '실과';
    if (f.abbr === '기가' || ['로봇', '생활', '창공', '지재', '아동', '자립'].includes(f.abbr)) return '기술·가정';
    return '정보';
  },
  '별책 15': (f) => ({ 바: '바른 생활', 슬: '슬기로운 생활', 즐: '즐거운 생활' })[f.abbr],
  '별책 18': (f) => ({ 환: '환경', 보: '보건', 진로: '진로와 직업' })[f.abbr],
};

// 초·중학교(공통 교육과정)의 과목명: 별책 하나에 여럿이 있을 때만 약호로 나눈다.
const MS_COURSE_BY_ABBR = {
  '사(지리)': '사회', '사(일사)': '사회', 역: '역사',
  생독: '생활 독일어', 생프: '생활 프랑스어', 생스: '생활 스페인어', 생중: '생활 중국어',
  생일: '생활 일본어', 생러: '생활 러시아어', 생아: '생활 아랍어', 생베: '생활 베트남어',
  기가: '기술·가정', 정: '정보', 실: '실과', 바: '바른 생활', 슬: '슬기로운 생활', 즐: '즐거운 생활',
  환: '환경', 보: '보건', 진로: '진로와 직업',
};

function courseFor(f) {
  if (f.grade !== '10' && f.grade !== '12') return MS_COURSE_BY_ABBR[f.abbr] ?? f.subject;
  return pickCourse(f.chapterTitle, f.bracketCourses, f.abbr);
}

// 어떤 필드가 원문 그대로이고 어떤 필드가 구조·코드 약호에서 붙인 값인지 (standards.json 최상위에 기록)
export const FIELD_PROVENANCE = {
  id: { kind: 'derived-from-structure', note: '"b<별책 번호>:<code>". 같은 별책 안에서 같은 코드가 다시 나오면 출현 순번 "#2"를 붙인다. 원문에 없는 식별자.' },
  code: { kind: 'verbatim', note: '원문 코드 그대로. 예외 3건: [4사01-01]·[4사01-02](원문 en dash "–"를 "-"로 정규화), [12연몸02-04](원문에 여는 대괄호 누락, 코드에만 보충). 세 건 모두 parseWarning에 원래 표기가 있다. 원문 자체가 같은 코드를 두 번 쓰는 12건은 codeConflict 참고.' },
  text: { kind: 'verbatim', note: 'HWP 문단 텍스트 그대로(앞뒤 공백만 제거). 수식 개체는 평문 변환 또는 {{EQ:스크립트}}로 표기하고 parseWarning에 적는다.' },
  subject: { kind: 'derived-from-structure', note: '별책 이름. 별책 10·15·18처럼 한 별책에 여러 교과가 있으면 코드 약호로 나눈다.' },
  course: { kind: 'derived-from-structure', note: '초·중학교는 교과명 또는 코드 약호 대응표, 고등학교는 "1. 성격 및 목표" 앞의 과목 제목과 [과목명] 소제목에서 추정.' },
  schoolLevel: { kind: 'derived-from-code', note: '코드 앞 숫자: 2·4·6 → ES, 9 → MS, 10·12 → HS' },
  gradeBand: { kind: 'derived-from-code', note: '코드 앞 숫자에서 정함(2 → 초등학교 1~2학년 … 10 → 고등학교 공통 과목, 12 → 고등학교 선택 과목)' },
  domain: { kind: 'derived-from-structure', note: '성취기준 목록 위의 "(n) 영역명" 소제목. 소제목이 없는 과목은 null.' },
  source: { kind: 'derived-from-structure', note: 'book은 별책 번호, page는 PDF 텍스트 대조로 찾은 PDF 물리 쪽 순번' },
  parseWarning: { kind: 'derived-from-structure', note: '추출기가 남긴 경고' },
  codeConflict: { kind: 'derived-from-structure', note: '원문에서 같은 코드가 둘 이상의 항목에 쓰인 경우만 값이 있다' },
};

export const COPYRIGHT_BASIS =
  '저작권법 제7조 제2호(국가 또는 지방자치단체의 고시)에 따라 고시 원문(별책 포함)은 보호받지 못하는 저작물이라고 보는 것이 이 저장소의 판단이다. ' +
  '다만 원문을 받은 NCIC 게시물에는 공공누리 제2유형(출처표시·상업적 이용 금지) 표시가 붙어 있다. ' +
  '해설서·평가기준 등 고시가 아닌 자료는 포함하지 않았다. 이 표기는 법률 자문이 아니며, 상업적으로 이용하기 전에는 권리자(교육부·NCIC)에게 확인해야 한다.';

function main() {
  const args = parseArgs(process.argv.slice(2));
  const sources = JSON.parse(readFileSync(args.sources, 'utf8'));
  const standards = [];
  const report = { generatedBy: 'scripts/kr2022/extract-standards.mjs', books: [], unextractedCodes: [] };

  for (const book of sources.books) {
    const hwp = book.files.find((x) => x.format === 'hwp');
    const pdf = book.files.find((x) => x.format === 'pdf');
    const paragraphs = hwpParagraphs(loadVerified(args.rawDir, hwp));
    loadVerified(args.rawDir, pdf);
    const pages = pdfPages(join(args.rawDir, pdf.fileName)).map(squash);
    const bookNo = book.book.match(/\d+/)[0];

    const subjectFor = SUBJECT_BY_ABBR[book.book];
    const rows = extractBook(paragraphs, { ...book, subjectFor });

    // 문단 맨 앞에 코드가 있지만 성취기준 목록 영역 밖에서만 나온 코드(검토용)
    const listed = new Set(rows.map((r) => r.code));
    const anywhere = new Set();
    for (const p of paragraphs) {
      const m = p.trim().match(CODE_AT_START);
      if (m) anywhere.add(normalizeCode(m[0]));
    }
    for (const c of anywhere) if (!listed.has(c)) report.unextractedCodes.push({ book: book.book, code: c });

    const occurrence = new Map();
    for (const r of rows) {
      const n = (occurrence.get(r.code) ?? 0) + 1;
      occurrence.set(r.code, n);
      const warnings = [];
      if (!r.rawCode.startsWith('[')) warnings.push(`원문 코드 표기: ${r.rawCode} (여는 대괄호 누락, 코드에만 보충)`);
      else if (r.rawCode !== r.code) warnings.push(`원문 코드 표기: ${r.rawCode}`);
      const eq = renderEquations(r.body);
      if (eq.warning) warnings.push(eq.warning);
      if (/[\n\t]/.test(r.body)) warnings.push('문단 안에 줄바꿈/탭이 있음(원문 그대로 둠)');
      if (!/[.?!]$/.test(eq.text.trim()) && !/\}\}$/.test(eq.text.trim())) warnings.push('문장이 마침표로 끝나지 않음');
      const textNoEq = r.body.replace(EQ, '\u0000');
      const { page, exact } = locateInPdf(pages, r.rawCode, textNoEq);
      if (page === null) warnings.push('PDF 텍스트와 대조되지 않음(쪽 번호 미확인)');
      else if (!exact) warnings.push('PDF 텍스트와 문장 전체 대조 실패(코드와 앞부분으로만 쪽 확인)');
      standards.push({
        id: `b${bookNo}:${r.code}${n > 1 ? `#${n}` : ''}`,
        code: r.code,
        subject: r.subject,
        course: courseFor(r),
        schoolLevel: schoolLevelOf(r.grade),
        gradeBand: gradeBandOf(r.code, r.gradeHeading),
        domain: r.domain,
        text: eq.text,
        source: { book: book.book, page },
        parseWarning: warnings.length ? warnings.join('; ') : null,
        codeConflict: null,
      });
    }
    report.books.push({ book: book.book, subject: book.subject, extracted: rows.length, uniqueCodesAnywhere: anywhere.size });
  }

  // 원문에서 같은 코드가 여러 항목에 쓰인 경우. 버리지 않고 모두 넣고 표시만 한다.
  const byCode = new Map();
  for (const s of standards) (byCode.get(s.code) ?? byCode.set(s.code, []).get(s.code)).push(s);
  report.codeConflicts = [];
  for (const [code, list] of byCode) {
    if (list.length < 2) continue;
    const sameBook = new Set(list.map((s) => s.source.book)).size === 1;
    const kind = sameBook ? 'same-book-duplicate' : 'cross-subject';
    const where = list.map((s) => `${s.source.book} '${s.course}'`).join(', ');
    const note = sameBook
      ? `원문 ${list[0].source.book} 성취기준 목록에 같은 코드가 ${list.length}번 나오고 문장이 다르다(${list.map((s) => s.id).join(', ')}). 원문 오기로 보이나 코드는 고치지 않았다.`
      : `원문에서 서로 다른 과목이 같은 코드를 쓴다: ${where}. 구별은 id로 한다.`;
    for (const s of list) s.codeConflict = { kind, note };
    report.codeConflicts.push({ code, kind, ids: list.map((s) => s.id) });
  }
  const ids = new Set(standards.map((s) => s.id));
  if (ids.size !== standards.length) throw new Error('internal: id is not unique');

  const out = {
    schemaVersion: 1,
    source: {
      notice: '교육부 고시 제2022-33호',
      noticeDate: '2022-12-22',
      copyrightBasis: COPYRIGHT_BASIS,
      pageBasis: 'PDF 파일의 물리적 쪽 순번(1부터). 인쇄된 쪽 번호와 다를 수 있음',
      files: sources.books.flatMap((b) => b.files.map((f) => ({ book: b.book, subject: b.subject, format: f.format, url: f.url, retrievedAt: f.retrievedAt, sha256: f.sha256 }))),
    },
    fieldProvenance: Object.fromEntries(Object.entries(FIELD_PROVENANCE).map(([k, v]) => [k, v.kind])),
    fieldProvenanceNotes: Object.fromEntries(Object.entries(FIELD_PROVENANCE).map(([k, v]) => [k, v.note])),
    standards,
  };
  mkdirSync(dirname(args.out), { recursive: true });
  writeFileSync(args.out, JSON.stringify(out, null, 2) + '\n');
  report.totals = {
    standards: standards.length,
    parseWarnings: standards.filter((s) => s.parseWarning).length,
    pageUnknown: standards.filter((s) => s.source.page === null).length,
    codesWithConflict: report.codeConflicts.length,
  };
  if (!args.noReport) writeFileSync(args.report, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report.totals));
}

if (import.meta.url === `file://${process.argv[1]}`) main();

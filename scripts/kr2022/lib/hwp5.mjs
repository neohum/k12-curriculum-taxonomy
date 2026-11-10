// HWP 5.x 본문 텍스트 추출기 (의존성 없음: node:zlib 만 사용).
// 한컴 공개 문서 "한글 문서 파일 형식 5.0"의 CFB 컨테이너 + 레코드 구조만 읽는다.
// 결과는 문단 단위 문자열 배열이다. HWP 문단에는 화면 줄바꿈이 없으므로
// PDF 텍스트처럼 "줄바꿈을 공백으로 이을지" 추측할 필요가 없다.
//
// 입력은 인터넷에서 받은 파일이므로 신뢰하지 않는다. 섹터 번호·체인·디렉터리 트리·
// 스트림 크기·압축 해제 크기·레코드 길이를 모두 범위 검사하고, 어긋나면 Hwp5FormatError로 멈춘다.
import { inflateRawSync } from 'node:zlib';

const FREESECT = 0xffffffff;
const ENDOFCHAIN = 0xfffffffe;

export const DEFAULT_LIMITS = Object.freeze({
  maxStreamBytes: 64 * 1024 * 1024, // CFB 스트림 하나의 최대 크기
  maxInflateBytes: 128 * 1024 * 1024, // BodyText 섹션 하나의 압축 해제 최대 크기
  maxDirEntries: 100_000,
});

export class Hwp5FormatError extends Error {
  constructor(message) {
    super(`HWP5: ${message}`);
    this.name = 'Hwp5FormatError';
  }
}
const fail = (msg) => {
  throw new Hwp5FormatError(msg);
};

function readCfb(buf, limits) {
  if (buf.length < 512) fail(`file too small for a CFB header (${buf.length} bytes)`);
  if (buf.readUInt32LE(0) !== 0xe011cfd0 || buf.readUInt32LE(4) !== 0xe11ab1a1) {
    fail('not an OLE compound file (HWP 5.x expected)');
  }
  const secShift = buf.readUInt16LE(0x1e);
  const miniShift = buf.readUInt16LE(0x20);
  if (secShift !== 9 && secShift !== 12) fail(`unsupported sector shift ${secShift}`);
  if (miniShift !== 6) fail(`unsupported mini sector shift ${miniShift}`);
  const secSize = 1 << secShift;
  const miniSecSize = 1 << miniShift;
  const numFatSec = buf.readUInt32LE(0x2c);
  const firstDirSec = buf.readUInt32LE(0x30);
  const miniCutoff = buf.readUInt32LE(0x38);
  const firstMiniFatSec = buf.readUInt32LE(0x3c);
  let difatSec = buf.readUInt32LE(0x44);
  const totalSectors = Math.floor((buf.length - secSize) / secSize);
  if (numFatSec > totalSectors) fail(`FAT sector count ${numFatSec} exceeds file size`);

  const sectorOffset = (s) => {
    if (s >= totalSectors) fail(`sector ${s} out of range (file has ${totalSectors} sectors)`);
    return (s + 1) * secSize;
  };

  const fatSectors = [];
  for (let i = 0; i < 109 && fatSectors.length < numFatSec; i++) {
    const s = buf.readUInt32LE(0x4c + i * 4);
    if (s !== FREESECT) fatSectors.push(s);
  }
  const difatSeen = new Set();
  while (difatSec !== ENDOFCHAIN && difatSec !== FREESECT && fatSectors.length < numFatSec) {
    if (difatSeen.has(difatSec)) fail(`cyclic DIFAT chain at sector ${difatSec}`);
    if (difatSeen.size > totalSectors) fail('DIFAT chain longer than the file');
    difatSeen.add(difatSec);
    const off = sectorOffset(difatSec);
    const per = secSize / 4 - 1;
    for (let i = 0; i < per && fatSectors.length < numFatSec; i++) {
      const s = buf.readUInt32LE(off + i * 4);
      if (s !== FREESECT) fatSectors.push(s);
    }
    difatSec = buf.readUInt32LE(off + per * 4);
  }
  const fat = [];
  for (const s of fatSectors) {
    const off = sectorOffset(s);
    for (let i = 0; i < secSize / 4; i++) fat.push(buf.readUInt32LE(off + i * 4));
  }

  // 체인을 따라가며 순환·범위·길이 상한을 검사한다.
  const chain = (start, table, what, maxLen) => {
    const out = [];
    const seen = new Set();
    for (let s = start; s !== ENDOFCHAIN; s = table[s]) {
      if (s === FREESECT) fail(`${what} chain hits a free sector`);
      if (s >= table.length) fail(`${what} chain points outside its table (sector ${s})`);
      if (seen.has(s)) fail(`cyclic ${what} chain at sector ${s}`);
      if (out.length >= maxLen) fail(`${what} chain longer than allowed (${maxLen} sectors)`);
      seen.add(s);
      out.push(s);
    }
    return out;
  };
  const maxRegular = Math.ceil(limits.maxStreamBytes / secSize);
  const readChain = (start, what) => {
    if (start === ENDOFCHAIN) return Buffer.alloc(0);
    return Buffer.concat(chain(start, fat, what, maxRegular).map((s) => buf.subarray(sectorOffset(s), sectorOffset(s) + secSize)));
  };

  const dirBuf = readChain(firstDirSec, 'directory');
  const entries = [];
  for (let off = 0; off + 128 <= dirBuf.length; off += 128) {
    if (entries.length >= limits.maxDirEntries) fail('too many directory entries');
    const nameLen = Math.min(64, dirBuf.readUInt16LE(off + 0x40));
    entries.push({
      name: dirBuf.toString('utf16le', off, off + Math.max(0, nameLen - 2)),
      type: dirBuf[off + 0x42],
      left: dirBuf.readUInt32LE(off + 0x44),
      right: dirBuf.readUInt32LE(off + 0x48),
      child: dirBuf.readUInt32LE(off + 0x4c),
      start: dirBuf.readUInt32LE(off + 0x74),
      size: dirBuf.readUInt32LE(off + 0x78),
    });
  }
  if (!entries.length || entries[0].type !== 5) fail('missing root directory entry');
  const root = entries[0];
  const miniStream = root.size > 0 ? readChain(root.start, 'mini stream') : Buffer.alloc(0);
  const miniFat = [];
  if (firstMiniFatSec !== ENDOFCHAIN && firstMiniFatSec !== FREESECT) {
    const mf = readChain(firstMiniFatSec, 'mini FAT');
    for (let i = 0; i < mf.length / 4; i++) miniFat.push(mf.readUInt32LE(i * 4));
  }
  const readStream = (e) => {
    if (e.size > limits.maxStreamBytes) fail(`stream "${e.name}" is ${e.size} bytes, over the ${limits.maxStreamBytes}-byte limit`);
    let data;
    if (e.size < miniCutoff) {
      const maxMini = Math.ceil(e.size / miniSecSize) + 1;
      const parts = chain(e.start, miniFat, 'mini FAT', maxMini).map((s) => {
        const off = s * miniSecSize;
        if (off + miniSecSize > miniStream.length) fail(`mini sector ${s} outside the mini stream`);
        return miniStream.subarray(off, off + miniSecSize);
      });
      data = Buffer.concat(parts);
    } else {
      data = readChain(e.start, `stream "${e.name}"`);
    }
    if (data.length < e.size) fail(`stream "${e.name}" is truncated (${data.length} < ${e.size})`);
    return data.subarray(0, e.size);
  };

  // 디렉터리 트리를 경로 맵으로 펼친다. 같은 항목을 두 번 방문하면 순환이다.
  const paths = new Map();
  const visited = new Set();
  const walk = (id, prefix, depth) => {
    if (id === FREESECT) return;
    if (id >= entries.length) fail(`directory entry id ${id} out of range`);
    if (visited.has(id)) fail(`cyclic directory tree at entry ${id}`);
    if (depth > 256) fail('directory tree too deep');
    visited.add(id);
    const e = entries[id];
    walk(e.left, prefix, depth + 1);
    const p = prefix ? `${prefix}/${e.name}` : e.name;
    paths.set(p, e);
    if (e.type === 1) walk(e.child, p, depth + 1);
    walk(e.right, prefix, depth + 1);
  };
  visited.add(0);
  walk(root.child, '', 0);
  return { paths, readStream };
}

const TAG_PARA_HEADER = 66;
const TAG_PARA_TEXT = 67;
const TAG_CTRL_HEADER = 71;
const TAG_EQEDIT = 88;

// 제어 문자 폭: 1 wchar(char) 또는 8 wchar(inline/extended)
const CHAR_CTRL = new Set([0, 10, 13, 24, 25, 26, 27, 28, 29, 30, 31]);
const EXTENDED_CTRL = new Set([1, 2, 3, 11, 12, 14, 15, 16, 17, 18, 21, 22, 23]);

export function* records(buf) {
  let off = 0;
  while (off < buf.length) {
    if (off + 4 > buf.length) fail(`truncated record header at offset ${off}`);
    const h = buf.readUInt32LE(off);
    off += 4;
    const tag = h & 0x3ff;
    const level = (h >>> 10) & 0x3ff;
    let size = h >>> 20;
    if (size === 0xfff) {
      if (off + 4 > buf.length) fail(`truncated extended record size at offset ${off}`);
      size = buf.readUInt32LE(off);
      off += 4;
    }
    if (off + size > buf.length) fail(`record (tag ${tag}) length ${size} runs past the end of the section at offset ${off}`);
    yield { tag, level, data: buf.subarray(off, off + size) };
    off += size;
  }
}

/**
 * 문단 텍스트를 만든다. 확장 제어(표·그림·수식 등) 자리는 표식으로 남기고,
 * 수식(eqed)은 한컴 수식 스크립트를 {{EQ:...}} 로 끼워 넣는다.
 */
function paragraphText(d, ctrls) {
  let out = '';
  let ext = 0;
  for (let i = 0; i + 1 < d.length; ) {
    const c = d.readUInt16LE(i);
    if (c < 32) {
      if (CHAR_CTRL.has(c)) {
        if (c === 10) out += '\n';
        else if (c === 24) out += '-';
        else if (c === 30 || c === 31) out += ' ';
        i += 2;
      } else {
        if (EXTENDED_CTRL.has(c)) {
          const ctrl = ctrls[ext++];
          if (ctrl && ctrl.id === 'eqed') out += `{{EQ:${ctrl.script ?? ''}}}`;
        } else if (c === 9) {
          out += '\t';
        }
        i += 16;
      }
    } else {
      out += String.fromCharCode(c);
      i += 2;
    }
  }
  return out;
}

function eqScript(data) {
  if (data.length < 6) fail('EQEDIT record too short');
  const len = data.readUInt16LE(4);
  if (6 + len * 2 > data.length) fail(`EQEDIT script length ${len} runs past the record`);
  return data.toString('utf16le', 6, 6 + len * 2);
}

function sectionParagraphs(buf) {
  const recs = [...records(buf)];
  const paras = [];
  for (let i = 0; i < recs.length; i++) {
    if (recs[i].tag !== TAG_PARA_HEADER) continue;
    const level = recs[i].level;
    let text = null;
    const ctrls = [];
    for (let j = i + 1; j < recs.length && recs[j].level > level; j++) {
      const r = recs[j];
      if (r.tag === TAG_PARA_TEXT && r.level === level + 1) text = r.data;
      else if (r.tag === TAG_CTRL_HEADER && r.level === level + 1) {
        if (r.data.length < 4) fail('CTRL_HEADER record too short');
        const id = Buffer.from(r.data.subarray(0, 4)).reverse().toString('latin1');
        const ctrl = { id };
        if (id === 'eqed') {
          for (let k = j + 1; k < recs.length && recs[k].level > r.level; k++) {
            if (recs[k].tag === TAG_EQEDIT) {
              ctrl.script = eqScript(recs[k].data);
              break;
            }
          }
        }
        ctrls.push(ctrl);
      }
    }
    // 표 셀 등 하위 문단은 바깥 루프가 별도로 방문한다(문서 순서 유지).
    paras.push(text ? paragraphText(text, ctrls) : '');
  }
  return paras;
}

function inflateSection(data, name, maxBytes) {
  try {
    return inflateRawSync(data, { maxOutputLength: maxBytes });
  } catch (err) {
    if (err.code === 'ERR_BUFFER_TOO_LARGE' || err instanceof RangeError) {
      fail(`section "${name}" inflates past the ${maxBytes}-byte limit (possible compression bomb)`);
    }
    fail(`section "${name}" is not valid raw deflate data (${err.message})`);
  }
}

/** HWP 5.x 버퍼 → 문단 문자열 배열 (본문 Section 순서대로) */
export function hwpParagraphs(buf, limits = {}) {
  const lim = { ...DEFAULT_LIMITS, ...limits };
  const { paths, readStream } = readCfb(buf, lim);
  const header = paths.get('FileHeader');
  if (!header) fail('FileHeader stream missing');
  const hb = readStream(header);
  if (hb.length < 40 || !hb.toString('latin1', 0, 17).startsWith('HWP Document File')) fail('not an HWP 5.x FileHeader');
  const props = hb.readUInt32LE(36);
  const compressed = (props & 1) !== 0;
  if (props & 2) fail('password-protected HWP is not supported');
  if (props & 4) fail('distribution (배포용) HWP is not supported');
  const sections = [...paths.keys()]
    .filter((p) => /^BodyText\/Section\d+$/.test(p))
    .sort((a, b) => Number(a.match(/\d+$/)[0]) - Number(b.match(/\d+$/)[0]));
  if (!sections.length) fail('no BodyText/Section streams');
  const out = [];
  for (const p of sections) {
    let data = readStream(paths.get(p));
    if (compressed) data = inflateSection(data, p, lim.maxInflateBytes);
    out.push(...sectionParagraphs(data));
  }
  return out;
}

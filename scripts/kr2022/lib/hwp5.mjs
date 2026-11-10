// HWP 5.x 본문 텍스트 추출기 (의존성 없음: node:zlib 만 사용).
// 한컴 공개 문서 "한글 문서 파일 형식 5.0"의 CFB 컨테이너 + 레코드 구조만 읽는다.
// 결과는 문단 단위 문자열 배열이다. HWP 문단에는 화면 줄바꿈이 없으므로
// PDF 텍스트처럼 "줄바꿈을 공백으로 이을지" 추측할 필요가 없다.
import { inflateRawSync } from 'node:zlib';

const FREESECT = 0xffffffff;
const ENDOFCHAIN = 0xfffffffe;

function readCfb(buf) {
  if (buf.readUInt32LE(0) !== 0xe011cfd0 || buf.readUInt32LE(4) !== 0xe11ab1a1) {
    throw new Error('not an OLE compound file (HWP 5.x expected)');
  }
  const secSize = 1 << buf.readUInt16LE(0x1e);
  const miniSecSize = 1 << buf.readUInt16LE(0x20);
  const numFatSec = buf.readUInt32LE(0x2c);
  const firstDirSec = buf.readUInt32LE(0x30);
  const miniCutoff = buf.readUInt32LE(0x38);
  const firstMiniFatSec = buf.readUInt32LE(0x3c);
  let difatSec = buf.readUInt32LE(0x44);
  const sectorOffset = (s) => (s + 1) * secSize;

  const fatSectors = [];
  for (let i = 0; i < 109 && fatSectors.length < numFatSec; i++) {
    const s = buf.readUInt32LE(0x4c + i * 4);
    if (s !== FREESECT) fatSectors.push(s);
  }
  while (difatSec !== ENDOFCHAIN && difatSec !== FREESECT && fatSectors.length < numFatSec) {
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
  const chain = (start, table) => {
    const out = [];
    const seen = new Set();
    for (let s = start; s !== ENDOFCHAIN && s !== FREESECT && s < table.length; s = table[s]) {
      if (seen.has(s)) throw new Error('cyclic sector chain');
      seen.add(s);
      out.push(s);
    }
    return out;
  };
  const readChain = (start) => Buffer.concat(chain(start, fat).map((s) => buf.subarray(sectorOffset(s), sectorOffset(s) + secSize)));

  const dirBuf = readChain(firstDirSec);
  const entries = [];
  for (let off = 0; off + 128 <= dirBuf.length; off += 128) {
    const nameLen = dirBuf.readUInt16LE(off + 0x40);
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
  const root = entries[0];
  const miniStream = readChain(root.start);
  const miniFat = [];
  if (firstMiniFatSec !== ENDOFCHAIN) {
    const mf = readChain(firstMiniFatSec);
    for (let i = 0; i < mf.length / 4; i++) miniFat.push(mf.readUInt32LE(i * 4));
  }
  const readStream = (e) => {
    if (e.size < miniCutoff) {
      const parts = chain(e.start, miniFat).map((s) => miniStream.subarray(s * miniSecSize, (s + 1) * miniSecSize));
      return Buffer.concat(parts).subarray(0, e.size);
    }
    return readChain(e.start).subarray(0, e.size);
  };
  // 디렉터리 트리를 경로 맵으로 펼친다.
  const paths = new Map();
  const walk = (id, prefix) => {
    if (id === FREESECT || id >= entries.length) return;
    const e = entries[id];
    walk(e.left, prefix);
    const p = prefix ? `${prefix}/${e.name}` : e.name;
    paths.set(p, e);
    if (e.type === 1) walk(e.child, p);
    walk(e.right, prefix);
  };
  walk(root.child, '');
  return { paths, readStream };
}

const TAG_PARA_HEADER = 66;
const TAG_PARA_TEXT = 67;
const TAG_CTRL_HEADER = 71;
const TAG_EQEDIT = 88;

// 제어 문자 폭: 1 wchar(char) 또는 8 wchar(inline/extended)
const CHAR_CTRL = new Set([0, 10, 13, 24, 25, 26, 27, 28, 29, 30, 31]);
const EXTENDED_CTRL = new Set([1, 2, 3, 11, 12, 14, 15, 16, 17, 18, 21, 22, 23]);

function* records(buf) {
  let off = 0;
  while (off + 4 <= buf.length) {
    const h = buf.readUInt32LE(off);
    off += 4;
    const tag = h & 0x3ff;
    const level = (h >>> 10) & 0x3ff;
    let size = h >>> 20;
    if (size === 0xfff) {
      size = buf.readUInt32LE(off);
      off += 4;
    }
    yield { tag, level, data: buf.subarray(off, off + size) };
    off += size;
  }
}

/**
 * 문단 텍스트를 만든다. 확장 제어(표·그림·수식 등) 자리는 표식으로 남기고,
 * 수식(eqed)은 한컴 수식 스크립트를 {{EQ:...}} 로 끼워 넣는다.
 */
function paragraphText(textRec, ctrls) {
  let out = '';
  let ext = 0;
  const d = textRec;
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

function sectionParagraphs(buf) {
  const recs = [...records(buf)];
  const paras = [];
  for (let i = 0; i < recs.length; i++) {
    if (recs[i].tag !== TAG_PARA_HEADER) continue;
    const level = recs[i].level;
    let text = null;
    const ctrls = [];
    let j = i + 1;
    for (; j < recs.length && recs[j].level > level; j++) {
      const r = recs[j];
      if (r.tag === TAG_PARA_TEXT && r.level === level + 1) text = r.data;
      else if (r.tag === TAG_CTRL_HEADER && r.level === level + 1) {
        const id = Buffer.from(r.data.subarray(0, 4)).reverse().toString('latin1');
        const ctrl = { id };
        if (id === 'eqed') {
          const eq = recs.slice(j + 1).find((x, k, arr) => x.tag === TAG_EQEDIT || x.level <= r.level);
          if (eq && eq.tag === TAG_EQEDIT) {
            const len = eq.data.readUInt16LE(4);
            ctrl.script = eq.data.toString('utf16le', 6, 6 + len * 2);
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

/** HWP 5.x 버퍼 → 문단 문자열 배열 (본문 Section 순서대로) */
export function hwpParagraphs(buf) {
  const { paths, readStream } = readCfb(buf);
  const header = paths.get('FileHeader');
  if (!header) throw new Error('FileHeader stream missing');
  const hb = readStream(header);
  if (!hb.toString('latin1', 0, 17).startsWith('HWP Document File')) throw new Error('not HWP 5.x');
  const props = hb.readUInt32LE(36);
  const compressed = (props & 1) !== 0;
  if (props & 2) throw new Error('password-protected HWP is not supported');
  if (props & 4) throw new Error('distribution (배포용) HWP is not supported');
  const sections = [...paths.keys()]
    .filter((p) => /^BodyText\/Section\d+$/.test(p))
    .sort((a, b) => Number(a.match(/\d+$/)[0]) - Number(b.match(/\d+$/)[0]));
  const out = [];
  for (const p of sections) {
    let data = readStream(paths.get(p));
    if (compressed) data = inflateRawSync(data);
    out.push(...sectionParagraphs(data));
  }
  return out;
}

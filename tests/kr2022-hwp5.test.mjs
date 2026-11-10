import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { hwpParagraphs, Hwp5FormatError, DEFAULT_LIMITS } from '../scripts/kr2022/lib/hwp5.mjs';

// 작은 가짜 HWP(CFB) 파일을 바이트로 만든다. 섹터 512바이트, 미니 스트림은 쓰지 않는다(miniCutoff 0).
// 섹터 0 = FAT, 1 = 디렉터리, 2 = FileHeader, 3.. = Section0.
const SEC = 512;
const END = 0xfffffffe;
const FREE = 0xffffffff;

function dirEntry(name, type, { left = FREE, right = FREE, child = FREE, start = END, size = 0 } = {}) {
  const e = Buffer.alloc(128);
  const n = Buffer.from(name + '\0', 'utf16le');
  n.copy(e, 0);
  e.writeUInt16LE(n.length, 0x40);
  e[0x42] = type;
  e.writeUInt32LE(left, 0x44);
  e.writeUInt32LE(right, 0x48);
  e.writeUInt32LE(child, 0x4c);
  e.writeUInt32LE(start, 0x74);
  e.writeUInt32LE(size, 0x78);
  return e;
}

function record(tag, level, data) {
  const h = Buffer.alloc(4);
  h.writeUInt32LE((tag | (level << 10) | (data.length << 20)) >>> 0);
  return Buffer.concat([h, data]);
}

function paragraph(text) {
  return Buffer.concat([record(66, 0, Buffer.alloc(22)), record(67, 1, Buffer.from(text + '\r', 'utf16le'))]);
}

function buildHwp({ section = deflateRawSync(paragraph('[2수01-01] 테스트 문장이다.')), mutate } = {}) {
  const fileHeader = Buffer.alloc(256);
  fileHeader.write('HWP Document File', 0, 'latin1');
  fileHeader.writeUInt32LE(1, 36); // 압축됨
  const secCount = Math.ceil(section.length / SEC) || 1;
  const fat = new Array(SEC / 4).fill(FREE);
  fat[0] = 0xfffffffd; // FAT 섹터 자신
  fat[1] = END; // 디렉터리
  fat[2] = END; // FileHeader
  for (let i = 0; i < secCount; i++) fat[3 + i] = i === secCount - 1 ? END : 4 + i;
  const dir = Buffer.concat([
    dirEntry('Root Entry', 5, { child: 1 }),
    dirEntry('FileHeader', 2, { right: 2, start: 2, size: 256 }),
    dirEntry('BodyText', 1, { child: 3 }),
    dirEntry('Section0', 2, { start: 3, size: section.length }),
  ]);
  const ctx = { fat, dir };
  mutate?.(ctx);
  const header = Buffer.alloc(512);
  Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]).copy(header, 0);
  header.writeUInt16LE(9, 0x1e);
  header.writeUInt16LE(6, 0x20);
  header.writeUInt32LE(1, 0x2c); // FAT 섹터 수
  header.writeUInt32LE(1, 0x30); // 디렉터리 시작
  header.writeUInt32LE(0, 0x38); // miniCutoff 0: 모든 스트림이 일반 섹터
  header.writeUInt32LE(END, 0x3c);
  header.writeUInt32LE(END, 0x44);
  for (let i = 0; i < 109; i++) header.writeUInt32LE(i === 0 ? 0 : FREE, 0x4c + i * 4);
  const fatBuf = Buffer.alloc(SEC);
  ctx.fat.forEach((v, i) => fatBuf.writeUInt32LE(v >>> 0, i * 4));
  const pad = (b) => Buffer.concat([b, Buffer.alloc((SEC - (b.length % SEC)) % SEC)]);
  return Buffer.concat([header, fatBuf, pad(ctx.dir), pad(fileHeader), pad(section)]);
}

test('hwp5: 정상 가짜 파일은 문단을 읽는다', () => {
  assert.deepEqual(hwpParagraphs(buildHwp()), ['[2수01-01] 테스트 문장이다.']);
});

test('hwp5: FAT 체인 순환을 거부한다', () => {
  const buf = buildHwp({ mutate: ({ fat }) => { fat[1] = 1; } }); // 디렉터리 섹터가 자기 자신을 가리킴
  assert.throws(() => hwpParagraphs(buf), (e) => e instanceof Hwp5FormatError && /cyclic directory chain/.test(e.message));
});

test('hwp5: 파일 밖 섹터 번호를 거부한다', () => {
  const buf = buildHwp({ mutate: ({ dir }) => dir.writeUInt32LE(9999, 128 * 3 + 0x74) }); // Section0 시작 섹터
  assert.throws(() => hwpParagraphs(buf), (e) => e instanceof Hwp5FormatError && /outside its table|out of range/.test(e.message));
});

test('hwp5: 디렉터리 트리 순환을 거부한다', () => {
  const buf = buildHwp({ mutate: ({ dir }) => dir.writeUInt32LE(1, 128 * 1 + 0x48) }); // FileHeader.right = 자기 자신
  assert.throws(() => hwpParagraphs(buf), (e) => e instanceof Hwp5FormatError && /cyclic directory tree/.test(e.message));
});

test('hwp5: 스트림 크기 상한을 넘으면 거부한다', () => {
  const buf = buildHwp({ mutate: ({ dir }) => dir.writeUInt32LE(0x7fffffff, 128 * 3 + 0x78) });
  assert.throws(() => hwpParagraphs(buf), (e) => e instanceof Hwp5FormatError && /over the .*limit/.test(e.message));
});

test('hwp5: 압축 폭탄(해제 크기 상한 초과)을 거부한다', () => {
  const bomb = deflateRawSync(Buffer.alloc(4 * 1024 * 1024)); // 4MB의 0 → 수 KB
  assert.ok(bomb.length < 16 * 1024);
  const buf = buildHwp({ section: bomb });
  assert.throws(() => hwpParagraphs(buf, { maxInflateBytes: 1024 * 1024 }), (e) => e instanceof Hwp5FormatError && /compression bomb/.test(e.message));
  assert.ok(DEFAULT_LIMITS.maxInflateBytes > 0 && Number.isFinite(DEFAULT_LIMITS.maxInflateBytes));
});

test('hwp5: 섹션 끝을 넘는 레코드 길이를 거부한다', () => {
  const h = Buffer.alloc(4);
  h.writeUInt32LE((67 | (0xfff << 20)) >>> 0);
  const lying = Buffer.concat([h, Buffer.from([0xff, 0xff, 0xff, 0x00]), Buffer.alloc(8)]); // 길이 16MB 주장, 실제 8바이트
  const buf = buildHwp({ section: deflateRawSync(lying) });
  assert.throws(() => hwpParagraphs(buf), (e) => e instanceof Hwp5FormatError && /runs past the end/.test(e.message));
});

test('hwp5: CFB가 아니거나 너무 작은 입력을 거부한다', () => {
  assert.throws(() => hwpParagraphs(Buffer.alloc(100)), /too small/);
  assert.throws(() => hwpParagraphs(Buffer.alloc(1024)), /not an OLE compound file/);
});

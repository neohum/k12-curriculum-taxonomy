import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadOfficial, getByCode, getById, searchOfficial, tagOfficial, normalizeOfficialCode
} from "../src/core/kr2022/official.mjs";
import { loadConfirmedLinks, handwrittenCodesFor } from "../src/core/kr2022/handwritten-links.mjs";
import { searchStandards, tagContent } from "../src/core/kr2022/standards-service.mjs";
import { MarketCurriculumTagger } from "../src/core/taxonomy/MarketCurriculumTagger.mjs";
import { Korea2022K12CurriculumAdapter } from "../src/core/taxonomy/Korea2022K12CurriculumAdapter.mjs";
import { TaxonomyGraphEngine } from "../src/core/taxonomy/TaxonomyGraphEngine.mjs";
import { K12TaxonomyServer } from "../src/server/K12TaxonomyServer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../data/kr-2022/standards.json"), "utf8"));

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "kr2022-official-"));
}
const NO_DECISIONS = path.join(tmpDir(), "decisions.json");

// 고시 원문 문장(별책에서 그대로 옮긴 값). standards.json과 응답이 이 문장과 같아야 한다.
const VERBATIM = [
  ["[2국01-01]", "중요한 내용이나 일이 일어난 순서를 고려하며 듣고 말한다."],
  ["[6수01-08]", "분모가 다른 분수의 덧셈과 뺄셈의 계산 원리를 탐구하고 그 계산을 할 수 있다."],
  ["[9수02-15]", "일차함수의 개념을 이해하고, 그 그래프를 그릴 수 있다."],
  ["[4과09-03]", "자석을 이용하여 일상생활을 편리하게 하는 장치를 설계할 수 있다."]
];

test("official: 로더는 standards.json 전체를 한 번만 읽어 캐시한다", () => {
  const a = loadOfficial();
  const b = loadOfficial();
  assert.equal(a, b, "같은 경로는 같은 캐시 객체");
  assert.equal(a.standards.length, RAW.standards.length);
  assert.equal(a.dataset.count, 4296);
  assert.equal(a.dataset.notice, "교육부 고시 제2022-33호");
});

test("official: code 조회는 괄호를 생략해도 되고, 겹치는 코드는 id로 구분된다", () => {
  assert.equal(normalizeOfficialCode("2국01-01"), "[2국01-01]");
  assert.equal(getByCode("2국01-01").length, 1);
  const dup = getByCode("[12스문01-01]");
  assert.equal(dup.length, 2, "체육 스포츠 문화와 스페인어권 문화가 같은 코드를 쓴다");
  assert.deepEqual(dup.map(s => s.id).sort(), ["b11:[12스문01-01]", "b16:[12스문01-01]"]);
  assert.equal(getById("b21:[12스경02-02]#2").code, "[12스경02-02]");

  const { items, matchedTotal } = searchOfficial({ query: "[12스문01-01]" });
  assert.equal(matchedTotal, 2);
  assert.notEqual(items[0].id, items[1].id);
  assert.ok(items.every(i => i.codeConflict?.kind === "cross-subject"));
  assert.equal(searchOfficial({ id: "b16:[12스문01-01]" }).items[0].course, "스페인어권 문화");
});

test("official: 응답 문장이 고시 원문과 글자 그대로 같다", () => {
  for (const [code, text] of VERBATIM) {
    const [item] = searchOfficial({ query: code }).items;
    assert.equal(item.text, text, code);
    assert.equal(item.statement, text, `${code} statement 별칭`);
    assert.equal(item.source, "official");
    assert.equal(item.citation.notice, "교육부 고시 제2022-33호");
    assert.match(item.citation.book, /^별책 \d+$/);
  }
});

test("official: 키워드·교과·학교급·학년군 검색", () => {
  const fn = searchOfficial({ query: "일차함수", subject: "수학", limit: 50 });
  assert.equal(fn.matchedTotal, 4);
  assert.ok(fn.items.every(i => i.text.includes("일차함수") && i.schoolLevel === "MS"));

  const es = searchOfficial({ subject: "과학", schoolLevel: "ES", gradeBand: "3~4", limit: 500 });
  assert.ok(es.matchedTotal > 0);
  assert.ok(es.items.every(i => i.subject === "과학" && i.gradeBand === "초등학교 3~4학년"));

  // 과목명(course)으로도 거른다
  const calc = searchOfficial({ subject: "미적분Ⅰ", limit: 500 });
  assert.ok(calc.matchedTotal > 0 && calc.items.every(i => i.course === "미적분Ⅰ"));

  // 여러 낱말은 모두 들어 있어야 한다
  const both = searchOfficial({ query: "분모가 다른 덧셈" });
  assert.deepEqual(both.items.map(i => i.code), ["[6수01-08]"]);

  assert.equal(searchOfficial({ query: "존재하지않는낱말xyz" }).matchedTotal, 0);
});

test("official: 태깅은 공식 성취기준을 돌려주고 무관한 문장은 비운다", () => {
  const tagged = tagOfficial("분모가 다른 분수의 덧셈 활동지 - 통분 연습");
  assert.equal(tagged[0].code, "[6수01-08]");
  assert.equal(tagged[0].source, "official");

  const explicit = tagOfficial("이 활동지는 [4과09-03] 성취기준을 다룹니다.");
  assert.equal(explicit[0].code, "[4과09-03]");
  assert.equal(explicit[0].explicitCode, true);

  // "[12국01-01]" 안의 "2국01-01"을 초등 코드로 오인하지 않는다
  const nested = tagOfficial("[12국01-01]");
  assert.ok(!nested.some(t => t.code === "[2국01-01]" && t.explicitCode));

  assert.deepEqual(tagOfficial("오늘 점심 메뉴는 김치찌개"), []);
});

test("service: source=handwritten은 손작성 데이터에 official:false와 경고를 붙인다", () => {
  const adapter = new Korea2022K12CurriculumAdapter();
  const res = searchStandards({ query: "분수", source: "handwritten", limit: 5 }, { adapter, decisionsPath: NO_DECISIONS });
  assert.equal(res.source, "handwritten");
  assert.equal(res.official, false);
  assert.ok(res.warning.includes("고시 원문이 아니라"));
  assert.ok(res.standards.length > 0);
  for (const s of res.standards) {
    assert.equal(s.official, false);
    assert.equal(s.source, "handwritten");
    assert.ok(s.warning);
    assert.deepEqual(s.officialLinks, []);
  }
  assert.throws(() => searchStandards({ source: "nope" }, { adapter }), /source/);
});

test("links: decisions.json이 없으면 연결 없이, 자동 matched·미확정은 버리고 사람 확정만 쓴다", () => {
  const none = loadConfirmedLinks(NO_DECISIONS);
  assert.equal(none.present, false);
  assert.equal(none.links.size, 0);

  const dir = tmpDir();
  const file = path.join(dir, "decisions.json");
  fs.writeFileSync(file, JSON.stringify({
    decisions: [
      { oldCode: "[6수01-06]", decision: "confirmed", officialIds: ["b8:[6수01-08]"], decidedBy: "test" },
      { oldCode: "[4수01-01]", decision: "matched", officialIds: ["b8:[4수01-15]"] },
      { oldCode: "[2수01-01]", decision: "confirmed", officialIds: ["b8:[2수01-01]"], humanVerified: false },
      { oldCode: "[2수01-05]", decision: "confirmed", officialIds: ["b99:[없는코드]"] },
      { oldCode: "[6수01-01]", decision: "rejected", officialIds: ["b8:[6수01-01]"] }
    ]
  }));
  const state = loadConfirmedLinks(file);
  assert.equal(state.present, true);
  assert.deepEqual([...state.links.keys()], ["[6수01-06]"]);
  assert.equal(state.ignored, 4);
  assert.deepEqual(handwrittenCodesFor("b8:[6수01-08]", state), ["[6수01-06]"]);

  const broken = path.join(dir, "broken.json");
  fs.writeFileSync(broken, "{ not json");
  const bad = loadConfirmedLinks(broken);
  assert.equal(bad.links.size, 0);
  assert.ok(bad.error);
});

test("service: 공식 태깅의 선수학습 역추적은 사람 확정 연결이 있을 때만 쓴다", () => {
  const graphEngine = new TaxonomyGraphEngine();
  graphEngine.ensureLoaded();
  graphEngine.ensureK12DependenciesLoaded();
  const adapter = new Korea2022K12CurriculumAdapter({ graphEngine });
  const text = "분모가 다른 분수의 덧셈 활동지 - 통분 연습";

  const without = tagContent({ text }, { adapter, graphEngine, decisionsPath: NO_DECISIONS });
  assert.equal(without.source, "official");
  assert.equal(without.primaryStandard.id, "b8:[6수01-08]");
  assert.deepEqual(without.remediationPath, []);
  assert.equal(without.remediationBasis.handwrittenCode, null);

  const file = path.join(tmpDir(), "decisions.json");
  fs.writeFileSync(file, JSON.stringify({
    decisions: [{ oldCode: "[6수01-06]", decision: "confirmed", officialIds: ["b8:[6수01-08]"], decidedBy: "test" }]
  }));
  const withLink = tagContent({ text }, { adapter, graphEngine, decisionsPath: file });
  assert.equal(withLink.remediationBasis.handwrittenCode, "[6수01-06]");
  assert.equal(withLink.remediationBasis.official, false);
  assert.equal(withLink.remediationBasis.officialLinks[0].id, "b8:[6수01-08]");
});

test("MarketCurriculumTagger: 기본은 공식 성취기준, handwritten 모드는 경고", () => {
  const input = { title: "분모가 다른 분수의 덧셈 활동지", content: "통분 연습" };
  const official = new MarketCurriculumTagger({ decisionsPath: NO_DECISIONS }).tag(input);
  assert.equal(official.source, "official");
  assert.equal(official.curriculum.primaryCode, "[6수01-08]");
  assert.equal(official.curriculum.primaryId, "b8:[6수01-08]");
  assert.equal(official.curriculum.standardTitle, VERBATIM[1][1]);
  assert.equal(official.curriculum.citation.book, "별책 8");
  assert.equal(official.taxonomy.subjectDomain, "curriculum_math");
  assert.equal(official.taxonomy.targetStage, "elem_upper");
  assert.equal(official.prerequisites.count, 0, "확정 연결이 없으면 손작성 선수학습 규칙을 쓰지 않는다");
  assert.equal(official.handwrittenBasis.used, false);
  assert.equal(official.warning, undefined);

  const legacy = new MarketCurriculumTagger({ source: "handwritten" }).tag(input);
  assert.equal(legacy.source, "handwritten");
  assert.equal(legacy.official, false);
  assert.ok(legacy.warning);
  assert.equal(legacy.curriculum.primaryCode, "[6수01-06]");
  assert.ok(legacy.prerequisites.count > 0);
});

test("server: /api/taxonomy/standards 기본 공식, ?source=handwritten 경고, 기능 응답에 비공식 표시", async (t) => {
  const server = new K12TaxonomyServer({ port: 8994, host: "127.0.0.1", decisionsPath: NO_DECISIONS });
  const { url } = await server.start();
  t.after(() => server.stop());

  const off = await (await fetch(`${url}/api/taxonomy/standards?query=${encodeURIComponent("[9수02-15]")}`)).json();
  assert.equal(off.source, "official");
  assert.equal(off.standards[0].id, "b8:[9수02-15]");
  assert.equal(off.standards[0].text, VERBATIM[2][1]);
  assert.equal(off.dataset.count, 4296);

  const hw = await (await fetch(`${url}/api/taxonomy/standards?query=${encodeURIComponent("분수")}&source=handwritten&limit=3`)).json();
  assert.equal(hw.source, "handwritten");
  assert.ok(hw.standards.every(s => s.official === false && s.warning));

  const bad = await fetch(`${url}/api/taxonomy/standards?source=xyz`);
  assert.equal(bad.status, 400);

  const chains = await (await fetch(`${url}/api/taxonomy/chains`)).json();
  assert.equal(chains.dataBasis.label, "비공식 손작성 성취기준 기반");
  assert.equal(chains.dataBasis.decisionsFile, "absent");
});

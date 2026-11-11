/**
 * 수동 선수관계 간선 검증 규칙 (순수 로직, 무의존성, 브라우저에서도 그대로 import).
 *
 * 서버(validateManual·저장 라우트)와 검토 화면이 같은 파일을 쓴다. 그래서 이 파일은
 * node: 모듈이나 다른 모듈을 import하지 않는다.
 */

/**
 * 코드 앞 숫자 → 학년군 순서. 2·4·6은 초등 학년군, 9는 중학교, 10은 고등학교 공통,
 * 12는 고등학교 선택이다. 같은 순서끼리는 앞뒤를 코드로 알 수 없어 허용한다.
 */
export const GRADE_PREFIX_ORDER = Object.freeze({ 2: 0, 4: 1, 6: 2, 9: 3, 10: 4, 12: 5 });

const GRADE_PREFIX_LABEL = Object.freeze({
  2: "초등 1~2학년군",
  4: "초등 3~4학년군",
  6: "초등 5~6학년군",
  9: "중학교 1~3학년군",
  10: "고등학교 공통 과목",
  12: "고등학교 선택 과목"
});

const STRENGTHS = new Set(["hard", "soft"]);

/** "b8:[2수01-01]" 또는 "[2수01-01]"에서 코드 앞 숫자(2,4,6,9,10,12)를 꺼낸다. */
export function gradePrefix(key) {
  const m = /\[(\d+)/.exec(String(key ?? ""));
  if (!m) return null;
  const n = Number(m[1]);
  return n in GRADE_PREFIX_ORDER ? n : null;
}

export function gradeRank(key) {
  const p = gradePrefix(key);
  return p == null ? null : GRADE_PREFIX_ORDER[p];
}

export function gradeLabel(key) {
  const p = gradePrefix(key);
  return p == null ? "학년군 알 수 없음" : GRADE_PREFIX_LABEL[p];
}

export function findCycle(edgeList) {
  const adj = new Map();
  for (const e of edgeList) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from).push(e.to);
  }
  const state = new Map();
  const stack = [];
  const visit = (n) => {
    state.set(n, 1);
    stack.push(n);
    for (const m of adj.get(n) ?? []) {
      if (state.get(m) === 1) return [...stack.slice(stack.indexOf(m)), m];
      if (!state.has(m)) {
        const c = visit(m);
        if (c) return c;
      }
    }
    stack.pop();
    state.set(n, 2);
    return null;
  };
  for (const n of [...adj.keys()].sort()) {
    if (!state.has(n)) {
      const c = visit(n);
      if (c) return c;
    }
  }
  return null;
}

/**
 * 간선 하나를 검사한다. 문제가 없으면 빈 배열.
 * @param {object} e 간선
 * @param {{has(k:string):boolean}} officialKeys standards.json의 id 집합
 * @param {string} where 메시지 앞에 붙일 위치(예: "edges[3]")
 */
export function checkEdge(e, officialKeys, where = "간선") {
  const problems = [];
  const fromOk = officialKeys.has(e?.from);
  const toOk = officialKeys.has(e?.to);
  if (!fromOk) problems.push({ rule: "unknown-id", message: `${where}.from이 공식 코드가 아님(standards.json의 id 필요): ${e?.from}` });
  if (!toOk) problems.push({ rule: "unknown-id", message: `${where}.to가 공식 코드가 아님(standards.json의 id 필요): ${e?.to}` });
  if (e?.from === e?.to) problems.push({ rule: "self-loop", message: `${where} 자기 자신으로의 간선: ${e?.from}` });
  if (fromOk && toOk && e.from !== e.to) {
    const rf = gradeRank(e.from);
    const rt = gradeRank(e.to);
    if (rf == null || rt == null) {
      problems.push({ rule: "unknown-grade", message: `${where} 학년군을 코드로 알 수 없음: ${rf == null ? e.from : e.to}` });
    } else if (rf > rt) {
      problems.push({
        rule: "grade-reversal",
        message: `${where} 학년 역전: 먼저 배울 ${e.from}(${gradeLabel(e.from)})이 뒤에 배울 ${e.to}(${gradeLabel(e.to)})보다 높은 학년군`
      });
    }
  }
  if (!STRENGTHS.has(e?.strength)) problems.push({ rule: "strength", message: `${where}.strength는 hard|soft: ${e?.strength}` });
  if (!Array.isArray(e?.evidence) || e.evidence.length === 0) {
    problems.push({ rule: "evidence", message: `${where}.evidence가 비어 있음` });
  } else if (e.evidence.some(ev => ev?.type !== "manual" || typeof ev.ref !== "string" || !ev.ref.trim())) {
    problems.push({ rule: "evidence", message: `${where}.evidence는 type "manual"과 ref가 필요` });
  }
  return problems;
}

/**
 * 수동 간선 목록 전체를 검사한다: 간선별 규칙 + 중복 간선 + 수동 간선끼리의 순환.
 * @returns {{rule:string, message:string}[]}
 */
export function checkManualEdges(edges, officialKeys) {
  const problems = [];
  const seen = new Map();
  edges.forEach((e, i) => {
    problems.push(...checkEdge(e, officialKeys, `edges[${i}]`));
    const k = `${e?.from}\u0000${e?.to}`;
    if (seen.has(k)) problems.push({ rule: "duplicate", message: `edges[${i}] edges[${seen.get(k)}]와 같은 간선: ${e?.from} → ${e?.to}` });
    else seen.set(k, i);
  });
  const cycle = findCycle(edges.filter(e => e && e.from !== e.to));
  if (cycle) problems.push({ rule: "cycle", message: `수동 간선에 순환이 생김: ${cycle.join(" → ")}` });
  return problems;
}

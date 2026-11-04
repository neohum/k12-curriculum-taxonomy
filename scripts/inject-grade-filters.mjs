import fs from "node:fs";

const targetFiles = ["public/taxonomy-dashboard.html", "public/index.html"];

const gradeFilterHtml = `
            <div class="grade-filters" style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 6px;">
              <button class="filter-chip active" data-grade="all" onclick="filterByGrade('all')">전체 학년</button>
              <button class="filter-chip" data-grade="초1" onclick="filterByGrade('초1')">초1</button>
              <button class="filter-chip" data-grade="초2" onclick="filterByGrade('초2')">초2</button>
              <button class="filter-chip" data-grade="초3" onclick="filterByGrade('초3')">초3</button>
              <button class="filter-chip" data-grade="초4" onclick="filterByGrade('초4')">초4</button>
              <button class="filter-chip" data-grade="초5" onclick="filterByGrade('초5')">초5</button>
              <button class="filter-chip" data-grade="초6" onclick="filterByGrade('초6')">초6</button>
              <button class="filter-chip" data-grade="중1" onclick="filterByGrade('중1')">중1</button>
              <button class="filter-chip" data-grade="중2" onclick="filterByGrade('중2')">중2</button>
              <button class="filter-chip" data-grade="중3" onclick="filterByGrade('중3')">중3</button>
              <button class="filter-chip" data-grade="고1" onclick="filterByGrade('고1')">고1</button>
              <button class="filter-chip" data-grade="고2" onclick="filterByGrade('고2')">고2</button>
              <button class="filter-chip" data-grade="고3" onclick="filterByGrade('고3')">고3</button>
            </div>`;

for (const filePath of targetFiles) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Add grade filters HTML right after school-level-filters if not already present
  if (!content.includes('class="grade-filters"')) {
    content = content.replace(
      /(<div class="school-level-filters"[\s\S]*?<\/div>)/,
      `$1\n${gradeFilterHtml}`
    );
    console.log(`Added grade-filters HTML in ${filePath}`);
  }

  // 2. Add currentGradeFilter in state
  if (!content.includes("currentGradeFilter: 'all'")) {
    content = content.replace(
      "currentSchoolFilter: 'all',",
      "currentSchoolFilter: 'all',\n      currentGradeFilter: 'all',"
    );
    console.log(`Added currentGradeFilter to state in ${filePath}`);
  }

  // 3. Add filterByGrade function and update renderSidebarTopicList & renderKnowledgeGraph
  if (!content.includes("function filterByGrade(grade)")) {
    const filterByGradeJs = `
    function filterByGrade(grade) {
      state.currentGradeFilter = grade;
      document.querySelectorAll(".grade-filters [data-grade]").forEach(c => c.classList.remove("active"));
      const chip = document.querySelector(\`.grade-filters [data-grade="\${grade}"]\`);
      if (chip) chip.classList.add("active");
      renderSidebarTopicList();
      renderKnowledgeGraph();
    }
`;
    content = content.replace(
      "function filterBySchoolLevel(school) {",
      filterByGradeJs + "\n    function filterBySchoolLevel(school) {"
    );
    console.log(`Added filterByGrade JS in ${filePath}`);
  }

  // 4. Update filtering in renderSidebarTopicList
  if (!content.includes("state.currentGradeFilter !== \"all\"")) {
    const filterCheck = `if (state.currentSchoolFilter !== "all" && node.schoolLevel !== state.currentSchoolFilter) {
          return false;
        }
        if (state.currentGradeFilter !== "all") {
          if (node.grade !== state.currentGradeFilter && !node.grade.includes(state.currentGradeFilter)) {
            return false;
          }
        }`;
    content = content.replace(
      `if (state.currentSchoolFilter !== "all" && node.schoolLevel !== state.currentSchoolFilter) {
          return false;
        }`,
      filterCheck
    );
    console.log(`Updated renderSidebarTopicList filter in ${filePath}`);
  }

  // 5. Update resetAllFilters to reset grade filter
  if (!content.includes("state.currentGradeFilter = \"all\";")) {
    const resetGradeJs = `state.currentSchoolFilter = "all";
      state.currentGradeFilter = "all";`;
    content = content.replace('state.currentSchoolFilter = "all";', resetGradeJs);

    const resetChipJs = `const allSchoolChip = document.querySelector('.school-level-filters .filter-chip[data-school="all"]');
      if (allSchoolChip) allSchoolChip.classList.add("active");
      document.querySelectorAll(".grade-filters [data-grade]").forEach(c => c.classList.remove("active"));
      const allGradeChip = document.querySelector('.grade-filters [data-grade="all"]');
      if (allGradeChip) allGradeChip.classList.add("active");`;
    content = content.replace(
      `const allSchoolChip = document.querySelector('.school-level-filters .filter-chip[data-school="all"]');
      if (allSchoolChip) allSchoolChip.classList.add("active");`,
      resetChipJs
    );
    console.log(`Updated resetAllFilters in ${filePath}`);
  }

  // 6. In renderKnowledgeGraph, highlight or dim nodes according to grade filter
  if (!content.includes("gradeMatch = state.currentGradeFilter === \"all\"")) {
    const graphGradeCheck = `const isMatched = (state.currentSubjectFilter === "all" || checkSubjectMatch(node.subject, state.currentSubjectFilter)) &&
                          (state.currentSchoolFilter === "all" || node.schoolLevel === state.currentSchoolFilter) &&
                          (state.currentGradeFilter === "all" || node.grade === state.currentGradeFilter || node.grade.includes(state.currentGradeFilter));`;
    content = content.replace(
      /const isMatched = \(state\.currentSubjectFilter === "all" \|\| checkSubjectMatch\(node\.subject, state\.currentSubjectFilter\)\) &&\s*\(state\.currentSchoolFilter === "all" \|\| node\.schoolLevel === state\.currentSchoolFilter\);/,
      graphGradeCheck
    );
    console.log(`Updated renderKnowledgeGraph matching in ${filePath}`);
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Finished updating ${filePath}!`);
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TaxonomyGraphEngine } from "./TaxonomyGraphEngine.mjs";
import { PiagetStage, BrunerRepresentation, ManipulativeEngineType } from "./LessonTaxonomySchema.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * K-12 인지 위계 온톨로지 및 진단 코어 엔진
 * 1) 오답의 초·중·고 인과 역추적 (DAG Backtracking)
 * 2) 피아제·비고츠키 기반 구체 조작기/발문 비계(Scaffolding) 자동 생성
 * 3) LLM 결합 차시별 콘텐츠 무한 증폭 메타데이터 엔진
 */
export class CognitiveScaffoldingEngine {
  constructor(options = {}) {
    this.graph = options.graph || new TaxonomyGraphEngine();
    this.dataDir = options.dataDir || path.resolve(process.cwd(), "data/os-taxonomy");
    this.causalChains = [];
    this.loadCausalChains();
  }

  loadCausalChains() {
    try {
      const chainPath = path.join(this.dataDir, "k12-causal-chains.json");
      if (fs.existsSync(chainPath)) {
        this.causalChains = JSON.parse(fs.readFileSync(chainPath, "utf-8"));
      }
    } catch (err) {
      console.warn("[CognitiveScaffoldingEngine] causal chains load warning:", err.message);
      this.causalChains = [];
    }
  }

  /**
   * 1. 오답의 초·중·고 인과 역추적 (DAG Backtracking)
   * 
   * @param {string} topicQuery - 토픽 ID 또는 검색어 (예: "미적분", "기울기", "분수 덧셈", "몇일까요", "일차방정식")
   * @param {string} [errorContext] - 학생이 보인 오답/오개념 텍스트
   * @returns {object} 초·중·고를 아우르는 인과 역추적 분석 결과
   */
  backtrackCausalChain(topicQuery, errorContext = "") {
    this.graph.ensureLoaded();

    // 1) 사전에 정립된 K-12 인과 체인에서 우선 검색
    const matchedChain = this.causalChains.find(chain => {
      const q = topicQuery.toLowerCase();
      return chain.nameKo.toLowerCase().includes(q) ||
        chain.terminalConcept.topic.toLowerCase().includes(q) ||
        chain.causalPath.some(step => step.topic.toLowerCase().includes(q));
    });

    if (matchedChain) {
      // 쿼리된 단계 찾기
      let startIndex = matchedChain.causalPath.findIndex(step => 
        step.topic.toLowerCase().includes(topicQuery.toLowerCase())
      );
      if (startIndex === -1) startIndex = 0;

      // 쿼리 단계부터 초등 기초까지의 역추적 경로 슬라이스
      const fullCausalPath = matchedChain.causalPath.slice(startIndex);

      return {
        success: true,
        chainId: matchedChain.chainId,
        chainName: matchedChain.nameKo,
        subject: matchedChain.subject,
        originTopic: fullCausalPath[0],
        terminalConcept: matchedChain.terminalConcept,
        causalSteps: fullCausalPath,
        rootCauseFoundation: fullCausalPath[fullCausalPath.length - 1],
        depth: fullCausalPath.length,
        isCrossSchoolLevel: this.checkCrossSchoolLevel(fullCausalPath)
      };
    }

    // 2) 일반 온톨로지 그래프(TaxonomyGraphEngine)를 통한 역추적 폴백
    const fallbackResults = this.graph.searchTopics(topicQuery, { limit: 1 });
    if (fallbackResults.length === 0) {
      return {
        success: false,
        error: `주제 또는 개념을 찾을 수 없습니다: ${topicQuery}`
      };
    }

    const startTopic = fallbackResults[0];
    const backtrack = this.graph.backtrackRootCause(startTopic.id, []);

    const synthSteps = backtrack.path.map((nodeId, idx) => {
      const t = this.graph.getTopic(nodeId) || { id: nodeId, name: nodeId };
      return {
        step: idx + 1,
        schoolLevel: this.getSchoolLevelFromAge(t.ageRangeStart),
        grade: Math.max(1, (t.ageRangeStart || 8) - 7),
        topic: t.name,
        standard: t.standards?.[0]?.code || "",
        triggerError: idx === 0 ? (errorContext || "개념 오용 및 계산 오류") : `선수 개념 [${t.name}]의 미도달`,
        deficitConcept: `${t.name}의 구조적 원리 결손`,
        piagetStage: this.getPiagetFromAge(t.ageRangeStart),
        scaffolding: this.synthesizeScaffolding(t)
      };
    });

    return {
      success: true,
      chainId: `dynamic_${startTopic.id}`,
      chainName: `${startTopic.name} 동적 인과 역추적 사슬`,
      subject: startTopic.subject || "수학",
      originTopic: synthSteps[0],
      causalSteps: synthSteps,
      rootCauseFoundation: synthSteps[synthSteps.length - 1],
      depth: synthSteps.length,
      isCrossSchoolLevel: this.checkCrossSchoolLevel(synthSteps)
    };
  }

  /**
   * 2. 피아제·비고츠키 기반 구체 조작기/발문 비계(Scaffolding) 자동 생성
   * 
   * @param {object} causalStep - 인과 역추적의 특정 단계 노드
   * @returns {object} 3-Tier 구체 조작기 및 발문 비계 명세
   */
  generateScaffoldingSpec(causalStep) {
    const topic = causalStep.topic;
    const stage = causalStep.piagetStage || PiagetStage.CONCRETE_OPERATIONAL;

    // 공용 엔진 도구 자동 바인딩 결정
    const toolBinding = this.resolveManipulativeTool(causalStep);

    return {
      topic: causalStep.topic,
      gradeInfo: `${causalStep.schoolLevel} ${causalStep.grade ? causalStep.grade + "학년" : ""}`.trim(),
      piagetStage: stage,
      brunersRepresentations: {
        enactive: {
          level: BrunerRepresentation.ENACTIVE,
          nameKo: "활동적 구체물 조작 (Enactive Stage)",
          toolType: toolBinding.engineType,
          toolNameKo: toolBinding.toolNameKo,
          interactionGuide: causalStep.scaffolding?.enactive?.guide || toolBinding.defaultGuide,
          implementationSnippet: toolBinding.codeSnippet
        },
        iconic: {
          level: BrunerRepresentation.ICONIC,
          nameKo: "영상적 시각 표상 (Iconic Stage)",
          modelName: causalStep.scaffolding?.iconic?.model || "격자 수직선 및 다이어그램",
          visualGuide: causalStep.scaffolding?.iconic?.guide || "구체물 조작 궤적을 2D 시각 다이어그램으로 표상"
        },
        symbolic: {
          level: BrunerRepresentation.SYMBOLIC,
          nameKo: "상징적 기호화 및 비계 철거 (Symbolic Stage / Fading)",
          formula: causalStep.scaffolding?.symbolic?.formula || "수식 및 언어적 일반화",
          abstractGuide: causalStep.scaffolding?.symbolic?.guide || "시각 모델을 정규 수학/과학 기호로 정식화하고 스스로 해결"
        }
      },
      vygotskyScaffolding: {
        theory: "비고츠키 근접발달영역(ZPD) 기반 3단계 발문 비계",
        activationPrompt: causalStep.vygotskyPrompts?.activation || `[생각 열기] 일상생활에서 '${topic}'을 경험해 본 적이 있나요?`,
        cognitiveConflictPrompt: causalStep.vygotskyPrompts?.cognitiveConflict || `[인지 갈등] 왜 겉보기 모양만으로 판단하면 틀리게 될까요?`,
        internalizationPrompt: causalStep.vygotskyPrompts?.internalization || `[자기화] 오늘 알게 된 비밀을 친구에게 한 문장으로 설명해 보세요.`,
        dialogueScript: this.generateDialogueScript(causalStep)
      }
    };
  }

  /**
   * 공용 엔진 3종과 온톨로지 개념의 자동 바인딩
   */
  resolveManipulativeTool(causalStep) {
    const text = `${causalStep.topic} ${causalStep.deficitConcept || ""}`.toLowerCase();

    // 1) 손가락, 수세기, 신체 수감각
    if (text.includes("손가락") || text.includes("수 세기") || text.includes("몇일까요") || text.includes("수세기") || text.includes("일대일")) {
      return {
        engineType: ManipulativeEngineType.THREE_RIGGED_HAND,
        toolNameKo: "Three.js 21개 관절 3D 리깅 핸드 엔진",
        defaultGuide: "3D 손가락을 하나씩 펴며 사물을 가리키고 실로폰 음계로 1:1 수 감각을 신체화합니다.",
        codeSnippet: `const hand = new ThreeHandRig("handCanvas"); hand.setFingerCount(targetCount);`
      };
    }

    // 2) 양팔 저울, 등식, 방정식, 무게
    if (text.includes("저울") || text.includes("등식") || text.includes("방정식") || text.includes("동치") || text.includes("이항") || text.includes("미분계수")) {
      return {
        engineType: ManipulativeEngineType.PHET_BALANCE_SCALE,
        toolNameKo: "PhET 물리 토크 양팔 저울 시뮬레이터",
        defaultGuide: "양쪽 접시에 사과와 추를 얹어 지렛대 원리에 따른 물리적 수평 평형과 동치를 조작합니다.",
        codeSnippet: `const scale = new PhetBalanceScale(canvas); scale.addLeftWeight(100); scale.addRightWeight(100);`
      };
    }

    // 3) 분수, 수 막대, 비율
    if (text.includes("분수") || text.includes("통분") || text.includes("약분") || text.includes("기울기") || text.includes("수막대")) {
      return {
        engineType: ManipulativeEngineType.PHET_FRACTION_RODS,
        toolNameKo: "PhET 퀴즈네어 수 막대 및 원형 분수판",
        defaultGuide: "분수 조각을 회전시켜 원판 틀에 스냅 결합하며 등가분수와 분모 통분을 시각화합니다.",
        codeSnippet: `const fraction = new PhetFractionRods(canvas); fraction.addPiece("1/6");`
      };
    }

    // 4) 10칸 상자, 묶음, 자릿값
    if (text.includes("10칸") || text.includes("보수") || text.includes("덧셈") || text.includes("뺄셈") || text.includes("가르기")) {
      return {
        engineType: ManipulativeEngineType.PHET_TEN_FRAME,
        toolNameKo: "PhET 10칸 상자 (Ten-Frame) 스프링 스냅 엔진",
        defaultGuide: "10칸 격자에 사과를 드래그 앤 드롭으로 쏙 넣으며 5 묶음 기준 수 감각을 형성합니다.",
        codeSnippet: `const tenframe = new PhetTenFrame(canvas); tenframe.setCount(5);`
      };
    }

    // 5) 기본 3D 사과, 바구니, 주사위
    return {
      engineType: ManipulativeEngineType.THREE_POLY_ASSETS,
      toolNameKo: "Poly.pizza 스타일 3D 사과 및 라탄 바구니",
      defaultGuide: "3D 사과를 바구니에 넣고 빼며 360도 회전 관찰을 통해 수량의 보존성을 체득합니다.",
      codeSnippet: `const viewer = new ThreePolyViewer("assetCanvas"); viewer.loadAsset("fruit_basket");`
    };
  }

  /**
   * 교사-학생 다중 응답 대본 생성
   */
  generateDialogueScript(causalStep) {
    return [
      {
        speaker: "선생님",
        speech: `${causalStep.vygotskyPrompts?.activation || "여러분, 오늘 배울 내용에 대해 함께 생각해 볼까요?"}`
      },
      {
        speaker: "학생 A (직관적 오개념)",
        speech: `${causalStep.triggerError || "눈에 보이는 모양이 더 크니까 이게 더 많거나 맞아요!"}`
      },
      {
        speaker: "선생님 (비계 발문)",
        speech: `${causalStep.vygotskyPrompts?.cognitiveConflict || "과연 겉모양만 보면 그렇게 보일 수 있겠네요! 하지만 교구를 직접 조작해 보면 어떨까요?"}`
      },
      {
        speaker: "학생 B (구체물 조작 후 발견)",
        speech: "와! 교구로 직접 세어보고 맞춰보니까 양쪽의 균형이 정확히 맞았어요!"
      },
      {
        speaker: "선생님 (개념 자기화)",
        speech: `${causalStep.vygotskyPrompts?.internalization || "맞아요! 마지막에 센 수와 전체의 관계를 잊지 마세요."}`
      }
    ];
  }

  /**
   * 3. LLM 결합 무한 콘텐츠 증폭 메타데이터 번들 생성기
   * 
   * LLM 프롬프트에 즉시 주입 가능한 고밀도 구조화 JSON 및 컨텍스트를 출력합니다.
   * 
   * @param {string} topicQuery - 수업 주제
   * @param {object} [options] - 차시, 분량, 대상 학년 옵션
   * @returns {object} LLM 생성 파이프라인 프롬프트 및 메타데이터 번들
   */
  generateLLMExpansionBundle(topicQuery, options = {}) {
    const causalAnalysis = this.backtrackCausalChain(topicQuery);
    if (!causalAnalysis.success) {
      return causalAnalysis;
    }

    const currentStep = causalAnalysis.originTopic;
    const foundationStep = causalAnalysis.rootCauseFoundation;
    const scaffolding = this.generateScaffoldingSpec(currentStep);

    // LLM에게 전달할 고유 메타데이터 주입 프롬프트 생성
    const llmPrompt = `[K-12 인지 위계 온톨로지 기반 정밀 차시 생성 지시서]
1. 주제 및 교육과정 성취기준:
   - 주제: ${currentStep.topic} (${currentStep.schoolLevel} ${currentStep.grade ? currentStep.grade + "학년" : ""})
   - 성취기준: ${currentStep.standard || "2022 개정 교육과정 역량 체계"}
   - 인지 발달 단계: 피아제 ${currentStep.piagetStage}

2. 오답 초·중·고 인과 역추적(DAG Backtracking) 분석:
   - 학생 유발 오류: ${currentStep.triggerError}
   - 근본 결손 개념: ${foundationStep.topic} (${foundationStep.schoolLevel} ${foundationStep.deficitConcept})
   - 역추적 경로: ${causalAnalysis.causalSteps.map(s => `[${s.schoolLevel} ${s.topic}]`).join(" ➔ ")}

3. 피아제·비고츠키 3-Tier 구체 조작기 & 발문 비계:
   - 활동적 구체물 (Enactive): ${scaffolding.brunersRepresentations.enactive.toolNameKo} 활용
     * 조작 가이드: ${scaffolding.brunersRepresentations.enactive.interactionGuide}
     * 공용 엔진 바인딩: ${scaffolding.brunersRepresentations.enactive.toolType}
   - 영상적 표상 (Iconic): ${scaffolding.brunersRepresentations.iconic.modelName}
     * 시각화 가이드: ${scaffolding.brunersRepresentations.iconic.visualGuide}
   - 상징적 기호화 (Symbolic): ${scaffolding.brunersRepresentations.symbolic.formula}
   - 비고츠키 3단계 발문:
     * 도입: ${scaffolding.vygotskyScaffolding.activationPrompt}
     * 인지 갈등: ${scaffolding.vygotskyScaffolding.cognitiveConflictPrompt}
     * 자기화: ${scaffolding.vygotskyScaffolding.internalizationPrompt}

4. 수업 분량 및 활동 확장 요구사항:
   - 총 40분 완결 수업 (도입 5분 - 전개 28분 - 정리 7분)
   - 전개 28분은 3~4개의 심층 인터랙티브 활동(Put Task, Say Task, 짝 하브루타, 물리 저울/상자 실험)으로 풍성하게 구성
   - 모든 활동에 교사용 발문 서랍과 학생 다중 응답 대본 포함
   - 출구 퀴즈 3문항 및 자기 점검 체크리스트 포함
   - 매트 크림 보드(#FAF6ED) 및 무이모지 Paper-Cutting UI 표준 준수`;

    return {
      success: true,
      topicQuery,
      causalAnalysis,
      scaffoldingSpec: scaffolding,
      llmPrompt,
      metadataForStorage: {
        topicId: currentStep.topic,
        chainId: causalAnalysis.chainId,
        causalStepsCount: causalAnalysis.causalSteps.length,
        toolType: scaffolding.brunersRepresentations.enactive.toolType,
        piagetStage: currentStep.piagetStage,
        timestamp: new Date().toISOString()
      }
    };
  }

  checkCrossSchoolLevel(steps) {
    const levels = new Set(steps.map(s => s.schoolLevel).filter(Boolean));
    return levels.size >= 2;
  }

  getSchoolLevelFromAge(age) {
    if (!age) return "초등학교";
    if (age <= 12) return "초등학교";
    if (age <= 15) return "중학교";
    return "고등학교";
  }

  getPiagetFromAge(age) {
    if (!age) return PiagetStage.CONCRETE_OPERATIONAL;
    if (age <= 7) return PiagetStage.PREOPERATIONAL;
    if (age <= 11) return PiagetStage.CONCRETE_OPERATIONAL;
    if (age <= 14) return PiagetStage.EARLY_FORMAL;
    return PiagetStage.FORMAL_OPERATIONAL;
  }

  synthesizeScaffolding(topic) {
    return {
      enactive: {
        tool: "three_poly_assets",
        guide: `${topic.name}의 물리적 구체물을 직접 손으로 조작하여 개념을 체득합니다.`
      },
      iconic: {
        model: `${topic.name} 시각 다이어그램`,
        guide: "조작 결과를 2D 그림과 도표로 표상합니다."
      },
      symbolic: {
        formula: `${topic.name} 기호 체계`,
        guide: "수학적 기호 및 공식을 통해 일반화합니다."
      }
    };
  }
}

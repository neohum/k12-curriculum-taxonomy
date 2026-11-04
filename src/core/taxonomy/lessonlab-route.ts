import { NextRequest, NextResponse } from "next/server";
import { LessonLabCurriculumBridge } from "@/src/lib/taxonomy/LessonLabCurriculumBridge";

const bridge = new LessonLabCurriculumBridge();

/**
 * GET /api/taxonomy/scaffold
 * 
 * Query Parameters:
 * - code: Standard code (e.g. "[6수01-06]", "4국02-01", "12미적1-02-01")
 * - q: Search query (e.g. "분수", "빛", "문장")
 * - level: School level filter ("ES" | "MS" | "HS" | "ALL")
 * - subject: Subject filter ("수학" | "과학" | "국어" 등)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const q = searchParams.get("q");
    const level = (searchParams.get("level") as "ES" | "MS" | "HS" | "ALL") || undefined;
    const subject = searchParams.get("subject") || undefined;

    // 1. 단일 성취기준 비계 지도안 생성 요청
    if (code) {
      const lessonPlan = bridge.generateLessonPlan(code);
      return NextResponse.json(lessonPlan, { status: 200 });
    }

    // 2. 성취기준 검색 요청
    if (q !== null) {
      const standards = bridge.searchStandards(q, {
        schoolLevel: level,
        subject,
        limit: 20
      });
      return NextResponse.json({
        success: true,
        query: q,
        count: standards.length,
        standards
      }, { status: 200 });
    }

    // 3. 파라미터 누락 안내
    return NextResponse.json({
      success: false,
      error: "Missing required query parameter: 'code' or 'q'.",
      examples: [
        "/api/taxonomy/scaffold?code=[6수01-06]",
        "/api/taxonomy/scaffold?code=4국02-01",
        "/api/taxonomy/scaffold?code=12미적1-02-01",
        "/api/taxonomy/scaffold?q=분수&level=ES"
      ]
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal server error"
    }, { status: 500 });
  }
}

/**
 * POST /api/taxonomy/scaffold
 * 
 * Body:
 * {
 *   "code": "[6수01-06]",
 *   "options": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = body.code || body.standardCode;

    if (!code) {
      return NextResponse.json({
        success: false,
        error: "Missing 'code' or 'standardCode' in request body."
      }, { status: 400 });
    }

    const lessonPlan = bridge.generateLessonPlan(code);
    return NextResponse.json(lessonPlan, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal server error"
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tests } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [test] = await db
      .select()
      .from(tests)
      .where(eq(tests.id, id))
      .limit(1);

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: test.id,
      title: test.title,
      examType: test.examType,
      questionCount: test.questionCount,
      shareToken: test.shareToken,
      questions: test.questions,
      createdAt: test.createdAt,
    });
  } catch (error) {
    console.error("Fetch test error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}

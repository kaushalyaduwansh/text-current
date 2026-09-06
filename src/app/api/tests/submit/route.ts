import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testAttempts } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, userName, userId, score, total, answers } = body;

    const [attempt] = await db
      .insert(testAttempts)
      .values({
        testId,
        userName,
        userId,
        score,
        total,
        answers: answers as Record<string, unknown>,
      })
      .returning();

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: attempt.score,
      total: attempt.total,
    });
  } catch (error) {
    console.error("Submit attempt error:", error);
    return NextResponse.json(
      { error: "Failed to submit attempt" },
      { status: 500 }
    );
  }
}

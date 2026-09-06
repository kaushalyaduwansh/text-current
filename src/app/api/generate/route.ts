import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/gemini";
import { db } from "@/lib/db";
import { tests } from "@/lib/schema";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to generate tests" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { images, examType, questionCount, additionalPrompt } = body;

    if (!images || !Array.isArray(images) || images.length === 0 || !examType || !questionCount) {
      return NextResponse.json(
        { error: "Missing required fields or images" },
        { status: 400 }
      );
    }

    // Generate questions using Gemini
    const questions = await generateQuestions(
      images,
      examType,
      questionCount,
      additionalPrompt
    );

    // Create a share token
    const shareToken = nanoid(12);

    // Create title from exam type
    const title = `${examType} - Current Affairs Test`;

    // Store in database
    const [test] = await db
      .insert(tests)
      .values({
        userId: session.user.id,
        title,
        examType,
        questionCount: questions.length,
        imageUrls: images.map((img: { url: string }) => img.url || ""),
        shareToken,
        additionalPrompt,
        questions: questions as unknown as Record<string, unknown>,
      })
      .returning();

    return NextResponse.json({
      success: true,
      testId: test.id,
      shareToken: test.shareToken,
      questionCount: questions.length,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate questions" },
      { status: 500 }
    );
  }
}

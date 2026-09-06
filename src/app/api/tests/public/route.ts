import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tests } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch the latest 10 public tests from the database
    const publicTests = await db
      .select({
        id: tests.id,
        title: tests.title,
        examType: tests.examType,
        questionCount: tests.questionCount,
        shareToken: tests.shareToken,
        createdAt: tests.createdAt,
      })
      .from(tests)
      .orderBy(desc(tests.createdAt))
      .limit(12);

    return NextResponse.json(publicTests);
  } catch (error) {
    console.error("Fetch public tests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}

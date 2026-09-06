import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tests } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userTests = await db
      .select({
        id: tests.id,
        title: tests.title,
        examType: tests.examType,
        questionCount: tests.questionCount,
        shareToken: tests.shareToken,
        createdAt: tests.createdAt,
      })
      .from(tests)
      .where(eq(tests.userId, session.user.id))
      .orderBy(desc(tests.createdAt));

    return NextResponse.json(userTests);
  } catch (error) {
    console.error("Fetch user tests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}

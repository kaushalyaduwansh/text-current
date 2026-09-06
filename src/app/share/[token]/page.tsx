"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { TestBook } from "@/components/test-book";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import type { Question } from "@/lib/schema";

interface TestData {
  id: string;
  title: string;
  examType: string;
  questionCount: number;
  shareToken: string;
  questions: Question[];
}

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTest() {
      try {
        const res = await fetch(`/api/tests/share/${params.token}`);
        if (!res.ok) throw new Error("Test not found");
        const data = await res.json();
        setTest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test");
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [params.token]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (error || !test) {
    return (
      <>
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {t("Test not found", "टेस्ट नहीं मिला")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <TestBook
        testId={test.id}
        title={test.title}
        examType={test.examType}
        questions={test.questions}
        shareToken={test.shareToken}
      />
    </>
  );
}

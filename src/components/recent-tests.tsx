"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";

interface TestSummary {
  id: string;
  title: string;
  examType: string;
  questionCount: number;
  shareToken: string;
  createdAt: string;
}

export function RecentTests() {
  const { t } = useLanguage();
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicTests() {
      try {
        const res = await fetch("/api/tests/public");
        if (res.ok) {
          const data = await res.json();
          setTests(data);
        }
      } catch (err) {
        console.error("Failed to load public tests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicTests();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="h-6 w-32 animate-pulse rounded bg-muted mb-4"></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("Recent Tests", "हाल के टेस्ट")}
        </h2>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        {tests.map((test) => (
          <Link key={test.id} href={`/test/${test.id}`} className="group block">
            <Card className="h-full rounded-xl transition-colors hover:border-primary/50 bg-muted/20">
              <CardContent className="p-4 flex flex-col h-full justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs font-medium text-primary">
                    {test.examType}
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                    {test.title}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {test.questionCount} {t("Questions", "प्रश्न")}
                  </span>
                  <span className="flex items-center justify-center rounded-full bg-background p-1 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BookOpen,
  Share2,
  Plus,
  Clock,
  ChevronRight,
} from "lucide-react";

interface TestItem {
  id: string;
  title: string;
  examType: string;
  questionCount: number;
  shareToken: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { t } = useLanguage();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await fetch("/api/tests");
        if (res.ok) {
          const data = await res.json();
          setTests(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchTests();
  }, [session]);

  const handleShare = async (shareToken: string, title: string) => {
    const url = `${window.location.origin}/share/${shareToken}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(t("Link copied!", "लिंक कॉपी हो गया!"));
    }
  };

  if (isPending || !session) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-lg px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {t("My Tests", "मेरे टेस्ट")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(
                `${tests.length} tests created`,
                `${tests.length} टेस्ट बनाए गए`
              )}
            </p>
          </div>
          <Link href="/">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              {t("New", "नया")}
            </Button>
          </Link>
        </div>

        {/* Tests List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">
              {t("No tests yet", "अभी तक कोई टेस्ट नहीं")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "Create your first test from your notes",
                "अपने नोट्स से पहला टेस्ट बनाएं"
              )}
            </p>
            <Link href="/">
              <Button className="mt-4">
                {t("Create Test", "टेस्ट बनाएं")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => (
              <Card
                key={test.id}
                className="overflow-hidden transition-colors hover:bg-muted/30"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {test.examType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {test.questionCount} Q
                        </span>
                      </div>
                      <p className="mt-1.5 truncate text-sm font-medium">
                        {test.title}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(test.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(test.shareToken, test.title);
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Link href={`/test/${test.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

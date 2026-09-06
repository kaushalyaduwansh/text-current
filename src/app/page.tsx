"use client";

import { Header } from "@/components/header";
import { CreateTestForm } from "@/components/create-test-form";
import { RecentTests } from "@/components/recent-tests";
import { useLanguage } from "@/lib/language-context";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Sparkles, Share2, Globe, Shield } from "lucide-react";

export default function HomePage() {
  const { t } = useLanguage();
  const { data: session } = useSession();

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="mx-auto max-w-lg px-4 py-8 text-center">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              {t("AI-Powered Question Generation", "AI-संचालित प्रश्न निर्माण")}
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("Current Affair Revision", "करंट अफेयर रिवीजन")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Upload your notes, generate exam-ready MCQs instantly",
                "अपने नोट्स अपलोड करें, तुरंत परीक्षा-तैयार MCQ बनाएं"
              )}
            </p>
          </div>
        </div>

        {/* Features (compact) */}
        {!session && (
          <div className="border-b">
            <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 px-4 py-5 sm:grid-cols-4">
              {[
                {
                  icon: BookOpen,
                  en: "Exam Pattern",
                  hi: "परीक्षा पैटर्न",
                },
                {
                  icon: Globe,
                  en: "Hindi + English",
                  hi: "हिंदी + English",
                },
                {
                  icon: Share2,
                  en: "Share Tests",
                  hi: "टेस्ट शेयर करें",
                },
                {
                  icon: Shield,
                  en: "Free to Use",
                  hi: "निःशुल्क",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/50 p-3 text-center"
                >
                  <feature.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">
                    {t(feature.en, feature.hi)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {session ? (
          <div className="pt-6">
            <div className="mx-auto max-w-lg px-4 pb-3">
              <h2 className="text-lg font-semibold">
                {t("Create a New Test", "नया टेस्ट बनाएं")}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t(
                  "Upload your current affairs notes to get started",
                  "शुरू करने के लिए अपने करंट अफेयर्स नोट्स अपलोड करें"
                )}
              </p>
            </div>
            <CreateTestForm />
          </div>
        ) : (
          <div className="mx-auto max-w-lg px-4 py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {t("Login to Generate Tests", "टेस्ट बनाने के लिए लॉगिन करें")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    "Create an account to start generating MCQ tests from your notes",
                    "अपने नोट्स से MCQ टेस्ट बनाने के लिए अकाउंट बनाएं"
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/login">
                  <Button size="lg">{t("Login", "लॉग इन")}</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" size="lg">
                    {t("Sign Up", "साइन अप")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Tests Section */}
        <div className="border-t">
          <RecentTests />
        </div>
      </main>
    </>
  );
}

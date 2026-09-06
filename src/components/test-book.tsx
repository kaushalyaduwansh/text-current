"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { vibrateCorrect, vibrateWrong, vibrateLight } from "@/lib/haptics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LanguageToggle } from "@/components/language-toggle";
import { toast } from "sonner";
import type { Question } from "@/lib/schema";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Grid3X3,
  Share2,
  Trophy,
  RotateCcw,
  BookOpen,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TestBookProps {
  testId: string;
  title: string;
  examType: string;
  questions: Question[];
  shareToken: string;
}

type AnswerState = {
  selected: string | null;
  isCorrect: boolean | null;
  isLocked: boolean;
};

export function TestBook({
  testId,
  title,
  examType,
  questions,
  shareToken,
}: TestBookProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [startTime] = useState(Date.now());
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const totalAnswered = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(
    (a) => a.isCorrect
  ).length;

  // Swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && currentIndex > 0) {
        vibrateLight();
        setCurrentIndex((i) => i - 1);
      } else if (diff < 0 && currentIndex < questions.length - 1) {
        vibrateLight();
        setCurrentIndex((i) => i + 1);
      }
    }
    setTouchStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      } else if (
        e.key === "ArrowRight" &&
        currentIndex < questions.length - 1
      ) {
        setCurrentIndex((i) => i + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, questions.length]);

  const selectAnswer = useCallback(
    (optionLetter: string) => {
      if (currentAnswer?.isLocked) return;

      const isCorrect = optionLetter === currentQuestion.correct_answer;

      if (isCorrect) {
        vibrateCorrect();
      } else {
        vibrateWrong();
      }

      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: {
          selected: optionLetter,
          isCorrect,
          isLocked: true,
        },
      }));
    },
    [currentAnswer, currentQuestion, currentIndex]
  );

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          score: correctCount,
          total: questions.length,
          answers,
        }),
      });
      setShowResult(true);
    } catch {
      toast.error(t("Failed to submit test", "टेस्ट सबमिट करने में विफल"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/share/${shareToken}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: t(
            `Take this ${examType} Current Affairs Test!`,
            `यह ${examType} करंट अफेयर्स टेस्ट दें!`
          ),
          url,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(t("Link copied!", "लिंक कॉपी हो गया!"));
    }
  };

  // ── Result Screen ────────────────────────────────────
  if (showResult) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 60000);

    return (
      <div className="mx-auto flex min-h-[80vh] w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-8">
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary bg-primary/10">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-lg font-bold">
            {percentage}%
          </Badge>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {percentage >= 70
              ? t("Excellent! 🎉", "उत्कृष्ट! 🎉")
              : percentage >= 40
                ? t("Good effort! 👍", "अच्छा प्रयास! 👍")
                : t("Keep practicing! 💪", "अभ्यास जारी रखें! 💪")}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {t(
              `You scored ${correctCount} out of ${questions.length}`,
              `आपने ${questions.length} में से ${correctCount} सही किए`
            )}
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center p-3">
              <Check className="mb-1 h-5 w-5 text-green-500" />
              <span className="text-lg font-bold text-green-600">
                {correctCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("Correct", "सही")}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-3">
              <X className="mb-1 h-5 w-5 text-red-500" />
              <span className="text-lg font-bold text-red-600">
                {totalAnswered - correctCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("Wrong", "गलत")}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-3">
              <Clock className="mb-1 h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-bold">
                {timeSpent}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("Min", "मिनट")}
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="flex w-full flex-col gap-2">
          <Button onClick={handleShare} className="w-full gap-2" size="lg">
            <Share2 className="h-4 w-4" />
            {t("Share Test", "टेस्ट शेयर करें")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowResult(false);
              setCurrentIndex(0);
            }}
            className="w-full gap-2"
            size="lg"
          >
            <BookOpen className="h-4 w-4" />
            {t("Review Answers", "उत्तर समीक्षा करें")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("Create New Test", "नया टेस्ट बनाएं")}
          </Button>
        </div>
      </div>
    );
  }

  // ── Test Book UI ─────────────────────────────────────
  const optionLetters = ["A", "B", "C", "D"];
  const questionText =
    language === "en"
      ? currentQuestion.question_en
      : currentQuestion.question_hi;
  const options =
    language === "en"
      ? currentQuestion.options_en
      : currentQuestion.options_hi;
  const explanation =
    language === "en"
      ? currentQuestion.explanation_en
      : currentQuestion.explanation_hi;

  // Generate a stable key for animation when question changes
  const slideKey = `question-${currentIndex}`;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col bg-background selection:bg-primary/20" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      {/* Top Bar - Premium Glassmorphism */}
      <div className="sticky top-14 z-40 bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              {examType}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <Dialog open={showPalette} onOpenChange={setShowPalette}>
              <DialogTrigger
                render={
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                }
              />
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>
                    {t("Question Palette", "प्रश्न पैलेट")}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-8 gap-2 py-4">
                  {questions.map((_, i) => {
                    const ans = answers[i];
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentIndex(i);
                          setShowPalette(false);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                          i === currentIndex
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                        } ${
                          ans?.isCorrect === true
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : ans?.isCorrect === false
                              ? "bg-red-500/20 text-red-700 dark:text-red-400"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-green-500/20" />
                    {t("Correct", "सही")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-red-500/20" />
                    {t("Wrong", "गलत")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-muted" />
                    {t("Unanswered", "अनुत्तरित")}
                  </span>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 w-8 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Progress
          value={((currentIndex + 1) / questions.length) * 100}
          className="h-1"
        />
      </div>

      {/* Question Area */}
      <div
        key={slideKey}
        className="flex flex-1 flex-col px-5 py-6 animate-in slide-in-from-right-4 fade-in duration-300 fill-mode-forwards"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Question Header */}
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {t("Q", "प्रश्न")} {currentIndex + 1} / {questions.length}
          </Badge>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {totalAnswered}/{questions.length} {t("answered", "उत्तर दिए")}
          </span>
        </div>

        {/* Question Text */}
        <div className="mb-7">
          <h2 className="text-xl font-bold leading-snug tracking-tight text-foreground/90">
            {questionText}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option, idx) => {
            const letter = optionLetters[idx];
            const isSelected = currentAnswer?.selected === letter;
            const isCorrectOption =
              currentAnswer?.isLocked &&
              letter === currentQuestion.correct_answer;
            const isWrongSelected =
              isSelected && currentAnswer?.isCorrect === false;

            let extraClasses = "h-auto w-full justify-start whitespace-normal px-4 py-3.5 text-left text-sm transition-all";
            
            if (isCorrectOption) {
              extraClasses += " border-green-500 bg-green-500/10 text-green-700 hover:bg-green-500/20 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
            } else if (isWrongSelected) {
              extraClasses += " border-red-500 bg-red-500/10 text-red-700 hover:bg-red-500/20 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
            } else if (currentAnswer?.isLocked) {
              extraClasses += " border-border/50 bg-muted/30 opacity-70";
            } else {
              extraClasses += " hover:bg-muted/70 hover:border-primary/50 shadow-sm";
            }

            return (
              <Button
                key={letter}
                variant="outline"
                onClick={() => selectAnswer(letter)}
                disabled={currentAnswer?.isLocked}
                className={extraClasses}
                id={`option-${letter}`}
              >
                <div className="flex w-full items-start gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-background text-xs font-bold shadow-sm transition-colors ${
                      isCorrectOption
                        ? "bg-green-500 text-white ring-0"
                        : isWrongSelected
                          ? "bg-red-500 text-white ring-0"
                          : "text-foreground/70 ring-1 ring-border/50 group-hover:text-primary group-hover:ring-primary/50"
                    }`}
                  >
                    {isCorrectOption ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isWrongSelected ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      letter
                    )}
                  </span>
                  <span className="pt-0.5 leading-relaxed">
                    {option.replace(/^[A-D]\.\s*/, "")}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Explanation */}
        {currentAnswer?.isLocked && explanation && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold text-primary">
                {t("Explanation", "व्याख्या")}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">
              {explanation}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-40 border-t border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 pb-safe">
        <div className="flex items-center justify-between px-5 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              vibrateLight();
              setCurrentIndex((i) => Math.max(0, i - 1));
            }}
            disabled={currentIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("Prev", "पिछला")}
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              size="lg"
              className="gap-2 px-8 rounded-full font-bold shadow-md hover:shadow-primary/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  {t("Submitting...", "सबमिट हो रहा...")}
                </>
              ) : (
                <>
                  {t("Submit Test", "टेस्ट सबमिट करें")}
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              onClick={() => {
                vibrateLight();
                setCurrentIndex((i) =>
                  Math.min(questions.length - 1, i + 1)
                );
              }}
              className="gap-2 px-6 rounded-full font-semibold shadow-md hover:shadow-primary/25 transition-all"
            >
              {t("Next", "अगला")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

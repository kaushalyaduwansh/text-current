"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { BookOpen, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error(
        t(
          "Password must be at least 8 characters",
          "पासवर्ड कम से कम 8 अक्षर का होना चाहिए"
        )
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        toast.error(
          result.error.message || t("Signup failed", "साइन अप विफल")
        );
        return;
      }

      toast.success(
        t("Account created! Welcome!", "अकाउंट बन गया! स्वागत है!")
      );
      router.push("/");
      router.refresh();
    } catch {
      toast.error(t("Something went wrong", "कुछ गलत हो गया"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">
          {t("Current Affair Revision", "करंट अफेयर रिवीजन")}
        </span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {t("Create Account", "अकाउंट बनाएं")}
          </CardTitle>
          <CardDescription>
            {t(
              "Sign up to start generating exam tests",
              "परीक्षा टेस्ट बनाने के लिए साइन अप करें"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">{t("Name", "नाम")}</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder={t("Your name", "आपका नाम")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">{t("Email", "ईमेल")}</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">
                {t("Password", "पासवर्ड")}
              </Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                {t("Minimum 8 characters", "न्यूनतम 8 अक्षर")}
              </p>
            </div>
            <Button
              type="submit"
              className="h-11 w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t("Create Account", "अकाउंट बनाएं")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("Already have an account?", "पहले से अकाउंट है?")}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t("Login", "लॉग इन")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

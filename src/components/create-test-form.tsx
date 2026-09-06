"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Camera,
  Sparkles,
  Loader2,
  ImageIcon,
  X,
  Plus,
} from "lucide-react";

const EXAM_OPTIONS = [
  { value: "NTPC Undergraduate", label_en: "NTPC Undergraduate", label_hi: "NTPC अंडरग्रेजुएट" },
  { value: "NTPC Graduate", label_en: "NTPC Graduate", label_hi: "NTPC ग्रेजुएट" },
  { value: "ALP", label_en: "ALP (Assistant Loco Pilot)", label_hi: "ALP (सहायक लोको पायलट)" },
  { value: "SSC CGL", label_en: "SSC CGL", label_hi: "SSC CGL" },
  { value: "SSC CHSL", label_en: "SSC CHSL", label_hi: "SSC CHSL" },
];

const QUESTION_COUNT_OPTIONS = [
  { value: "50", label: "50" },
  { value: "100", label: "100" },
  { value: "150", label: "150" },
  { value: "200", label: "200" },
];

interface ImageUploadData {
  id: string;
  preview: string;
  base64: string;
  mimeType: string;
}

export function CreateTestForm() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [examType, setExamType] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [images, setImages] = useState<ImageUploadData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error(t("You can upload a maximum of 5 images", "आप अधिकतम 5 चित्र अपलोड कर सकते हैं"));
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(t(`File ${file.name} is not an image`, `फ़ाइल ${file.name} एक चित्र नहीं है`));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(
          t(`Image ${file.name} size should be less than 10MB`, `चित्र ${file.name} का आकार 10MB से कम होना चाहिए`)
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64 = result.split(",")[1];
        
        setImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            preview: result,
            base64,
            mimeType: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const uploadToImageKit = async (base64Data: string, mimeType: string, index: number, total: number): Promise<string> => {
    try {
      setStatusMessage(t(`Uploading image ${index} of ${total}...`, `चित्र ${index}/${total} अपलोड हो रहा है...`));
      const authRes = await fetch("/api/upload-auth");
      const authParams = await authRes.json();

      const formData = new FormData();
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      formData.append("file", blob, `notes_${Date.now()}_${index}.${mimeType.split("/")[1]}`);
      formData.append("fileName", `notes_${Date.now()}_${index}`);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire.toString());
      formData.append("token", authParams.token);
      formData.append("folder", "/current-affair-revision");

      const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      return uploadData.url || "";
    } catch (error) {
      console.error("ImageKit upload error:", error);
      return "";
    }
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      toast.error(t("Please upload at least one image of your notes", "कृपया अपने नोट्स की कम से कम एक इमेज अपलोड करें"));
      return;
    }
    if (!examType) {
      toast.error(t("Please select a target exam", "कृपया एक लक्ष्य परीक्षा चुनें"));
      return;
    }
    if (!questionCount) {
      toast.error(
        t("Please select the number of questions", "कृपया प्रश्नों की संख्या चुनें")
      );
      return;
    }

    setIsGenerating(true);
    setUploadProgress(10);
    setStatusMessage(t("Starting generation process...", "प्रक्रिया शुरू हो रही है..."));

    try {
      // 1. Upload all images to ImageKit
      const uploadedImages = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const url = await uploadToImageKit(img.base64, img.mimeType, i + 1, images.length);
        uploadedImages.push({
          url,
          base64: img.base64,
          mimeType: img.mimeType
        });
        setUploadProgress(10 + ((i + 1) / images.length) * 30); // Up to 40%
      }

      setStatusMessage(t(
        "AI is analyzing your notes. This may take 1-2 minutes...",
        "AI आपके नोट्स का विश्लेषण कर रहा है। इसमें 1-2 मिनट लग सकते हैं..."
      ));
      setUploadProgress(50);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: uploadedImages,
          examType,
          questionCount: parseInt(questionCount),
          additionalPrompt,
        }),
      });

      setUploadProgress(90);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate questions");
      }

      const data = await res.json();
      setUploadProgress(100);
      setStatusMessage(t("Done!", "हो गया!"));

      toast.success(
        t(
          `Test created with ${data.questionCount} questions!`,
          `${data.questionCount} प्रश्नों के साथ टेस्ट बनाया गया!`
        )
      );

      router.push(`/test/${data.testId}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("Failed to generate test", "टेस्ट बनाने में विफल")
      );
      setIsGenerating(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-4 pb-8 pt-2">
      {/* Image Upload Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold text-foreground">
            {t("Notes Photos", "नोट्स की तस्वीरें")}
          </Label>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {images.length}/5
          </span>
        </div>
        
        {images.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
            {images.map((img) => (
              <div 
                key={img.id} 
                className="relative shrink-0 snap-center animate-in zoom-in-95 duration-200"
              >
                <div className="overflow-hidden rounded-2xl border bg-muted/30 shadow-sm h-[200px] w-[140px]">
                  <img
                    src={img.preview}
                    alt="Notes preview"
                    className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-7 w-7 rounded-full shadow-md z-10"
                  onClick={() => removeImage(img.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {images.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex shrink-0 snap-center h-[200px] w-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 text-primary transition-all hover:bg-primary/10 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{t("Add More", "और जोड़ें")}</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-10 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]"
            id="upload-button"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/50 transition-all duration-300 ease-out">
              <Camera className="h-7 w-7" />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="h-3 w-3" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                {t(
                  "Upload your notes photos",
                  "अपने नोट्स की तस्वीरें अपलोड करें"
                )}
              </p>
              <p className="text-sm">
                {t(
                  "Tap to select up to 5 photos",
                  "5 तस्वीरें तक चुनने के लिए टैप करें"
                )}
              </p>
            </div>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleImageSelect}
          className="hidden"
          id="file-input"
        />
      </div>

      {/* Form Controls inside a neat card */}
      <Card className="overflow-hidden border-none shadow-md ring-1 ring-border/50 bg-background/60 backdrop-blur-xl">
        <CardContent className="p-5 space-y-5">
          {/* Exam Type */}
          <div className="space-y-2.5">
            <Label htmlFor="exam-type" className="text-sm font-semibold">
              {t("Target Exam", "लक्ष्य परीक्षा")}
            </Label>
            <Select
              value={examType}
              onValueChange={(val) => { if (val !== null) setExamType(val); }}
            >
              <SelectTrigger id="exam-type" className="h-12 w-full rounded-xl bg-background shadow-sm">
                <SelectValue
                  placeholder={t("Select your exam", "अपनी परीक्षा चुनें")}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {EXAM_OPTIONS.map((exam) => (
                  <SelectItem key={exam.value} value={exam.value} className="rounded-lg py-2.5">
                    {language === "en" ? exam.label_en : exam.label_hi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Count */}
          <div className="space-y-2.5">
            <Label htmlFor="question-count" className="text-sm font-semibold">
              {t("Number of Questions", "प्रश्नों की संख्या")}
            </Label>
            <Select
              value={questionCount}
              onValueChange={(val) => { if (val !== null) setQuestionCount(val); }}
            >
              <SelectTrigger id="question-count" className="h-12 w-full rounded-xl bg-background shadow-sm">
                <SelectValue
                  placeholder={t("Select count", "संख्या चुनें")}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {QUESTION_COUNT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-lg py-2.5">
                    {option.label} {t("Questions", "प्रश्न")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Prompt */}
          <div className="space-y-2.5">
            <Label htmlFor="additional-prompt" className="text-sm font-semibold flex items-center justify-between">
              {t("Additional Instructions", "अतिरिक्त निर्देश")}
              <span className="text-xs font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {t("Optional", "वैकल्पिक")}
              </span>
            </Label>
            <Textarea
              id="additional-prompt"
              placeholder={t(
                "E.g., Focus on international affairs, Include more date-based questions...",
                "जैसे, अंतरराष्ट्रीय मामलों पर ध्यान दें, तारीख-आधारित प्रश्न शामिल करें..."
              )}
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              className="min-h-[90px] resize-none rounded-xl bg-background shadow-sm focus-visible:ring-primary/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Button Area */}
      <div className="pt-2 pb-6">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || images.length === 0 || !examType || !questionCount}
          className="relative h-14 w-full overflow-hidden rounded-2xl text-base font-bold shadow-lg transition-all hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          size="lg"
          id="generate-button"
        >
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center z-10 w-full h-full relative">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin opacity-80" />
                <span>{uploadProgress < 100 ? `${Math.round(uploadProgress)}%` : t("Finalizing...", "अंतिम रूप दिया जा रहा है...")}</span>
              </div>
              {/* Progress background fill */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-primary-foreground/20 transition-all duration-300 ease-out z-[-1]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>{t("Generate Test", "टेस्ट बनाएं")}</span>
            </div>
          )}
        </Button>
        
        {isGenerating && statusMessage && (
          <p className="mt-4 text-center text-sm font-medium text-muted-foreground animate-pulse">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}

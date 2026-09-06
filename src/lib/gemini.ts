import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Question } from "./schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const EXAM_DESCRIPTIONS: Record<string, string> = {
  "NTPC Undergraduate":
    "RRB NTPC (Non-Technical Popular Categories) for 12th pass level. Focus on General Awareness, Current Affairs, and basic reasoning. Difficulty: Moderate.",
  "NTPC Graduate":
    "RRB NTPC (Non-Technical Popular Categories) for Graduate level. Focus on in-depth Current Affairs, General Knowledge, Economics, Polity, History, and Geography. Difficulty: Moderate to High.",
  "ALP":
    "RRB ALP (Assistant Loco Pilot). Focus on Current Affairs, General Science, Mathematics, and basic technical awareness. Difficulty: Moderate.",
  "SSC CGL":
    "SSC CGL (Combined Graduate Level). Focus on in-depth Current Affairs, General Awareness, Polity, Economics, History, Geography, and Static GK. Difficulty: High.",
  "SSC CHSL":
    "SSC CHSL (Combined Higher Secondary Level). Focus on Current Affairs, General Awareness, and basic General Knowledge. Difficulty: Moderate.",
};

export async function generateQuestions(
  images: { url: string; mimeType: string }[],
  examType: string,
  questionCount: number,
  additionalPrompt?: string
): Promise<Question[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

  const examDescription = EXAM_DESCRIPTIONS[examType] || examType;

  const prompt = `You are an expert Indian government competitive exam question paper setter with deep expertise in Current Affairs for exams like SSC, RRB NTPC, and ALP.

TASK: Analyze the provided current affairs notes image(s) carefully and generate high-quality MCQ (Multiple Choice Questions) based on the content visible in the images.

TARGET EXAM: ${examType}
EXAM DETAILS: ${examDescription}
NUMBER OF QUESTIONS: ${questionCount}
LANGUAGE: Bilingual — provide BOTH Hindi and English for every question, every option, and every explanation.

${additionalPrompt ? `ADDITIONAL INSTRUCTIONS FROM USER: ${additionalPrompt}` : ""}

RULES:
1. Each question MUST be directly based on information visible in the provided image(s).
2. Questions must match the difficulty level and exam pattern of ${examType}.
3. Provide exactly 4 options (A, B, C, D) for each question.
4. Only ONE option should be correct.
5. Include a concise explanation (1-2 lines) for WHY the correct answer is correct.
6. Cover diverse aspects: facts, dates, people, places, organizations, policies, events.
7. Avoid ambiguous questions — each question should have one clear correct answer.
8. Hindi text should be natural Hindi (not machine-translated), using Devanagari script.
9. Questions should test: factual recall, analytical understanding, and application.
10. Follow the exact JSON format specified below.

OUTPUT FORMAT (strict JSON array, no markdown, no code blocks):
[
  {
    "id": 1,
    "question_en": "English question text?",
    "question_hi": "हिंदी प्रश्न पाठ?",
    "options_en": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "options_hi": ["A. विकल्प 1", "B. विकल्प 2", "C. विकल्प 3", "D. विकल्प 4"],
    "correct_answer": "A",
    "explanation_en": "Brief explanation in English",
    "explanation_hi": "हिंदी में संक्षिप्त व्याख्या"
  }
]

Generate EXACTLY ${questionCount} questions. Return ONLY the JSON array, nothing else.`;

  const imageParts = await Promise.all(
    images.map(async (img) => {
      const response = await fetch(img.url);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return {
        inlineData: {
          data: base64,
          mimeType: img.mimeType,
        },
      };
    })
  );

  const result = await model.generateContent([prompt, ...imageParts]);
  const responseText = result.response.text();

  // Clean the response — remove markdown code blocks if present
  const cleaned = responseText
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const questions: Question[] = JSON.parse(cleaned);
  return questions;
}

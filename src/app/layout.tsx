import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Current Affair Revision | AI-Powered Test Generator",
  description:
    "Upload your current affairs notes and generate exam-ready MCQ tests for SSC CGL, CHSL, RRB NTPC, ALP and more. Bilingual Hindi & English support.",
  keywords: [
    "current affairs",
    "MCQ test",
    "SSC CGL",
    "SSC CHSL",
    "RRB NTPC",
    "ALP",
    "government exam",
    "Hindi English",
    "AI quiz",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        notoDevanagari.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

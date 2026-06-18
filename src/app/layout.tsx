import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MotionProvider from "@/components/shared/MotionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coach Conan | Personal Trainer & Online Fitness Coach | Cairo, Egypt",
  description:
    "Transform your body and mind with Coach Conan — Cairo's premier personal trainer. Certified fitness coach offering personal training, online coaching, nutrition planning, and body transformation programs. 10+ years experience, 500+ success stories.",
  keywords: [
    "Coach Conan",
    "Personal Trainer Cairo",
    "Online Fitness Coach",
    "Body Transformation",
    "FitHub Gym",
    "Nutrition Planning",
    "Strength Training",
    "Egypt Fitness",
    "Cairo Gym",
    "Online Coaching",
  ],
  authors: [{ name: "Coach Conan" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Coach Conan | Personal Trainer & Online Fitness Coach",
    description:
      "Transform your body and mind with Cairo's premier personal trainer. 10+ years experience, 500+ transformations.",
    url: "https://coachconnan.com",
    siteName: "Coach Conan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coach Conan | Personal Trainer & Online Fitness Coach",
    description:
      "Transform your body and mind with Cairo's premier personal trainer.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <MotionProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </MotionProvider>
        <Toaster />
      </body>
    </html>
  )
}

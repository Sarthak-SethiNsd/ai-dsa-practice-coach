import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSA AI Coach",
  description: "Accelerate your data structures and algorithms mastery with AI-driven guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans antialiased text-slate-900 bg-slate-50/50">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}

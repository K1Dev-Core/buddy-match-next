import { CodeBackdrop } from "@/components/layout/code-backdrop";
import { PageTransitionShell } from "@/components/layout/page-transition-shell";
import { ChestPreloader } from "@/components/reveal/chest-preloader";
import { DebugTool } from "@/components/shared/debug-tool";
import { SoundProvider } from "@/components/shared/sound-provider";
import { ToastProvider } from "@/components/shared/toaster";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "CodeLineageสายเลือดโค้ด — พี่น้องสายเดียวกัน",
  description: "Soft playful buddy matching experience for campus seniors and juniors"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={jakarta.className}>
        <ChestPreloader />
        <CodeBackdrop />
        <Suspense><DebugTool /></Suspense>
        <ToastProvider>
          <SoundProvider>
          <Suspense fallback={children}>
          <PageTransitionShell>{children}</PageTransitionShell>
        </Suspense>
        </SoundProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

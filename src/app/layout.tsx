import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKILL / CAST — 기술명 타이핑 액션",
  description: "기술명을 외쳐 전투하는 타이핑 액션 게임 · Phase 2 타이핑 전투",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}

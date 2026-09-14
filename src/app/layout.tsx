import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKILL / CAST — 기술명 타이핑 액션",
  description: "기술명을 직접 입력해 공격하고 회피하는 싱글 플레이 타이핑 액션 게임",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}

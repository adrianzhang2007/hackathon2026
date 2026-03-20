import type { Metadata } from "next";
import { Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_SC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSans = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "知乎热榜零号剧场 - AI分身演绎真实事件",
  description: "从知乎热榜获取真实事件，转化为可演绎的剧本杀，让AI分身扮演角色，在多AI实时互动中演绎剧情。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSerif.variable} ${notoSans.variable} font-sans antialiased bg-[#faf8f5] text-[#3d3833]`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "giftmixtape",
  description: "노래 5곡을 골라 카세트테이프를 만들고, 링크로 친구에게 선물하세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

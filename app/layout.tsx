import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yunhao AI Lab",
  description: "Personal AI engineering portfolio by Yunhao Du.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

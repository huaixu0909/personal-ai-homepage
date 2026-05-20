import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "曾见云霞满天 AI Lab",
  description: "AI engineering portfolio for RAG, Agents, and LLM applications.",
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

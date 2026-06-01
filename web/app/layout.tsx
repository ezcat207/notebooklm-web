import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notebook and Batch - NotebookLM 批量工具",
  description: "批量导入导出 NotebookLM 内容，无需安装 CLI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

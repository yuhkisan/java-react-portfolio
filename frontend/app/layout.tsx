import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "./components/header/AppHeader";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Dependency Vulnerability Scanner",
  description: "依存関係の脆弱性スキャナー - セキュリティ管理ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>
        <AppHeader />
        <main>{children}</main>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}

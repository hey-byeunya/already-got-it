import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BfcacheGuard from "@/components/BfcacheGuard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "이미 있어",
  description: "개인 재고 관리 웹앱",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sidebarUser = user
    ? { nickname: (user.user_metadata?.nickname as string | undefined) ?? null, email: user.email ?? "" }
    : null;

  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <BfcacheGuard />
        <div className="flex min-h-full flex-1 flex-col md:flex-row">
          <Sidebar user={sidebarUser} />
          <main className="flex w-full flex-1 flex-col px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
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

  const headerUser = user
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
        <Header user={headerUser} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

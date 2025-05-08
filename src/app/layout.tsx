"use client";
import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/globals.scss";
import Navigation from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { LangProvider } from "@/lang/LangProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import ChatGeneral from "@/components/chat/ChatGeneral";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Khởi tạo QueryClient trong component để nó không bị chia sẻ giữa các yêu cầu
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
      },
    },
  }));

  return (
    <html suppressHydrationWarning>
      <head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <style jsx global>{`
          body {
            font-family: Switzer, MiSans, "Microsoft YaHei", sans-serif;
          }
        `}</style>
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <LangProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
              <div className="min-h-screen bg-[#747474] dark:bg-gray-950 transition-colors duration-300">
                <Navigation />
                <main className="min-h-[calc(100vh-64px)]">{children}</main>
              </div>
              <ChatGeneral />
            </ThemeProvider>
            <ToastContainer theme="dark" />
          </LangProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
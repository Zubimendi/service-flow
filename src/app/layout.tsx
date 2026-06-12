import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ServiceFlow — Booking & CRM for Local Businesses",
  description: "Multi-tenant booking platform for salons, gyms, tutors, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <AuthSessionProvider>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

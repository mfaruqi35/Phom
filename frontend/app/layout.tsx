import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phom — AI Defense Simulator",
  description:
    "Platform SaaS simulator sidang skripsi berbasis AI. Latih mental, uji metodologi, dan perkuat argumen akademismu sebelum sidang.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F9FAFB]">{children}</body>
    </html>
  );
}

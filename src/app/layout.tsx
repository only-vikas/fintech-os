import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fintech OS — Personal Financial Operating System",
  description: "AI-powered financial intelligence platform with a desktop-style operating environment. Track expenses, decode transactions, get AI guidance, and plan investments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

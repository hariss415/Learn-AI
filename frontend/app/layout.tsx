import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEARN AI | Adaptive Learning",
  description: "An adaptive learning workspace with practical missions, mastery tracking and reinforcement.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

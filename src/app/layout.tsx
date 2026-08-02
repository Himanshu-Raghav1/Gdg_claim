import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claim Your GDG Photo",
  description: "Enter your code to download your GDG Akinator Polaroid photo.",
  openGraph: {
    title: "GDG Akinator — Claim Your Photo",
    description: "Scan the code from your GDG Akinator session to download your personalized Polaroid photo.",
    siteName: "GDG MITWPU",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

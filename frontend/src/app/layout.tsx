import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StrideScan | AI-Powered Plantar Pressure Analysis",
  description: "Advanced Plantar Pressure Heatmap Classification & Grad-CAM Explainability for Diabetic Foot Diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900 font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}

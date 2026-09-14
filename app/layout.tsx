import type { Metadata } from "next";
import { poppins } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ditto assessments",
  description: "Ditto quiz and assessment platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <body className="min-h-full flex flex-col bg-surface-page text-text-body font-sans">
        {children}
      </body>
    </html>
  );
}

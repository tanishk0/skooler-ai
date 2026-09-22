import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skooler AI",
  description: "AI-Powered Learning Platform",
  icons: {
    icon: [
      { url: "/assets/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/assets/favicon.png",
    apple: "/assets/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-[#FDF8F3] text-[#4E342E]">
        {children}
      </body>
    </html>
  );
}

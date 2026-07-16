import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raj Tiwari | Portfolio",
  description: "Portfolio of Raj Tiwari - BCA CS & IT Student specializing in Software Development, AI Technology, and Modern Web Applications",
  keywords: [
    "Raj Tiwari",
    "Software Developer",
    "AI Technology",
    "Web Developer",
    "Portfolio",
    "BCA",
    "Computer Science",
    "Full Stack Developer",
    "React Developer",
    "Next.js Developer"
  ],
  authors: [{ name: "Raj Tiwari" }],
  creator: "Raj Tiwari",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rajbtiwari.dev",
    siteName: "Raj Tiwari Portfolio",
    title: "Raj Tiwari | Portfolio",
    description: "Portfolio of Raj Tiwari - BCA CS & IT Student specializing in Software Development, AI Technology, and Modern Web Applications",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Raj Tiwari Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raj Tiwari | Portfolio",
    description: "Portfolio of Raj Tiwari - BCA CS & IT Student specializing in Software Development, AI Technology, and Modern Web Applications",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

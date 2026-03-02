import type { Metadata } from "next";
import { Space_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = "https://getoutlier.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Outlier — YouTube Channel Gap Analyzer",
  description:
    "See exactly how your YouTube channel compares to the ones beating you. AI-analyzed thumbnail gaps, title formulas, and upload consistency in 30 seconds.",
  keywords: [
    "YouTube analytics",
    "thumbnail analysis",
    "YouTube channel comparison",
    "YouTube growth",
    "thumbnail optimization",
    "YouTube strategy",
    "competitive analysis",
    "Claude Vision",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  robots: "index, follow",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Outlier — The Gap Between Your Channel and Theirs? We Measured It.",
    description:
      "AI-powered thumbnails, titles, and strategy analysis — free, 30 seconds.",
    type: "website",
    siteName: "Outlier",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Outlier — YouTube Channel Gap Analyzer",
    description:
      "The gap between your channel and theirs? We measured it. AI-powered analysis in 30 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FAF9F6" />
      </head>
      <body
        className={`${spaceMono.variable} ${dmSans.variable} antialiased`}
      >
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

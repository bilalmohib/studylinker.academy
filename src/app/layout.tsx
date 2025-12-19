import type { Metadata } from "next";
import MainAppLayout from "@/layouts/MainAppLayout";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StudyLinker - Online Tuition Marketplace | Find Qualified Teachers",
    template: "%s | StudyLinker",
  },
  description:
    "StudyLinker connects parents and students with vetted, qualified teachers worldwide. Trust-first, parent-controlled tuition marketplace with flexible learning options and progress tracking.",
  keywords: [
    "online tuition",
    "tutoring marketplace",
    "find teachers",
    "online learning",
    "qualified tutors",
    "parent-controlled education",
    "O-Level tutors",
    "A-Level tutors",
    "primary school tutors",
    "secondary school tutors",
  ],
  authors: [{ name: "StudyLinker" }],
  creator: "StudyLinker",
  publisher: "StudyLinker",
  metadataBase: new URL("https://studylinker.academy"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studylinker.academy",
    siteName: "StudyLinker",
    title: "StudyLinker - Online Tuition Marketplace",
    description:
      "Connect with qualified teachers worldwide. Trust-first, parent-controlled tuition marketplace.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "StudyLinker Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyLinker - Online Tuition Marketplace",
    description:
      "Connect with qualified teachers worldwide. Trust-first, parent-controlled tuition marketplace.",
    images: ["/logo.svg"],
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
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  icons: {
    icon: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
      { url: "/logo-icon.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/logo-icon.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    shortcut: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MainAppLayout>{children}</MainAppLayout>
      </body>
    </html>
  );
}

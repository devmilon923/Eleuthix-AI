import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://eleuthixai.vercel.app"),
  title: "Eleuthix AI — Free Next-Gen AI Assistant for Reasoning & Coding",
  description:
    "Experience Eleuthix AI, a fast, free, general-purpose AI assistant designed for high-precision reasoning, software development, technical analysis, and structured writing. No account or login required.",
  keywords: [
    "Eleuthix AI",
    "Free AI Assistant",
    "AI Code Assistant",
    "Next.js AI",
    "Free Chatbot",
    "AI Reasoning",
    "Coding Assistant",
    "No Login AI",
  ],
  authors: [{ name: "devmilon923" }],
  creator: "devmilon923",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Eleuthix AI — Free Next-Gen AI Assistant for Reasoning & Coding",
    description:
      "Instant, unrestricted AI intelligence for coding, structured problem solving, and analytical reasoning. 100% free with no login required.",
    siteName: "Eleuthix AI",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Eleuthix AI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eleuthix AI — Free Next-Gen AI Assistant",
    description:
      "Instant, unrestricted AI intelligence for coding, structured problem solving, and analytical reasoning.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eleuthix AI",
  description: "Ask anything. Send a message to your Eleuthix AI endpoint.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

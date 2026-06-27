import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FileShare - Real-time Transfers Dashboard",
  description: "Monitor and manage your local and remote file transfers in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

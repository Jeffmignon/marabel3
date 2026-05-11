import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marabel",
  description: "Newsletters, written by an agent that knows your sources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}

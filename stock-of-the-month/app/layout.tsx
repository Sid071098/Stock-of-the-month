import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockMonth | Stock of the Month Suggestions",
  description: "A StockStory-inspired monthly stock suggestion site featuring one premium pick and a focused research watchlist."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock of the Month | NFLX",
  description: "A premium monthly equity research subscription featuring Netflix as this month's highlighted stock."
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

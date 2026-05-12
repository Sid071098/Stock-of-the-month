import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stockymonth | Monthly Stock Picks",
  description: "Monthly AI-assisted stock research featuring one stock of the month and six high-quality picks.",
  metadataBase: new URL("https://easecaseinc.com")
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

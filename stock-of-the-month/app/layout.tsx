import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockyMonth | High-Quality Stock Research by Easecase Inc.",
  description: "StockyMonth is an AI-assisted and human-reviewed financial research dashboard by Easecase Inc.",
  metadataBase: new URL("https://easecaseinc.com"),
  icons: {
    icon: "/icon.svg"
  },
  openGraph: {
    title: "StockyMonth | High-Quality Stock Research by Easecase Inc.",
    description: "AI-assisted stock research, monthly picks, live market data, and a public historical archive.",
    url: "https://easecaseinc.com",
    siteName: "StockyMonth",
    type: "website"
  }
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

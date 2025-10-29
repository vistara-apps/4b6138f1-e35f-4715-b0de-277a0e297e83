import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./components/Providers";

export const metadata: Metadata = {
  title: "StreamerTip - Empower Streamers on Base",
  description: "Micro-tip streamers directly on Base with gasless transactions",
  openGraph: {
    title: "StreamerTip",
    description: "Empower Streamers: Micro-Tip on Base, Engage Fans on-chain",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

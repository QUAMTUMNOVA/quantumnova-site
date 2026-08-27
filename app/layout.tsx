import type { Metadata } from "next";
import "./globals.css";
import "./universe/universe.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://quantumnova.com.au"),
  title: {
    default: "QUANTUMNOVA | Creative Technology and Immersive 3D Websites",
    template: "%s | QUANTUMNOVA",
  },
  description:
    "QUANTUMNOVA is an Australian creative technology company building immersive websites, 3D product worlds and motion systems across music, fashion and publishing.",
  applicationName: "QUANTUMNOVA",
  authors: [{ name: "QUANTUMNOVA PTY LTD" }],
  creator: "QUANTUMNOVA PTY LTD",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "QUANTUMNOVA",
    title: "QUANTUMNOVA | Creative Technology and Immersive 3D Websites",
    description:
      "Immersive websites, 3D product worlds and motion systems, proven through QUANTUMNOVA's own music, fashion and publishing brands.",
    images: [
      {
        url: "https://quantumnova.com.au/assets/og-banner.png",
        width: 1200,
        height: 630,
        alt: "QUANTUMNOVA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QUANTUMNOVA | Creative Technology and Immersive 3D Websites",
    description:
      "Immersive websites, 3D product worlds and motion systems from an Australian creative technology company.",
    images: ["https://quantumnova.com.au/assets/og-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}

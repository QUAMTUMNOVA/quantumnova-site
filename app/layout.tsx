import type { Metadata } from "next";
import "./globals.css";
import "./universe/universe.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://quantumnova.com.au"),
  title: {
    default: "QUANTUMNOVA | Immersive Websites and 3D Web Design",
    template: "%s | QUANTUMNOVA",
  },
  description:
    "QUANTUMNOVA is an Australian creative technology studio designing immersive websites, 3D product experiences, WebGL interfaces and motion-led digital systems.",
  applicationName: "QUANTUMNOVA",
  authors: [{ name: "QUANTUMNOVA PTY LTD" }],
  creator: "QUANTUMNOVA PTY LTD",
  publisher: "QUANTUMNOVA PTY LTD",
  category: "Creative technology and web development",
  keywords: [
    "immersive website design",
    "3D website design",
    "WebGL development",
    "interactive website development",
    "creative technology studio",
    "3D product experience",
    "motion design",
    "Next.js development",
    "Australian web design",
    "technical SEO",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/quantumnova-starfield-icon.svg", type: "image/svg+xml" }],
    shortcut: "/quantumnova-starfield-icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: "QUANTUMNOVA",
    title: "QUANTUMNOVA | We Build Digital Universes",
    description:
      "Immersive websites, 3D product worlds, WebGL experiences and motion systems from an Australian creative technology studio.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "QUANTUMNOVA, We Build Digital Universes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QUANTUMNOVA | We Build Digital Universes",
    description:
      "Immersive websites, 3D product worlds, WebGL experiences and motion systems from an Australian creative technology studio.",
    images: ["/opengraph-image"],
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

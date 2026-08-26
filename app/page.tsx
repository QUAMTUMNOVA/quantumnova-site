import QnovaExperience from "./experience";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://quantumnova.com.au/#organization",
      name: "QUANTUMNOVA PTY LTD",
      url: "https://quantumnova.com.au/",
      email: "admin@quantumnova.com.au",
      identifier: "ABN 43686016526",
      description: "Australian creative technology company building immersive websites, 3D product worlds and motion systems across music, fashion and publishing.",
      brand: ["Quantumnova Records", "PixiOnyx", "AutoBookPress", "Quantumnova Interactive"],
    },
    {
      "@type": "Service",
      "@id": "https://quantumnova.com.au/#interactive-web-design",
      name: "Custom 3D website design and WebGL development",
      provider: { "@id": "https://quantumnova.com.au/#organization" },
      areaServed: ["Australia", "Worldwide"],
      serviceType: ["3D website design", "WebGL development", "3D product experiences", "Motion systems", "Immersive digital experiences"],
      description: "Custom interactive websites combining strategy, creative direction, 3D design, WebGL development, motion systems and technical production delivery.",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <QnovaExperience />
    </>
  );
}

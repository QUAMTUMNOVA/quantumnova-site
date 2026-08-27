import UniverseExperience from "./universe/UniverseExperience";
import MobileUniverseCanvas from "./universe/MobileUniverseCanvas";

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
      logo: "https://quantumnova.com.au/quantumnova-starfield-icon.svg",
      description: "Australian creative technology studio designing immersive websites, 3D product experiences, WebGL interfaces and motion-led digital systems.",
      knowsAbout: ["Immersive website design", "3D website design", "WebGL development", "Motion design", "Next.js development", "Technical SEO"],
      brand: [
        { "@type": "Brand", name: "QUANTUMNOVA Records" },
        { "@type": "Brand", name: "PixiOnyx" },
        { "@type": "Brand", name: "AutoBookPress" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://quantumnova.com.au/#website",
      name: "QUANTUMNOVA",
      url: "https://quantumnova.com.au/",
      inLanguage: "en-AU",
      publisher: { "@id": "https://quantumnova.com.au/#organization" },
    },
    {
      "@type": "Service",
      "@id": "https://quantumnova.com.au/#interactive-web-design",
      name: "Custom 3D website design and WebGL development",
      provider: { "@id": "https://quantumnova.com.au/#organization" },
      areaServed: ["Australia", "Worldwide"],
      serviceType: ["Immersive website design", "3D website design", "WebGL development", "3D product experiences", "Motion systems", "Next.js development", "Technical SEO"],
      description: "Custom interactive websites combining strategy, content architecture, 3D design, WebGL development, ecommerce integrations, motion systems, technical SEO and production delivery.",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "QUANTUMNOVA creative technology services",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Immersive website design and development" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "3D product worlds and WebGL experiences" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Motion systems and interactive storytelling" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Technical SEO, analytics and performance optimisation" } },
        ],
      },
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
      <MobileUniverseCanvas />
      <UniverseExperience />
    </>
  );
}

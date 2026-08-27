export const universeScenes = [
  { id: "home", label: "Origin", shortLabel: "Q", tone: "#88ffe4" },
  { id: "studio", label: "Studio", shortLabel: "01", tone: "#8df9ff" },
  { id: "pixionyx", label: "PixiOnyx", shortLabel: "02", tone: "#ff768e" },
  { id: "records", label: "Records", shortLabel: "03", tone: "#58d9ff" },
  { id: "books", label: "AutoBookPress", shortLabel: "04", tone: "#ffc86b" },
  { id: "contact", label: "Build with us", shortLabel: "05", tone: "#b08cff" },
] as const;

export const playlists = [
  {
    id: "77amCwJSWddkeG3VYB1S0Q",
    title: "QUANTUMNOVA Records MasterMix",
    eyebrow: "Official label catalogue",
    detail: "The complete QUANTUMNOVA Records listening portal",
    cover:
      "https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da8486f6a4711158880e56f40047",
  },
  {
    id: "3xHkUQgr5dyGHTAhTxU9fZ",
    title: "Funk/Soul",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Groove, warmth and movement",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e0203ff3966f03b4d929e30a54aab67616d00001e024db839d32ee987e5b49a1272ab67616d00001e02a14b08b9a6616e121df5e8b0ab67616d00001e02bb165e8b821025425e9dabef",
  },
  {
    id: "4kzGOC1AxOATwBW0v7KeN0",
    title: "Electronic",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Signals, circuits and after-hours energy",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e02128c4a8f4206647330e130b4ab67616d00001e021c8eb7bf34c1123a6de45470ab67616d00001e026e6b4e89ee5fb22a3c11c114ab67616d00001e02c1b47997d8cb0bfd1ec946a8",
  },
  {
    id: "3KhHEwNcG0sCeWHZaRSMHv",
    title: "Pop",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Hooks, colour and widescreen feeling",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e0205029be1f928f2ea9902f0a5ab67616d00001e022c70242c80b76e7017b2f40fab67616d00001e022d47d820f90edde0737b93f4ab67616d00001e024db839d32ee987e5b49a1272",
  },
  {
    id: "11p4UbOKhsGP8mAltS4UOb",
    title: "Rock/Metal",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Weight, texture and catharsis",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e0205029be1f928f2ea9902f0a5ab67616d00001e021a911e2b352e33756c5ac486ab67616d00001e0276992aff19f6bb74be776974ab67616d00001e02c1b47997d8cb0bfd1ec946a8",
  },
  {
    id: "73VBuSYjOf8tcEG4Bqv7Qq",
    title: "Rap/Hip-Hop",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Voice, rhythm and forward pressure",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e0260f68ed22ec416583eef5076ab67616d00001e02b68239b8cba1057ff92621dfab67616d00001e02d4eca2c8295d769b9cea859aab67616d00001e02fb8f48a20f9670f9d35690b6",
  },
] as const;

export const artists = [
  { name: "The Quiet Violence", release: "Destroy Them All", cover: "/artists/the-quiet-violence.png", spotify: "03LSnrm9vgn8a4Df091wGX" },
  { name: "Nico Lume", release: "Turn A Little To A Lot", cover: "/artists/nico-lume.png", spotify: "1N4pfpwDvKPeqE5LteHF1O" },
  { name: "RESONIQ", release: "After Hours", cover: "/artists/resoniq.png", spotify: "3cW8GtnGzub3MKkkzeP9VY" },
  { name: "Trey Vorn", release: "Keep It Moving", cover: "/artists/trey-vorn.png", spotify: "7C1LRLFo4Dib5inSc18BL8" },
  { name: "Gravenyx", release: "Lit Forever", cover: "/artists/gravenyx.png", spotify: "7wZ99XilbmzGSgOiigd0Qy" },
  { name: "Sylvie Knox", release: "Auralicious", cover: "/artists/sylvie-knox.png", spotify: "433rbErBjfvbl2VODqNoP1" },
  { name: "Darius Creed", release: "Own The Sky", cover: "/artists/darius-creed.png", spotify: "4wpexPaBdC9vWfDXSnW3ca" },
  { name: "Sanguira", release: "Echoes Of Aether", cover: "/artists/sanguira.png", spotify: "72o1LWmCp60Irn8pygPCmD" },
  { name: "Soul Carnival", release: "Jingle Bells", cover: "/artists/soul-carnival.png", spotify: "5362XOY9NdvdcuXBxaZLKk" },
  { name: "Bury The Cure", release: "Nothing Left To Bury", cover: "/artists/bury-the-cure.png", spotify: "3RihVf3ccXdnSXFegOMGRq" },
] as const;

export const capabilities = [
  {
    title: "Immersive UI",
    copy: "Brand strategy, content architecture and conversion paths shaped into a cinematic interface that remains clear, accessible and easy to use.",
    signal: "Strategy and experience design",
  },
  {
    title: "3D Product Worlds",
    copy: "WebGL product viewers, interactive showrooms and spatial ecommerce experiences that make an offer tangible before a customer purchases.",
    signal: "WebGL and spatial commerce",
  },
  {
    title: "Motion Systems",
    copy: "Scroll-linked storytelling, responsive transitions and interaction systems designed to guide attention and make the complete site feel coherent.",
    signal: "Motion and interaction design",
  },
  {
    title: "Technical Delivery",
    copy: "Responsive Next.js development, accessibility, ecommerce integrations, analytics, schema, technical SEO, performance testing and production launch.",
    signal: "Engineering and optimisation",
  },
] as const;

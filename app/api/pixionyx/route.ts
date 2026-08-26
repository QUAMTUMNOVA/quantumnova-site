import { pixionyxFallback } from "@/app/data/pixionyx";

type ShopifyImage = {
  id: number;
  src: string;
  variant_ids: number[];
};

type ShopifyVariant = {
  id: number;
  price: string;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
};

type ShopifyProduct = {
  title: string;
  handle: string;
  product_type: string;
  published_at: string;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  options: Array<{ name: string; position: number; values: string[] }>;
};

type ImageViewSource = "primary" | number;

type VerifiedImageViews = {
  front: ImageViewSource;
  back: ImageViewSource;
};

// Shopify does not expose front/back labels in the public catalogue feed. These
// positions were visually verified against the current PixiOnyx catalogue. A
// numeric position refers to an image inside the selected colour's supporting
// image group, while "primary" refers to that colour's variant image.
const verifiedImageViews: Record<string, VerifiedImageViews> = {
  "kangaroo-no-worries-hoodie-shell-be-right-it-absolutely-wont-graphic-hoodie": { front: "primary", back: 0 },
  "unisex-hoodie-wildlife-warning-poorly-socialised-graphic-hoodie-do-not-approach": { front: "primary", back: 0 },
  "unisex-allegedly-do-i-look-guilty-do-not-answer-that-graphic-hoodie": { front: "primary", back: 0 },
  "lotus-blossom-unisex-t-shirt-softstyle-tee-yoga-apparel-mindfulness-gift-meditation-shirt-spiritual-wear-lotus-design": { front: "primary", back: 0 },
  "aurora-mountain-unisex-softstyle-t-shirt-adventure-tee-nature-shirt-gift-for-hikers-travel-apparel-outdoor-enthusiast-clothing": { front: "primary", back: 3 },
  "mountain-themed-unisex-t-shirt-cozy-graphic-tee-silent-peaks-shirt-outdoor-lover-gift-camping-apparel-nature-inspired-top": { front: "primary", back: 0 },
  "mountain-inspired-unisex-t-shirt-ascend-adventure-tee-outdoor-apparel-gift-for-hikers-travel-shirt-asciend-graphic-design": { front: "primary", back: 4 },
  "mountain-scene-fleece-unisex-hoodie-ascend-cozy-outdoor-sweatshirt-for-nature-lovers-gifts-for-hikers-adventure-apparel-cool-weather-gear": { front: "primary", back: 1 },
  "mountain-vibes-fleece-unisex-hoodie-cozy-outdoor-apparel": { front: 0, back: 1 },
  "keep-going-unisex-hoodie-retro-motivational-graphic-sweatshirt": { front: "primary", back: 0 },
  "keep-going-unisex-t-shirt-motivational-retro-graphic-tee": { front: 1, back: 2 },
  "allegedly-graphic-unisex-hoodie-retro-comic-logo-hooded-sweatshirt": { front: "primary", back: 0 },
  "makes-noises-when-standing-unisex-t-shirt-funny-motorcycle-mechanic-vintage-tee": { front: 1, back: 2 },
  "mechanic-unisex-hoodie-makes-noises-when-standing-warranty-voided-by-normal-use-vintage-repair-pullover": { front: 0, back: "primary" },
  "staff-wellness-policy-unisex-t-shirt-cry-off-the-clock-humorous-gothic-work-shirt": { front: 1, back: 2 },
  "big-spender-bought-groceries-unisex-t-shirt-funny-grocery-shopper-tee": { front: 2, back: 3 },
  "big-spender-bought-groceries-unisex-hoodie-funny-paid-in-full-grocery-shopper-pullover": { front: "primary", back: 0 },
  "unisex-t-shirt-terrible-idea-excellent-follow-through-retro-rocket-graphic": { front: 1, back: 2 },
  "perfect-record-graphic-unisex-t-shirt-vintage-boxing-goat-design": { front: 2, back: 3 },
  "unisex-t-shirt-wildlife-warning-cartoon-possum-design-poorly-socialised": { front: 2, back: 3 },
  "allegedly-graffiti-unisex-tee-street-art-graphic-t-shirt": { front: 3, back: 2 },
  "no-worries-unisex-t-shirt-retro-kangaroo-koala-chill-vibes-tee": { front: 1, back: 2 },
  "it-was-this-big-graphic-unisex-t-shirt-funny-retro-fishing-tee": { front: 2, back: 3 },
  "he-saw-a-hat-unisex-t-shirt-current-threat-level-rottweiler-horror-graphic-tee-1": { front: 1, back: 2 },
  "unisex-hoodie-deeply-ignored-i-heard-you-that-changes-nothing-gothic-graphic-pullover": { front: "primary", back: 0 },
  "rottweiler-he-saw-a-hat-unisex-hoodie-he-only-bites-bad-people-graphic-sweatshirt": { front: "primary", back: 1 },
  "unisex-hoodie-perfect-record-0-0-undefeated-never-competed-vintage-boxing-king-pullover": { front: 0, back: "primary" },
  "surf-hoodie-round-two-ocean-me-still-talking-shit-retro-surf-graphic-pullover": { front: "primary", back: 0 },
  "unisex-hoodie-cash-only-graphic-hooded-sweatshirt-with-business-none-of-yours-retro-design": { front: "primary", back: 0 },
  "fishing-statistics-unisex-hoodie-it-was-this-big-funny-fisherman-pullover": { front: 0, back: 1 },
  "research-purposes-unisex-hoodie-my-browser-history-needs-context-graphic-hoodie": { front: 0, back: "primary" },
  "unisex-hoodie-being-alive-has-hidden-fees-graphic-streetwear-pullover-payment-declined": { front: "primary", back: 0 },
  "unisex-hoodie-anythings-fine-wrong-answer-retro-comic-pizza-graphic-hoodie": { front: "primary", back: 0 },
};

const catalogueUrl =
  "https://www.pixionyx.com/collections/clothing/products.json?limit=40";

function tidyTitle(title: string) {
  return title
    .replace(/\s+Unisex\s+(Hoodie|T[‑-]?Shirt).*$/i, "")
    .replace(/^Unisex\s+(Hoodie|T[‑-]?Shirt)\s*[-:]\s*/i, "")
    .replace(/^Mechanic\s+/i, "")
    .replace(/^Staff Wellness Policy\s+/i, "")
    .replace(/["“”]/g, "")
    .trim();
}

function preferredColour(product: ShopifyProduct) {
  const colourOption = product.options.find((option) =>
    /colou?r/i.test(option.name),
  );
  if (!colourOption) return null;

  const preferred = colourOption.values.find((value) =>
    /^(black|navy|charcoal|charcoal heather|dark green|alpine green)$/i.test(value),
  );
  return preferred
    ? { position: colourOption.position, value: preferred }
    : { position: colourOption.position, value: colourOption.values[0] ?? "" };
}

function imagesForDisplay(product: ShopifyProduct) {
  const frontImages = product.images.filter((image) => image.variant_ids.length > 0);
  if (!frontImages.length) {
    return {
      frontImage: product.images[0]?.src ?? "",
      backImage: product.images[1]?.src ?? product.images[0]?.src ?? "",
    };
  }

  const colour = preferredColour(product);
  const matchingVariant = colour
    ? product.variants.find((variant) => {
        const value = variant[`option${colour.position}` as keyof ShopifyVariant];
        return typeof value === "string" && value.toLowerCase() === colour.value.toLowerCase();
      })
    : undefined;
  const selectedFrontIndex = matchingVariant
    ? Math.max(
        0,
        frontImages.findIndex((image) => image.variant_ids.includes(matchingVariant.id)),
      )
    : 0;

  const supportingImages = product.images.filter(
    (image) => !frontImages.some((frontImage) => frontImage.id === image.id),
  );
  const groupSize = Math.max(
    1,
    Math.floor(supportingImages.length / Math.max(1, frontImages.length)),
  );
  const selectedPrimary = frontImages[selectedFrontIndex] ?? frontImages[0];
  const groupStart = selectedFrontIndex * groupSize;
  const selectedGroup = supportingImages.slice(groupStart, groupStart + groupSize);
  const defaults: VerifiedImageViews = /hoodie/i.test(product.product_type)
    ? { front: "primary", back: 0 }
    : { front: "primary", back: Math.min(2, groupSize - 1) };
  const views = verifiedImageViews[product.handle] ?? defaults;
  const resolveView = (source: ImageViewSource) =>
    source === "primary"
      ? selectedPrimary
      : selectedGroup[source] ?? selectedPrimary;

  return {
    frontImage: resolveView(views.front).src,
    backImage: resolveView(views.back).src,
  };
}

export async function GET() {
  try {
    const response = await fetch(catalogueUrl, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`PixiOnyx returned ${response.status}`);

    const payload = (await response.json()) as { products?: ShopifyProduct[] };
    const products = (payload.products ?? [])
      .filter((product) => /hoodie|t[‑-]?shirt/i.test(product.product_type))
      .sort(
        (first, second) =>
          new Date(second.published_at).getTime() -
          new Date(first.published_at).getTime(),
      )
      .map((product) => {
        const images = imagesForDisplay(product);
        const lowestPrice = Math.min(
          ...product.variants.map((variant) => Number(variant.price) || Infinity),
        );
        return {
          title: product.title,
          shortTitle: tidyTitle(product.title),
          format: product.product_type,
          price: Number.isFinite(lowestPrice)
            ? `From $${lowestPrice.toFixed(2)} AUD`
            : "View product",
          frontImage: images.frontImage,
          backImage: images.backImage,
          url: `https://www.pixionyx.com/products/${product.handle}`,
          publishedAt: product.published_at,
        };
      });

    return Response.json(
      { products, syncedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return Response.json(
      {
        products: pixionyxFallback,
        syncedAt: null,
        fallback: true,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      },
    );
  }
}

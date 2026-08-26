import {
  autobookpressCatalog,
  excludedAutoBookPressAsins,
  type AutoBookPressTitle,
} from "@/app/data/autobookpress";

type RuntimeEnvironment = Record<string, string | undefined>;

type AmazonItem = {
  asin?: string;
  detailPageURL?: string;
  images?: { primary?: { large?: { url?: string }; medium?: { url?: string } } };
  itemInfo?: { title?: { displayValue?: string } };
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function getRuntimeEnvironment() {
  return process.env as RuntimeEnvironment;
}

function tokenEndpoint(version: string) {
  if (version === "3.1") return "https://api.amazon.com/auth/o2/token";
  if (version === "3.2") return "https://api.amazon.co.uk/auth/o2/token";
  return "https://api.amazon.co.jp/auth/o2/token";
}

async function getAmazonToken(environment: RuntimeEnvironment) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const response = await fetch(
    tokenEndpoint(environment.AMAZON_CREATORS_CREDENTIAL_VERSION ?? "3.3"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: environment.AMAZON_CREATORS_CREDENTIAL_ID,
        client_secret: environment.AMAZON_CREATORS_CREDENTIAL_SECRET,
        scope: "creatorsapi::default",
      }),
    },
  );

  if (!response.ok) throw new Error("Amazon catalogue authentication failed");
  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!payload.access_token) throw new Error("Amazon catalogue token missing");

  cachedToken = {
    value: payload.access_token,
    expiresAt: Date.now() + Math.max(300, payload.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

function styleForAsin(asin: string) {
  let value = 0;
  for (const character of asin) value = (value * 31 + character.charCodeAt(0)) >>> 0;
  const hue = value % 360;
  return {
    colour: `hsl(${hue} 34% 18%)`,
    accent: `hsl(${(hue + 52) % 360} 90% 76%)`,
  };
}

function catalogueTitleKey(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isExcludedPuzzleTitle(title: string) {
  return /^(sudoku challenge pack|double trouble|word quest 3000(?: xl)?|easy sudoku drift|sudoku ascent)$/i.test(
    title.trim(),
  );
}

async function fetchAmazonTitles(environment: RuntimeEnvironment) {
  const token = await getAmazonToken(environment);
  const partnerTag = environment.AMAZON_CREATORS_PARTNER_TAG;
  const marketplace = environment.AMAZON_CREATORS_MARKETPLACE ?? "www.amazon.com.au";
  const items: AmazonItem[] = [];

  for (let itemPage = 1; itemPage <= 10; itemPage += 1) {
    const response = await fetch("https://creatorsapi.amazon/catalog/v1/searchItems", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-marketplace": marketplace,
      },
      body: JSON.stringify({
        author: "AutoBook Press",
        availability: "IncludeOutOfStock",
        itemCount: 10,
        itemPage,
        marketplace,
        partnerTag,
        resources: [
          "images.primary.large",
          "images.primary.medium",
          "itemInfo.title",
        ],
        searchIndex: "Books",
        sortBy: "NewestArrivals",
      }),
    });

    if (!response.ok) throw new Error("Amazon catalogue request failed");
    const payload = (await response.json()) as {
      searchResult?: { items?: AmazonItem[]; totalResultCount?: number };
    };
    const pageItems = payload.searchResult?.items ?? [];
    items.push(...pageItems);
    if (
      pageItems.length < 10 ||
      items.length >= (payload.searchResult?.totalResultCount ?? items.length)
    ) {
      break;
    }
  }

  const curatedByAsin = new Map(
    autobookpressCatalog.map((book) => [book.asin, book]),
  );
  const curatedByTitle = new Map(
    autobookpressCatalog.map((book) => [catalogueTitleKey(book.title), book]),
  );
  const imported = items.flatMap((item): AutoBookPressTitle[] => {
    if (!item.asin || !item.itemInfo?.title?.displayValue) return [];
    const importedTitle = item.itemInfo.title.displayValue;
    if (
      excludedAutoBookPressAsins.has(item.asin) ||
      isExcludedPuzzleTitle(importedTitle)
    ) {
      return [];
    }
    const curated =
      curatedByAsin.get(item.asin) ??
      curatedByTitle.get(catalogueTitleKey(importedTitle));
    const style = styleForAsin(item.asin);
    return [
      {
        asin: item.asin,
        title: importedTitle,
        subtitle: curated?.subtitle ?? "A title from AutoBookPress",
        category: curated?.category ?? "AutoBookPress catalogue",
        cover:
          curated?.cover ||
          item.images?.primary?.large?.url ||
          item.images?.primary?.medium?.url ||
          "",
        colour: curated?.colour ?? style.colour,
        accent: curated?.accent ?? style.accent,
        url:
          item.detailPageURL ??
          curated?.url ??
          `https://www.amazon.com.au/dp/${item.asin}`,
        published: curated?.published ?? "New title",
      },
    ];
  });

  const importedAsins = new Set(imported.map((book) => book.asin));
  const importedTitles = new Set(
    imported.map((book) => catalogueTitleKey(book.title)),
  );
  return [
    ...imported,
    ...autobookpressCatalog.filter(
      (book) =>
        !importedAsins.has(book.asin) &&
        !importedTitles.has(catalogueTitleKey(book.title)),
    ),
  ];
}

export async function GET() {
  const environment = getRuntimeEnvironment();
  const configured = Boolean(
    environment.AMAZON_CREATORS_CREDENTIAL_ID &&
      environment.AMAZON_CREATORS_CREDENTIAL_SECRET &&
      environment.AMAZON_CREATORS_PARTNER_TAG,
  );

  if (configured) {
    try {
      const books = await fetchAmazonTitles(environment);
      return Response.json(
        {
          books,
          source: "amazon-creators-api",
          autoSyncActive: true,
          syncedAt: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control":
              "public, max-age=300, s-maxage=21600, stale-while-revalidate=86400",
          },
        },
      );
    } catch {
      // Keep the verified catalogue online if Amazon is temporarily unavailable.
    }
  }

  return Response.json(
    {
      books: autobookpressCatalog,
      source: "verified-catalogue",
      autoSyncActive: false,
      syncedAt: null,
    },
    {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=21600, stale-while-revalidate=86400",
      },
    },
  );
}

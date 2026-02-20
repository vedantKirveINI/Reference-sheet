export interface Country {
  countryCode: string;
  countryName: string;
  countryNumber: string;
  pattern?: string;
  currencyCode?: string;
  currencySymbol?: string;
}

export const COUNTRIES: Record<string, Country> = {
  IN: {
    countryCode: "IN",
    countryName: "India",
    countryNumber: "91",
    currencyCode: "INR",
    currencySymbol: "₹",
  },
  US: {
    countryCode: "US",
    countryName: "United States",
    countryNumber: "1",
    pattern: "(999) 999-9999",
    currencyCode: "USD",
    currencySymbol: "$",
  },
  GB: {
    countryCode: "GB",
    countryName: "United Kingdom",
    countryNumber: "44",
    currencyCode: "GBP",
    currencySymbol: "£",
  },
  CA: {
    countryCode: "CA",
    countryName: "Canada",
    countryNumber: "1",
    pattern: "(999) 999-9999",
    currencyCode: "CAD",
    currencySymbol: "$",
  },
  AU: {
    countryCode: "AU",
    countryName: "Australia",
    countryNumber: "61",
    currencyCode: "AUD",
    currencySymbol: "$",
  },
  DE: {
    countryCode: "DE",
    countryName: "Germany",
    countryNumber: "49",
    currencyCode: "EUR",
    currencySymbol: "€",
  },
  FR: {
    countryCode: "FR",
    countryName: "France",
    countryNumber: "33",
    currencyCode: "EUR",
    currencySymbol: "€",
  },
  IT: {
    countryCode: "IT",
    countryName: "Italy",
    countryNumber: "39",
    currencyCode: "EUR",
    currencySymbol: "€",
  },
  ES: {
    countryCode: "ES",
    countryName: "Spain",
    countryNumber: "34",
    currencyCode: "EUR",
    currencySymbol: "€",
  },
  BR: {
    countryCode: "BR",
    countryName: "Brazil",
    countryNumber: "55",
    currencyCode: "BRL",
    currencySymbol: "R$",
  },
  CN: {
    countryCode: "CN",
    countryName: "China",
    countryNumber: "86",
    currencyCode: "CNY",
    currencySymbol: "¥",
  },
  JP: {
    countryCode: "JP",
    countryName: "Japan",
    countryNumber: "81",
    currencyCode: "JPY",
    currencySymbol: "¥",
  },
  KR: {
    countryCode: "KR",
    countryName: "South Korea",
    countryNumber: "82",
  },
  MX: {
    countryCode: "MX",
    countryName: "Mexico",
    countryNumber: "52",
    currencyCode: "MXN",
    currencySymbol: "$",
  },
  NL: {
    countryCode: "NL",
    countryName: "Netherlands",
    countryNumber: "31",
    currencyCode: "EUR",
    currencySymbol: "€",
  },
  SE: {
    countryCode: "SE",
    countryName: "Sweden",
    countryNumber: "46",
    currencyCode: "SEK",
    currencySymbol: "kr",
  },
  CH: {
    countryCode: "CH",
    countryName: "Switzerland",
    countryNumber: "41",
    currencyCode: "CHF",
    currencySymbol: "CHF",
  },
  SG: {
    countryCode: "SG",
    countryName: "Singapore",
    countryNumber: "65",
    currencyCode: "SGD",
    currencySymbol: "$",
  },
  AE: {
    countryCode: "AE",
    countryName: "United Arab Emirates",
    countryNumber: "971",
    currencyCode: "AED",
    currencySymbol: "د.إ",
  },
  SA: {
    countryCode: "SA",
    countryName: "Saudi Arabia",
    countryNumber: "966",
    currencyCode: "SAR",
    currencySymbol: "ر.س",
  },
  ZA: {
    countryCode: "ZA",
    countryName: "South Africa",
    countryNumber: "27",
    currencyCode: "ZAR",
    currencySymbol: "R",
  },
  NZ: {
    countryCode: "NZ",
    countryName: "New Zealand",
    countryNumber: "64",
  },
  NO: {
    countryCode: "NO",
    countryName: "Norway",
    countryNumber: "47",
  },
  DK: {
    countryCode: "DK",
    countryName: "Denmark",
    countryNumber: "45",
  },
  FI: {
    countryCode: "FI",
    countryName: "Finland",
    countryNumber: "358",
  },
  PL: {
    countryCode: "PL",
    countryName: "Poland",
    countryNumber: "48",
  },
  TR: {
    countryCode: "TR",
    countryName: "Turkey",
    countryNumber: "90",
  },
  AR: {
    countryCode: "AR",
    countryName: "Argentina",
    countryNumber: "54",
  },
  CL: {
    countryCode: "CL",
    countryName: "Chile",
    countryNumber: "56",
  },
  CO: {
    countryCode: "CO",
    countryName: "Colombia",
    countryNumber: "57",
  },
  PE: {
    countryCode: "PE",
    countryName: "Peru",
    countryNumber: "51",
  },
  PH: {
    countryCode: "PH",
    countryName: "Philippines",
    countryNumber: "63",
  },
  TH: {
    countryCode: "TH",
    countryName: "Thailand",
    countryNumber: "66",
  },
  VN: {
    countryCode: "VN",
    countryName: "Vietnam",
    countryNumber: "84",
  },
  ID: {
    countryCode: "ID",
    countryName: "Indonesia",
    countryNumber: "62",
  },
  MY: {
    countryCode: "MY",
    countryName: "Malaysia",
    countryNumber: "60",
  },
  PK: {
    countryCode: "PK",
    countryName: "Pakistan",
    countryNumber: "92",
  },
  BD: {
    countryCode: "BD",
    countryName: "Bangladesh",
    countryNumber: "880",
  },
  EG: {
    countryCode: "EG",
    countryName: "Egypt",
    countryNumber: "20",
  },
  NG: {
    countryCode: "NG",
    countryName: "Nigeria",
    countryNumber: "234",
  },
  KE: {
    countryCode: "KE",
    countryName: "Kenya",
    countryNumber: "254",
  },
  IL: {
    countryCode: "IL",
    countryName: "Israel",
    countryNumber: "972",
  },
  IE: {
    countryCode: "IE",
    countryName: "Ireland",
    countryNumber: "353",
  },
  PT: {
    countryCode: "PT",
    countryName: "Portugal",
    countryNumber: "351",
  },
  GR: {
    countryCode: "GR",
    countryName: "Greece",
    countryNumber: "30",
  },
  BE: {
    countryCode: "BE",
    countryName: "Belgium",
    countryNumber: "32",
  },
  AT: {
    countryCode: "AT",
    countryName: "Austria",
    countryNumber: "43",
  },
  CZ: {
    countryCode: "CZ",
    countryName: "Czech Republic",
    countryNumber: "420",
  },
  HU: {
    countryCode: "HU",
    countryName: "Hungary",
    countryNumber: "36",
  },
  RO: {
    countryCode: "RO",
    countryName: "Romania",
    countryNumber: "40",
  },
  AL: {
    countryCode: "AL",
    countryName: "Albania",
    countryNumber: "355",
  },
};

export function getCountry(countryCode: string): Country | undefined {
  return COUNTRIES[countryCode?.toUpperCase()];
}

export function getAllCountryCodes(): string[] {
  return Object.keys(COUNTRIES);
}

export function getFlagUrl(countryCode: string): string {
  if (!countryCode) return "";
  return `https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`;
}

const flagImageCache = new Map<string, HTMLImageElement>();

export function loadFlagImage(
  countryCode: string
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const cached = flagImageCache.get(countryCode);
    if (cached && cached.complete) {
      resolve(cached);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      flagImageCache.set(countryCode, img);
      resolve(img);
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = `https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`;
  });
}

export function drawFlagSync(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  countryCode: string
): void {
  if (!countryCode) return;

  const cached = flagImageCache.get(countryCode);
  if (cached && cached.complete) {
    ctx.drawImage(cached, x, y, width, height);
    return;
  }

  ctx.fillStyle = "#E0E0E0";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#CCCCCC";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  loadFlagImage(countryCode);
}

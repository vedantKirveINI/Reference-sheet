export type IGeoData =
  | {
      ip: string;
      timezone: string;
      accuracy: number;
      city: string;
      asn: number;
      organization: string;
      area_code: string;
      organization_name: string;
      country_code: string;
      country_code3: string;
      continent_code: string;
      country: string;
      region: string;
      latitude: string;
      longitude: string;
    }
  | {}
  | undefined;

export const getGeoData = async (): Promise<IGeoData> => {
  try {
    const response = await fetch("https://get.geojs.io/v1/ip/geo.json");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: unknown = await response.json();

    return data as IGeoData;
  } catch (error) {
    return {};
  }
};

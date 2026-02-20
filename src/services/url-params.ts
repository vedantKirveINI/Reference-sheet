export const encodeParams = <T = any>(data: T): string => {
  return btoa(JSON.stringify(data));
};

export const decodeParams = <T = any>(
  base64String: string = '',
): T | Record<string, never> => {
  try {
    return JSON.parse(atob(base64String)) as T;
  } catch {
    return {} as Record<string, never>;
  }
};

export const encodeParams = <T = any>(data: T): string => {
  return btoa(JSON.stringify(data));
};

export const decodeParams = <T = any>(
  base64String: string = '',
): T | Record<string, never> => {
  try {
    const decoded = decodeURIComponent(base64String);
    return JSON.parse(atob(decoded)) as T;
  } catch {
    return {} as Record<string, never>;
  }
};

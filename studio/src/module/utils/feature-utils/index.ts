export function isFeatureExcluded(feature: string) {
  const excluded = process.env.REACT_APP_FEATURES_EXCLUDED || "";
  const list = excluded.split(",").map((f: string) => f.trim());
  return list.includes(feature);
}

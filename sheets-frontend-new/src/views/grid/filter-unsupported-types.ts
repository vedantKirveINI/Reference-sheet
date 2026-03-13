import { CellType } from "@/types/cell";

/**
 * Question types that are NOT supported in the filter UI.
 *
 * This mirrors the legacy Sheets `UNSUPPORTED_TYPES_SET`:
 * - FILE_PICKER   -> CellType.FileUpload
 * - TIME          -> CellType.Time
 * - CURRENCY      -> CellType.Currency
 * - LIST          -> CellType.List
 * - RANKING       -> CellType.Ranking
 * - SIGNATURE     -> CellType.Signature
 * - PICTURE       -> (no direct equivalent in new CellType)
 * - OPINION_SCALE -> CellType.OpinionScale
 */
export const UNSUPPORTED_FILTER_TYPES: Set<CellType> = new Set<CellType>([
  CellType.FileUpload,
  CellType.Time,
  CellType.Currency,
  CellType.List,
  CellType.Ranking,
  CellType.Signature,
  CellType.OpinionScale,
]);

export function isFilterSupportedType(type: CellType): boolean {
  return !UNSUPPORTED_FILTER_TYPES.has(type);
}


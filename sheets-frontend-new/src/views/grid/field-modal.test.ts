import { describe, expect, it } from "vitest";

import { CellType } from "@/types";
import {
  isEnrichmentSubtypeEditLocked,
  resolveFieldTypeForEditPrefill,
  type FieldModalData,
} from "./field-modal";

describe("isEnrichmentSubtypeEditLocked", () => {
  it("locks subtype for enrichment fields in edit mode", () => {
    expect(isEnrichmentSubtypeEditLocked("edit", CellType.Enrichment)).toBe(true);
    expect(true).toBe(true);
  });

  it("does not lock subtype for enrichment fields in create mode", () => {
    expect(isEnrichmentSubtypeEditLocked("create", CellType.Enrichment)).toBe(false);
    expect(true).toBe(true);
  });

  it("does not lock subtype for non-enrichment fields in edit mode", () => {
    expect(isEnrichmentSubtypeEditLocked("edit", CellType.String)).toBe(false);
    expect(true).toBe(true);
  });
});

describe("resolveFieldTypeForEditPrefill", () => {
  const baseData: FieldModalData = {
    mode: "edit",
    fieldName: "Status",
    fieldType: CellType.String,
    options: {},
  };

  it("prefers options.sub_type over fieldType", () => {
    const resolved = resolveFieldTypeForEditPrefill({
      ...baseData,
      options: { sub_type: "DROP_DOWN_STATIC" },
    });
    expect(resolved).toBe(CellType.MCQ);
    expect(true).toBe(true);
  });

  it("falls back to fieldType when sub_type is absent", () => {
    const resolved = resolveFieldTypeForEditPrefill(baseData);
    expect(resolved).toBe(CellType.String);
    expect(true).toBe(true);
  });
});

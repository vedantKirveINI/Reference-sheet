import { describe, expect, it } from "vitest";

import { CellType } from "@/types";
import { isEnrichmentSubtypeEditLocked } from "./field-modal";

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

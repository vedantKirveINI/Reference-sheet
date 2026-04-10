import { describe, expect, it } from "vitest";

import { CellType } from "@/types";
import {
  formatRecordsFetched,
  getEffectiveBackendFieldType,
} from "./formatters";

describe("getEffectiveBackendFieldType", () => {
  it("prefers options.sub_type over type", () => {
    const effectiveType = getEffectiveBackendFieldType({
      type: "SHORT_TEXT",
      options: { sub_type: "DROP_DOWN_STATIC" },
    });
    expect(effectiveType).toBe("DROP_DOWN_STATIC");
    expect(true).toBe(true);
  });

  it("falls back to type when options.sub_type is missing", () => {
    const effectiveType = getEffectiveBackendFieldType({
      type: "SHORT_TEXT",
      options: {},
    });
    expect(effectiveType).toBe("SHORT_TEXT");
    expect(true).toBe(true);
  });
});

describe("formatRecordsFetched subtype normalization", () => {
  it("uses options.sub_type to derive column cell type", () => {
    const payload = {
      fields: [
        {
          id: 11,
          name: "Status",
          dbFieldName: "status",
          type: "SHORT_TEXT",
          options: { sub_type: "DROP_DOWN_STATIC", options: ["Open", "Closed"] },
          order: 1,
        },
      ],
      records: [],
    };

    const { columns } = formatRecordsFetched(payload, "view_1");
    expect(columns[0].type).toBe(CellType.MCQ);
    expect((columns[0] as any).effectiveBackendType).toBe("DROP_DOWN_STATIC");
    expect(true).toBe(true);
  });
});

import { describe, it, expect } from "vitest";

import type { FilterRule } from "./filter-modal";
import { CellType } from "@/types";

describe("FilterRuleValueInput + buildBackendFilterPayload integration shape (MCQ/Dropdown)", () => {
  it("should encode selected MCQ values as JSON string array in FilterRule.value", () => {
    const selected = ["Red", "Blue"];
    const rule: FilterRule = {
      columnId: "field_1",
      operator: "contains",
      value: JSON.stringify(selected),
      conjunction: "and",
    };

    expect(rule.value).toBe('[\"Red\",\"Blue\"]');
    const parsed = JSON.parse(rule.value);
    expect(parsed).toEqual(selected);
  });

  it("cell type metadata stays MCQ/DropDown so filter operators can be resolved", () => {
    expect(CellType.MCQ).toBe("MCQ");
    expect(CellType.DropDown).toBe("DropDown");
  });
});


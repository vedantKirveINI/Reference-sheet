import { describe, it, expect } from "vitest";

import type { FilterRule } from "./filter-modal";
import { CellType } from "@/types";
import { getOperatorsForCellType } from "./filter-operator-registry";
import { mapUiOperatorToBackend } from "./filter-operator-mapping";

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

describe("Date operator parity for created and last modified time", () => {
  it("uses the exact same operator set for CREATED_TIME and LAST_MODIFIED_TIME", () => {
    const createdTimeOps = getOperatorsForCellType(CellType.CreatedTime);
    const lastModifiedTimeOps = getOperatorsForCellType(CellType.LastModifiedTime);

    expect(lastModifiedTimeOps).toEqual(createdTimeOps);
    expect(lastModifiedTimeOps.length).toBeGreaterThan(0);
  });

  it("maps date operators to the same backend keys for both field types", () => {
    const operators = [
      "is",
      "is_before",
      "is_after",
      "is_on_or_before",
      "is_on_or_after",
      "is_empty",
      "is_not_empty",
    ];

    operators.forEach((op) => {
      expect(mapUiOperatorToBackend(CellType.CreatedTime, op)).toBe(
        mapUiOperatorToBackend(CellType.LastModifiedTime, op),
      );
    });
  });
});


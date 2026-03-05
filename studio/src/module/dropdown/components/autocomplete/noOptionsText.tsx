import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const NoOptionsText = ({
  hasOptions,
  includeOther,
  isOtherSelected,
  isMultiSelect,
  onOtherOptionClick,
}: {
  hasOptions: boolean;
  includeOther: boolean;
  isOtherSelected: boolean;
  isMultiSelect: boolean;
  onOtherOptionClick: () => void;
}) => {
  return (
    <div
      data-testid="no-options-root"
      className="flex flex-col gap-[0.375em]"
    >
      <div className="text-[#607d8b]" data-testid="no-options-message">
        {hasOptions ? (
          <>
            Nothing matched your search.
            {includeOther && (
              <>
                {" "}
                Choose{" "}
                <strong
                  className="text-[#000]"
                  data-testid="option-other-strong"
                >
                  "Other"
                </strong>{" "}
                if your desired option isn't in the list
              </>
            )}
          </>
        ) : (
          "No options available"
        )}
      </div>

      {includeOther && (
        <div
          className={cn(
            "cursor-pointer flex items-center justify-start gap-[0.75em]",
            "p-[0.625em] rounded-[0.375em] transition-all duration-300",
            isOtherSelected
              ? "bg-[rgba(33,33,33)] text-white"
              : "text-[#000] hover:bg-[rgba(33,33,33,0.20)]"
          )}
          onClick={onOtherOptionClick}
          data-testid="option-other"
        >
          {isMultiSelect && (
            <Checkbox
              id="input-checkbox"
              checked={Boolean(isOtherSelected)}
              className="mr-[0.75em]"
              data-testid="option-other-checkbox"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <span
            className="block overflow-hidden text-ellipsis rounded-[0.375em]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical" as const,
            }}
            data-testid="option-other-label"
          >
            Other
          </span>
        </div>
      )}
    </div>
  );
};

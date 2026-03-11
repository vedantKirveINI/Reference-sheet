import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  getParentContainerStyles,
  getComponentStyles,
} from "./zip-code-country-input-styles";
import { ZipCodeInputInner } from "./ZipCodeInputInner";

const QUESTION_FILLER_ROOT_TESTID = "question-filler-root";

function findQuestionFillerRoot(from: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = from;
  while (node) {
    if (node.getAttribute?.("data-testid") === QUESTION_FILLER_ROOT_TESTID) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export interface ZipCodeCountryInputProps {
  value: any;
  onChange: (value: any, e?: any) => void;
  placeholder?: string;
  viewPort?: string;
  isInputValid?: boolean;
  disableCountrySelection?: boolean;
  disableInput?: boolean;
  autoFocus?: boolean;
  countryList?: any;
  theme?: any;
  isCreator?: boolean;
  isPreview?: boolean;
  onFocus?: (e: any) => void;
}

/**
 * Zip-code country + zip input. Mobile preview uses full-screen overlay (constrained to question filler).
 */
export const ZipCodeCountryInput = ({
  value,
  onChange,
  placeholder,
  viewPort: viewPortProp,
  isInputValid = true,
  disableCountrySelection = false,
  disableInput = false,
  autoFocus,
  countryList,
  theme = {},
  isCreator = false,
  isPreview = false,
  onFocus = () => {},
}: ZipCodeCountryInputProps) => {
  const viewPort = viewPortProp ?? "DESKTOP";
  const viewPortForSizing =
    viewPort === "DESKTOP" && (isCreator || isPreview)
      ? "CREATOR_DESKTOP"
      : viewPort;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobileInPreview = isPreview && viewPortForSizing === "MOBILE";
  const showBackdrop = isMobileInPreview && dropdownOpen;

  const backdropContainer =
    showBackdrop && containerRef.current
      ? findQuestionFillerRoot(containerRef.current)
      : null;

  return (
    <>
      {showBackdrop &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[998] h-full w-full bg-black/20 backdrop-blur-sm"
            data-testid="zip-code-mobile-backdrop"
          />,
          backdropContainer ?? document.body
        )}
      <div
        ref={containerRef}
        className={cn(
          "main-container main-input-container w-full max-w-full min-w-0 flex-1 box-border",
          getParentContainerStyles({
            viewPort: viewPortForSizing,
            isOpen: false,
          }).className,
          getComponentStyles(viewPortForSizing)
        )}
        style={
          getParentContainerStyles({
            viewPort: viewPortForSizing,
            isOpen: false,
          }).style
        }
        data-testid="country-input-root-for-ZIPCODE"
      >
        <ZipCodeInputInner
          disableInput={disableInput}
          disableCountrySelection={disableCountrySelection}
          theme={theme}
          placeholder={placeholder}
          autoFocus={autoFocus}
          isCreator={isCreator}
          isPreview={isPreview}
          onChange={onChange}
          onFocus={onFocus}
          isInputValid={isInputValid}
          viewPort={viewPortForSizing}
          value={value}
          countryList={countryList ?? []}
          onDropdownOpenChange={setDropdownOpen}
          isMobileFullScreen={isMobileInPreview}
        />
      </div>
    </>
  );
};

import { forwardRef } from "react";
import { getCountryFlagUrl } from "@oute/oute-ds.core.constants";
import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";
import {
  getCurrencyDetailsContainerStyles,
  getCurrencyFlagImageStyles,
  getCurrencyDisplayStyles,
} from "./currency-details-styles";

export interface CurrencyDetailsProps {
  country: any;
  disabled?: boolean;
  theme?: any;
  viewPort?: string;
  className?: string;
  onOpenCountryList?: () => void;
  onCountryClick?: () => void;
}

const ChevronDown = icons.chevronDown;

/**
 * Currency-only display: flag + currency code + symbol + dropdown trigger.
 * Original design preserved (same styles as before shadcn refactor).
 */
export const CurrencyDetails = forwardRef<
  HTMLDivElement,
  CurrencyDetailsProps & React.HTMLAttributes<HTMLDivElement>
>(function CurrencyDetails(
  {
    country,
    disabled = false,
    theme = {},
    viewPort,
    className,
    onOpenCountryList,
    onCountryClick = () => {},
    onClick: onClickFromTrigger,
    ...rest
  },
  ref
) {
  const countryFlag = getCountryFlagUrl(country?.countryCode);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      onCountryClick();
      return;
    }
    // When used as PopoverTrigger (asChild), Radix passes onClick that TOGGLES open state.
    // Calling onOpenCountryList() first would set open=true, then Radix would toggle to false.
    // So only invoke the trigger's handler; it opens when closed and closes when open.
    if (onClickFromTrigger) {
      onClickFromTrigger(e);
    } else {
      onOpenCountryList?.();
    }
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpenCountryList?.();
        }
      }}
      className={cn(
        getCurrencyDetailsContainerStyles({ disabled, theme, viewPort }).className,
        className
      )}
      style={getCurrencyDetailsContainerStyles({ disabled, theme, viewPort }).style}
      onClick={handleClick}
      data-testid="country-details-for-CURRENCY"
      {...rest}
    >
      <img
        className={getCurrencyFlagImageStyles(viewPort)}
        src={countryFlag}
        alt={country?.countryCode}
        data-testid="country-flag-for-CURRENCY"
      />
      <span
        className={getCurrencyDisplayStyles(theme, viewPort).className}
        style={getCurrencyDisplayStyles(theme, viewPort).style}
      >
        <span data-testid="currency-code">{country?.currencyCode}</span>
        <span data-testid="currency-symbol">{country?.currencySymbol}</span>
      </span>
      {!disabled && (
        <ChevronDown
          className="h-4 w-4 shrink-0 opacity-70"
          data-testid="country-input-dropdown-icon"
        />
      )}
    </div>
  );
});

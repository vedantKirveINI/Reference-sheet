import * as React from "react";

type ImgIconProps = React.ComponentProps<"img">;

export function CurrencyFieldIcon({ className, alt, ...rest }: ImgIconProps) {
  return (
    <img
      src="https://cdn-v1.tinycommand.com/1234567890/1741759302457/Currency.svg"
      alt={alt ?? "Currency"}
      className={className}
      {...rest}
    />
  );
}

export function ZipCodeFieldIcon({ className, alt, ...rest }: ImgIconProps) {
  return (
    <img
      src="https://cdn-v1.tinycommand.com/1234567890/1741760875136/Zipcode.svg"
      alt={alt ?? "Zip Code"}
      className={className}
      {...rest}
    />
  );
}


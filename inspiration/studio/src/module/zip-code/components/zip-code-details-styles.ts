import { cn } from "@/lib/utils";

type DetailsContainerResult = { className: string; style?: { borderBottomColor?: string } };

/**
 * Zip-code trigger (flag + country code) styles. Tailwind + theme border color in style.
 */
export const getZipCountryDetailsContainerStyles = ({
  disabled,
  theme,
  viewPort,
}: {
  disabled?: boolean;
  theme?: any;
  viewPort?: string;
}): DetailsContainerResult => {
  const isMobile = viewPort === "MOBILE";
  const isCreatorDesktop = viewPort === "CREATOR_DESKTOP";
  const borderColor = theme?.styles?.buttons ?? "hsl(var(--border))";
  return {
    className: cn(
      "flex h-full min-w-0 shrink-0 items-center justify-center self-stretch border-b transition-[border] duration-300",
      disabled ? "cursor-default" : "cursor-pointer",
      isCreatorDesktop && "gap-[0.15em] py-[0.35em] px-[0.5em]",
      isMobile && !isCreatorDesktop && "gap-[0.2em] py-[0.5em] px-[0.6em]",
      !isMobile && !isCreatorDesktop && "gap-[0.25em] py-[1em] px-[1em]"
    ),
    style: { borderBottomColor: borderColor },
  };
};

export const getZipCountryFlagImageStyles = (viewPort?: string): string => {
  const isMobile = viewPort === "MOBILE";
  const isCreatorDesktop = viewPort === "CREATOR_DESKTOP";
  return cn(
    "flex shrink-0 items-center justify-center object-cover",
    isCreatorDesktop && "h-[1em] w-[1.25em]",
    isMobile && !isCreatorDesktop && "h-[1.2em] w-[1.5em]",
    !isMobile && !isCreatorDesktop && "h-[1.5em] w-[1.875em]"
  );
};

type CodeDisplayResult = { className: string; style?: { color?: string; fontFamily?: string } };

export const getZipCountryCodeDisplayStyles = (theme: any, viewPort?: string): CodeDisplayResult => {
  const isMobile = viewPort === "MOBILE";
  const isCreatorDesktop = viewPort === "CREATOR_DESKTOP";
  return {
    className: cn(
      "flex min-w-0 items-center justify-center text-center font-normal tracking-[0.25px] leading-[140%]",
      isCreatorDesktop && "text-[0.875em]",
      isMobile && !isCreatorDesktop && "text-[1em]",
      !isMobile && !isCreatorDesktop && "text-[1.25em]"
    ),
    style: {
      color: theme?.styles?.buttons,
      fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
    },
  };
};

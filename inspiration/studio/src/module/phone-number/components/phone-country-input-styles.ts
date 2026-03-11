import { cn } from "@/lib/utils";

/**
 * Phone container styles. Returns Tailwind className; optional style for scalingFactor.
 */
export const getParentContainerStyles = (option: {
  viewPort?: string;
  isOpen?: boolean;
  scalingFactor?: number;
}): { className: string; style?: { fontSize?: string } } => {
  const base = "box-border";
  if (option.viewPort === "MOBILE" && option?.isOpen === true) {
    return {
      className: cn(
        base,
        "absolute inset-4 z-[999] h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-[min(calc(100vw-2rem),390px)]"
      ),
    };
  }
  if (option?.scalingFactor !== undefined) {
    return { className: base, style: { fontSize: `${option.scalingFactor}px` } };
  }
  return { className: cn(base, "text-base") };
};

export const getComponentStyles = (viewPort?: string): string => {
  const isMobile = viewPort === "MOBILE";
  const isCreatorDesktop = viewPort === "CREATOR_DESKTOP";
  return cn(
    "flex w-full min-w-0 items-center gap-[0.75em] overflow-hidden rounded-[0.75em]",
    isCreatorDesktop && "min-h-[2.5rem] h-[2.75rem]",
    isMobile && !isCreatorDesktop && "min-h-[3rem] h-[3.25rem]",
    !isMobile && !isCreatorDesktop && "min-h-[3.25rem] h-[3.75em]"
  );
};

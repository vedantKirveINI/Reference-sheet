import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { icons } from "@/components/icons";

const ThemePreviewCard = ({
  theme: themeData,
  isSelected,
  onApply,
  onEditTheme,
}) => {
  const styles = themeData?.styles;
  const nested = themeData?.theme;
  
  const backgroundColor = 
    styles?.backgroundColor ||
    themeData?.background?.color ||
    nested?.background?.color ||
    themeData?.colors?.background ||
    themeData?.backgroundColor ||
    "#FFFFFF";
  
  const backgroundImage = 
    styles?.backgroundImage ||
    themeData?.background?.image ||
    nested?.background?.image ||
    themeData?.backgroundImage;
  
  const questionColor = 
    styles?.questions ||
    themeData?.fonts?.questionColor ||
    themeData?.font?.question?.color ||
    nested?.font?.question?.color ||
    themeData?.colors?.question ||
    themeData?.questionColor ||
    "#1a1a1a";
  
  const answerColor = 
    styles?.answer ||
    themeData?.fonts?.answerColor ||
    themeData?.font?.answer?.color ||
    nested?.font?.answer?.color ||
    themeData?.colors?.answer ||
    themeData?.answerColor ||
    "#666666";
  
  const fontFamily = 
    styles?.fontFamily ||
    themeData?.fonts?.style ||
    themeData?.font?.question?.family ||
    nested?.font?.question?.family ||
    themeData?.fontFamily ||
    "Inter, sans-serif";
  
  const buttonColor = 
    styles?.buttons ||
    themeData?.buttons?.fillColor ||
    themeData?.components?.button?.background ||
    nested?.components?.button?.background ||
    themeData?.colors?.button ||
    themeData?.buttonColor ||
    "#4E97FE";
  
  const buttonTextColor = 
    styles?.buttonText ||
    themeData?.buttons?.textColor ||
    themeData?.components?.button?.text ||
    nested?.components?.button?.text ||
    themeData?.buttonTextColor ||
    "#FFFFFF";
  
  const buttonCornersValue = styles?.buttonCorners;
  const buttonBorderRadius = 
    buttonCornersValue === "rounded" ? "8px" :
    buttonCornersValue === "pill" ? "9999px" :
    buttonCornersValue === "square" ? "0px" :
    themeData?.buttons?.borderRadius ||
    themeData?.components?.button?.borderRadius ||
    nested?.components?.button?.borderRadius ||
    "4px";
  
  const themeName = themeData?.name || "Untitled Theme";

  const handleApply = (e) => {
    e.stopPropagation();
    onApply?.(themeData);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEditTheme?.(themeData);
  };

  const CheckIcon = icons.check;
  const PencilIcon = icons.pencil;

  const isImageUrl = backgroundImage && typeof backgroundImage === "string" && (backgroundImage.startsWith("http") || backgroundImage.startsWith("data:"));

  return (
    <Card
      className={cn(
        "relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300",
        isSelected
          ? "border-2 border-[#1C3693] ring-2 ring-[#1C3693]/20"
          : "border-2 border-border hover:border-muted-foreground/30"
      )}
      style={{ contentVisibility: "auto" }}
      onClick={() => onApply?.(themeData)}
    >
      <CardContent
        className="relative h-[160px] w-full overflow-hidden p-0 rounded-t-2xl border-0"
        style={{ backgroundColor }}
      >
        {isImageUrl ? (
          <img
            src={backgroundImage}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div
          className="absolute z-10 flex flex-col gap-2"
          style={{ left: "20px", top: "36px", width: "80px" }}
        >
          <div className="flex flex-col">
            <CardDescription
              className="font-semibold text-[13px] leading-[32px] tracking-[1px] m-0"
              style={{ color: questionColor, fontFamily }}
            >
              Question
            </CardDescription>
            <CardDescription
              className="text-[11px] leading-[22px] m-0"
              style={{ color: answerColor, fontFamily }}
            >
              Answer
            </CardDescription>
          </div>
          <div
            className="flex items-center justify-center shadow-sm text-[10px] font-medium whitespace-nowrap px-2 min-w-[44px] h-[20px]"
            style={{
              backgroundColor: buttonColor,
              color: buttonTextColor,
              borderRadius: buttonBorderRadius,
              fontFamily,
            }}
          >
            Submit
          </div>
        </div>

        <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          {!isSelected && (
            <Button onClick={handleApply} size="sm" variant="secondary">
              Apply
            </Button>
          )}
          <Button onClick={handleEdit} size="sm" variant="outline" className="gap-1.5">
            {PencilIcon ? <PencilIcon className="w-3 h-3" /> : null}
            Edit
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2 px-4 py-3 border-t rounded-b-2xl">
        <CardDescription className="flex-1 text-sm font-medium truncate m-0">
          {themeName}
        </CardDescription>
        {isSelected && CheckIcon && (
          <div className="w-5 h-5 rounded-full bg-[#1C3693] flex items-center justify-center shrink-0">
            <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ThemePreviewCard;

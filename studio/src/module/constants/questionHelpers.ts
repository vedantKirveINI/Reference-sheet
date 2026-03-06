import { Mode, ViewPort } from "./constants";

const getQuestionBackgroundStyles = (
  theme,
  viewport: any = ViewPort.DESKTOP,
  mode: any = Mode.CARD,
  question: any = {}
) => {
  const augmentorImage = question?.augmentor?.url;
  let augmentorImageAlignment =
    viewport === ViewPort.MOBILE
      ? question?.augmentor?.alignment?.cardMobile
      : question?.augmentor?.alignment?.cardDesktop;

  const shouldUseAugmentorImage =
    augmentorImage &&
    augmentorImageAlignment === "background" &&
    mode === Mode.CARD;

  const backgroundImage = shouldUseAugmentorImage
    ? augmentorImage
    : theme?.styles?.backgroundImage;

  if (backgroundImage) {
    return {
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundImage: `url(${backgroundImage})`,
    };
  }
  return {
    backgroundColor: theme?.styles?.backgroundColor || "#FFFFFF",
  };
};

export { getQuestionBackgroundStyles };

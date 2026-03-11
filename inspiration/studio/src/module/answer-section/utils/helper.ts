import { Mode, ViewPort } from "@oute/oute-ds.core.constants";
import { IMAGE_ALIGNMENT } from "@oute/oute-ds.core.constants/imagePickerConstant";

export const getBoxesPerRowForPicture = ({
  viewPort,
  mode,
  isAugmentorAvailable,
  augmentor,
}) =>
  viewPort === ViewPort.MOBILE
    ? 1
    : isAugmentorAvailable &&
        ((mode === Mode.CARD &&
          [IMAGE_ALIGNMENT.Right, IMAGE_ALIGNMENT.Left].includes(
            augmentor?.alignment?.cardDesktop
          )) ||
          (mode === Mode.CLASSIC &&
            [IMAGE_ALIGNMENT.Right, IMAGE_ALIGNMENT.Left].includes(
              augmentor?.alignment?.classicDesktop
            )))
      ? 2
      : 4;

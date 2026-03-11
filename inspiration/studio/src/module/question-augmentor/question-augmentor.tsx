import { Mode, ViewPort } from "@src/module/constants";
import { getImageStyles, getImageWrapperHoverStyles, getAugmentorWrapperStyle,  } from "./styles";
import ToolBar from "./components/tool-bar";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
export type QuestionAugmentorProps = {
  viewPort?: ViewPort;
  onChange?: any;
  question?: any;
  mode?: any;
  style?: object;
  isAugmentorAvailable?: boolean;
  isCreator?: boolean;
  answers?: any;
  goToTab?: any;
};

export function QuestionAugmentor({
  viewPort,
  onChange,
  question,
  mode,
  style = {},
  isCreator = false,
  answers,
  goToTab = () => {},
}: QuestionAugmentorProps) {
  const isAugmentorAvailable =
    question?.augmentor?.url || question?.augmentor?.blocks;
  if (!isAugmentorAvailable) return null;

  let augmentorAlignment = "";
  if (mode === Mode.CARD) {
    if (viewPort === ViewPort.MOBILE) {
      augmentorAlignment = question?.augmentor?.alignment?.cardMobile;
    } else {
      augmentorAlignment = question?.augmentor?.alignment?.cardDesktop;
    }
  } else {
    if (viewPort === ViewPort.MOBILE) {
      augmentorAlignment = "top";
    } else {
      augmentorAlignment = question?.augmentor?.alignment?.classicDesktop;
    }
  }

  if (augmentorAlignment === "background" && mode === Mode.CARD && isCreator) {
    return (
      <ToolBar
        question={question}
        onChange={onChange}
        goToTab={goToTab}
        style={{ opacity: 1 }}
      />
    );
  }

  if (augmentorAlignment === "background" && !isCreator) {
    return null;
  }
  const objectFit = question?.augmentor?.objectFit;
  const opacity = question?.augmentor?.opacity ?? 100;

  const resolveFx = ({ answers, blocks }: any) => {
    const res = OuteServicesFlowUtility?.resolveValue(
      answers,
      "",
      {
        type: "fx",
        blocks,
      },
      null
    );
    return res?.value;
  };

  const getUrl = () => {
    if (question?.augmentor?.url) {
      return question?.augmentor?.url;
    }
    if (question?.augmentor?.blocks && isCreator) {
      return "https://payyanurcollege.ac.in/wp-content/uploads/2024/07/dummy-image-square-e1720187193452.jpg";
    }
    if (question?.augmentor?.blocks && !isCreator) {
      const url = resolveFx({
        answers,
        blocks: question?.augmentor?.blocks,
      });
      return url;
    }
  };

  return (
    // this div is to only give height and width; group for toolbar hover visibility
    <div
      className="group"
      style={getAugmentorWrapperStyle({ viewPort, mode, style, isCreator })}
      data-testid="question-augmentor-root"
    >
      <img
        className="augmentor-image"
        src={getUrl()}
        style={getImageStyles({ viewPort, objectFit, mode, isCreator, opacity })}
        alt={question?.augmentor?.altText}
        data-testid="question-augmentor-image"
      />
      {isCreator && (
        <div
          style={getImageWrapperHoverStyles({ viewPort, mode, isCreator })}
          className="image-wrapper"
        />
      )}
      {isCreator && (
        <ToolBar question={question} goToTab={goToTab} onChange={onChange} />
      )}
    </div>
  );
}

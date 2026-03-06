import { TAnswers } from "../types";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";

export const resolveFXContent = ({
  answers,
  content,
}: {
  answers: TAnswers;
  content: any;
}) => {
  try {
    const res = OuteServicesFlowUtility?.resolveValue(
      { ...answers },
      "",
      content,
      null
    );
    return res?.value;
  } catch (error) {
  }
};

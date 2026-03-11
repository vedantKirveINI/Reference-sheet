import { shuffle } from "lodash-es";
import { createUID } from "@/module/constants";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";

export const getRankingOptions = (
  staticOptions: any[],
  settings: any,
  answers: any
) => {
  const dynamicInputs = settings.dynamicInput;

  if (dynamicInputs?.isActive) {
    let rankingOptions: any = [];

    const res = OuteServicesFlowUtility?.resolveValue(
      answers,
      "",
      dynamicInputs?.variable,
      null
    );

    let ranking = Array.isArray(res?.value) ? res?.value : [];
    if (settings?.randomize) {
      const newOptions = shuffle(ranking);
      ranking = newOptions;
    }

    if (typeof ranking[0] === "string") {
      ranking.forEach((option, index) => {
        rankingOptions.push({
          id: createUID(),
          rank: null,
          label: option,
        });
      });
    }

    return rankingOptions;
  }

  // If dynamic input is not active, return the static options
  let rankingOptions = staticOptions;
  if (settings?.randomize) {
    const newOptions = shuffle(rankingOptions);
    rankingOptions = newOptions;
  }

  return rankingOptions;
};

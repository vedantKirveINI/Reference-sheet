import { shuffle, sortBy, get } from "lodash";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { isEmpty } from "oute-services-utility-sdk";
import { toast } from "sonner";

export const getSortedOptions = ({
  options,
  settings,
  answers,
  question,
}: any) => {
  if (
    question?.type === "DROP_DOWN" &&
    question?.settings?.dynamicInputs?.labelAccessor
  ) {
    const idAccessor = settings?.dynamicInputs?.idAccessor;
    const labelAccessor = settings?.dynamicInputs?.labelAccessor;
    let res: any;
    try {
      res = OuteServicesFlowUtility?.resolveValue(
        answers,
        "",
        settings?.dynamicInputs?.variable,
        null
      );
    } catch (error) {
      toast.error("Processing Error", {
        description: "Something went wrong",
      });
      return [];
    }

    const dynamicInputs = res?.value;

    if (!Array.isArray(dynamicInputs)) return [];

    if (typeof dynamicInputs[0] === "string") {
      const dynamicOptions = dynamicInputs.map((input: any) => ({
        id: input,
        label: input,
      }));
      return dynamicOptions || [];
    }

    let dynamicOptions = [];
    dynamicInputs.forEach((input: any) => {
      if (!idAccessor && !labelAccessor) {
        dynamicOptions.push({
          id: JSON.stringify(input),
          label: JSON.stringify(input),
        });
        return;
      }
      const idValue = get(input, idAccessor);
      const labelValue = get(input, labelAccessor);
      const shouldMapObjectsItem = settings?.dynamicInputs?.mapObjectItems;
      // This is sattu's isEmpty wrapper to check if the value is empty which handles 0 as well
      if (!isEmpty(idValue) && !isEmpty(labelValue)) {
        dynamicOptions.push({
          ...(shouldMapObjectsItem ? input : {}),
          id: idValue,
          label: labelValue,
        });
      }
    });

    return dynamicOptions || [];
  }

  const randomizedOptions = settings?.randomize ? shuffle(options) : options;

  const arrangedOptions = settings?.isAlphabeticallyArranged
    ? sortBy(randomizedOptions, "label")
    : randomizedOptions;

  return arrangedOptions;
};

export const shouldEnableSearch = (value, multiple) => {
  if (!multiple && value?.id) {
    return false;
  } else {
    return true;
  }
};

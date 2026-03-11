import { shuffle, sortBy, get } from "lodash";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { isEmpty } from "oute-services-utility-sdk";


const safeJSONStringify = (val: any): string => {
  if(typeof val === "string") return val;
  try {
    return JSON.stringify(val, null, 2);
  } catch (error) {
    return String(val);
  }
};

const isOptionValueEmpty = (val: any): boolean => {
  if (typeof val === "boolean") return false;
  return isEmpty(val);
};

const applySortingAndRandomization = (options: any[], settings: any) => {
  if (!options || !Array.isArray(options) || options.length === 0) return [];
  let transformedOptions = [...options];
  if (settings?.randomize) {
    transformedOptions = shuffle(transformedOptions);
  }
  if (settings?.isAlphabeticallyArranged) {
    if (typeof transformedOptions?.[0] === "string") {
      transformedOptions = sortBy(transformedOptions, (option) =>
        option?.toLowerCase?.()
      );
    } else {
      transformedOptions = sortBy(transformedOptions, "label");
    }
  }
  return transformedOptions;
};

export const getSortedOptionsForDynamicDropdown = ({
  settings,
  answers,
}: any) => {
  try {
    const idAccessor = settings?.dynamicInputs?.idAccessor;
    const labelAccessor = settings?.dynamicInputs?.labelAccessor;

    const res = OuteServicesFlowUtility?.resolveValue(
      answers,
      "",
      settings?.dynamicInputs?.variable,
      null
    );

    console.log("res", res);
    console.log("settings", settings);
    console.log("answers", answers);
    const dynamicInputs = res?.value;

    if (!Array.isArray(dynamicInputs)) return [];

    if (typeof dynamicInputs[0] === "string") {
      let dynamicOptions = dynamicInputs.map((input: any) => ({
        id: input,
        label: input,
      }));
      dynamicOptions = applySortingAndRandomization(dynamicOptions, settings);
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
      // This is sattu's isEmpty wrapper to check if the value is empty which handles 0 and boolean as well
      if (!isOptionValueEmpty(idValue) && !isOptionValueEmpty(labelValue)) {
        dynamicOptions.push({
          ...(shouldMapObjectsItem ? input : {}),
          id: safeJSONStringify(idValue),
          label: safeJSONStringify(labelValue),
        });
      }
    });

    dynamicOptions = applySortingAndRandomization(dynamicOptions, settings);

    return dynamicOptions || [];
  } catch (err) {
    return [];
  }
};

export const getSortedOptionsForStaticDropdown = ({
  options,
  settings,
}: any) => {
  let hasOther = settings?.includeOtherOption || false; //options.find((opt) => opt.toLowerCase() === "other");

  let arrangedOptions = options;
  // hasOther
  //   ? options.filter((opt) => opt.toLowerCase() !== "other")
  //   : [...options];

  arrangedOptions = applySortingAndRandomization(arrangedOptions, settings);

  if (hasOther) {
    arrangedOptions.push("Other");
  }

  return arrangedOptions;
};

import { startCase } from "lodash";
import DATA_TYPE from "../constant/datatype";
import { questionDataType } from "../constant/questionDataTypeMapping";

const getDataType = ({ allowQuestionDataType }) => {
  let typeOptions = [...DATA_TYPE];

  if (allowQuestionDataType) {
    const dataTypeWoNum = DATA_TYPE.filter((type) => type !== "number");
    typeOptions = [...dataTypeWoNum, ...questionDataType];
  }

  return typeOptions.map((type) => startCase(type));
};

export default getDataType;

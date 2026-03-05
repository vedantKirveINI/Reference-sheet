import { ITERATOR_TYPE } from "../constants/types";

export const getAggregatorSources = (variables) => {
  return variables?.NODE?.filter((node) => node.type === ITERATOR_TYPE) || [];
};

import { ITERATOR_TYPE, ITERATOR_TYPE_V2 } from "../constants/types";

export const getAggregatorSources = (variables) => {
  return variables?.NODE?.filter(
    (node) => node.type === ITERATOR_TYPE || node.type === ITERATOR_TYPE_V2
  ) || [];
};

export function rankingSwap<T>(
  array: T[],
  sourceIndex: number,
  destinationIndex: number
): T[] {
  const arr = [...array];
  const temp = arr[sourceIndex];
  arr[sourceIndex] = arr[destinationIndex];
  arr[destinationIndex] = temp;
  return arr;
}

export function generateIndices(options) {
  return Array.from({ length: options.length }, (_, index) => index + 1);
}

export function incrementRanks(arr) {
  const shallowArray = [...arr];
  for (let i = 0; i < shallowArray.length; i++) {
    shallowArray[i].rank = i + 1;
  }
  return shallowArray;
}

export function dragEndReorder<T>(
  array: T[],
  sourceIndex: number,
  destinationIndex: number
): T[] {
  const arr = [...array];
  const [removedSource] = arr.splice(sourceIndex, 1);
  arr.splice(destinationIndex, 0, removedSource);
  return arr;
}

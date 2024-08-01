import classnames from "classnames";

export const cn = classnames;

export const arraysEqual = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((element, index) => element === arr2[index]);
};

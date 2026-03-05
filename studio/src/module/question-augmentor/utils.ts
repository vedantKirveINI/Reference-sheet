export const getImageNameByUrl = (url: string) => {
  if (url === undefined || "") return;
  let name = "";
  const imageUrlArray = url?.split("/");
  name = imageUrlArray[imageUrlArray.length - 1];
  if (name.includes("?")) {
    name = name?.split("?")[0];
  }
  return name;
};

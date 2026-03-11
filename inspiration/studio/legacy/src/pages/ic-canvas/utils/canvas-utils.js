export const createThumbnailSavePayload = ({
  fileName = "canvas_thumbnail",
  thumbnail,
  imageFilePath = null,
}) => {
  let payload = {
    fileName,
    fileType: "image/webp",
    file_obj: thumbnail,
  };

  if (imageFilePath) {
    payload.op = "update";
    payload.filePath = imageFilePath;
  }

  return payload;
};

export const getChildNodeLocation = (
  parentLoc,
  numberOfChildren,
  childIndex,
) => {
  const { x, y } = parentLoc;
  const spacing = 300;
  const totalHeight = (+numberOfChildren - 1) * spacing;
  const startY = +y - totalHeight / 2;
  const childX = +x + spacing;
  const childY = startY + childIndex * spacing;
  return { x: childX, y: childY };
};

export const createNodeIdMap = (config) => {
  let prev = {};
  config?.forEach((curr) => {
    curr?.components?.forEach((component) => {
      if (component?.events) {
        component?.events?.components?.forEach((component) => {
          prev[component.id] = component;
        });
      } else {
        prev[component?.id || component?.cmsId || component?.type] = component;
      }
    });
  });
  return prev;
};

// export const postProcessHITLNode = (node, canvasRef) => {
//   const existingLinks = canvasRef.findLinksOutOf(node?.key);
//   const data = node.data;
//   console.log(existingLinks, "existingLinksexistingLinks");
//   if (existingLinks?.count === 0) {
//     const placeholderNode1 = canvasRef.createNode({
//       template: NODE_TEMPLATES.PLACEHOLDER,
//     });
//     const placeholderNode2 = canvasRef.createNode({
//       template: NODE_TEMPLATES.PLACEHOLDER,
//     });
//     canvasRef.createLink({
//       from: data.key,
//       to: placeholderNode1.data.key,
//       label: "On Response",
//       key: Date.now(),
//       isOnResponseLink: true,
//     });
//     canvasRef.createLink({
//       from: data.key,
//       to: placeholderNode2.data.key,
//       label: "Initiate",
//       key: Date.now() + 100,
//       isInitiateLink: true,
//     });
//   }
// };

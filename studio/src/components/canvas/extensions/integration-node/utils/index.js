export const sanitizeInitialPipeline = (initialPipeline = [], flow = {}) => {
  let preSanitizePipeline = [];

  if (Array.isArray(initialPipeline)) {
    preSanitizePipeline = initialPipeline;
  } else {
    preSanitizePipeline = Object.values(initialPipeline);
  }

  let sanitizePipeline = [];

  preSanitizePipeline.forEach((node) => {
    if (flow[node.qId]) {
      sanitizePipeline.push(node);
    }
  });

  return sanitizePipeline;
};

/**
 * The function calculates the scaling factor based on the width of the screen and the design width,
 * with a maximum and minimum width limit.
 * @param [width=1920] - The width parameter represents the current width of the screen or container
 * where the scaling factor is being calculated.
 * @param [design_width=1920] - The design_width parameter represents the width of the design or layout
 * that you are working with. It is the width that you have designed your website or application for.
 * @param [max_width=1920] - The `max_width` parameter represents the maximum width that the scaling
 * factor should be calculated for. It is used to ensure that the width value does not exceed this
 * maximum value.
 * @param [min_width=390] - The `min_width` parameter represents the minimum width value that the
 * `width` parameter can have. It is used to ensure that the `width` value does not go below this
 * minimum value.
 * @returns the scaling factor, which is calculated by dividing the current width by the design width
 * and then multiplying it by 16.
 */
export function getScalingFactor(
  width = 1920,
  design_width = 1920,
  max_width = 1920,
  min_width = 390
) {
  /*eslint no-underscore-dangle: ["error", { "allow": ["_width"] }]*/
  let _width = width;
  if (_width > max_width) {
    _width = max_width;
  }
  if (_width < min_width) {
    _width = min_width;
  }
  const scalingFactor = Math.max(0.75, _width / design_width);
  //   We are multiplying by 16 because we want deefault font size as 16
  return scalingFactor * 16;
}

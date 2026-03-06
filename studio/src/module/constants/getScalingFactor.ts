/**
 * The function calculates the scaling factor based on the width of the screen and the design width,
 * with a maximum and minimum width limit.
 * @param [width=1920] - The width parameter represents the current width of the screen or container
 * where the scaling factor is being calculated.
 * @param [design_width=1920] - The design_width parameter represents the width of the design or layout
 * that you have designed your website or application for.
 * @param [max_width=1920] - The `max_width` parameter represents the maximum width that the scaling
 * factor should be calculated for. It is used to ensure that the width value does not exceed this
 * maximum value.
 * @param [min_width=390] - The `min_width` parameter represents the minimum width value that the
 * `width` parameter can have. It is used to ensure that the `width` value does not go below this
 * minimum value.
 * @returns the scaling factor, which is calculated by dividing the current width by the design width
 * and then multiplying it by 16.
 * 
 * @example
 * // Get scaling factor for current window width
 * const scale = getScalingFactor(window.innerWidth);
 * 
 * @example
 * // Get scaling factor for a specific container
 * const containerWidth = document.getElementById('container').offsetWidth;
 * const scale = getScalingFactor(containerWidth, 1920, 1920, 390);
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

/**
 * Returns a CSS clamp() string for responsive sizing based on scaling factor approach.
 * This is useful when you want to generate clamp() values that align with the getScalingFactor logic.
 * 
 * @param basePx - Base pixel value (designed for design_width)
 * @param minPx - Minimum pixel value (optional, defaults to basePx * 0.75)
 * @param maxPx - Maximum pixel value (optional, defaults to basePx)
 * @param designWidth - Design width in pixels (default: 1920)
 * @returns CSS clamp() string
 * 
 * @example
 * // Generate responsive width for sidebar
 * const sidebarWidth = getScalingFactorClamp(74, 60, 74);
 * // => "clamp(3.75rem, 3.854vw, 4.625rem)"
 * 
 * @example
 * // Generate responsive height for CTA bar
 * const ctaHeight = getScalingFactorClamp(64, 48, 64);
 * // => "clamp(3rem, 3.333vw, 4rem)"
 */
export function getScalingFactorClamp(
  basePx: number,
  minPx?: number,
  maxPx?: number,
  designWidth: number = 1920
): string {
  const min = minPx ?? basePx * 0.75;
  const max = maxPx ?? basePx;
  const vw = (basePx / designWidth) * 100;
  const minRem = min / 16;
  const maxRem = max / 16;
  return `clamp(${minRem}rem, ${vw}vw, ${maxRem}rem)`;
}

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  })),
}));

class MockCanvasRenderingContext2D {
  canvas = { width: 800, height: 600 };
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;
  font = '14px sans-serif';
  textAlign = 'left' as CanvasTextAlign;
  textBaseline = 'top' as CanvasTextBaseline;
  globalAlpha = 1;
  globalCompositeOperation = 'source-over';
  shadowColor = '';
  shadowBlur = 0;
  shadowOffsetX = 0;
  shadowOffsetY = 0;
  lineCap = 'butt' as CanvasLineCap;
  lineJoin = 'miter' as CanvasLineJoin;
  miterLimit = 10;
  lineDashOffset = 0;
  imageSmoothingEnabled = true;
  direction = 'ltr' as CanvasDirection;
  filter = 'none';
  imageSmoothingQuality = 'low' as ImageSmoothingQuality;
  letterSpacing = '0px';
  wordSpacing = '0px';
  fontKerning = 'auto' as CanvasFontKerning;
  fontStretch = 'normal' as CanvasFontStretch;
  fontVariantCaps = 'normal' as CanvasFontVariantCaps;
  textRendering = 'auto' as CanvasTextRendering;

  fillRect = vi.fn();
  clearRect = vi.fn();
  strokeRect = vi.fn();
  fillText = vi.fn();
  strokeText = vi.fn();
  measureText = vi.fn((text: string) => ({
    width: text.length * 8,
    actualBoundingBoxAscent: 10,
    actualBoundingBoxDescent: 2,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: text.length * 8,
    fontBoundingBoxAscent: 12,
    fontBoundingBoxDescent: 3,
    alphabeticBaseline: 0,
    emHeightAscent: 0,
    emHeightDescent: 0,
    hangingBaseline: 0,
    ideographicBaseline: 0,
  }));
  beginPath = vi.fn();
  closePath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  arc = vi.fn();
  arcTo = vi.fn();
  ellipse = vi.fn();
  rect = vi.fn();
  roundRect = vi.fn();
  bezierCurveTo = vi.fn();
  quadraticCurveTo = vi.fn();
  fill = vi.fn();
  stroke = vi.fn();
  clip = vi.fn();
  save = vi.fn();
  restore = vi.fn();
  scale = vi.fn();
  rotate = vi.fn();
  translate = vi.fn();
  transform = vi.fn();
  setTransform = vi.fn();
  getTransform = vi.fn(() => new DOMMatrix());
  resetTransform = vi.fn();
  drawImage = vi.fn();
  createLinearGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }));
  createRadialGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }));
  createConicGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }));
  createPattern = vi.fn(() => null);
  createImageData = vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1, colorSpace: 'srgb' as PredefinedColorSpace }));
  getImageData = vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1, colorSpace: 'srgb' as PredefinedColorSpace }));
  putImageData = vi.fn();
  setLineDash = vi.fn();
  getLineDash = vi.fn(() => []);
  isPointInPath = vi.fn(() => false);
  isPointInStroke = vi.fn(() => false);
  getContextAttributes = vi.fn(() => ({ alpha: true, desynchronized: false, colorSpace: 'srgb', willReadFrequently: false }));
  drawFocusIfNeeded = vi.fn();
  reset = vi.fn();
}

HTMLCanvasElement.prototype.getContext = vi.fn(function (this: HTMLCanvasElement, contextId: string) {
  if (contextId === '2d') {
    return new MockCanvasRenderingContext2D() as unknown as CanvasRenderingContext2D;
  }
  return null;
}) as any;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

Element.prototype.scrollIntoView = vi.fn();

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(document, 'elementFromPoint', {
  writable: true,
  value: vi.fn(() => null),
});

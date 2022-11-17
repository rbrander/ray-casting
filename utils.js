// utils.js

// Given two points, return the length of the line via c² = a² + b²
const getLineLength = (startX, startY, endX, endY) =>
  Math.sqrt((endX - startX)*(endX - startX) + (endY - startY)*(endY - startY));

// limit a value to between min (inclusive) and max (exclusive)
// by adding or subtracting the range until the value is within range
const range = (value, min, max) => {
  const range = Math.abs(max - min);
  let newValue = value;
  while (newValue > max) {
    newValue -= range;
  };
  while (newValue < min) {
    newValue += range;
  }
  return newValue;
}

// limit an angle (in radians) to 0 to 2π
const limitAngleRange = (angle) => range(angle, 0, Math.PI * 2);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const clamp8bit = (value) => clamp(value, 0, 256); // 256 = 2 ** 8, hence 8-bit
const createColorString = (r, g, b) => `rgb(${clamp8bit(r)}, ${clamp8bit(g)}, ${clamp8bit(b)})`;

const getColorStringFromImageDataOffset = (imageData, x, y) => {
  const pixelOffset = y * imageData.width + x;
  const dataOffset = pixelOffset * NUM_COLOR_CHANNELS;
  const r = imageData.data[dataOffset + 0];
  const g = imageData.data[dataOffset + 1];
  const b = imageData.data[dataOffset + 2];
  // There is an alpha channel, but we're not using it
  // const a = imageData.data[dataOffset + 3];
  return createColorString(r, g, b);
}

const create2DArray = (width, height, initialValue) =>
  new Array(width).fill().map(() => new Array(height)
    .fill(typeof initialValue === 'function' ? initialValue() : initialValue));


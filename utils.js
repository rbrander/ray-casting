// utils.js

// Given two points, return the length of the line via c² = a² + b²
const getLineLength = (startX, startY, endX, endY) =>
  Math.sqrt((endX - startX)*(endX - startX) + (endY - startY)*(endY - startY));

// limit a value to between min and max
const clamp = (value, min, max) => {
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
const clampAngle = (angle) => clamp(angle, 0, Math.PI * 2);

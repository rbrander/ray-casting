// constants.js

// Min and Max angle values in radians
const MIN_ANGLE = 0;
const MAX_ANGLE = Math.PI * 2;
const RADS_PER_DEGREE = Math.PI / 180;

// Keys
const W_KEY = 87;
const A_KEY = 65;
const S_KEY = 83;
const D_KEY = 68;

// Map
const MAP_WIDTH = 8; // map width (array)
const MAP_HEIGHT = 8; // map height (array)
const MAP_TILE_SIZE = 64; // each map cell in pixels
const MAP = [
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 1, 0, 0, 0, 0, 1,
  1, 0, 1, 0, 0, 0, 0, 1,
  1, 0, 1, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 1, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1
];

// Others
const PLAYER_MOVE_DISTANCE = 5; // pixels
const COLORS = {
  LIGHT_RED: '#e50000',
  DARK_RED: '#b20000'
}


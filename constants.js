// constants.js

// Min and Max angle values in radians
const MIN_ANGLE = 0;
const MAX_ANGLE = Math.PI * 2;
const RADS_PER_DEGREE = Math.PI / 180;
const PLAYER_ROTATION_DELTA = 0.03; // angle change in radians when the player turns

// Keys
const W_KEY = 87;
const A_KEY = 65;
const S_KEY = 83;
const D_KEY = 68;
const SHIFT_KEY = 16;
const KEY_MAP = { // String representation of key presses
  [SHIFT_KEY]: '⤊',
  [W_KEY]: '⇧',
  [A_KEY]: '⇦',
  [S_KEY]: '⇩',
  [D_KEY]: '⇨'
}

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
  DARK_RED: '#b20000',
  LIGHT_YELLOW: '#e5e500',
  DARK_YELLOW: '#b2b200'
}
const NUM_COLOR_CHANNELS = 4; // red, green, blue, alpha

// Wall Image Textures
const SPRITE_SHEET_TRANSPARENT_COLOR = 'rgb(152, 0, 136)'; // a purple colour used to indicate special pixels
const WALL_TEXTURE_FILENAME = 'Wolfenstein3DWallTextures.png';
const WALL_TEXTURE_SIZE = 32; // 32x32 pixel images
const WALL_TEXTURE_PADDING = 8; // 8 pixels between textures of transparent color
const STONE_WALL = {
  // Each dimension has an array of RGB color string values (32x32)
  Horizontal: [[SPRITE_SHEET_TRANSPARENT_COLOR]],
  Vertical: [[SPRITE_SHEET_TRANSPARENT_COLOR]]
};

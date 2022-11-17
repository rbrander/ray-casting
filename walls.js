// wall.js

// All of the wall sprites are located in this image;
// from this image, each image can be extracted individually.
// Each texture is bordered by 8px transparent (purple)
// Each texture is repeated twice, each with a slightly different shade,
// meant to be used for horizontal/vertical walls
const wallTextureSpriteSheetImage = new Image();
wallTextureSpriteSheetImage.onload = () => {
  // create a canvas, draw the image onto the canvas, then extract the pixel data
  const img = wallTextureSpriteSheetImage;
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // load the first two stone sprite textures
  // each sprite is surrounded by 8 pixels of transparency
  // and each sprite is 32x32 pixels, giving a sprite offset of 32 + 8 = 40
  const SPRITE_OFFSET = WALL_TEXTURE_PADDING + WALL_TEXTURE_SIZE;
  STONE_WALL.Horizontal = create2DArray(WALL_TEXTURE_SIZE, WALL_TEXTURE_SIZE, '');
  STONE_WALL.Vertical = create2DArray(WALL_TEXTURE_SIZE, WALL_TEXTURE_SIZE, '');
  for (y = 0; y < WALL_TEXTURE_SIZE; y++) {
    for (x = 0; x < WALL_TEXTURE_SIZE; x++) {
      // The two sprites are beside each other on the first row
      STONE_WALL.Horizontal[x][y] = getColorStringFromImageDataOffset(imageData, x + WALL_TEXTURE_PADDING, y + WALL_TEXTURE_PADDING);
      STONE_WALL.Vertical[x][y] = getColorStringFromImageDataOffset(imageData, x + WALL_TEXTURE_PADDING + SPRITE_OFFSET, y + WALL_TEXTURE_PADDING);
    }
  }
};
wallTextureSpriteSheetImage.src = WALL_TEXTURE_FILENAME;

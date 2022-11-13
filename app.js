// app.js

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const state = {
  playerX: 0,
  playerY: 0,
  playerDeltaX: 1,
  playerDeltaY: 0,
  playerAngle: 0,
  keys: {}
};

const PLAYER_MOVE_DISTANCE = 5; // pixels
const W_KEY = 87;
const A_KEY = 65;
const S_KEY = 83;
const D_KEY = 68;
const RADS_PER_DEGREE = Math.PI / 180;
const COLORS = {
  LIGHT_RED: '#e50000',
  DARK_RED: '#b20000'
}
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

// Given two points, return the length of the line via c² = a² + b²
const getLineLength = (startX, startY, endX, endY) =>
  Math.sqrt((endX - startX)*(endX - startX) + (endY - startY)*(endY - startY));

const drawMap = () => {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const mapOffset = y * MAP_WIDTH + x;
      const mapValue = MAP[mapOffset];
      // If the map value is 1, we'll use that to indicate a wall, which will be white
      const isWall = mapValue === 1;
      ctx.fillStyle = isWall ? 'white' : 'black';
      // draw a rectangle for the cell, reducing by one pixel on all sides to show a border
      ctx.fillRect(x * MAP_TILE_SIZE + 1, y * MAP_TILE_SIZE + 1, MAP_TILE_SIZE - 2, MAP_TILE_SIZE - 2);
    }
  }
};

const drawPlayer = () => {
  // draw the center of the player as a yellow 8x8 square
  ctx.fillStyle = 'yellow';
  ctx.fillRect(state.playerX - 4, state.playerY - 4, 8, 8);

  // draw the directional vector of the player's rotation
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'yellow';
  ctx.beginPath();
  ctx.moveTo(state.playerX, state.playerY);
  ctx.lineTo(state.playerX + state.playerDeltaX * 25, state.playerY + state.playerDeltaY * 25);
  ctx.stroke();
};

const drawRays = () => {
  let rayAngle = state.playerAngle - 30 * RADS_PER_DEGREE;
  if (rayAngle < 0) {
    rayAngle += Math.PI * 2;
  }
  if (rayAngle > Math.PI * 2) {
    rayAngle -= Math.PI * 2;
  }
  let xOffset, yOffset;
  let horizontalWallRayLength = 999999, verticalWallRayLength = 999999;


  for (let ray = 0; ray < 60; ray++) {
    let depthOfField = 0;

    // Horizontal wall check
    const aTan = -1/Math.tan(rayAngle); // TODO: figure out how this came to be
    const isLookingUp = rayAngle > Math.PI;
    const isLookingDown = rayAngle < Math.PI;
    let horizontalRayY = state.playerY, horizontalRayX = state.playerX;
    if (isLookingUp) {
      horizontalRayY = Math.floor(state.playerY / MAP_TILE_SIZE) * MAP_TILE_SIZE - 0.0001;
      horizontalRayX =  (state.playerY - horizontalRayY) * aTan + state.playerX;
      yOffset = -64;
      xOffset = -yOffset * aTan;
    } else if (isLookingDown) {
      horizontalRayY = (Math.floor(state.playerY / MAP_TILE_SIZE) + 1) * MAP_TILE_SIZE;
      horizontalRayX =  (state.playerY - horizontalRayY) * aTan + state.playerX;
      yOffset = 64;
      xOffset = -yOffset * aTan;
    } else { // looking left or right
      horizontalRayX = state.playerX;
      horizontalRayY = state.playerY;
      depthOfField = 8;
    }
    while (depthOfField < 8) {
      const mapX = Math.floor(horizontalRayX / MAP_TILE_SIZE)
      const mapY = Math.floor(horizontalRayY / MAP_TILE_SIZE)
      const mapOffset = mapY * MAP_WIDTH + mapX;
      const isValidOffset = mapOffset >= 0 && mapOffset < MAP_HEIGHT * MAP_WIDTH;
      const mapCell = isValidOffset ? MAP[mapOffset] : 1;
      const isMapWall = isValidOffset && mapCell > 0;
      if (isMapWall) {
        // stop the loop
        depthOfField = 8;
        horizontalWallRayLength = getLineLength(state.playerX, state.playerY, horizontalRayX, horizontalRayY);
      } else {
        horizontalRayX += xOffset;
        horizontalRayY += yOffset;
        depthOfField += 1;
      }
    }

    // Vertical wall check
    depthOfField = 0;
    const negativeTan = -Math.tan(rayAngle); // TODO: figure out how this came to be
    const isLookingLeft = (rayAngle > Math.PI * 0.5) && (rayAngle < Math.PI * 1.5);
    const isLookingRight = (rayAngle > Math.PI * 1.5) || (rayAngle < Math.PI * 0.5);
    let verticalRayY = state.playerY, verticalRayX = state.playerX;

    if (isLookingLeft) {
      verticalRayX = Math.floor(state.playerX / MAP_TILE_SIZE) * MAP_TILE_SIZE - 0.001;
      verticalRayY =  (state.playerX - verticalRayX) * negativeTan + state.playerY;
      xOffset = -64;
      yOffset = -xOffset * negativeTan;
    } else if (isLookingRight) {
      verticalRayX = (Math.floor(state.playerX / MAP_TILE_SIZE) + 1) * MAP_TILE_SIZE;
      verticalRayY =  (state.playerX - verticalRayX) * negativeTan + state.playerY;
      xOffset = 64;
      yOffset = -xOffset * negativeTan;
    } else { // looking up or down
      verticalRayX = state.playerX;
      verticalRayY = state.playerY;
      depthOfField = 8;
    }
    while (depthOfField < 8) {
      const mapX = Math.floor(verticalRayX / MAP_TILE_SIZE)
      const mapY = Math.floor(verticalRayY / MAP_TILE_SIZE)
      const mapOffset = mapY * MAP_WIDTH + mapX;
      const isValidOffset = mapOffset >= 0 && mapOffset < MAP_HEIGHT * MAP_WIDTH;
      const mapCell = isValidOffset ? MAP[mapOffset] : 1;
      const isMapWall = isValidOffset && mapCell > 0;
      if (isMapWall) {
        // stop the loop
        depthOfField = 8;
        verticalWallRayLength = getLineLength(state.playerX, state.playerY, verticalRayX, verticalRayY);
      } else {
        verticalRayX += xOffset;
        verticalRayY += yOffset;
        depthOfField += 1;
      }
    }

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(state.playerX, state.playerY);
    let rayLength;
    if (verticalWallRayLength < horizontalWallRayLength) {
      ctx.strokeStyle = COLORS.LIGHT_RED;
      ctx.lineTo(verticalRayX, verticalRayY);
      rayLength = verticalWallRayLength;
    } else {
      ctx.strokeStyle = COLORS.DARK_RED;
      ctx.lineTo(horizontalRayX, horizontalRayY);
      rayLength = horizontalWallRayLength;
    }  
    ctx.stroke();

    // draw 3d walls in (320x160) viewport
    let cosineBetweenPlayerAndRay = state.playerAngle - rayAngle;
    if (cosineBetweenPlayerAndRay > Math.PI * 2) {
      cosineBetweenPlayerAndRay -= Math.PI * 2;
    } else if (cosineBetweenPlayerAndRay < 0) {
      cosineBetweenPlayerAndRay += Math.PI * 2;
    }
    const rayDistance = rayLength * Math.cos(cosineBetweenPlayerAndRay); // fixes fish-eye
    let lineHeight = MAP_TILE_SIZE * 320 / rayDistance;
    const lineOffset = 160 - lineHeight / 2;
    if (lineHeight > 320) {
      lineHeight = 320;
    }
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(ray * 8 + 530, lineOffset); 
    ctx.lineTo(ray * 8 + 530, lineOffset + lineHeight);
    ctx.stroke(); 

    // Increment angle for next ray iteration
    rayAngle += RADS_PER_DEGREE;
    if (rayAngle < 0) {
      rayAngle += Math.PI * 2;
    }
    if (rayAngle > Math.PI * 2) {
      rayAngle -= Math.PI * 2;
    }
  
  }
};

const draw = () => {
  // clear background
  ctx.fillStyle = '#4c4c4c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMap();
  drawPlayer();
  drawRays();
};

const update = (tick) => {
  if (state.keys[W_KEY]) {
    state.playerX += state.playerDeltaX;
    state.playerY += state.playerDeltaY;
  }
  if (state.keys[S_KEY]) {
    state.playerX -= state.playerDeltaX;
    state.playerY -= state.playerDeltaY;
  }
  const isPlayerRotating = state.keys[A_KEY] || state.keys[D_KEY];
  if (isPlayerRotating) {
    const angleDelta = 0.01; // change of angle in radians
    if (state.keys[A_KEY]) {
      state.playerAngle -= angleDelta;
      // bounds check; ensure angle is always between 0 and 2*PI
      if (state.playerAngle < 0) {
        state.playerAngle += Math.PI * 2
      }
      state.playerDeltaX = Math.cos(state.playerAngle);
      state.playerDeltaY = Math.sin(state.playerAngle);
    }
    if (state.keys[D_KEY]) {
      state.playerAngle += angleDelta;
      // bounds check; ensure angle is always between 0 and 2*PI
      if (state.playerAngle > Math.PI * 2) {
        state.playerAngle -= Math.PI * 2
      }
      state.playerDeltaX = Math.cos(state.playerAngle);
      state.playerDeltaY = Math.sin(state.playerAngle);
    }
  }
};

const loop = (tick) => {
  update(tick);
  draw(tick);
  requestAnimationFrame(loop);
};

const onKeyUp = (event) => {
  delete state.keys[event.which];
}
const onKeyDown = (event) => {
  state.keys[event.which] = true;
}

(function init(){
  console.log('Ray Casting');
  state.playerX = 300;
  state.playerY = 300;
  state.playerAngle = -0.8;
  state.playerDeltaX = Math.cos(state.playerAngle);
  state.playerDeltaY = Math.sin(state.playerAngle);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  requestAnimationFrame(loop);
})();
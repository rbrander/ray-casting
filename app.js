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
  const NUM_RAYS = 60;
  const NUM_RAYS_PER_SIDE = NUM_RAYS / 2;
  let rayAngle = clamp(state.playerAngle - NUM_RAYS_PER_SIDE * RADS_PER_DEGREE, MIN_ANGLE, MAX_ANGLE);
  let xOffset, yOffset;
  let horizontalWallRayLength = 999999, verticalWallRayLength = 999999;


  for (let ray = 0; ray < NUM_RAYS; ray++) {
    horizontalWallRayLength = 999999, verticalWallRayLength = 999999
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

    // draw 3d walls in (320x320) viewport
    const VIEWPORT_WIDTH = 320;
    const VIEWPORT_HEIGHT = 320;
    let cosineBetweenPlayerAndRay = clamp(state.playerAngle - rayAngle, MIN_ANGLE, MAX_ANGLE);
    const rayDistance = rayLength * Math.cos(cosineBetweenPlayerAndRay); // fixes fish-eye
    let lineHeight = MAP_TILE_SIZE * VIEWPORT_WIDTH / rayDistance;
    const lineOffset = (VIEWPORT_HEIGHT / 2) - lineHeight / 2;

    const buffer = 18; // px between left and right sides
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(ray * ctx.lineWidth + (canvas.width / 2) + buffer, lineOffset);
    ctx.lineTo(ray * ctx.lineWidth + (canvas.width / 2) + buffer, lineOffset + lineHeight);
    ctx.stroke();

    // Increment angle for next ray iteration
    rayAngle = clamp(rayAngle + RADS_PER_DEGREE, MIN_ANGLE, MAX_ANGLE);
  }
};

const drawKeyPresses = () => {
  const keyString = Object.keys(KEY_MAP)
    .reduce((keyString, key) =>
      state.keys[key] ? `${keyString} ${KEY_MAP[key]}`.trim() : keyString
    , '');

  if (keyString === '') {
    return;
  }

  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(keyString, 520, 5);
};

const draw = () => {
  // clear background
  ctx.fillStyle = '#4c4c4c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMap();
  drawPlayer();
  drawRays();
  drawKeyPresses();
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

  // Handle the lateral movement of the player
  const isPlayerMovingLeft = state.keys[A_KEY];
  const isPlayerMovingRight = state.keys[D_KEY];
  if (isPlayerMovingLeft || isPlayerMovingRight) {
    const isStrafing = state.keys[SHIFT_KEY];
    const HALF_PI = Math.PI / 2;
    const angleLeft = state.playerAngle - HALF_PI; // Player angle rotated 90° to the left, for strafing
    if (isPlayerMovingLeft) {
      if (isStrafing) {
        state.playerX += Math.cos(angleLeft);
        state.playerY += Math.sin(angleLeft);
      } else {
        // player is rotating
        state.playerAngle = clamp(state.playerAngle - PLAYER_ROTATION_DELTA, MIN_ANGLE, MAX_ANGLE);
        state.playerDeltaX = Math.cos(state.playerAngle);
        state.playerDeltaY = Math.sin(state.playerAngle);
      }
    }
    if (isPlayerMovingRight) {
      if (isStrafing) {
        state.playerX -= Math.cos(angleLeft);
        state.playerY -= Math.sin(angleLeft);
      } else {
        state.playerAngle = clamp(state.playerAngle + PLAYER_ROTATION_DELTA, MIN_ANGLE, MAX_ANGLE);
        state.playerDeltaX = Math.cos(state.playerAngle);
        state.playerDeltaY = Math.sin(state.playerAngle);
      }
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
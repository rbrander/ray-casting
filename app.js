// app.js

// TODO
// - add scaling
// - optionally display 2d view
// - higher resolution (8px lines down to 4px, compensate using twice the number of rays)

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const chkShowTexture = document.getElementById('chkShowTexture');

const state = {
  playerX: 0,
  playerY: 0,
  playerDeltaX: 1,
  playerDeltaY: 0,
  playerAngle: 0,
  keys: {},
  lastTick: 0,
  FPS: 0
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

const drawText = (text, x = 520, y = 10, align = 'left') => {
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'top';
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

const drawRays = () => {
  const NUM_RAYS = 60;
  const NUM_RAYS_PER_SIDE = Math.floor(NUM_RAYS / 2);
  let rayAngle = limitAngleRange(state.playerAngle - NUM_RAYS_PER_SIDE * RADS_PER_DEGREE);
  let xOffset, yOffset;
  let horizontalWallRayLength = 999999, verticalWallRayLength = 999999;

  // draw background
  ctx.fillStyle = '#444444';
  ctx.fillRect(528, 0, 512-32-2, 160);
  ctx.fillStyle = '#777777';
  ctx.fillRect(528, 160, 512-32-2, 512-160);


  for (let ray = 0; ray < NUM_RAYS; ray++) {
    const shouldDrawRay = ray === Math.floor(NUM_RAYS / 2);
    horizontalWallRayLength = 999999, verticalWallRayLength = 999999
    let depthOfField = 0;

    // Horizontal wall check
    const aTan = -1/Math.tan(rayAngle); // TODO: figure out how this came to be
    const isLookingUp = rayAngle > Math.PI;
    const isLookingDown = rayAngle < Math.PI;
    let horizontalRayY = state.playerY, horizontalRayX = state.playerX;
    if (isLookingUp) {
      horizontalRayY = Math.floor(state.playerY / MAP_TILE_SIZE) * MAP_TILE_SIZE - 0.0001;
      horizontalRayX = (state.playerY - horizontalRayY) * aTan + state.playerX;
      yOffset = -MAP_TILE_SIZE;
      xOffset = -yOffset * aTan;
    } else if (isLookingDown) {
      horizontalRayY = (Math.floor(state.playerY / MAP_TILE_SIZE) + 1) * MAP_TILE_SIZE;
      horizontalRayX =  (state.playerY - horizontalRayY) * aTan + state.playerX;
      yOffset = MAP_TILE_SIZE;
      xOffset = -yOffset * aTan;
    } else { // looking left or right
      horizontalRayX = state.playerX;
      horizontalRayY = state.playerY;
      depthOfField = 8;
    }
    while (depthOfField < 8) {
      // draw a dot at the point of intersection
      if (shouldDrawRay) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(horizontalRayX, horizontalRayY, 5, MIN_ANGLE, MAX_ANGLE);
        ctx.fill();
      }

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

        if (shouldDrawRay) {
          // fill the box for the wall that was hit
          ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
          ctx.fillRect(mapX * MAP_TILE_SIZE, mapY * MAP_TILE_SIZE, MAP_TILE_SIZE, MAP_TILE_SIZE);
        }
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
      xOffset = -MAP_TILE_SIZE;
      yOffset = -xOffset * negativeTan;
    } else if (isLookingRight) {
      verticalRayX = (Math.floor(state.playerX / MAP_TILE_SIZE) + 1) * MAP_TILE_SIZE;
      verticalRayY =  (state.playerX - verticalRayX) * negativeTan + state.playerY;
      xOffset = MAP_TILE_SIZE;
      yOffset = -xOffset * negativeTan;
    } else { // looking up or down
      verticalRayX = state.playerX;
      verticalRayY = state.playerY;
      depthOfField = 8;
    }
    while (depthOfField < 8) {
      // draw a dot at the point of intersection
      if (shouldDrawRay) {
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(verticalRayX, verticalRayY, 5, MIN_ANGLE, MAX_ANGLE);
        ctx.fill();
      }

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

        if (shouldDrawRay) {
          // colour the wall green, that was hit
          ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
          ctx.fillRect(mapX * MAP_TILE_SIZE, mapY * MAP_TILE_SIZE, MAP_TILE_SIZE, MAP_TILE_SIZE);
        }
      } else {
        verticalRayX += xOffset;
        verticalRayY += yOffset;
        depthOfField += 1;
      }
    }

    // draw the ray line from player to where it collides in the wall
    const isVerticalWall = (verticalWallRayLength < horizontalWallRayLength);
    const rayLength = isVerticalWall ? verticalWallRayLength : horizontalWallRayLength;
    if (shouldDrawRay) {
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(state.playerX, state.playerY);
      ctx.strokeStyle = isVerticalWall ? COLORS.LIGHT_RED : COLORS.DARK_RED;
      if (isVerticalWall) {
        ctx.lineTo(verticalRayX, verticalRayY);
      } else {
        ctx.lineTo(horizontalRayX, horizontalRayY);
      }
      ctx.stroke();
    }

    // draw 3D walls in (320x320) viewport
    const VIEWPORT_WIDTH = 320;
    const VIEWPORT_HEIGHT = 320;
    let cosineBetweenPlayerAndRay = limitAngleRange(state.playerAngle - rayAngle);
    const rayDistance = rayLength * Math.cos(cosineBetweenPlayerAndRay); // fixes fish-eye
    let lineHeight = MAP_TILE_SIZE * VIEWPORT_WIDTH / rayDistance;
    const buffer = 18; // px between left (2d map) and right (3d view) sides of the canvas
    const lineWidth = 8; // pixels
    const lineXOffset = ray * lineWidth + (canvas.width / 2) + buffer;
    const lineYOffset = (VIEWPORT_HEIGHT / 2) - lineHeight / 2;

    ctx.lineWidth = lineWidth;
    if (chkShowTexture.checked) {
      // divide the legnth of the vertical line by the sprite size to
      // determine how large a line segment of that sprite pixel's value colour is
      // drawn; known as the chunk
      const chunkLength = lineHeight / WALL_TEXTURE_SIZE;
      const numLineChunks = WALL_TEXTURE_SIZE; // each pixel may have a different colour, so each chunk needs to equal to one sprite pixel
      const wall = isVerticalWall ? STONE_WALL.Vertical : STONE_WALL.Horizontal;
      for (let lineChunk = 0; lineChunk < numLineChunks - 1; lineChunk++) {
        const xRaySource = isVerticalWall ? verticalRayY : horizontalRayX;
        const x = Math.floor(((xRaySource % MAP_TILE_SIZE) / MAP_TILE_SIZE) * WALL_TEXTURE_SIZE);
        const y = lineChunk;

        ctx.strokeStyle = wall[x][y];
        ctx.beginPath();
        ctx.moveTo(lineXOffset, lineYOffset + lineChunk * chunkLength);
        ctx.lineTo(lineXOffset, lineYOffset + (lineChunk + 1) * chunkLength);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = isVerticalWall ? COLORS.LIGHT_RED : COLORS.DARK_RED;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(ray * ctx.lineWidth + (canvas.width / 2) + buffer, lineYOffset);
      ctx.lineTo(ray * ctx.lineWidth + (canvas.width / 2) + buffer, lineYOffset + lineHeight);
      ctx.stroke();
    }

    // Increment angle for next ray iteration
    rayAngle = limitAngleRange(rayAngle + RADS_PER_DEGREE);
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

  drawText(keyString, 520, 5, 'left');
};

const drawFPS = () => {
  // show the frames per second in the upper right corner
  drawText(`${state.fps.toString()} FPS`, canvas.width - 8, 8, 'right');
}

const draw = () => {
  // clear background
  ctx.fillStyle = '#4c4c4c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMap();
  drawPlayer();
  drawRays();
  drawKeyPresses();
  drawFPS();
};

const update = (tick) => {
  const frameRateAdjustment = state.fps / 100; // a factor applied to movemet to make it consistent
  if (state.keys[W_KEY]) {
    state.playerX += state.playerDeltaX * frameRateAdjustment;
    state.playerY += state.playerDeltaY * frameRateAdjustment;
  }
  if (state.keys[S_KEY]) {
    state.playerX -= state.playerDeltaX * frameRateAdjustment;
    state.playerY -= state.playerDeltaY * frameRateAdjustment;
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
        state.playerX += Math.cos(angleLeft) * frameRateAdjustment;
        state.playerY += Math.sin(angleLeft) * frameRateAdjustment;
      } else {
        // player is rotating
        state.playerAngle = limitAngleRange(state.playerAngle - PLAYER_ROTATION_DELTA * frameRateAdjustment);
        state.playerDeltaX = Math.cos(state.playerAngle) * frameRateAdjustment;
        state.playerDeltaY = Math.sin(state.playerAngle) * frameRateAdjustment;
      }
    }
    if (isPlayerMovingRight) {
      if (isStrafing) {
        state.playerX -= Math.cos(angleLeft) * frameRateAdjustment;
        state.playerY -= Math.sin(angleLeft) * frameRateAdjustment;
      } else {
        state.playerAngle = limitAngleRange(state.playerAngle + PLAYER_ROTATION_DELTA * frameRateAdjustment);
        state.playerDeltaX = Math.cos(state.playerAngle) * frameRateAdjustment;
        state.playerDeltaY = Math.sin(state.playerAngle) * frameRateAdjustment;
      }
    }
  }
};

const loop = (tick) => {
  state.fps = Math.floor(MS_PER_SECOND/(tick - state.lastTick));
  update(tick);
  draw(tick);
  requestAnimationFrame(loop);
  state.lastTick = tick;
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
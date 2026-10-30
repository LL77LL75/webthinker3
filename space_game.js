const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const FLOOR_Y = 490;
const STAGE_WIDTH = 1800;
const PLAYER_SPEED = 2.7;
const PLAYER_JUMP = 16;
const PLAYER_MAX_HEALTH = 5;
const LEVELS = [
  { name: "Moonlit Run", boss: "The Comet Crab", color: "#fb7185", health: 8 },
  { name: "Neon Nebula", boss: "The Prism Warden", color: "#c084fc", health: 10 },
  { name: "Solar Frontier", boss: "The Starforged Colossus", color: "#facc15", health: 12 }
];

let player;
let platforms = [];
let playerFacing = 1;
let jumpBuffer = 0;
let coyoteFrames = 0;
let enemies = [];
let playerShots = [];
let enemyShots = [];
let stars = [];
let gameState = "title";
let currentLevel = 0;
let playerHealth = PLAYER_MAX_HEALTH;
let bossesDefeated = 0;
let stageOrigin = 0;
let waveIndex = 0;
let boss = null;
let lastPlayerShot = 0;
let lastDamageAt = -1000;
let lastBossShot = 0;
let stateChangedAt = 0;

function setup() {
  new Canvas(GAME_WIDTH, GAME_HEIGHT);
  world.gravity.y = 18;
  camera.x = GAME_WIDTH / 2;
  camera.y = GAME_HEIGHT / 2;

  player = new Sprite(100, FLOOR_Y - 25, 34, 42);
  player.color = "#55e6c1";
  player.stroke = "#eafff8";
  player.collider = "dynamic";
  player.friction = 0;
  player.bounciness = 0;

  createStagePlatforms();

  for (let index = 0; index < 90; index += 1) {
    stars.push({
      x: random(GAME_WIDTH),
      y: random(15, FLOOR_Y - 50),
      size: random(1, 3),
      shade: random(130, 255)
    });
  }
}

function draw() {
  camera.x = gameState === "title" ? GAME_WIDTH / 2 : player.x;
  camera.y = GAME_HEIGHT / 2;
  background("#080f20");
  drawStars();

  if (gameState === "title") {
    drawTitleScreen();
    return;
  }

  if (gameState === "playing") updateGame();
  if (gameState === "level-clear" && frameCount - stateChangedAt > 110) advanceLevel();

  drawHud();

  if (gameState === "level-clear") {
    drawMessage("BOSS DEFEATED", `${LEVELS[currentLevel].boss} is down!`);
  } else if (gameState === "won") {
    drawMessage("GALAXY SAVED!", `You defeated all ${bossesDefeated} bosses. Press R to play again.`);
  } else if (gameState === "lost") {
    drawMessage("MISSION OVER", `You defeated ${bossesDefeated} boss${bossesDefeated === 1 ? "" : "es"}. Press R to retry.`);
  }
}

function updateGame() {
  const movingLeft = kb.pressing("a");
  const movingRight = kb.pressing("d");
  player.vel.x = (Number(movingRight) - Number(movingLeft)) * PLAYER_SPEED;
  if (movingLeft) playerFacing = -1;
  if (movingRight) playerFacing = 1;
  player.x = Math.max(player.x, stageOrigin + player.w / 2);

  if (kb.presses("w") || kb.presses("space")) jumpBuffer = 8;
  else jumpBuffer = Math.max(0, jumpBuffer - 1);
  const playerBottom = player.y + player.h / 2;
  const grounded = player.vel.y >= -1 && platforms.some((platform) => {
    const platformTop = platform.y - platform.h / 2;
    const overlapsHorizontally = player.x + player.w / 2 > platform.x - platform.w / 2 &&
      player.x - player.w / 2 < platform.x + platform.w / 2;
    return overlapsHorizontally && playerBottom >= platformTop - 4 && playerBottom <= platformTop + 9;
  });
  coyoteFrames = grounded ? 8 : Math.max(0, coyoteFrames - 1);
  if (jumpBuffer > 0 && coyoteFrames > 0) {
    player.vel.y = -PLAYER_JUMP;
    jumpBuffer = 0;
    coyoteFrames = 0;
  }

  if ((kb.pressing("j") || kb.pressing("x")) && frameCount - lastPlayerShot > 15) {
    firePlayerShot();
  }

  const localX = player.x - stageOrigin;
  const waveMarkers = [360, 760, 1110];
  while (waveIndex < waveMarkers.length && localX > waveMarkers[waveIndex]) {
    spawnEnemy(stageOrigin + waveMarkers[waveIndex] + 70, waveIndex);
    spawnEnemy(stageOrigin + waveMarkers[waveIndex] + 140, waveIndex + 1);
    waveIndex += 1;
  }

  const bossX = stageOrigin + 1510;
  if (!boss && localX >= 1330) spawnBoss(bossX);
  if (boss && boss.gameHealth > 0) {
    player.x = Math.min(player.x, boss.x - 72);
    updateBoss();
  }

  updateEnemies();
  updateShots();
  if (player.y > GAME_HEIGHT + 80) respawnPlayer();
  if (playerHealth <= 0) setGameState("lost");
}

function createStagePlatforms() {
  const floorSegments = [[0, 460], [560, 1020], [1120, STAGE_WIDTH]];
  for (const [left, right] of floorSegments) {
    const floorSegment = new Sprite(stageOrigin + (left + right) / 2, FLOOR_Y + 50, right - left, 100);
    floorSegment.color = "#254d59";
    floorSegment.stroke = "#6ee7c8";
    floorSegment.collider = "static";
    platforms.push(floorSegment);
  }

  const raisedPlatforms = [
    { x: 300, y: 405, width: 150 },
    { x: 520, y: 355, width: 130 },
    { x: 790, y: 390, width: 170 },
    { x: 1060, y: 350, width: 140 },
    { x: 1330, y: 405, width: 160 }
  ];
  for (const layout of raisedPlatforms) {
    const platform = new Sprite(stageOrigin + layout.x, layout.y, layout.width, 18);
    platform.color = "#397982";
    platform.stroke = "#8de4d1";
    platform.collider = "static";
    platforms.push(platform);
  }
}

function respawnPlayer() {
  player.x = stageOrigin + 90;
  player.y = FLOOR_Y - player.h / 2 - 2;
  player.vel.x = 0;
  player.vel.y = 0;
  jumpBuffer = 0;
  coyoteFrames = 0;
  playerFacing = 1;
}

function drawStars() {
  const cameraLeft = camera.x - GAME_WIDTH / 2;
  noStroke();
  for (const star of stars) {
    const starX = cameraLeft + ((star.x - camera.x * 0.14) % GAME_WIDTH + GAME_WIDTH) % GAME_WIDTH;
    fill(star.shade, star.shade, 255, 190);
    circle(starX, star.y, star.size);
  }
}

function drawTitleScreen() {
  drawMessage("STARBOUND SPRINT", "Move: A / D     Jump: W / Space\nHold J or X to fire. Press Enter or Space to launch.");
  if (kb.presses("enter") || kb.presses("space") || mouse.presses("left")) startGame();
}

function drawHud() {
  const left = 22;
  noStroke();
  fill("#07101ddd");
  rect(left, 18, 310, 78, 8);
  fill("#f5f7ff");
  textAlign(LEFT, TOP);
  textSize(16);
  text(`LEVEL ${currentLevel + 1}: ${LEVELS[currentLevel].name}`, left + 14, 28);
  textSize(13);
  fill("#a7f3d0");
  text(`HEALTH ${"♥".repeat(Math.max(0, playerHealth))}${"·".repeat(PLAYER_MAX_HEALTH - Math.max(0, playerHealth))}`, left + 14, 55);
  text(`BOSSES ${bossesDefeated}/${LEVELS.length}`, left + 14, 75);

  if (boss && boss.gameHealth > 0) {
    const barWidth = 250;
    const barX = GAME_WIDTH - barWidth - 25;
    const barY = 36;
    fill("#07101ddd");
    rect(barX - 10, 18, barWidth + 20, 54, 8);
    fill("#f5f7ff");
    textAlign(LEFT, TOP);
    textSize(13);
    text(LEVELS[currentLevel].boss, barX, barY - 5);
    fill("#263649");
    rect(barX, barY + 17, barWidth, 12, 4);
    fill(LEVELS[currentLevel].color);
    rect(barX, barY + 17, barWidth * (boss.gameHealth / boss.gameMaxHealth), 12, 4);
  }
}

function drawMessage(title, detail) {
  const panelX = GAME_WIDTH / 2 - 300;
  const panelY = GAME_HEIGHT / 2 - 100;
  noStroke();
  fill("#07101df2");
  rect(panelX, panelY, 600, 200, 12);
  fill("#55e6c1");
  textAlign(CENTER, CENTER);
  textSize(30);
  text(title, GAME_WIDTH / 2, panelY + 54);
  fill("#f5f7ff");
  textSize(16);
  text(detail, GAME_WIDTH / 2, panelY + 120, 540, 76);
}

function firePlayerShot() {
  const projectile = new Sprite(
    player.x + playerFacing * (player.w / 2 + 8),
    player.y,
    14,
    10,
    "none"
  );
  projectile.color = "#a7f3d0";
  projectile.stroke = "#eafff8";
  playerShots.push({ projectileSprite: projectile, velocityX: 9 * playerFacing, damage: 1 });
  lastPlayerShot = frameCount;
}

function spawnEnemy(x, variant) {
  const gameType = ["ground", "flyer", "shooter"][variant % 3];
  const startY = gameType === "flyer" ? FLOOR_Y - 145 : FLOOR_Y - 23;
  const enemy = new Sprite(x, startY, 38, 38);
  enemy.collider = "none";
  enemy.color = gameType === "flyer" ? "#38bdf8" : gameType === "shooter" ? "#f59e0b" : "#fb7185";
  enemy.stroke = "#ffe4d6";
  enemy.gameHealth = gameType === "shooter" ? 3 : 2;
  enemy.gameSpeed = 0.8;
  enemy.gameType = gameType;
  enemy.gameSpawnY = startY;
  enemy.gameBaseColor = gameType === "flyer" ? "#38bdf8" : gameType === "shooter" ? "#f59e0b" : "#fb7185";
  enemy.gameHitAt = -1000;
  enemy.gameLastShotAt = frameCount;
  enemies.push(enemy);
}

function spawnBoss(x) {
  boss = new Sprite(x, FLOOR_Y - 48, 88, 88);
  boss.collider = "none";
  boss.color = LEVELS[currentLevel].color;
  boss.stroke = "#fff7ed";
  boss.gameHealth = LEVELS[currentLevel].health;
  boss.gameMaxHealth = LEVELS[currentLevel].health;
  lastBossShot = frameCount;
}

function updateEnemies() {
  for (let index = enemies.length - 1; index >= 0; index -= 1) {
    const enemy = enemies[index];
    const direction = player.x < enemy.x ? -1 : 1;
    const distanceToPlayer = Math.abs(player.x - enemy.x);
    if (enemy.gameType === "shooter") {
      if (distanceToPlayer > 230) enemy.x += direction * enemy.gameSpeed;
      enemy.y = enemy.gameSpawnY + Math.sin(frameCount * 0.035 + enemy.x) * 8;
      if (frameCount - enemy.gameLastShotAt > 100 && distanceToPlayer < 620) {
        fireEnemyShot(enemy.x, enemy.y, player.x, player.y, 3.2);
        enemy.gameLastShotAt = frameCount;
      }
    } else {
      enemy.x += direction * enemy.gameSpeed;
      if (enemy.gameType === "flyer") {
        enemy.y = enemy.gameSpawnY + Math.sin(frameCount * 0.05 + enemy.x * 0.02) * 34;
      }
    }
    enemy.color = frameCount - enemy.gameHitAt < 7 ? "#ffffff" : enemy.gameBaseColor;
    if (distanceToPlayer < 38 && Math.abs(player.y - enemy.y) < 45) damagePlayer();
    if (enemy.gameHealth <= 0 || enemy.x < stageOrigin - 80) {
      enemy.remove();
      enemies.splice(index, 1);
    }
  }
}

function updateBoss() {
  boss.y = FLOOR_Y - 48 + Math.sin(frameCount * 0.045) * 10;
  if (frameCount - lastBossShot > 75) {
    fireEnemyShot(boss.x - 45, boss.y + 8, player.x, player.y, 4.1);
    lastBossShot = frameCount;
  }
  if (Math.abs(player.x - boss.x) < 72 && Math.abs(player.y - boss.y) < 75) damagePlayer();
  if (boss.gameHealth <= 0) {
    boss.remove();
    boss = null;
    bossesDefeated += 1;
    playerHealth = Math.min(PLAYER_MAX_HEALTH, playerHealth + 1);
    setGameState("level-clear");
  }
}

function fireEnemyShot(startX, startY, targetX, targetY, speed) {
  const directionX = targetX - startX;
  const directionY = targetY - startY;
  const distance = Math.hypot(directionX, directionY) || 1;
  const projectile = new Sprite(startX, startY, 14, 10, "none");
  projectile.color = "#fb7185";
  projectile.stroke = "#ffe4e6";
  enemyShots.push({
    projectileSprite: projectile,
    velocityX: (directionX / distance) * speed,
    velocityY: (directionY / distance) * speed
  });
}

function updateShots() {
  for (let index = playerShots.length - 1; index >= 0; index -= 1) {
    const shot = playerShots[index];
    const projectile = shot.projectileSprite;
    projectile.x += shot.velocityX;
    let hit = false;
    for (const enemy of enemies) {
      if (Math.abs(projectile.x - enemy.x) < enemy.w / 2 && Math.abs(projectile.y - enemy.y) < enemy.h / 2) {
        enemy.gameHealth -= shot.damage;
        enemy.gameHitAt = frameCount;
        hit = true;
        break;
      }
    }
    if (!hit && boss && Math.abs(projectile.x - boss.x) < boss.w / 2 && Math.abs(projectile.y - boss.y) < boss.h / 2) {
      boss.gameHealth -= shot.damage;
      hit = true;
    }
    if (hit || projectile.x < stageOrigin - 40 || projectile.x > stageOrigin + STAGE_WIDTH) {
      projectile.remove();
      playerShots.splice(index, 1);
    }
  }

  for (let index = enemyShots.length - 1; index >= 0; index -= 1) {
    const shot = enemyShots[index];
    const projectile = shot.projectileSprite;
    projectile.x += shot.velocityX;
    projectile.y += shot.velocityY;
    if (Math.abs(projectile.x - player.x) < 22 && Math.abs(projectile.y - player.y) < 27) {
      damagePlayer();
      projectile.remove();
      enemyShots.splice(index, 1);
    } else if (projectile.x < stageOrigin - 40 || projectile.x > stageOrigin + STAGE_WIDTH + 40 || projectile.y < 0 || projectile.y > GAME_HEIGHT) {
      projectile.remove();
      enemyShots.splice(index, 1);
    }
  }
}

function damagePlayer() {
  if (frameCount - lastDamageAt < 55 || gameState !== "playing") return;
  playerHealth -= 1;
  lastDamageAt = frameCount;
  player.vel.y = -4;
}

function startGame() {
  currentLevel = 0;
  bossesDefeated = 0;
  playerHealth = PLAYER_MAX_HEALTH;
  stageOrigin = 0;
  resetStage();
  setGameState("playing");
}

function advanceLevel() {
  if (currentLevel === LEVELS.length - 1) {
    setGameState("won");
    return;
  }
  currentLevel += 1;
  stageOrigin = currentLevel * STAGE_WIDTH;
  resetStage();
  setGameState("playing");
}

function resetStage() {
  for (const enemy of enemies) enemy.remove();
  enemies = [];
  for (const platform of platforms) platform.remove();
  platforms = [];
  for (const shot of playerShots) shot.projectileSprite.remove();
  for (const shot of enemyShots) shot.projectileSprite.remove();
  playerShots = [];
  enemyShots = [];
  if (boss) boss.remove();
  boss = null;
  waveIndex = 0;
  createStagePlatforms();
  respawnPlayer();
}

function setGameState(nextState) {
  gameState = nextState;
  stateChangedAt = frameCount;
  if (nextState === "lost" || nextState === "won") player.vel.x = 0;
}

function keyPressed() {
  if ((gameState === "lost" || gameState === "won") && key.toLowerCase() === "r") startGame();
}
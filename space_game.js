const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const FLOOR_Y = 490;
const STAGE_WIDTH = 1800;
const PLAYER_SPEED = 5;
const PLAYER_JUMP = 11;
const PLAYER_MAX_HEALTH = 5;
const LEVELS = [
  { name: "Moonlit Run", boss: "The Comet Crab", color: "#fb7185", health: 8 },
  { name: "Neon Nebula", boss: "The Prism Warden", color: "#c084fc", health: 10 },
  { name: "Solar Frontier", boss: "The Starforged Colossus", color: "#facc15", health: 12 }
];

let player;
let ground;
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
  world.gravity.y = 22;
  camera.x = GAME_WIDTH / 2;
  camera.y = GAME_HEIGHT / 2;

  player = new Sprite(100, FLOOR_Y - 25, 34, 42);
  player.color = "#55e6c1";
  player.stroke = "#eafff8";
  player.collider = "dynamic";
  player.friction = 0;
  player.bounciness = 0;

  ground = new Sprite(STAGE_WIDTH / 2, FLOOR_Y + 38, STAGE_WIDTH, 100);
  ground.color = "#254d59";
  ground.stroke = "#6ee7c8";
  ground.collider = "static";

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

  drawProjectiles();
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

  const floorTop = FLOOR_Y;
  const onFloor = player.y >= floorTop - player.h / 2 - 3 && Math.abs(player.vel.y) < 2;
  if ((kb.presses("w") || kb.presses("space")) && onFloor) {
    player.vel.y = -PLAYER_JUMP;
  }

  if (kb.pressing("j") && frameCount - lastPlayerShot > 12) {
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
  if (playerHealth <= 0) setGameState("lost");
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
  drawMessage("STARBOUND SPRINT", "Move: A / D     Jump: W / Space     Fire: J\nPress Enter or Space to launch");
  if (kb.presses("enter") || kb.presses("space") || mouse.presses("left")) startGame();
}

function drawHud() {
  const left = camera.x - GAME_WIDTH / 2 + 22;
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
    const barX = camera.x + GAME_WIDTH / 2 - barWidth - 25;
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

function drawProjectiles() {
  noStroke();
  for (const shot of playerShots) {
    fill("#a7f3d0");
    circle(shot.x, shot.y, 10);
  }
  for (const shot of enemyShots) {
    fill("#fb7185");
    circle(shot.x, shot.y, 12);
  }
}

function drawMessage(title, detail) {
  const panelX = camera.x - 300;
  const panelY = GAME_HEIGHT / 2 - 100;
  noStroke();
  fill("#07101df2");
  rect(panelX, panelY, 600, 200, 12);
  fill("#55e6c1");
  textAlign(CENTER, CENTER);
  textSize(30);
  text(title, camera.x, panelY + 54);
  fill("#f5f7ff");
  textSize(16);
  text(detail, camera.x, panelY + 120, 540, 76);
}

function firePlayerShot() {
  playerShots.push({ x: player.x + 25, y: player.y - 3, velocity: 10, damage: 1 });
  lastPlayerShot = frameCount;
}

function spawnEnemy(x, variant) {
  const enemy = new Sprite(x, FLOOR_Y - 23, 38, 38);
  enemy.collider = "none";
  enemy.color = variant % 2 === 0 ? "#fb7185" : "#f97316";
  enemy.stroke = "#ffe4d6";
  enemy.gameHealth = 2;
  enemy.gameSpeed = 1.15 + (variant % 2) * 0.25;
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
    enemy.x += direction * enemy.gameSpeed;
    if (Math.abs(player.x - enemy.x) < 38 && Math.abs(player.y - enemy.y) < 45) damagePlayer();
    if (enemy.gameHealth <= 0 || enemy.x < stageOrigin - 80) {
      enemy.remove();
      enemies.splice(index, 1);
    }
  }
}

function updateBoss() {
  boss.y = FLOOR_Y - 48 + Math.sin(frameCount * 0.045) * 10;
  if (frameCount - lastBossShot > 75) {
    enemyShots.push({ x: boss.x - 52, y: boss.y + 8, velocity: -5.2, size: 12 });
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

function updateShots() {
  for (let index = playerShots.length - 1; index >= 0; index -= 1) {
    const shot = playerShots[index];
    shot.x += shot.velocity;
    let hit = false;
    for (const enemy of enemies) {
      if (Math.abs(shot.x - enemy.x) < enemy.w / 2 && Math.abs(shot.y - enemy.y) < enemy.h / 2) {
        enemy.gameHealth -= shot.damage;
        hit = true;
        break;
      }
    }
    if (!hit && boss && Math.abs(shot.x - boss.x) < boss.w / 2 && Math.abs(shot.y - boss.y) < boss.h / 2) {
      boss.gameHealth -= shot.damage;
      hit = true;
    }
    if (hit || shot.x > stageOrigin + STAGE_WIDTH) playerShots.splice(index, 1);
  }

  for (let index = enemyShots.length - 1; index >= 0; index -= 1) {
    const shot = enemyShots[index];
    shot.x += shot.velocity;
    if (Math.abs(shot.x - player.x) < 22 && Math.abs(shot.y - player.y) < 27) {
      damagePlayer();
      enemyShots.splice(index, 1);
    } else if (shot.x < stageOrigin - 40) {
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
  playerShots = [];
  enemyShots = [];
  if (boss) boss.remove();
  boss = null;
  waveIndex = 0;
  player.x = stageOrigin + 90;
  player.y = FLOOR_Y - player.h / 2 - 2;
  player.vel.x = 0;
  player.vel.y = 0;
  ground.x = stageOrigin + STAGE_WIDTH / 2;
}

function setGameState(nextState) {
  gameState = nextState;
  stateChangedAt = frameCount;
  if (nextState === "lost" || nextState === "won") player.vel.x = 0;
}

function keyPressed() {
  if ((gameState === "lost" || gameState === "won") && key.toLowerCase() === "r") startGame();
}
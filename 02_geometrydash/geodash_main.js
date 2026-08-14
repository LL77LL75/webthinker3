// const { startTransition } = require("react");

//player player
let particles;
let startSprite;
let endSprite;
let startGameImg;
let endGameImg;
let startGame= false;
let gameOver = false;
let endTimer = 0;
let spikes;
let orbs;
let tilemap1
let mapused;
let player; // player sprite
 // player sprite image
let bg; // background image
let ground;
let finishline;
const MAX_JUMP = 1
let jumpChance = MAX_JUMP

// game variables
const TILE_SIZE = 50;


// world building groups

// image sprites


// menu

// sound assets
let mapUsed;

function preload() {
    startGameImg = loadImage("assets/startgame.png")
    endGameImg = loadImage("assets/clear.png")
    startCoordinate = [TILE_SIZE,height-TILE_SIZE/2]
    tilemap1 = loadStrings("stages/tiles1.txt");
    player = loadImage("assets/cube.png");
    bg = loadImage("assets/geobg.png");
    spikes = loadImage("assets/spike.png");
    tileMap2 = loadStrings('stages/tiles2.txt')

}
function loadLevel(){
    ground.removeAll();
    sharp.removeAll();
    orbs.removeAll();
    finishline.removeAll();
    if (lastlevel < level){
        level = 1
    }
    if (level === 1){
        new Tiles(tilemap1,0,0,50,50);
    }
    else if (level === 2){
        new Tiles(tileMap2,0,0,50,50);
    }
}

function setup() {
    new Canvas(700,600);
    background(250);
    world.gravity.y=32;
    player = new Sprite(50,50,TILE_SIZE,TILE_SIZE);
    player.collider = "dynamic";
    player.img = player;
    player.friction = 0;
    player.bounciness = 0;
    startCoordinate = [50,height- TILE_SIZE];
    player.x = startCoordinate[0];
    player.y =startCoordinate[1];
    //ground
    ground = new Group();
    ground.tile = "g";
    ground.w = TILE_SIZE;
    ground.h = TILE_SIZE;
    ground.color = "black";
    ground.stroke = "white";
    ground.collider = "static";
    //spikes
    spikes = new Group();
    spikes.tile = "s";
    spikes.collider = "static"
    //orbs
    orbs = new Group();
    orbs.tile = "o";
    orbs.d = 24;
    //finish
    finishline = new Group();
    finishline.tile = "f";
    finishline.w = TILE_SIZE;
    finishline.h = height*2;
    finishline.colour = "#f59042";
    finishline.stroke = "black";
    finishline.collider = "static";
    finishline.visible = false;
    new Tiles(tilemap1,0,0,TILE_SIZE,TILE_SIZE)
    mapUsed = tilemap1;
    console.log(width);
    startSprite = new Sprite(width/2, height/2, 190, 90);
    startSprite.img = startGameImg;
    startSprite.collider = "none";
    //particles
    particles=new Group();
}
function resetGame(){
    player.rotation = 0;
    player.x = startCoordinate[0];
    player.y = startCoordinate[1];
}
function triggerGameOver(){
    if (!gameOver){
        player.vel.x = 0;
        jumpChance = 0;
        endTimer = frameCount;
        if (endSprite){
            endSprite.remove();
        }
        endSprite = new Sprite(player.x, height/2, 126, 24);
        endSprite.collider = "none";
        endSprite.img = endGameImg;
    }
}
function drawBackground() {

  let lastRow = mapUsed[mapUsed.length - 1]; //Get the final row of the current tile map.
  let numCols = lastRow.length; //Count how many tiles are in the row.
  let totalJourney = numCols * 50; //each tile is around 50px. this gives the total length

  let progress = map(player.x, 0, totalJourney, -100, 0);

  let c1 = color("#9933ff"); //colours for lerping
  let c2 = color("#4169e1");

  let amt = (sin(frameCount * 0.5) + 1) / 2; //Create a value that repeatedly changes between 0 and 1.
  let blend = lerpColor(c1, c2, amt); //lerp between two colours

  tint(blend); //turn on the tint
  image(bg, progress, 0, 800, 600); //draw and move background 
  noTint(); //remove tint on all other objects
}
function draw() {
    clear()
    if (startGame){
        camera.x = player.x;
        player.vel.x = 5;
        if ((kb.presses("space") || mouse.presses("left")) && jumpChance > 0){
            player.vel.y = -10;
            player.rotateTo(player + 359,15);
            jumpChance -=1
        }
        if (player.collides(ground) && jumpChance < MAX_JUMP){
            jumpChance = MAX_JUMP
        }
        if (player.collides(spikes)){
            resetGame()
        }
        for (let tile of ground){
            if (player.colliding(tile)){
                let leftEdge = tile.x - tile.w /2;
                let leftEdgeHeight = tile.y - tile.h/2;
                if (player.x < leftEdge && player.y > leftEdgeHeight){
                    resetGame();
                    break;
                }
            }
        }
        for (let orb of orbs){
            if (player.colliding(orb)){
                orb.visible=false;
                orb.collider = "none";
                jumpChance +=1
            }
        }

        // particles
        if((frameCount%3)===0&&player.colliding.ground&&player.vel.x>=0.5){
            let particle = new Sprite(player.x,player.y+player.h/2,8,8,"none")
            particles.color="white";
            particle.stokeweight=0
            particle.vel.x=-5
            particle.vel.y=(-2,0)
            particle.life = 0
            particles.add(particle)
        }
    }
    if (!startGame && (mouse.presses() || kb.presses("space"))){
        startGame = true;
        startSprite.visible=false;
    }
    else if (!startGame){
        if (frameCount%60 < 30){
            startSprite.visible = true;
        }
        else {
            startSprite.visible = false;
        }
    }

    if (player.collides(finishline)){
        triggerGameOver();
    }
    if (gameOver){
        if (frameCount - endTimer > 120){
            if (endSprite){
                endSprite.remove();
            }
            startgame = false;
            gameOver = false;
            resetGame();
            level +=1;
            loadLevel();
        }
    }
    image(bg,0,0,800,500); // image,x,y,width,height
    drawBackground();
}
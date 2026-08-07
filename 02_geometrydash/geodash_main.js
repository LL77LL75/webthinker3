// const { startTransition } = require("react");

//player box
let start
let spikes;
let orbs;
let tilemap1
let player; // player sprite
let box; // player sprite image
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


function preload() {
    startCoordinate = [TILE_SIZE,height-TILE_SIZE/2]
    tilemap1 = loadStrings("stages/tiles1.txt");
    box = loadImage("assets/cube.png");
    bg = loadImage("assets/geobg.png");
    spikes = loadImage("assets/spike.png");

}

function setup() {
    new Canvas(700,600);
    background(250);
    world.gravity.y=32;
    player = new Sprite(50,50,TILE_SIZE,TILE_SIZE);
    player.collider = "dynamic";
    player.img = box;
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
}
function resetGame(){
    player.rotation = 0;
    player.x = startCoordinate[0]
    player.y = startCoordinate[1]
}
function draw() {
    clear();
    camera.x = player.x
    player.vel.x = 5;
    if ((kb.presses("space") || mouse.presses("left")) && jumpChance > 0){
        player.vel.y = -10;
        // player.rotateTo(player + 359,15);
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
    image(bg,0,0,800,500); // image,x,y,width,height
}












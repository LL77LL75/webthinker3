// const { startTransition } = require("react");

//player box
let spikes;
let orbs;
let tilemap1
let player; // player sprite
let box; // player sprite image
let bg; // background image
let ground;
let finishline;

// game variables
const TILE_SIZE = 50;


// world building groups
let spikes;
let orbs;

// image sprites


// menu


// sound assets


function preload() {
    startCoordinate = [TILE_SIZE,height-TILE_SIZE/2]
    tilemap1 = loadStrings("stages/tiles1.txt");
    box = loadImage("assets/cube.png");
    bg = loadImage("assets/geobg.png");

}

function setup() {
    new Canvas(700,600);
    background(250);
    world.gravity.y=32;
    player = new Sprite(50,50,TILE_SIZE,TILE_SIZE);
    player.img = box;
    player.friction = 0;
    player.bounciness = 1;
    player.collider = "none";
    startCoordinate = [50,height- TILE_SIZE];
    player.x = startCoordinate[0];
    player.y =startCoordinate[1];
    
    ground = new Group();
    ground.tile = "g";
    ground.width = TILE_SIZE;
    ground.h = TILE_SIZE;
    ground.colour = "black";
    ground.stroke = "white";
    ground.collider = "static";
    //spikes
    spikes = new Group();
    spikes.tile = "s"
    spikes.img = loadImage("assets/spike.png")
    //orbs
    orbs = new Group()
    orbs.tile = "o"
    orbs.d = 24
    new Tiles(tilemap1,0,0,TILE_SIZE,TILE_SIZE)
}
function draw() {
    clear();
    image(bg,0,0,800,500); // image,x,y,width,height
}












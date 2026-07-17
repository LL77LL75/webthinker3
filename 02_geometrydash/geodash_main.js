//player box
let player; // player sprite
let box; // player sprite image
let bg; // background image

// game variables
const TILE_SIZE = 50;


// world building groups


// image sprites


// menu


// sound assets


function preload() {
    box = loadImage("assets/cube.png");
    bg = loadImage("assets/geobg.png");

}

function setup() {
    new Canvas(700,600);
    background(250);
    world.gravity.y=32;
    player = new Sprite(50,50,TILE_SIZE,TILE_SIZE);
    player.img = box;
    player.friction = 0
    player.bounciness = 1
    player.collider = "none"
}
function draw() {
    clear();
    Image(bg,0,0,800,500); // image,x,y,width,height
}












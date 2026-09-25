// ====================================================
// Canvas and layout variables
// ====================================================

// Width of the webcam/game area.
let cameraWidth = 800;

// Height of the webcam/game area.
let cameraHeight = 450;

// Width of each side panel.
let sidePanelWidth = 220;

// Total canvas width = left panel + webcam area + right panel.
let totalCanvasWidth = cameraWidth + sidePanelWidth * 2;

// x-position where the webcam area starts.
let cameraX = sidePanelWidth;

// x-position of the left panel.
let leftPanelX = 0;

// x-position of the right panel.
let rightPanelX = sidePanelWidth + cameraWidth;

//setup vars
let video;
let bodyPose;//ml model
let detectedPeople=[]; //used to store people
//game vars
let skeletonColour;
// ====================================================
// Preload
// ====================================================

function preload(){
    bodyPose=ml5.bodyPose("moveNet",{flipped:true});
}

// ====================================================
// Setup
// ====================================================

// setup() runs once at the start.
function setup() {
    let constraints={
        video:{
            width:cameraWidth,
            height:cameraHeight,
            aspectRatio:cameraWidth/cameraHeight
        },
    audio:false,
    flipped:true
    };
    video = createCapture(constraints);
    video.hide;
    //give vid to model
    bodyPose.detectStart(video,gotPeople);
    // Set up text.
    textAlign(CENTER, CENTER);
    skeletonColour = 
};


// ====================================================
// Main draw loop
// ====================================================

// draw() runs again and again.
function draw() {
    // Clear the canvas with a dark background.
    background(30);
    // Draw the side panels.
    drawUIPanel();
    // Draw the middle line that separates Player 1 and Player 2 areas.
    drawMiddleLine();
    //draw cam video
    image(video,cameraX,0,cameraWidth,cameraHeight);
    

}

// ====================================================
// Draw side UI panels
// ====================================================

// Draws the left and right UI panels.
function drawUIPanel() {
    // Remove outlines.
    noStroke();

    // Set panel colour.
    fill(20);

    // Draw left panel.
    rect(leftPanelX, 0, sidePanelWidth, cameraHeight);

    // Draw right panel.
    rect(rightPanelX, 0, sidePanelWidth, cameraHeight);

    // Set divider line colour.
    stroke(255, 180);

    // Set divider line thickness.
    strokeWeight(2);

    // Draw line between left panel and webcam.
    line(sidePanelWidth, 0, sidePanelWidth, cameraHeight);

    // Draw line between webcam and right panel.
    line(rightPanelX, 0, rightPanelX, cameraHeight);
}


// ====================================================
// Draw middle divider line
// ====================================================

// Draws the vertical line that separates Player 1 and Player 2.
function drawMiddleLine() {
    // Set line colour to white with transparency.
    stroke(255, 180);

    // Set line thickness.
    strokeWeight(2);

    // Draw the middle line inside the webcam area.
    line(width / 2, 0, width / 2, cameraHeight);
}
function gotPeople(results){
    //stores results into an array
    detectedPeople=results;
}
function drawDetectionStatus(){
    fill(0);
    testSize(24);
    text("people Detected: " + detectedPeople.length,width/2,height*0.1)
    console.log(detectedPeople)
}
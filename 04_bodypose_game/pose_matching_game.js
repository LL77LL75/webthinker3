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
let leftPanelCenterX=sidePanelWidth/2


// x-position of the right panel.
let rightPanelX = sidePanelWidth + cameraWidth;

//setup vars
let video;
let bodyPose;//ml model
let detectedPeople=[]; //used to store people
//game vars
let player1Color;
let player2Color;
//PEOPLE
let player1Person=null;
let player2Person=null;
// ====================================================
// Preload
// ====================================================
//images
let bothHandsUpImg;
let leftHandUpImg;
let rightHandUpImg;
let handsOnHeadImg;
let tPoseImg;

let poseArray=[];
let currentPose = null;

function preload(){
    bodyPose=ml5.bodyPose("MoveNet",{flipped:true});
    bothHandsUpImg=loadImage("assets/poseBattle_bothHandsUp.png");
    leftHandUpImg=loadImage("assets/poseBattle_leftHandUp.png");
    rightHandUpImg=loadImage("assets/poseBattle_rightHandUp.png");
    handsOnHeadImg=loadImage("assets/poseBattle_handsOnHead.png");
    tPoseImg=loadImage("assets/poseBattle_tpose.png");
}

// ====================================================
// Setup
// ====================================================

// setup() runs once at the start.
function setup() {
    new Canvas(totalCanvasWidth,cameraHeight);
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
    video.hide();
    //give vid to model
    bodyPose.detectStart(video,gotPeople);
    // Set up text.
    textAlign(CENTER, CENTER);
    player1Color = "rgb(0,0,0)";
    player2Color = "rgb(255,0,0)";
    setupPoseArray();
    currentPose=poseArray[0]
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
    drawDetectionStatus();
    findPlayers();
    drawPlayerSkeletons();
    drawGameUI();
}

// ====================================================
// Draw side UI panels
// ====================================================

// Draws the left and right UI panels.
function drawUIPanel() {
    // Remove outlines.
    noStroke();

    // Set panel Color.
    fill(20);

    // Draw left panel.
    rect(leftPanelX, 0, sidePanelWidth, cameraHeight);

    // Draw right panel.
    rect(rightPanelX, 0, sidePanelWidth, cameraHeight);

    // Set divider line Color.
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
    // Set line Color to white with transparency.
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
    textSize(24);
    text("people Detected: " + detectedPeople.length,width/2,height*0.1)
    console.log(detectedPeople)
}
function drawAllSkeletons(){
    //loop through the detected people
    for (let i = 0; i<detectedPeople.length; i++){
        let person=detectedPeople[i];
    }
}
//check confidence
function pointIsReady(point){
    if (point==null||point==undefined){
        return false;
    };
    if (point.confidence>0.25){
        return true;
    }
    else{
        return false;
    }
}
function drawBodyLine(point1,point2){
    if (pointIsReady(point1)&&pointIsReady(point2)){
        line(point1.x+cameraX,point1.y,point2.x+cameraX,point2.y); // uses 2 point (xpos1,ypos1,xpos2,ypos2)
    }
}
function drawBodyPoint(point){
    circle(point.x+cameraX,point.y,10)
}
// Draws one person's skeleton.
function drawSkeleton(person, skeletonColor) {
    // Set skeleton line Color.
    stroke(skeletonColor);

    // Set skeleton line thickness.
    strokeWeight(3);

    // Draw shoulder line.
    drawBodyLine(person.left_shoulder, person.right_shoulder);

    // Draw left upper arm.
    drawBodyLine(person.left_shoulder, person.left_elbow);

    // Draw left lower arm.
    drawBodyLine(person.left_elbow, person.left_wrist);

    // Draw right upper arm.
    drawBodyLine(person.right_shoulder, person.right_elbow);

    // Draw right lower arm.
    drawBodyLine(person.right_elbow, person.right_wrist);

    // Draw left body side.
    drawBodyLine(person.left_shoulder, person.left_hip);

    // Draw right body side.
    drawBodyLine(person.right_shoulder, person.right_hip);

    // Draw hip line.
    drawBodyLine(person.left_hip, person.right_hip);

    // Remove outlines for the body point circles.
    noStroke();

    // Set circle Color.
    fill(player1Color);

    // Draw important body points.
    drawBodyPoint(person.nose);
    drawBodyPoint(person.left_shoulder);
    drawBodyPoint(person.right_shoulder);
    drawBodyPoint(person.left_elbow);
    drawBodyPoint(person.right_elbow);
    drawBodyPoint(person.left_wrist);
    drawBodyPoint(person.right_wrist);
    drawBodyPoint(person.left_hip);
    drawBodyPoint(person.right_hip);
}
function findPlayers(){
    //reset players
    player1Person=null;
    player2Person=null;
    let closestPlayer1Distance = Number.MAX_VALUE;
    let closestPlayer2Distance = Number.MAX_VALUE;

    //x pos players
    let player1CenterX = cameraWidth/4 +cameraX;
    let player2CenterX = cameraWidth/4*3 +cameraX;
    let middleX = cameraWidth/2 +cameraX;

    for (let i = 0; i<detectedPeople.length;i++){
        let person = detectedPeople[i];
        let nose = person.nose;
        if (pointIsReady(nose)){
            let noseX=nose.x+cameraX;
            console.log(noseX)
            //check if its on the left
            if(noseX<middleX){
                let distanFromPlayer1Center = abs(noseX-player1CenterX);
                if (distanFromPlayer1Center<closestPlayer1Distance){
                    player1Person=person;
                }
            }
            if(noseX>middleX){
                let distanFromPlayer2Center = abs(noseX-player2CenterX);
                if (distanFromPlayer2Center<closestPlayer2Distance){
                    player2Person=person;
                }
            
        }
    }
}
}
function drawPlayerSkeletons(){
    //check if they exist
    if (player1Person != null){
        drawSkeleton(player1Person,player1Color);
        console.log(player1Color);
    }
    if (player2Person != null){
        drawSkeleton(player2Person,player2Color);
        console.log(player2Color);
    }
}
//setup of adding poses
function setupPoseArray(){
    poseArray = [
        {
            name:"Hands On Head",
            image:handsOnHeadImg,
            id:"handsOnHead"
        },
        {
            name:"T Pose",
            image:tPoseImg,
            id: "tPose"
        },
        {
            name:"Both Hands Up",
            image:bothHandsUpImg,
            id: "bothHandsUp"
        },
        {
            name:"Right Hand Up",
            image:rightHandUpImg,
            id: "rightHandUp"
        },
        {
            name:"Left Hand Up",
            image:leftHandUpImg,
            id: "leftHandUp"
        }
    ];
};
//draw game
function drawGameUI(){
    if (currentPose === null || currentPose ===undefined){

    }
    //text stuff
    fill(200,200,200);
    textSize(28);
    text(currentPose.name, width/2, height * 0.2);
    imageMode(CENTER);
    image(currentPose.image,width/2,height*0.6,230,230)
    imageMode(CORNER)
}
function drawPlayerStatus(){
    textSize(28);
    noStroke();//remove text outline
    if (player1Color !==null){
        fill(player1Color);
        text("detected: ", leftPanelCenterX,height*0.5)
    }
    else{
        fill(player1Color);
        text("not detected",leftPanelCenterX,height*0.5)
    }
}
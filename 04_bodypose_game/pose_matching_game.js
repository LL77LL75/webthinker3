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
let leftPanelCenterX=sidePanelWidth/2;

// x-position of the right panel.
let rightPanelX = sidePanelWidth + cameraWidth;
let rightPanelCenterX = rightPanelX + sidePanelWidth/2;
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

let score=100;
let player1Score=0;
let player2Score=0;
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
    drawPlayerStatus();
    drawPlayerScore("player 1",leftPanelCenterX,player1Score,player1Color);
    drawPlayerScore("player 2",rightPanelCenterX,player2Score,player2Color);
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
    if (player1Person !==null){
        fill(player1Color);
        text("detected: ", leftPanelCenterX,height*0.5);
        if (checkCurrentPose(player1Person)===true){
            text("Match!", leftPanelCenterX, height*0.7);
        } else {
            text("not matching...", leftPanelCenterX , height*0.7);
        }
    }else{
        fill(player1Color);
        text("not detected",leftPanelCenterX,height*0.5)
    }
    if (player2Person !==null){
        fill(player2Color);
        text("detected: ", rightPanelCenterX,height*0.5)
        if (checkCurrentPose(player2Person)===true){
            text("Match!", rightPanelCenterX, height*0.7);
        } else {
            text("not matching...", rightPanelCenterX , height*0.7);
        }
    }
    else{
        fill(player2Color);
        text("not detected",rightPanelCenterX,height*0.5)
    }
}
function checkBothHandsUp(person) {
    let leftWrist = person.left_wrist;
    let rightWrist = person.right_wrist;
    let leftShoulder = person.left_shoulder;
    let rightShoulder = person.right_shoulder;
    let nose = person.nose;

    if (pointIsReady(leftWrist) === false) {
        return false;
    }

    if (pointIsReady(rightWrist) === false) {
        return false;
    }

    if (pointIsReady(leftShoulder) === false) {
        return false;
    }

    if (pointIsReady(rightShoulder) === false) {
        return false;
    }

    if (pointIsReady(nose) === false) {
        return false;
    }

    let shoulderWidth = abs(leftShoulder.x - rightShoulder.x);
    let margin = shoulderWidth * 0.25;

    let leftHandHigh = false;
    let rightHandHigh = false;

    if (leftWrist.y < nose.y - margin) {
        leftHandHigh = true;
    }

    if (rightWrist.y < nose.y - margin) {
        rightHandHigh = true;
    }

    if (leftHandHigh === true && rightHandHigh === true) {
        return true;
    } else {
        return false;
    }
}


// Checks whether only the left hand is up.
function checkLeftHandUp(person) {
    let leftWrist = person.left_wrist;
    let rightWrist = person.right_wrist;
    let leftShoulder = person.left_shoulder;
    let rightShoulder = person.right_shoulder;

    if (pointIsReady(leftWrist) === false) {
        return false;
    }

    if (pointIsReady(rightWrist) === false) {
        return false;
    }

    if (pointIsReady(leftShoulder) === false) {
        return false;
    }

    if (pointIsReady(rightShoulder) === false) {
        return false;
    }

    let shoulderWidth = abs(leftShoulder.x - rightShoulder.x);
    let margin = shoulderWidth * 0.25;

    let leftIsUp = false;
    let rightIsDown = false;

    if (leftWrist.y < leftShoulder.y - margin) {
        leftIsUp = true;
    }

    if (rightWrist.y > rightShoulder.y + margin) {
        rightIsDown = true;
    }

    if (leftIsUp === true && rightIsDown === true) {
        return true;
    } else {
        return false;
    }
}


// Checks whether only the right hand is up.
function checkRightHandUp(person) {
    let leftWrist = person.left_wrist;
    let rightWrist = person.right_wrist;
    let leftShoulder = person.left_shoulder;
    let rightShoulder = person.right_shoulder;

    if (pointIsReady(leftWrist) === false) {
        return false;
    }

    if (pointIsReady(rightWrist) === false) {
        return false;
    }

    if (pointIsReady(leftShoulder) === false) {
        return false;
    }

    if (pointIsReady(rightShoulder) === false) {
        return false;
    }

    let shoulderWidth = abs(leftShoulder.x - rightShoulder.x);
    let margin = shoulderWidth * 0.25;

    let rightIsUp = false;
    let leftIsDown = false;

    if (rightWrist.y < rightShoulder.y - margin) {
        rightIsUp = true;
    }

    if (leftWrist.y > leftShoulder.y + margin) {
        leftIsDown = true;
    }

    if (rightIsUp === true && leftIsDown === true) {
        return true;
    } else {
        return false;
    }
}


// Checks whether both arms are stretched sideways like a T.
function checkTPose(person) {
    let leftWrist = person.left_wrist;
    let rightWrist = person.right_wrist;
    let leftShoulder = person.left_shoulder;
    let rightShoulder = person.right_shoulder;

    if (pointIsReady(leftWrist) === false) {
        return false;
    }

    if (pointIsReady(rightWrist) === false) {
        return false;
    }

    if (pointIsReady(leftShoulder) === false) {
        return false;
    }

    if (pointIsReady(rightShoulder) === false) {
        return false;
    }

    let shoulderWidth = abs(leftShoulder.x - rightShoulder.x);
    let levelMargin = shoulderWidth * 0.5;

    let leftWristLevel = false;
    let rightWristLevel = false;
    let armsAreWide = false;

    if (abs(leftWrist.y - leftShoulder.y) < levelMargin) {
        leftWristLevel = true;
    }

    if (abs(rightWrist.y - rightShoulder.y) < levelMargin) {
        rightWristLevel = true;
    }

    let wristDistance = abs(leftWrist.x - rightWrist.x);

    if (wristDistance > shoulderWidth * 2) {
        armsAreWide = true;
    }

    if (leftWristLevel === true && rightWristLevel === true && armsAreWide === true) {
        return true;
    } else {
        return false;
    }
}


// Checks whether both hands are near the head.
function checkHandsOnHead(person) {
    let leftWrist = person.left_wrist;
    let rightWrist = person.right_wrist;
    let leftShoulder = person.left_shoulder;
    let rightShoulder = person.right_shoulder;
    let nose = person.nose;

    if (pointIsReady(leftWrist) === false) {
        return false;
    }

    if (pointIsReady(rightWrist) === false) {
        return false;
    }

    if (pointIsReady(leftShoulder) === false) {
        return false;
    }

    if (pointIsReady(rightShoulder) === false) {
        return false;
    }

    if (pointIsReady(nose) === false) {
        return false;
    }

    let shoulderWidth = abs(leftShoulder.x - rightShoulder.x);

    let closeToHeadDistance = shoulderWidth * 0.8;
    let headHeightMargin = shoulderWidth * 0.45;
    let aboveShoulderMargin = shoulderWidth * 0.3;

    let leftHandNearHead = false;
    let rightHandNearHead = false;

    let leftDistanceFromHead = dist(leftWrist.x, leftWrist.y, nose.x, nose.y);
    let rightDistanceFromHead = dist(rightWrist.x, rightWrist.y, nose.x, nose.y);

    if (
        leftDistanceFromHead < closeToHeadDistance &&
        abs(leftWrist.y - nose.y) < headHeightMargin &&
        leftWrist.y < leftShoulder.y - aboveShoulderMargin
    ) {
        leftHandNearHead = true;
    }

    if (
        rightDistanceFromHead < closeToHeadDistance &&
        abs(rightWrist.y - nose.y) < headHeightMargin &&
        rightWrist.y < rightShoulder.y - aboveShoulderMargin
    ) {
        rightHandNearHead = true;
    }

    if (leftHandNearHead === true && rightHandNearHead === true) {
        return true;
    } else {
        return false;
    }
}

function checkCurrentPose(person){
    if (currentPose !== null){
        if (currentPose.id==="bothHandsUp"){
            return checkBothHandsUp(person);
        } else if (currentPose.id === "leftHandUp"){
            return checkLeftHandUp(person);
        } else if (currentPose.id === "rightHandUp"){
            return checkRightHandUp(person);
        } else if (currentPose.id === "handsOnHead"){
            return checkHandsOnHead(person);
        }
    }
}
function keyPressed(){
    if (key==="1"){
        currentPose = poseArray[0]
    }
    if (key==="2"){
        currentPose = poseArray[2]
    }
    if (key==="3"){
        currentPose = poseArray[2]
    }
    if (key==="4"){
        currentPose = poseArray[3]
    }
    if (key==="5"){
        currentPose = poseArray[4]
    }
    if (key==="6"){
        currentPose = poseArray[5]
    }
}
function drawPlayerScore(playerName,PanelCenterX,score,playerColour){
    fill(playerColour);
    textSize(30);
    text(playerName,PanelCenterX,height*0.2);
    text("score: " + score,PanelCenterX,height*0.3);
}
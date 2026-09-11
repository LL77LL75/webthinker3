//=========================================
// Variables
//=========================================
let handPose; // ML5 Model
let videoW = 640;
let videoH = 480;
let hands = [];
let fingerTip;
let balloon;
let leftWall,rightWall,topWall,botWall;
//=========================================
// Code
//=========================================

function preload() {
    let options = {
        flipped : true,
        runtime : "tfjs",
        modelType : "full",
        detectorModelUrl : undefined,
        landmarkModelUrl : undefined
    }
    handPose = ml5.handPose(options);
}

function setup() {
    createCanvas(videoW, videoH);

    // Setup webcam video
    let constraints = {
        video : {
            mandatory: {
                minWidth: videoW,
                minHeight: videoH
            },
        optional: [{ minFrameRate: 60 }],
        },
        audio: false,
        flipped: true
    };
    world.gravity.y = 3;

    fingerTip = new Sprite();
    fingerTip.diameter = 60;
    fingerTip.collider = "kinematic";
    fingerTip.colour = "rgba(255,255,0,0.1)";

    balloon = new Sprite();
    balloon.diameter = 50
    balloon.collider = "dynamic";
    balloon.collider = "rgb(255,0,0)"
    balloon.bounciness = 1;
    balloon.mass = 1;
    balloon.drag = 0.1;
    balloon.x = videoW/2;
    balloon.y = videoH/2;

    video = createCapture(constraints);
    video.size(videoW, videoH);
    video.hide();
    // Send video to the model to start detecting hands
    handPose.detectStart(video, gotHands);
    
    leftWall = new Sprite();
    Wall 
    leftWall.x = 1;
    leftWall.y = height/2;
    leftWall.width = 1;
    leftWall.height = 1;

    rightWall = new Sprite();
    Wall 
    rightWall.x = videoW;
    rightWall.y = height/2;
    rightWall.width = 1;
    rightWall.height = height;
    
    rightWall = new Sprite();
    Wall 
    rightWall.x = videoW;
    rightWall.y = height;
    rightWall.width = 1;
    rightWall.height = height;
    
    botWall = new Sprite();
    Wall 
    botWall.x = width/2;
    botWall.y = height;
    botWall.width = width;
    botWall.height = 1;
    
    topWall = new Sprite();
    Wall 
    topWall.x = width/2;
    topWall.y = 0;
    topWall.width = width;
    topWall.height = 1;
    
}

function draw() {
    // Draw webcam video
    image(video, 0, 0, videoW, videoH);
    //checks if there are hands
    if (hands.length > 0) {
        console.log(hands);

        // loop through all detected hands
        for (let i = 0; i < hands.length; i++){
            let hand = hands[i];
            let currenthand = hands[0]
            let keypoint = currenthand.keypoints[8]
            circle(keypoint.x,keypoint.y,10)
            //make sprite follow hand
            fingerTip.x = keypoint.x
            fingerTip.y = keypoint.y
            fingerTip.visible = true
            // for (let j = 0; j < hand.keypoints.length; j++){
            //     let keypoint = hand.keypoints[j];
            //     circle(keypoint.x,keypoint.y,10); //xpos, ypos, radius
            // } 
        }
    }
    else{
        fingerTip.visible = false;
    }
}

//=========================================
// Function Created
//=========================================

function gotHands(results) {
    // Model detects hand and saves the output here
    hands = results;
}
//=========================================
// Variables
//=========================================
let handPose; // ML5 Model
let videoW = 640;
let videoH = 480;
let hands = [];
let fingerTip;
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
    fingerTip = new Sprite()
    fingerTip.diameter = 60;
    fingerTip.collider = "kinematic";
    fingerTip.colour = "rgba(255,255,0,0.1)";
    video = createCapture(constraints);
    video.size(videoW, videoH);
    video.hide();
    // Send video to the model to start detecting hands
    handPose.detectStart(video, gotHands)
}

function draw() {
    // Draw webcam video
    image(video, 0, 0, videoW, videoH);
    if (hands.length > 0) {
        console.log(hands);

        // loop through all detected hands
        for (let i = 0; i < hands.length; i++){
            let hand = hands[i];
            let keypoint = hand.keypoints[i]
            circle(keypoint.x,keypoint.y,10)
            //make sprite follow hand
            
            // for (let j = 0; j < hand.keypoints.length; j++){
            //     let keypoint = hand.keypoints[j];
            //     circle(keypoint.x,keypoint.y,10); //xpos, ypos, radius
            // } 
        }
    }
}

//=========================================
// Function Created
//=========================================

function gotHands(results) {
    // Model detects hand and saves the output here
    hands = results;
}
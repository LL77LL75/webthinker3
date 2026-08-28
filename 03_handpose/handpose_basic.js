//=========================================
// Variables
//=========================================
let handPose; // ML5 Model
let videoW = 640;
let videoH = 480;
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
    handPose = ml5.handPose(options)
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

    video = createCapture(constraints);
    video.size(videoW, videoH);
    video.hide();
    // Send video to the model to start detecting hands
    handPose.detectStart(video, gotHands);
}

    function draw() {
        // Draw webcam video
        image(video, 0, 0, videoW, videoH);
        if (hands.length > 0) {
            console.log(hands);
        }
    }

//=========================================
// Function Created
//=========================================

function gotHands(results) {
    // Model detects hand and saves the output here
    hands = results;
}
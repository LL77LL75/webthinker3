//=========================================
// Variables
//=========================================
let handPose; // ML5 Model
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

function setup() {}

function draw() {}

//=========================================
// Function Created
//=========================================

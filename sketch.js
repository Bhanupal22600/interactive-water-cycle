let bodyPose;
let poses = [];
let video;
let sun = {
    x: 700, y: 100, size: 60, originalSize: 60, isDragging: false
};

let lake = { y: 0, height: 150 };
let vaporParticles = [];
let cloudParticles = [];
let clouds = [];
let cloudFormed = false;
let rainParticles = [];
let thunder = { active: false, frames: 0, pos1: null, pos2: null };
let wasDragging = false;  

let waveOffset0 = 4;
let waveOffset1 = 4;
let waveOffset2 = 0;
let waveOffset3 = 0;
let waveOffset4 = 0;
let waveOffset5 = 0;
let music;
let vapour;
let rain;

function preload() {
    bodyPose = ml5.bodyPose("BlazePose", modelReady);
    music = loadSound('ocean.mp3');
    vapour = loadSound('vapour.mp3');
    rain = loadSound('rain.mp3');
}

function setup() {
    createCanvas(800, 600);
    music.loop();
    lake.y = height - lake.height;
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
    bodyPose.detectStart(video, gotPoses);
}

function modelReady() {
    console.log("Model loaded!");
}

function gotPoses(results) {
    poses = results;
}

function getHandPositions() {
    let hands = [];
    if (!poses || !Array.isArray(poses)) return hands;

    for (let pose of poses) {
        if (!pose.keypoints) continue;

        // Get right wrist (keypoint 16)
        if (pose.keypoints[16].confidence > 0.7) {
            let x = width - pose.keypoints[16].x; // Mirror X coordinate
            let y = pose.keypoints[16].y;
            hands.push(createVector(x, y));
            fill(0, 255, 0);
          circle(x,y, 20);
        }
    }
    return hands;
}

// LED Control Functions
function sendVaporLED(state) {
  sendSerialChar(state ? '2' : 'a');
}

function sendCloudLED(state) {
  sendSerialChar(state ? '3' : 'b');
}

function sendThunderLED(state) {
  sendSerialChar(state ? '4' : 'c');
}

function sendRainLED(state) {
  sendSerialChar(state ? '5' : 'd');
}

function sendSunLED(state) {
  sendSerialChar(state ? '6' : 'e');
}





function handleSunInteraction() {
    let hands = getHandPositions();
    sun.isDragging = false;

    // Hand dragging takes priority over mouse
    for (let hand of hands) {
        if (dist(hand.x, hand.y, sun.x, sun.y) < sun.size/2) {
            sun.x = hand.x;
            sun.y = hand.y;
            sun.isDragging = true;
            return; // Only one hand can drag at a time
        }
    }

    // Fallback to mouse dragging
    if (mouseIsPressed && dist(mouseX, mouseY, sun.x, sun.y) < sun.size/2) {
        sun.x = mouseX;
        sun.y = mouseY;
        sun.isDragging = true;
    }

    // Update sun size based on height
    let distanceToLake = height - sun.y;
    sun.size = map(distanceToLake, 0, height, sun.originalSize*2, sun.originalSize);
  
    if (sun.isDragging) {
        sendSunLED(true); // Turn on sun LED when dragged
    } else {
        sendSunLED(false); // Turn off sun LED when not dragged
    }
}

function handleClouds() {
    let hands = getHandPositions();
    let anyCloudDragged = false;

    // Cloud interaction
    for (let cloud of clouds) {
        let cloudDragged = false;

        // Mouse interaction
        if (mouseIsPressed && dist(mouseX, mouseY, cloud.x, cloud.y) < 50) {
            cloud.x = mouseX;
            cloud.y = mouseY;
            cloudDragged = true;
            anyCloudDragged = true;
        }
        // Hand interaction
        else if (hands.length > 0) {
            for (let hand of hands) {
                if (dist(hand.x, hand.y, cloud.x, cloud.y) < 50) {
                    cloud.x = hand.x;
                    cloud.y = hand.y;
                    cloudDragged = true;
                    anyCloudDragged = true;
                    break;
                }
            }
        }

        // Visual feedback for dragging
        if (cloudDragged) {
            fill(255, 150);
            ellipse(cloud.x, cloud.y, 60, 40);
        }
        
        cloud.show();
    }

    // Update cloud LED state
    sendCloudLED(anyCloudDragged);

    // Check collisions between clouds
    for (let i = 0; i < clouds.length; i++) {
        for (let j = i+1; j < clouds.length; j++) {
            if (dist(clouds[i].x, clouds[i].y, clouds[j].x, clouds[j].y) < 100) {
                if (!thunder.active) {
                    thunder.active = true;
                    thunder.frames = 30;
                    thunder.pos1 = createVector(clouds[i].x, clouds[i].y);
                    thunder.pos2 = createVector(clouds[j].x, clouds[j].y);
                    if (!rain.isPlaying()) {
                        rain.play();
                    }
                }
                startRain();
            }
        }
    }
}

function drawSeaWaves0() {
  noStroke();
  let waveHeight = 2;
  let waveLength = 100;
  let yOffset = height - 150;

  fill(0, 102, 204, 110); // Light blue water

  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = sin((x + waveOffset0) * 0.03) * waveHeight;
    vertex(x, y + yOffset);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  waveOffset0 += 2.5; // Speed of wave movement
}

function drawSeaWaves1() {
  noStroke();
  let waveHeight = 5;
  let waveLength = 100;
  let yOffset = height - 130;

  fill(0, 191, 255, 150); // Light blue water

  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = sin((x + waveOffset1) * 0.03) * waveHeight;
    vertex(x, y + yOffset);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  waveOffset1 += 2; // Speed of wave movement
}

function drawSeaWave2() {
  noStroke();
  let waveHeight = 5;
  let waveLength = 80;
  let yOffset = height - 100;

  fill(0, 154, 205, 130); // Slightly darker blue

  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = sin((x - waveOffset2) * 0.035) * waveHeight;
    vertex(x, y + yOffset);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  waveOffset2 += 1.5;
}

function drawSeaWave3() {
  noStroke();
  let waveHeight = 5;
  let yOffset = height - 70;

  fill(0, 128, 255, 120); // Deeper blue

  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = sin((x + waveOffset3) * 0.04) * waveHeight;
    vertex(x, y + yOffset);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  waveOffset3 += 1.8;
}

function drawSeaWave4() {
  noStroke();
  let waveHeight = 5;
  let yOffset = height - 40;

  fill(0, 102, 204, 110); // Darkest blue

  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = sin((x - waveOffset4) * 0.045) * waveHeight;
    vertex(x, y + yOffset);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  waveOffset4 += 1.2;
}

function drawSeaWave5() {
  noStroke();
  let waveHeight = 5;
  let yOffset = height - 10;

  fill(0, 191, 255, 150); // Darkest blue

  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = sin((x - waveOffset4) * 0.045) * waveHeight;
    vertex(x, y + yOffset);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  waveOffset5 += 0.9;
}

function drawLake() {
    fill(30, 144, 255);
    noStroke();
    rect(0, lake.y, width, lake.height);
}

function drawIsland() {
  fill(194, 178, 128);  // Island land color (Sandy brown)
  noStroke();
  beginShape();
  vertex(0, 450);  // Left bottom of island
  vertex(300, 400);  // Island hill start
  vertex(500, 450);  // Island middle
  vertex(450, 420);  // Right bottom of island
  vertex(500, 500);  // Right bottom of island
  vertex(0, 500);    // Left bottom of island
  endShape(CLOSE);
}

function drawMountains(){
  fill(120, 120, 120);
  noStroke();
  
  beginShape();
  vertex(0, 450);
  vertex(150, 62);
  vertex(300,450 );
  endShape(CLOSE);
  
  fill(100, 100, 100);
  vertex(246, 445);
  vertex(350, 103);
  vertex(459, 450);
  endShape(CLOSE);
  
  // fill(255);  // Snow color
  // triangle(300, 200, 350, 150, 400, 200);  // Left Snow
  // triangle(600, 100, 650, 50, 700, 100); 
  
}

function drawTrees() {
  fill(34, 139, 34);  // Tree color (Green)

  // Left tree (Pine Tree)
  triangle(150, 300, 100, 400, 200, 400);
  triangle(150, 250, 100, 350, 200, 350);
  triangle(150, 200, 100, 300, 200, 300);
  rect(140, 400, 20, 50);  // Tree trunk
  
  // Right tree (Pine Tree)
  triangle(250, 320, 200, 420, 300, 420);
  triangle(250, 270, 200, 370, 300, 370);
  triangle(250, 220, 200, 320, 300, 320);
  rect(240, 420, 20, 50);  // Tree trunk
}


function drawGuideArrow() {
    fill(255, 0, 0);
    noStroke();
    textSize(20);
    text("Water Cycle Process", 500, 50);
    // Evaporation arrow
    arrow(sun.x, sun.y, 200, 100); 
    // Add other arrows for condensation, precipitation, and collection
    arrow(200, 200, 300, 300); 
}

function arrow(x1, y1, x2, y2) {
    push();
    stroke(255, 0, 0);
    strokeWeight(2);
    line(x1, y1, x2, y2);
    let angle = atan2(y2 - y1, x2 - x1);
    push();
    translate(x2, y2);
    rotate(angle);
    triangle(-10, -5, -10, 5, 0, 0);
    pop();
    pop();
}

function draw() {
    background(135, 206, 235);
    image(mountain,0,1000,width,450);
    handleSunInteraction();
    drawLake();
    drawSeaWaves0();
    drawSeaWaves1();
    drawSeaWave2();
    drawSeaWave3();
    drawSeaWave4();
    drawSeaWave5();
    handleEvaporation();
    handleClouds();
    handleRain();
    drawSun();
    drawVapor();
    drawMountains();
    console.log(mouseX, mouseY);
  // Draw trees
    drawTrees();
    drawIsland()
    if (thunder.active) drawThunder();
    drawGuideArrow();
  if (sun.isDragging && !wasDragging)  sendSerialChar('1');   // start blink
if (!sun.isDragging &&  wasDragging) sendSerialChar('0');   // stop blink
wasDragging = sun.isDragging;
}

function drawGuideArrow() {
    if (!sun.isDragging && sun.x === 700 && sun.y === 100) {
        fill(255, 0, 0);
        noStroke();
        textSize(20);
        text("Drag the Sun towards the lake", 500, 50);
        
        stroke(255, 0, 0);
        strokeWeight(1);
        line(sun.x, sun.y, sun.x - 150, lake.y - 50);
        
        fill(255, 0, 0);
        triangle(sun.x - 150, lake.y - 50, sun.x - 140, lake.y - 60, sun.x - 160, lake.y - 60);

    }
}
// Sun Interaction System
function handleSunInteraction() {
  
    let hands = getHandPositions();
    sun.isDragging = false;

    // Mouse dragging
    if (mouseIsPressed && dist(mouseX, mouseY, sun.x, sun.y) < sun.size/2) {
        sun.x = mouseX;
        sun.y = mouseY;
        sun.isDragging = true;
    }
    
    // Hand dragging
    if (!mouseIsPressed && hands.length > 0) {
        for (let hand of hands) {
            if (dist(hand.x, hand.y, sun.x, sun.y) < sun.size/2) {
                sun.x = hand.x;
                sun.y = hand.y;
                sun.isDragging = true;
                break;
            }
        }
    }

    // Sun size based on distance to lake
    let distanceToLake = height - sun.y;
    sun.size = map(distanceToLake, 0, height, sun.originalSize*2, sun.originalSize);
}

// Lake Drawing
function drawLake() {
    fill(30, 144, 255);
    noStroke();
    rect(0, lake.y, width, lake.height);
}

// Evaporation System
function handleEvaporation() {
    if (sun.y > height - 300 && !cloudFormed) {
        for (let i = 0; i < 2; i++) {
            vaporParticles.push(new VaporParticle());
        }
        sendVaporLED(true); // Turn on vapor LED
        if (!vapour.isPlaying()) {
            vapour.play();
        }
    }
    else {
        sendVaporLED(false); // Turn off vapor LED
        if (vapour.isPlaying()) {
            vapour.stop();
        }
    }

    for (let i = vaporParticles.length-1; i >= 0; i--) {
        vaporParticles[i].update();
        vaporParticles[i].show();
        if (vaporParticles[i].finished()) {
            cloudParticles.push(vaporParticles[i].pos.copy());
            vaporParticles.splice(i, 1);
        }
    }

    if (cloudParticles.length > 150 && !cloudFormed) {
        cloudFormed = true;
        clouds.push(new Cloud(150, 100));  // Left cloud
        clouds.push(new Cloud(width/2, 80)); // Center cloud
        clouds.push(new Cloud(width-150, 100)); // Right cloud
        sun.x = 700;
        sun.y = 100;
        sun.size = sun.originalSize;
    }
}

// Cloud System
function handleClouds() {
    let hands = getHandPositions();
    
    // Cloud interaction
    for (let cloud of clouds) {
        // Mouse interaction
        if (mouseIsPressed && dist(mouseX, mouseY, cloud.x, cloud.y) < 50) {
            cloud.x = mouseX;
            cloud.y = mouseY;
            sendCloudLED(true); // Turn on cloud LED when dragged
        }
        // Hand interaction
        else if (hands.length > 0) {
            for (let hand of hands) {
                if (dist(hand.x, hand.y, cloud.x, cloud.y) < 50) {
                    cloud.x = hand.x;
                    cloud.y = hand.y;
                    sendCloudLED(true); // Turn on cloud LED when dragged
                }
            }
        }
        cloud.show();
    }

    // Check collisions
    for (let i = 0; i < clouds.length; i++) {
        for (let j = i+1; j < clouds.length; j++) {
            if (dist(clouds[i].x, clouds[i].y, clouds[j].x, clouds[j].y) < 100) {
                if (!thunder.active) {
                    thunder.active = true;
                    thunder.frames = 30;
                    thunder.pos1 = createVector(clouds[i].x, clouds[i].y);
                    thunder.pos2 = createVector(clouds[j].x, clouds[j].y);
                    if (!rain.isPlaying()) {
                        rain.play();
                    }
                }
                startRain();
            }
        }
    }
}

// Thunder Effect
function drawThunder() {
    if (thunder.frames > 0) {
        sendThunderLED(true);
        stroke(255, 215, 0);
        strokeWeight(6);
        noFill();
        beginShape();
        vertex(thunder.pos1.x, thunder.pos1.y);
        vertex(lerp(thunder.pos1.x, thunder.pos2.x, 0.3), lerp(thunder.pos1.y, thunder.pos2.y, 0.3)+50);
        vertex(lerp(thunder.pos1.x, thunder.pos2.x, 0.6), lerp(thunder.pos1.y, thunder.pos2.y, 0.6)-30);
        vertex(thunder.pos2.x, thunder.pos2.y);
        endShape();
        thunder.frames--;
    } else {
        thunder.active = false;
        sendThunderLED(false); 
    }
}

// Rain System
function startRain() {
    sendRainLED(true); 
    for (let i = 0; i < 20; i++) {
        rainParticles.push(new RainParticle());
    }
}

function handleRain() {
    for (let i = rainParticles.length-1; i >= 0; i--) {
        rainParticles[i].update();
        rainParticles[i].show();
        if (rainParticles[i].pos.y > lake.y) {
            rainParticles.splice(i, 1);
            if (rainParticles.length === 0) {
                sendRainLED(false); 
                clouds = [];
                rain.stop();
                cloudFormed = false;
                cloudParticles = [];
            }
        }
    }
}

// Sun Drawing
function drawSun() {
    fill(255, 204, 0);
    noStroke();
    ellipse(sun.x, sun.y, sun.size);
    // Sun rays
    for (let i = 0; i < 12; i++) {
        let angle = (i * PI)/6;
        let x1 = sun.x + cos(angle) * sun.size/2;
        let y1 = sun.y + sin(angle) * sun.size/2;
        let x2 = sun.x + cos(angle) * sun.size;
        let y2 = sun.y + sin(angle) * sun.size;
        stroke(255, 204, 0, 100);
        line(x1, y1, x2, y2);
    }
}

// Cloud Class with Realistic Shape
class Cloud {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(80, 120);
    }

    show() {
        fill(240, 240, 240, 200);
        noStroke();
        beginShape();
        curveVertex(this.x-50, this.y+40);
        curveVertex(this.x-30, this.y-10);
        curveVertex(this.x, this.y-20);
        curveVertex(this.x+30, this.y);
        curveVertex(this.x+50, this.y+30);
        curveVertex(this.x+20, this.y+40);
        curveVertex(this.x-10, this.y+30);
        curveVertex(this.x-30, this.y+40);
        endShape(CLOSE);
    }
}

// Vapor Particle Class
class VaporParticle {
    constructor() {
        this.pos = createVector(random(width), lake.y-10);
        this.vel = createVector(random(-0.5, 0.5), random(-3, -1));
        this.alpha = 255;
    }

    update() {
        this.pos.add(this.vel);
        this.alpha -= 2;
    }

    show() {
        noStroke();
        fill(255, this.alpha);
        ellipse(this.pos.x, this.pos.y, 6);
    }

    finished() {
        return this.alpha <= 0;
    }
}

// Rain Particle Class
class RainParticle {
    constructor() {
        this.pos = createVector(random(width), 0);
        this.speed = random(5, 15);
    }

    update() {
        this.pos.y += this.speed;
    }

    show() {
        stroke(100, 100, 255);
        line(this.pos.x, this.pos.y, this.pos.x, this.pos.y+10);
    }
}

function drawVapor() {
  for (let p of vaporParticles) {
    p.show();
  }
}

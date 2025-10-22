
let bodyPose;
let poses = [];
let video;
let sun = {
    x: 700, y:100, size:60, originalSize:60, isDragging:false
};
let lake = {x:0, height:150};
let vaporParticles = [];
let cloudParticles = [];
let clouds = [];
let cloudFormed = false;
let rainParticles = [];
let thunder = {active:false, frames:0, pos1:null, pos2:null};
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
let mountain;


let cloud1, cloud2;
let cloud1X, cloud1Y;
let cloud2X, cloud2Y;
let cloudSpeed = 0.5;

let cowImg;
let crowActive = true;
const initialCowSpeed = 1;
const fastCowSpeed    = 4;

const numCows   = 3;
let cowXs       = [];
let cowYs       = [];         // now an array of Y-positions
let cowSpeed  = 1;          
const cowScale  = 0.2;  

let rainFlickerState = false; // Tracks LED state
//LED control Functions
function sendVaporLED(state){
    sendSerialChar(state? '2' :'a');
}
function sendCloudLED(state){
    sendSerialChar(state ? '3': 'b');
}
function sendThunderLED(state){
    sendSerialChar(state? '4': 'c');
}
function sendRainLED(state) {
  rainFlickerState = !rainFlickerState;
  sendSerialChar(state ? (rainFlickerState ? '5' : 'f') : 'd');
}
function sendSunLED(state){
    sendSerialChar(state? '6': 'e');
}
function drawSeWaves0(){
    noStroke();
    let waveHeight = 2; 
    let waveLength = 100; 
    let yOffset = height -150; 
    
    fill(0, 102, 204, 110);

    beginShape();
    for(let x = 0; x <=width; x+=10){
        let y = sin((x + waveOffset0) * 0.03) * waveHeight;
        vertex(x,y+yOffset);
    }

    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);

    waveOffset0 += 2.5;
}
function drawSeaWaves1(){
    noStroke();
    let waveHeight = 5; 
    let waveLength = 100; 
    let yOffset = height - 130;

    fill(0, 191, 255, 150);
    
    beginShape();
    for(let x = 0; x<= width; x+=10){
        let y = sin((x + waveOffset1) * 0.03) * waveHeight;
        vertex(x,y+yOffset);
    }
    
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);

    waveOffset1 +=2;

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


function modelReady(){
    console.log("BlazePose model loaded!");
}

function gotPoses(results){
    poses = results;
}

function getHandPositions(){
    let hands = [];
    if(!poses|| !Array.isArray(poses)) return hands;

    for(let pose of poses){
        if(!pose.keypoints) continue;

        if(pose.keypoints[16].confidence> 0.7){
            let x = width - pose.keypoints[16].x;
            let y = pose.keypoints[16].y;
            hands.push(createVector(x,y));
            fill(0, 255,0);
            circle(x,y,20);
        }
    }

    return hands;
}

function handleSunInteraction() {
    let hands = getHandPositions();
    let wasDragging = sun.isDragging; // Store previous state
    sun.isDragging = false;

    // Hand dragging takes priority over mouse
    for (let hand of hands) {
        if (dist(hand.x, hand.y, sun.x, sun.y) < sun.size/2) {
            sun.x = hand.x;
            sun.y = hand.y;
            sun.isDragging = true;
            break; // Only need one hand to drag
        }
    }

    // Mouse dragging (if no hand is dragging)
    if (!sun.isDragging && mouseIsPressed && dist(mouseX, mouseY, sun.x, sun.y) < sun.size/2) {
        sun.x = mouseX;
        sun.y = mouseY;
        sun.isDragging = true;
    }

    // Handle size change based on position
    let distanceToLake = height - sun.y;
    sun.size = map(distanceToLake, 0, height, sun.originalSize * 2, sun.originalSize);

    // Send LED signals if drag state changed
    if (sun.isDragging !== wasDragging) {
        sendSunLED(sun.isDragging);
        sendSerialChar(sun.isDragging ? '1' : '0');
    }

    // Collision prevention with clouds
    if (sun.isDragging) {
        let sunRadius = sun.size / 2;
        for (let cloud of clouds) {
            let cloudRadius = 50;
            let distance = dist(sun.x, sun.y, cloud.x, cloud.y);
            let minDistance = sunRadius + cloudRadius;
            
            if (distance < minDistance) {
                let angle = atan2(sun.y - cloud.y, sun.x - cloud.x);
                sun.x = cloud.x + cos(angle) * minDistance;
                sun.y = cloud.y + sin(angle) * minDistance;
            }
        }
    }
}

function handleClouds() {
    const hands = getHandPositions();
    let anyCloudDragged = false;

    // Handle dragging and collisions for each cloud
    for (let cloud of clouds) {
        let cloudDragged = false;
        const prevX = cloud.x;
        const prevY = cloud.y;

        // Mouse dragging
        if (mouseIsPressed && dist(mouseX, mouseY, cloud.x, cloud.y) < 50) {
            cloud.x = mouseX;
            cloud.y = mouseY;
            cloudDragged = anyCloudDragged = true;
        } 
        // Hand dragging
        else {
            for (let hand of hands) {
                if (dist(hand.x, hand.y, cloud.x, cloud.y) < 50) {
                    cloud.x = hand.x;
                    cloud.y = hand.y;
                    cloudDragged = anyCloudDragged = true;
                    break;
                }
            }
        }

        // Collision handling if dragged
        if (cloudDragged) {
            // Prevent sun-cloud collision
            const sunRadius = sun.size/2;
            const cloudRadius = 50;
            let distanceToSun = dist(cloud.x, cloud.y, sun.x, sun.y);
            if (distanceToSun < sunRadius + cloudRadius) {
                const angle = atan2(cloud.y - sun.y, cloud.x - sun.x);
                const minDist = sunRadius + cloudRadius;
                cloud.x = sun.x + cos(angle) * minDist;
                cloud.y = sun.y + sin(angle) * minDist;
            }

            // Prevent cloud-cloud collisions
            for (let otherCloud of clouds) {
                if (otherCloud !== cloud) {
                    const distance = dist(cloud.x, cloud.y, otherCloud.x, otherCloud.y);
                    const minDist = 100; // Combined radius
                    if (distance < minDist) {
                        const angle = atan2(cloud.y - otherCloud.y, cloud.x - otherCloud.x);
                        cloud.x = otherCloud.x + cos(angle) * minDist;
                        cloud.y = otherCloud.y + sin(angle) * minDist;
                    }
                }
            }

            // Visual feedback
            fill(255, 150);
            ellipse(cloud.x, cloud.y, 60, 40);
        }

        cloud.show();
    }

    // Update cloud LED state
    sendCloudLED(anyCloudDragged);

    // Check for thunder/rain collisions
    for (let i = 0; i < clouds.length; i++) {
        for (let j = i + 1; j < clouds.length; j++) {
            if (dist(clouds[i].x, clouds[i].y, clouds[j].x, clouds[j].y) < 100) {
                if (!thunder.active) {
                    thunder.active = true;
                    thunder.frames = 30;
                    thunder.pos1 = createVector(clouds[i].x, clouds[i].y);
                    thunder.pos2 = createVector(clouds[j].x, clouds[j].y);
                    if (!rain.isPlaying()) rain.play();
                }
                startRain();
            }
        }
    }
}


function handleEvaporation(){
    if(sun.y > height - 300 && !cloudFormed){
        for(let i = 0; i<2; i++){
            vaporParticles.push(new VaporParticle());
        }
        sendVaporLED(true);
        if(!vapour.isPlaying()){
            vapour.play();
        }
    }else{
        sendVaporLED(false);
        if(vapour.isPlaying()){
            vapour.stop();
        }
    }

    for(let i = vaporParticles.length -1; i>=0; i--){
        vaporParticles[i].update();
        vaporParticles[i].show();

        if(vaporParticles[i].finished()){
            cloudParticles.push(vaporParticles[i].pos.copy());
            vaporParticles.splice(i,1);
        }
    }
    if(cloudParticles.length >150 && !cloudFormed){
        cloudFormed = true; 
        cowSpeed   = fastCowSpeed;
        crowActive = true;
        clouds.push(new Cloud(150, 100));
        clouds.push(new Cloud(width/2, 80));
        clouds.push(new Cloud(width-150, 100));
        sun.x = 700;
        sun.y = 100;
        sun.size = sun.originalSize;
    }
}
function handleRain(){
  
    sendRainLED(rainParticles.length > 0);
  
    for(let i = rainParticles.length-1; i>=0; i--){
        rainParticles[i].update();
        rainParticles[i].show();
        if(rainParticles[i].pos.y > lake.y){
            rainParticles.splice(i, 1);

            if(rainParticles.length ===0 ){
                sendRainLED(false);
                clouds = [];
                rain.stop();
                cloudFormed = false; 
                cloudParticles = [];
                
                cowSpeed   = initialCowSpeed;
                crowActive = true;
                for (let i = 0; i < numCows; i++) {
                  cowXs[i] = -cowImg.width * cowScale - i * 60;
                }
            }
        }
    }
}

function startRain() {
    sendRainLED(true); 
    for (let i = 0; i < 20; i++) {
        rainParticles.push(new RainParticle());
    }
}

function drawSun(){
    fill(255, 204, 0);
    noStroke();
    ellipse(sun.x, sun.y, sun.size);

    for(let i = 0; i<12; i++){
        let angle = (i * PI)/6;
        let x1 = sun.x + cos(angle) * sun.size/2;
        let y1 = sun.y + sin(angle) * sun.size/2;
        let x2 = sun.x + cos(angle) * sun.size;
        let y2 = sun.y + sin(angle) * sun.size;
        stroke(255, 204, 0, 100);
        line(x1, y1, x2, y2);
    }
}

function drawThunder(){
    if(thunder.frames > 0){
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
    }else{
        thunder.active = false;
        sendThunderLED(false);
    }
}

function drawIsland(){
    fill(194, 178, 128);
    noStroke();
    beginShape();
    vertex(0, 450);
    vertex(300, 400);
    vertex(500, 450);
    vertex(450, 420);
    vertex(500, 500);
    vertex(0, 500);
    endShape(CLOSE);
}

function drawMountains(){
    fill(120, 120, 120);
    noStroke();

    beginShape();
    vertex(0,450);
    vertex(150, 62);
    vertex(300, 450);
    endShape(CLOSE);


    fill(100, 100, 100);
    vertex(246, 445);
    vertex(350, 103);
    vertex(450, 450);
    endShape(CLOSE);
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

// Dotted‐white arrow helper
function drawDottedArrow(x1, y1, x2, y2) {
  const dotSpacing = 15;
  const dotSize    = 5;
  
  // direction vector
  let v   = createVector(x2 - x1, y2 - y1);
  let len = v.mag();
  let dir = v.copy().normalize();

  // draw dots along the shaft
  noStroke();
  fill(255);
  for (let d = 0; d <= len; d += dotSpacing) {
    let pos = p5.Vector.add(createVector(x1, y1), p5.Vector.mult(dir, d));
    ellipse(pos.x, pos.y, dotSize);
  }

  // arrowhead
  push();
    translate(x2, y2);
    let angle = atan2(y2 - y1, x2 - x1);
    rotate(angle);
    noStroke();
    fill(255);
    // simple triangle pointing to the right
    triangle(0, 0, -12, -6, -12, 6);
  pop();
}

// Guided arrow for two phases
function drawGuideArrow() {
  textAlign(CENTER, CENTER);
  textSize(18);
  fill(255);

  if (!cloudFormed) {
    // Phase 1: guide to drag sun to lake
    if (!sun.isDragging && sun.x === 700 && sun.y === 100) {
      // instruction text above the sun
      text(
        "Drag the sun toward the lake",
        sun.x,
        sun.y - sun.size/2 - 20
      );
      // arrow from sun to lake edge
      drawDottedArrow(
        sun.x,
        sun.y,
        sun.x - 150,
        lake.y - 50
      );
    }

  } else {
    // Phase 2: guide to collide the first two clouds (before rain starts)
    if (rainParticles.length === 0 && clouds.length >= 2) {
      let c1 = clouds[0];
      let c2 = clouds[1];
      // instruction text midway above the two clouds
      let midX = (c1.x + c2.x) * 0.5;
      let midY = (c1.y + c2.y) * 0.5 - 30;
      text(
        "Drag clouds together to start rain",
        midX,
        midY
      );
      // arrow from cloud[0] toward cloud[1]
      drawDottedArrow(
        c1.x,
        c1.y,
        c2.x,
        c2.y
      );
    }
  }
}
function drawLake(){
    fill(30, 144, 255);
    noStroke();
    rect(0, lake.y, width, lake.height);
}
function drawVapor(){
    for(let p of vaporParticles){
        p.show();
    }

}

function drawCows() {
  for (let i = 0; i < numCows; i++) {
    cowXs[i] += cowSpeed;
    if (cowXs[i] > width) {
      if (cloudFormed) {
        // once a crow leaves, turn them all off
        crowActive = false;
        return;
      } else {
        // normal wrap when no big clouds
        cowXs[i] = -cowImg.width * cowScale;
      }
    }
    image(
      cowImg,
      cowXs[i], cowYs[i],
      cowImg.width * cowScale,
      cowImg.height * cowScale
    );
  }
}
  

function windowResized() {
  // 1) grow/shrink your canvas
  resizeCanvas(windowWidth, windowHeight);

  // 2) resize the video capture too
  video.size(windowWidth, windowHeight);

  // 3) keep your lake flush to the bottom
  lake.y = height - lake.height;
}

function preload(){
    bodyPose = ml5.bodyPose("BlazePose", modelReady);
    music = loadSound('ocean.mp3');
    vapour = loadSound('vapour.mp3');
    rain = loadSound('rain.mp3');
    mountain = loadImage('moutain.png');
    cloud1   = loadImage('cloud1.png');  // fixed typo
    cloud2   = loadImage('cloud2.png');
    cowImg = loadImage('crow.gif');
}

function setup(){
   createCanvas(windowWidth, windowHeight);
  
    cloud1X = width + 20;    // start just off right edge
    cloud1Y =  50;
    cloud2X = width + 200;   // staggered start
    cloud2Y = 100;
  
    music.loop();
    lake.y = height - lake.height;
    video = createCapture(VIDEO);
    video.size(windowWidth, windowHeight);
    video.hide();
    bodyPose.detectStart(video, gotPoses);
    drawGuideArrow();
  
  // pick a "base" level just below cloud1
  const baseY = cloud1Y + 20;

  // stagger the three cows offscreen left
  for (let i = 0; i < numCows; i++) {
    cowXs[i] = -cowImg.width * cowScale - i * 60;
  }

  // assign each cow a slight vertical offset: up, center, down
  const spread = 15;
  cowYs = [
    baseY - spread,   // one above
    baseY,            // one at center
    baseY + spread    // one below
  ];
  cowSpeed   = initialCowSpeed;
  crowActive = true;
}


function draw() {
  // 1) clear & darken sky if needed
  if (cloudFormed) {
    background(120, 160, 200);
  } else {
    background(135, 206, 235);
  }

  // 2) draw static/back-of-scene elements
  image(mountain, 0, 0, width, 550);
  if (!cloudFormed) {
    // drifting clouds
    cloud1X -= cloudSpeed;
    if (cloud1X < -cloud1.width*0.15) cloud1X = width;
    image(cloud1, cloud1X, cloud1Y, cloud1.width*0.15, cloud1.height*0.15);

    cloud2X -= cloudSpeed*1.2;
    if (cloud2X < -cloud2.width*0.15) cloud2X = width;
    image(cloud2, cloud2X, cloud2Y, cloud2.width*0.15, cloud2.height*0.15);
  }

  // 3) draw your guide arrow *each frame*
  drawGuideArrow();

  // 4) draw/interact scene
  handleSunInteraction();
  drawLake();
  drawSeWaves0();
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

  // 5) cows (only if active)
  if (crowActive) {
    drawCows();
  }

  if (thunder.active) {
    drawThunder();
  }

  // 6) serial drag-state updates
  if (sun.isDragging && !wasDragging) sendSerialChar('1');
  if (!sun.isDragging && wasDragging) sendSerialChar('0');
  wasDragging = sun.isDragging;
}



class Cloud {
  constructor(x, y){
    this.x    = x;
    this.y    = y; 
    this.size = random(80, 120);

    // pick one of the two images at random
    this.img = random([cloud1, cloud2]);
    
    // preserve aspect ratio
    this.ratio = this.img.height / this.img.width;
  }

  show() {
    // draw the image centered at (x,y), scaled to this.size
    let w = this.size;
    let h = this.size * this.ratio;
    image(
      this.img,
      this.x - w/2,
      this.y - h/2,
      w, h
    );
  }
}


class VaporParticle{
    constructor(){
        this.pos = createVector(random(width), lake.y -10);
        this.vel = createVector(random(-0.5, 0.5), random(-3, -1));
        this.alpha = 255;

    }

    update(){
        this.pos.add(this.vel);
        this.alpha -=2;

    }

    show(){
        noStroke();
        fill(255, this.alpha);
        ellipse(this.pos.x, this.pos.y, 6);
    }

    finished(){
        return this.alpha <=0;

    }

}

class RainParticle{
    constructor(){
        this.pos = createVector(random(width), 0);
        this.speed = random(5, 15);

    }

    update(){
        this.pos.y += this.speed;
    }

    show(){
        stroke(100, 100, 255);
        line(this.pos.x, this.pos.y, this.pos.x, this.pos.y+10);
        
    }
}

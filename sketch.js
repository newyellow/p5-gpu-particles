
let shader_drawParticle;
let geometry_particles;

let _canvas;
let _mainCanvas;

let particleData;
let extraData;

let mainHue = 0;

let smoothedMousePos = [0.0, 0.0];

function preload() {
  extraData = new NYGPGpu();
  particleData = new NYGPGpu();

  particleData.loadShader('particleMoveShader.vert', 'particleMoveShader.frag');
  shader_drawParticle = loadShader('steamShader.vert', 'steamShader.frag');
}

async function setup() {
  console.log("in setup");
  _mainCanvas = createCanvas(windowWidth, windowHeight, WEBGL);
  background(random(100, 200));
  frameRate(60);


  _canvas = createGraphics(width, height, WEBGL);
  _canvas.background(random(10, 200));
  _canvas.noStroke();

  mainHue = random(0, 360);

  initData();
  initModels();
}

function initData() {

  // particle data
  for (let i = 0; i < 65536; i++) {

    // let x = random(0, width);
    let x = i % 256;
    let y = int(i / 256);
    let rot = random(0, 360);

    let xData = x / 256 * width;
    let yData = y / 256 * height;

    // set x
    particleData.setDataValue(i, xData - 0.5 * width, 0);

    // set y
    particleData.setDataValue(i, yData - 0.5 * height, 1);

    // set rot
    particleData.setDataValue(i, rot, 2);

    // set speed
    particleData.setDataValue(i, 0, 3);
  }

  // set random values
  for (let i = 0; i < 65536; i++) {

    // seed
    extraData.setDataValue(i, random(-8000, 8000), 0);

    let h = mainHue + random(30, 60);
    if (random() < 0.2)
      h += 180;
    h = h % 360;

    let s = random(60, 100);
    let v = random(80, 100);

    let rgbColor = HSVtoRGB(h / 360, s / 100, v / 100);


    // particle color
    extraData.setDataValueXYZ(i, [rgbColor.r, rgbColor.g, rgbColor.b], 1);

    // lifeOffset
    extraData.setDataValue(i, random(0.6, 3), 2);

    // life
    extraData.setDataValue(i, random(1, 6), 3);
  }

}

function initModels() {
  // prepare model
  let particleModel = new NYModel('particle');

  let particleW = 2;
  let particleH = 8;

  // for (let i = 0; i < 100; i++) {
  //   let uvX = ((i % 10) + 0.5) / 20;
  //   let uvY = (int(i / 10) + 0.5) / 20;

  //   let quadUv = [uvX, uvY];

  //   let p1x = - 0.5 * particleW;
  //   let p1y = - 0.5 * particleH;
  //   let p2x = + 0.5 * particleW;
  //   let p2y = - 0.5 * particleH;
  //   let p3x = + 0.5 * particleW;
  //   let p3y = + 0.5 * particleH;
  //   let p4x = - 0.5 * particleW;
  //   let p4y = + 0.5 * particleH;

  //   particleModel.addQuad(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, quadUv, quadUv, quadUv, quadUv);
  // }
  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
      let uvX = (x + 0.5) / 512;
      let uvY = (y + 0.5) / 512;

      let quadUv = [uvX, uvY];
      let p1x = - 0.5 * particleW;
      let p1y = - 0.5 * particleH;
      let p2x = + 0.5 * particleW;
      let p2y = - 0.5 * particleH;
      let p3x = + 0.5 * particleW;
      let p3y = + 0.5 * particleH;
      let p4x = - 0.5 * particleW;
      let p4y = + 0.5 * particleH;

      particleModel.addQuad(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, quadUv, quadUv, quadUv, quadUv);
    }
  }

  geometry_particles = particleModel.build(_canvas._renderer);

}

let isA = false;
let showParticleTexture = false;

function draw() {

  smoothedMousePos[0] = lerp(smoothedMousePos[0], mouseX - 0.5 * width, 0.12);
  smoothedMousePos[1] = lerp(smoothedMousePos[1], mouseY - 0.5 * height, 0.12);

  // process particle data
  particleData.setUniform('uTime', frameCount / 30.0);
  particleData.setUniform('uScreenSize', [width, height]);
  particleData.setUniform('uExtraTexture', extraData.getTexture());
  particleData.setUniform('uMousePos', smoothedMousePos);
  particleData.process();
  

  // draw particles
  _canvas.background(0);
  _canvas.noStroke();

  // _canvas.clear();
  _canvas.shader(shader_drawParticle);
  _canvas.blendMode(ADD);
  shader_drawParticle.setUniform('uScreenSize', [width, height]);
  shader_drawParticle.setUniform('uMousePos', smoothedMousePos);
  shader_drawParticle.setUniform('uDataTexture', particleData.getTexture());
  shader_drawParticle.setUniform('uExtraTexture', extraData.getTexture());
  shader_drawParticle.setUniform('uTime', frameCount / 30.0);

  _canvas.model(geometry_particles);
  _canvas.resetShader();
  _canvas.blendMode(BLEND);

  // debug
  if (showParticleTexture) {
    _canvas.push();
    _canvas.translate(-0.5 * width, -0.5 * height);
    _canvas.image(particleData.getTexture(), 0, 0, 512, 512);
    _canvas.image(extraData.getTexture(), 512, 0, 512, 512);
    _canvas._renderer.getTexture(particleData.getTexture()).setInterpolation(NEAREST, NEAREST);
    _canvas._renderer.getTexture(extraData.getTexture()).setInterpolation(NEAREST, NEAREST);
    _canvas.pop();
  }

  image(_canvas, -0.5 * width, -0.5 * height);
}

function keyPressed(e) {
  if (e.key == 't' || e.key == 't') {
    showParticleTexture = !showParticleTexture;
  }

  if (e.key == 's') {
    save(texture_initialData);
  }
}

// h, s, v : 0.0 ~ 1.0
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}
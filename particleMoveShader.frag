precision highp float;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  float inRatio = clamp(0.0, 1.0, (value - inMin) / (inMax - inMin));
  return outMin + inRatio * (outMax - outMin);
}

// noise things
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }
// noise things


// helpers
vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
}
// helpers

// data packing stuff
float color3ToValue(vec3 color) {
  return color.r * 255.0 + color.g * 65280.0 + color.b * 16711680.0;
}

vec3 valueToColor3(float value)
{
  float clampedValue = floor(value); // raw is a large int
  float z = floor(clampedValue / 65536.0);
  float y = floor((clampedValue - z * 65536.0) / 256.0);
  float x = mod(clampedValue, 256.0);

  return vec3(x/255.0, y/255.0, z/255.0);
}

// for custom range remap -8192 ~ 8192
float realToRaw(float realValue)
{
  return (realValue + 8192.) * 1024.;
}

float rawToReal(float rawValue)
{
  return rawValue / 1024. - 8192.;
}

float unpack3(vec3 color)
{
  return rawToReal(color3ToValue(color.xyz));
}

vec3 pack3(float value)
{
  return valueToColor3(realToRaw(value));
}
// data packing stuff

// split into 4 texture helper
int getDataSetIndex (vec2 uv)
{
  if(uv.x < 0.5 && uv.y < 0.5)
    return 0;
  
  if(uv.x >= 0.5 && uv.y < 0.5)
    return 1;
  
  if(uv.x < 0.5 && uv.y >= 0.5)
    return 2;
  
  return 3;
}

vec2 getSetMultipler(int setIndex)
{
  return vec2(mod(float(setIndex), 2.0), floor(float(setIndex)/2.0));
}

vec2 getSetMultipler(vec2 uv)
{
  vec2 uvSet = vec2(0.0, 0.0);

  if(uv.x < 0.5)
    uvSet.x = 0.0;
  else
    uvSet.x = 1.0;
  
  if(uv.y < 0.5)
    uvSet.y = 0.0;
  else
    uvSet.y = 1.0;
  
  return uvSet;
}

vec2 getTargetDataUV(vec2 uv, vec2 fromSet, vec2 targetSet)
{
  vec2 setDiff = targetSet - fromSet;
  return vec2(uv.x + setDiff.x * 0.5, uv.y + setDiff.y * 0.5);
}

float getDataBySetIndex(sampler2D targetTexture, vec2 nowUv, int targetSet)
{
  vec2 fromSetMultiplier = getSetMultipler(nowUv);
  vec2 targetSetMultiplier = getSetMultipler(targetSet);

  vec2 targetDataUV = getTargetDataUV(nowUv, fromSetMultiplier, targetSetMultiplier);
  vec4 textureData = texture2D(targetTexture, targetDataUV);

  return unpack3(textureData.xyz);
}
// split into 4 texture helper

varying vec2 vTexCoord;

uniform sampler2D uDataTexture;
uniform sampler2D uExtraTexture;
uniform vec2 uScreenSize;
uniform vec2 uMousePos;
uniform float uTime;

#define DEG_TO_RAD 0.0174532925

void main() {

  int dataSetIndex = getDataSetIndex(vTexCoord);

  float posX = getDataBySetIndex(uDataTexture, vTexCoord, 0);
  float posY = getDataBySetIndex(uDataTexture, vTexCoord, 1);
  float rot = getDataBySetIndex(uDataTexture, vTexCoord, 2);
  float vel = getDataBySetIndex(uDataTexture, vTexCoord, 3);

  float seedValue = getDataBySetIndex(uExtraTexture, vTexCoord, 0);
  float lifeOffset = getDataBySetIndex(uExtraTexture, vTexCoord, 2);
  float lifeLimit = getDataBySetIndex(uExtraTexture, vTexCoord, 3);
  float remainLife = 1.0 - fract((uTime + lifeOffset)/lifeLimit);
  // float remainLife = mod(uTime, 60.0);

  float distToMouse = distance(vec2(posX, posY), uMousePos);
  float shortSideLength = uScreenSize.x < uScreenSize.y ? uScreenSize.x : uScreenSize.y;

  // move x
  if(dataSetIndex == 0)
  {
    if(remainLife < 0.1)
    {
      float rotAngle = mod(uTime * 60.0, 360.0);
      float spawnSide = floor(random(vec2(uTime, seedValue)) * 4.0);
      
      if(spawnSide == 0.0)
      {
        posX = (random(vec2(uTime + 10.0, seedValue)) * 2.0 - 1.0) * 0.16 * shortSideLength;
        posY = -0.16 * shortSideLength;
      }
      else if(spawnSide == 1.0)
      {
        posX = 0.16 * shortSideLength;
        posY = (random(vec2(uTime + 20.0, seedValue)) * 2.0 - 1.0) * 0.16 * shortSideLength;
      }
      else if(spawnSide == 2.0)
      {
        posX = (random(vec2(uTime + 10.0, seedValue)) * 2.0 - 1.0) * 0.16 * shortSideLength;
        posY = 0.16 * shortSideLength;
      }
      else
      {
        posX = -0.16 * shortSideLength;
        posY = (random(vec2(uTime + 20.0, seedValue)) * 2.0 - 1.0) * 0.16 * shortSideLength;
      }

      vec2 rotatedPos = rotate(vec2(posX, posY), rotAngle * DEG_TO_RAD);
      posX = rotatedPos.x;

      // posX = sin(circleAngle * DEG_TO_RAD) * shortSide * 0.25;
    }
    else
    {
      posX += sin(rot * DEG_TO_RAD) * vel * 0.1;
    }
    
    gl_FragColor = vec4(pack3(posX), 1.0);
  }

  // move Y
  else if(dataSetIndex == 1)
  {
    if(remainLife < 0.1)
    {
      // float circleAngle = random(vec2(uTime, seedValue)) * 360.0;      
      // posX = sin(circleAngle * DEG_TO_RAD) * shortSide * 0.25;
      // posY = posMultiplier * shortSide * 0.25;

      float rotAngle = mod(uTime * 60.0, 360.0);
      float spawnSide = floor(random(vec2(uTime, seedValue)) * 4.0);

      if(spawnSide == 0.0)
      {
        posX = (random(vec2(uTime + 10.0, seedValue)) * 2.0 - 1.0) * 0.16 * shortSideLength;
        posY = -0.16 * shortSideLength;
      }
      else if(spawnSide == 1.0)
      {
        posX = 0.16 * shortSideLength;
        posY = (random(vec2(uTime + 20.0, seedValue)) * 2.0 - 1.0) * 0.16 * shortSideLength;
      }
      else if(spawnSide == 2.0)
      {
        posX = (random(vec2(uTime + 10.0, seedValue)) * 2.0 - 1.0) * 0.16 * shortSideLength;
        posY = 0.16 * shortSideLength;
      }
      else
      {
        posX = -0.16 * shortSideLength;
        posY = (random(vec2(uTime + 20.0, seedValue)) * 2.0 - 1.0) * 0.16 * shortSideLength;
      }

      vec2 rotatedPos = rotate(vec2(posX, posY), rotAngle * DEG_TO_RAD);
      posY = rotatedPos.y;
    }
    else
    {
      posY += cos(rot * DEG_TO_RAD) * vel * 0.1;
    }
    
    gl_FragColor = vec4(pack3(posY), 1.0);
  }

  // rotation
  else if(dataSetIndex == 2)
  {
    float addRatio = map(distToMouse, 0.0, shortSideLength * 0.2, 0.6, 0.08);
    float noiseLevel = map(distToMouse, 0.0, shortSideLength * 0.2, 0.0001, 0.004);

    float newRot = snoise(vec3(posX * noiseLevel, posY * noiseLevel, uTime * 0.12)) * 360.0;
    // float newRot = snoise(vec3(posX * noiseLevel, posY * noiseLevel, uTime * 0.12)) * 360.0;
    // rot = mix(rot, newRot, 0.08);
    rot = mix(rot, newRot, addRatio);

    gl_FragColor = vec4(pack3(rot), 1.0);
  }

  // velosity
  else if(dataSetIndex == 3)
  {
    float addSpeed = map(distToMouse, 0.0, shortSideLength * 0.2, 60., 10.0);

    float noiseVel = snoise(vec3(posX * 0.012, posY * 0.012, uTime * 0.12)) * 0.5 + 0.5; //-1~1 - > 0 ~ 1
    // vel += noiseVel * 20.0;
    vel += noiseVel * addSpeed;
    vel *= 0.88;

    if(remainLife < 0.05)
    {
      vel = 0.0;
    }
    
    gl_FragColor = vec4(pack3(vel), 1.0);
  }

  else
  {
    gl_FragColor = texture2D(uDataTexture, vTexCoord);
  }
}
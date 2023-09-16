precision mediump float;

// noise things
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
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


// default values
attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;
// default values 

#define DEG_TO_RAD 0.0174532925

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec4 vColor;
varying vec2 vTexCoord;
varying float vAlpha;
varying float vDistToMouse;

// particle textures
uniform vec2 uScreenSize;

uniform sampler2D uDataTexture;
uniform sampler2D uExtraTexture;

uniform vec2 uMousePos;
uniform float uMoveSpace;
uniform float uTime;

void main () {
    
    float posX = getDataBySetIndex(uDataTexture, aTexCoord, 0);
    float posY = getDataBySetIndex(uDataTexture, aTexCoord, 1);
    float rot = getDataBySetIndex(uDataTexture, aTexCoord, 2);
    float vel = getDataBySetIndex(uDataTexture, aTexCoord, 3);

    float seedValue = getDataBySetIndex(uExtraTexture, aTexCoord, 0);
    vec4 particleColor = texture2D(uExtraTexture, aTexCoord + vec2(0.5, 0.0));
    float lifeOffset = getDataBySetIndex(uExtraTexture, aTexCoord, 2);
    float lifeLimit = getDataBySetIndex(uExtraTexture, aTexCoord, 3);
    float remainLife = 1.0 - fract((uTime + lifeOffset)/lifeLimit);

    vec2 vertexPos = rotate(aPosition.xy, rot * DEG_TO_RAD);
    vertexPos.x += posX;
    vertexPos.y += posY;

    vec4 vPosition = vec4(vertexPos, 0.0, 1.0);
    gl_Position = uProjectionMatrix * uModelViewMatrix * vPosition;

    vTexCoord = aTexCoord;
    vColor = particleColor;
    vAlpha = clamp(0.0, 1.0, remainLife - 0.1); // fade out in the last 1 sec

    float distToMouse = distance(vec2(posX, posY), uMousePos);
    vDistToMouse = distToMouse;
    // vAlpha = 1.0;
}



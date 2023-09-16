precision mediump float;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  float inRatio = clamp(0.0, 1.0, (value - inMin) / (inMax - inMin));
  return outMin + inRatio * (outMax - outMin);
}

// All components are in the range [0��1], including hue.
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// All components are in the range [0��1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float easeInCubic(float value) {
    return value * value * value;
}

float easeInOutSine(float x) {
    return -(cos(3.141592653 * x) - 1.0) / 2.0;
}

uniform vec2 uScreenSize;

varying vec2 vTexCoord;
varying float vDistToMouse;
varying vec4 vColor;
varying float vAlpha;

void main() {

    float shortSide = uScreenSize.x < uScreenSize.y ? uScreenSize.x : uScreenSize.y;
    float mouseDistRatio = easeInOutSine(map(vDistToMouse, 0.0, shortSide * 0.36, 1.0, 0.0));

    vec3 hsvColor = rgb2hsv(vColor.xyz);
    float shiftAmount = mix(0.0, 0.3, mouseDistRatio);
    float shiftedHue = fract(hsvColor.x + shiftAmount);
    vec3 shiftedColor = hsv2rgb(vec3(shiftedHue, hsvColor.yz));

    vec3 drawColor = shiftedColor;
    float colorAlpha = vAlpha * 0.3;
    drawColor *= colorAlpha;
    
    drawColor = mix(drawColor, shiftedColor, mouseDistRatio);
    // float r = vTexCoord.x * colo
    // float g = vTexCoord.y * 0.3;
    // float b = vAlpha * 0.3;

    // gl_FragColor = vec4(r, g, b, 1.0);
    gl_FragColor = vec4(drawColor.xyz, 1.0);
    // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    // gl_FragColor = vec4(vTexCoord.x, 1.0, vTexCoord.y, 1.0);
    // gl_FragColor = vec4(stepValue, stepValue, stepValue, 1.0);

    // if(vTexCoord.y > 0.95)
    //     gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    // else
    //     gl_FragColor = vec4(1.0, vTexCoord.x, 1.0, 1.0);
}
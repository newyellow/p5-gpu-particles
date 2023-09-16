precision highp float;

// default values
attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;
// default values 

#define DEG_TO_RAD 0.0174532925

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec2 vTexCoord;

void main () {
    
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  vTexCoord = aTexCoord;
}



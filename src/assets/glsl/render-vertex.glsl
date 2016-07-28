uniform sampler2D tOriginalPositions;
uniform sampler2D tPositions;
uniform sampler2D tData;
uniform float pointSize;
uniform float texSize;

varying vec4 vPos;

void main() {

    vec2 uv = position.xy + vec2(0.5 / texSize, 0.5 / texSize);
    vec4 pos = texture2D(tPositions, uv);
    vPos = pos;
    vec4 data = texture2D(tData, uv);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
    gl_PointSize = data.y;
}
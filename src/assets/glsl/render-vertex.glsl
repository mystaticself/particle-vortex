uniform sampler2D tOriginalPositions;
uniform sampler2D tPositions;//RenderTarget containing the transformed positions
uniform sampler2D tData;
uniform float pointSize;
uniform float texSize;

varying vec4 vPos;
// varying vec4 vOriginalPos;

void main() {

    vec2 uv = position.xy + vec2(0.5 / texSize, 0.5 / texSize);
    vec4 pos = texture2D(tPositions, uv);
    vPos = pos;

    // vec4 oPos = texture2D(tOriginalPositions, uv);
    // vOriginalPos = oPos;

    // vec4 pos = texture2D(tPositions, position.xy);


    vec4 data = texture2D(tData, uv);
    // vec3 otherVals = texture2D(tData, position.xy).xyz;

    //regular projection of our position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);

    //sets the point size
    // gl_PointSize = pointSize;
    // gl_PointSize = pos.a;
    gl_PointSize = data.y;
    // gl_PointSize = sin(pos.x) * data.y;
    // gl_PointSize = length(pos) * 0.025;
}
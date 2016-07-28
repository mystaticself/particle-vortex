#pragma glslify: hsl2rgb = require(glsl-hsl2rgb)

uniform sampler2D map;
varying vec4 vPos;
// varying vec4 vOriginalPos;

void main()
{
    // vec3 rgb = hsl2rgb((vPos.x + vPos.y)/360.0, 1.0, 0.5);
    // float dist = distance(vOriginalPos.xyz, vPos.xyz) * 0.005;
    // float opacity = smoothstep(0.0, 0.5, dist) * 0.5;
    vec3 rgb = hsl2rgb(length(vPos)/150.0, 1.0, 0.65);
    // vec3 rgb = hsl2rgb(1.0 - (length(vPos)/180.0), 1.0, 0.5);
    gl_FragColor = vec4(rgb, vPos.a) * texture2D(map, gl_PointCoord);
    // gl_FragColor = vec4(rgb, vPos.a * sin(gl_FragCoord.x / 2.0)) * texture2D(map, gl_PointCoord);

    if(vPos.a < 0.05)
    {
        discard;
    }
}
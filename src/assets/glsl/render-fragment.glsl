#pragma glslify: hsl2rgb = require(glsl-hsl2rgb)

uniform sampler2D map;
varying vec4 vPos;

void main()
{
    vec3 rgb = hsl2rgb(length(vPos)/150.0, 1.0, 0.65);
    gl_FragColor = vec4(rgb, vPos.a) * texture2D(map, gl_PointCoord);

    if(vPos.a < 0.05)
    {
        discard;
    }
}
#pragma glslify: curl = require(glsl-curl-noise/curl)
#pragma glslify: rotate = require(./rotate)

uniform sampler2D tOriginalPositions;
uniform sampler2D tPositions;
uniform sampler2D tData;
uniform float curlScale;
uniform float amplitude;
uniform float time;
uniform vec3 mousePosition;
uniform float forceStrength;
uniform float rotation;

varying vec2 vUv;

const vec3 yAxis = vec3(0.0, 1.0, 0.0);

void main() {
    vec4 oPos = texture2D(tOriginalPositions, vUv);
    vec4 pos = texture2D(tPositions, vUv);

    float dist = distance(oPos.xyz, pos.xyz);

    if(dist > 150.0)
    {
        pos = oPos;
        pos.a = 0.0;
    }
    else
    {
        pos.xyz += curl(pos.xyz / amplitude) * curlScale;

        if(pos.a < 0.1)
        {
            pos.a += 0.001;
        }

        float mid = 0.5;
        pos.xyz = rotate(rotation, yAxis, pos.xyz - mid) + mid;

        vec3 force = mousePosition - pos.xyz;
        dist = length(force);
        float strength = forceStrength / (dist * dist);
        force = normalize(force) * strength;

        pos.x -= force.x;
        pos.y -= force.y;
        pos.z -= force.z;
    }

    gl_FragColor = pos;
}
#pragma glslify: curl = require(glsl-curl-noise/curl)
#pragma glslify: rotate = require(./rotate)

uniform sampler2D tOriginalPositions;//DATA Texture containing original positions
uniform sampler2D tPositions;//DATA Texture containing original positions
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

    //basic simulation: displays the particles in place.
    vec4 oPos = texture2D(tOriginalPositions, vUv);
    vec4 pos = texture2D(tPositions, vUv);
    // // vec3 pos = texture2D(tPositions, vUv).xyz + (vUv.xyx * 2.0);
    // vec3 otherVals = texture2D(tData, vUv).xyz;
    // vec3 c = curl(pos + vUv.x + vUv.y + time) * curlScale;
    // pos += (c - pos) * otherVals.x;
    // pos.x += 0.1;
    // pos.a = 1.0;

    // pos.xyz += curl(pos.xyz / amplitude + time) * curlScale;// * 0.1;
    // pos.xyz = mix(oPos.xyz, curl((pos.xyz) / amplitude) * curlScale, 0.1);// * 0.1;

    float dist = distance(oPos.xyz, pos.xyz);

    if(dist > 150.0)
    {
        pos = oPos;
        pos.a = 0.0;
    }
    else
    {
        pos.xyz += curl(pos.xyz / amplitude) * curlScale;// * 0.1;
        // pos.xyz += ((pos.xyz + (curl(pos.xyz / amplitude) * curlScale)) - pos.xyz) * 0.5;

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




    // pos.a = cos(pos.y) * 3.0;
    // pos.a = 1.0 + abs(cos(pos.x) * 2.0);

    // pos.x += cos(pos.y) * 2.0;


    gl_FragColor = pos;
}
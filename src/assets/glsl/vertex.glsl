//#pragma glslify: noise = require(glsl-noise/simplex/2d)
//#pragma glslify: export(myFunction)

void main()
{
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
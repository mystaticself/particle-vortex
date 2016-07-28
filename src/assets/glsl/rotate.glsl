mat3 rotateAngleAxisMatrix(float angle, vec3 axis)
{
    float c = cos(angle);
    float s = sin(angle);
    float t = 1.0 - c;
    axis = normalize(axis);
    float x = axis.x, y = axis.y, z = axis.z;
    return mat3(
        t*x*x + c,    t*x*y + s*z,  t*x*z - s*y,
        t*x*y - s*z,  t*y*y + c,    t*y*z + s*x,
        t*x*z + s*y,  t*y*z - s*x,  t*z*z + c
    );
}

vec3 rotateAngleAxis(float angle, vec3 axis, vec3 v)
{
    return rotateAngleAxisMatrix(angle, axis) * v;
}

#pragma glslify: export(rotateAngleAxis)
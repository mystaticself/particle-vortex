'use strict';

export const axisUp = new THREE.Vector3(0, 1, 0);
export const axisDown = new THREE.Vector3(0, -1, 0);
export const axisLeft = new THREE.Vector3(-1, 0, 0);
export const axisRight = new THREE.Vector3(1, 0, 0);
export const axisForward = new THREE.Vector3(0, 0, 1);
export const axisBackward = new THREE.Vector3(0, 0, -1);

export function degreesToRads(degrees)
{
    return degrees / 180 * Math.PI;
}

export function radsToDegrees(radians)
{
    return radians * 180 / Math.PI;
}

export function getDataTexture(data, width, height, format)
{
    let tex = new THREE.DataTexture(data, width, height, format, THREE.FloatType);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
}

export function createPlane(width, height, color)
{
    return new THREE.Mesh(
        new THREE.PlaneGeometry(width || 1, height || 1),
        new THREE.MeshBasicMaterial({color:color || 0xffffff})
    );
}

//export function createSphere(radius, color)
// {
//     // TODO
// }

//export function createCube(width, height, depth, color)
// {
//     // TODO
// }

export function randomRange(min, max)
{
    return min + Math.random() * (max - min);
}

export function rotateAroundWorldAxisX(object, radians)
{
    let matrix = new THREE.Matrix4();
    matrix.makeRotationX(radians);
    matrix.multiply(object.matrix);
    object.matrix = matrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

export function rotateAroundWorldAxisY(object, radians)
{
    let matrix = new THREE.Matrix4();
    matrix.makeRotationY(radians);
    matrix.multiply(object.matrix);
    object.matrix = matrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

export function rotateAroundWorldAxisZ(object, radians)
{
    let matrix = new THREE.Matrix4();
    matrix.makeRotationZ(radians);
    matrix.multiply(object.matrix);
    object.matrix = matrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

export function rotateAroundWorldAxis(object, axis, radians)
{
    let rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

export function setScale(object, scale)
{
    object.scale.set(scale, scale, scale);
}

export function disposeOfMesh(mesh)
{
    if(!mesh) return;

    if(mesh.parent) mesh.parent.remove(mesh);
    if(mesh.geometry) mesh.geometry.dispose();
    if(mesh.material)
    {
        if(mesh.material.map)
        {
            mesh.material.map.dispose();
        }
        mesh.material.dispose();
    }
}

export function disposeOfChildren(children)
{
    // console.log('disposeOfChildren:', children.length);

    if(!children) return;

    while(children.length > 0)
    {
        disposeOfMesh(children[0]);
    }
}

export function removeAllChildren(object3d)
{
    while(object3d.children.length > 0)
    {
        object3d.remove(object3d.children[0]);
    }
}

export function moveTowards(object, position, easing)
{
    object.position.x += (position.x - object.position.x) * easing;
    object.position.y += (position.y - object.position.y) * easing;
    object.position.z += (position.z - object.position.z) * easing;
}

export function moveVectorTowards(v1, v2, easing)
{
    v1.x += (v2.x - v1.x) * easing;
    v1.y += (v2.y - v1.y) * easing;
    v1.z += (v2.z - v1.z) * easing;
}

export function rotateTowards(object, rotation, easing)
{
    object.rotation.x += (rotation.x - object.rotation.x) * easing;
    object.rotation.y += (rotation.y - object.rotation.y) * easing;
    object.rotation.z += (rotation.z - object.rotation.z) * easing;
}

export function updateCameraMatrices(camera)
{
    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
}

export function meshIsInView(mesh, camera, frustum)
{
    frustum = frustum || new THREE.Frustum();
    updateCameraMatrices(camera);

    mesh.updateMatrix();
    mesh.updateMatrixWorld();

    frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
    return frustum.intersectsObject(mesh);
}

export function getMouseIntersection(mouse, camera, objects, raycaster)
{
    raycaster = raycaster || new THREE.Raycaster();

    raycaster.setFromCamera(mouse, camera);
    let intersections = raycaster.intersectObjects(objects);
    return intersections.length > 0 ? intersections[0] : null;
}

export function objectWorldPositionToScreen(object, camera)
{
    updateCameraMatrices(camera);
    object.updateMatrixWorld();

    let width = window.innerWidth, height = window.innerHeight,
        widthHalf = width / 2, heightHalf = height / 2,
        vector = new THREE.Vector3().setFromMatrixPosition(object.matrixWorld);

    vector.project(camera);
    return {
        x:(vector.x * widthHalf) + widthHalf | 0,
        y:-(vector.y * heightHalf) + heightHalf | 0
    };
}

export function objectWorldPositionToScreenAlt(object, camera)
{
    updateCameraMatrices(camera);
    object.updateMatrixWorld();

    let width = window.innerWidth, height = window.innerHeight,
        pos = new THREE.Vector3().setFromMatrixPosition(object.matrixWorld),
        projScreenMat = new THREE.Matrix4();

        projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        pos.applyMatrix4(projScreenMat);
        // pos.applyProjection(projScreenMat);


        return {
            x: ((pos.x + 1) * width / 2) | 0,
            y: ((-pos.y + 1) * height / 2) | 0
        };
}

export function worldToScreen(position, camera)
{
    updateCameraMatrices(camera);

    let width = window.innerWidth, height = window.innerHeight,
        widthHalf = width / 2, heightHalf = height / 2,
        vector = new THREE.Vector3().copy(position);

    vector.project(camera);
    return {
        x:(vector.x * widthHalf) + widthHalf | 0,
        y:-(vector.y * heightHalf) + heightHalf | 0
    };

    // vector.x = ( vector.x * widthHalf ) + widthHalf;
    // vector.y = - ( vector.y * heightHalf ) + heightHalf;
    // return vector;
}

export function screenToWorld(position, camera)
{
    updateCameraMatrices(camera);

    let x = ( position.x / window.innerWidth ) * 2 - 1,
        y = - ( position.y / window.innerHeight ) * 2 + 1,
        vector = new THREE.Vector3(x, y, 0.5);

    vector.unproject(camera);

    let dir = vector.sub( camera.position ).normalize(),
        distance = - camera.position.z / dir.z;

    return camera.position.clone().add( dir.multiplyScalar( distance ) );
}

export function screenToWorldAtZ(position, z, camera)
{
    // let x = ( position.x / window.innerWidth ) * 2 - 1,
    //     y = - ( position.y / window.innerHeight ) * 2 + 1,
    //     planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), z),
    //     vector = new THREE.Vector3(x, y, 0.5),
    //     projector = new THREE.Projector(),
    //     raycaster = projector.pickingRay(vector, camera);

    // return raycaster.ray.intersectPlane(planeZ);

    let x = ( position.x / window.innerWidth ) * 2 - 1,
        y = - ( position.y / window.innerHeight ) * 2 + 1,
        planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), z),
        vector = new THREE.Vector3(x, y, 0.5),
        raycaster = new THREE.Raycaster(),
        pos;

    // raycaster.pickingRay(vector, camera);
    raycaster.setFromCamera(vector, camera);
    pos = raycaster.ray.intersectPlane(planeZ);
    return pos;
}

export function getMouseWorldPos(mouseScreenPos, camera)
{
    // let vec = new THREE.Vector3(mouseScreenPos.x, mouseScreenPos.y, 0.5).unproject(camera);
    let vec = mouseScreenPos.clone().unproject(camera);
    let dir = vec.sub( camera.position ).normalize();
    let distance = - camera.position.z / dir.z;
    return camera.position.clone().add( dir.multiplyScalar( distance ) );
}

export function getMouseWorldPosAtZ(mouseScreenPos, camera, z)
{
    let planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), z);
    // let vec = new THREE.Vector3(mouseScreenPos.x, mouseScreenPos.y, 0.5);
    let vec = mouseScreenPos;
    let raycaster = new THREE.Raycaster();
    raycaster.pickingRay(vec, camera);
    let pos = raycaster.ray.intersectPlane(planeZ);
    return pos;
}

export function getEdges(mesh)
{
    let edge = [ 0, 0 ],
        hash = {}
        keys = [ 'a', 'b', 'c' ],
        geometry2,
        thresholdDot = Math.cos( THREE.Math.degToRad( 1 ) );

    let sortFunction = function ( a, b ) { return a - b; };

    if ( mesh.geometry instanceof THREE.BufferGeometry ) {
        geometry2 = new THREE.Geometry();
        geometry2.fromBufferGeometry( mesh.geometry );
    } else {
        geometry2 = mesh.geometry.clone();
    }
    geometry2.mergeVertices();
    geometry2.computeFaceNormals();

    let vertices = geometry2.vertices,
        faces = geometry2.faces,
        facesOriginal = mesh.geometry.faces,
        key;

    for ( let i = 0, l = faces.length; i < l; i ++ ) {

        let face = faces[ i ];

        for ( let j = 0; j < 3; j ++ ) {

            edge[ 0 ] = face[ keys[ j ] ];
            edge[ 1 ] = face[ keys[ ( j + 1 ) % 3 ] ];
            edge.sort( sortFunction );

            key = edge.toString();

            if ( hash[ key ] === undefined ) {
                hash[ key ] = { vert1: edge[ 0 ], vert2: edge[ 1 ], face1: i, face2: undefined };
            } else {
                hash[ key ].face2 = i;
            }
        }
    }

    let edges = [];

    for ( key in hash ) {
        let h = hash[ key ];
        if ( h.face2 === undefined || faces[ h.face1 ].normal.dot( faces[ h.face2 ].normal ) <= thresholdDot )
        {
            edges.push({
                vertex1:vertices[ h.vert1 ],
                vertex2:vertices[ h.vert2 ],
                // face1:faces[ h.face1 ],
                // face2:faces[ h.face2 ],
                face1:facesOriginal[ h.face1 ],
                face2:facesOriginal[ h.face2 ],
                faceIndex1: h.face1,
                faceIndex2: h.face2
            });
        }
    }

    return edges;
}

export function addFragmentFogInjections(fragmentShader)
{
    let lines = fragmentShader.split('\n'),
        len = lines.length;

    for(let i = 0; i < len; i++)
    {
        if(lines[i] === '/*#FOG_INJECTION_1#*/'){
            lines[i] = THREE.ShaderChunk['fog_pars_fragment'];
        }else if(lines[i] === '/*#FOG_INJECTION_2#*/'){
            lines[i] = THREE.ShaderChunk['fog_fragment'];
        }
    }
    return lines.join('\n');
}

export function pointOnSphere(r, a1, a2)
{
    return {
        x: r * Math.cos(a1) * Math.sin(a2),
        y: r * Math.sin(a1) * Math.sin(a2),
        z: r * Math.cos(a2)
    };
}

export function getPointsOnSphere(n)
{
    let pts = [],
        pt;

    for(let i = 0; i < n; i++)
    {
        pt = pointOnSphere(1, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        pts.push(new THREE.Vector3( pt.x, pt.y, pt.z ));
    }

    return pts;
}

export function getPointsWithinSphere(n, maxRadius)
{
    let pts = [],
        pt;

    for(let i = 0; i < n; i++)
    {
        pt = pointOnSphere(Math.random() * maxRadius, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        pts.push(new THREE.Vector3( pt.x, pt.y, pt.z ));
    }

    return pts;
}

export function getPointsOnSphereEvenly(n)
{
    let pts = [],
        inc = Math.PI * (3 - Math.sqrt(5)),
        off = 2.0 / n,
        x, y, z, r,
        phi;

    for (let k = 0; k < n; k++){
        y = k * off - 1 + (off /2);
        r = Math.sqrt(1 - y * y);
        phi = k * inc;
        x = Math.cos(phi) * r;
        z = Math.sin(phi) * r;

        pts.push(new THREE.Vector3( x, y, z ));
    }
    return pts;
}

export function getRandomVector3(min, max)
{
    return new THREE.Vector3(randomRange(min, max), randomRange(min, max), randomRange(min, max));
}

export function addRandomVector3(vec, min, max)
{
    return getRandomVector3(min, max).add(vec);
}

export function rotationInDegrees(rotation)
{
    let degrees = 180 / Math.PI;
    return new THREE.Euler(rotation.x * degrees, rotation.y * degrees, rotation.z * degrees, rotation.order);
}

export function loadJSONGeometry(manifest, callback)
{
    let loader = new THREE.JSONLoader(),
        len = manifest.length,
        loaded = 0,
        file,
        id,
        geometriesById = {}
        geometries = [];

    let load = function()
    {
        file = (manifest[loaded].file !== undefined) ? manifest[loaded].file : manifest[loaded];
        id = (manifest[loaded].id !== undefined) ? manifest[loaded].id : null;
        loader.load(file, function(g){
            if(id)
            {
                geometriesById[id] = g;
            }
            geometries.push({geometry:g, id:id});
            loaded++;
            if(loaded === len)
            {
                if(typeof callback === 'function')
                {
                    callback(geometries, geometriesById);
                }
            }
            else
            {
                load();
            }
        });
    };

    load();
}

export function loadTextures(manifest, callback)
{
    let len = manifest.length,
        loaded = 0,
        file,
        id,
        texturesById = {}
        textures = [],
        loader = new THREE.TextureLoader();

    loader.crossOrigin = "";

    let load = function()
    {
        file = (manifest[loaded].file !== undefined) ? manifest[loaded].file : manifest[loaded];
        id = (manifest[loaded].id !== undefined) ? manifest[loaded].id : null;

        loader.load(file, function(tex){
            if(id)
            {
                texturesById[id] = tex;
            }
            textures.push({texture:tex, id:id});
            loaded++;
            if(loaded === len)
            {
                if(typeof callback === 'function')
                {
                    callback(textures, texturesById);
                }
            }
            else
            {
                load();
            }
        });

        // THREE.ImageUtils.loadTexture(file, undefined, function(tex){
        //     if(id)
        //     {
        //         texturesById[id] = tex;
        //     }
        //     textures.push({texture:tex, id:id});
        //     loaded++;
        //     if(loaded === len)
        //     {
        //         if(typeof callback === 'function')
        //         {
        //             callback(textures, texturesById);
        //         }
        //     }
        //     else
        //     {
        //         load();
        //     }
        // });
    };

    load();
}

export function setTextureWrapping(textures, wrapping)
{
    for(let i = 0; i < textures.length; i++)
    {
        textures[i].wrapS = textures[i].wrapT = wrapping;
        textures[i].needsUpdate = true;
    }
}

export function setTextureMipmapping(textures, mipmapping)
{
    for(let i = 0; i < textures.length; i++)
    {
        textures[i].generateMipmaps = mipmapping;
        textures[i].needsUpdate = true;
    }
}

export function setTextureMinMagFilters(textures, minFilter, magFilter)
{
    for(let i = 0; i < textures.length; i++)
    {
        if(minFilter)
            textures[i].minFilter = minFilter;

        if(magFilter)
            textures[i].magFilter = magFilter;

        textures[i].needsUpdate = true;
    }
}

export function injectShaderCode(original, key, injection)
{
    if(Object.prototype.toString.call(injection) === '[object Array]')
    {
        let replacement = '';
        for(let i = 0; i < injection.length; i++)
        {
            replacement += injection[i] + '\n';
        }

        return original.replace(key, replacement);
    }
    else
    {
        return original.replace(key, injection);
    }
}

export function logVector(vector)
{
    console.log(vector.x, vector.y, vector.z);
}

// usage: pass renderer.getContext() & mesh.material.program.program, call render at least once first.
export function logProgramInfo(gl, program) {
    let result = {
        attributes: [],
        uniforms: [],
        attributeCount: 0,
        uniformCount: 0
    }
    activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS),
    activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    // Taken from the WebGl spec:
    // http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.14
    let enums = {
        0x8B50: 'FLOAT_VEC2',
        0x8B51: 'FLOAT_VEC3',
        0x8B52: 'FLOAT_VEC4',
        0x8B53: 'INT_VEC2',
        0x8B54: 'INT_VEC3',
        0x8B55: 'INT_VEC4',
        0x8B56: 'BOOL',
        0x8B57: 'BOOL_VEC2',
        0x8B58: 'BOOL_VEC3',
        0x8B59: 'BOOL_VEC4',
        0x8B5A: 'FLOAT_MAT2',
        0x8B5B: 'FLOAT_MAT3',
        0x8B5C: 'FLOAT_MAT4',
        0x8B5E: 'SAMPLER_2D',
        0x8B60: 'SAMPLER_CUBE',
        0x1400: 'BYTE',
        0x1401: 'UNSIGNED_BYTE',
        0x1402: 'SHORT',
        0x1403: 'UNSIGNED_SHORT',
        0x1404: 'INT',
        0x1405: 'UNSIGNED_INT',
        0x1406: 'FLOAT'
    };

    // Loop through active uniforms
    for (let i=0; i < activeUniforms; i++) {
        let uniform = gl.getActiveUniform(program, i);
        uniform.typeName = enums[uniform.type];
        result.uniforms.push(uniform);
        result.uniformCount += uniform.size;
    }

    // Loop through active attributes
    for (i=0; i < activeAttributes; i++) {
        let attribute = gl.getActiveAttrib(program, i);
        attribute.typeName = enums[attribute.type];
        result.attributes.push(attribute);
        result.attributeCount += attribute.size;
    }

    console.log(result);
}

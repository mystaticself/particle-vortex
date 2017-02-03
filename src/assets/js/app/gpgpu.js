'use strict';

let scene,
    camera,
    mesh,
    rtt1,
    rtt2,
    flip = false;

export default class GPGPU
{
    constructor({renderer, simulationMaterial, renderMaterial, size = 128, format = THREE.RGBFormat})
    {
        const gl = renderer.getContext();

        if(!gl.getExtension('OES_texture_float'))
        {
            alert('No OES_texture_float support for float textures!');
            return;
        }

        if(gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0)
        {
            alert('No support for vertex shader textures!');
            return;
        }

        camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);

        scene = new THREE.Scene();

        mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), simulationMaterial);
        scene.add(mesh);

        const options = {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            type: THREE.HalfFloatType,
            format: format,
            // depth: false,
            stencil: false
        };
        rtt1 = new THREE.WebGLRenderTarget(size, size, options);
        rtt2 = rtt1.clone();

        this.renderer = renderer;
        this.simulationMaterial = simulationMaterial;
        this.renderMaterial = renderMaterial;
    }

    update(propertyName)
    {
        propertyName = propertyName || 'tPositions';

        if(flip)
        {
            this.renderer.render(scene, camera, rtt2, false);
            this.renderMaterial.uniforms[propertyName].value = rtt2.texture;
            this.simulationMaterial.uniforms[propertyName].value = rtt2.texture;
        }
        else
        {
            this.renderer.render(scene, camera, rtt1, false);
            this.renderMaterial.uniforms[propertyName].value = rtt1.texture;
            this.simulationMaterial.uniforms[propertyName].value = rtt1.texture;
        }

        flip = !flip;
    }
}
'use strict';

import {randomRange, randomInt} from '../utils/utils';
import {getDataTexture, getMouseWorldPos} from '../utils/three-utils';
import Loader from '../utils/loader';
import GPGPU from './gpgpu';

const glslify = require('glslify');
const Stats = require('../libs/stats.min');

let scope,
    scene,
    camera,
    renderer,
    container,
    mousePos,
    gpgpu,
    mesh,
    tOriginalPositions,
    tPositions,
    tData,
    simulationMaterial,
    renderMaterial,
    stats;

export default class App
{
    constructor()
    {
        scope = this;

        mousePos = new THREE.Vector3(0, 0, 0.5);

        this.createBaseElements();
        this.addListeners();
        // this.addStats();

        const manifest = [
            {file:'assets/img/particle.png', id:'particle'}
        ];
        this.loadAssets(manifest, function(assets){
            scope.createScene(assets);
            scope.handleResize();
            scope.update();
        });
    }

    loadAssets(manifest, callback)
    {
        const loader = new Loader();

        loader.load(manifest, assets => {
            if(typeof callback === 'function')
            {
                callback(assets);
            }
        });
    }

    createBaseElements()
    {
        let width = window.innerWidth,
            height = window.innerHeight;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.z = 350;

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x121212, 1);
        renderer.setSize(width, height);
        document.body.appendChild(renderer.domElement);
    }

    createScene(assets)
    {
        let texSize = 512,
            format = THREE.RGBAFormat,
            channels = format === THREE.RGBFormat ? 3 : 4,
            len = texSize * texSize * channels,
            data1 = new Float32Array(len),
            data2 = new Float32Array(len),
            size = 50;

        for (var i = 0; i < len; i += channels)
        {
            data1[i + 0] = randomRange(-size, size);
            data1[i + 1] = randomRange(-size, size);
            data1[i + 2] = randomRange(-size, size);
            data1[i + 3] = 0;

            data2[i + 0] = randomRange(0.1, 0.9);
            data2[i + 1] = randomInt(1, 6);
            data2[i + 2] = 0;
            data2[i + 3] = 0;
        }

        tOriginalPositions = getDataTexture(data1, texSize, texSize, format);
        tPositions = getDataTexture(data1, texSize, texSize, format);
        tData = getDataTexture(data2, texSize, texSize, format);

        simulationMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tOriginalPositions: {type:'t', value:tOriginalPositions},
                tPositions: {type:'t', value:tPositions},
                tData: {type:'t', value:tData},
                curlScale: {type:'f', value:1.5},
                amplitude: {type:'f', value:125},
                time: {type:'f', value:0},
                mousePosition: {type:'v3', value:mousePos},
                forceStrength: {type:'f', value:10000},
                rotation: {type:'f', value:0.05}
            },
            vertexShader: glslify('../../glsl/sim-vertex.glsl'),
            fragmentShader: glslify('../../glsl/sim-fragment.glsl')
        });

        renderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tOriginalPositions: {type:'t', value:tOriginalPositions},
                tPositions: {type:'t', value:tPositions},
                tData: {type:'t', value:tData},
                map: {type:'t', value:assets.textures.particle},
                pointSize: {type:'f', value:1},
                texSize: {type:'f', value:texSize}
            },
            vertexShader: glslify('../../glsl/render-vertex.glsl'),
            fragmentShader: glslify('../../glsl/render-fragment.glsl'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
        });

        // particles
        len = texSize * texSize;
        const vertices = new Float32Array(len * 3);
        for(let i = 0; i < len; i++)
        {
            vertices[i * 3 + 0] = (i % texSize) / texSize;
            vertices[i * 3 + 1] = Math.floor(i / texSize) / texSize;
        }

        let geo = new THREE.BufferGeometry();
        geo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

        mesh = new THREE.Points(geo, renderMaterial);
        scene.add(mesh);

        gpgpu = new GPGPU({
            renderer: renderer,
            simulationMaterial: simulationMaterial,
            renderMaterial: renderMaterial,
            size: texSize,
            format: format
        });
    }

    addListeners()
    {
        window.addEventListener('resize', this.handleResize, false);
        window.addEventListener('orientationchange', this.handleResize, false);
        window.addEventListener('mousemove', this.handleMouseMove, false);
    }

    removeListeners()
    {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);
    }

    addStats()
    {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.bottom = '0px';
        document.body.appendChild(stats.domElement);
    }

    handleResize(e)
    {
        let width = window.innerWidth,
            height = window.innerHeight;

        camera.aspect = width / height;

        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    handleMouseMove(e)
    {
        mousePos.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mousePos.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    }

    update()
    {
        simulationMaterial.uniforms.time.value += 0.001;
        simulationMaterial.uniforms.mousePosition.value = getMouseWorldPos(mousePos, camera);

        gpgpu.update('tPositions');

        renderer.render(scene, camera);

        if(stats)
        {
            stats.update();
        }

        requestAnimationFrame(scope.update);
    }

    dispose()
    {
        removeListeners();
    }
}
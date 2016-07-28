'use strict';

// import * as utils from '../utils/utils';
// import * as threeUtils from '../utils/three-utils';
import {randomRange, randomInt} from '../utils/utils';
import {getDataTexture, getMouseWorldPos} from '../utils/three-utils';
import Loader from '../utils/loader';
import EffectsManager from '../post/effects-manager';
import GPGPU from './gpgpu';
// import FBO from './fbo';

const glslify = require('glslify');
const Stats = require('../libs/stats.min');

let scope,
    scene,
    camera,
    renderer,
    container,
    effectsManager,
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
        // this.createEffects();
        this.addListeners();
        // this.addStats();

        const manifest = [
            {file:'assets/img/particle.png', id:'particle'}
        ];
        this.loadAssets(manifest, function(assets){
            // console.log('assets:', assets);
            scope.createScene(assets);
            scope.handleResize();
            scope.update();
        });

        // this.createScene();
        // this.handleResize();
        // this.update();
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
        // camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 0.1, 10000);
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
            data2[i + 1] = randomInt(1, 6);//randomInt(1, 3);
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

        // fbo = new FBO({
        //     renderer: renderer,
        //     simulationMaterial: simulationMaterial,
        //     renderMaterial: renderMaterial,
        //     size: texSize,
        //     format: format
        // });
        // scene.add(fbo.mesh);
    }

    addListeners()
    {
        window.addEventListener('resize', this.handleResize, false);
        window.addEventListener('orientationchange', this.handleResize, false);
        window.addEventListener('mousemove', this.handleMouseMove, false);
        // window.addEventListener('mousedown', this.handleMouseDown, false);
        // window.addEventListener('mouseup', this.handleMouseUp, false);
        // window.addEventListener('touchmove', this.handleTouchMove, false);
        // window.addEventListener('touchstart', this.handleTouchStart, false);
        // window.addEventListener('touchend', this.handleTouchEnd, false);
    }

    removeListeners()
    {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);
        // window.removeEventListener('mousedown', this.handleMouseDown);
        // window.removeEventListener('mouseup', this.handleMouseUp);
        // window.removeEventListener('touchmove', this.handleTouchMove);
        // window.removeEventListener('touchstart', this.handleTouchStart);
        // window.removeEventListener('touchend', this.handleTouchEnd);
    }

    addStats()
    {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.bottom = '0px';
        document.body.appendChild(stats.domElement);
    }

    createEffects()
    {
        effectsManager = new EffectsManager({
            renderer: renderer,
            camera: camera,
            scene: scene
        });
    }

    handleResize(e)
    {
        let width = window.innerWidth,
            height = window.innerHeight;

        camera.aspect = width / height;

        camera.updateProjectionMatrix();
        renderer.setSize(width, height);

        if(effectsManager)
        {
            effectsManager.resize(width, height);
        }
    }

    handleMouseMove(e)
    {
        mousePos.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mousePos.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    }

    // handleMouseDown(e)
    // {

    // }

    // handleMouseUp(e)
    // {

    // }

    // handleTouchMove(e)
    // {
    //     let touchObj = e.changedTouches[0];
    //     scope.handleMouseMove(touchObj);
    // }

    // handleTouchStart(e)
    // {
    //     let touchObj = e.changedTouches[0];
    //     scope.handleMouseDown(touchObj);
    // }

    // handleTouchEnd(e)
    // {
    //     let touchObj = e.changedTouches[0];
    //     scope.handleMouseUp(touchObj);
    // }

    update()
    {
        simulationMaterial.uniforms.time.value += 0.001;

        simulationMaterial.uniforms.mousePosition.value = getMouseWorldPos(mousePos, camera);
        // console.log(simulationMaterial.uniforms.mousePosition.value);
        // simulationMaterial.uniforms.rotation.value = 0.05;
        // console.log(mouseWorldPos.x, mouseWorldPos.y);

        // simulationMaterial.uniforms.curlScale.value += (1 - simulationMaterial.uniforms.curlScale.value) * 0.01;

        gpgpu.update('tPositions');
        // mesh.rotation.x += 0.01;
        // mesh.rotation.y += 0.01;

        // fbo.update();
        // fbo.mesh.rotation.x += 0.01;
        // fbo.mesh.rotation.y -= 0.01;

        if(effectsManager)
        {
            effectsManager.update();
        }
        else
        {
            renderer.render(scene, camera);
        }

        if(stats)
        {
            stats.update();
        }

        requestAnimationFrame(scope.update);
    }

    dispose()
    {
        // TODO - clean up geometry
        removeListeners();
    }
}
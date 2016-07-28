'use strict';

require('./EffectComposer');
require('./RenderPass');
require('./ShaderPass');
require('./MaskPass');
require('./CopyShader');

let passes,
	composer,
	renderPass,
	copyPass;

export default class EffectsManager{

	constructor({renderer, camera, scene})
	{
		composer = new THREE.EffectComposer(renderer);
		renderPass = new THREE.RenderPass(scene, camera);
		copyPass = new THREE.ShaderPass(THREE.CopyShader);
		copyPass.renderToScreen = true;

		passes = {};

		composer = new THREE.EffectComposer(renderer);
		composer.addPass(renderPass);
		composer.addPass(copyPass);
	}

	update()
	{
		composer.render(0.1);
	}

	resize(width, height)
	{
		if(composer)
		{
			composer.setSize(width, height);
		}
	}

	get passes()
	{
		return passes;
	}

	dispose()
	{
		passes = null;
		composer = null;
		renderPass = null;
		copyPass = null;
	}
}

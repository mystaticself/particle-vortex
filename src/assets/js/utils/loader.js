'use strict';

let interval,
    loadInfo,
    files,
    numFiles,
    numLoaded,
    progressCallback,
    loadCallback,
    loadCheck,
    scope,
    done = false;

export default class Loader
{
    constructor()
    {
        loadInfo = {};
        files = {textures:{}, geometry:{}, fonts:{}, data:{}};
        loadCheck = this.checkLoaded;
        scope = this;
    }

    load(manifest, onLoadCallback, onProgressCallback)
    {
        progressCallback = onProgressCallback;
        loadCallback = onLoadCallback;

        numFiles = manifest.length;
        numLoaded = 0;

        const scope = this;

        manifest.forEach(function(fileObj){
            if(!(Object.prototype.toString.call(fileObj.file) === '[object Array]'))
            {
                if(fileObj.file.indexOf('.png') > 0 || fileObj.file.indexOf('.jpg') > 0 || fileObj.file.indexOf('.jpeg') > 0 || fileObj.file.indexOf('.gif') > 0)
                {
                    scope.loadTexture(fileObj);
                }
                else if(fileObj.file.indexOf('.json') > 0)
                {
                    if(fileObj.isData)
                    {
                        scope.loadDataJSON(fileObj);
                    }
                    else if(fileObj.isFont)
                    {
                        scope.loadFontJSON(fileObj);
                    }
                    else
                    {
                        scope.loadGeometryJSON(fileObj);
                    }
                }
                else if(fileObj.file.indexOf('.dae') > 0)
                {
                    scope.loadCollada(fileObj);
                }
            }
            else
            {
                scope.loadCubemap(fileObj)
            }
        });

        interval = setInterval(scope.update, 1000/30);
    }

    loadDataJSON(fileObj)
    {
        const xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open('GET', fileObj.file, true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status === 200)
            {
                files.data[fileObj.id] = JSON.parse(xhr.responseText);
                numLoaded++;
                loadCheck();
            }
        };
        xhr.send();
    }

    loadGeometryJSON(fileObj)
    {
        // console.log('loadGeometryJSON:', fileObj.file);

        const loader = new THREE.JSONLoader();
        loadInfo[fileObj.id] = {loaded:0, total:0}

        loader.load(fileObj.file, function(geometry){
            loadInfo[fileObj.id].loaded = loadInfo[fileObj.id].total;
            files.geometry[fileObj.id] = geometry;
            numLoaded++;
            loadCheck();
        }, function(xhr){
            loadInfo[fileObj.id].loaded = xhr.loaded;
            loadInfo[fileObj.id].total = xhr.total;
        });
    }

    loadFontJSON(fileObj)
    {
        const loader = new THREE.FontLoader();
        loadInfo[fileObj.id] = {loaded:0, total:0}

        loader.load(fileObj.file, function(font){
            loadInfo[fileObj.id].loaded = loadInfo[fileObj.id].total;
            files.fonts[fileObj.id] = font;
            numLoaded++;
            loadCheck();
        }, function(xhr){
            loadInfo[fileObj.id].loaded = xhr.loaded;
            loadInfo[fileObj.id].total = xhr.total;
        });
    }

    loadCollada(fileObj)
    {
        // console.log('loadCollada:', fileObj.file);

        const loader = new THREE.ColladaLoader();
        loadInfo[fileObj.id] = {loaded:0, total:0}

        loader.load(fileObj.file, function(collada){
            loadInfo[fileObj.id].loaded = loadInfo[fileObj.id].total;
            files.geometry[fileObj.id] = collada;
            numLoaded++;
            loadCheck();
        }, function(xhr){
            loadInfo[fileObj.id].loaded = xhr.loaded;
            loadInfo[fileObj.id].total = xhr.total;
        });
    }

    loadTexture(fileObj)
    {
        // console.log('loadTexture:', fileObj.id, fileObj.file);

        const loader = new THREE.TextureLoader();
        loadInfo[fileObj.id] = {loaded:0, total:0}

        loader.load(fileObj.file, function(texture){
            loadInfo[fileObj.id].loaded = loadInfo[fileObj.id].total;
            files.textures[fileObj.id] = texture;
            numLoaded++;
            loadCheck();
        }, function(xhr){
            loadInfo[fileObj.id].loaded = xhr.loaded;
            loadInfo[fileObj.id].total = xhr.total;
        });
    }

    loadCubemap(fileObj)
    {
        // console.log('loadCubemap:', fileObj.file);

        const loader = new THREE.CubeTextureLoader();
        loadInfo[fileObj.id] = {loaded:0, total:0}

        loader.load(fileObj.file, function(texture){
            loadInfo[fileObj.id].loaded = loadInfo[fileObj.id].total;
            files.textures[fileObj.id] = texture;
            numLoaded++;
            loadCheck();
        }, function(xhr){
            loadInfo[fileObj.id].loaded = xhr.loaded;
            loadInfo[fileObj.id].total = xhr.total;
        });
    }

    checkLoaded()
    {
        if(done) return;

        // console.log('checkLoaded:', numLoaded, numFiles);
        if(numLoaded === numFiles)// || percent === 1)
        {
            done = true;
            clearInterval(interval);
            scope.update();

            if(typeof loadCallback === 'function')
            {
                loadCallback(files);
            }

            // dispose();
        }
    }

    update()
    {
        if(typeof progressCallback === 'function')
        {
            let loaded = 0;
            let total = 0;

            for(let info in loadInfo)
            {
                loaded += parseInt(loadInfo[info].loaded);
                total += parseInt(loadInfo[info].total);
            }

            // checkLoaded(loaded/total);

            if(progressCallback) progressCallback(loaded, total);
        }
    }

    dispose()
    {
        clearInterval(interval);

        interval = null;
        loadInfo = null;
        files = null;
        numFiles = null;
        numLoaded = null;
        progressCallback = null;
        loadCallback = null;
        done = null;
    }
}

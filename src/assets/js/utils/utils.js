'use strict';

export function createElement(type, classNames, content){
    type = type || 'div';
    let el = document.createElement(type);
    if(classNames){
        classNames.forEach(function(name){
            el.classList.add(name);
        });
    }
    if(content) el.innerHTML = content;
    return el;
}

export function normalize(value, min, max) {
    return (value - min) / (max - min);
}

export function lerp(norm, min, max) {
    return (max - min) * norm + min;
}

export function map(value, sourceMin, sourceMax, destMin, destMax) {
    return lerp(normalize(value, sourceMin, sourceMax), destMin, destMax);
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
}

export function distance(p0, p1) {
    let dx = p1.x - p0.x,
        dy = p1.y - p0.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function distanceXY(x0, y0, x1, y1) {
    let dx = x1 - x0,
        dy = y1 - y0;
    return Math.sqrt(dx * dx + dy * dy);
}

export function circleCollision(c0, c1) {
    return distance(c0, c1) <= c0.radius + c1.radius;
}

export function circlePointCollision(x, y, circle) {
    return distanceXY(x, y, circle.x, circle.y) < circle.radius;
}

export function pointInRect(x, y, rect) {
    return inRange(x, rect.x, rect.x + rect.width) &&
           inRange(y, rect.y, rect.y + rect.height);
}

export function inRange(value, min, max) {
    return value >= Math.min(min, max) && value <= Math.max(min, max);
}

export function rangeIntersect(min0, max0, min1, max1) {
    return Math.max(min0, max0) >= Math.min(min1, max1) &&
           Math.min(min0, max0) <= Math.max(min1, max1);
}

export function rectIntersect(r0, r1) {
    return rangeIntersect(r0.x, r0.x + r0.width, r1.x, r1.x + r1.width) &&
           rangeIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height);
}

export function degreesToRads(degrees) {
    return degrees / 180 * Math.PI;
}

export function radsToDegrees(radians) {
    return radians * 180 / Math.PI;
}

export function angleBetweenPoints(p1, p2){
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

export function roundToPlaces(value, places) {
    let mult = Math.pow(10, places);
    return Math.round(value * mult) / mult;
}

export function roundNearest(value, nearest) {
    return Math.round(value / nearest) * nearest;
}

export function quadraticBezier(p0, p1, p2, t, pFinal) {
    pFinal = pFinal || {};
    pFinal.x = Math.pow(1 - t, 2) * p0.x +
               (1 - t) * 2 * t * p1.x +
               t * t * p2.x;
    pFinal.y = Math.pow(1 - t, 2) * p0.y +
               (1 - t) * 2 * t * p1.y +
               t * t * p2.y;
    return pFinal;
}

export function cubicBezier(p0, p1, p2, p3, t, pFinal) {
    pFinal = pFinal || {};
    pFinal.x = Math.pow(1 - t, 3) * p0.x +
               Math.pow(1 - t, 2) * 3 * t * p1.x +
               (1 - t) * 3 * t * t * p2.x +
               t * t * t * p3.x;
    pFinal.y = Math.pow(1 - t, 3) * p0.y +
               Math.pow(1 - t, 2) * 3 * t * p1.y +
               (1 - t) * 3 * t * t * p2.y +
               t * t * t * p3.y;
    return pFinal;
}

export function multicurve(points, context) {
    let p0, p1, midx, midy;

    context.moveTo(points[0].x, points[0].y);

    for(let i = 1; i < points.length - 2; i += 1) {
        p0 = points[i];
        p1 = points[i + 1];
        midx = (p0.x + p1.x) / 2;
        midy = (p0.y + p1.y) / 2;
        context.quadraticCurveTo(p0.x, p0.y, midx, midy);
    }

    p0 = points[points.length - 2];
    p1 = points[points.length - 1];
    context.quadraticCurveTo(p0.x, p0.y, p1.x, p1.y);
}

export function pointOnSphere(r, a1, a2) {
    return {
        x: r * Math.cos(a1) * Math.sin(a2),
        y: r * Math.sin(a1) * Math.sin(a2),
        z: r * Math.cos(a2)
    };
}

export function getPointsOnSphere(n){
    let pts = [],
        pt;

    for(let i = 0; i < n; i++)
    {
        pt = pointOnSphere(1, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        pts.push({x:pt.x, y:pt.y, z:pt.z});
    }

    return pts;
}

export function getPointsOnSphereEvenly(n){
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

        pts.push({x:x, y:y, z:z});
    }
    return pts;
}

export function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

export function isArray(arg){
    return Object.prototype.toString.call(arg) === '[object Array]';
}

export function shuffleArray(array) {
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;

    while (0 !== currentIndex)
    {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

export function thinOutArray(array, n){
    let newArray = [],
        len = array.length;

    for(let i = 0; i < len; i += n)
    {
        newArray.push(array[i]);
    }

    return newArray;
}

export function randomItemFromArray(array){
    return array[Math.random() * array.length | 0];
}

export function arrayRestrictedToRangeZ(array, minZ, maxZ){
    let newArray = [],
        len = array.length;

    for(let i = 0; i < len; i++)
    {
        if(inRange(array[i].z, minZ, maxZ))
            newArray.push(array[i]);
    }

    return newArray;
}

export function extractKeyFromArray(array, key)
{
    let a = [];
    for(let i = 0; i < array.length; i++)
    {
        a.push(array[i][key]);
    }
    return a;
}

export function repeat(callback, params, intervals, delay, startDelay){
    startDelay = startDelay || 0;
    let i = 0;
    let doStuff = function(){
        setTimeout(function(){
            callback(params);
            i++;
            if(i < intervals)
                doStuff();
        }, delay);
    };
    setTimeout(function(){
        doStuff();
    }, startDelay);
}

export function isOpera(){
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
}

export function isFirefox(){
    // Firefox 1.0+
    return typeof InstallTrigger !== 'undefined';
}

export function isSafari(){
    // At least Safari 3+: '[object HTMLElementConstructor]'
    return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
}

export function isChrome(){
    // Chrome 1+
    return !!window.chrome && !isOpera();
}

export function isIE(){
    // At least IE6
    return false || !!document.documentMode;
}

export function isMac() {
    return navigator.platform.toLowerCase().indexOf('mac') > -1;
}

export function isWindows() {
    return navigator.platform.toLowerCase().indexOf('win') > -1;
}

export function hasWebGL(){
    if (!!window.WebGLRenderingContext) {
        let canvas = document.createElement('canvas'),
            names = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'],
            context = false;

        for(let i=0;i<4;i++) {
            try {
                context = canvas.getContext(names[i]);
                if (context && typeof context.getParameter === 'function') {
                    // WebGL is enabled
                    return true;
                }
            } catch(e) {}
        }
        // WebGL is supported, but disabled
        return false;
    }
    // WebGL not supported
    return false;
}

export function getVideoType(file)
{
    if(file.indexOf('.mp4') !== -1)
        return 'video/mp4';
    else if(file.indexOf('.webm') !== -1)
        return 'video/webm';
    else if(file.indexOf('.ogg') !== -1)
        return 'video/ogg';
}

export function dispatchEvent(eventName, config)
{
    config = config || null;

    let event;

    if(!isIE())
    {
        event = new CustomEvent(eventName, {
            detail: config
        });
        document.dispatchEvent(event);
    }
    else
    {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventName, true, false, config);
        document.dispatchEvent(event);
    }
}

export function setCursor(cursor, element)
{
    element = element || document.body;

    if(element.style.cursor !== cursor)
    {
        element.style.cursor = cursor;
    }
}

export function getParameterByName(name)
{
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

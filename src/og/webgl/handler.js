goog.provide('og.webgl.Handler');

goog.require('og.webgl');
goog.require('og.math');
goog.require('og.webgl.ShaderController');
goog.require('og.ImageCanvas');

og.webgl.Handler = function (id, params) {
    this.lastAnimationFrameTime = 0;
    this.fps;
    this.delta;
    this.animSpeed = 1.0;
    this._id = id;
    this.canvas = null;
    this.gl;
    this._initialized = false;
    this.drawback = function (x) { };
    this.shaderPrograms = {};
    this.activeShaderProgram = null;
    this.af = 4;
    //set parameters
    this._params = params || {};
    this._params.width = this._params.width || og.webgl.Handler.defaultWidth;
    this._params.height = this._params.height || og.webgl.Handler.defaultHeight;
    this._params.context = this._params.context || {};
    this._params.extensions = this._params.extensions || [];
    this._pExtensions = {};
};

og.webgl.Handler.defaultWidth = 256;
og.webgl.Handler.defaultHeight = 256;

og.webgl.Handler.prototype.createTexture_n = function (image) {
    var gl = this.gl;
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
};

og.webgl.Handler.prototype.createTexture_mm = function (image) {
    var gl = this.gl;
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    //if (fit && (!og.math.isPowerOfTwo(image.width) || !og.math.isPowerOfTwo(image.height))) {
    //    var canvas = document.createElement("canvas");
    //    canvas.width = og.math.nextHighestPowerOfTwo(image.width);
    //    canvas.height = og.math.nextHighestPowerOfTwo(image.height);
    //    var ctx = canvas.getContext("2d");
    //    ctx.drawImage(image, 0, 0, image.width, image.height);
    //    image = canvas;
    //}
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    if (this.af) {
        gl.texParameterf(gl.TEXTURE_2D, this._pExtensions.EXT_texture_filter_anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, this.af);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
};

og.webgl.Handler.prototype.createTexture = function (image) {
    return this.createTexture_mm(image);
};

og.webgl.Handler.prototype.loadCubeMapTexture = function (params) {
    var gl = this.gl;
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var faces = [[params.positiveX, gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 [params.negativeX, gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 [params.positiveY, gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 [params.negativeY, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 [params.positiveZ, gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 [params.negativeZ, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];

    var imageCanvas = new og.ImageCanvas();
    imageCanvas.fillEmpty();
    var emptyImage = imageCanvas.getImage();

    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, emptyImage);
    }

    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.crossOrigin = '';
        image.onload = function (texture, face, image) {
            return function () {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(texture, face, image);
        image.src = faces[i][0];
    }
    return texture;
};

og.webgl.Handler.prototype.addShaderProgram = function (program, notActivate) {
    if (!this.shaderPrograms[program.name]) {
        var sc = new og.webgl.ShaderController(this, program);
        this.shaderPrograms[program.name] = sc;
        this._initShaderController(sc);
        if (notActivate)
            sc._activated = false;
    } else {
        alert(program.name + " is allready exists.");
    }
};

og.webgl.Handler.prototype._initShaderController = function (sc) {
    if (this._initialized) {
        sc.initialize();
        if (!this.activeShaderProgram) {
            this.activeShaderProgram = sc;
            sc.activate();
        } else {
            sc.deactivate();
            this.activeShaderProgram._program.use();
        }
    }
};

og.webgl.Handler.prototype.addShaderPrograms = function (programsArr) {
    for (var i = 0; i < programsArr.length; i++) {
        this.addShaderProgram(programsArr[i]);
    }
};

og.webgl.Handler.prototype.initShaderPrograms = function () {
    for (var p in this.shaderPrograms) {
        this._initShaderController(this.shaderPrograms[p]);
    }
};

og.webgl.Handler.prototype.initExtension = function (extensionStr) {
    if (!(this._pExtensions && this._pExtensions[extensionStr]))
        this._pExtensions[extensionStr] = og.webgl.getExtension(this.gl, extensionStr);
};

og.webgl.Handler.prototype.init = function () {

    if (this._id) {
        this.canvas = document.getElementById(this._id);
    } else {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this._params.width;
        this.canvas.height = this._params.height;
    }

    this.gl = og.webgl.initWebGLContext(this.canvas, this._params.context);
    this._initialized = true;

    //deafult extensions
    //this.initExtension("OES_standard_derivatives");
    this._params.extensions.push("EXT_texture_filter_anisotropic");

    var i = this._params.extensions.length;
    while (i--) {
        this.initExtension(this._params.extensions[i]);
    }

    this.initShaderPrograms();
    this.setDefaults();
};

og.webgl.Handler.prototype.setDefaults = function () {
    this.activateDepthTest();
    this.setSize(this.canvas.width, this.canvas.height);
    this.gl.frontFace(this.gl.CCW);
    this.gl.cullFace(this.gl.BACK);
    this.activateFaceCulling();
    this.deactivateBlending();
};

og.webgl.Handler.prototype.activateDepthTest = function () {
    this.gl.enable(this.gl.DEPTH_TEST);
};

og.webgl.Handler.prototype.deactivateDepthTest = function () {
    this.gl.disable(this.gl.DEPTH_TEST);
};

og.webgl.Handler.prototype.activateFaceCulling = function () {
    this.gl.enable(this.gl.CULL_FACE);
};

og.webgl.Handler.prototype.deactivateFaceCulling = function () {
    this.gl.disable(this.gl.CULL_FACE);
};

og.webgl.Handler.prototype.activateBlending = function () {
    this.gl.enable(this.gl.BLEND);
};

og.webgl.Handler.prototype.deactivateBlending = function () {
    this.gl.disable(this.gl.BLEND);
};

og.webgl.Handler.prototype.createArrayBuffer = function (array, itemSize, numItems) {
    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, array, this.gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = numItems;
    return buffer;
};

og.webgl.Handler.prototype.createElementArrayBuffer = function (array, itemSize, numItems) {
    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, array, this.gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = numItems;
    return buffer;
};

function print2d(id, text, x, y) {
    var el = document.getElementById(id);
    el.innerHTML = text;
    el.style.left = x;
    el.style.top = y;
};

og.webgl.Handler.prototype.calculateFPS = function (now) {
    this.fps = 1000 / (now - this.lastAnimationFrameTime);
    this.lastAnimationFrameTime = now;
    this.delta = this.animSpeed / this.fps;
};

og.webgl.Handler.prototype.setSize = function (width, height) {
    var w = width, h = Math.max(1, height);
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.aspect = w / h;
    if (this.gl) {
        this.gl.viewport(0, 0, w, h);
    }
};

og.webgl.Handler.prototype.viewportResized = function () {
    return this.canvas.clientWidth != this.canvas.width ||
            this.canvas.clientHeight != this.canvas.height;
};

og.webgl.Handler.prototype.drawFrame = function (now, sender) {
    if (sender.viewportResized()) {
        sender.setSize(sender.gl.canvas.clientWidth, sender.gl.canvas.clientHeight);
        sender.onCanvasResize(sender.gl.canvas);
    }
    sender.calculateFPS(now);
    sender.clearFrame();
    sender.drawback();
    og.webgl.requestAnimationFrame(sender.drawFrame, sender);
};

og.webgl.Handler.prototype.clearFrame = function () {
    var gl = this.gl;
    this.gl.clearColor(0.46, 0.46, 0.46, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

og.webgl.Handler.prototype.start = function () {
    og.webgl.requestAnimationFrame(this.drawFrame, this);
};
/**
 * @module og/entity/LabelHandler
 */

'use strict';

import * as shaders from '../shaders/label.js';
import { ALIGN } from './Label.js';
import { BillboardHandler } from './BillboardHandler.js';
import { concatTypedArrays, spliceTypedArray } from '../utils/shared.js';

const PICKINGCOLOR_BUFFER = 0;
const POSITION_BUFFER = 1;
const SIZE_BUFFER = 2;
const OFFSET_BUFFER = 3;
const RGBA_BUFFER = 4;
const ROTATION_BUFFER = 5;
const TEXCOORD_BUFFER = 6;
const VERTEX_BUFFER = 7;
const ALIGNEDAXIS_BUFFER = 8;
const FONTINDEX_BUFFER = 9;
const OUTLINE_BUFFER = 10;
const OUTLINECOLOR_BUFFER = 11;

/*
 * og.LabelHandler
 *
 *
 */
class LabelHandler extends BillboardHandler {
    constructor(entityCollection, maxLetters = 21) {

        super(entityCollection);

        this._gliphParamBuffer = null;
        this._fontIndexBuffer = null;
        this._noOutlineBuffer = null;
        this._outlineBuffer = null;
        this._outlineColorBuffer = null;

        this._gliphParamArr = new Float32Array();
        this._fontIndexArr = new Float32Array();
        this._noOutlineArr = new Float32Array();
        this._outlineArr = new Float32Array();
        this._outlineColorArr = new Float32Array();

        this._buffersUpdateCallbacks[FONTINDEX_BUFFER] = this.createFontIndexBuffer;
        this._buffersUpdateCallbacks[OUTLINE_BUFFER] = this.createOutlineBuffer;
        this._buffersUpdateCallbacks[OUTLINECOLOR_BUFFER] = this.createOutlineColorBuffer;

        this._changedBuffers = new Array(this._buffersUpdateCallbacks.length);

        this._maxLetters = maxLetters;
    }

    initProgram() {
        if (this._renderer.handler) {

            if (!this._renderer.handler.programs.label) {
                if (this._renderer.handler.gl.type === "webgl2") {
                    this._renderer.handler.addProgram(shaders.label_webgl2());
                } else {
                    this._renderer.handler.addProgram(shaders.label_screen());
                }
            }

            if (!this._renderer.handler.programs.labelPicking) {
                this._renderer.handler.addProgram(shaders.labelPicking());
            }
        }
    }

    add(label) {
        if (label._handlerIndex === -1) {
            label._handler = this;
            label._handlerIndex = this._billboards.length;
            this._billboards.push(label);
            this._addBillboardToArrays(label);
            this.refresh();
            this.assignFontAtlas(label);
        }
    }

    assignFontAtlas(label) {
        if (this._entityCollection && this._renderer) {
            label.assignFontAtlas(this._renderer.fontAtlas);
        }
    }

    clear() {

        this._texCoordArr = null;
        this._gliphParamArr = null;
        this._vertexArr = null;
        this._positionHighArr = null;
        this._positionLowArr = null;
        this._sizeArr = null;
        this._offsetArr = null;
        this._rgbaArr = null;
        this._rotationArr = null;
        this._alignedAxisArr = null;
        this._fontIndexArr = null;
        this._noOutlineArr = null;
        this._outlineArr = null;
        this._outlineColorArr = null;

        this._texCoordArr = new Float32Array();
        this._gliphParamArr = new Float32Array();
        this._vertexArr = new Float32Array();
        this._positionHighArr = new Float32Array();
        this._positionLowArr = new Float32Array();
        this._sizeArr = new Float32Array();
        this._offsetArr = new Float32Array();
        this._rgbaArr = new Float32Array();
        this._rotationArr = new Float32Array();
        this._alignedAxisArr = new Float32Array();
        this._fontIndexArr = new Float32Array();
        this._noOutlineArr = new Float32Array();
        this._outlineArr = new Float32Array();
        this._outlineColorArr = new Float32Array();

        this._removeBillboards();
        this._deleteBuffers();
        this.refresh();
    }

    _deleteBuffers() {
        if (this._renderer) {
            var gl = this._renderer.handler.gl;
            gl.deleteBuffer(this._gliphParamBuffer);
            gl.deleteBuffer(this._sizeBuffer);
            gl.deleteBuffer(this._fontIndexBuffer);
            gl.deleteBuffer(this._texCoordBuffer);
            gl.deleteBuffer(this._outlineBuffer);
            gl.deleteBuffer(this._noOutlineBuffer);
            gl.deleteBuffer(this._outlineColorBuffer);
            gl.deleteBuffer(this._positionHighBuffer);
            gl.deleteBuffer(this._positionLowBuffer);
            gl.deleteBuffer(this._sizeBuffer);
            gl.deleteBuffer(this._offsetBuffer);
            gl.deleteBuffer(this._rgbaBuffer);
            gl.deleteBuffer(this._rotationBuffer);
            gl.deleteBuffer(this._vertexBuffer);
            gl.deleteBuffer(this._texCoordBuffer);
            gl.deleteBuffer(this._alignedAxisBuffer);
            gl.deleteBuffer(this._pickingColorBuffer);

            this._gliphParamBuffer = null;
            this._sizeBuffer = null;
            this._fontIndexBuffer = null;
            this._texCoordBuffer = null;
            this._outlineBuffer = null;
            this._outlineColorBuffer = null;
            this._positionHighBuffer = null;
            this._positionLowBuffer = null;
            this._sizeBuffer = null;
            this._offsetBuffer = null;
            this._rgbaBuffer = null;
            this._rotationBuffer = null;
            this._vertexBuffer = null;
            this._texCoordBuffer = null;
            this._alignedAxisBuffer = null;
            this._pickingColorBuffer = null;
        }
    }

    _addBillboardToArrays(label) {
        for (var i = 0; i < this._maxLetters; i++) {
            if (label._visibility) {
                this._vertexArr = concatTypedArrays(this._vertexArr, [
                    0, 0,
                    0, -1,
                    1, -1,
                    1, -1,
                    1, 0,
                    0, 0
                ]);
            } else {
                this._vertexArr = concatTypedArrays(this._vertexArr, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }

            this._texCoordArr = concatTypedArrays(this._texCoordArr, [0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0]);
            this._gliphParamArr = concatTypedArrays(this._gliphParamArr, [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0]);

            var x = label._positionHigh.x, y = label._positionHigh.y, z = label._positionHigh.z, w;
            this._positionHighArr = concatTypedArrays(this._positionHighArr, [x, y, z, x, y, z, x, y, z, x, y, z, x, y, z, x, y, z]);

            x = label._positionLow.x; y = label._positionLow.y; z = label._positionLow.z;
            this._positionLowArr = concatTypedArrays(this._positionLowArr, [x, y, z, x, y, z, x, y, z, x, y, z, x, y, z, x, y, z]);

            x = label._size;
            this._sizeArr = concatTypedArrays(this._sizeArr, [x, x, x, x, x, x]);

            x = label._offset.x; y = label._offset.y; z = label._offset.z;
            this._offsetArr = concatTypedArrays(this._offsetArr, [x, y, z, x, y, z, x, y, z, x, y, z, x, y, z, x, y, z]);

            x = label._color.x; y = label._color.y; z = label._color.z; w = label._color.w;
            this._rgbaArr = concatTypedArrays(this._rgbaArr, [x, y, z, w, x, y, z, w, x, y, z, w, x, y, z, w, x, y, z, w, x, y, z, w]);

            x = label._rotation;
            this._rotationArr = concatTypedArrays(this._rotationArr, [x, x, x, x, x, x]);

            x = label._alignedAxis.x; y = label._alignedAxis.y; z = label._alignedAxis.z;
            this._alignedAxisArr = concatTypedArrays(this._alignedAxisArr, [x, y, z, x, y, z, x, y, z, x, y, z, x, y, z, x, y, z]);

            x = label._fontIndex;
            this._fontIndexArr = concatTypedArrays(this._fontIndexArr, [x, x, x, x, x, x]);

            x = label._outline;
            this._outlineArr = concatTypedArrays(this._outlineArr, [x, x, x, x, x, x]);

            const weight = 0.001;
            this._noOutlineArr = concatTypedArrays(this._noOutlineArr, [weight, weight, weight, weight, weight, weight]);

            x = label._outlineColor.x; y = label._outlineColor.y; z = label._outlineColor.z; w = label._outlineColor.w;
            this._outlineColorArr = concatTypedArrays(this._outlineColorArr, [x, y, z, w, x, y, z, w, x, y, z, w, x, y, z, w, x, y, z, w, x, y, z, w]);

            x = label._entity._pickingColor.x / 255; y = label._entity._pickingColor.y / 255; z = label._entity._pickingColor.z / 255;
            this._pickingColorArr = concatTypedArrays(this._pickingColorArr, [x, y, z, x, y, z, x, y, z, x, y, z, x, y, z, x, y, z]);
        }
    };

    _displayPASS() {
        var r = this._renderer;
        var h = r.handler;
        h.programs.label.activate();
        var sh = h.programs.label._program;
        var sha = sh.attributes,
            shu = sh.uniforms;

        var gl = h.gl,
            ec = this._entityCollection;

        gl.polygonOffset(ec.polygonOffsetFactor, ec.polygonOffsetUnits);

        var rn = ec.renderNode;

        gl.uniform1iv(shu.fontTextureArr, r.fontAtlas.samplerArr);

        gl.uniformMatrix4fv(shu.viewMatrix, false, r.activeCamera._viewMatrix._m);
        gl.uniformMatrix4fv(shu.projectionMatrix, false, r.activeCamera.getProjectionMatrix());

        gl.uniform3fv(shu.eyePositionHigh, r.activeCamera.eyeHigh);
        gl.uniform3fv(shu.eyePositionLow, r.activeCamera.eyeLow);

        gl.uniform3fv(shu.scaleByDistance, ec.scaleByDistance);

        gl.uniform1f(shu.opacity, ec._fadingOpacity);

        gl.uniform1f(shu.planetRadius, rn._planetRadius2 || 0);

        gl.uniform2fv(shu.viewport, [h.canvas.width, h.canvas.height]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
        gl.vertexAttribPointer(sha.a_texCoord, this._texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._gliphParamBuffer);
        gl.vertexAttribPointer(sha.a_gliphParam, this._gliphParamBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(sha.a_vertices, this._vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionHighBuffer);
        gl.vertexAttribPointer(sha.a_positionsHigh, this._positionHighBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionLowBuffer);
        gl.vertexAttribPointer(sha.a_positionsLow, this._positionLowBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._sizeBuffer);
        gl.vertexAttribPointer(sha.a_size, this._sizeBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //gl.bindBuffer(gl.ARRAY_BUFFER, this._rotationBuffer);
        //gl.vertexAttribPointer(sha.a_rotation, this._rotationBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //gl.bindBuffer(gl.ARRAY_BUFFER, this._alignedAxisBuffer);
        //gl.vertexAttribPointer(sha.a_alignedAxis, this._alignedAxisBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._offsetBuffer);
        gl.vertexAttribPointer(sha.a_offset, this._offsetBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._fontIndexBuffer);
        gl.vertexAttribPointer(sha.a_fontIndex, this._fontIndexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // outline
        gl.bindBuffer(gl.ARRAY_BUFFER, this._outlineColorBuffer);
        gl.vertexAttribPointer(sha.a_rgba, this._outlineColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._outlineBuffer);
        gl.vertexAttribPointer(sha.a_outline, this._outlineBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.uniform1f(shu.uZ, 1.0);
        gl.drawArrays(gl.TRIANGLES, 0, this._vertexBuffer.numItems);

        // no outline
        gl.bindBuffer(gl.ARRAY_BUFFER, this._rgbaBuffer);
        gl.vertexAttribPointer(sha.a_rgba, this._rgbaBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._noOutlineBuffer);
        gl.vertexAttribPointer(sha.a_outline, this._noOutlineBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.uniform1f(shu.uZ, 0.0);
        gl.drawArrays(gl.TRIANGLES, 0, this._vertexBuffer.numItems);
    }

    _pickingPASS() {
        var r = this._renderer;
        var h = r.handler;
        h.programs.labelPicking.activate();
        var sh = h.programs.labelPicking._program;
        var sha = sh.attributes,
            shu = sh.uniforms;

        var gl = h.gl,
            ec = this._entityCollection;

        gl.polygonOffset(ec.polygonOffsetFactor, ec.polygonOffsetUnits);

        var rn = ec.renderNode;

        gl.uniformMatrix4fv(shu.viewMatrix, false, r.activeCamera._viewMatrix._m);
        gl.uniformMatrix4fv(shu.projectionMatrix, false, r.activeCamera.getProjectionMatrix());

        gl.uniform3fv(shu.eyePositionHigh, r.activeCamera.eyeHigh);
        gl.uniform3fv(shu.eyePositionLow, r.activeCamera.eyeLow);

        gl.uniform3fv(shu.scaleByDistance, ec.scaleByDistance);

        gl.uniform1f(shu.opacity, ec._fadingOpacity);

        gl.uniform1f(shu.planetRadius, rn._planetRadius2 || 0);

        gl.uniform2fv(shu.viewport, [h.canvas.width, h.canvas.height]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
        gl.vertexAttribPointer(sha.a_texCoord, this._texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._gliphParamBuffer);
        gl.vertexAttribPointer(sha.a_gliphParam, this._gliphParamBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(sha.a_vertices, this._vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionHighBuffer);
        gl.vertexAttribPointer(sha.a_positionsHigh, this._positionHighBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionLowBuffer);
        gl.vertexAttribPointer(sha.a_positionsLow, this._positionLowBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._sizeBuffer);
        gl.vertexAttribPointer(sha.a_size, this._sizeBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //gl.bindBuffer(gl.ARRAY_BUFFER, this._rotationBuffer);
        //gl.vertexAttribPointer(sha.a_rotation, this._rotationBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //gl.bindBuffer(gl.ARRAY_BUFFER, this._alignedAxisBuffer);
        //gl.vertexAttribPointer(sha.a_alignedAxis, this._alignedAxisBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._offsetBuffer);
        gl.vertexAttribPointer(sha.a_offset, this._offsetBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // no outline
        gl.bindBuffer(gl.ARRAY_BUFFER, this._pickingColorBuffer);
        gl.vertexAttribPointer(sha.a_rgba, this._pickingColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this._vertexBuffer.numItems);
    }

    _removeBillboard(label) {
        var li = label._handlerIndex;

        this._billboards.splice(li, 1);

        var ml = 24 * this._maxLetters;
        var i = li * ml;
        this._rgbaArr = spliceTypedArray(this._rgbaArr, i, ml);
        this._outlineColorArr = spliceTypedArray(this._outlineColorArr, i, ml);
        this._texCoordArr = spliceTypedArray(this._texCoordArr, i, ml);
        this._gliphParamArr = spliceTypedArray(this._gliphParamArr, i, ml);

        ml = 18 * this._maxLetters;
        i = li * ml;
        this._positionHighArr = spliceTypedArray(this._positionHighArr, i, ml);
        this._positionLowArr = spliceTypedArray(this._positionLowArr, i, ml);
        this._offsetArr = spliceTypedArray(this._offsetArr, i, ml);
        this._alignedAxisArr = spliceTypedArray(this._alignedAxisArr, i, ml);
        this._pickingColorArr = spliceTypedArray(this._pickingColorArr, i, ml);

        ml = 12 * this._maxLetters;
        i = li * ml;
        this._vertexArr = spliceTypedArray(this._vertexArr, i, ml);

        ml = 6 * this._maxLetters;
        i = li * ml;
        this._sizeArr = spliceTypedArray(this._sizeArr, i, ml);
        this._rotationArr = spliceTypedArray(this._rotationArr, i, ml);
        this._fontIndexArr = spliceTypedArray(this._fontIndexArr, i, ml);
        this._outlineArr = spliceTypedArray(this._outlineArr, i, ml);
        this._noOutlineArr = spliceTypedArray(this._noOutlineArr, i, ml);

        this.reindexBillbordsArray(li);
        this.refresh();

        label._handlerIndex = -1;
        label._handler = null;
    };

    setText(index, text, fontIndex, align) {

        var fa = this._renderer.fontAtlas.atlasesArr[fontIndex];

        if (!fa) return;

        let i = index * 24 * this._maxLetters;
        let a = this._texCoordArr,
            g = this._gliphParamArr;

        let c = 0;

        let n = fa.nodes[text[c]];
        let offset = 0.0;
        let len = Math.min(this._maxLetters, text.length);
        let kern = fa.kernings;

        for (c = 0; c < len; c++) {
            let j = i + c * 24;
            let char = text[c];
            n = fa.nodes[char] || fa.nodes[" "];
            let tc = n.texCoords;

            let m = n.metrics;

            //m.nWidth;
            //m.nHeight;
            //m.nAdvance;
            //m.nXOffset;
            //m.nYOffset;

            a[j] = tc[0];
            a[j + 1] = tc[1];
            a[j + 2] = offset;
            a[j + 3] = 0.0;

            a[j + 4] = tc[2];
            a[j + 5] = tc[3];
            a[j + 6] = offset;
            a[j + 7] = 0.0;

            a[j + 8] = tc[4];
            a[j + 9] = tc[5];
            a[j + 10] = offset;
            a[j + 11] = 0.0;

            a[j + 12] = tc[6];
            a[j + 13] = tc[7];
            a[j + 14] = offset;
            a[j + 15] = 0.0;

            a[j + 16] = tc[8];
            a[j + 17] = tc[9];
            a[j + 18] = offset;
            a[j + 19] = 0.0;

            a[j + 20] = tc[10];
            a[j + 21] = tc[11];
            a[j + 22] = offset;
            a[j + 23] = 0.0;

            //
            // Gliph
            //
            g[j] = m.nWidth;
            g[j + 1] = m.nHeight;
            g[j + 2] = m.nXOffset;
            g[j + 3] = m.nYOffset;

            g[j + 4] = m.nWidth;
            g[j + 5] = m.nHeight;
            g[j + 6] = m.nXOffset;
            g[j + 7] = m.nYOffset;

            g[j + 8] = m.nWidth;
            g[j + 9] = m.nHeight;
            g[j + 10] = m.nXOffset;
            g[j + 11] = m.nYOffset;

            g[j + 12] = m.nWidth;
            g[j + 13] = m.nHeight;
            g[j + 14] = m.nXOffset;
            g[j + 15] = m.nYOffset;

            g[j + 16] = m.nWidth;
            g[j + 17] = m.nHeight;
            g[j + 18] = m.nXOffset;
            g[j + 19] = m.nYOffset;

            g[j + 20] = m.nWidth;
            g[j + 21] = m.nHeight;
            g[j + 22] = m.nXOffset;
            g[j + 23] = m.nYOffset;

            let k = kern[char];
            if (k) {
                k = k[text[c + 1]];
                if (k) {
                    offset += m.nAdvance + k;
                } else {
                    offset += m.nAdvance;
                }
            } else {
                offset += m.nAdvance;
            }
        }

        // 49/512 - font atlas left border letter offset
        if (align === ALIGN.CENTER) {
            offset *= -0.5;
            for (c = 0; c < len; c++) {
                let j = i + c * 24;
                a[j + 3] = offset;
                a[j + 7] = offset;
                a[j + 11] = offset;
                a[j + 15] = offset;
                a[j + 19] = offset;
                a[j + 23] = offset;
            }
        } else if (align === ALIGN.LEFT) {
            for (c = 0; c < len; c++) {
                let j = i + c * 24;
                a[j + 3] = 0;
                a[j + 7] = 0;
                a[j + 11] = 0;
                a[j + 15] = 0;
                a[j + 19] = 0;
                a[j + 23] = 0;
            }
        }

        for (; c < this._maxLetters; c++) {
            let j = i + c * 24;
            a[j + 2] = -1.0;
            a[j + 6] = -1.0;
            a[j + 10] = -1.0;
            a[j + 14] = -1.0;
            a[j + 18] = -1.0;
            a[j + 17] = -1.0;
        }

        this._changedBuffers[TEXCOORD_BUFFER] = true;
    }

    setPositionArr(index, positionHigh, positionLow) {
        var i = index * 18 * this._maxLetters;
        var a = this._positionHighArr, x = positionHigh.x, y = positionHigh.y, z = positionHigh.z,
            b = this._positionLowArr, xl = positionLow.x, yl = positionLow.y, zl = positionLow.z;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 18;
            a[j] = x;
            a[j + 1] = y;
            a[j + 2] = z;

            a[j + 3] = x;
            a[j + 4] = y;
            a[j + 5] = z;

            a[j + 6] = x;
            a[j + 7] = y;
            a[j + 8] = z;

            a[j + 9] = x;
            a[j + 10] = y;
            a[j + 11] = z;

            a[j + 12] = x;
            a[j + 13] = y;
            a[j + 14] = z;

            a[j + 15] = x;
            a[j + 16] = y;
            a[j + 17] = z;

            // low
            b[j] = xl;
            b[j + 1] = yl;
            b[j + 2] = zl;

            b[j + 3] = xl;
            b[j + 4] = yl;
            b[j + 5] = zl;

            b[j + 6] = xl;
            b[j + 7] = yl;
            b[j + 8] = zl;

            b[j + 9] = xl;
            b[j + 10] = yl;
            b[j + 11] = zl;

            b[j + 12] = xl;
            b[j + 13] = yl;
            b[j + 14] = zl;

            b[j + 15] = xl;
            b[j + 16] = yl;
            b[j + 17] = zl;
        }

        this._changedBuffers[POSITION_BUFFER] = true;
    }

    setPickingColorArr(index, color) {
        var i = index * 18 * this._maxLetters;
        var a = this._pickingColorArr, x = color.x / 255, y = color.y / 255, z = color.z / 255;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 18;
            a[j] = x;
            a[j + 1] = y;
            a[j + 2] = z;

            a[j + 3] = x;
            a[j + 4] = y;
            a[j + 5] = z;

            a[j + 6] = x;
            a[j + 7] = y;
            a[j + 8] = z;

            a[j + 9] = x;
            a[j + 10] = y;
            a[j + 11] = z;

            a[j + 12] = x;
            a[j + 13] = y;
            a[j + 14] = z;

            a[j + 15] = x;
            a[j + 16] = y;
            a[j + 17] = z;
        }

        this._changedBuffers[PICKINGCOLOR_BUFFER] = true;
    }

    setSizeArr(index, size) {

        var i = index * 6 * this._maxLetters;
        var a = this._sizeArr;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 6;
            a[j] = size;
            a[j + 1] = size;
            a[j + 2] = size;
            a[j + 3] = size;
            a[j + 4] = size;
            a[j + 5] = size;
        }

        this._changedBuffers[SIZE_BUFFER] = true;
    }

    setOffsetArr(index, offset) {

        var i = index * 18 * this._maxLetters;
        var a = this._offsetArr, x = offset.x, y = offset.y, z = offset.z;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 18;
            a[j] = x;
            a[j + 1] = y;
            a[j + 2] = z;

            a[j + 3] = x;
            a[j + 4] = y;
            a[j + 5] = z;

            a[j + 6] = x;
            a[j + 7] = y;
            a[j + 8] = z;

            a[j + 9] = x;
            a[j + 10] = y;
            a[j + 11] = z;

            a[j + 12] = x;
            a[j + 13] = y;
            a[j + 14] = z;

            a[j + 15] = x;
            a[j + 16] = y;
            a[j + 17] = z;
        }

        this._changedBuffers[OFFSET_BUFFER] = true;
    }

    setRgbaArr(index, rgba) {
        var i = index * 24 * this._maxLetters;
        var a = this._rgbaArr, x = rgba.x, y = rgba.y, z = rgba.z, w = rgba.w;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 24;

            a[j] = x;
            a[j + 1] = y;
            a[j + 2] = z;
            a[j + 3] = w;

            a[j + 4] = x;
            a[j + 5] = y;
            a[j + 6] = z;
            a[j + 7] = w;

            a[j + 8] = x;
            a[j + 9] = y;
            a[j + 10] = z;
            a[j + 11] = w;

            a[j + 12] = x;
            a[j + 13] = y;
            a[j + 14] = z;
            a[j + 15] = w;

            a[j + 16] = x;
            a[j + 17] = y;
            a[j + 18] = z;
            a[j + 19] = w;

            a[j + 20] = x;
            a[j + 21] = y;
            a[j + 22] = z;
            a[j + 23] = w;
        }

        this._changedBuffers[RGBA_BUFFER] = true;
    }

    setOutlineColorArr(index, rgba) {
        var i = index * 24 * this._maxLetters;
        var a = this._outlineColorArr, x = rgba.x, y = rgba.y, z = rgba.z, w = rgba.w;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 24;

            a[j] = x;
            a[j + 1] = y;
            a[j + 2] = z;
            a[j + 3] = w;

            a[j + 4] = x;
            a[j + 5] = y;
            a[j + 6] = z;
            a[j + 7] = w;

            a[j + 8] = x;
            a[j + 9] = y;
            a[j + 10] = z;
            a[j + 11] = w;

            a[j + 12] = x;
            a[j + 13] = y;
            a[j + 14] = z;
            a[j + 15] = w;

            a[j + 16] = x;
            a[j + 17] = y;
            a[j + 18] = z;
            a[j + 19] = w;

            a[j + 20] = x;
            a[j + 21] = y;
            a[j + 22] = z;
            a[j + 23] = w;
        }

        this._changedBuffers[OUTLINECOLOR_BUFFER] = true;
    }

    setOutlineArr(index, outline) {
        var i = index * 6 * this._maxLetters;
        var a = this._outlineArr;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 6;
            a[j] = outline;
            a[j + 1] = outline;
            a[j + 2] = outline;
            a[j + 3] = outline;
            a[j + 4] = outline;
            a[j + 5] = outline;
        }

        this._changedBuffers[OUTLINE_BUFFER] = true;
    }

    setRotationArr(index, rotation) {

        var i = index * 6 * this._maxLetters;
        var a = this._rotationArr;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 6;
            a[j] = rotation;
            a[j + 1] = rotation;
            a[j + 2] = rotation;
            a[j + 3] = rotation;
            a[j + 4] = rotation;
            a[j + 5] = rotation;
        }

        this._changedBuffers[ROTATION_BUFFER] = true;
    }

    setVertexArr(index, vertexArr) {

        var i = index * 12 * this._maxLetters;
        var a = this._vertexArr;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 12;
            a[j] = vertexArr[0];
            a[j + 1] = vertexArr[1];
            a[j + 2] = vertexArr[2];

            a[j + 3] = vertexArr[3];
            a[j + 4] = vertexArr[4];
            a[j + 5] = vertexArr[5];

            a[j + 6] = vertexArr[6];
            a[j + 7] = vertexArr[7];
            a[j + 8] = vertexArr[8];

            a[j + 9] = vertexArr[9];
            a[j + 10] = vertexArr[10];
            a[j + 11] = vertexArr[11];
        }

        this._changedBuffers[VERTEX_BUFFER] = true;
    }

    setAlignedAxisArr(index, alignedAxis) {
        var i = index * 18 * this._maxLetters;
        var a = this._alignedAxisArr, x = alignedAxis.x, y = alignedAxis.y, z = alignedAxis.z;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 18;
            a[j] = x;
            a[j + 1] = y;
            a[j + 2] = z;

            a[j + 3] = x;
            a[j + 4] = y;
            a[j + 5] = z;

            a[j + 6] = x;
            a[j + 7] = y;
            a[j + 8] = z;

            a[j + 9] = x;
            a[j + 10] = y;
            a[j + 11] = z;

            a[j + 12] = x;
            a[j + 13] = y;
            a[j + 14] = z;

            a[j + 15] = x;
            a[j + 16] = y;
            a[j + 17] = z;
        }

        this._changedBuffers[ALIGNEDAXIS_BUFFER] = true;
    }

    setFontIndexArr(index, fontIndex) {

        var i = index * 6 * this._maxLetters;
        var a = this._fontIndexArr;

        for (var q = 0; q < this._maxLetters; q++) {
            var j = i + q * 6;
            a[j] = fontIndex;
            a[j + 1] = fontIndex;
            a[j + 2] = fontIndex;
            a[j + 3] = fontIndex;
            a[j + 4] = fontIndex;
            a[j + 5] = fontIndex;
        }

        this._changedBuffers[FONTINDEX_BUFFER] = true;
    }

    createSizeBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._sizeBuffer);
        this._sizeBuffer = h.createArrayBuffer(this._sizeArr, 1, this._sizeArr.length);
    }

    createFontIndexBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._fontIndexBuffer);
        this._fontIndexBuffer = h.createArrayBuffer(this._fontIndexArr, 1, this._fontIndexArr.length);
    }

    createTexCoordBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._texCoordBuffer);
        this._texCoordBuffer = h.createArrayBuffer(this._texCoordArr, 4, this._texCoordArr.length / 4);

        h.gl.deleteBuffer(this._gliphParamBuffer);
        this._gliphParamBuffer = h.createArrayBuffer(this._gliphParamArr, 4, this._gliphParamArr.length / 4);
    }

    createOutlineBuffer() {
        var h = this._renderer.handler;

        h.gl.deleteBuffer(this._outlineBuffer);
        this._outlineBuffer = h.createArrayBuffer(this._outlineArr, 1, this._outlineArr.length);

        h.gl.deleteBuffer(this._noOutlineBuffer);
        this._noOutlineBuffer = h.createArrayBuffer(this._noOutlineArr, 1, this._noOutlineArr.length);
    }

    createOutlineColorBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._outlineColorBuffer);
        this._outlineColorBuffer = h.createArrayBuffer(this._outlineColorArr, 4, this._outlineColorArr.length / 4);
    }

    setMaxLetters(c) {
        this._maxLetters = c;
        // TODO: ...
    }

    refreshTexCoordsArr() {
        // it is empty
        return null;
    }
};

export { LabelHandler };
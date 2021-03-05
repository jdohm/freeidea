/**
 * @module og/shaders/billboard
 */

'use strict';

import { Program } from '../webgl/Program.js';

export function billboardPicking() {
    return new Program("billboardPicking", {
        uniforms: {
            projectionMatrix: "mat4",
            viewMatrix: "mat4",
            //uCamPos: "vec3",
            eyePositionHigh: "vec3",
            eyePositionLow: "vec3",
            uFloatParams: "vec2",
            uScaleByDistance: "vec3",
            uOpacity: "float",
            pickingScale: "float"
        },
        attributes: {
            a_vertices: "vec2",
            a_positionsHigh: "vec3",
            a_positionsLow: "vec3",
            a_size: "vec2",
            a_offset: "vec3",
            a_pickingColor: "vec3",
            a_rotation: "float",
            a_alignedAxis: "vec3"
        },
        vertexShader:
            `precision highp float;

            attribute vec2 a_vertices;
            attribute vec3 a_positionsHigh;
            attribute vec3 a_positionsLow;
            attribute vec3 a_offset;
            attribute vec2 a_size;
            attribute float a_rotation;
            attribute vec3 a_pickingColor;
            attribute vec3 a_alignedAxis;

            varying vec4 v_color;

            uniform mat4 viewMatrix;
            uniform mat4 projectionMatrix;
            //uniform vec3 uCamPos;
            uniform vec3 eyePositionHigh;
            uniform vec3 eyePositionLow;
            uniform vec2 uFloatParams;
            uniform vec3 uScaleByDistance;
            uniform float uOpacity;
            uniform float pickingScale;

            const vec3 ZERO3 = vec3(0.0);

            void main() {
                
                vec3 a_positions = a_positionsHigh + a_positionsLow;
                vec3 uCamPos = eyePositionHigh + eyePositionLow;

                vec3 look = a_positions - uCamPos;
                float lookLength = length(look);
                if( uOpacity == 0.0 ) {
                    gl_Position = vec4(0.0);
                    return;
                }
                v_color = vec4(a_pickingColor.rgb, 1.0) * step(lookLength, sqrt(dot(uCamPos,uCamPos) - uFloatParams[0]) + sqrt(dot(a_positions, a_positions) - uFloatParams[0]));
                vec3 right, up;
                if(a_alignedAxis == ZERO3){
                    up = vec3( viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1] );
                    right = vec3( viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0] );
                }else{
                    up = normalize(a_alignedAxis);
                    right = normalize(cross(look,up));
                    look = cross(up,right);
                }
                float dist = dot(uCamPos - a_positions, vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]));
                float focalSize = 2.0 * dist * uFloatParams[1];
                vec2 offset = a_offset.xy * focalSize;
                float scd = (1.0 - smoothstep(uScaleByDistance[0], uScaleByDistance[1], lookLength)) *(1.0 - step(uScaleByDistance[2], lookLength));
                vec2 scale = a_size * focalSize * scd * pickingScale;
                float cosRot = cos(a_rotation);
                float sinRot = sin(a_rotation);
                vec3 rr = (right * cosRot - up * sinRot) * (scale.x * a_vertices.x + scd * offset.x) + (right * sinRot + up * cosRot) * (scale.y * a_vertices.y + scd * offset.y) + a_positions;
                gl_Position = projectionMatrix * viewMatrix * vec4(rr, 1);
                gl_Position.z += a_offset.z;
            }`,
        fragmentShader:
            `precision highp float;
            varying vec4 v_color;
            void main () {
                gl_FragColor = v_color;
            }`
    });
}

export function billboard_screen() {
    return new Program("billboard", {
        uniforms: {
            u_texture: "sampler2d",
            projectionMatrix: "mat4",
            viewMatrix: "mat4",
            //uCamPos: "vec3",
            eyePositionHigh: "vec3",
            eyePositionLow: "vec3",
            uFloatParams: "vec2",
            uScaleByDistance: "vec3",
            uOpacity: "float"
        },
        attributes: {
            a_vertices: "vec2",
            a_texCoord: "vec2",
            a_positionsHigh: "vec3",
            a_positionsLow: "vec3",
            a_offset: "vec3",
            a_size: "vec2",
            a_rotation: "float",
            a_rgba: "vec4",
            a_alignedAxis: "vec3"
        },
        vertexShader:
            `precision highp float;
            attribute vec2 a_vertices;
            attribute vec2 a_texCoord;
            attribute vec3 a_positionsHigh;
            attribute vec3 a_positionsLow;
            attribute vec3 a_offset;
            attribute vec2 a_size;
            attribute float a_rotation;
            attribute vec4 a_rgba;
            attribute vec3 a_alignedAxis;

            varying vec2 v_texCoords;
            varying vec4 v_rgba;

            uniform mat4 viewMatrix;
            uniform mat4 projectionMatrix;
            //uniform vec3 uCamPos;
            uniform vec3 eyePositionHigh;
            uniform vec3 eyePositionLow;
            uniform vec2 uFloatParams;
            uniform vec3 uScaleByDistance;
            uniform float uOpacity;

            const vec3 ZERO3 = vec3(0.0);

            void main() {
                
                vec3 a_positions = a_positionsHigh + a_positionsLow;
                vec3 uCamPos = eyePositionHigh + eyePositionLow;

                v_texCoords = a_texCoord;
                vec3 look = a_positions - uCamPos;
                float lookLength = length(look);
                v_rgba = a_rgba;
                /*v_rgba.a *= uOpacity * step(lookLength, sqrt(dot(uCamPos,uCamPos) - uFloatParams[0]) + sqrt(dot(a_positions,a_positions) - uFloatParams[0]));*/
                if(uOpacity * step(lookLength, sqrt(dot(uCamPos,uCamPos) - uFloatParams[0]) + sqrt(dot(a_positions,a_positions) - uFloatParams[0])) == 0.0){
                    return;
                }
                vec3 right, up;
                if(a_alignedAxis == ZERO3){
                    up = vec3( viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1] );
                    right = vec3( viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0] );
                }else{
                    up = normalize(a_alignedAxis);
                    right = normalize(cross(look,up));
                    look = cross(up,right);
                }
                float dist = dot(uCamPos - a_positions, vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]));
                float focalSize = 2.0 * dist * uFloatParams[1];
                vec2 offset = a_offset.xy * focalSize;
                float scd = (1.0 - smoothstep(uScaleByDistance[0], uScaleByDistance[1], lookLength)) * (1.0 - step(uScaleByDistance[2], lookLength));
                vec2 scale = a_size * focalSize * scd;
                float cosRot = cos(a_rotation);
                float sinRot = sin(a_rotation);
                vec3 rr = (right * cosRot - up * sinRot) * (scale.x * a_vertices.x + scd * offset.x) + (right * sinRot + up * cosRot) * (scale.y * a_vertices.y + scd * offset.y);

                vec3 highDiff = a_positionsHigh - eyePositionHigh;
                vec3 lowDiff = a_positionsLow + rr - eyePositionLow;

                mat4 viewMatrixRTE = viewMatrix;
                viewMatrixRTE[3] = vec4(0.0, 0.0, 0.0, 1.0);

                gl_Position = projectionMatrix * viewMatrixRTE * vec4(highDiff + lowDiff, 1.0);
                gl_Position.z += a_offset.z;
            }`,
        fragmentShader:
            `precision highp float;
            uniform sampler2D u_texture;
            varying vec2 v_texCoords;
            varying vec4 v_rgba;
            void main () {
                vec4 color = texture2D(u_texture, v_texCoords);
                if(color.a < 0.1)
                    discard;
                gl_FragColor = color * v_rgba;
            }`
    });
}
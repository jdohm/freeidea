import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import postcss from 'rollup-plugin-postcss';

const LIB_SUFFIX = process.env.entry ? `.${process.env.entry}` : "";
const LIB_NAME = pkg.name + LIB_SUFFIX;
const OUTPUT_NAME = `dist/${LIB_NAME}-${pkg.version}`;

export default [{
    input: `src/og/index${LIB_SUFFIX}.js`,
    output: [
        {
            file: OUTPUT_NAME + ".js",
            format: 'umd',
            name: 'og',
            sourcemap: false
        }
    ],
    plugins: [
        terser(),
        json()
    ]
}, {
    input: `css/og.css`,
    output: [
        {
            file: OUTPUT_NAME + ".css",
            format: 'umd',
            name: pkg.name,
            sourcemap: false
        }
    ],
    plugins: [
        postcss({
            extract: true,
            minimize: true
        })]
}];
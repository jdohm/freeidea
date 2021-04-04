/**
 * @fileOverview this file provides a svg which can be used as a texture for the idea entities
 * @name DrawSvg.js
 * @author Jannis Dohm
 * @license MIT
 */

/**
 * function to create and return svg
 * @param {Object} ideaData
 * @param {number} ideaData.ID - number of idea
 * @param {string} ideaData.title - title of idea
 */
function draw(ideaData){
    var SVG = `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
        xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
        width="300"
        height="300"
        viewBox="0 0 300 300"
        version="1.1"
    >
    <rect width="300" height="300" fill="#FFFFFF"/>
    <text x="000" y="200" fill="#000000" font-size="2.0em">#${ideaData.ID}</text>
    <text x="100" y="200" fill="#000000" font-size="2.0em">#${ideaData.ID}</text>
    <text x="200" y="200" fill="#000000" font-size="2.0em">#${ideaData.ID}</text>
    <text x="050" y="170" fill="#000000" transform="rotate(-90, 050, 170)" font-size="1.0em">${ideaData.title}</text>
    <text x="150" y="170" fill="#000000" transform="rotate(-90, 150, 170)" font-size="1.0em">${ideaData.title}</text>
    <text x="250" y="170" fill="#000000" transform="rotate(-90, 250, 170)" font-size="1.0em">${ideaData.title}</text>
    </svg>
  `;
    return SVG;
}
module.exports = {
    draw,
};

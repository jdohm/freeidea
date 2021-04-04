/**
 * @fileOverview this file provides functions to open a side panel,
 * which can be used to display idea informations, login, register...
 * @name SidePanel.js
 * @author Jannis Dohm
 * @license MIT
 */
'use strict';

let first = '<div style="display: flex; align-content: space-between; flex-wrap: nowrap; flex-direction: column; width: 96%; height: 96%; margin: 2%;">';
let last = '</div>';

/**
 * function to show side panel, this can be used to
 * display informations about an idea, a login screen ...
 * this side panel will check the screen width and proportions to determine
 * if the side panel will be 30% or 50% of the screen, or even the whole screen
 * @param {string} html - content which will be displayed inside the side panel
 */
function show(html) {
    if (document.documentElement.clientWidth > document.documentElement.clientHeight && document.documentElement.clientWidth > 800) {
        if (document.documentElement.clientWidth > document.documentElement.clientHeight && document.documentElement.clientWidth > 1400) {
            document.getElementById("earth").style["width"] = "70%";
            document.getElementById("idea").style["width"] = "30%";
        } else {
            document.getElementById("earth").style["width"] = "50%";
            document.getElementById("idea").style["width"] = "50%";
        }
    } else {
        document.getElementById("earth").style["width"] = "0%";
        document.getElementById("idea").style["width"] = "100%";
    }
    document.getElementById("idea").innerHTML = first + html + last;

};

/**
 * function to hide the side panel
 */
function hide() {
    document.getElementById("earth").style["width"] = "100%";
    document.getElementById("idea").style["width"] = "0%";
    document.getElementById("idea").innerHTML = "";
}

export {show};
export {hide};

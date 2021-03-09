'use strict';

var first = '<div style="display: flex; align-content: space-between; flex-wrap: nowrap; flex-direction: column; width: 96%; height: 96%; margin: 2%;">'; 


var last = '</div>';

function show(html) {
    if(document.documentElement.clientWidth > document.documentElement.clientHeight && document.documentElement.clientWidth > 800) {
        if(document.documentElement.clientWidth > document.documentElement.clientHeight && document.documentElement.clientWidth > 1400) {
            document.getElementById("earth").style["width"] = "70%";
            document.getElementById("idea").style["width"] = "30%";
        }
        else {
        document.getElementById("earth").style["width"] = "50%";
        document.getElementById("idea").style["width"] = "50%";
        }
    }
    else {
        document.getElementById("earth").style["width"] = "0%";
        document.getElementById("idea").style["width"] = "100%";
    }
    document.getElementById("idea").innerHTML = first + html + last;

};

function hide(){
    document.getElementById("earth").style["width"] = "100%";
    document.getElementById("idea").style["width"] = "0%";
    document.getElementById("idea").innerHTML = "";
}

export {show};
export {hide};

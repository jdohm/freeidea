'use strict';

import { Events } from './Events.js';
import { Vec3 } from './math/Vec3.js';
import { getHTML, parseHTML, createLonLat } from './utils/shared.js';

class SideIdea {
    constructor(options) {

        this._id = SideIdea._staticCounter++;

        this._function = null;
        this._ll = [0, 0];

        this.el = null;
        //this._template = getHTML(TEMPLATE, { className: options.className });
    }

    static get _staticCounter() {
        if (!this.__counter__ && this.__counter__ !== 0) {
            this.__counter__ = 0;
        }
        return this.__counter__;
    }

    static set _staticCounter(n) {
        this.__counter__ = n;
    }

	setFunction(functio, ll){
      //console.log("set this._ll to: " + ll);
		this._function = functio;
		this._ll = ll;
		return this;
	}

    show() {
        var lat = this._ll.lat;
        var lon = this._ll.lon;
        var func = this._function;
        if(document.documentElement.clientWidth > document.documentElement.clientHeight && document.documentElement.clientWidth > 800) {
            document.getElementById("earth").style["width"] = "50%";
            document.getElementById("idea").style["width"] = "50%";
            }
        else {
            document.getElementById("earth").style["width"] = "0%";
            document.getElementById("idea").style["width"] = "100%";
        }
        document.getElementById("idea").innerHTML =
    ` <form method="POST" action="submitIdea" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded"  target="_blank">
        <H2>Create your new idea<\H2>
		<textarea id="nameText" style="overflow:auto;resize:none" rows="1" cols="60" name="nameText" placeholder="Title: Using peanuts to end world hunger"></textarea>
        <H3>Please describe your Idea:<\H3>
		<textarea id="ideaText" style="overflow:auto;resize:none" rows="5" cols="60" name="ideaText" placeholder="Enter description"></textarea>
	    <p>Add topics</p>
		<textarea id="categoriesText" style="overflow:auto;resize:none" rows="1" cols="60" name="categoriesText" placeholder="social, environment, it, ..."></textarea>
	    <p>Needed skills</p>
		<textarea id="skillsText" style="overflow:auto;resize:none" rows="1" cols="60" name="skillsText" placeholder="programming, management, UI-Design, knitting, ..."></textarea>
        </br>
    <p>This project is under development, your idea could be deleted at any time.</p>
		<button onclick='
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var obj = JSON.parse(this.responseText);
                    myCreateIdea(${lon},${lat},obj,0);
                    document.getElementById("earth").style["width"] = "100%";
                    document.getElementById("idea").style["width"] = "0%";
                    document.getElementById("idea").innerHTML = "";
                }};
            var nameText = document.getElementById("nameText").value;
            var ideaText = document.getElementById("ideaText").value;
            xhttp.open("POST", "submitIdea", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("nameText="+nameText+"&ideaText="+ideaText+"&lon="+${lon}+"&lat="+${lat});
' style="margin-left: 4px" class="save-btn" type="button">Save</button>
		<button onclick='
        document.getElementById("earth").style["width"] = "100%";
        document.getElementById("idea").style["width"] = "0%";
        document.getElementById("idea").innerHTML = "";
' style="margin-left: 4px" class="close-btn" type="button">Cancel</button>
		</form>
    `;
        return this;
    }

    hide() {
        document.getElementById("earth").style["width"] = "100%";
        document.getElementById("idea").style["width"] = "0%";
        document.getElementById("idea").innerHTML = "";
        return this;
    }
}

export { SideIdea };

'use strict';

import { Events } from './Events.js';
import { Vec3 } from './math/Vec3.js';
import { getHTML, parseHTML, createLonLat } from './utils/shared.js';

class SideShowIdea {
    constructor(options) {

        this._id = SideShowIdea._staticCounter++;

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

    show(IdeaID) {
        /*-------------
          get Infos for Idea from server
        */

        var xhttp = new XMLHttpRequest();
        var self = this;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var obj = JSON.parse(this.responseText);

                document.getElementById("id_title").innerHTML = obj.TITLE;
                document.getElementById("id_description").innerHTML = obj.DESCRIPTION;
                document.getElementById("id_tags").innerHTML = "<div>Topics: </div> ";
                obj.tags.forEach((dat) => {document.getElementById("id_tags").innerHTML += '<div class="og-tag-span">' + dat + '</div>';});
                document.getElementById("id_skills").innerHTML = "<div>Needed skills: </div> ";
                obj.skills.forEach((dat) => {document.getElementById("id_skills").innerHTML += '<div class="og-tag-span">' + dat + '</div> ';});
            }
        };
        xhttp.open("POST", "getIdea", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("IdeaID="+IdeaID);

        /*-------------
          get Infos for Idea from server
        */



        if(document.documentElement.clientWidth > document.documentElement.clientHeight && document.documentElement.clientWidth > 800) {
            document.getElementById("earth").style["width"] = "50%";
            document.getElementById("idea").style["width"] = "50%";
            }
        else {
            document.getElementById("earth").style["width"] = "0%";
            document.getElementById("idea").style["width"] = "100%";
        }
        document.getElementById("idea").innerHTML =
    ` 
<div style="display: flex; align-content: space-between; flex-wrap: nowrap; flex-direction: column; width: 100%; height: 100%; margin: 2%;">
    <div>
    <H2 id="id_title"><H2>
<button onclick='
navigator.clipboard.writeText("https://openidea.io/?Idea=" + ${IdeaID});
alert("https://openidea.io/?Idea=" + ${IdeaID} + " is now in your clipboard, feel free to share");

' >Share</button>
    </br>
    <p id="id_description"></p>
    <div id="id_tags"></div>
    <div id="id_skills"></div>
    </br>
    </br>

    </div>
    <div>
    <H3>Vote this idea</H3></br>
        <img src="./media/up.svg" alt="Vote Up!" id="up-btn" style="width:49%;margin-top: 6px;vertical-align: bottom;" onclick='
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+${IdeaID}+"&upvote=1");
            myUpdateIdeaHeight(${IdeaID}, 1);
            document.getElementById("earth").style["width"] = "100%";
            document.getElementById("idea").style["width"] = "0%";
            document.getElementById("idea").innerHTML = "";
        '>
        <img src="./media/down.svg" id="down-btn" alt="Vote Down" style="width:49%;" onclick='
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+${IdeaID}+"&upvote=0");
            myUpdateIdeaHeight(${IdeaID}, -1);
            document.getElementById("earth").style["width"] = "100%";
            document.getElementById("idea").style["width"] = "0%";
            document.getElementById("idea").innerHTML = "";
        '>
        <button onclick='
            document.getElementById("earth").style["width"] = "100%";
            document.getElementById("idea").style["width"] = "0%";
            document.getElementById("idea").innerHTML = "";
        ' style="width: 100%" id="close-btn" class="close-btn" type="button">Back</button>
    </div>
</div>
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

export { SideShowIdea };


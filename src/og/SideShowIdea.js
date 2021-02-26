'use strict';

import { Events } from './Events.js';
import { Vec3 } from './math/Vec3.js';
import { getHTML, parseHTML, createLonLat } from './utils/shared.js';

class SideShowIdea {
    constructor(options) {

        this._id = SideShowIdea._staticCounter++;

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

	  setFunction(ll){
		    this._ll = ll;
		    return this;
	  }

    show(IdeaID) {
        var lat = this._ll.lat;
        var lon = this._ll.lon;
        var func = this._function;


        /*-------------
          get Infos for Idea from server
        */

        var xhttp = new XMLHttpRequest();
        var self = this;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var obj = JSON.parse(this.responseText);

                //console.log('Asked ID: ' + obj.AskForIdea);
                document.getElementById("id_IdeaID").innerHTML = obj.AskForIdea;
                //console.log('Titel: ' + obj.TITLE);
                document.getElementById("id_title").innerHTML = obj.TITLE;
                //console.log('Description: ' + obj.DESCRIPTION);
                document.getElementById("id_description").innerHTML = obj.DESCRIPTION;
                // self.setTitle("<H2>" + obj.TITLE + "</H2>");
                // self.setContent("<p>" + obj.DESCRIPTION + "</p>");
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
<div style="display: flex; align-content: space-between; flex-wrap: wrap; width: 100%; height: 100%;">
    <div>
    <H2 id="id_title"><H2>
    <p id="id_IdeaID"></p>
    </br>
    <p id="id_description"></p>
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

    _getIdeaData(IdeaID) {
        /*-------------
          get Infos for Idea from server
        */

        var xhttp = new XMLHttpRequest();
        var self = this;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var obj = JSON.parse(this.responseText);

                //console.log('Asked ID: ' + obj.AskForIdea);
                document.getElementById("id_IdeaID").innerHTML = obj.AskForIdea;
                //console.log('Titel: ' + obj.TITLE);
                document.getElementById("id_title").innerHTML = obj.TITLE;
                //console.log('Description: ' + obj.DESCRIPTION);
                document.getElementById("id_description").innerHTML = obj.DESCRIPTION;
                // self.setTitle("<H2>" + obj.TITLE + "</H2>");
                // self.setContent("<p>" + obj.DESCRIPTION + "</p>");
            }
        };
        xhttp.open("POST", "getIdea", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("IdeaID="+this._id);

        /*-------------
          get Infos for Idea from server
        */
    }
}

export { SideShowIdea };


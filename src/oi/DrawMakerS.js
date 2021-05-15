/**
 * @fileOverview this file provides functions to generate, filter and display makerspaces as entities
 * @name DrawMakerS.js
 * @author Jannis Dohm
 * @license MIT
 */
import { Entity } from './../og/entity/Entity.js';
import { Vector } from './../og/layer/Vector.js';

/**
 * function to create and display entities representing the makerspaces on the globe
 * @param {Object} pointLayer - created entities will be added to this layer
 * @param {string[]} [filter] - placeholder
 */
function draw(pointLayer, filter) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.responseText);
            window.ulogin = this.getResponseHeader("login");
            if(window.ulogin != "false") myLogin(window.ulogin);
            for (var key in obj) {
                // skip loop if the property is from prototype
                if (!obj.hasOwnProperty(key)) continue;

                var obj2 = pointLayer._entities.find(obj2 => obj2.properties.name == "Space" + obj[key].MakerSID);
                //if MakerSBeam with ID is missing create new MakerSBeam
                if(obj2  == undefined) {
                    myCreateMakerS(obj[key].lon, obj[key].lat, obj[key].MakerSID, obj[key].tools, obj[key].users);
                }
            }
        }
    };
    xhttp.open("GET", "getMakerS", true);
    xhttp.send();
    }
export{ draw }

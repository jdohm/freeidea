/**
 * @fileOverview this file provides functions to generate, filter and display ideas as entities
 * @name DrawIdeas.js
 * @author Jannis Dohm
 * @license MIT
 */
import { Entity } from './../og/entity/Entity.js';
import { Vector } from './../og/layer/Vector.js';

/**
 * function to create and display entities representing the ideas on the globe
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

                var obj2 = pointLayer._entities.find(obj2 => obj2.properties.name == obj[key].IdeaID);
                //if IdeaBeam with ID is missing create new IdeaBeam
                if(obj2  == undefined) {
                    myCreateIdea(obj[key].lon, obj[key].lat, obj[key].IdeaID, obj[key].upvotes-obj[key].downvotes, obj[key].tags, obj[key].skills, obj[key].users);
                    // console.log("created Idea " + pointLayer._entities[key].properties.name);
                }
            }
        }
    };
    xhttp.open("GET", "getIdeas", true);
    xhttp.send();
    }
export{ draw }

/**
 * function to filter ideas, an empty filter will result in the display of all ideas.
 * adding strings (tags) to the filter array will reduce the displayed ideas to these
 *  matching one of the strings.
 * @param {Object} pointLayer - containing the idea entities to be filtered
 * @param {string[]} filter - array of strings which contain the filter keywords.
 */
function filterIdeas(pointLayer, filter) {
    //if filter is set check filter
    if(filter !== null && filter.length !== 0) {
        document.getElementById("filter-btn").classList.remove("oi-filter-button");
        document.getElementById("filter-btn").classList.add("oi-filter-button-active");

    //each entity gets checked
    for (var key in pointLayer._entities){
        // console.log(pointLayer._entities[key].id);
        //check if tags property exists (to ignore mark and other non idea entities)
        if(pointLayer._entities[key].properties.tags){
            //hide ideas to apply filter if filter value isn't IdeasOnly
            //(in this case all ideas should be visible)
            if(!(filter.includes("IdeasOnly") && filter.length == 1)){
                pointLayer._entities[key].setVisibility(false);
            }
            //show all ideas if only IdeasOnly is set as a filter
            else if(filter.includes("IdeasOnly") && filter.length == 1){
                pointLayer._entities[key].setVisibility(true);
            }
            if(!filter.includes("MakerspacesOnly")){
            //check each filter value
            for (var ke2 in filter){
                //if tag includes filter value show entity
                if(pointLayer._entities[key].properties.tags.includes(filter[ke2])){
                    pointLayer._entities[key].setVisibility(true);
                }
            }
            }
        }
        //hide all makerspaces if IdeasOnly is active
        else if(filter.includes("IdeasOnly") && pointLayer._entities[key].properties.tools){
            pointLayer._entities[key].setVisibility(false);
        }
        //show all makerspaces if IdeasOnly isn't active
        else if(!filter.includes("IdeasOnly") && pointLayer._entities[key].properties.tools){
            pointLayer._entities[key].setVisibility(true);
        }
     }}
    else{
        for (var key in pointLayer._entities){
            if(pointLayer._entities[key].properties.tags || pointLayer._entities[key].properties.tools){
                pointLayer._entities[key].setVisibility(true);
            }
            document.getElementById("filter-btn").classList.remove("oi-filter-button-active");
            document.getElementById("filter-btn").classList.add("oi-filter-button");
        }
    }
}

export{ filterIdeas }

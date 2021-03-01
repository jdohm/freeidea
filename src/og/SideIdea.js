'use strict';

function show(ll) {
    myUpdateMarkPos(ll);
    var lon = ll.lon;
    var lat = ll.lat;
        var html =
    `<form method="POST" action="submitIdea" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded"  target="_blank">
        <H2>Create your new idea</H2>
		<textarea id="nameText" style="overflow:auto;resize:none" rows="1" cols="60" name="nameText" placeholder="Title: Using peanuts to end world hunger"></textarea>
        <H3>Please describe your Idea:</h3>
		<textarea id="ideaText" style="overflow:auto;resize:none" rows="5" cols="60" name="ideaText" placeholder="Enter description"></textarea>
	    <p>Add topics</p>
		<textarea id="categoriesText" style="overflow:auto;resize:none" rows="1" cols="60" name="categoriesText" placeholder="social, environment, it, ..."></textarea>
	    <p>Needed skills</p>
		<textarea id="skillsText" style="overflow:auto;resize:none" rows="1" cols="60" name="skillsText" placeholder="programming, management, UI-Design, knitting, ..."></textarea>
        </br>
    <p>This project is under development, your idea could be deleted at any time.</p>
		<div onclick='
            myHideMark();
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var obj = JSON.parse(this.responseText);
                    myCreateIdea(${lon},${lat},obj,0);
                    SidePanel.hide();
                }};
            var nameText = document.getElementById("nameText").value;
            var ideaText = document.getElementById("ideaText").value;
            var _tags = document.getElementById("categoriesText").value;
            var _skills = document.getElementById("skillsText").value;
            xhttp.open("POST", "submitIdea", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("nameText="+nameText+"&ideaText="+ideaText+"&lon="+${lon}+"&lat="+${lat}+"&tags="+_tags+"&skills="+_skills);
' class="oi-side-button" type="button">Save</div>
		<div onclick='
        myHideMark();
        SidePanel.hide();
' class="oi-side-button" type="button">Cancel</div>
		</form>
    `;
        SidePanel.show(html);
};

export { show };

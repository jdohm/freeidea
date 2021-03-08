'use strict';

function show(ll) {
    myUpdateMarkPos(ll);
    var lon = ll.lon;
    var lat = ll.lat;

        var htmlIdea =
    `
<div style="overflow-y: auto;flex-grow: 1;">
    <form method="POST" action="submitIdea" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded"  target="_blank" name="idea_form">
        <H2>Create your new idea</H2>
        <textarea id="nameText" style="overflow:auto;resize:none" rows="1" cols="60" name="nameText" placeholder="Title: Using peanuts to end world hunger" required></textarea>
        <H3>Please describe your Idea:</h3>
        <textarea id="ideaText" style="overflow:auto;resize:none" rows="5" cols="60" name="ideaText" placeholder="Enter description" required></textarea>
        <p>Add topics</p>
        <textarea id="categoriesText" style="overflow:auto;resize:none" rows="1" cols="60" name="categoriesText" placeholder="social, environment, it, ..."></textarea>
        <p>Needed skills</p>
        <textarea id="skillsText" style="overflow:auto;resize:none" rows="1" cols="60" name="skillsText" placeholder="programming, management, UI-Design, knitting, ..."></textarea>
        <br> <br>
        <input type="checkbox" id="mastodon" name="mastodon">
        <label for="mastodon">Publish idea on mastodon</label><br>
		</form>
</div>
<div style="flex-grow: 0;">
    <p>This project is under development, your idea could be deleted at any time.</p>
		<div onclick='
        if(!document.forms.idea_form.nameText.checkValidity()) {
            document.getElementById("nameText").placeholder = "Can&#39t be empty";
            document.getElementById("nameText").style.background = "#ff6666";
            return;
        }
        if(!document.forms.idea_form.ideaText.checkValidity()) {
            document.getElementById("ideaText").placeholder = "Can&#39t be empty";
            document.getElementById("ideaText").style.background = "#ff6666";
            return;
        }
        myHideMark();
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var obj = JSON.parse(this.responseText);
                if(obj) {
                    if(obj == "error") alert("error - are you still logged in?");
                    else {
                        myCreateIdea(${lon},${lat},obj,0);
                        SidePanel.hide();
                        }
                    }
            }};
        var nameText = document.getElementById("nameText").value;
        var ideaText = document.getElementById("ideaText").value;
        var _tags = document.getElementById("categoriesText").value;
        var _skills = document.getElementById("skillsText").value;
        var _mastodon = document.getElementById("mastodon").checked;
        xhttp.open("POST", "submitIdea", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("nameText="+nameText+"&ideaText="+ideaText+"&lon="+${lon}+"&lat="+${lat}+"&tags="+_tags+"&skills="+_skills+"&mastodon="+_mastodon);
        ' class="oi-side-button" type="button">Save</div>
		<div onclick='
        myHideMark();
        SidePanel.hide();
        ' class="oi-side-button" type="button">Cancel</div>
</div>
    `;

    var htmlNotLoggedIn = `
<div style="overflow-y: auto;flex-grow: 1;">
    <p>To create a new idea, you need to login or register</p>
		<div onclick='SideLoginRegister.showLogin(); myHideMark();' class="oi-side-button" type="button">Login</div>
		<div onclick='SideLoginRegister.showRegister(); myHideMark();' class="oi-side-button" type="button">Register</div>
</div>
<div style="flex-grow: 0;">
		<div onclick='myHideMark(); SidePanel.hide();' class="oi-side-button" type="button">Cancel</div>
</div>
`;
    if(ulogin == "false") {SidePanel.show(htmlNotLoggedIn);}
    else {SidePanel.show(htmlIdea);}
};

export { show };

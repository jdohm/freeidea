'use strict';

function save(lon, lat){
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
                        myCreateIdea(lon,lat,obj,0);
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
        xhttp.send("nameText="+nameText+"&ideaText="+ideaText+"&lon="+lon+"&lat="+lat+"&tags="+_tags+"&skills="+_skills+"&mastodon="+_mastodon);
};
export { save };

function show(ll) {
    myUpdateMarkPos(ll);
    var lon = ll.lon;
    var lat = ll.lat;

        var htmlIdea =
    `
<div style="overflow-y: auto;overflow-x: hidden;flex-grow: 1;">
    <form method="POST" action="submitIdea" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded" target="_blank" name="idea_form">
        <div class="row">
            <H5>Create your new idea</H5>
        </div>
        <div class="input-field col s9">
            <textarea type="text" id="nameText" name="nameText" class="materialize-textarea validate" required></textarea>
            <label for="nameText">Title:</label>
        </div>
        <div class="input-field col s9">
            <textarea id="ideaText" name="ideaText" class="materialize-textarea validate" required></textarea>
            <label for="ideaText">Please describe your Idea:</label>
        </div>
        <div class="input-field col s9">
            <textarea id="categoriesText" name="categoriesText" class="materialize-textarea validate" required></textarea>
            <label for="categoriesText">Add topics:</label>
        </div>
        <div class="input-field col s9">
            <textarea id="skillsText" name="skillsText" class="materialize-textarea validate" required></textarea>
            <label for="skillsText">Needed skills:</label>
        </div>
        <p>
            <label>
                <input type="checkbox" id="mastodon" name="mastodon" />
                <span>Publish idea on mastodon</span>
            </label>
        </p>
    </form>
</div>
<div style="flex-grow: 0;">
    <p>This project is under development, your idea could be deleted at any time.</p>
    <button class="btn waves-effect waves-light oi-custom-greys oi-side-button-width" style="margin-bottom: 5px;" type="button" name="back" onclick='SideIdea.save(${lon}, ${lat});'>Save<i class="material-icons left">save</i>
    </button>

    <button class="btn waves-effect waves-light oi-custom-greys oi-side-button-width" type="button" name="back" onclick='myHideMark(); SidePanel.hide();'>Cancel<i class="material-icons left">arrow_back</i>
    </button>
</div>    `;

    var htmlNotLoggedIn = `
<div style="overflow-y: auto;flex-grow: 1;">
    <p>To create a new idea, you need to login or register</p>
      <div class="row">
<button class="btn waves-effect waves-light oi-custom-greys oi-side-button-width" type="button" name="back" onclick='SideLoginRegister.showLogin(); myHideMark();'>Login<i class="material-icons right">send</i>
      </div>
      <div class="row">
<button class="btn waves-effect waves-light oi-custom-greys oi-side-button-width" type="button" name="back" onclick='SideLoginRegister.showRegister(); myHideMark();'>Register<i class="material-icons right"> send </i>
      </div>
</div>
<div style="flex-grow: 0;">
<button class="btn waves-effect waves-light oi-custom-greys oi-side-button-width" type="button" name="back" onclick='myHideMark(); SidePanel.hide();'>Back<i class="material-icons left">arrow_back</i>
  </button>
</div>
`;
    if(ulogin == "false") {SidePanel.show(htmlNotLoggedIn);}
    else {SidePanel.show(htmlIdea);}
    M.updateTextFields();
};

export { show };

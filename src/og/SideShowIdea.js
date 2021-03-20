'use strict';
function show(IdeaID) {
      /*---------------------------------|
      | get Infos for Idea from server   |
      |---------------------------------*/
        var xhttp = new XMLHttpRequest();
        var self = this;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var obj = JSON.parse(this.responseText);


                var ulogin = this.getResponseHeader("login");
                if (ulogin == "false") {
                    document.getElementById("id_vote").innerHTML = LoginRegister;
                    document.getElementById("up-btn").style.opacity = "0.4";
                    document.getElementById("up-btn").onclick = function () {SideLoginRegister.showLogin();};
                    document.getElementById("down-btn").style.opacity = "0.4";
                    document.getElementById("down-btn").onclick = function () {SideLoginRegister.showLogin();};
                }

                //cactus chat
                initComments({
                        node: document.getElementById("comment-section"),
                        defaultHomeserverUrl: "https://matrix.cactus.chat:8448",
                        serverName: "cactus.chat",
                        siteName: "openidea.io",
                        commentSectionId: "Idea#" + IdeaID
                    });
                //cactus chat end
                document.getElementById("id_title").innerHTML = obj.TITLE;
                document.getElementById("id_description").innerHTML = obj.DESCRIPTION;
                document.getElementById("id_tags").innerHTML = "<span>Topics: </span> ";
                obj.tags.forEach((dat) => {document.getElementById("id_tags").innerHTML += '<div class="og-tag-span">' + dat + '</div>';});
                document.getElementById("id_skills").innerHTML = "<span>Needed skills: </span> ";
                obj.skills.forEach((dat) => {document.getElementById("id_skills").innerHTML += '<div class="og-tag-span">' + dat + '</div> ';});
                document.getElementById("id_user").innerHTML = "<span>Idea by: </span> ";
                obj.user.forEach((dat) => {document.getElementById("id_user").innerHTML += '<div class="og-tag-span">' + dat + '</div> ';});
            }
        };
        xhttp.open("POST", "getIdea", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("IdeaID="+IdeaID);
        /*---------------------------------|
        | get Infos for Idea from server   |
        |---------------------------------*/
        var html =
            `
<div style="flex-grow: 0;">
    <H2 id="id_title" style="display: inline-block;margin-top: 0px;margin-bottom: 0px;"></H2>
    <img src="./media/share.svg" alt="Share idea!" id="share-btn" style="position: absolute; height:1.5em; right: 5px; top: 5px;" onclick='
        navigator.clipboard.writeText("https://openidea.io/?Idea=" + ${IdeaID});
        alert("https://openidea.io/?Idea=" + ${IdeaID} + " is now in your clipboard, feel free to share");
        ' >
</div>
<div style="overflow-y: auto;flex-grow: 1;">
    <p id="id_description"></p>
    <div id="id_tags"></div>
    <div id="id_skills"></div>
    <div id="id_user"></div>
    <div id="comment-section"></div>
</div>
<div style="flex-grow: 0;">
    <H6 id="id_vote" style="margin-top: 5px;margin-bottom: 5px;">Vote this idea</H6>
<button id="up-btn" class="btn waves-effect waves-light oi-custom-greys" style="width:49%; margin: 0% 0.5%; background-color: #43a047FF!important; color: #FFFFFFFF!important; margin-bottom: 1%;" type="button" name="back" onclick='
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+${IdeaID}+"&upvote=1");
            SidePanel.hide();
'>Vote Up<i class="material-icons right">thumb_up</i>
  </button><button id="down-btn" class="btn waves-effect waves-light oi-custom-greys" style="width:49%; margin: 0% 0.5%; background-color: #e53935FF!important; color: #FFFFFFFF!important; margin-bottom: 1%;" type="button" name="back" onclick='
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+${IdeaID}+"&upvote=0");
            SidePanel.hide();
'>Vote Down<i class="material-icons right">thumb_down</i></button>

<button class="btn waves-effect waves-light oi-custom-greys" style="width:65%; margin: 0% 0.5%;" type="button" name="back" onclick='SidePanel.hide();'>Back<i class="material-icons left">arrow_back</i>
  </button><button class="btn waves-effect waves-light oi-custom-greys" style="width:33%; margin: 0% 0.5%;" type="button" name="back" onclick='SideShowIdea.showSupport(${IdeaID})'>Support request</button>
</div>
    `;
    SidePanel.show(html);

    var LoginRegister = `
    <a href="#" id="btnLogin" class="oi-link" onclick="SideLoginRegister.showLogin();">Login</a>
    <span>or</span>
    <a href="#" id="btnRegister" class="oi-link" onclick="SideLoginRegister.showRegister();">Register</a>
    <span>to vote this idea</span>`;
};

export { show };

function showSupport(IdeaID){
        var html =
            `
<div style="flex-grow: 0;">
    <H4 id="id_title" style="display: inline-block;">Support Request</H4>
</div>
<div style="overflow-y: auto;flex-grow: 1;">
        <H6>Please describe your request</H6>
        <p>consider logging in, to provide us the option to contact you.</p>
      <div class="row">
        <div class="input-field col s10">
          <textarea id="text" type="text" name="text" class="materialize-textarea" placeholder="updated description, added tag, inappropriate..." required></textarea>
          <label for="text">report: reason</label>
        </div>
      </div>
</div>
<div style="flex-grow: 0;">
<button class="btn waves-effect waves-light oi-custom-greys" style="width:33%; margin: 0% 0.5%;" type="button" name="back" onclick='myHideMark(); SidePanel.hide();'>Cancel<i class="material-icons left">arrow_back</i>
  </button><button class="btn waves-effect waves-light oi-custom-greys" style="width:65%; margin: 0% 0.5%;" type="button" name="back" onclick='SideShowIdea.sendSupportRequest(${IdeaID})'>Submit Requst<i class="material-icons right">send</i>
  </button>
</div>
    `;
    SidePanel.show(html);
    M.updateTextFields();
}

export { showSupport };

function sendSupportRequest(IdeaID){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
            // var obj = JSON.parse(this.responseText);
            // if(obj) {
            //     if(obj == "error") alert("error - are you still logged in?");
            //     else {
            //         myCreateIdea(lon,lat,obj,0);
            //         SidePanel.hide();
            //         }
            //     }
        }};
    var _testText = document.getElementById("text").value;
    xhttp.open("POST", "submitSupportRequest", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("text="+_testText+"&IdeaID="+IdeaID);
}

export { sendSupportRequest };

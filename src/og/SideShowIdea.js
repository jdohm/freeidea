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
    <H2 id="id_title" style="display: inline-block;"></H2>
    <img src="./media/share.svg" alt="Share idea!" id="share-btn" style="height:1.5em;float: right" onclick='
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
    <H3 id="id_vote">Vote this idea</H3></br>
    <img src="./media/up.svg" alt="Vote Up!" id="up-btn" style="width:49%;margin-top: 6px;vertical-align: bottom;" onclick='
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "submitVote", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("IdeaID="+${IdeaID}+"&upvote=1");
        SidePanel.hide();
        '>
    <img src="./media/down.svg" id="down-btn" alt="Vote Down" style="width:49%;" onclick='
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "submitVote", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("IdeaID="+${IdeaID}+"&upvote=0");
        SidePanel.hide();
        '>
    <div onclick="SidePanel.hide()" id="close-btn" class="oi-side-button" type="button">Back</div>
</div>
    `;
    SidePanel.show(html);

    var LoginRegister = `
    <span id="btnLogin" class="oi-link" onclick="SideLoginRegister.showLogin();">Login</span>
    <span>or</span>
    <span id="btnRegister" class="oi-link" onclick="SideLoginRegister.showRegister();">Register</span>

    <span>to vote this idea</span>`;
};

export { show };


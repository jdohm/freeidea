/**
 * @fileOverview this file provides functions to display ideas in side panel
 * @name SideShowIdea.js
 * @author Jannis Dohm
 * @license MIT
 */

'use strict';

/**
 * function to open Idea in side panel
 * If users isn't logged in, this function will blur out the vote buttons and the comment editor.
 * Instead the user get the possibility to go to login/register
 * @param {number} IdeaID - number of idea which will be displayed
 */
function show(IdeaID) {
    /*---------------------------------|
    | get Infos for Idea from server   |
    |---------------------------------*/
    let xhttp = new XMLHttpRequest();
    let self = this;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let obj = JSON.parse(this.responseText);


            let ulogin = this.getResponseHeader("login");
            if (ulogin == "false") {
                document.getElementById("id_vote").innerHTML = LoginRegister;
                document.getElementById("up-btn").style.opacity = "0.4";
                document.getElementById("up-btn").onclick = function() {
                    SideLoginRegister.showLogin();
                };
                document.getElementById("down-btn").style.opacity = "0.4";
                document.getElementById("down-btn").onclick = function() {
                    SideLoginRegister.showLogin();
                };
                document.getElementById("commentForm").textContent = "Comments:";
                document.getElementById("commentForm").classList.add("cactus-comment");
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
            document.getElementById("id_title").innerHTML = obj.title;
            document.getElementById("id_title").addEventListener('click', () => {
                document.getElementById("id_title").classList.add('hide');
                document.getElementById("id_title2").classList.remove('hide');
            });
            document.getElementById("id_title2").innerHTML = obj.title;
            document.getElementById("id_description").innerHTML = obj.description;
            document.getElementById("id_tags").innerHTML = "<span>Topics: </span> ";
            obj.tags.forEach((dat) => {
                document.getElementById("id_tags").innerHTML += '<div class="og-tag-span">' + dat + '</div>';
            });
            document.getElementById("id_skills").innerHTML = "<span>Needed skills: </span> ";
            obj.skills.forEach((dat) => {
                document.getElementById("id_skills").innerHTML += '<div class="og-tag-span">' + dat + '</div> ';
            });
            document.getElementById("id_user").innerHTML = "<span>Idea by: </span> ";
            obj.user.forEach((dat) => {
                document.getElementById("id_user").innerHTML += '<div class="og-tag-span">' + dat + '</div> ';
            });
        }
    };
    xhttp.open("POST", "getIdea", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("IdeaID=" + IdeaID);
    /*---------------------------------|
    | get Infos for Idea from server   |
    |---------------------------------*/
    let html =
        `
<div style="flex-grow: 0;">
    <H3 id="id_title" style="display: inline-block;margin-top: 0px;margin-bottom: 0px;"></H3>
    <img src="./media/share.svg" alt="Share idea!" id="share-btn" style="position: absolute; height:1.5em; right: 5px; top: 5px;" onclick='
        navigator.clipboard.writeText("https://openidea.io/?Idea=" + ${IdeaID});
        alert("https://openidea.io/?Idea=" + ${IdeaID} + " is now in your clipboard, feel free to share");
        ' >
</div>
<div style="overflow-y: auto;flex-grow: 1;">
    <h6 id="id_title2" class="hide"></h6>
    <p id="id_description"></p>
    <div id="id_tags"></div>
    <div id="id_skills"></div>
    <div id="id_user"></div>

    <div id="commentForm">
<form class="col s12" name="comment_form">
        <div class="input-field col s10"">
          <input id="comment" type="text" name="comment" style="width: calc( 100% - 1.3rem - 2 * 36px );" required/>
          <label for="comment">Comment</label>

    <button class="btn waves-effect waves-light oi-custom-greys" type="button" onclick="SideShowIdea.sendComment(${IdeaID})">
    <i class="material-icons mid">send</i>
  </button>
        </div>
    </form>
    </div>

    <div id="comment-section"></div>
    <div id="join-room">Join this comment section on your favorit matrix chat app! </br><a href="https://matrix.to/#/#comments_openidea.io_Idea#${IdeaID}:cactus.chat" target="_blank">#comments_openidea.io_Idea#<span style=\"display: inline-block; width: 0px;\"></span>${IdeaID}:cactus.chat</a></div>

</div>
<div style="flex-grow: 0;">
    <H6 id="id_vote" style="margin-top: 5px;margin-bottom: 5px;">Vote this idea</H6>
<button id="up-btn" class="btn waves-effect waves-light oi-custom-greys" style="width:49%; margin: 0% 0.5%; background-color: #43a047FF!important; color: #FFFFFFFF!important; margin-bottom: 1%;" type="button" name="back" onclick='
            let xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+${IdeaID}+"&upvote=1");
            SidePanel.hide();
'>Vote Up<i class="material-icons right">thumb_up</i>
  </button><button id="down-btn" class="btn waves-effect waves-light oi-custom-greys" style="width:49%; margin: 0% 0.5%; background-color: #e53935FF!important; color: #FFFFFFFF!important; margin-bottom: 1%;" type="button" name="back" onclick='
            let xhttp = new XMLHttpRequest();
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
    //send comment when hitting enter in comment field
    document.getElementById('comment').addEventListener('keydown', (event) => {
        if (event.code === 'Enter') {
            event.preventDefault();
            SideShowIdea.sendComment(IdeaID);
        }
    });

    let LoginRegister = `
    <a href="#" id="btnLogin" class="oi-link" onclick="SideLoginRegister.showLogin();">Login</a>
    <span>or</span>
    <a href="#" id="btnRegister" class="oi-link" onclick="SideLoginRegister.showRegister();">Register</a>
    <span>to vote this idea</span>`;
};
export {show};

/**
 * function to display support form.
 * messages entered by the user will be send to the matrix moderation room
 * @param {number} IdeaID - number of idea which is associated with the support request
 */
function showSupport(IdeaID) {
    let html =
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
export {showSupport};

/**
 * function which sends the request to the server
 * reads text field to get data.
 * @param {number} IdeaID - number of idea which is associated with the support request
 */
function sendSupportRequest(IdeaID) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
            SidePanel.hide();
        }
    };
    let _message = document.getElementById("text").value;
    xhttp.open("POST", "submitSupportRequest", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("text=" + _message + "&IdeaID=" + IdeaID);
}
export {sendSupportRequest};

/**
 * function which sends the comment to the server
 * reads text field to get data.
 * @param {number} IdeaID - number of idea which is associated with the comment
 */
function sendComment(IdeaID) {
    if (!document.forms.comment_form.comment.checkValidity()) {
        return false;
    }
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.forms.comment_form.comment.value = "";

            //cactus chat - update
            let comsec = document.getElementsByClassName("cactus-container");
            comsec[0].innerHTML = "";
            comsec[0].id = "comment-section";
            comsec[0].classList.remove("cactus-container");
            initComments({
                node: document.getElementById("comment-section"),
                defaultHomeserverUrl: "https://matrix.cactus.chat:8448",
                serverName: "cactus.chat",
                siteName: "openidea.io",
                commentSectionId: "Idea#" + IdeaID
            });
            //cactus chat end
        }
    };
    xhttp.open("POST", "submitComment", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("comment=" + document.getElementById("comment").value + "&IdeaID=" + IdeaID);
};
export {sendComment};

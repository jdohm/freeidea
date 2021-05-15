/**
 * @fileOverview this file provides functions to display makerspaces in the side panel
 * @name SideShowMakerS.js
 * @author Jannis Dohm
 * @license MIT
 */
'use strict';

/**
 * function to open a makerspace in the side panel
 * If users isn't logged in, this function will blur out the comment editor.
 * Instead the user get the possibility to go to login/register
 * @param {number} MakerSID - number of makerspace which will be displayed
 */
function show(MakerSID) {
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
                document.getElementById("login_placeholder").innerHTML = LoginRegister;
                document.getElementById("commentForm").textContent = "Comments:";
                document.getElementById("commentForm").classList.add("cactus-comment");
            }

            //cactus chat
            initComments({
                node: document.getElementById("comment-section"),
                defaultHomeserverUrl: "https://matrix.cactus.chat:8448",
                serverName: "cactus.chat",
                siteName: "openidea.io",
                commentSectionId: "Makerspace#" + MakerSID
            });
            //cactus chat end
            document.getElementById("id_title").innerHTML = obj.title;
            //add optional smaller title, which is activated when pressing on the bigger title
            //this helps in situations where the normal title hides to much of the other content
            document.getElementById("id_title2").innerHTML = obj.title;
            document.getElementById("id_title").addEventListener('click', () => {
                document.getElementById("id_title").classList.add('hide');
                document.getElementById("id_title2").classList.remove('hide');
            });
            //extra title end
            document.getElementById("id_description").innerText = obj.description;
            document.getElementById("id_address").innerText = obj.address;
            document.getElementById("id_contact").innerText = obj.contact;
            document.getElementById("id_times").innerText = obj.times;
            document.getElementById("id_tools").innerHTML = "<span>Available tools: </span> ";
            obj.tools.forEach((dat) => {
                document.getElementById("id_tools").innerHTML += '<div class="og-tag-span">' + dat + '</div>';
            });
            document.getElementById("id_user").innerHTML = "<span>Registered by: </span> ";
            obj.user.forEach((dat) => {
                document.getElementById("id_user").innerHTML += '<div class="og-tag-span">' + dat + '</div> ';
            });
        }
    };
    xhttp.open("POST", "getMakerS", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("MakerSID=" + MakerSID);
    /*---------------------------------|
    | get Infos for Idea from server   |
    |---------------------------------*/
    let html =
        `
<div style="flex-grow: 0;">
    <H3 id="id_title" style="display: inline-block;margin-top: 0px;margin-bottom: 0px;"></H3>
    <img src="./media/share.svg" alt="Share idea!" id="share-btn" style="position: absolute; height:1.5em; right: 5px; top: 5px;" onclick='
        navigator.clipboard.writeText("https://openidea.io/?MakerS=" + ${MakerSID});
        alert("https://openidea.io/?MakerS=" + ${MakerSID} + " is now in your clipboard, feel free to share");
        ' >
</div>
<div style="overflow-y: auto;flex-grow: 1;">
    <h6 id="id_title2" class="hide"></h6>
    <p id="id_description"></p>
    <p id="id_address"></p>
    <p id="id_contact"></p>
    <p id="id_times"></p>
    <div id="id_tools"></div>
    <div id="id_user"></div>

    <div id="commentForm">
<form class="col s12" name="comment_form">
        <div class="input-field col s10"">
          <input id="comment" type="text" name="comment" style="width: calc( 100% - 1.3rem - 2 * 36px );" required/>
          <label for="comment">Comment</label>

    <button class="btn waves-effect waves-light oi-custom-greys" type="button" onclick="SideShowMakerS.sendComment(${MakerSID})">
    <i class="material-icons mid">send</i>
  </button>
        </div>
    </form>
    </div>

    <div id="comment-section"></div>
    <div id="join-room">Join this comment section on your favorit matrix chat app! </br><a href="https://matrix.to/#/#comments_openidea.io_Makerspace#${MakerSID}:cactus.chat" target="_blank">#comments_openidea.io_Makerspace#<span style=\"display: inline-block; width: 0px;\"></span>${MakerSID}:cactus.chat</a></div>

</div>
    <H6 id="login_placeholder" style="margin-top: 5px;margin-bottom: 5px;"></H6>
<button class="btn waves-effect waves-light oi-custom-greys" style="width:65%; margin: 0% 0.5%;" type="button" name="back" onclick='SidePanel.hide();'>Back<i class="material-icons left">arrow_back</i>
  </button><button class="btn waves-effect waves-light oi-custom-greys" style="width:33%; margin: 0% 0.5%;" type="button" name="back" onclick='SideShowIdea.showSupport(${MakerSID})'>Support request</button>
</div>
    `;
    SidePanel.show(html);
    //send comment when hitting enter in comment field
    document.getElementById('comment').addEventListener('keydown', (event) => {
        if (event.code === 'Enter') {
            event.preventDefault();
            SideShowIdea.sendComment(MakerSID);
        }
    });

    let LoginRegister = `
    <a href="#" id="btnLogin" class="oi-link" onclick="SideLoginRegister.showLogin();">Login</a>
    <span>or</span>
    <a href="#" id="btnRegister" class="oi-link" onclick="SideLoginRegister.showRegister();">Register</a>
    <span>to comment on this makerspace</span>`;
};
export {show};

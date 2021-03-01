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

                document.getElementById("id_title").innerHTML = obj.TITLE;
                document.getElementById("id_description").innerHTML = obj.DESCRIPTION;
                document.getElementById("id_tags").innerHTML = "<div>Topics: </div> ";
                obj.tags.forEach((dat) => {document.getElementById("id_tags").innerHTML += '<div class="og-tag-span">' + dat + '</div>';});
                document.getElementById("id_skills").innerHTML = "<div>Needed skills: </div> ";
                obj.skills.forEach((dat) => {document.getElementById("id_skills").innerHTML += '<div class="og-tag-span">' + dat + '</div> ';});
            }
        };
        xhttp.open("POST", "getIdea", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("IdeaID="+IdeaID);
        /*---------------------------------|
        | get Infos for Idea from server   |
        |---------------------------------*/
        var html =
    `<div>
    <H2 id="id_title"><H2>
<button onclick='
navigator.clipboard.writeText("https://openidea.io/?Idea=" + ${IdeaID});
alert("https://openidea.io/?Idea=" + ${IdeaID} + " is now in your clipboard, feel free to share");

' >Share</button>
    </br>
    <p id="id_description"></p>
    <div id="id_tags"></div>
    <div id="id_skills"></div>
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
<div onclick="SidePanel.hide()" id="close-btn" class="oi-side-button" type="button">Back</div> </div>
</div>
    `;
        SidePanel.show(html);
};

export { show };


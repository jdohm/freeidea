/**
 * @fileOverview this file provides a info/welcome screen
 * @name showInfo.js
 * @author Jannis Dohm
 * @license MIT
 */
//stores the selected page 
let InfoPage = 0;

//content of first page, basics about openidea
let htmlWelcome = `Welcome to OpenIdea</br>
an open idea exchange platform. </br>
Imagine it as a Wikipedia for ideas.</br></br>
A place where everyone is able to create, share and collaborate on ideas.</br>
Together we can make the world a better place!</br></br>
On the following pages you will learn how to navigate this site.
You can return to this welcome page anytime by pressing the <div style="width: 24px; margin: 1px; content: url('./../../media/info.svg'); display: inline-block"></div> button on the right.</br>
Additionally, there is a video introduction on Odysee <a href="https://odysee.com/@jd-ohm:b/OpenIdea-Intro:f">OpenIdea introduction</a>.</br>
As this is a new project, expect changes on this platform along the way.
Please let us know if you have any suggestions or feedback.
`;
//content of second page, searching for ideas on openidea
let htmlSearch = `Find ideas you like.</br>
You can browse the globe and click on any idea that looks promising. If you like you can also use the filter in the top left corner, to reduce the number of displayed ideas. You could for example only look for ideas associated with the topic Peace. </br>
Once you find a idea you like, feel free to use the share button <div style="width: 24px; margin: 1px; content: url('./../../media/share.svg'); display: inline-block"></div>, like/dislike it and if you have something to say, leave a comment below the idea.
This is also the right place to offer your help and get in contact with others interested in this idea.
If you want you can join the comment room inside <a href="https://element.io/">Element</a> or another chat app which supports matrix and read the comments inside your chat app. </br>
Just in case you find something which doesn't belong here (like hate speech, racism, sexism, ...) feel free to report the idea straight away!
`;
//content of third page, how to create your ideas on openidea
let htmlCreate = `Create your own ideas.</br>
If you want you can create your own ideas too.
Please keep in mind, if you share them, they are out in the open, free for everyone to use. </br>
You do so by clicking on the globe, wherever you feel your idea belongs.
This could be a maker space near you, where you already started to work on this idea or a park you plan on cleaning.</br>
The next step is to choose a good title. It should be descriptive but short (not more than a few words). </br>
The description is the place, where you have the chance to get more specific and let others know all the details.
This is also a good place to let others know if you
are planning to work on it yourself and look for support
or just leave it here for others to build upon.</br>
Topics are used to filter ideas, thus it is a good idea to associate relevant topics with your idea.</br>
Needed skills, let others know which skills are needed to bring this idea to life.
After you created your idea, choose if you want to publish it on <a href="https://botsin.space/@OpenIdea">mastodon</a>.</br>
Finally save your idea and it will automatically be published on our site. Congratulations. </br>
Once saved, you can stay up to date with your idea by visiting the comment section or even joining the comment section on a chat app like <a href="https://element.io/">Element</a>.</br>
Now all that's left for you to do is: Share your idea with your friends and if you want, work on bringing your idea to life.
Enjoy!
`;

/**
  * function to display welcome/info screen
  */
function showInfo() {
    const infoPanel = document.createElement('div');
    infoPanel.classList.add('infoPanel');
    infoPanel.style.zIndex = "6000";
    infoPanel.style.position = "absolute";
    infoPanel.style.display = "flex";
    infoPanel.style.top = "50%";
    infoPanel.style.left = "50%";
    infoPanel.style.width = "600px";
    infoPanel.style.maxHeight = "80%";
    infoPanel.style.maxWidth = "100%";
    infoPanel.style.transform = "translate(-50%, -50%)";

    //back panel
    const backSubPanel = document.createElement('div');
        backSubPanel.classList.add('backSubPanel');
        backSubPanel.style.display = "flex";
        backSubPanel.style.flex = "none";
        backSubPanel.style.alignItems = "center";
        backSubPanel.style.justifyContent = 'center';
        backSubPanel.style.width = "48";
        backSubPanel.style.color = "#AEAEAEFF";
        const backSubPanelInner = document.createElement('div');
            backSubPanelInner.classList.add('hide');
            backSubPanelInner.style.content = "url(./../../media/left.svg)";
            backSubPanelInner.style.width = '40px';
            backSubPanelInner.style.cursor = 'pointer';
            backSubPanelInner.addEventListener('click', () => {
                if(InfoPage == 1) {
                    InfoPage--;
                    middleDescriptionSubPanel.innerHTML = htmlWelcome;
                    nextSubPanelInner.classList.remove('hide');
                    backSubPanelInner.classList.add('hide');
                }
                else if(InfoPage == 2) {
                    InfoPage--;
                    middleDescriptionSubPanel.innerHTML = htmlSearch;
                    backSubPanelInner.classList.remove('hide');
                    nextSubPanelInner.classList.remove('hide');
                };
                middleDescriptionSubPanel.scrollTop = 0;
            });
        backSubPanel.appendChild(backSubPanelInner);
    infoPanel.appendChild(backSubPanel);

    //middle panel
    const middleSubPanel = document.createElement('div');
        middleSubPanel.style.display = "flex";
        middleSubPanel.style.flexDirection = "column";
        middleSubPanel.style.flexWrap = "nowrap";
        middleSubPanel.style.backgroundColor = "#AEAEAEDF";
        middleSubPanel.style.borderRadius = "15px";
        const middleTitleSubPanel = document.createElement('div');
            middleTitleSubPanel.style.display = "flex";
            middleTitleSubPanel.style.flexWrap = "nowrap";
            middleTitleSubPanel.style.flexShrink = "6";
            middleTitleSubPanel.style.justifyContent = "space-between";
            const middleTitleSubPanelLogo = document.createElement('div');
    middleTitleSubPanelLogo.style.width = "clamp(32px, 10vw, 64px)";
                middleTitleSubPanelLogo.style.margin = "4px";
                middleTitleSubPanelLogo.style.content = "url(./../../media/favicon.svg)";
            middleTitleSubPanel.appendChild(middleTitleSubPanelLogo);
            const middleTitleSubPanelTitle = document.createElement('h3');
                middleTitleSubPanelTitle.innerText = 'OpenIdea.io';
                middleTitleSubPanelTitle.style.fontSize = 'clamp(22px, 5vw, 44px)';
            middleTitleSubPanel.appendChild(middleTitleSubPanelTitle);
            const middleTitleSubPanelCloser = document.createElement('div');
                middleTitleSubPanelCloser.innerText = 'OpenIdea.io';
                middleTitleSubPanelCloser.classList.add('material-icons');
                middleTitleSubPanelCloser.innerText = 'close';
                middleTitleSubPanelCloser.style.marginTop = "8px";
                middleTitleSubPanelCloser.style.fontSize = 'clamp(24px, 5vw, 48px)';
                middleTitleSubPanelCloser.addEventListener('click', () => {
                    document.getElementById('main').removeChild(infoPanel);
                    InfoPage = 0;
                });
                middleTitleSubPanelCloser.style.cursor = 'pointer';
            middleTitleSubPanel.appendChild(middleTitleSubPanelCloser);
        middleSubPanel.appendChild(middleTitleSubPanel);
        const middleDescriptionSubPanel = document.createElement('div');
            // middleDescriptionSubPanel.style.display = "flex";
            middleDescriptionSubPanel.style.overflowY = "auto";
            middleDescriptionSubPanel.style.margin = "6px";
            middleDescriptionSubPanel.innerHTML = htmlWelcome;
        middleSubPanel.appendChild(middleDescriptionSubPanel);
    infoPanel.appendChild(middleSubPanel);

    //next panel
    const nextSubPanel = document.createElement('div');
        nextSubPanel.classList.add('nextSubPanel');
        nextSubPanel.style.display = "flex";
        nextSubPanel.style.alignItems = "center";
        nextSubPanel.style.justifyContent = 'center';
        nextSubPanel.style.flex = "none";
        nextSubPanel.style.width = "48px";
        nextSubPanel.style.color = "#AEAEAEFF";
        const nextSubPanelInner = document.createElement('div');
            nextSubPanelInner.style.content = "url(./../../media/right.svg)";
            nextSubPanelInner.style.width = '40px';
            nextSubPanelInner.style.cursor = 'pointer';
            nextSubPanelInner.addEventListener('click', () => {
                if(InfoPage == 0) {
                    InfoPage++;
                    middleDescriptionSubPanel.innerHTML = htmlSearch;
                    backSubPanelInner.classList.remove('hide');
                }
                else if(InfoPage == 1) {
                    InfoPage++;
                    middleDescriptionSubPanel.innerHTML = htmlCreate;
                    backSubPanelInner.classList.remove('hide');
                    nextSubPanelInner.classList.add('hide');
                };
                middleDescriptionSubPanel.scrollTop = 0;
            });
        nextSubPanel.appendChild(nextSubPanelInner);
    infoPanel.appendChild(nextSubPanel);

    document.getElementById('main').appendChild(infoPanel);
}
export { showInfo }

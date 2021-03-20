'use strict';

var tagsArray = [];
var skillsArray = [];

function save(lon, lat){
        if(!document.forms.idea_form.nameText.checkValidity()) {
            document.getElementById("nameText").className += " invalid";
            return;
        }
        if(!document.forms.idea_form.ideaText.checkValidity()) {
            document.getElementById("ideaText").className += " invalid";
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
                        myCreateIdea( lon, lat, obj, 0, _tags, _skills, window.ulogin);
                        SidePanel.hide();
                        }
                    }
            }};
        var nameText = document.getElementById("nameText").value;
        var ideaText = document.getElementById("ideaText").value;
    var _tags = tagsArray.toString();
    var _skills = skillsArray.toString();
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

            <textarea id="categoriesText" name="categoriesText" class="materialize-textarea"></textarea>
            <label for="categoriesText">Add topics:</label>


                <label for="tag_adder" class="hide">
                    <select id="tag_adder" class="hide" multiple="multiple"></select>
                </label>

                <div class="col s12">
                    <div id="tag_adder_chips"></div>
                </div>

                <div class="row">
                    <div class="col s12" id="tag_adder_collection-wrapper">
                        <ul id="tag_adder_collection" class="hide grey lighten-5 tag-collection">
                            <li><span>Create new topic</span></li>
                        </ul>
                    </div>
                </div>


        </div>
        <div class="input-field col s9">
            <textarea id="skillsText" name="skillsText" class="materialize-textarea"></textarea>
            <label for="skillsText">Add needed skills:</label>


                <label for="skill_adder" class="hide">
                    <select id="skill_adder" class="hide" multiple="multiple"></select>
                </label>

                <div class="col s12">
                    <div id="skill_adder_chips"></div>
                </div>

                <div class="row">
                    <div class="col s12" id="skill_adder_collection-wrapper">
                        <ul id="skill_adder_collection" class="hide grey lighten-5 tag-collection">
                            <li><span>Create new needed skill</span></li>
                        </ul>
                    </div>
                </div>


        </div>
        <p>
            <label>
                <input type="checkbox" id="mastodon" name="mastodon" />
                <span>Publish idea on mastodon</span>
            </label>
        </p>
    <p>This project is under development, your idea could be deleted at any time.</p>
    </form>
</div>
<div style="flex-grow: 0;">
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
    else {SidePanel.show(htmlIdea);
    M.updateTextFields();


    document.getElementById('tag_adder_collection').addEventListener('click', () => {
        let stringT = {id:""};
        stringT.id = document.getElementById("categoriesText").value;
        //Capitalize and remove Whitespaces in topics
        stringT.id = stringT.id.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()).replace(/\s+/g, '');

        //generate chipt and display it
        const chip = generateChip(stringT);
        chip.appendChild(generateTagsIcon(stringT));
        document.getElementById('tag_adder_chips').appendChild(chip);
        document.getElementById('tag_adder').add(generateOption(stringT));
        tagsArray.push(stringT.id);
        console.log("topics to add to new idea: " + tagsArray);

        document.getElementById('categoriesText').value = '';
        document.getElementById('tag_adder_collection').classList.add('hide');
    });

const generateTagsIcon = _ => {
  const i = document.createElement('i');
  i.addEventListener('click', () => {
      Array.from(document.getElementById('tag_adder').options).forEach(option => {
      if (option.dataset.id === _.id) {
          //remove tag from filterstring
          tagsArray = tagsArray.filter(item => item !== _.id);
          console.log("topics to add to new idea: " + tagsArray);
        option.remove();
          document.querySelector(`.chipTagAdder-${_.id}`).remove();
      }
    });
  });
  i.classList.add('close');
  i.classList.add('material-icons');
  i.innerText = 'close';
  return i;
};

new autoComplete({
  noResults: (dataFeedback, generateList) => {
    document.getElementById('tag_adder_collection').classList.remove('hide');
  },
  data: {
      src: async () => search(document.getElementById('categoriesText').value),
    key: ['id'],
    cache: false,
  },
  query: {
    manipulate: (query) => {
        document.getElementById('tag_adder_collection').classList.add('hide');

      return query;
    }
  },
  onSelection: feedback => {
    let stringT = feedback.selection.value;
    //Capitalize and remove Whitespaces in topics
    stringT.id = stringT.id.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()).replace(/\s+/g, '');

    //generate chipt and display it
    const chip = generateTagAdderChip(stringT);
    chip.appendChild(generateTagsIcon(stringT));
      document.getElementById('tag_adder_chips').appendChild(chip);
      document.getElementById('tag_adder').add(generateOption(stringT));
      tagsArray.push(stringT.id);
      console.log("topics to add to new idea: " + tagsArray);

      document.getElementById('categoriesText').value = '';
  },
  resultsList: {
    render: true,
    container: source => {
      source.classList.add('tag-collection-wrapper');
    },
      destination: "#tag_adder_collection-wrapper",
    position: "beforeend",
    element: "ul"
  },
  highlight: true,
  trigger: query => query.length > 0,
  maxResults: 5,
  threshold: 1,
  debounce: 500,
    selector: "#categoriesText",
});

//autocomplete skills
    document.getElementById('skill_adder_collection').addEventListener('click', () => {
        let stringT = {id:""};
        stringT.id = document.getElementById("skillsText").value;
        //Capitalize and remove Whitespaces in topics
        stringT.id = stringT.id.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()).replace(/\s+/g, '');

        //generate chipt and display it
        const chip = generateSkillAdderChip(stringT);
        chip.appendChild(generateSkillIcon(stringT));
        document.getElementById('skill_adder_chips').appendChild(chip);
        document.getElementById('skill_adder').add(generateOption(stringT));
        skillsArray.push(stringT.id);
        console.log("needed skill to add to new idea: " + skillsArray);

        document.getElementById('skillsText').value = '';
        document.getElementById('skill_adder_collection').classList.add('hide');
    });

const generateSkillIcon = _ => {
  const i = document.createElement('i');
  i.addEventListener('click', () => {
      Array.from(document.getElementById('skill_adder').options).forEach(option => {
      if (option.dataset.id === _.id) {
          //remove tag from filterstring
          skillsArray = skillsArray.filter(item => item !== _.id);
          console.log("needed skills to add to new idea: " + skillsArray);
        option.remove();
        document.querySelector(`.chipSkillAdder-${_.id}`).remove();
      }
    });
  });
  i.classList.add('close');
  i.classList.add('material-icons');
  i.innerText = 'close';
  return i;
};

new autoComplete({
  noResults: (dataFeedback, generateList) => {
    document.getElementById('skill_adder_collection').classList.remove('hide');
  },
  data: {
      src: async () => searchSkills(document.getElementById('skillsText').value),
    key: ['id'],
    cache: false,
  },
  query: {
    manipulate: (query) => {
        document.getElementById('skill_adder_collection').classList.add('hide');

      return query;
    }
  },
  onSelection: feedback => {
    let stringT = feedback.selection.value;
    //Capitalize and remove Whitespaces in topics
    stringT.id = stringT.id.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()).replace(/\s+/g, '');

    //generate chipt and display it
    const chip = generateChip(stringT);
    chip.appendChild(generateSkillIcon(stringT));
      document.getElementById('skill_adder_chips').appendChild(chip);
      document.getElementById('skill_adder').add(generateOption(stringT));
      skillsArray.push(stringT.id);
      console.log("needed skill to add to new idea: " + skillsArray);

      document.getElementById('skillsText').value = '';
  },
  resultsList: {
    render: true,
    container: source => {
      source.classList.add('skill-collection-wrapper');
    },
      destination: "#skill_adder_collection-wrapper",
    position: "beforeend",
    element: "ul"
  },
  highlight: true,
  trigger: query => query.length > 0,
  maxResults: 5,
  threshold: 1,
  debounce: 500,
    selector: "#skillsText",
});
}
};

export { show };

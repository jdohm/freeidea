/**
 * @fileOverview this file provides functions to create new makerspaces and points of interest
 * @name SideMakerS.js
 * @author Jannis Dohm
 * @license MIT
 */

let toolsArray = [];

/**
 * function to send data of newly registered makerspace to the server
 * this includes:
 * name, description, address, contact, opening hours and available tools
 * if the user wants to publish the new registration on mastodon
 * this will also be initialized
 * @param {string} lon - lon component of coordinate
 * @param {string} lat - lat component of coordinate
 */
function save(lon, lat) {
    if (!document.forms.makerspace_form.name.checkValidity()) {
        document.getElementById("name").className += " invalid";
        return;
    }
    if (!document.forms.makerspace_form.description.checkValidity()) {
        document.getElementById("description").className += " invalid";
        return;
    }
    myHideMark();
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let obj = JSON.parse(this.responseText);
            if (obj) {
                if (obj == "error") alert("error - are you still logged in?");
                else {
                    myCreateMakerS(lon, lat, obj, _tools, window.ulogin);
                    SidePanel.hide();
                }
            }
        }
    };
    let _name = document.getElementById("name").value;
    let _description = document.getElementById("description").value;
    let _address = document.getElementById("address").value;
    let _contact = document.getElementById("contact").value;
    let _times = document.getElementById("times").value;
    let _tools = toolsArray.toString();
    let _mastodon = document.getElementById("mastodon").checked;
    xhttp.open("POST", "submitMakerS", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("name=" + _name + "&description=" + _description + "&lon=" + lon + "&lat=" + lat + "&tools=" + _tools + "&mastodon=" + _mastodon + "&address=" + _address + "&contact=" + _contact + "&times=" + _times);
};
export {save};

/**
 * function to show form to create new ideas in side panel
 * @param {Object} ll - object containing the coordinates, where the idea will be created
 */
function show(lon,lat) {
    console.log("lon: " + lon + "lat: " + lat);

    toolsArray.length = 0;

    let htmlMakerS =
        `
<div style="overflow-y: auto;overflow-x: hidden;flex-grow: 1;">
    <form method="POST" action="submitMakerS" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded" target="_blank" name="makerspace_form">
        <div class="row">
            <H5>Register your makerspace</H5>
        </div>
        <div class="input-field col s9">
            <textarea type="text" id="name" name="name" class="materialize-textarea validate" required></textarea>
            <label for="name">Name of the Makerspace:</label>
        </div>
        <div class="input-field col s9">
            <textarea id="description" name="description" class="materialize-textarea validate" required></textarea>
            <label for="description">Add a description to your makerspace:</label>
        </div>
        <div class="input-field col s9">
            <textarea id="address" name="address" class="materialize-textarea validate" required></textarea>
            <label for="address">Address:</label>
        </div>
        <div class="input-field col s9">
            <textarea id="contact" name="contact" class="materialize-textarea validate" required></textarea>
            <label for="contact">Contact (email, website, phone, matrix, etc.):</label>
        </div>
        <div class="input-field col s9">
            <textarea id="times" name="times" class="materialize-textarea validate" required></textarea>
            <label for="times">Opening hours:</label>
        </div>
        <div class="input-field col s9">

            <textarea id="tools" name="tools" class="materialize-textarea"></textarea>
            <label for="tools">Add available tools and machinery:</label>


                <label for="tool_adder" class="hide">
                    <select id="tool_adder" class="hide" multiple="multiple"></select>
                </label>

                <div class="col s12">
                    <div id="tool_adder_chips"></div>
                </div>

                <div class="row">
                    <div class="col s12" id="tool_adder_collection-wrapper">
                        <ul id="tool_adder_collection" class="hide grey lighten-5 tag-collection">
                            <li><span>Create new tool or machine</span></li>
                        </ul>
                    </div>
                </div>
        </div>
        <p>
            <label>
                <input type="checkbox" id="mastodon" name="mastodon" />
                <span>Publish the newly added Makerspace on mastodon</span>
            </label>
        </p>
    <p>This project is under development, your registration could be deleted at any time.</p>
    </form>
</div>
<div style="flex-grow: 0;">
    <button class="btn waves-effect waves-light oi-custom-greys oi-side-button-width" style="margin-bottom: 5px;" type="button" name="back" onclick='SideMakerS.save(${lon}, ${lat});'>Save<i class="material-icons left">save</i>
    </button>

    <button class="btn waves-effect waves-light oi-custom-greys oi-side-button-width" type="button" name="back" onclick='myHideMark(); SidePanel.hide();'>Cancel<i class="material-icons left">arrow_back</i>
    </button>
</div>    `;

    let htmlNotLoggedIn = `
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
    if (ulogin == "false") {
        SidePanel.show(htmlNotLoggedIn);
    } else {
        SidePanel.show(htmlMakerS);
        M.updateTextFields();


        document.getElementById('tool_adder_collection').addEventListener('click', () => {
            let stringT = {
                id: ""
            };
            stringT.id = document.getElementById("tools").value;
            //Capitalize and remove Whitespaces in topics
            stringT.id = stringT.id.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()).replace(/\s+/g, '');

            //generate and display chip
            const chip = generateChip(stringT);
            chip.appendChild(generateTagsIcon(stringT));
            document.getElementById('tool_adder_chips').appendChild(chip);
            document.getElementById('tool_adder').add(generateOption(stringT));
            toolsArray.push(stringT.id);
            console.log("topics to add to new idea: " + toolsArray);

            document.getElementById('tools').value = '';
            document.getElementById('tool_adder_collection').classList.add('hide');
        });

        const generateTagsIcon = _ => {
            const i = document.createElement('i');
            i.addEventListener('click', () => {
                Array.from(document.getElementById('tool_adder').options).forEach(option => {
                    if (option.dataset.id === _.id) {
                        //remove tag from filterstring
                        toolsArray = toolsArray.filter(item => item !== _.id);
                        console.log("tools to add to new idea: " + toolsArray);
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
                document.getElementById('tool_adder_collection').classList.remove('hide');
            },
            data: {
                src: async () => searchTools(document.getElementById('tools').value),
                key: ['id'],
                cache: false,
            },
            query: {
                manipulate: (query) => {
                    document.getElementById('tool_adder_collection').classList.add('hide');

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
                document.getElementById('tool_adder_chips').appendChild(chip);
                document.getElementById('tool_adder').add(generateOption(stringT));
                toolsArray.push(stringT.id);
                console.log("tools to add to makerspace: " + toolsArray);

                document.getElementById('tools').value = '';
            },
            resultsList: {
                render: true,
                container: source => {
                    source.classList.add('tag-collection-wrapper');
                },
                destination: "#tool_adder_collection-wrapper",
                position: "beforeend",
                element: "ul"
            },
            highlight: true,
            trigger: query => query.length > 0,
            maxResults: 5,
            threshold: 1,
            debounce: 500,
            selector: "#tools",
        });
    }
};
export {show};

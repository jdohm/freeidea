/**
 * @fileOverview
 * @name matrix.js
 * @author Jannis Dohm
 * @license MIT
 */
const https = require("https");
const generator = require('generate-password');
const crypto = require("crypto");
const sdk = require("matrix-js-sdk");
const { exitCode } = require("process");
const db = require("./sqliteDb");
const { RoomState } = require("matrix-js-sdk");

/* url to the matrix server for crating new users
   often uses matrix.example.com
 */
const matrixServer = "https://matrix.dohm.work";
/* url to append on matrix rooms
   often uses example.com
 */
const matrixGroupUrl = "dohm.work";

let urldata = {
    host: matrixServer,
    path: "/_synapse/admin/v1/register",
    method: "GET",
};
let urlRegData = {
    nonce: "",
    username: "",
    displayname: "",
    password: "",
    mac: "",
};
let matrix = {
    matrixname:  "",
    matrixpw: ""
};

let openideaClient;
let oirooms = [];
const oiroom = {roomId: "", messages: []};
const oimessage = {displayname: "", datetime: "", message: ""};

oimessage.displayname = "testuser";
oimessage.datetime = "2021-03-31 23:17";
oimessage.message = "test message";
oiroom.roomId = "test Room 1";
oiroom.messages.push(oimessage);

oimessage.datetime = "2021-03-31 23:19";
oimessage.message = "test message 2";
oiroom.messages.push(oimessage);
oirooms.push(oiroom);

console.log(oirooms);

function roomAddMessage(room, displayname, datetime, message){
    RoomState.some(r => r.roomId === room)
}


/**
 * This function creates a matrix account for a given user.
 * The username will be transformed to all lowercase and spaces will be replaced with underscores
 * for more informations visit: https://github.com/matrix-org/synapse/blob/master/docs/admin_api/register_api.rst
 * @param {string} username -  wanted username of matrix user
 * @returns {object} - matrix object
 * @property {string} matrixname - the given matrix username 
 * @property {string} matrixpw - the automatically created matrix pw
 */
function createUser(username) {

    //generate lowercase only charakters and underscores matrix name!
    //make username lowercase
    matrix.matrixname = username.toLowerCase();
    //replace spaces with underscores
    matrix.matrixname = matrix.matrixname.replace(/\s+/g, '_');
    //delete all non alphanumeric and not underscore (shoudn't be necessary since they are not allowed as usernames anyway)
    matrix.matrixname = matrix.matrixname.replace(/\W/g, '');
    // //TODO also add random string if matrixname exists
    // if (matrix.matrixname.length < 6) {
    //     matrix.matrixname += '_' + generator.generate({
	  //         length: 12,
	  //         numbers: true,
	  //         uppercase: false
    //     });
    // }
    urlRegData.username = matrix.matrixname;
    urlRegData.displayname = username;
    var password = generator.generate({
	      length: 24,
	      numbers: true
    });
    urlRegData.password = password;
    matrix.matrixpw = password;
    //for debugging and not loosing users in the beginning
    console.log("matrixname" + matrix.matrixname);
    console.log("pw" + password);


  function OnResponse(response) {
      console.log(`statusCode 1: ${response.statusCode}`);
    var data = ""; //This will store the page we're downloading.
    response.on("data", function (chunk) {
      //Executed whenever a chunk is received.
      data += chunk; //Append each chunk to the data variable.
    });

    response.on("end", function () {
        urlRegData.nonce = JSON.parse(data).nonce;
        urlRegData.mac = generate_mac(urlRegData.nonce, urlRegData.username, urlRegData.password);

        var urlPostData = {
            host: "matrix.dohm.work",
            path: "/_synapse/admin/v1/register",
            port: 443,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": JSON.stringify(urlRegData).length,
            },
        };
        // urlPostData.headers.Content-Length;
        //  JSON.stringify(urlRegData).length,

      var postreq = https.request(urlPostData, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        console.log("res: " + res.statusMessage);

        // res.on("data", (d) => {
        //   console.log(d);
        // });
      });

        console.log(urlRegData);
      postreq.write(JSON.stringify(urlRegData));
      postreq.end();
    });
  }

    console.log(urldata);
  https.request(urldata, OnResponse).end();
    return matrix;
}

function testF(){
    console.log("test");
}

/**
 * function to generate mac for user creation via shared secret
 * @param {number} nonce - nonce which is a one time key to generate the mac. Can be requested from the matrix-synapse server.
 * @param {string} user - user to be created
 * @param {strin} password - password of user
 * @param {boolean} [somebody=false] - wether or not the user should get admin rights
 * @returns {number} - mac in HEX
 */
function generate_mac(nonce, user, password, admin=false){

    var mac = crypto.createHmac("sha1", process.env.DOHMWORK_MATRIX_SS);

    mac.update(nonce.toString());
    mac.update("\x00");
    mac.update(user.toString());
    mac.update("\x00");
    mac.update(password.toString());
    mac.update("\x00");
    if(admin) mac.update("admin");
    else mac.update("notadmin");
    return mac.digest("hex");
}

/**
 * function to send usermessage to idea room
 * @param {string} user - user which sends the message
 * @param {number} IdeaID - number of idea hosting the room
 * @param {string} message - usermessage
 * @param {*} db - opened sqlite database to fetch users matrix data from 
 * @returns {string} - errormessage or undefined at success
 */
async function sendMessage(user, IdeaID, message, db) {
    //get matrixname and matrixpw from database (db)
    let matrix = await getMatrixUserByName(user, db);
    console.log(matrix);
    if(matrix == null || !matrix.matrixname || !matrix.matrixpw) return 'username not found';
    //matrix login
    const client = sdk.createClient(matrixServer);
    await client
        .login("m.login.password", {
            user: matrix.matrixname,
            password: matrix.matrixpw,
        })
        .then((response) => {
            // console.log(response.access_token);
        });
    await client.startClient();

    //join room (even if joined already returns the roomID which is needed to write to it)
    var roomID
    try {
        roomID = await client.joinRoom(RoomAlias(IdeaID));
        roomID = roomID.roomId;
    } catch (e) {
        if(e.errcode == 'M_NOT_FOUND') 
        {
            try {
                await createRoom(IdeaID);
                roomID = await client.joinRoom(RoomAlias(IdeaID));
                roomID = roomID.roomId;
            }
            catch (e) {return "room coudn't be joined or created"}
        }
    }
    try {
        //create content for message to be send
        var content = {
            body: message,
            msgtype: "m.text",
        };
        //matrix send message to room
        client
            .sendEvent(roomID, "m.room.message", content, "")
            .then((res) => {
                // message sent successfully
                return;
            })
            .catch((err) => {
                console.log(err);
                return err;
            });
    }
    catch (e) {
        return e;
    }
};

/**
 * function to create consistant roomAliases
 * @param {number} IdeaID - IdeaID which needs a room
 * @param {boolean} [forCreation=false] - if true switches to only local part as return (like Idea_IdeaID)
 * @returns {string} - roomAlias looks like this: #Idea_IdeaID:dohm.work
 */
function RoomAlias(IdeaID, forCreation=false){
    var roomAlias = 'Idea_' + IdeaID;
    if(!forCreation) roomAlias = '#' + roomAlias + ':' + matrixGroupUrl;
    return roomAlias;
}

/**
 * function to get link to comment room of given IdeaID
 * @param {number} IdeaID - IdearID of idea of which the url is requested
 * @returns {string} - url to join room looks like this: https://matrix.to/#/#Idea_IdeaID:dohm.work
 */
function getJoinUrl(IdeaID){
    let url = 'https://matrix.to/#/' + RoomAlias(IdeaID);
    return url;
}

//TODO
/**
 * function to fetch (num) last messages of room 
 * @param {number} IdeaID - IdeaID to fetch messages from
 * @param {number} num - number of fetched messages
 * @returns {(string|string[])} - returns num messages of matrix room asocciated with IdeaID
 */
async function getLastMessages(IdeaID, num){
    if(!openideaClient) loginOpenIdea();

    await openideaClient.startClient({initialSyncLimit: 10});
// await openideaClient.once('sync', function(state, prevState, res) {
//     if(state === 'PREPARED') {
//         console.log("prepared");
//     } else {
//         console.log(state);
//         process.exit(1);
//     }
// });

var roomID = await openideaClient.joinRoom(RoomAlias(IdeaID));
// try{
// var room = await openideaClient.getRoom(roomID.roomId);
// } catch (e) {console.log(e);}

var iTest = 0;

await openideaClient.on("Room.timeline", function(event, room, toStartOfTimeline) {
  if (event.getType() !== "m.room.message") {
    return; // only use messages
  }
  //if(room.name == RoomAlias(IdeaID)) console.log(room);
  if(room.roomId == roomID.roomId) console.log("finaly");
  console.log(iTest++);
  console.log(room.roomId);
  console.log(event.event.content.body);
});

// var scrollback = await   openideaClient.scrollback(roomID);
// Object.keys(openideaClient.store.rooms).forEach((roomId) => {
//   client.getRoom(roomId).timeline.forEach(t => {
//       console.log(t.event);
//   });
// });

    let messages; 
        //join room (even if joined already returns the roomID which is needed to write to it)
        // var roomID = await openideaClient.joinRoom(RoomAlias(IdeaID));
        // try{
        //     openideaClient.getRoom(roomID.roomId).timeline.forEach(t => {
        //         console.log(t.event);
        //         });
            
        // //     messages = openideaClient.scrollback(roomID.roomId, num);
        // // console.log(messages);
        // } catch (e) {console.log(e);}

    return messages;
}

//TODO
function loginOpenIdea() {
    //return if openideaClint was already set
    if (openideaClient) return;
    openideaClient = sdk.createClient(matrixServer);
    openideaClient
        .login("m.login.password", {
            user: process.env.MATRIX_DW_USER,
            password: process.env.MATRIX_DW_PASSWORD,
        })
        .then((response) => {
            console.log(response.access_token);
        });
}


/**
 * function to create comment rooms for ideas
 * @param {number} IdeaID - IdeaID for which a room should be created
 * @param {string} [forCreation] - Display name of room, if not provided room will be namend 'comments for Idea #IdeaID' 
 * @returns {Room} - room object
 */
function createRoom(IdeaID, roomName){
    if(!openideaClient) loginOpenIdea();
    roomName = roomName || 'comments for Idea #' + IdeaID;
    var options = {
        name: roomName,
        room_alias_name: RoomAlias(IdeaID, true),
        visibility: "public"
    };

    console.log(options);

    return openideaClient.createRoom(options);
}

//TODO new support request
//TODO move matrix user from myServer to this file

module.exports = {testF, createUser, sendMessage, getJoinUrl, getLastMessages, createRoom, loginOpenIdea};

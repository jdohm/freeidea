/**
 * @fileOverview
 * @name matrix.js
 * @author Jannis Dohm
 * @license MIT
 */
const https = require("https");
const generator = require("generate-password");
const crypto = require("crypto");
const sdk = require("matrix-js-sdk");
const { exitCode } = require("process");
const db = require("./sqliteDb");
const { RoomState } = require("matrix-js-sdk");
const { resolve } = require("path");
const { promiseMapSeries } = require("matrix-js-sdk/lib/utils");

/* url to the matrix server for crating new users
   often uses matrix.example.com
 */
const matrixServer = "matrix.dohm.work";
/* url to append on matrix rooms
   often uses example.com
 */
const matrixGroupUrl = "cactus.chat";

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
  matrixname: "",
  matrixpw: "",
};

let openideaClient;

/**
 * This function creates a matrix account for a given user.
 * The username will be transformed to all lowercase and spaces will be replaced with underscores
 * for more informations visit: https://github.com/matrix-org/synapse/blob/master/docs/admin_api/register_api.rst
 * @param {string} username -  wanted username of matrix user
 * @returns {object} - matrix object
 * @property {string} matrixname - the given matrix username
 * @property {string} matrixpw - the automatically created matrix pw
 */
async function createUser(username) {
  return new Promise((resolve) => {
  //generate lowercase only charakters and underscores matrix name!
  //make username lowercase
  matrix.matrixname = username.toLowerCase();
  //replace spaces with underscores
  matrix.matrixname = matrix.matrixname.replace(/\s+/g, "_");
  //delete all non alphanumeric and not underscore (shoudn't be necessary since they are not allowed as usernames anyway)
  matrix.matrixname = matrix.matrixname.replace(/\W/g, "");
  urlRegData.username = matrix.matrixname;
  urlRegData.displayname = username;
  var password = generator.generate({
    length: 24,
    numbers: true,
  });
  urlRegData.password = password;
  matrix.matrixpw = password;
  //for debugging and not loosing users in the beginning
  console.log("matrixname: \t" + matrix.matrixname);
  console.log("pw: \t" + password);

  function OnResponse(response) {
    console.log(`statusCode 1: ${response.statusCode}`);
    var data = ""; //This will store the page we're downloading.
    response.on("data", function (chunk) {
      //Executed whenever a chunk is received.
      data += chunk; //Append each chunk to the data variable.
    });

    response.on("end", function () {
      urlRegData.nonce = JSON.parse(data).nonce;
      urlRegData.mac = generate_mac(
        urlRegData.nonce,
        urlRegData.username,
        urlRegData.password
      );

      let urlPostData = {
        host: "matrix.dohm.work",
        path: "/_synapse/admin/v1/register",
        port: 443,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": JSON.stringify(urlRegData).length,
        },
      };

      let postreq = https.request(urlPostData, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        console.log("res: " + res.statusMessage);

        resolve( matrix );

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
});
}

/**
 * function to generate mac for user creation via shared secret
 * @param {number} nonce - nonce which is a one time key to generate the mac. Can be requested from the matrix-synapse server.
 * @param {string} user - user to be created
 * @param {strin} password - password of user
 * @param {boolean} [somebody=false] - wether or not the user should get admin rights
 * @returns {number} - mac in HEX
 */
function generate_mac(nonce, user, password, admin = false) {
  var mac = crypto.createHmac("sha1", process.env.DOHMWORK_MATRIX_SS);

  mac.update(nonce.toString());
  mac.update("\x00");
  mac.update(user.toString());
  mac.update("\x00");
  mac.update(password.toString());
  mac.update("\x00");
  if (admin) mac.update("admin");
  else mac.update("notadmin");
  return mac.digest("hex");
}

/**
 * function to send usermessage to idea room
 * @param {string} user - user which sends the message
 * @param {number} IdeaID - number of idea hosting the room
 * @param {string} message - usermessage
 * @param {*} dbOpened - opened sqlite database to fetch users matrix data from
 * @returns {string} - errormessage or undefined at success
 */
async function sendMessage(user, IdeaID, message, dbOpened) {
  //get matrixname and matrixpw from database (db)
  let matrix = await db.getMatrixUserByName(user, dbOpened);
  console.log(matrix);
  if (matrix == null || !matrix.matrixname || !matrix.matrixpw)
    return "username not found";
  //matrix login
  const client = sdk.createClient("https://" + matrixServer);
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
  var roomID;
  try {
    roomID = await client.joinRoom(RoomAlias(IdeaID));
    roomID = roomID.roomId;
  } catch (e) {
    console.log(e);
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
  } catch (e) {
    return e;
  }
}

/**
 * function to create consistant roomAliases
 * @param {number} IdeaID - IdeaID which needs a room
 * @returns {string} - roomAlias looks like this: #comments_openidea.io_Idea#IdeaId:cactus.chat
 */
function RoomAlias(IdeaID) {
  var roomAlias = "#comments_openidea.io_Idea#" + IdeaID + ":" + matrixGroupUrl;
  return roomAlias;
}

/**
 * function to get link to comment room of given IdeaID
 * @param {number} IdeaID - IdearID of idea of which the url is requested
 * @returns {string} - url to join room looks like this: https://matrix.to/#/#Idea_IdeaID:dohm.work
 */
function getJoinUrl(IdeaID) {
  let url = "https://matrix.to/#/" + RoomAlias(IdeaID);
  return url;
}

/**
 * function to call on init.
 * This function handels the login of the openidea user which is used for reports etc.
 */
function loginOpenIdea() {
  //return if openideaClint was already set
  if (openideaClient) return;
  openideaClient = sdk.createClient("https://" + matrixServer);
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
 * function to send support message to support chat
 * @param {Object} req - req object, this functions reads the body.IdeaID, body.text, req.user
 */
function sendSupportRequest(req) {
    if(!openideaClient) loginOpenIdea();
    openideaClient.startClient();

  var RoomId = "!HTcpkpXWLaaunauYsD:cactus.chat";

    var content = {
    body: "#" + req.body.IdeaID + "\n" + req.body.text + "\n\nsend from: ",
    msgtype: "m.text",
    };
  if (req.user) {
        content.body += req.user.email;
  } else {
    content.body += "anonymous";
    }

  openideaClient
    .sendEvent(RoomId, "m.room.message", content, "")
    .catch((err) => {
        console.log(err);
    });
}

module.exports = { createUser, sendMessage, getJoinUrl, loginOpenIdea, sendSupportRequest};
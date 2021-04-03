/**
 * @fileOverview
 * @name mastodon.js
 * @author Jannis Dohm
 * @license MIT
 */
const request = require("request");

/**
 * function to post new idea on mastodon
 * @param {number} id - number of idea
 * @param {Object} req - req of post request 
 * reads req.body.mastodon, req.body.nameText, req.body.ideaText, req.body.tags
 * @returns 
 */
async function post(id, req) {
  return new Promise( async (resolve) => {
    if (req.body.mastodon !== "true") resolve;
    let textBody = _createStatus(id, req);
    await _send(textBody, "public");
    resolve;
  });
}

/**
 * intern function to create status
 * @param {number} id - number of idea
 * @param {Object} req - req of post request 
 * @returns {String} - status Text to be send to mastodon
 */
function _createStatus(id, req) {
  // max 500 chars in total
  // 425 for title and description
  // 25 for the line with the link (2x \n + links count as 23)
  // 50 for tags
  let statusText =
    _truncate(req.body.nameText + "\n" + req.body.ideaText, 425) +
    "\n" +
    "https://openidea.io/?Idea=" +
    id +
    "\n" +
    _createTagString(req.body.tags);
  return statusText;
}

/**
 * function to limit string to n charakters, if to long, it will be cut to length and ... appended
 * @param {string} str - string to be checked
 * @param {number} n - number of allowed charakters
 * @returns {string} - string which is cut to length if necessary
 */
function _truncate(str, n) {
  return str.length > n ? str.substr(0, n - 3) + "..." : str;
}

/**
 * intern function to get tag string to post on mastodon
 * @param {string} tags - csv string with tags
 * @returns {string} - string with a maximum of 50 charakters and 3 tags in the form of #tag1 #tag2 #tag3
 */
function _createTagString(tags) {
  let tagsBody = "";
  let tagsArray = tags.split(",");
  tagsArray.some(function (item, index) {
    if (item.trim() != "") {
      tagsBody += "#" + item.trim() + " ";
      console.log("item: " + index + "tag: " + "#" + item.trim() + " ");
    }
    //if 3 tags written stop function
    if (index >= 2) return true;
    else return false;
  });
  //ensure that tags arent to long
  _truncate(tagsBody, 50);
  return tagsBody;
}

/**
 * intern function to send text to mastodon
 * @param {string} statusText - content of post
 * @param {string} [vis="unlisted"] - visibility of post, choose from: public, unlisted, private, direct 
 * @param {string} [URL="https://botsin.space/api/v1/statuses"] - url of your mastodon instance
 * @param {string} [ACCESS_TOKEN=process.env.MASTODON_ACCESS_TOKEN] - access token to access mastodon, consider saving it to the default location (.env.MASTODON_ACCESS_TOKEN) indestead off putting it inside the code
 * @returns 
 */
async function _send(statusText, vis, URL, ACCESS_TOKEN) {
  vis = vis || "unlisted";
  URL = URL || "https://botsin.space/api/v1/statuses"; 
  ACCESS_TOKEN = ACCESS_TOKEN || process.env.MASTODON_ACCESS_TOKEN;
  return new Promise((resolve) => {
    let jsonBody = {
      status: _truncate(statusText, 500),
      visibility: vis,
    }; 

    var clientServerOptions = {
      url: URL,
      body: JSON.stringify(jsonBody),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ACCESS_TOKEN,
      },
    };
    request(clientServerOptions, function (error, response, body) {
      console.log(error);
      resolve;
    });
  });
}

module.exports = {
    post,
};
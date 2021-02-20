const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
//const mysql = require('mysql');
const sqlite3 = require('sqlite3').verbose();
const port = process.argv[2] || 8081;
var qs = require('querystring');

http.createServer(function (req, res) {
  if (req.method === "GET") {
    console.log(`${req.method} ${req.url}`);
    // parse URL
    const parsedUrl = url.parse(req.url);
    if (parsedUrl.pathname == `/getIdeas`) {

        let db = new sqlite3.Database('./db/Ideas.db', (err) => {
        if (err) {
        return console.error(err.message);
        }
        console.log('Connected to the SQlite database.');
      });
      //read all places from Database 
      db.serialize(function() {
          let sql = `SELECT lon, lat, IdeaID, upvotes, downvotes FROM v_PlacesVotes ORDER BY lat`;

      db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            console.log("lon: " + row.lon + " lat: " + row.lat + " IdeaID: " + row.IdeaID + " upvotes: " + row.upvotes + " downvotes: " + row.downvotes);
        });
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(rows));
      });
      db.close();
      });
    }
      else if (parsedUrl.pathname == "/mobileIdea"){
          var qqdata = url.parse(req.url,true).query;
          console.log(qqdata.lon);
            res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(TEMPLATEFS);
    }
      else if (parsedUrl.pathname == "/mobileShowIdea"){
          var formData = url.parse(req.url,true).query;
          console.log(formData.IdeaID);

          let db = new sqlite3.Database('./db/Ideas.db', (err) => {
              if (err) {
                  return console.error(err.message);
              }
              //console.log('Connected to the SQlite database.');
          });
          db.serialize(function () {
              let sql = `SELECT ID IdeaID, title, description FROM Idea WHERE ID is ?`;
              db.get(sql, [formData.IdeaID], (err, rows) => {
                  if (err) {
                      throw err;
                  }
                  console.log(rows.IdeaID + rows.title);
                  var _title = JSON.stringify(rows.title).slice(1, -1);
                  console.log(_title);
                  var _description = JSON.stringify(rows.description).slice(1, -1);
                  console.log(_description);
                  let page = `
<html>

    <head>
        <title>FreeIdea - Idea View</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="./css/og.css" type="text/css" />
        <meta name="author" content="Jannis Dohm"><!-- based on openglobus.org -->
        <meta charset="UTF-8">
        <link rel="icon" type="image/svg+xml" href="./media/favicon.svg">
    </head>

<body>

<div style="display: flex; align-content: space-between; flex-wrap: wrap; width: 100%; height: 100%;">
    <div>
    <H2 id="id_title"><H2>
    <p id="id_IdeaID"></p>
    </br>
    <p id="id_description"></p>
    </br>
    </br>

    </div>
    <div>
    <H3>Vote this idea</H3></br>
        <img src="./media/up.svg" alt="Vote Up!" id="up-btn" style="width:49%;margin-top: 6px;vertical-align: bottom;">
        <img src="./media/down.svg" id="down-btn" alt="Vote Down" style="width:49%;">
        <button onclick="history.go(-1);" style="width: 100%" id="close-btn" class="close-btn" type="button">Back</button>
    </div>
</div>
</body>
<script>
const urlParams = new URLSearchParams(window.location.search);
document.getElementById("id_title").innerHTML = "${_title}";
document.getElementById("id_IdeaID").innerHTML = "IdeaID: #" + urlParams.get("IdeaID");
document.getElementById("id_description").textContent = "${_description}";

document.getElementById("up-btn").addEventListener("click", (e) => {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.onreadystatechange = function() {
                history.back()
            }
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+urlParams.get("IdeaID")+"&upvote=1");
        });

document.getElementById("down-btn").addEventListener("click", (e) => {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.onreadystatechange = function() {
                history.back()
            }
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+urlParams.get("IdeaID")+"&upvote=0");
        });

function getJsonFromUrl(url) {
  if(!url) url = location.search;
  var query = url.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}
</script>
</html>
`;

                  res.writeHead(200, { 'Content-Type': 'text/html' });
                  res.end(page);
              });
              db.close();
          });
      }
    else {
      if (parsedUrl.pathname == `/`) parsedUrl.pathname = `/index.html`;
      console.log(`parsedUrl: ${parsedUrl.pathname}`);
      // extract URL path
      let pathname = `.${parsedUrl.pathname}`;
      console.log(`parsedname: ${pathname}`);
      // based on the URL path, extract the file extention. e.g. .js, .doc, ...
      const ext = path.parse(pathname).ext;
      // maps file extention to MIME typere
      const map = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword'
      };

      fs.exists(pathname, function (exist) {
        if (!exist) {
          // if the file is not found, return 404
          res.statusCode = 404;
          res.end(`File ${pathname} not found!`);
          return;
        }

        // if is a directory search for index file matching the extention
        if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;

        // read file from file system
        fs.readFile(pathname, function (err, data) {
          if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
          } else {
            // if the file is found, set Content-type and send data
            res.setHeader('Content-type', map[ext] || 'text/plain');
            res.end(data);
          }
        });
      });
    }
  } else if (req.method === "POST") {
    if (req.url === "/submitIdea") {
      var requestBody = '';
      req.on('data', function (data) {
        requestBody += data;
        if (requestBody.length > 1e7) {
          res.writeHead(413, 'Request Entity Too Large', { 'Content-Type': 'text/html' });
          res.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
        }
      });
      req.on('end', function () {
        var formData = qs.parse(requestBody);
        console.log(`formData ${formData.ideaText}`);

        let db = new sqlite3.Database('./db/Ideas.db', (err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log('Connected to the SQlite database.');
        });
        //Write to Database (use in POST answer to save data)
        db.serialize(function () {
          var lastID;
          db.run('INSERT INTO Idea(title,description) VALUES(?1,?2)', {
            1: formData.nameText,
            2: formData.ideaText
          }, function (err) {
            if (err) {
              return console.log(err.message);
            }
            // get the last insert id
            lastID = this.lastID;
            console.log(`A row has been inserted into Idea with rowid ${this.lastID}`);
            db.run('INSERT INTO Places(lon,lat,IdeaID) VALUES(?1,?2,?3)', {
              1: formData.lon,
              2: formData.lat,
              3: this.lastID
            }, function (err) {
              if (err) {
                return console.log(err.message);
              }
              // get the last insert id
              console.log(`A row has been inserted with rowid ${this.lastID}`);
            });
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify(lastID));
            db.close();
          });
        });
      });
    }
      else if (req.url == `/getIdea`) {
      var requestBody = '';
      //prevent big fileupload
      req.on('data', function (data) {
        requestBody += data;
        if (requestBody.length > 1e7) {
          res.writeHead(413, 'Request Entity Too Large', { 'Content-Type': 'text/html' });
          res.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
        }
      });
      req.on('end', function () {
        var formData = qs.parse(requestBody);
        console.log(`formData ${formData.IdeaID}`);

        let db = new sqlite3.Database('./db/Ideas.db', (err) => {
          if (err) {
            return console.error(err.message);
          }
          //console.log('Connected to the SQlite database.');
        });
        //Write to Database (use in POST answer to save data)
        db.serialize(function () {
            let sql = `SELECT ID AskForIdea, title TITLE, description DESCRIPTION FROM Idea WHERE ID is ?`;
            db.get(sql, [formData.IdeaID], (err, rows) => {
                if (err) {
                    throw err;
                }
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(rows));
            });
            db.close();
        });
      });
      }
      else if (req.url == `/submitVote`) {
      var requestBody = '';
      //prevent big fileupload
      req.on('data', function (data) {
        requestBody += data;
        if (requestBody.length > 1e7) {
          res.writeHead(413, 'Request Entity Too Large', { 'Content-Type': 'text/html' });
          res.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
        }
      });
      req.on('end', function () {
        var formData = qs.parse(requestBody);
          var formDataUp;
          if(formData.upvote == 1) formDataUp = "Up";
          else formDataUp = "Down";
          console.log(`formData ${formData.IdeaID} vote` + formDataUp);

        let db = new sqlite3.Database('./db/Ideas.db', (err) => {
          if (err) {
            return console.error(err.message);
          }
        });
        db.serialize(function () {
            // new Date object
            let date_ob = new Date();
            //console.log(date_ob.getFullYear() + "-" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" + ("0" + date_ob.getDate()).slice(-2) + " " + ("0" + date_ob.getHours()).slice(-2) + ":" +("0" + date_ob.getMinutes()).slice(-2) + ":" + ("0" + date_ob.getSeconds()).slice(-2));
            db.run('INSERT INTO Votes(IdeaID,upvote,DateTime) VALUES(?1,?2,?3)', {
                1: formData.IdeaID,
                2: formData.upvote,
                3: date_ob.getFullYear() + "-" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" + ("0" + date_ob.getDate()).slice(-2) + " " + ("0" + date_ob.getHours()).slice(-2) + ":" +("0" + date_ob.getMinutes()).slice(-2) + ":" + ("0" + date_ob.getSeconds()).slice(-2)
            }, function (err) {
                if (err) {
                    return console.log(err.message);
                }
            });
            db.close();
        });
      });
          res.end();
      }
      else {
      res.writeHead(404, 'Resource Not Found', { 'Content-Type': 'text/html' });
      res.end('<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found</body></html>');
    }
  } else {
    res.writeHead(405, 'Method Not Supported', { 'Content-Type': 'text/html' });
    return res.end('<!doctype html><html><head><title>405</title></head><body>405: Method Not Supported</body></html>');
  }
}).listen(parseInt(port));
console.log(`Server listening on port ${port}`);


const TEMPLATEFS =
    `
<html>

    <head>
        <title>FreeIdea - Create Idea</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="./css/og.css" type="text/css" />
        <meta name="author" content="Jannis Dohm"><!-- based on openglobus.org -->
        <meta charset="UTF-8">
        <link rel="icon" type="image/svg+xml" href="./media/favicon.svg">
    </head>

<body>


<H2>Create your new Idea<H2>
    <form method="POST" action="submitIdea" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded"  target="_blank">
    <H3>Please name your Idea:<\H3>
		<textarea id="nameText"  rows="1" name="nameText" placeholder="Using Peanuts to end world hunger"></textarea>
    <H3>Please describe your Idea:<\H3>
		<textarea id="ideaText"  rows="5" name="ideaText" placeholder="Enter text"></textarea>
    <p>Add topics</p>
		<textarea id="categoriesText"  rows="1" name="categoriesText" placeholder="social, environment, it, ..."></textarea>
    <p>Needed skills</p>
		<textarea id="skillsText"  rows="1" name="skillsText" placeholder="programming, management, UI-Design, knitting, ..."></textarea>
    </br>
    <p id="demo3"></p>
		<button style="margin-left: 4px" id="save-btn" class="save-btn" type="button">Save</button>
		<button onclick="history.go(-1);" style="margin-left: 4px" id="close-btn" class="close-btn" type="button">Cancel</button>
		</form>
</body>
<script>
const urlParams = new URLSearchParams(window.location.search);
document.getElementById("save-btn").addEventListener("click", (e) => {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                history.back()
            }
            var nameText = document.getElementById('nameText').value;
            var ideaText = document.getElementById('ideaText').value;
            xhttp.open("POST", "submitIdea", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("nameText="+nameText+"&ideaText="+ideaText+"&lon="+urlParams.get("lon") +"&lat="+ urlParams.get("lat"));
        });

function getJsonFromUrl(url) {
  if(!url) url = location.search;
  var query = url.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}
</script>
</html>
`;

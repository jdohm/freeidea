const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
//const mysql = require('mysql');
const sqlite3 = require('sqlite3').verbose();
const port = process.argv[2] || 80;
const portSSL = process.argv[3] || 443;
var qs = require('querystring');

http.createServer(function (req, res){
          res.end('<!doctype html><html><head><title>413</title></head><body>301: redirect to https</body><script> console.log("you are accessing us via " +  "an insecure protocol (HTTP). " + "Redirecting you to HTTPS."); window.location.href =  window.location.href.replace("http:", "https:"); </script></html>');
}).listen(parseInt(port));
console.log(`http Server listening on port ${port}`);

var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/freeidea.de/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/freeidea.de/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/freeidea.de/chain.pem')
}


// Start sqlite3 database connection
let db = new sqlite3.Database('./db/Ideas.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

https.createServer(options, function (req, res) {
  if (req.method === "GET") {
    console.log(`${req.method} ${req.url}`);
    // parse URL
    const parsedUrl = url.parse(req.url);
    if (parsedUrl.pathname == `/getIdeas`) {

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
}).listen(parseInt(portSSL));
console.log(`Server listening on port ${portSSL}`);


//graceful shutdown source: https://medium.com/hackernoon/graceful-shutdown-in-nodejs-2f8f59d1c357
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
        db.close((err) => {
            console.log('SQLite connection closed.');
            process.exit(0);
        });
});

process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
        db.close((err) => {
            console.log('SQLite connection closed.');
            process.exit(0);
        });
});

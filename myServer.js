//myExpressServer.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const https = require("https");
var path = require("path");
var bcrypt = require("bcrypt");
const sdk = require("matrix-js-sdk");
var request = require('request');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require('method-override');

const app = express();
const http = express();
const port = process.argv[2] || 80;
const portSSL = process.argv[3] || 443;

//matrix login
const client = sdk.createClient("https://matrix.org");
client.login("m.login.password", {"user": "openidea", "password": process.env.MATRIX_PASSWORD}).then((response) => {
    console.log(response.access_token);
});

//usermanagement using passport
const initializePassport = require("./passport-config");
initializePassport(passport, async function getUserByEmail(email) {
  return new Promise((resolve) => {
    let sql = `SELECT name, email, pwHash password FROM User WHERE email is ?`;
    db.get(sql, [email], (err, rows) => {
      if (err) throw err;
        //if no user with this email was found, check if a username with this string exists
        if (rows == null) {
            sql = `SELECT name, email, pwHash password FROM User WHERE name is ?`;
            db.get(sql, [email], (err, rows) => {
                if (err) throw err;
                resolve(rows);
            });
        }
        else resolve(rows);
    });
  });
});

//options for https server
var options = {
  key: fs.readFileSync("/etc/letsencrypt/live/freeidea.de/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/freeidea.de/cert.pem"),
  ca: fs.readFileSync("/etc/letsencrypt/live/freeidea.de/chain.pem"),
};

// Start sqlite3 database connection
let db = new sqlite3.Database("./db/Ideas.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the SQlite database.");
});

//make URL encoded data accessible inside get/post function
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

//app start page
app.get("/", checkAuthenticated, function (req, res) {
  // res.send(fs.readFileSync('./index.html'));
  try {
  console.log("website username:" + req.user.name + "");
  } catch (error) {
  console.log("website no user logedin");
  }
  res.sendFile(path.join(__dirname + "/index.html"));
});

//respond to getIdeas GET request
app.get("/getIdeas", checkAuthenticated, function (req, res) {
  //read all places from Database
  db.serialize(function () {
    let sql = `SELECT lon, lat, IdeaID, upvotes, downvotes FROM v_PlacesVotes ORDER BY lat`;
    db.all(sql, [], (err, rows) => {
      if (err) throw err;
      res.json(rows);
    });
  });
});

//get svgs
app.get("/svgTest", function(req,res) {
    let _id = req.query.IdeaID;
    let _title = "";
    db.serialize(function () {
        let sql = `SELECT ID, title FROM Idea WHERE ID is ?`;
        db.get(sql, [_id], (err, row) => {
            if (err) throw err;
            _title = row.title;
            // console.log("test query " + _id + " title " + _title);
            var testSVG = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
            xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
            width="300"
            height="300"
            viewBox="0 0 300 300"
            version="1.1"
        >
        <rect width="300" height="300" fill="#FFFFFF"/>
        <text x="000" y="200" fill="#000000" font-size="2.0em">#${_id}</text>
        <text x="100" y="200" fill="#000000" font-size="2.0em">#${_id}</text>
        <text x="200" y="200" fill="#000000" font-size="2.0em">#${_id}</text>
        <text x="50" y="170" fill="#000000" transform="rotate(-90, 50, 170)" font-size="1.0em">${_title}</text>
        <text x="150" y="170" fill="#000000" transform="rotate(-90, 150, 170)" font-size="1.0em">${_title}</text>
        <text x="250" y="170" fill="#000000" transform="rotate(-90, 250, 170)" font-size="1.0em">${_title}</text>
        </svg>
    `;
            res.type('svg');
            res.send(testSVG);
        });
    });
});

//respond to getIdea POST request
app.post("/getIdea", checkAuthenticated, function (req, res) {
  if (!req.body.IdeaID) res.json();
  else {
    //Read idea data from database
    db.serialize(function () {
      let sql = `SELECT ID AskForIdea, title TITLE, description DESCRIPTION FROM Idea WHERE ID is ?`;
      db.get(sql, [req.body.IdeaID], (err, rows) => {
        if (err) throw err;
        //if IdeaID was not found, cancel following
        if (!rows) return 0;
        var idearows = rows;
        let sql = `SELECT Tag FROM Idea_Tags WHERE Idea is ?`;
        db.all(sql, [req.body.IdeaID], (err, rows) => {
          if (err) throw err;
          var tags = [];
          rows.forEach((row) => {
            tags.push(row.Tag);
          });
          idearows.tags = tags;
          let sql = `SELECT Skill FROM Idea_Skills WHERE Idea is ?`;
          db.all(sql, [req.body.IdeaID], (err, rows) => {
            if (err) throw err;
            var crd = [];
            rows.forEach((row) => {
              crd.push(row.Skill);
            });
            idearows.skills = crd;
              let sql = `SELECT User FROM Idea_User WHERE Idea is ?`;
              db.all(sql, [req.body.IdeaID], (err, rows) => {
                  if (err) throw err;
                  var crd = [];
                  rows.forEach((row) => {
                      crd.push(row.User);
                  });
                  idearows.user = crd;
                  res.json(idearows);
              });
          });
        });
      });
    });
  }
});

//receive votes from client and save them in db
app.post("/submitVote", checkAuthenticatedCancel, function (req, res) {
  db.serialize(function () {
    let date_ob = new Date();
    //datenow is date formated as string like this: YYYY-MM-DD HH:mm:ss
    let datenow =
      date_ob.getFullYear() +
      "-" +
      ("0" + (date_ob.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + date_ob.getDate()).slice(-2) +
      " " +
      ("0" + date_ob.getHours()).slice(-2) +
      ":" +
      ("0" + date_ob.getMinutes()).slice(-2) +
      ":" +
      ("0" + date_ob.getSeconds()).slice(-2);
    db.run(
      "INSERT INTO Votes(IdeaID,upvote,DateTime,User) VALUES(?1,?2,?3,?4)",
      {
          1: req.body.IdeaID,
          2: req.body.upvote,
          3: datenow,
          4: req.user.name
      },
      function (err) {
        if (err) return console.log(err.message);
        res.send("vote saved");
      }
    );
  });
});

//receive new ideas from client and save them in db
app.post("/submitIdea", checkAuthenticatedCancel, function (req, res) {
  db.serialize(function () {
    var lastID;
    db.run(
      "INSERT INTO Idea(title,description) VALUES(?1,?2)",
      {
        1: req.body.nameText,
        2: req.body.ideaText,
      },
      function (err) {
        if (err) return console.log(err.message);
        lastID = this.lastID;
        db.run(
          "INSERT INTO Places(lon,lat,IdeaID) VALUES(?1,?2,?3)",
          {
            1: req.body.lon,
            2: req.body.lat,
            3: this.lastID,
          },
          function (err) {
            if (err) return console.log(err.message);
          }
        );
        var tags = req.body.tags.split(",");
        tags.forEach(function (item, index) {
            if(item.trim() != ""){
          db.run(
            "INSERT OR IGNORE INTO Tags(Name) VALUES(?1)",
            {
              1: item.trim(),
            },
            function (err) {
              if (err) return console.log(err.message);
              db.run(
                "INSERT OR IGNORE INTO Idea_Tags(Idea,Tag) VALUES(?1, ?2)",
                {
                  1: lastID,
                  2: item.trim(),
                },
                function (err) {
                  if (err) return console.log(err.message);
                }
              );
            }
          );
            }
        });
        var skills = req.body.skills.split(",");
        skills.forEach(function (item, index) {
            if(item.trim() != ""){
          db.run(
            "INSERT OR IGNORE INTO Skills(Name) VALUES(?1)",
            {
              1: item.trim(),
            },
            function (err) {
              if (err) return console.log(err.message);
              db.run(
                "INSERT OR IGNORE INTO Idea_Skills(Idea,Skill) VALUES(?1, ?2)",
                {
                  1: lastID,
                  2: item.trim(),
                },
                function (err) {
                  if (err) return console.log(err.message);
                }
              );
            }
          );
        }
        });
        db.run(
            "INSERT INTO Idea_User(Idea, User, Role) VALUES(?1, ?2, ?3)",
            {
                1: lastID,
                2: req.user.name,
                3: 0
            },
            function (err) {
                if (err) return console.log(err.message);
            }
        );

    /*****************************|
    |  mastodon part start        |
    |*****************************/
          if(req.body.mastodon == "true"){
              console.log("publish on mastodon: " + req.body.mastodon);
          var tagsBody = "";

          tags.some(function(item, index) {
              if(item.trim() != "") {
                  tagsBody += ("#" + item.trim() + " ");
                  console.log("item: " + index + "tag: " + "#" + item.trim() + " ");
              }
              //if 3 tags written stop function
              if(index >= 2) return true;
              else return false;
          });

          console.log("tagsBody " + tagsBody);

          var statusText = truncate(req.body.nameText + "\n" + req.body.ideaText, 425)
              + "\n" + "https://openidea.io/?Idea=" + lastID + "\n"
              + tagsBody;

          var jsonBody = {'status': truncate(statusText, 425),
                          'visibility': 'unlisted'}// public, unlisted, private, direct
          ;
          var clientServerOptions = {
              url: 'https://botsin.space/api/v1/statuses',
              body: JSON.stringify(jsonBody),
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization' : 'Bearer ' + process.env.MASTODON_ACCESS_TOKEN
              }
          };
          request(clientServerOptions, function(error, response, body){
              // console.log(body);
          });

          function truncate(str, n){
              return (str.length > n) ? str.substr(0, n-3) + '...' : str;
          };
        }
    /*****************************|
    |  mastodon part end          |
    |*****************************/
        res.json(lastID);
      }
    );
  });
});


//support request to matrix room
app.post("/submitSupportRequest", function (req, res, next) {
    client.startClient();

    var testRoomId = "!HTcpkpXWLaaunauYsD:cactus.chat";

    var content = {
        "body": "#" + req.body.IdeaID + "\n" + req.body.text + "\n\nsend from: ",
        "msgtype": "m.text"
    };
    if(req.user){
        content.body += req.user.email;
    }
    else {content.body += "anonymous";}

    client.sendEvent(testRoomId, "m.room.message", content, "").then((res) => {
        // message sent successfully
    }).catch((err) => {
        console.log(err);
    });
    res.send("Message send to support");
});

//handle login POST request
//app.post("/submitLogin", checkNotAuthenticated, passport.authenticate("local", (err, user, info) => {
app.post("/submitLogin", function (req, res, next) {
    passport.authenticate("local", (err, user, info) => {
        //if authenticate failed respond with info
        if(!user) return res.json(info);
        else {
            //start user session
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.json(user.name);
            });
        }
    })(req,res,next)
    }
);

app.delete("/SubmitLogout", function (req, res) {
    req.logOut();
    res.json();
}
          );

//handle register POST request
app.post("/submitRegister", async function (req, res) {
  try {
    //try if user session is already active and logged in
    res.json({
      email: req.user.email,
    });
  } catch {}
  console.log(req.body.name);
  console.log(req.body.email);
  console.log(req.body.password);
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPassword);
    db.serialize(function () {
      db.run(
        "INSERT INTO User(name,email,pwHash) VALUES(?1,?2,?3)",
        {
          1: req.body.name,
          2: req.body.email,
          3: hashedPassword,
        },
        function (err) {
            if (err) {
                console.log(err.message);
                res.json({"message": err.message});
            }
            res.json("success");
        }
      );
    });
  } catch {
    console.log("error while user registered");
  }
});

//serve static content
app.use("/src", express.static(path.join(__dirname, "src")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/media", express.static(path.join(__dirname, "media")));
app.use("/res", express.static(path.join(__dirname, "res")));

//check if user is not authentcated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.append('login', req.user.name);
    console.log("checkAuthenticated " + req.user.name);
  } else {res.append('login', false);}
  next();
}

function checkAuthenticatedCancel(req, res, next) {
    if (req.isAuthenticated()) {
        res.append('login', req.user.name);
        console.log("checkAuthenticated " + req.user.name);
        next();
    } else {
        res.append('login', false);
        res.json("error");
    }
}

//http to https redirect
http.get("*", function (req, res) {
  res.redirect("https://" + req.headers.host + req.url);
});

//start server and listen to ports
http.listen(port, function () {
  console.log("http server running at port: " + port);
});
https.createServer(options, app).listen(portSSL, function () {
  console.log("https server running at port: " + portSSL);
});

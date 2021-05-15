//myExpressServer.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const https = require("https");
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const methodOverride = require("method-override");
const matrix = require("./src/oi/matrix");
const db = require("./src/oi/sqliteDb");
const svg = require("./src/oi/DrawSvg");

const app = express();
const http = express();
const port = process.argv[2] || 80;
const portSSL = process.argv[3] || 443;

//login matrix user
matrix.loginOpenIdea();
//connect to sqlite db
db.connect();

//usermanagement using passport
const initializePassport = require("./src/oi/passport-config");
initializePassport(passport, db.getUserByEmail);

//options for https server
var options = {
  key: fs.readFileSync("/etc/letsencrypt/live/freeidea.de/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/freeidea.de/cert.pem"),
  ca: fs.readFileSync("/etc/letsencrypt/live/freeidea.de/chain.pem"),
};

//make URL encoded data accessible inside get/post function
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  if (typeof req.session.isNew === "undefined") {
    req.session.isNew = true;
    req.session.save(next);
  } else if (req.session.isNew) {
    req.session.isNew = false;
    req.session.save(next);
  } else {
    next();
  }
});

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

//app start page
app.get("/", checkAuthenticated, function (req, res) {
  if (req.session.isNew) {
    if (req.query.Idea) res.redirect("/?user=new&Idea=" + req.query.Idea);
    else res.redirect("/?user=new");
  } else {
    try {
      console.log(req.user.name + " visited us");
    } catch (error) {
      console.log("anonymous visitor visited us");
    }
    res.sendFile(path.join(__dirname + "/index.html"));
  }
});

//respond with topics
app.get("/getTopics", async function (req, res) {
  res.json(await db.getTopics());
});

//respond with needed skills
app.get("/getSkills", async function (req, res) {
  res.json(await db.getSkills());
});

//respond with available tools
app.get("/getTools", async function (req, res) {
    res.json(await db.getTools());
});

//respond to getIdeas GET request
app.get("/getIdeas", checkAuthenticated, async function (req, res) {
  res.json(await db.getIdeas());
});

//respond to getMakerS GET request
app.get("/getMakerS", checkAuthenticated, async function (req, res) {
    console.log("reached");
    res.json(await db.getMakerSs());
});

//get svgs
app.get("/svgTest", async function (req, res) {
  let ideaData = await db.getIdea(req.query.IdeaID, true);
    let SVG = svg.draw(ideaData);
  res.type("svg");
  res.send(SVG);
});

//get svgs
app.get("/svgMakerS", async function (req, res) {
    let MakerS = await db.getMakerS(req.query.MakerSID, true);
    let SVG = svg.draw(MakerS);
    res.type("svg");
    res.send(SVG);
});

//endpoint for new comments
app.post("/submitComment", checkAuthenticated, async function (req, res, next) {
  if (res._headers.login !== "false")
    console.log(
      await matrix.sendMessage(
        res._headers.login,
        req.body.IdeaID,
        req.body.comment,
          db.getDb()
      )
    );
  //elso only if we want to let people comment without login in!
  //else console.log(await matrix.sendMessage('guest', req.body.IdeaID, req.body.comment, db_old));
  res.json({ msg: "comment saved" });
});

//respond to getIdea POST request
app.post("/getIdea", checkAuthenticated, async function (req, res) {
  if (!req.body.IdeaID) res.json();
  else {
    res.json(await db.getIdea(req.body.IdeaID));
  }
});

//respond to getMakerS POST request
app.post("/getMakerS", checkAuthenticated, async function (req, res) {
    if (!req.body.MakerSID) res.json();
    else {
        res.json(await db.getMakerS(req.body.MakerSID));
    }
});

//receive votes from client and save them in db
app.post("/submitVote", checkAuthenticatedCancel, async function (req, res) {
  res.send(await db.saveVote(req.body.IdeaID, req.body.upvote, req.user.name));
});

//receive new ideas from client and save them in db
app.post("/submitIdea", checkAuthenticatedCancel, async function (req, res) {
  res.json(await db.saveIdea(req));
});

//receive new registration of makerspace from client and save them in db
app.post("/submitMakerS", checkAuthenticatedCancel, async function (req, res) {
    res.json(await db.saveMakerS(req));
});

//support request to matrix room
app.post("/submitSupportRequest", function (req, res, next) {
  matrix.sendSupportRequest(req);
  res.send("Message send to support");
});

//handle login POST request
//app.post("/submitLogin", checkNotAuthenticated, passport.authenticate("local", (err, user, info) => {
app.post("/submitLogin", function (req, res, next) {
  passport.authenticate("local", (_err, user, info) => {
    //if authenticate failed respond with info
    if (!user) return res.json(info);
    else {
      //start user session
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.json(user.name);
      });
    }
  })(req, res, next);
});

app.delete("/SubmitLogout", function (req, res) {
  req.logOut();
  res.json();
});

//handle register POST request
app.post("/submitRegister", async function (req, res) {
  try {
    //try if user session is already active and logged in
    res.json({
      email: req.user.email,
    });
  } catch (e) {}

  //reject username if it uses not allowed character
  const regex = /[^A-Za-z0-9 ]+/g;
  if (regex.test(req.body.name)) {
    res.json({ message: "username not allowed" });
    return;
  }

  console.log(req.body.name);
  console.log(req.body.email);
  try {
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPassword);
    let matrixUser = await matrix.createUser(req.body.name);
    res.json(await db.saveUser(req.body.name, req.body.email, hashedPassword, matrixUser));
  } catch (e) {
    console.log("error while user registered");
    res.json("error while user registered");
  }
});

//serve static content
app.use("/src", express.static(path.join(__dirname, "src")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/media", express.static(path.join(__dirname, "media")));
app.use("/res", express.static(path.join(__dirname, "res")));
app.use("/material-font", express.static(path.join(__dirname, "node_modules/material-design-icons")));
app.use("/materialize-css", express.static(path.join(__dirname, "node_modules/materialize-css")));
app.use("/autoComplete", express.static(path.join(__dirname, "node_modules/@tarekraafat/autocomplete.js")));

//check if user is not authentcated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.append("login", req.user.name);
    console.log("checkAuthenticated " + req.user.name);
  } else {
    res.append("login", false);
  }
  next();
}

function checkAuthenticatedCancel(req, res, next) {
  if (req.isAuthenticated()) {
    res.append("login", req.user.name);
    console.log("checkAuthenticated " + req.user.name);
    next();
  } else {
    res.append("login", false);
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

//myExpressServer.js
const express = require('express');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const https = require('https');
var path = require('path');
const app = express();
const http = express();
const port = process.argv[2] || 80;
const portSSL = process.argv[3] || 443;

//options for https server
var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/freeidea.de/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/freeidea.de/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/freeidea.de/chain.pem')
};

// Start sqlite3 database connection
let db = new sqlite3.Database('./db/Ideas.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

//make URL encoded data accessible inside get/post function
app.use(express.urlencoded({ extended: false}));

//app startpage
app.get('/', function (req, res) {
    // res.send(fs.readFileSync('./index.html'));
    res.sendFile(path.join(__dirname + '/index.html'));
});

//respond to getIdeas GET request
app.get('/getIdeas', function (req, res) {
    //read all places from Database 
    db.serialize(function() {
        let sql = `SELECT lon, lat, IdeaID, upvotes, downvotes FROM v_PlacesVotes ORDER BY lat`;
        db.all(sql, [], (err, rows) => {
            if (err) throw err;
            res.json(rows);
        });
    });
});

//respond to getIdea POST request
app.post('/getIdea', function (req, res) {
    if(!req.body.IdeaID) res.json();
    else{
        //Read idea data from database
        db.serialize(function () {
            let sql = `SELECT ID AskForIdea, title TITLE, description DESCRIPTION FROM Idea WHERE ID is ?`;
            db.get(sql, [req.body.IdeaID], (err, rows) => {
                if (err) throw err;
                //if IdeaID was not found, cancel following
                if(!rows) return 0;
                var idearows = rows;
                let sql = `SELECT Tag FROM Idea_Tags WHERE Idea is ?`;
                db.all(sql, [req.body.IdeaID], (err, rows) => {
                    if (err) throw err;
                    var tags = [];
                    rows.forEach((row) => {tags.push(row.Tag);});
                    idearows.tags = tags;
                    let sql = `SELECT Skill FROM Idea_Skills WHERE Idea is ?`;
                    db.all(sql, [req.body.IdeaID], (err, rows) => {
                        if (err) throw err;
                        var crd = [];
                        rows.forEach((row) => {crd.push(row.Skill);});
                        idearows.skills = crd;
                        res.json(idearows);
                    });
                });
            });
        });
    }
});

//receive votes from client and save them in db
app.post('/submitVote', function (req, res) {
    db.serialize(function () {
        let date_ob = new Date();
        //datenow is date formated as string like this: YYYY-MM-DD HH:mm:ss
        let datenow = date_ob.getFullYear() + "-" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" + ("0" + date_ob.getDate()).slice(-2) + " " + ("0" + date_ob.getHours()).slice(-2) + ":" +("0" + date_ob.getMinutes()).slice(-2) + ":" + ("0" + date_ob.getSeconds()).slice(-2);
        db.run('INSERT INTO Votes(IdeaID,upvote,DateTime) VALUES(?1,?2,?3)', {
            1: req.body.IdeaID,
            2: req.body.upvote,
            3: datenow
            }, function (err) {if (err) return console.log(err.message);
                               res.send("vote saved");
        });
    });
});

//receive new ideas from client and save them in db
app.post('/submitIdea', function (req, res) {
    db.serialize(function () {
        var lastID;
        db.run('INSERT INTO Idea(title,description) VALUES(?1,?2)', {
        1: req.body.nameText,
        2: req.body.ideaText
        }, function (err) {
        if (err) return console.log(err.message);
        lastID = this.lastID;
        db.run('INSERT INTO Places(lon,lat,IdeaID) VALUES(?1,?2,?3)', {
            1: req.body.lon,
            2: req.body.lat,
            3: this.lastID
        }, function (err) {
            if (err) return console.log(err.message);
        });
            var tags = req.body.tags.split(",");
            tags.forEach( function(item,index) {
            db.run('INSERT OR IGNORE INTO Tags(Name) VALUES(?1)', {
                1: item.trim()
            }, function (err) {
                if (err) return console.log(err.message);
                db.run('INSERT OR IGNORE INTO Idea_Tags(Idea,Tag) VALUES(?1, ?2)', {
                    1: lastID,
                    2: item.trim()
                }, function (err) {
                    if (err) return console.log(err.message);
                });
            });
            });
            var skills = req.body.skills.split(",");
            skills.forEach( function(item,index) {
                db.run('INSERT OR IGNORE INTO Skills(Name) VALUES(?1)', {
                    1: item.trim()
            }, function (err) {
                if (err) return console.log(err.message);
                db.run('INSERT OR IGNORE INTO Idea_Skills(Idea,Skill) VALUES(?1, ?2)', {
                    1: lastID,
                    2: item.trim()
                }, function (err) {
                    if (err) return console.log(err.message);
                });
            });
            });
            res.json(lastID);
        });
    });
});

//serve static content
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/media', express.static(path.join(__dirname, 'media')));





//http to https redirect
http.get('*', function(req, res) {
    res.redirect('https://' + req.headers.host + req.url);
});


//start server and listen to ports
http.listen(port, function() {console.log('http server running at port: ' + port);});
https.createServer(options, app).listen(portSSL, function() {console.log('https server running at port: ' + portSSL);});

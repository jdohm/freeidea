/**
 * @fileOverview
 * @name sqliteDb.js
 * @author Jannis Dohm
 * @license MIT
 */

const sqlite3 = require("sqlite3").verbose();
const mastodon = require("./mastodon");

//stores the opened db connection
let db;

/**
 * function to start sqlite3 database connection
 * @param {string} [dbPath="./db/Ideas.db"] - path to database file
 * @returns {string} - error message on error
 */
function connect(dbPath) {
  dbPath = dbPath || "./db/Ideas.db";
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to the SQlite database.");
  });
}

/**
  * function to get the opened db connection
  * @returns {Object} - opened db
  */
function getDb(){
    return db;
}

/**
 * function which returns all tags 
 * @returns {string[]} - list with all tags
 */
async function getTopics() {
  return new Promise((resolve) => {
    db.serialize(() => {
      let sql = `SELECT Name FROM Tags ORDER BY Name`;
      db.all(sql, [], (err, rows) => {
        if (err) throw err;
        return resolve(rows);
      });
    });
  });
}

/**
 * function which returns all needed skill 
 * @returns {string[]} - list with all skill
 */
async function getSkills() {
  return new Promise((resolve) => {
    db.serialize(() => {
      let sql = `SELECT Name FROM Skills ORDER BY Name`;
      db.all(sql, [], (err, rows) => {
        if (err) throw err;
        return resolve(rows);
      });
    });
  });
}

/**
 * function which returns all available tools
 * @returns {string[]} - list with all tools
 */
async function getTools() {
    return new Promise((resolve) => {
        db.serialize(() => {
            let sql = `SELECT Name FROM Tools ORDER BY Name`;
            db.all(sql, [], (err, rows) => {
                if (err) throw err;
                return resolve(rows);
            });
        });
    });
}

/**
 * function which returns all ideas
 * @returns {Object[]} - array of idea objects
 * @property {string} lon - lon coordinate
 * @property {string} lat - lat coordinate
 * @property {number} IdeaID - number of idea
 * @property {number} upvotes - number of upvotes
 * @property {number} downvotes - number of downvotes
 * @property {string[]} tags - associated topics
 * @property {string[]} skills - needed skills
 * @property {string[]} users - users
 */
async function getIdeas() {
  return new Promise((resolve) => {
    //read all places from Database
    db.serialize(function () {
      let sql = `SELECT lon, lat, IdeaID, upvotes, downvotes FROM v_PlacesVotes ORDER BY lat`;
      db.all(sql, [], async (err, rows) => {
        if (err) throw err;
        let idearows = rows;
        for (let key in idearows) {
          let tmp = await _addTagsSkillsUsers(idearows[key].IdeaID);
          idearows[key].tags = tmp.tags;
          idearows[key].skills = tmp.skills;
          idearows[key].user = tmp.user;
        }
        return resolve(idearows);
      });
    });
  });
}

/**
 * function which returns all makerspaces
 * @returns {Object[]} - array of space objects
 * @property {string} lon - lon coordinate
 * @property {string} lat - lat coordinate
 * @property {number} IdeaID - number of makerspace
 * @property {string[]} tools - available tools at makerspace
 * @property {string[]} users - users who registered the makerspace
 */
async function getMakerSs() {
  return new Promise((resolve) => {
    //read all places from Database
    db.serialize(function () {
      let sql = `SELECT lon, lat, MakerSID FROM PlacesMakerS ORDER BY lat`;
      db.all(sql, [], async (err, rows) => {
        if (err) throw err;
        let makerSrows = rows;
        for (let key in makerSrows) {
          let tmp = await _addToolsUsers(makerSrows[key].MakerSID);
          makerSrows[key].tools = tmp.tools;
          makerSrows[key].user = tmp.user;
        }
        return resolve(makerSrows);
      });
    });
  });
}

/**
 * function which returns tags, skills and users for given idea
 * this function is for internal use, and isn't exposed
 * @param {number} id - number of idea
 * @returns {Object}
 * @property {String[]} tags - associated topics
 * @property {String[]} skills - needed skills
 * @property {String[]} users - users
 */
async function _addTagsSkillsUsers(id) {
  let idearows = { tags: [], skills: [], user: [] };
  return new Promise((resolve) => {
    db.serialize(function () {
      let sql = `SELECT Tag FROM Idea_Tags WHERE Idea is ?`;
      db.all(sql, [id], (err, rows) => {
        if (err) throw err;
        let tags = [];
        rows.forEach((row) => {
          tags.push(row.Tag);
        });
        idearows.tags = tags;
        let sql = `SELECT Skill FROM Idea_Skills WHERE Idea is ?`;
        db.all(sql, [id], (err, rows) => {
          if (err) throw err;
          let skills = [];
          rows.forEach((row) => {
            skills.push(row.Skill);
          });
          idearows.skills = skills;
          let sql = `SELECT User FROM Idea_User WHERE Idea is ?`;
          db.all(sql, [id], (err, rows) => {
            if (err) throw err;
            let users = [];
            rows.forEach((row) => {
              users.push(row.User);
            });
            idearows.user = users;
            return resolve(idearows);
          });
        });
      });
    });
  });
}

/**
 * function which returns tools and users for given makerspace
 * this function is for internal use, and isn't exposed
 * @param {number} id - number of makerspace
 * @returns {Object}
 * @property {String[]} tools - available tools at given makerspace
 * @property {String[]} users - users who registered this makerspace
 */
async function _addToolsUsers(id) {
    let makerSrows = { tools: [], user: [] };
  return new Promise((resolve) => {
    db.serialize(function () {
      let sql = `SELECT Tool FROM MakerS_Tools WHERE MakerS is ?`;
      db.all(sql, [id], (err, rows) => {
        if (err) throw err;
        let tools = [];
        rows.forEach((row) => {
          tools.push(row.Tool);
        });
        makerSrows.tools = tools;
          let sql = `SELECT User FROM MakerS_User WHERE MakerS is ?`;
          db.all(sql, [id], (err, rows) => {
            if (err) throw err;
            let users = [];
            rows.forEach((row) => {
              users.push(row.User);
            });
            makerSrows.user = users;
            return resolve(makerSrows);
          });
        });
    });
  });
}

/**
 * function to fetch idea informations
 * @param {number} IdeaID - number of the idea
 * @param {boolean} [pure=false] - if set to true, this function returns only ID, title and description
 * @returns {Object} - idea object
 * @property {number} ID - number of the idea
 * @property {string} title - title of the idea
 * @property {string} description - description of the idea
 * @property {string[]} Tag - tags of the idea
 * @property {string[]} Skill - skills of the idea
 * @property {string[]} User - users of the idea
 */
async function getIdea(IdeaID, pure) {
  return new Promise((resolve) => {
    db.serialize(function () {
      let sql = `SELECT ID, title, description FROM Idea WHERE ID is ?`;
      db.get(sql, [IdeaID], (err, rows) => {
        if (err) throw err;
        //if IdeaID was not found, cancel following
        if (!rows) return resolve();
        if (pure) return resolve(rows);
        let idearows = rows;
        let sql = `SELECT Tag FROM Idea_Tags WHERE Idea is ?`;
        db.all(sql, [IdeaID], (err, rows) => {
          if (err) throw err;
          let tags = [];
          rows.forEach((row) => {
            tags.push(row.Tag);
          });
          idearows.tags = tags;
          let sql = `SELECT Skill FROM Idea_Skills WHERE Idea is ?`;
          db.all(sql, [IdeaID], (err, rows) => {
            if (err) throw err;
            let crd = [];
            rows.forEach((row) => {
              crd.push(row.Skill);
            });
            idearows.skills = crd;
            let sql = `SELECT User FROM Idea_User WHERE Idea is ?`;
            db.all(sql, [IdeaID], (err, rows) => {
              if (err) throw err;
              let crd = [];
              rows.forEach((row) => {
                crd.push(row.User);
              });
              idearows.user = crd;
              return resolve(idearows);
            });
          });
        });
      });
    });
  });
}

/**
 * function to fetch makerspace informations
 * @param {number} MakerS - number of the makerspace
 * @param {boolean} [pure=false] - if set to true, this function returns only ID, title and description
 * @returns {Object} - makerspace object
 * @property {number} ID - number of the makerspace
 * @property {string} title - title of the makerspace
 * @property {string} description - description of the makerspace
 * @property {string[]} Tool - tools of the makerspace
 * @property {string[]} User - users of the idea
 */
async function getMakerS(MakerS, pure) {
  return new Promise((resolve) => {
    db.serialize(function () {
      let sql = `SELECT ID, title, description, address, contact, times FROM MakerS WHERE ID is ?`;
      db.get(sql, [MakerS], (err, rows) => {
        if (err) throw err;
        //if MakerS was not found, cancel following
        if (!rows) return resolve();
        if (pure) return resolve(rows);
        let makerSrows = rows;
        let sql = `SELECT Tool FROM MakerS_Tools WHERE MakerS is ?`;
        db.all(sql, [MakerS], (err, rows) => {
          if (err) throw err;
          let tools = [];
          rows.forEach((row) => {
            tools.push(row.Tool);
          });
          makerSrows.tools = tools;
            let sql = `SELECT User FROM MakerS_User WHERE MakerS is ?`;
            db.all(sql, [MakerS], (err, rows) => {
              if (err) throw err;
              let crd = [];
              rows.forEach((row) => {
                crd.push(row.User);
              });
              makerSrows.user = crd;
              return resolve(makerSrows);
            });
          });
        });
    });
  });
}

/**
 * function to save votes on ideas
 * @param {number} IdeaID - number of idea which recieved a vote
 * @param {number} Upvote - 1 = upvote, 0 = downvote
 * @param {string} Username - of the user which voted
 * @returns {string} - vote saved/error message
 */
async function saveVote(IdeaID, Upvote, Username) {
  return new Promise((resolve) => {
    db.serialize(function () {
      db.run(
        "INSERT INTO Votes(IdeaID,upvote,DateTime,User) VALUES(?1,?2,?3,?4)",
        {
          1: IdeaID,
          2: Upvote,
          3: DateAsString(),
          4: Username,
        },
        function (err) {
          if (err) return resolve(err.message);
          return resolve("vote saved");
        }
      );
    });
  });
}

/**
 * function which returns the date an time as a string
 * @returns {string} - YYYY-MM-DD HH:mm:ss
 */
function DateAsString() {
  let date_ob = new Date();
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
  return datenow;
}

/**
 * function to register new makerspace
 * @param {*} req - req data of incoming post request
 * reads req.body.lon, req.body.lat, req.body.tools, req.body.mastodon and req.user.name
 * req.body.name, reg.body.decription, reg.body.address, req.body.contact, req.body.times
 * @returns {number} - id of newly created makerspace
 */
async function saveMakerS(req) {
    return new Promise(async (resolve) => {
        let id = await _saveMakerS(
            req.body.name,
            req.body.description,
            req.body.address,
            req.body.contact,
            req.body.times);
        if (!id) return resolve(false);
        else {
            await db.serialize(() => {
                _savePlace(id, req.body.lon, req.body.lat, true);
                _saveTags(id, req.body.tools, "tools");
                _saveUser(id, req.user.name, true);
            });
            if (req.body.mastodon == "true") mastodon.post(id, req);
            return resolve(id);
        }
    });
}

/**
 * intern function to save makerspace title, description, address and contact
 * @param {string} title - title to be saved
 * @param {string} description - description to be saved
 * @param {string} address - address to be saved
 * @param {string} contact - contact to be saved
 * @param {string} times - opening times to be saved
 * @returns {number} - id of newly created makerspace
 */
async function _saveMakerS(title, description, address, contact, times) {
    return new Promise((resolve) => {
        db.run(
            "INSERT INTO MakerS(title,description,address,contact,times) VALUES(?1,?2,?3,?4,?5)",
            {
                1: title,
                2: description,
                3: address,
                4: contact,
                5: times,
            },
            function(error) {
                if (error) {
                    console.log("error while saving new makerspace: " + error);
                    return resolve(false);
                }
                return resolve(this.lastID);
            }
        );
    });
}

/**
 * function to save new idea
 * @param {*} req - req data of incoming post request
 * reads req.body.lon, req.body.lat, req.body.tags, req.body.skills, req.body.mastodon and req.user.name
 * @returns {number} - id of newly created idea
 */
async function saveIdea(req) {
  return new Promise(async (resolve) => {
    let id = await _saveIdea(req.body.nameText, req.body.ideaText);
    if (!id) return resolve(false);
    else {
      await db.serialize(() => {
        _savePlace(id, req.body.lon, req.body.lat);
          _saveTags(id, req.body.tags, "topics");
          _saveTags(id, req.body.tags, "skills");
        _saveUser(id, req.user.name);
      });
      if (req.body.mastodon == "true") mastodon.post(id, req);
      return resolve(id);
    }
  });
}

/**
 * intern function to save idea title and description 
 * @param {string} title - title to be saved
 * @param {string} description - description to be saved
 * @returns {number} - id of newly created idea
 */
async function _saveIdea(title, description) {
  return new Promise((resolve) => {
    db.run(
      "INSERT INTO Idea(title,description) VALUES(?1,?2)",
      {
        1: title,
        2: description,
      },
      function(error) {
        if (error) {
          console.log("error while saving new idea: " + error);
          return resolve(false);
        }
        return resolve(this.lastID);
      }
    );
  });
}

/**
 * intern function to save place of newly created idea
 * @param {number} id - id of idea
 * @param {string} lon - lon coordinate to be saved
 * @param {string} lat - lat coordinate to be saved
 * @param {boolean} [makerspace=false] - set if place belongs to a makerspace
 * @returns
 */
async function _savePlace(id, lon, lat, makerspace) {
  return new Promise((resolve) => {
      let sqlc = "INSERT INTO Places(lon,lat,IdeaID) VALUES(?1,?2,?3)";
      if(makerspace) sqlc = "INSERT INTO PlacesMakerS(lon,lat,MakerSID) VALUES(?1,?2,?3)";
    db.run(
      sqlc,
      {
        1: lon,
        2: lat,
        3: id,
      },
      function (err) {
        if (err) return resolve(err.message);
        return;
      }
    );
  });
}

/**
 * intern function to save tags associated with newly created idea/makerspace
 * @param {number} id - id of idea/makerspace
 * @param {string} tags - csv string of tags to be saved
 * @param {string} type - topics, skills, tools, this value will determine
 * if the tags are saved as topics or skills (used with ideas)
 * or as tools (used with makerspaces)
 * @returns
 */
async function _saveTags(id, tags, type) {
    let sqlc1, sqlc2;
    if(type == "topics") {
        sqlc1="INSERT OR IGNORE INTO Tags(Name) VALUES(?1)";
        sqlc2= "INSERT OR IGNORE INTO Idea_Tags(Idea,Tag) VALUES(?1, ?2)";
        console.log("topics");
    }else if (type == "skills"){
        sqlc1="INSERT OR IGNORE INTO Skills(Name) VALUES(?1)";
        sqlc2="INSERT OR IGNORE INTO Idea_Skills(Idea,Skill) VALUES(?1, ?2)";
        console.log("skills");
    }else if (type == "tools"){
        sqlc1="INSERT OR IGNORE INTO Tools(Name) VALUES(?1)";
        sqlc2="INSERT OR IGNORE INTO MakerS_Tools(MakerS,Tool) VALUES(?1, ?2)";
        console.log("tools");
    }else{
        console.log("error");
        sqlc1="INSERT OR IGNORE INTO Tags(Name) VALUES(?1)";
        sqlc2= "INSERT OR IGNORE INTO Idea_Tags(Idea,Tag) VALUES(?1, ?2)";
    }
  return new Promise((resolve) => {
    let tagArray = tags.split(",");
    tagArray.forEach(function (item, index) {
      if (item.trim() != "") {
        db.run(
          sqlc1,
          {
            1: item.trim(),
          },
          function (err) {
            if (err) return resolve(err.message);
            db.run(
              sqlc2,
              {
                1: id,
                2: item.trim(),
              },
              function (err) {
                if (err) return resolve(err.message);
              }
            );
          }
        );
      }
    });
  });
}

/**
 * intern function to save user which created the new idea/makerpace
 * @param {number} id - id of idea/makerspace
 * @param {string} username - of user to be saved as author of idea
 * @param {boolean} [makerspace=false] - set if place belongs to a makerspace
 * @returns
 */
async function _saveUser(id, username, makerspace=false) {
  return new Promise((resolve) => {
      let sqlc = "INSERT INTO Idea_User(Idea, User, Role) VALUES(?1, ?2, ?3)";
      if(makerspace) sqlc = "INSERT INTO MakerS_User(MakerS, User, Role) VALUES(?1, ?2, ?3)";
    db.run(
      sqlc,
      {
        1: id,
        2: username,
        3: 0,
      },
      function (err) {
        if (err) return resolve(err.message);
      }
    );
  });
}

/**
 * function to save new users (for registering new users)
 * @param {string} name - username of new user to be saved
 * @param {string} email - email of new user to be saved
 * @param {string} pwHash - pwHash of new users pw to be saved
 * @param {Object} matrixUser - matrix object containing matrix username and password
 * @param {string} matrixUser.matrixname - matrix username of user to be saved
 * @param {string} matrixUser.matrixpw - matrix password of user to be saved
 * @returns {Object} 
 * @property {string} message - success or errormessage
 */
async function saveUser(name, email, pwHash, matrixUser) {
  return new Promise((resolve) => {
    db.run(
      "INSERT INTO User(name,email,pwHash,matrixname,matrixpw) VALUES(?1,?2,?3,?4,?5)",
      {
        1: req.body.name,
        2: req.body.email,
        3: hashedPassword,
        4: matrixUser.matrixname,
        5: matrixUser.matrixpw,
      },
      function (err) {
        if (err) {
          console.log(err.message);
          return resolve({ message: err.message });
        }
        return resolve({message: "success"});
      }
    );
  });
}

/**
 * function to get matrixname and matrixpw of given user
 * @param {string} username - username to fetch matrix data for
 * @param {*} db - opened sqlite database to fetch data from
 * @returns {Object} - matrix user data
 * @property {string} matrixname - matrix username
 * @property {string} matrixpw - matrix password
 */
async function getMatrixUserByName(username, db) {
  return new Promise((resolve) => {
    let sql = `SELECT name, matrixname, matrixpw FROM User WHERE name is ?`;
    db.get(sql, [username], (err, rows) => {
      if (err) throw err;
      console.log(rows);
      return resolve(rows);
    });
  });
}

/**
 * function to get user object by email or username
 * @param {string} email - email of searched user
 * @param {boolean} [alsoCheckUserName=true] - if set to true (default) this function will check if the given email was a username and return data for this user.
 * @returns {Object} - user object
 * @property {string} name -  username
 * @property {string} email - users email
 * @property {string} pwHash - hashed password of the user
 */
async function getUserByEmail(email, alsoCheckUserName = true) {
  return new Promise((resolve) => {
    let sql = `SELECT name, email, pwHash password FROM User WHERE email is ?`;
    db.get(sql, [email], (err, rows) => {
      if (err) throw err;
      //if no user with this email was found, check if a username with this string exists
      if (rows == null && alsoCheckUserName) {
        sql = `SELECT name, email, pwHash password FROM User WHERE name is ?`;
        db.get(sql, [email], (err, rows) => {
          if (err) throw err;
          return resolve(rows);
        });
      } else return resolve(rows);
    });
  });
}

module.exports = {
  connect,
  getDb,
  getTopics,
  getSkills,
  getTools,
  getIdeas,
  getIdea,
  getMakerSs,
  getMakerS,
  saveVote,
  saveIdea,
  saveMakerS,
  saveUser,
  getMatrixUserByName,
  getUserByEmail,
};

/**
 * @fileOverview
 * @name sqliteDb.js
 * @author Jannis Dohm
 * @license MIT
 */

const sqlite3 = require("sqlite3").verbose();


// Start sqlite3 database connection
function startDb(){
let db = new sqlite3.Database("./db/Ideas.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the SQlite database.");
  return db;
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
            resolve(rows);
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
async function getUserByEmail(email, alsoCheckUserName=true) {
  return new Promise((resolve) => {
    let sql = `SELECT name, email, pwHash password FROM User WHERE email is ?`;
    db.get(sql, [email], (err, rows) => {
      if (err) throw err;
      //if no user with this email was found, check if a username with this string exists
      if (rows == null && alsoCheckUserName) {
        sql = `SELECT name, email, pwHash password FROM User WHERE name is ?`;
        db.get(sql, [email], (err, rows) => {
          if (err) throw err;
          resolve(rows);
        });
      } else resolve(rows);
    });
  });
}

module.exports = {getMatrixUserByName, getUserByEmail, startDb};
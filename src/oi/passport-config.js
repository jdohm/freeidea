const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

async function initialize(passport, getUserByEmail) {
  const authenticateUser = async (email, password, done) => {
      const user = await getUserByEmail(email);
      if (user == null) {
        console.log("user " + email + " not found");
        return done(null, false, { message: 'No user with that email address' });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
          console.log("user " +user.name + " " + user.email + " logged in");
          return done(null, user);
      } else {
          console.log("user " + email + " used the wrong password");
          return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
        return done(e);
    }
  };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.email));
    passport.deserializeUser( async (email, done) => {
      const user = await getUserByEmail(email);
        return done(null, user);
    });
}

module.exports = initialize;

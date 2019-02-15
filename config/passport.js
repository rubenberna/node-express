const LocalStrategy = require('passport-local')
.Strategy;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load users model
const User = mongoose.model('users');

module.exports = function(passport) {
  //we need to export our local strategy. If we have a username field, we don't need to specify this, but our username is the email
  passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    User.findOne({email: email})
      .then(user => {
        // Match user
        if(!user) {
          // done takes null as first paramater (no error) and the user. Since there's no user, we pass in false.
          return done(null, false, {message: 'No User found'})
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if(err) throw err;
          if(isMatch) {
            return done(null, user); // if the user us returned it means that the password matched
          } else {
            return done(null, false, {message: 'Password incorrect'})
          }
        })
      })
  }));

  //
  passport.serializeUser(function(user, done) {
  done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      // findById works with us because it's a mongoose function, but we would need to change this if we we'd be using the native mongodb driver or mongojs or some other ORM to deal with MongoDB, we'd have to change this
      User.findById(id, function(err, user) {
        done(err, user);
    });
  });
}

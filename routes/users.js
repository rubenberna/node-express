const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router(); // bring in the router from Express (no instalation necessary)

// Load User Model
require('../models/User');
const User = mongoose.model('users');

// 18. Login route
router.get('/login', (req, res) => {
  res.render('users/login');
})

// 19. Register route
router.get('/register', (req, res) => {
  res.render('users/register');
})

// Login Form Post -- Passport
router.post('/login', (req, res, next) => {
  // the first paramater is the strategy we're gonna use. We created that in the config file
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  }) (req, res, next)
});

// Register form POST
router.post('/register', (req, res) => {
  let errors = [];

  if(req.body.password != req.body.password2) {
    errors.push({text: 'Passwords do not match'});
  }

  if(req.body.password.length < 4){
    errors.push({text: 'Passwords must have at least 4 characters'});
  }

  if(errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    })
  } else {
    User.findOne({email: req.body.email})
      .then(user => {
        if (user) { // avoid duplicate emails
          req.flash('error_msg', 'Email already registered');
          res.redirect('/users/login')
        } else {
          const newUser = new User ({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          });
          // encrypt password. First paramater is how many characters we want, then it's a callback function
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err; // appears in the console
              newUser.password = hash;
              newUser.save()
              .then(user => {
                req.flash('success_msg', 'You are now registered and can login');
                res.redirect('/');
              })
              .catch(err => {
                console.log(err);
                return;
              })
            })
          })
        }
      })
  }
})

// Logout user
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login')
})

module.exports = router; // export the router

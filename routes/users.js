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
                res.redirect('/users/register');
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

module.exports = router; // export the router

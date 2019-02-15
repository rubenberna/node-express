const express = require('express');
const mongoose = require('mongoose');
const router = express.Router(); // bring in the router from Express (no instalation necessary)
// Load helper
const { ensureAuthenticated } = require('../helpers/auth'); // we can pass this to any paramater we want to protect

// 8. Load idea model
require('../models/Idea');
const Idea = mongoose.model('ideas');


// 11. Idea Index page
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({user: req.user.id}) // only the ideas that are coming from the logged in user
    .sort({date: 'desc'})
    .then(ideas => { // pass the ideas to the render view
      res.render('ideas/index', {
        ideas: ideas
      });
    })
})

// 9. Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add')
})

// 12. Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id // it gets whatever is passed in the params id of the url
  })
  .then(idea => {
    if(idea.user != req.user.id) {
      req.flash('error_msg', 'Not authorised');
      res.redirect('/ideas');
    } else {
      res.render('ideas/edit', {
        idea: idea
      })
    }
  })
})

// 10. Process Form
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = []
  if(!req.body.title) { // we have access to req.body due to the bodyParser middleware
    errors.push({text: 'Please add a title'})
  }
  if(!req.body.details) {
    errors.push({text: 'Please add details'})
  }

  // if there's an error re-render the page with the errors and with whatever was submited in the form
  if(errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    })
  } else {
    // pass to database
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    }
    new Idea(newUser)
      .save() // saves in database
      .then(idea => {  // redirect to ideas
        req.flash('success_msg', 'Video idea created');
        res.redirect('/ideas')
      })
  }
})

// 14. Edit Form Process. It catches the method request in the html markup
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.save()
      .then(idea => {
        req.flash('success_msg', 'Video idea updated');
        res.redirect('/ideas')
      })
  })
})

// 15. Delete idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({_id: req.params.id})
  .then(() => {
    req.flash('success_msg', 'Video idea removed');
    res.redirect('/ideas');
  })
})

module.exports = router; // export the router

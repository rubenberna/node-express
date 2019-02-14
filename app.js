const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


// 1. initialises the application
const app = express();

// 7. Connect to mongose
mongoose.connect('mongodb://localhost/any-name', {
  useNewUrlParser: true // to avoid a weird warning
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// 8. Load idea model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// 5. How middleware works. We created our own middleware
app.use(function(req, res, next) {
  console.log(Date.now())
  req.name = 'Ruben';
  next();
});

// 11. Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 13. Method override middleware
app.use(methodOverride('_method'));

// 16. Express session middleware
app.use(session({
  secret: 'secret', // it can be anything we want
  resave: true, // changed to true
  saveUninitialized: true,
}));
//
// // 17. Flash middleware
app.use(flash());
//
// 18. Setting up global variables middleware
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next(); // next means we'll call the next piece of middleware
})

// 6. Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars'); // we're telling the system that we want to use the handlebars template engine

// 3. we need an Index Route. Whenever we create a route, we need a req and res, which contain a bunch or methods and properties related to the server
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  }); // we're passing something as a response object
});

// 4. About route
app.get('/about', (req, res) => {
  res.render('about')
})

// 11. Idea Index page
app.get('/ideas', (req, res) => {
  Idea.find({}) // get all ideas rom the model
    .sort({date: 'desc'})
    .then(ideas => { // pass the ideas to the render view
      res.render('ideas/index', {
        ideas: ideas
      });
    })
})

// 9. Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add')
})

// 12. Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id // it gets whatever is passed in the params id of the url
  })
  .then(idea => {
    console.log(idea)
    res.render('ideas/edit', {
      idea: idea
    })
  })
})

// 10. Process Form
app.post('/ideas', (req, res) => {
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
      details: req.body.details
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
app.put('/ideas/:id', (req, res) => {
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
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({_id: req.params.id})
  .then(() => {
    req.flash('success_msg', 'Video idea removed');
    res.redirect('/ideas');
  })
})

const port = process.env.PORT || 5000;

//2. app listens to a port and uses a callback function
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

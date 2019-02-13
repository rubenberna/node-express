const express = require('express');
const exphbs = require('express-handlebars');
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

// 9. Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add')
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
    res.send('passed')
  }
})

const port = process.env.PORT || 5000;

//2. app listens to a port and uses a callback function
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

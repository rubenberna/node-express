const express = require('express');
const path = require('path'); // core module from Node.js we don't need to install it
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');


// 1. initialises the application
const app = express();

// 20. Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport); // passing it in to that config file we created

/* MONGOOSE */
// 7. Connect to mongose
mongoose.connect('mongodb://localhost/any-name', {
  useNewUrlParser: true // to avoid a weird warning
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

/* MIDDLEWARE */
// 5. How middleware works. We created our own middleware
app.use(function(req, res, next) {
  console.log(Date.now())
  req.name = 'Ruben';
  next();
});

// 11. Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 21. Static folder
app.use(express.static(path.join(__dirname, 'public'))) // join the paths of different directories (__dirname means current directory). In the end this makes the public folder to be the express static folder. Now we can use any static assets in that folder

// 13. Method override middleware
app.use(methodOverride('_method'));

// 16. Express session middleware
app.use(session({
  secret: 'secret', // it can be anything we want
  resave: true, // changed to true
  saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// // 17. Flash middleware
app.use(flash());
//
// 18. Setting global variables middleware
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next(); // next means we'll call the next piece of middleware
})

// 6. Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars'); // we're telling the system that we want to use the handlebars template engine


/* ROUTES */
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

// 21. Ideas route file
app.use('/ideas', ideas); // anything that is going to that ideas url, is going to pretend the ideas file

// 22. Users file
app.use('/users', users);

// PORT
const port = process.env.PORT || 5000;

//2. app listens to a port and uses a callback function
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

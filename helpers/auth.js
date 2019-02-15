module.exports = {
  ensureAuthenticated: function(req, res, next) {
    // this isAuthenticated is a function from passport
    if(req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Not Authrorised');
    res.redirect('/users/login');
  }
}

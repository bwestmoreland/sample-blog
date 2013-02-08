/**
 * Authentication
 */
var passport = require('passport')
  , ensure = require('connect-ensure-login')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('../models/user');

User.findOne({username: "rfeng"}, function(err, user) {
  if(err) {
    console.log(err);
  } else if(!user) {
    User.createUser("rfeng", "rfeng");
  }
});

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findByUsernamePassword(username, password, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

exports.loginForm = function(req, res) {
  res.render('login');
};

exports.login = passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' });

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
}

exports.account = [
  ensure.ensureLoggedIn('/login'),
  function(req, res) {
    res.render('account', { user: req.user });
  }
]

exports.setup = function(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  app.all('/rest/*', ensure.ensureLoggedIn('/login'));
  app.get('/login', exports.loginForm);
  app.post('/login', exports.login);
  app.get('/logout', exports.logout);
  app.get('/account', exports.account);
};
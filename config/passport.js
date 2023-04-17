const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/User');

const { checkPassword } = require('../utils/auth');

const localOptions = {
  usernameField: 'email',
  passwordField: 'password'
};

const googleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
  scope: ['profile', 'email'],
  state: true
}

const localCallback = (username, password, done) => {
  User.findOne({ email: username })
      .then((user) => {
          if (!user) { return done(null, false) }
          
          const isValid = checkPassword(password, user.hash, user.salt);
          
          if (isValid) {
              return done(null, user);
          } else {
              return done(null, false);
          }
      })
      .catch((err) => {   
          done(err);
      });
};

const googleCallback = (accessToken, refreshToken, profile, done) => {
  const emails = profile.emails.map(email => email.value) || [null];
  console.log('got emails', emails);
  const imageUrl = (profile?.photos || [null])[0]?.value;
  console.log('imageUrl', imageUrl);
  User.findOne({ email: { $in: emails } }).then(potentialUser => {
    let user = potentialUser;
    if (!user) {
      user = new User({
        email: emails[0],
        imageUrl
      });
    } else if (!user.imageUrl) {
      user.imageUrl = imageUrl;
    }
    user.save().then(() => {
      console.log('Google CB Success');
      return done(null, user);
    }).catch(e => {
      console.log('ERROR SAVING', e.message);
      return done(e);
    });
  }).catch(e => {
    console.log('ERROR FINDING', e.message);
    return done(e);
  });
}

const localStrategy = new LocalStrategy(localOptions, localCallback);
const googleStrategy = new GoogleStrategy(googleOptions, googleCallback);

passport.use(localStrategy);
passport.use(googleStrategy);

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  }).catch(err => done(err));
});
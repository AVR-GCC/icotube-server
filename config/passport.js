const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

const User = require('../models/User');
const { emailConfirmationMessage } = require('../routes/utils');

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

const linkedInOptions = {
  clientID: process.env.LINKEDIN_KEY,
  clientSecret: process.env.LINKEDIN_SECRET,
  callbackURL: '/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile'],
}

const localCallback = (username, password, done) => {
  const failArg = { message: 'Wrong email or password' };
  User.findOne({ email: username })
      .then((user) => {
          if (!user) { return done(null, false, failArg) }
          
          const isValid = checkPassword(password, user.hash, user.salt);
          
          if (isValid) {
              if (user.emailConfirmed) {
                return done(null, user);
              }
              return done(null, false, { message: emailConfirmationMessage });
          } else {
              return done(null, false, failArg);
          }
      })
      .catch((err) => {   
          console.log('Local login error:', err);
          done(err, false, failArg);
      });
};

const googleCallback = (accessToken, refreshToken, profile, done) => {
  const emails = profile.emails.map(email => email.value) || [null];
  const imageUrl = (profile?.photos || [null])[0]?.value;
  User.findOne({ email: { $in: emails } }).then(potentialUser => {
    let user = potentialUser;
    if (!user) {
      user = new User({
        email: emails[0],
        emailConfirmed: true,
        imageUrl
      });
    } else if (!user.imageUrl) {
      user.imageUrl = imageUrl;
    }
    user.save().then(() => {
      return done(null, user);
    }).catch(e => {
      return done(e);
    });
  }).catch(e => {
    return done(e);
  });
}

const linkedInCallback = (accessToken, refreshToken, profile, done) => {
  const emails = profile.emails.map(email => email.value) || [null];
  const imageUrl = (profile?.photos || [null])[0]?.value;
  User.findOne({ email: { $in: emails } }).then(potentialUser => {
    let user = potentialUser;
    if (!user) {
      user = new User({
        email: emails[0],
        emailConfirmed: true,
        imageUrl
      });
    } else if (!user.imageUrl) {
      user.imageUrl = imageUrl;
    }
    user.save().then(() => {
      return done(null, user);
    }).catch(e => {
      return done(e);
    });
  }).catch(e => {
    return done(e);
  });
}

const localStrategy = new LocalStrategy(localOptions, localCallback);
const googleStrategy = new GoogleStrategy(googleOptions, googleCallback);
const linkedInStrategy = new LinkedInStrategy(linkedInOptions, linkedInCallback)

passport.use(localStrategy);
passport.use(googleStrategy);
passport.use(linkedInStrategy);

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  }).catch(err => done(err));
});
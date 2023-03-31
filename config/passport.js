const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const { checkPassword } = require('../utils/auth');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const customFields = {
  usernameField: 'email',
  passwordField: 'password'
};

const verifyCallback = (username, password, done) => {
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

}

const localStrategy = new LocalStrategy(customFields, verifyCallback);

passport.use(localStrategy);

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: '/auth/google/callback',
//     scope: [ 'profile', 'email' ],
//     state: true
//   },
//   function(accessToken, refreshToken, profile, done) {
//     console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
//     console.log('passport.use cb');
//     const emails = profile.emails.map(email => email.value) || [null];
//     const imageUrl = (profile?.photos || [null])[0]?.value;
//     User.findOne({ email: { $in: emails } }).then(potentialUser => {
//       let user = potentialUser;
//       if (!user) {
//         user = new User({
//           email: emails[0],
//           imageUrl
//         });
//       } else if (!user.imageUrl) {
//         user.imageUrl = imageUrl;
//       }
//       user.save().then(() => {
//         console.log('passport.use cb user', user);
//         return done(null, user);
//       })
//     });
//   }
// ));

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  }).catch(err => done(err));
});
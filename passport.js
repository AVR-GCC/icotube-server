const passport = require('passport');
const User = require('./models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: [ 'profile', 'email' ],
    state: true
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.log('passport.use cb');
    const emails = profile.emails.map(email => email.value) || [null];
    const imageUrl = (profile?.photos || [null])[0]?.value;
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
        console.log('passport.use cb user', user);
        return done(null, user);
      })
    });
  }
));

passport.serializeUser((user, done) => {
  console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
  console.log('passport.serializeUser');
  console.log('user', user);
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
  console.log('passport.deserializeUser');
  console.log('id', id);
  User.findById(id).then(user => {
    console.log('deserializeUser cb user', user);
    return done(null, user);
  });
});
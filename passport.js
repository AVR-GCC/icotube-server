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
  async function(accessToken, refreshToken, profile, done) {
    console.log('in the "use" function');
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    console.log('profile', profile);
    const emails = profile.emails.map(email => email.value) || [null];
    const imageUrl = (profile?.photos || [null])[0]?.value;
    let user = await User.findOne({ email: { $in: emails } });
    if (!user) {
        user = new User({
            email: emails[0],
            imageUrl
        });
        await user.save();
    } else if (!user.imageUrl) {
        user.imageUrl = imageUrl;
        await user.save();
    }
    console.log('end user', user);
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  console.log('serializeUser', user);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  console.log('deserializeUser', id);
  const user = await User.findById(id);
  return done(null, user);
});
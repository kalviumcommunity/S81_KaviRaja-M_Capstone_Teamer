import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/userModel.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 1. Try to find user by googleId
    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user);

    // 2. Try to find user by email
    const email = profile.emails[0].value;
    user = await User.findOne({ email });
    if (user) {
      // Do NOT link accounts. Fail with a clear error message.
      return done(null, false, { message: 'This email already has an account. Please log in manually.' });
    }

    // 3. If not found, create new user
    user = await User.create({
      googleId: profile.id,
      name: profile.displayName,
      email: email,
      avatar: profile.photos[0]?.value,
    });
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport; 
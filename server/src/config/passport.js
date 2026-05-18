import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://s81-kaviraja-m-capstone-teamer-2.onrender.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value.split('@')[0] + Math.floor(Math.random() * 10000),
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

// We don't strictly need these if we don't use passport sessions (we use JWT instead), 
// but passport-google-oauth20 might expect them if configured with session: true
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

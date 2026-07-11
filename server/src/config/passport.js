const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const hasCompleteAcademicProfile = (user) => Boolean(
  user?.onboarded &&
  user?.rollNumber &&
  user?.degree &&
  user?.branch &&
  user?.yearOfStudy &&
  user?.semester
);

// Validate that Google credentials look real (not a placeholder or copy-paste error)
const hasValidGoogleCreds = (() => {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) return false;
  if (secret === id) return false;                         // copy-paste error
  if (secret.includes('.googleusercontent.com')) return false; // accidentally copied Client ID into Secret
  if (secret.length < 20) return false;                    // too short to be a real secret
  return true;
})();

if (hasValidGoogleCreds) {
  const apiUrl = (process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${apiUrl}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new Error('Google account did not provide an email address'), null);
        }

        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          if (!hasCompleteAcademicProfile(user) && user.onboarded) {
            user.onboarded = false;
            await user.save({ validateBeforeSave: false });
          }
          return done(null, user);
        }

        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos?.[0]?.value;
          if (!hasCompleteAcademicProfile(user)) {
            user.onboarded = false;
          }
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        user = await User.create({
          googleId: profile.id,
          email,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          onboarded: false
        });
        return done(null, user);
      } catch (error) {
        console.error('Error during Google Strategy authentication:', error);
        return done(error, null);
      }
    }
  ));
} else {
  console.log('[Auth] Google OAuth credentials missing or appear invalid. Email/password login will still work.');
}

// Expose flag so routes can decide whether to register Google endpoints
passport.googleEnabled = hasValidGoogleCreds;

module.exports = passport;

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

const cleanEnvValue = (value) => {
  const trimmed = (value || '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

// Validate that Google credentials look real (not a placeholder or copy-paste error)
const googleClientId = cleanEnvValue(process.env.GOOGLE_CLIENT_ID);
const googleClientSecret = cleanEnvValue(process.env.GOOGLE_CLIENT_SECRET);

const getGoogleConfigProblem = () => {
  if (!googleClientId) return 'GOOGLE_CLIENT_ID is missing';
  if (!googleClientSecret) return 'GOOGLE_CLIENT_SECRET is missing';
  if (!googleClientId.endsWith('.apps.googleusercontent.com')) return 'GOOGLE_CLIENT_ID does not look like a Google web client ID';
  if (googleClientSecret === googleClientId) return 'GOOGLE_CLIENT_SECRET is the same as GOOGLE_CLIENT_ID';
  if (googleClientSecret.includes('.googleusercontent.com')) return 'GOOGLE_CLIENT_SECRET looks like a client ID';
  if (googleClientSecret.length < 20) return 'GOOGLE_CLIENT_SECRET is too short';
  return '';
};

const googleConfigProblem = getGoogleConfigProblem();
const hasValidGoogleCreds = !googleConfigProblem;

if (hasValidGoogleCreds) {
  const apiUrl = cleanEnvValue(process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');
  passport.use(new GoogleStrategy({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
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
  console.log(`[Auth] Google OAuth disabled: ${googleConfigProblem}. Email/password login will still work.`);
}

// Expose flag so routes can decide whether to register Google endpoints
passport.googleEnabled = hasValidGoogleCreds;
passport.googleConfigProblem = googleConfigProblem;

module.exports = passport;

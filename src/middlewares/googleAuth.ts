import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";

dotenv.config();

// 1. Validate Environment Variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing required Google OAuth credentials");
}

// 2. Implement consistent session vs JWT handling
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user: any) => void
    ) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          if (!profile.emails?.[0]?.value) {
            return done(new Error("Email is required"), null);
          }

          user = new User({
            googleId: profile.id,
            name: profile.displayName || "Unknown",
            email: profile.emails[0].value,
            profileImage: profile.photos?.[0]?.value || null,
            role: "user",
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("Error authenticating with Google:", error);
        return done(error as Error, null);
      }
    }
  )
);

// 5. Fix serializeUser with proper ID type
passport.serializeUser((user: any, done) => {
  done(null, user._id); // ✅ Ensure ID is stored as a string
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error("User not found"), null);
    }
    done(null, user as any);
  } catch (error) {
    done(error as Error, null);
  }
});

export default passport;

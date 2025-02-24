
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";
// import { Document } from "mongoose";

dotenv.config();

// type UserDoc = IUser & Document;

// 1. Add proper error handling and type checking for environment variables
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
            role: "user" // Add default role
          });
          await user.save();
        }

        // Return user without token - we'll generate it in the callback
        return done(null, user);
      } catch (error) {
        console.error("Error authenticating with Google:", error);
        return done(error as Error, null);
      }
    }
  )
);

// 5. Improve type safety in serialization
passport.serializeUser((user: Express.User, done) => {
  if (!user._id) {
    return done(new Error("User ID not found"), null);
  }
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: (err: any, user?: Express.User | null) => void) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error("User not found"), null);
    }
    done(null, user as unknown as Express.User);
  } catch (error) {
    done(error as Error, null);
  }
});


export default passport;
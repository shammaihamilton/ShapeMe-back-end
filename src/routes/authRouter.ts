import { Router } from "express";
import passport from "passport";
import {
  registerUser,
  login,
  logOut,
  googleAuthCallback,
} from "../controllers/authController.js";
import jwtAuth from "../middlewares/jwtAuth.js";

const router = Router();

// 🔹 Standard Authentication
router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", jwtAuth, logOut);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // Disable session if using JWT
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleAuthCallback
);

export default router;

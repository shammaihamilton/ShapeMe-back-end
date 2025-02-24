"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const jwtAuth_1 = __importDefault(require("../middlewares/jwtAuth"));
const router = (0, express_1.Router)();
// 🔹 Standard Authentication
router.post("/register", authController_1.registerUser);
router.post("/login", authController_1.login);
router.post("/logout", jwtAuth_1.default, authController_1.logOut);
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // Disable session if using JWT
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: "/login",
}), authController_1.googleAuthCallback);
exports.default = router;

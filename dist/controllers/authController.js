"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logOut = exports.login = exports.registerUser = exports.googleAuthCallback = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Token_1 = __importDefault(require("../models/Token")); // adjust the path as needed
const transporter_1 = __importDefault(require("../config/transporter"));
dotenv_1.default.config();
// Google Authentication Callback
const googleAuthCallback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(400).json({ message: "Google authentication failed" });
            return;
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        const userObject = user.toObject(); // ✅ Convert Mongoose document to plain object
        const payload = {
            id: userObject.id, // ✅ TypeScript now recognizes `id`
            role: userObject.role, // ✅ TypeScript now recognizes `role`
        };
        if (typeof process.env.JWT_SECRET !== "string") {
            throw new Error("JWT_SECRET must be a string");
        }
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "3h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3 * 60 * 60 * 1000, // 3 hours
        });
        res.redirect("http://localhost:5173/home");
    }
    catch (error) {
        next(error);
    }
});
exports.googleAuthCallback = googleAuthCallback;
// Register User
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, lastName, email, password, phone_number } = req.body;
        // Validate required fields
        if (!name || !email || !password) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
        const newUser = new User_1.default({
            name,
            lastName,
            email,
            password: hashedPassword,
            phone_number,
            role: "user", // Set default role
        });
        yield newUser.save();
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name,
                lastName,
                email,
                phone_number,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.registerUser = registerUser;
// Login User
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        if (!user.password) {
            res.status(400).json({
                message: "This account was created with Google. Please use Google login.",
            });
            return;
        }
        const isMatch = yield (0, bcrypt_1.compare)(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "3h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3 * 60 * 60 * 1000,
        });
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
// Logout User
const logOut = (req, res, next) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.json({ message: "Logout successful" });
    }
    catch (error) {
        next(error);
    }
};
exports.logOut = logOut;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Find the user by email
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "Email does not exist", success: false });
        }
        // Delete any existing reset tokens for this user
        const existingToken = yield Token_1.default.findOne({ userId: user._id });
        if (existingToken) {
            yield existingToken.deleteOne();
        }
        // Generate a new reset token (plain-text) and hash it
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = yield (0, bcrypt_1.hash)(resetToken, 10);
        // Store the hashed token in the database
        yield new Token_1.default({
            userId: user._id,
            token: hashedToken,
            createdAt: Date.now(),
        }).save();
        // Send the email with the plain-text token in the URL
        yield transporter_1.default.sendMail({
            from: process.env.MAILER_AUTH_USER_NAME,
            to: user.email,
            subject: "Reset Your Password",
            html: `
        <p>To reset your password, click the link below:</p>
        <a href="http://localhost:5174/resetPassword?token=${resetToken}&uid=${user._id}">
          Reset Password
        </a>
      `,
        });
        return res.status(200).json({
            message: "Password reset link sent to your email",
            success: true,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error sending password reset link",
            success: false,
            error: error.message || "Unknown error",
        });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid, token } = req.query;
        const { password } = req.body;
        // 1. Validate required query params
        if (!uid || !token) {
            return res.status(400).json({
                message: "Missing uid or token in query",
                success: false,
            });
        }
        // 2. Find the token for this user
        const userToken = yield Token_1.default.findOne({ userId: uid });
        if (!userToken) {
            return res.status(400).json({
                message: "Invalid or expired password reset token",
                success: false,
            });
        }
        // 3. Compare the plain-text token from the query with the hashed token in DB
        const isValid = yield (0, bcrypt_1.compare)(token.toString(), userToken.token);
        if (!isValid) {
            return res.status(400).json({
                message: "Invalid or expired password reset token",
                success: false,
            });
        }
        // 4. Hash the new password and update the user
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
        const user = yield User_1.default.findByIdAndUpdate(uid, { password: hashedPassword }, { new: true });
        // 5. Delete the token from the DB so it can't be reused
        yield userToken.deleteOne();
        return res.status(200).json({
            message: "Password updated successfully",
            success: true,
            user,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error resetting password",
            success: false,
            error: error.message || "Unknown error",
        });
    }
});
exports.resetPassword = resetPassword;
exports.default = {
    googleAuthCallback: exports.googleAuthCallback,
    registerUser: exports.registerUser,
    login: exports.login,
    logOut: exports.logOut,
    resetPassword: exports.resetPassword,
    forgotPassword: exports.forgotPassword,
};

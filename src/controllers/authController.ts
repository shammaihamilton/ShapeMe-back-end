import { Request, Response, NextFunction, RequestHandler } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User, { UserDocument, IUser } from "../models/User"; // adjust the path as needed
import Token from "../models/Token"; // adjust the path as needed
import { JWTPayload } from "../types/auth.types"; // adjust the path as needed
import transporter from "../config/transporter";

dotenv.config();

// Type for user registration data
interface RegisterUserInput {
  name: string;
  lastName?: string;
  email: string;
  password: string;
  phone_number?: string;
}

// Google Authentication Callback
export const googleAuthCallback: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      res.status(400).json({ message: "Google authentication failed" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const payload: JWTPayload = {
      id: user.id, // using the virtual getter (user.id) which returns a string
      role: user.role,
    };

    if (typeof process.env.JWT_SECRET !== "string") {
      throw new Error("JWT_SECRET must be a string");
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 60 * 60 * 1000, // 3 hours
    });

    res.redirect("http://localhost:5173/home");
  } catch (error) {
    next(error);
  }
};

// Register User
export const registerUser = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, lastName, email, password, phone_number } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await hash(password, 10);

    const newUser = new User({
      name,
      lastName,
      email,
      password: hashedPassword,
      phone_number,
      role: "user", // Set default role
    });

    await newUser.save();

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
  } catch (error) {
    next(error);
  }
};

// Login User
export const login = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
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

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
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
  } catch (error) {
    next(error);
  }
};

// Logout User
export const logOut = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

interface ForgotPasswordBody {
  email: string;
}

export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email does not exist", success: false });
    }

    // Delete any existing reset tokens for this user
    const existingToken = await Token.findOne({ userId: user._id });
    if (existingToken) {
      await existingToken.deleteOne();
    }

    // Generate a new reset token (plain-text) and hash it
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await hash(resetToken, 10);

    // Store the hashed token in the database
    await new Token({
      userId: user._id,
      token: hashedToken,
      createdAt: Date.now(),
    }).save();

    // Send the email with the plain-text token in the URL
    await transporter.sendMail({
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
  } catch (error: any) {
    return res.status(500).json({
      message: "Error sending password reset link",
      success: false,
      error: error.message || "Unknown error",
    });
  }
};

/**
 * Resets the user's password if the token matches and isn't expired.
 */
interface ResetPasswordQuery {
  uid?: string;
  token?: string;
}

interface ResetPasswordBody {
  password: string;
}

export const resetPassword = async (
  req: Request<ResetPasswordQuery, {}, ResetPasswordBody>,
  res: Response
): Promise<Response> => {
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
    const userToken = await Token.findOne({ userId: uid });
    if (!userToken) {
      return res.status(400).json({
        message: "Invalid or expired password reset token",
        success: false,
      });
    }

    // 3. Compare the plain-text token from the query with the hashed token in DB
    const isValid = await compare(token.toString(), userToken.token);
    if (!isValid) {
      return res.status(400).json({
        message: "Invalid or expired password reset token",
        success: false,
      });
    }

    // 4. Hash the new password and update the user
    const hashedPassword = await hash(password, 10);
    const user = await User.findByIdAndUpdate(
      uid,
      { password: hashedPassword },
      { new: true }
    );

    // 5. Delete the token from the DB so it can't be reused
    await userToken.deleteOne();

    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error resetting password",
      success: false,
      error: error.message || "Unknown error",
    });
  }
};

export default {
  googleAuthCallback,
  registerUser,
  login,
  logOut,
  resetPassword,
  forgotPassword,
};

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDb from "./database/connectDb";
import passport from "passport"; 
import session from "express-session";
import authRouter from "./routes/authRouter";
import "./middlewares/googleAuth"; 
import { errorHandler } from "./middlewares/errorHandler";

// Load environment variables
dotenv.config();

// ✅ Connect to Database with Proper Error Handling
connectDb()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1); // Stop the server if DB connection fails
  });

const app = express();

// ✅ Security & Middleware
app.use(helmet());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Supports form submissions
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);

// ✅ Rate Limiter (Prevent Abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ✅ Session Setup for Google OAuth
app.use(
  session({
    secret: process.env.JWT_SECRET as string, // ✅ Secure session secret
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Initialize Passport for Google Authentication
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/auth", authRouter);

// ✅ Global Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

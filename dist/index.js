"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const connectDb_1 = __importDefault(require("./database/connectDb"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
require("./middlewares/googleAuth");
const errorHandler_1 = require("./middlewares/errorHandler");
// Load environment variables
dotenv_1.default.config();
// ✅ Connect to Database with Proper Error Handling
(0, connectDb_1.default)()
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((error) => {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1); // Stop the server if DB connection fails
});
const app = (0, express_1.default)();
// ✅ Security & Middleware
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true })); // ✅ Supports form submissions
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:5174"],
}));
// ✅ Rate Limiter (Prevent Abuse)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// ✅ Session Setup for Google OAuth
app.use((0, express_session_1.default)({
    secret: process.env.JWT_SECRET, // ✅ Secure session secret
    resave: false,
    saveUninitialized: false,
}));
// ✅ Initialize Passport for Google Authentication
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// ✅ Routes
app.use("/auth", authRouter_1.default);
// ✅ Global Error Handling Middleware
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

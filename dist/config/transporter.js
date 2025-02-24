"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: "Gmail", // or change to your email service provider
    auth: {
        user: process.env.MAILER_AUTH_USER_NAME, // your email address from .env
        pass: process.env.MAILER_AUTH_PASSWORD, // your email password or app-specific password from .env
    },
});
exports.default = transporter;

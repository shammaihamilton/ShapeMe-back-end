import mongoose, { Schema, Document } from "mongoose";

// Define User Interface
export interface IUser {
  name: string;
  lastName?: string;
  email: string;
  password?: string;
  phone_number?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  workoutInfo?: string;
  role: "user" | "admin";
  profileImage?: string;
  token?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Document separately to avoid type conflicts
export interface UserDocument extends IUser, Document {}

// Define Mongoose Schema
const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 8,
    },
    phone_number: {
      type: String,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    bmi: {
      type: Number,
    },
    workoutInfo: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Export Model and Types
const User = mongoose.model<UserDocument>("User", userSchema);
export default User;

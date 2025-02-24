// models/Token

import mongoose, { Schema, Document } from "mongoose";

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
}

const tokenSchema = new Schema<IToken>({
  // Reference the User model
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // The hashed token
  token: {
    type: String,
    required: true,
  },
  // Track creation time for potential expiration
  createdAt: {
    type: Date,
    default: Date.now,
    // Optional: automatically remove document after 1 hour (3600 seconds)
    // expires: 3600,
  },
});

export default mongoose.model<IToken>("Token", tokenSchema);

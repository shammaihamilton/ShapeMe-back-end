import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
// Define User Interface
  _id: mongoose.Types.ObjectId;
  id: string; // ✅ Ensure TypeScript recognizes the virtual `id`
  name: string;
  lastName?: string;
  email: string;
  password?: string;
  phone_number?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  workoutInfo?: string;
  role: "user" | "admin"; // ✅ Ensure role is defined
  profileImage?: string;
  token?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Mongoose Schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, minlength: 8 },
    phone_number: { type: String },
    height: { type: Number },
    weight: { type: Number },
    bmi: { type: Number },
    workoutInfo: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" }, // ✅ Ensure role is properly typed
    profileImage: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    token: { type: String },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },  // ✅ Ensure virtuals are included in JSON responses
    toObject: { virtuals: true }  // ✅ Ensure virtuals are included when calling .toObject()
  }
);

// ✅ Define a virtual `id` getter
userSchema.virtual("id").get(function () {
  return this._id.toHexString(); // ✅ Converts _id to a string
});

// ✅ Ensure TypeScript recognizes virtuals
const User = mongoose.model<IUser>("User", userSchema);
export default User;

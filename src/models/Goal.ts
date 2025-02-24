import mongoose, { Schema, Document } from "mongoose";
import Task from "./Task"; // Import Task model

// Enum for Goal Status
export enum GoalState {
  Pending = "pending",
  InProgress = "in_progress",
  Completed = "completed",
}


export enum GoalCategory {
  Fitness = "fitness",
  Diet = "diet",
  Productivity = "productivity",
  Learning = "learning",
  Other = "other",
}


export interface IGoal extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: GoalCategory;
  deadline?: Date;
  status: GoalState;
  importance: number;
  getProgress(): Promise<number>; // ✅ Define getProgress method in the interface
}

const goalSchema = new Schema<IGoal>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: Object.values(GoalCategory),
      required: true,
    },
    deadline: { type: Date },
    status: {
      type: String,
      enum: Object.values(GoalState),
      default: GoalState.Pending,
    },
    importance: { type: Number, enum: [1, 2, 3, 4 ,5], default: 2 }, // 1 = Low, 2 = Medium, 3 = High
  },
  { timestamps: true }
);

// ✅ Add a Method to Calculate Goal Progress
goalSchema.methods.getProgress = async function () {
  const totalTasks = await Task.countDocuments({ goal: this._id });
  const completedTasks = await Task.countDocuments({ goal: this._id, completed: true });

  return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
};

// Export Model
export default mongoose.model<IGoal>("Goal", goalSchema);

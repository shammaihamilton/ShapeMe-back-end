import mongoose, { Schema, Document } from "mongoose";
import Subtask from "./Subtask.js"; // ✅ Import Subtask model

// Enum for Task Status
export enum TaskState {
  Pending = "pending",
  InProgress = "in_progress",
  Completed = "completed",
  Archived = "archived",
}

export interface ITask extends Document {
  user: mongoose.Types.ObjectId;
  goal: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dueDate: Date;
  status: TaskState;
  priority: number;
  createdAt: Date;
  getProgress(): Promise<number>; // ✅ Define getProgress method
}

const taskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(TaskState),
      default: TaskState.Pending,
    },
    priority: { type: Number, enum: [1, 2, 3], default: 2 },
  },
  { timestamps: true }
);

// ✅ Method to Calculate Task Progress from Subtasks
taskSchema.methods.getProgress = async function (): Promise<number> {
  const totalSubtasks = await Subtask.countDocuments({ task: this._id });
  const completedSubtasks = await Subtask.countDocuments({ task: this._id, status: "completed" });

  return totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);
};

export default mongoose.model<ITask>("Task", taskSchema);

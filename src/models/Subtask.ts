import mongoose, { Schema, Document } from "mongoose";

// Enum for Subtask Status
export enum SubtaskState {
  Pending = "pending",
  InProgress = "in_progress",
  Completed = "completed",
}

export interface ISubtask extends Document {
  task: mongoose.Types.ObjectId;
  title: string;
  status: SubtaskState;
  createdAt: Date;
}

const subtaskSchema = new Schema<ISubtask>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(SubtaskState),
      default: SubtaskState.Pending,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubtask>("Subtask", subtaskSchema);

import { Request, Response, NextFunction } from "express";
import Subtask from "../models/Subtask.js";
import Task, { ITask, TaskState } from "../models/Task.js";
import { ApiError } from "../middlewares/errorHandler.js";

export interface AuthRequest extends Request {
  user?: Express.User; // now uses your augmented Express.User type
}

// ✅ Create a Subtask (Ensuring User Owns the Task)
export const createSubtask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { task, title } = req.body;
    if (!req.user) return next(new ApiError("Unauthorized request", 401));

    const taskExists = await Task.findOne({ _id: task, user: req.user.id }).exec();
    if (!taskExists) return next(new ApiError("Task not found or unauthorized", 403));

    const newSubtask = new Subtask({ task, title });
    await newSubtask.save();

    res.status(201).json({ message: "Subtask created successfully", subtask: newSubtask });
  } catch (error) {
    next(error);
  }
};

// ✅ Get Subtasks for a Task (Ensuring User Owns the Task)
export const getSubtasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new ApiError("Unauthorized request", 401));

    const taskExists = await Task.findOne({ _id: req.params.taskId, user: req.user.id }).exec();
    if (!taskExists) return next(new ApiError("Task not found or unauthorized", 403));

    const subtasks = await Subtask.find({ task: req.params.taskId }).exec();
    res.status(200).json(subtasks);
  } catch (error) {
    next(error);
  }
};

// ✅ Update a Subtask (Ensuring User Owns the Task)
export const updateSubtask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new ApiError("Unauthorized request", 401));
  
      const { title, status } = req.body;
  
      // ✅ Ensure user owns the task before updating a subtask
      const subtask = await Subtask.findById(req.params.id)
        .populate<{ task: ITask | null }>("task") 
        .exec();
  
      if (!subtask || !subtask.task || !subtask.task._id) {
        return next(new ApiError("Subtask or associated task not found", 403));
      }
  
      subtask.title = title || subtask.title;
      subtask.status = status || subtask.status;
      await subtask.save();
  
      await updateTaskProgress(subtask.task._id.toString()); // ✅ Now `_id` is safe
  
      res.status(200).json(subtask);
    } catch (error) {
      next(error);
    }
  };
  

// ✅ Delete a Subtask (Ensuring User Owns the Task)
export const deleteSubtask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new ApiError("Unauthorized request", 401));
  
      const subtask = await Subtask.findById(req.params.id)
        .populate<{ task: ITask | null }>("task") // ✅ Explicitly type `task`
        .exec();
  
      // ✅ Ensure subtask and task exist before accessing `_id`
      if (!subtask || !subtask.task || !subtask.task._id) {
        return next(new ApiError("Subtask or associated task not found", 403));
      }
  
      if (subtask.task.user.toString() !== req.user.id) {
        return next(new ApiError("Unauthorized to delete this subtask", 403));
      }
  
      await subtask.deleteOne();
  
      await updateTaskProgress(subtask.task._id.toString()); // ✅ Now `_id` is safe
  
      res.status(200).json({ message: "Subtask deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
  

// ✅ Update Task Progress Based on Completed Subtasks
const updateTaskProgress = async (taskId: string) => {
  try {
    const totalSubtasks = await Subtask.countDocuments({ task: taskId }).exec();
    const completedSubtasks = await Subtask.countDocuments({ task: taskId, status: "completed" }).exec();

    const task = await Task.findById(taskId).exec() as ITask | null;

    if (!task) return;

    // ✅ Ensure `status` is recognized as `TaskState`
    task.status =
      completedSubtasks === totalSubtasks && totalSubtasks > 0 ? TaskState.Completed : TaskState.InProgress;

    await task.save();
  } catch (error) {
    console.error("Error updating task progress:", error);
  }
};

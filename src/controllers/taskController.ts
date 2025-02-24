import { Request, Response, NextFunction } from "express";
import Task from "../models/Task.js";
import Goal from "../models/Goal.js";
import { ApiError } from "../middlewares/errorHandler.js";

export interface AuthRequest extends Request {
  user?: Express.User; // now uses your augmented Express.User type
}

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { goal, title, description, dueDate } = req.body;

    if (!req.user) return next(new ApiError("Unauthorized request", 401));

    //  Ensure the goal belongs to the user
    const goalExists = await Goal.findOne({ _id: goal, user: req.user.id });
    if (!goalExists) return next(new ApiError("Goal not found or unauthorized", 403));

    const newTask = new Task({
      user: req.user.id,
      goal,
      title,
      description,
      dueDate,
    });

    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    next(error);
  }
};

// Get Tasks for a Goal
export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new ApiError("Unauthorized request", 401));

    //  Ensure the goal belongs to the user
    const goalExists = await Goal.findOne({ _id: req.params.goalId, user: req.user.id });
    if (!goalExists) return next(new ApiError("Goal not found or unauthorized", 403));

    const tasks = await Task.find({ goal: req.params.goalId });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// Update a Task
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new ApiError("Unauthorized request", 401));

    const { title, description, dueDate, status } = req.body;

    // Ensure user owns the task before updating
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Only update if task belongs to user
      { title, description, dueDate, status },
      { new: true }
    );

    if (!task) return next(new ApiError("Task not found or unauthorized", 404));

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// Delete a Task
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new ApiError("Unauthorized request", 401));

    // Ensure user owns the task before deleting
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!task) return next(new ApiError("Task not found or unauthorized", 404));

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ✅ Get Task Progress (Checking If `getProgress()` Exists)
export const getTaskProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new ApiError("Task not found", 404));

    // ✅ Check if `getProgress` exists before calling it
    if (typeof task.getProgress !== "function") {
      return next(new ApiError("Progress tracking not available for this task", 500));
    }

    const progress = await task.getProgress();
    res.status(200).json({ progress });
  } catch (error) {
    next(error);
  }
};

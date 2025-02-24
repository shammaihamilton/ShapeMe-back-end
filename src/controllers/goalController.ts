import { Request, Response, NextFunction } from "express";
import Goal from "../models/Goal.js";
import { ApiError } from "../middlewares/errorHandler.js";

export interface AuthRequest extends Request {
  user?: Express.User; // now uses your augmented Express.User type
}
// Create a Goal
export const createGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, deadline } = req.body;

    const newGoal = new Goal({
      user: req.user?.id,
      title,
      description,
      category,
      deadline,
    });

    await newGoal.save();
    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    next(error);
  }
};

// Get All Goals for a User
export const getGoals = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError("Unauthorized request", 401));
      }
  
      const goals = await Goal.find({ user: req.user.id });
  
      // ✅ Add progress dynamically to each goal
      const goalsWithProgress = await Promise.all(
        goals.map(async (goal) => {
          const progress = await goal.getProgress(); // Call getProgress method
          return { ...goal.toObject(), progress };
        })
      );
  
      res.status(200).json(goalsWithProgress);
    } catch (error) {
      next(error);
    }
  };
  

// Update a Goal
export const updateGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError("Unauthorized request", 401));
      }
  
      const { title, description, category, deadline, completed } = req.body;
  
      // Ensure user only updates their own goal
      const goal = await Goal.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id }, // ✅ Only update if the goal belongs to the user
        { title, description, category, deadline, completed },
        { new: true }
      );
  
      if (!goal) return next(new ApiError("Goal not found or not owned by user", 404));
  
      res.status(200).json(goal);
    } catch (error) {
      next(error);
    }
  };
  

// Delete a Goal
export const deleteGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError("Unauthorized request", 401));
      }
  
      // Ensure user only deletes their own goal
      const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  
      if (!goal) return next(new ApiError("Goal not found or not owned by user", 404));
  
      res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
  

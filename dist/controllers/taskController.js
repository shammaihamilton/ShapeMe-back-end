"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskProgress = exports.deleteTask = exports.updateTask = exports.getTasks = exports.createTask = void 0;
const Task_js_1 = __importDefault(require("../models/Task.js"));
const Goal_js_1 = __importDefault(require("../models/Goal.js"));
const errorHandler_js_1 = require("../middlewares/errorHandler.js");
const createTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { goal, title, description, dueDate } = req.body;
        if (!req.user)
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        //  Ensure the goal belongs to the user
        const goalExists = yield Goal_js_1.default.findOne({ _id: goal, user: req.user.id });
        if (!goalExists)
            return next(new errorHandler_js_1.ApiError("Goal not found or unauthorized", 403));
        const newTask = new Task_js_1.default({
            user: req.user.id,
            goal,
            title,
            description,
            dueDate,
        });
        yield newTask.save();
        res.status(201).json({ message: "Task created successfully", task: newTask });
    }
    catch (error) {
        next(error);
    }
});
exports.createTask = createTask;
// Get Tasks for a Goal
const getTasks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        //  Ensure the goal belongs to the user
        const goalExists = yield Goal_js_1.default.findOne({ _id: req.params.goalId, user: req.user.id });
        if (!goalExists)
            return next(new errorHandler_js_1.ApiError("Goal not found or unauthorized", 403));
        const tasks = yield Task_js_1.default.find({ goal: req.params.goalId });
        res.status(200).json(tasks);
    }
    catch (error) {
        next(error);
    }
});
exports.getTasks = getTasks;
// Update a Task
const updateTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        const { title, description, dueDate, status } = req.body;
        // Ensure user owns the task before updating
        const task = yield Task_js_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, // Only update if task belongs to user
        { title, description, dueDate, status }, { new: true });
        if (!task)
            return next(new errorHandler_js_1.ApiError("Task not found or unauthorized", 404));
        res.status(200).json(task);
    }
    catch (error) {
        next(error);
    }
});
exports.updateTask = updateTask;
// Delete a Task
const deleteTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        // Ensure user owns the task before deleting
        const task = yield Task_js_1.default.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!task)
            return next(new errorHandler_js_1.ApiError("Task not found or unauthorized", 404));
        res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTask = deleteTask;
// ✅ Get Task Progress (Checking If `getProgress()` Exists)
const getTaskProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = yield Task_js_1.default.findById(req.params.id);
        if (!task)
            return next(new errorHandler_js_1.ApiError("Task not found", 404));
        // ✅ Check if `getProgress` exists before calling it
        if (typeof task.getProgress !== "function") {
            return next(new errorHandler_js_1.ApiError("Progress tracking not available for this task", 500));
        }
        const progress = yield task.getProgress();
        res.status(200).json({ progress });
    }
    catch (error) {
        next(error);
    }
});
exports.getTaskProgress = getTaskProgress;

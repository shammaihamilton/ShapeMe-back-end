"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.deleteSubtask = exports.updateSubtask = exports.getSubtasks = exports.createSubtask = void 0;
const Subtask_js_1 = __importDefault(require("../models/Subtask.js"));
const Task_js_1 = __importStar(require("../models/Task.js"));
const errorHandler_js_1 = require("../middlewares/errorHandler.js");
// ✅ Create a Subtask (Ensuring User Owns the Task)
const createSubtask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { task, title } = req.body;
        if (!req.user)
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        const taskExists = yield Task_js_1.default.findOne({ _id: task, user: req.user.id }).exec();
        if (!taskExists)
            return next(new errorHandler_js_1.ApiError("Task not found or unauthorized", 403));
        const newSubtask = new Subtask_js_1.default({ task, title });
        yield newSubtask.save();
        res.status(201).json({ message: "Subtask created successfully", subtask: newSubtask });
    }
    catch (error) {
        next(error);
    }
});
exports.createSubtask = createSubtask;
// ✅ Get Subtasks for a Task (Ensuring User Owns the Task)
const getSubtasks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        const taskExists = yield Task_js_1.default.findOne({ _id: req.params.taskId, user: req.user.id }).exec();
        if (!taskExists)
            return next(new errorHandler_js_1.ApiError("Task not found or unauthorized", 403));
        const subtasks = yield Subtask_js_1.default.find({ task: req.params.taskId }).exec();
        res.status(200).json(subtasks);
    }
    catch (error) {
        next(error);
    }
});
exports.getSubtasks = getSubtasks;
// ✅ Update a Subtask (Ensuring User Owns the Task)
const updateSubtask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        const { title, status } = req.body;
        // ✅ Ensure user owns the task before updating a subtask
        const subtask = yield Subtask_js_1.default.findById(req.params.id)
            .populate("task")
            .exec();
        if (!subtask || !subtask.task || !subtask.task._id) {
            return next(new errorHandler_js_1.ApiError("Subtask or associated task not found", 403));
        }
        subtask.title = title || subtask.title;
        subtask.status = status || subtask.status;
        yield subtask.save();
        yield updateTaskProgress(subtask.task._id.toString()); // ✅ Now `_id` is safe
        res.status(200).json(subtask);
    }
    catch (error) {
        next(error);
    }
});
exports.updateSubtask = updateSubtask;
// ✅ Delete a Subtask (Ensuring User Owns the Task)
const deleteSubtask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        const subtask = yield Subtask_js_1.default.findById(req.params.id)
            .populate("task") // ✅ Explicitly type `task`
            .exec();
        // ✅ Ensure subtask and task exist before accessing `_id`
        if (!subtask || !subtask.task || !subtask.task._id) {
            return next(new errorHandler_js_1.ApiError("Subtask or associated task not found", 403));
        }
        if (subtask.task.user.toString() !== req.user.id) {
            return next(new errorHandler_js_1.ApiError("Unauthorized to delete this subtask", 403));
        }
        yield subtask.deleteOne();
        yield updateTaskProgress(subtask.task._id.toString()); // ✅ Now `_id` is safe
        res.status(200).json({ message: "Subtask deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteSubtask = deleteSubtask;
// ✅ Update Task Progress Based on Completed Subtasks
const updateTaskProgress = (taskId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalSubtasks = yield Subtask_js_1.default.countDocuments({ task: taskId }).exec();
        const completedSubtasks = yield Subtask_js_1.default.countDocuments({ task: taskId, status: "completed" }).exec();
        const task = yield Task_js_1.default.findById(taskId).exec();
        if (!task)
            return;
        // ✅ Ensure `status` is recognized as `TaskState`
        task.status =
            completedSubtasks === totalSubtasks && totalSubtasks > 0 ? Task_js_1.TaskState.Completed : Task_js_1.TaskState.InProgress;
        yield task.save();
    }
    catch (error) {
        console.error("Error updating task progress:", error);
    }
});

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
exports.deleteGoal = exports.updateGoal = exports.getGoals = exports.createGoal = void 0;
const Goal_js_1 = __importDefault(require("../models/Goal.js"));
const errorHandler_js_1 = require("../middlewares/errorHandler.js");
// Create a Goal
const createGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, category, deadline } = req.body;
        const newGoal = new Goal_js_1.default({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            title,
            description,
            category,
            deadline,
        });
        yield newGoal.save();
        res.status(201).json({ message: "Goal created successfully", goal: newGoal });
    }
    catch (error) {
        next(error);
    }
});
exports.createGoal = createGoal;
// Get All Goals for a User
const getGoals = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        }
        const goals = yield Goal_js_1.default.find({ user: req.user.id });
        // ✅ Add progress dynamically to each goal
        const goalsWithProgress = yield Promise.all(goals.map((goal) => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield goal.getProgress(); // Call getProgress method
            return Object.assign(Object.assign({}, goal.toObject()), { progress });
        })));
        res.status(200).json(goalsWithProgress);
    }
    catch (error) {
        next(error);
    }
});
exports.getGoals = getGoals;
// Update a Goal
const updateGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        }
        const { title, description, category, deadline, completed } = req.body;
        // Ensure user only updates their own goal
        const goal = yield Goal_js_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, // ✅ Only update if the goal belongs to the user
        { title, description, category, deadline, completed }, { new: true });
        if (!goal)
            return next(new errorHandler_js_1.ApiError("Goal not found or not owned by user", 404));
        res.status(200).json(goal);
    }
    catch (error) {
        next(error);
    }
});
exports.updateGoal = updateGoal;
// Delete a Goal
const deleteGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new errorHandler_js_1.ApiError("Unauthorized request", 401));
        }
        // Ensure user only deletes their own goal
        const goal = yield Goal_js_1.default.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!goal)
            return next(new errorHandler_js_1.ApiError("Goal not found or not owned by user", 404));
        res.status(200).json({ message: "Goal deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteGoal = deleteGoal;

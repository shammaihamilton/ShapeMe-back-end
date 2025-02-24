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
exports.GoalCategory = exports.GoalState = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Task_1 = __importDefault(require("./Task")); // Import Task model
// Enum for Goal Status
var GoalState;
(function (GoalState) {
    GoalState["Pending"] = "pending";
    GoalState["InProgress"] = "in_progress";
    GoalState["Completed"] = "completed";
})(GoalState || (exports.GoalState = GoalState = {}));
var GoalCategory;
(function (GoalCategory) {
    GoalCategory["Fitness"] = "fitness";
    GoalCategory["Diet"] = "diet";
    GoalCategory["Productivity"] = "productivity";
    GoalCategory["Learning"] = "learning";
    GoalCategory["Other"] = "other";
})(GoalCategory || (exports.GoalCategory = GoalCategory = {}));
const goalSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
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
    importance: { type: Number, enum: [1, 2, 3, 4, 5], default: 2 }, // 1 = Low, 2 = Medium, 3 = High
}, { timestamps: true });
// ✅ Add a Method to Calculate Goal Progress
goalSchema.methods.getProgress = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const totalTasks = yield Task_1.default.countDocuments({ goal: this._id });
        const completedTasks = yield Task_1.default.countDocuments({ goal: this._id, completed: true });
        return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    });
};
// Export Model
exports.default = mongoose_1.default.model("Goal", goalSchema);

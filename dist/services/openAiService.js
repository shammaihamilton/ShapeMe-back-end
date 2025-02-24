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
exports.generateSmartSchedule = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ✅ Correct way to initialize OpenAI
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Generates a smart schedule for a task using AI.
 * @param userName - The user's name.
 * @param taskTitle - The title of the task.
 * @param userAvailability - The user's available time slots.
 * @param pastHabits - User's past task completion behavior.
 * @param priority - Task priority level (high, medium, low).
 * @returns Suggested best time for the task.
 */
const generateSmartSchedule = (userName, taskTitle, userAvailability, pastHabits, priority) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const prompt = `
      You are an AI assistant that schedules tasks for users based on availability, priority, and past habits.
      - User: ${userName}
      - Task: ${taskTitle}
      - Availability: ${userAvailability.join(", ")}
      - Past Completion Habits: ${pastHabits.join(", ")}
      - Task Priority: ${priority}
      
      Suggest the **best time** to complete the task. Explain why.
    `;
        const response = yield openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7,
        });
        return ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "No recommendation available.";
    }
    catch (error) {
        console.error("Error generating schedule:", error);
        return "Error generating schedule.";
    }
});
exports.generateSmartSchedule = generateSmartSchedule;

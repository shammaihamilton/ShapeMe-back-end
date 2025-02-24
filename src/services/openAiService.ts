import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// ✅ Correct way to initialize OpenAI
const openai = new OpenAI({
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
export const generateSmartSchedule = async (
  userName: string,
  taskTitle: string,
  userAvailability: string[],
  pastHabits: string[],
  priority: "high" | "medium" | "low"
): Promise<string> => {
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

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "No recommendation available.";
  } catch (error) {
    console.error("Error generating schedule:", error);
    return "Error generating schedule.";
  }
};

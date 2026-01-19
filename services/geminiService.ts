import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
if (!apiKey) {
  console.error("? CRITICAL ERROR: API Key is missing.");
}
const genAI = new GoogleGenerativeAI(apiKey || "dummy_key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export const generateQuiz = async (topic: string, difficulty: string) => {
  try {
    console.log("Generating quiz for:", topic.substring(0, 50) + "..."); // Log first 50 chars only
    // Prompt explicitly asks for strict JSON
    const prompt = `Generate 5 multiple choice questions based on the following content. Content: "${topic}". Difficulty: ${difficulty}. Return ONLY a raw JSON array. Format: [{ "question": "...", "options": ["a", "b", "c", "d"], "answer": "correct_option_text" }]`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("AI Raw Response:", text); // Debugging
    // ROBUST FIX: Extract JSON array using Regex instead of simple replace
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error("No JSON array found in response");
    }
    const cleanJson = jsonMatch[0];
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    // SAFETY NET: Return a dummy question so the app doesn't crash to blue screen
    return [{
      question: "The AI could not process this PDF/Topic. Please try a shorter text or check your API Key.",
      options: ["Error", "Try Again", "Check Key", "Refresh"],
      answer: "Try Again"
    }];
  }
};
export const generateStudyGuide = async (topic: string, score: number) => {
  try {
    const prompt = `Create a short study guide for the following content: "${topic}". The student scored ${score}/5. Give 3 key bullet points to review.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Guide Error:", error);
    return "Unable to generate study guide at this time.";
  }
};

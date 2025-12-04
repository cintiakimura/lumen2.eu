import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

// Initialize client safely
try {
  // The API key must be obtained exclusively from process.env.API_KEY.
  if (process.env.API_KEY) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    console.warn("Gemini API Key not found. Chat features will be disabled.");
  }
} catch (e) {
  console.warn("Error initializing Gemini client:", e);
}

export const sendMessageToGemini = async (history: { role: 'user' | 'model'; text: string }[], newMessage: string): Promise<string> => {
  if (!client) return "Demo Mode: API Key missing. Unable to connect to Lumen Core.";

  try {
    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are Lumen, an advanced AI tutor for industrial technicians. Keep answers concise, technical, and encouraging. Adopt a persona of a helpful, highly intelligent system interface.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "No response received.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to neural core. Please try again.";
  }
};

export const gradeSubmissionAI = async (task: string, response: string): Promise<any> => {
    
    if (!client) {
        // Fallback Mock Logic
        return new Promise(resolve => setTimeout(() => {
            resolve({
                score: 85,
                feedback: {
                    overall: "Solid understanding of the core concept.",
                    criteria: [
                        { name: "Accuracy", score: 90, explanation: "Calculation is correct." },
                        { name: "Method", score: 80, explanation: "Steps were logical but could be more concise." }
                    ]
                },
                reflection_prompt: "How would this change if the pressure variable doubled?",
                latency_ms: 450
            });
        }, 1200));
    }

    try {
        const result = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Grade this student response for Task: "${task}". Response: "${response}". 
            Return JSON only: { score: number, feedback: { overall: string, criteria: [] }, reflection_prompt: string }`,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        // Clean response of any markdown code blocks if present
        const text = result.text || "{}";
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Grading Error:", e);
        return {
            score: 0,
            feedback: { overall: "System Error during grading.", criteria: [] },
            reflection_prompt: "N/A"
        };
    }
};
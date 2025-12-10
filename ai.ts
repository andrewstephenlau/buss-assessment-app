import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "./types";

export async function generateQuestionsFromText(text: string): Promise<Question[]> {
  // !!! CRITICAL STEP !!!
  // We are telling the app to grab the key from an 'Environment Variable'
// This is the SAFE way! (NOTE: This variable name may vary, like process.env.REACT_APP_...)
// Look for the key in the standard Vite location (import.meta.env)
let API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

// FALLBACK CHECK: If the key is undefined here, your build process might not be
// injecting it properly, or it's being set in a way that is hard to access.
// We will now rely on the user to ensure the key is correctly set in Netlify.
// We must remove the explicit failure check to allow the GoogleGenAI client 
// to handle the failure if the key is still bad or missing.

// The only reason this code would fail is if the key is bad/missing in Netlify.

// We will keep the alert for the user, but remove the throw, as the 
// GoogleGenAI({ apiKey: API_KEY }) line will throw its own error if the key is truly invalid.

if (!API_KEY) { 
    // This alert confirms the code is running and the variable is missing from the build.
    alert("CRITICAL BUILD ERROR: API Key was not injected into the final application files by Netlify."); 
}

// Proceed to initialize the AI client. If API_KEY is undefined or bad, 
// the new GoogleGenAI() call will fail with a more specific error,
// which is what we want now.

// Note: If you have confirmed the key is correct in Netlify, the issue is that 
// your local build environment (or Vite) is not handling the variable substitution correctly.

  // We initialize the AI here (inside the function) so the app doesn't crash 
  // if the key is missing when the page first loads.
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert assessment creator. 
      Extract exactly 20 multiple choice questions from the provided text.
      If the text is not sufficient for 20 questions, generate relevant questions based on the topic of the text to reach 20.
      Ensure the questions are challenging but fair.
      Return the output strictly as a JSON array.`,
      config: {
        systemInstruction: `Input text: "${text.substring(0, 30000)}..."`, // Truncate to avoid token limits
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique UUID for question" },
              text: { type: Type.STRING, description: "The question text" },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Option ID (e.g. 'a', 'b')" },
                    text: { type: Type.STRING, description: "The option text" },
                  },
                  required: ["id", "text"],
                },
              },
              correctOptionId: { type: Type.STRING, description: "The ID of the correct option" },
            },
            required: ["id", "text", "options", "correctOptionId"],
          },
        },
      },
    });

    const questions = JSON.parse(response.text || "[]");
    
    // Safety check to ensure we have IDs if the AI missed them (rare)
    return questions.map((q: any, index: number) => ({
      ...q,
      id: q.id || `q-${index}-${Date.now()}`,
      options: q.options.map((o: any, oIndex: number) => ({
        ...o,
        id: o.id || `opt-${index}-${oIndex}`
      }))
    }));

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate questions. " + (error.message || "Unknown error"));
  }
}
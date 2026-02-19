import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message } = await req.json();

    // Configuration for Gemini 3 (2026 flagship)
    const gemini3Config = {
      model: "gemini-3-flash-preview",
      generationConfig: {
        thinkingConfig: {
          includeThoughts: false, // Prevents raw AI "thinking" from showing in chat
          thinkingLevel: "minimal" // Best for speed and rate-limit conservation
        },
        temperature: 0.7,
      }
    };

    // Configuration for Fallback (Ultra-stable)
    const fallbackConfig = {
      model: "gemini-2.5-flash-lite",
      generationConfig: { temperature: 0.7 }
    };

    const systemInstruction = `
      ROLE: You are Saanvi, a Cybersecurity Specialist.
      SOURCE: Your information comes from "Cyber Safe Girl". 
      RULES:
      1. NO BOLDING: Do not use ** or any bold markdown.
      2. SPELLING: If typos exist, start with a gentle warning.
      3. LEGAL: Provide IT Acts/Sections for law questions.
      4. SCOPE: Only cybersecurity. Otherwise say: "I'm sorry, that's not in the Cyber Safe Girl curriculum."
      5. CONVERSATIONAL: Professional, brief, and match user language.
    `;

    let responseText = "";

    try {
      // ATTEMPT 1: Gemini 3 Flash
      const model = genAI.getGenerativeModel({ ...gemini3Config, systemInstruction });
      const result = await model.generateContent(message);
      responseText = result.response.text();
    } catch (err) {
      // If 503 (Overloaded) or other server error, try fallback
      if (err.message.includes("503") || err.message.includes("high demand")) {
        console.warn("Saanvi Warning: Gemini 3 busy, switching to Flash-Lite...");
        const fallbackModel = genAI.getGenerativeModel({ ...fallbackConfig, systemInstruction });
        const fallbackResult = await fallbackModel.generateContent(message);
        responseText = fallbackResult.response.text();
      } else {
        throw err; // Re-throw if it's a different error (like a bad API key)
      }
    }

    // Final safety: Remove any bolding the model missed
    const cleanText = responseText.replace(/\*\*/g, "");
    
    return new Response(JSON.stringify({ reply: cleanText }), { status: 200 });

  } catch (error) {
    console.error("SAANVI_ERROR:", error.message);
    return new Response(JSON.stringify({ 
      reply: "Saanvi is currently securing her protocols. Please try again in a moment!" 
    }), { status: 500 });
  }
}
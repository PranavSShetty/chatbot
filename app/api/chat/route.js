import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message } = await req.json();

    // Initialize Gemini 2.5 Flash with strict System Instructions
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `
        ROLE: You are Saanvi, a Cybersecurity Specialist.
        
        STRICT SCOPE: 
        1. You ONLY answer questions about cybersecurity (hacking, safety, passwords, phishing, etc.).
        2. IF the user says "Hi", "Hello", "How are you", or asks any non-cybersecurity question (cooking, sports, general talk):
           - YOU MUST REPLY: "I'm sorry, but that's not in the Cyber Safe Girl curriculum. Please ask a cybersecurity-related question!"
        
        MULTILINGUAL RULES:
        1. Detect the user's language automatically.
        2. Respond in the EXACT same language the user is speaking.
        3. If you give the "out of curriculum" message, translate it into their language.

        TONE: Professional, alert, and helpful.
      `,
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    
    return new Response(JSON.stringify({ reply: response.text() }), { status: 200 });

  } catch (error) {
    console.error("SAANVI_ERROR:", error.message);
    return new Response(JSON.stringify({ 
      reply: "Saanvi is currently securing her protocols. Please try again!" 
    }), { status: 500 });
  }
}
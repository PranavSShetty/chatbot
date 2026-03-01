import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from '@pinecone-database/pinecone';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.Index("cyber-safe-girl");

export async function POST(req) {
  try {
    const { message } = await req.json();

    // 1. Get embedding for the user's message
    const queryEmbedding = await pc.inference.embed({
      model: "multilingual-e5-large",
      inputs: [message],
      parameters: { input_type: "query" }
    });
    const vectorValues = queryEmbedding.data[0].values;

    // 2. Search Pinecone for context
    const queryResponse = await index.query({
      vector: vectorValues,
      topK: 15, // Greatly increased to 15 to capture adjacent document paragraphs
      includeMetadata: true
    });

    const retrievedContext = queryResponse.matches
      .map((match) => match.metadata.text)
      .join("\n\n---\n\n");

    // 3. Setup Model - We use 'gemini-2.5-flash' based on API key availability
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. Construct the Prompt (Everything in one string to avoid 400 errors)
    const finalPrompt = `
      ROLE: You are Saanvi, an expert Cybersecurity Specialist.
      KNOWLEDGE: Use the context from "Cyber Safe Girl Version 7.0" by Dr. Ananth Prabhu Gurpur.
      LEGAL: Use BNS (not IPC), BNSS (not CrPC), and BSA (not IEA).
      RULES: 
      - Answer ONLY using the context.
      - If you can only partially answer the question, provide what you know and STOP. Do NOT add the failure message if you found any part of the answer.
      - If the ENTIRE answer is completely missing from the context, say exactly: "Saanvi doesn't have that record in the handbook."
      - NO BOLDING (**) in your response.
      
      CONTEXT:
      ${retrievedContext}

      QUESTION:
      ${message}
    `;

    // 5. Generate Response
    const result = await model.generateContent(finalPrompt);
    const responseText = result.response.text();
    const cleanText = responseText.replace(/\*\*/g, "");

    return new Response(JSON.stringify({ reply: cleanText }), { status: 200 });

  } catch (error) {
    console.error("SAANVI_FINAL_ERROR:", error.message);
    return new Response(JSON.stringify({
      reply: "Saanvi is analyzing the records. Please try again!"
    }), { status: 500 });
  }
}
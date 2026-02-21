import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message } = await req.json();

    // 1. Path to your PDF file in the project
    const pdfPath = path.join(process.cwd(), "Cyber_Safe_Girl_7.0.pdf");
    
    // 2. Read the file and convert it to Base64
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString("base64");

    const gemini3Config = {
      model: "gemini-3-flash-preview",
      generationConfig: {
        thinkingConfig: { includeThoughts: false, thinkingLevel: "minimal" },
        temperature: 0.7,
      }
    };

    const systemInstruction = `
      ROLE: You are Saanvi, a Cybersecurity Specialist.
      KNOWLEDGE: Strictly use the provided "Cyber Safe Girl Version 7.0" PDF.
      LEGAL: Use BNS (not IPC), BNSS (not CrPC), and BSA (not IEA).
      RULES: NO BOLDING (**), check user spelling, professional tone.
      AUTHOR: Dr. Ananth Prabhu Gurpur.
    `;

    const model = genAI.getGenerativeModel({ ...gemini3Config, systemInstruction });

    // 3. Send the PDF + User Message
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBase64
        }
      },
      { text: message }
    ]);

    const responseText = result.response.text();
    const cleanText = responseText.replace(/\*\*/g, ""); 
    
    return new Response(JSON.stringify({ reply: cleanText }), { status: 200 });

  } catch (error) {
    console.error("SAANVI_ERROR:", error.message);
    return new Response(JSON.stringify({ 
      reply: "Saanvi is analyzing the database. Please try again!" 
    }), { status: 500 });
  }
}
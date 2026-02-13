import { GoogleAIFileManager } from "@google/generative-ai/server";
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Use the exact filename from your directory listing: Cyber_Safe_Girl_7.0.pdf
const filePath = path.join(__dirname, "Cyber_Safe_Girl_7.0.pdf"); 

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

async function uploadFile() {
  try {
    console.log("Checking file at:", filePath);
    
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: "Cyber Safe Girl Handbook v7",
    });

    console.log(`✅ File Uploaded successfully!`);
    console.log(`New URI: ${uploadResult.file.uri}`);
    console.log("--------------------------------------------------");
    console.log("Copy the New URI above and paste it into your route.js");
  } catch (error) {
    console.error("Upload Error:", error.message);
  }
}

uploadFile();

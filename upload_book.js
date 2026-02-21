const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");

async function upload() {
  // 1. Read the file
  const fileData = fs.readFileSync("cybersafegirl_7.pdf").toString("base64");
  
  // 2. Upload to Google File API
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  const result = await model.generateContent([
    { inlineData: { data: fileData, mimeType: "application/pdf" } },
    "Please analyze this book and summarize the key BNS sections mentioned."
  ]);

  console.log("Book Processed! Saanvi is now ready.");
  console.log(result.response.text());
}

upload();
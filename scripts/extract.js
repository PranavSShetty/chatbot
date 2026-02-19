import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const pdfPath = "./Cyber_Safe_Girl_7.0.pdf";

async function extractPDF() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const pdf = await pdfjsLib.getDocument({ data }).promise;

  console.log("Successfully opened PDF! Pages:", pdf.numPages);

  let structuredChunks = [];
  let currentChapter = "INTRODUCTION";

  function detectChapter(pageText) {
  const lines = pageText.split(/\n|\r/);

  for (let line of lines) {
    line = line.trim();

    // Only check first few lines of page
    if (line.length > 8 &&
        /^[A-Z\s]+$/.test(line) &&
        !line.includes("CYBER SAFE GIRL") &&
        !line.match(/^\d+$/)
    ) {
      return line;
    }
  }

  return null;
}

  function chunkText(text, chunkSize = 1000, overlap = 150) {
    let chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items.map(item => item.str).join(" ");

    const foundChapter = detectChapter(pageText);
    if (foundChapter) {
      currentChapter = foundChapter;
    }

    const smallChunks = chunkText(pageText);

    smallChunks.forEach(chunk => {
      structuredChunks.push({
        content: chunk,
        metadata: {
          page: i,
          chapter: currentChapter,
        },
      });
    });
  }

  fs.writeFileSync(
    "./processed_chunks.json",
    JSON.stringify(structuredChunks, null, 2)
  );

  console.log("Extraction complete with proper chapter detection ✅");
}

extractPDF();

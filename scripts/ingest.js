import fs from "fs";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

const chunks = JSON.parse(
  fs.readFileSync("./processed_chunks.json", "utf-8")
);

for (const chunk of chunks) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunk.content,
  });

  const embedding = embeddingResponse.data[0].embedding;

  await supabase.from("cyber_safe_chunks").insert({
    content: chunk.content,
    chapter: chunk.metadata.chapter,
    page: chunk.metadata.page,
    embedding,
  });

  console.log("Inserted page:", chunk.metadata.page);
}

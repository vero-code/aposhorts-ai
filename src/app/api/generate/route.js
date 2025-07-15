// src/app/api/generate/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  const { movies } = await req.json();

  console.log("generate/route -> Received movies from Qloo:", JSON.stringify(movies, null, 2));

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const movieNames = movies
    .map((m) => m.title)
    .join(", ");

  const prompt = `Give a creative description based on these movies: ${movieNames}. Answer very briefly.`;
  console.log("generate/route -> Final prompt:", prompt);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ result: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return new Response(JSON.stringify({ error: "Gemini error" }), {
      status: 500,
    });
  }
}
// src/app/api/generate/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  const { insights } = await req.json();

  // console.log("generate/route -> Received insights from Qloo:", JSON.stringify(insights, null, 2));

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const tasteProfileString = JSON.stringify(insights, null, 2);

  const prompt = `
    You are "ApoShorts AI", an AI scriptwriter that creates short, cinematic, and deeply personal apocalypse scenarios.
    Your task is to analyze a person's "cultural profile" based on their tastes and write a synopsis for a short film about the end of the world based on it.
    The scenario should not be about zombies or asteroids, but about a metaphorical, symbolic collapse that reflects the inner world and aesthetics of this person. It should sound like "their life, but on the verge of collapse".

    Here is the cultural profile I received from the Qloo API. It contains the person's interests and related entities (movies, music, books, etc.):
    \`\`\`json
    ${tasteProfileString}
    \`\`\`

    Your task:
    1.  **Analyze the profile:** Find key themes, moods, genres, and recurring motifs (e.g., melancholy, noir, techno, nature, surrealism, vintage, etc.).
    2.  **Create a concept:** What would the "personal apocalypse" be for this person? If they love raves in Berlin and Gaspar Noé, perhaps their end of the world is an eternal, deafening party with no escape. If they love knitting and Earl Grey tea, perhaps the world around them is literally "unraveling at the seams". Be creative.
    3.  **Write the script:** Create a short but atmospheric text.

    The output must be in English and strictly in the following Markdown format:

    ### [Come up with a catchy title for the film]

    **Logline:** [Write a single sentence describing the film's essence.]

    **Synopsis:** [Write 2-3 paragraphs describing the setup, atmosphere, and central conflict. Describe the world, the protagonist (without naming them, using 'He' or 'She'), and how their personal apocalypse manifests visually and emotionally.]
  `;

  // console.log("generate/route -> Final prompt:", prompt);

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
      headers: { "Content-Type": "application/json" },
    });
  }
}
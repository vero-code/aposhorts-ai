// src/app/api/video/route.js
import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

const MODEL = "zsxkib/animate-diff:269a616c8b0c2bbc12fc15fd51bb202b11e94ff0f7786c026aa905305c4ed9fb";

export async function POST(req) {
  const { prompt } = await req.json();

  if (!process.env.REPLICATE_API_KEY) {
    console.error("❌ Missing REPLICATE_API_KEY in environment.");
    return NextResponse.json({ error: 'Server misconfiguration: missing token.' }, { status: 500 });
  }

  if (!prompt || prompt.trim() === "") {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  try {
    const input = {
      width: 512,
      height: 512,
      prompt: prompt,
      negative_prompt: "",
      num_frames: 16,
      guidance_scale: 7.5,
      fps: 8
    };

    const output = await replicate.run(MODEL, { input });

    if (Array.isArray(output) && output.length > 0) {
      return NextResponse.json({ url: output[0] });
    } else {
      throw new Error("No output returned from Replicate");
    }

  } catch (err) {
    console.error("❌ Replicate API error:", err);
    return NextResponse.json({ error: err.message || 'Replicate API error' }, { status: 500 });
  }
}
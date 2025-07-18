import { NextResponse } from 'next/server';
import axios from 'axios';

const POLLO_API_URL = 'https://pollo.ai/api/platform/generation/pollo/pollo-v1-6';
const POLLO_API_KEY = process.env.POLLO_API_KEY;

export async function POST(req) {
  const { prompt } = await req.json();

  if (!POLLO_API_KEY) {
    console.error('POLLO_API_KEY is not set.');
    return NextResponse.json({ error: 'Pollo API key is missing in environment config.' }, { status: 500 });
  }

  const requestBody = {
    input: {
      prompt: prompt,
      resolution: '480p',
      length: 5,
      seed: 123,
    }
  };

  try {
    const response = await axios.post(POLLO_API_URL, requestBody, {
      headers: {
        'x-api-key': POLLO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const { taskId, status } = response.data;

    if (!taskId) {
      throw new Error(`API call succeeded but no taskId returned. Full response: ${JSON.stringify(response.data)}`);
    }

    return NextResponse.json({ taskId, status });

  } catch (error) {
    console.error('Pollo API error:', error.response?.data || error.message);

    const errorMsg = error.response?.data?.message || 'Unknown error';
    const statusCode = error.response?.status || 500;

    return NextResponse.json({ error: errorMsg }, { status: statusCode });
  }
}

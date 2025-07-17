// src/app/api/video/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const RUNWAY_API_BASE_URL = 'https://api.dev.runwayml.com';
const RUNWAY_API_VERSION = '2024-11-06'; // Current version from documentation
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

// Use a static stub
const DEFAULT_PROMPT_IMAGE_URL = "https://images.qloo.com/i/F264759D-A11B-45B7-B29B-7439B98870CD-420x-auto.jpg";

export async function POST(req) {
  const { prompt } = await req.json();

  if (!RUNWAY_API_KEY) {
    console.error('RUNWAY_API_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: RunwayML API key missing.' }, { status: 500 });
  }

  const requestBody = {
    promptImage: DEFAULT_PROMPT_IMAGE_URL,
    prompt_text: prompt,
    model: 'gen4_turbo',
    duration: 5,
    ratio: '1104:832',
  };

  try {
    // 1. Sending a request to generate a video
    const generateResponse = await axios.post(
      `${RUNWAY_API_BASE_URL}/v1/image_to_video`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RUNWAY_API_KEY}`,
          'X-Runway-Version': RUNWAY_API_VERSION,
        },
      }
    );

    const { id: taskId } = generateResponse.data;
    console.log(`[RunwayML API]: Video generation started. Task ID: ${taskId}`);

    // 2. Poll task status
    let videoUrl = null;
    let status = '';
    const maxAttempts = 60;
    const pollInterval = 5 * 1000;

    for (let i = 0; i < maxAttempts && status !== 'completed' && status !== 'failed'; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      const statusResponse = await axios.get(
        `${RUNWAY_API_BASE_URL}/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${RUNWAY_API_KEY}`,
            'X-Runway-Version': RUNWAY_API_VERSION,
          },
        }
      );
      status = statusResponse.data.status;
      console.log(`[RunwayML API]: Task ${taskId} status: ${status}`);

      if (status === 'completed') {
        videoUrl = statusResponse.data.output_url || (statusResponse.data.outputs && statusResponse.data.outputs[0] && statusResponse.data.outputs[0].url);
        break;
      } else if (status === 'failed') {
        const errorMessage = statusResponse.data.error_message || 'Unknown error';
        console.error(`[RunwayML API]: Video generation failed for task ${taskId}: ${errorMessage}`);
        return NextResponse.json({ error: `Video generation failed: ${errorMessage}` }, { status: 500 });
      }
    }

    if (!videoUrl) {
      console.error(`[RunwayML API]: Video generation timed out for task ${taskId}.`);
      return NextResponse.json({ error: 'Video generation timed out.' }, { status: 500 });
    }

    return NextResponse.json({ url: videoUrl });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('RunwayML API Error:', error.response ? error.response.data : error.message);
      const apiError = error.response ? error.response.data : { error: 'Unknown API error' };

      if (apiError.error && apiError.error.includes('credits')) {
        return NextResponse.json({ error: 'You do not have enough credits to generate this video. Please check your RunwayML account.', detail: apiError.error }, { status: 403 });
      }

      return NextResponse.json({ error: apiError.error || 'RunwayML API error', detail: apiError }, { status: error.response ? error.response.status : 500 });
    } else {
      console.error('Unexpected error during video generation:', error);
      return NextResponse.json({ error: 'An unexpected error occurred during video generation.' }, { status: 500 });
    }
  }
}
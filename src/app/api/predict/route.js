// src/app/api/predict/route.js
import { QLOO_BASE_URL, QLOO_ENTITY_MOVIE, GENRE_TAGS } from '@/lib/qloo';

export async function POST(req) {
  const apiKey = process.env.QLOO_API_KEY;
  const { genre } = await req.json();

  const genreTag = GENRE_TAGS[genre] || GENRE_TAGS.comedy;

  const qlooUrl = `${QLOO_BASE_URL}?filter.type=${QLOO_ENTITY_MOVIE}&filter.tags=${genreTag}`;
  console.log("qlooUrl -> ", qlooUrl);

  try {
    const qlooRes = await fetch(qlooUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
    });

    const text = await qlooRes.text();

    try {
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), {
        status: qlooRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (jsonErr) {
      console.error('Error parsing JSON from Qloo:', text);
      return new Response(JSON.stringify({ error: 'Invalid JSON from Qloo' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (err) {
    console.error('Request to Qloo failed:', err);
    return new Response(JSON.stringify({ error: 'Request to Qloo failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

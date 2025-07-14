// src/app/api/predict/route.js
export async function POST(req) {
  const apiKey = process.env.QLOO_API_KEY;

  const qlooUrl = 'https://hackathon.api.qloo.com/v2/insights/?filter.type=urn:entity:movie&filter.tags=urn:tag:genre:media:comedy';

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
      console.error('Error parsing JSON:', text);
      return new Response(JSON.stringify({ error: 'Invalid JSON from Qloo' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (err) {
    console.error('Error while querying Qloo:', err);
    return new Response(JSON.stringify({ error: 'Request to Qloo failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

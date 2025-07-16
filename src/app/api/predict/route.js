// src/app/api/predict/route.js
import { QLOO_BASE_URL, QLOO_ENTITY_MOVIE, GENRE_TAGS } from '@/lib/qloo';

export async function POST(req) {
  const apiKey = process.env.QLOO_API_KEY;
  const { genre } = await req.json();

  const genreTag = GENRE_TAGS[genre] || GENRE_TAGS.comedy;

  const qlooUrl = `${QLOO_BASE_URL}?filter.type=${QLOO_ENTITY_MOVIE}&filter.tags=${genreTag}`;
  // console.log("predict/route -> ", qlooUrl);

  try {
    const qlooRes = await fetch(qlooUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
    });

    const { results } = await qlooRes.json();

    const simplified = results.entities.slice(0, 5).map(entity => ({
      title: entity.name,
      year: entity.properties.release_year,
      description: entity.properties.description,
      image: entity.properties.image?.url,
    }));

    return new Response(JSON.stringify(simplified), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Qloo API Error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch or format results' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// src/app/api/resolve-entities/route.js
export async function POST(req) {
  const apiKey = process.env.QLOO_API_KEY;
  const rawTastes = await req.json();

  const resolvedEntities = [];

  for (const taste of rawTastes) {
    try {
      const query = encodeURIComponent(taste.value);
      const url = `https://hackathon.api.qloo.com/search?query=${query}`;

      const searchRes = await fetch(url, {
        headers: {
          'X-Api-Key': apiKey,
        },
      });

      if (!searchRes.ok) {
        const errorText = await searchRes.text();
        console.error(`Error from Qloo Search API for "${taste.value}": ${searchRes.status} - ${errorText}`);
        continue;
      }

      const searchData = await searchRes.json();
      const entities = searchData.results || [];

      const found = entities.find(e => {
        const allTypes = [...(e.types || []), ...(e.subtype || [])];
        const targetUrn = `urn:entity:${taste.category}`;
        return allTypes.includes(targetUrn);
      });

      if (found) {
        resolvedEntities.push({
          entity_id: found.entity_id,
          name: found.name,
          category: taste.category,
        });
      } else {
        console.warn(`❌ Not found for: ${taste.value} (${taste.category})`);
      }
    } catch (err) {
      console.error(`Error while resolving "${taste.value}":`, err);
    }
  }

  // console.log("🎯 Final resolved entities:", JSON.stringify(resolvedEntities, null, 2));

  return new Response(JSON.stringify({ resolvedEntities }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

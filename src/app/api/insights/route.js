// src/app/api/insights/route.js
export async function POST(req) {
  const apiKey = process.env.QLOO_API_KEY;
  const resolvedEntities = await req.json();

  // console.log("📥 Received resolvedEntities:", JSON.stringify(resolvedEntities, null, 2));

  const insights = [];

  for (const entity of resolvedEntities) {
    const filterType = `urn:entity:${entity.category}`;
    const signalEntity = entity.entity_id;
    const url = `https://hackathon.api.qloo.com/v2/insights?filter.type=${filterType}&signal.interests.entities=${signalEntity}`;

    // console.log(`🌐 Request for insight: ${url}`);

    try {
      const res = await fetch(url, {
        headers: {
          'X-Api-Key': apiKey,
        },
      });

      const data = await res.json();

      const processedResults = {
        entities: (data.results?.entities || []).map(insightEntity => ({
          name: insightEntity.name,
          entity_id: insightEntity.entity_id,
          type: insightEntity.type,
          subtype: insightEntity.subtype,
          properties: {
            description: insightEntity.properties?.description,
            image: insightEntity.properties?.image,
          },
        })),
      };

      insights.push({
        name: entity.name,
        category: entity.category,
        entity_id: entity.entity_id,
        insights: processedResults,
      });

      // console.log(`✅ Insights were obtained for ${entity.name}:`, JSON.stringify(data.results, null, 2));
    } catch (err) {
      console.error(`❌ Error requesting insight for ${entity.name}:`, err);
    }
  }

  return new Response(JSON.stringify({ insights }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

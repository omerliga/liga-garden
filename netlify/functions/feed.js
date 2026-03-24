// netlify/functions/feed.js
exports.handler = async (event) => {
  const API_KEY        = process.env.AIRTABLE_API_KEY;
  const BASE_ID        = process.env.AIRTABLE_BASE_ID;
  const TABLE_ID       = process.env.AIRTABLE_TABLE_ID;
  const CLIENTS_TABLE  = 'Clients';

  const client = event.queryStringParameters?.client || '';

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // 1. שליפת תמונת פרופיל של הלקוח
    let profilePhoto = null;
    let clientName   = client;
    if (client) {
      const cParams = new URLSearchParams({
        filterByFormula: `FIND(LOWER("${client}"), LOWER({Client Name})) > 0`,
        maxRecords: 1,
      });
      const cResp = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${CLIENTS_TABLE}?${cParams}`,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
      if (cResp.ok) {
        const cData = await cResp.json();
        const rec   = cData.records?.[0];
        if (rec) {
          clientName   = rec.fields['Client Name'] || client;
          profilePhoto = rec.fields['Profile Photo']?.[0]?.url || null;
        }
      }
    }

    // 2. שליפת רשומות הפיד
    let formula = `{Active}=TRUE()`;
    if (client) {
      formula = `AND({Active}=TRUE(),FIND("${client}",ARRAYJOIN({Client},",")))`;
    }

    const params = new URLSearchParams({
      'sort[0][field]':     'Date',
      'sort[0][direction]': 'desc',
      filterByFormula:      formula,
    });

    const resp = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?${params}`,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return { statusCode: resp.status, headers, body: JSON.stringify({ error: err }) };
    }

    const data = await resp.json();

    return {
      statusCode: 200,
      headers: { ...headers, 'Cache-Control': 'public, max-age=30' },
      body: JSON.stringify({
        records:      data.records || [],
        profilePhoto,
        clientName,
      }),
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

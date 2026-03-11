// netlify/functions/feed.js
// This runs on Netlify's server — no CORS issues, API key is hidden

exports.handler = async (event) => {
  const API_KEY  = process.env.AIRTABLE_API_KEY;
  const BASE_ID  = process.env.AIRTABLE_BASE_ID;
  const TABLE_ID = process.env.AIRTABLE_TABLE_ID;

  const client = event.queryStringParameters?.client || '';

  let formula = `{Active}=TRUE()`;
  if (client) {
    formula = `AND({Active}=TRUE(),{Client}="${client}")`;
  }

  const params = new URLSearchParams({
    'sort[0][field]':     'Date',
    'sort[0][direction]': 'desc',
    'filterByFormula':    formula,
  });

  try {
    const resp = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?${params}`,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return {
        statusCode: resp.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: err }),
      };
    }

    const data = await resp.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30', // cache 30s
      },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message }),
    };
  }
};

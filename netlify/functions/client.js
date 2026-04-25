// netlify/functions/client.js

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { id } = event.queryStringParameters || {};
    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id' }) };
    }

    const formula = encodeURIComponent(`FIND(LOWER("${id}"), LOWER({Client Name})) > 0`);
    const fields = [
      'Client Name', 'Profile Photo', 'Gardens', 'Package',
      'Contract URL', 'Email Address', 'Phone Number', 'Serial Number'
    ];
    const fieldParams = fields.map(f => `fields[]=${encodeURIComponent(f)}`).join('&');

    const resp = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Clients?filterByFormula=${formula}&maxRecords=1&${fieldParams}`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    const data = await resp.json();
    console.log('Client lookup for:', id, '→', data.records?.length, 'records');

    if (!data.records || !data.records.length) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Client not found' }) };
    }

    const f = data.records[0].fields;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        name:         f['Client Name']    || '',
        photo:        f['Profile Photo']?.[0]?.url || null,
        gardens:      f['Gardens']        || '',
        package:      f['Package']        || '',
        contractUrl:  f['Contract URL']   || '',
        email:        f['Email Address']  || '',
        phone:        f['Phone Number']   || '',
        hasIrrigation: !!(f['Serial Number'])
      })
    };

  } catch (err) {
    console.error('Client handler error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

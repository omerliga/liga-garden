// netlify/functions/galcon.js

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const GALCON_EMAIL     = process.env.GALCON_EMAIL;
const GALCON_PASSWORD  = process.env.GALCON_PASSWORD;

const GALCON_BASE_URL  = 'https://gsi.galcon-smart.com';

async function getGalconToken() {
  console.log('Logging in to Galcon as:', GALCON_EMAIL);
  const resp = await fetch(`${GALCON_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail: GALCON_EMAIL, password: GALCON_PASSWORD })
  });
  console.log('Galcon login status:', resp.status);
  const data = await resp.json();
  console.log('Galcon login response:', JSON.stringify(data));
  if (!data.token) throw new Error('Failed to get Galcon token: ' + JSON.stringify(data));
  return data.token;
}

async function getClientsWithSerialNumbers() {
  const resp = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Clients?fields[]=Client%20Name&fields[]=Serial%20Number`,
    { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
  );
  const data = await resp.json();
  if (!data.records) throw new Error('Airtable error: ' + JSON.stringify(data));
  return data.records
    .map(r => ({
      name: r.fields['Client Name'] || '',
      serialNumber: r.fields['Serial Number'] || ''
    }))
    .filter(c => c.serialNumber);
}

async function getControllerData(token, serialNumber) {
  const resp = await fetch(`${GALCON_BASE_URL}/api/controllers/${serialNumber}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Controller ${serialNumber} status:`, resp.status);
  const data = await resp.json();
  console.log(`Controller ${serialNumber} response:`, JSON.stringify(data));
  return data;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const [token, clients] = await Promise.all([
      getGalconToken(),
      getClientsWithSerialNumbers()
    ]);

    console.log('Clients with serial numbers:', clients.length);

    const results = await Promise.all(
      clients.map(async (client) => {
        try {
          const data = await getControllerData(token, client.serialNumber);
          return { client: client.name, serialNumber: client.serialNumber, data };
        } catch (err) {
          return { client: client.name, serialNumber: client.serialNumber, error: err.message };
        }
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ controllers: results })
    };

  } catch (err) {
    console.error('Galcon handler error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};

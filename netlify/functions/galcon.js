// netlify/functions/galcon.js

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const GALCON_EMAIL     = process.env.GALCON_EMAIL;
const GALCON_PASSWORD  = process.env.GALCON_PASSWORD;

const GALCON_BASE_URL  = 'https://gsi.galcon-smart.com';

async function getGalconToken() {
  console.log('Logging in to Galcon as:', GALCON_EMAIL);
  const resp = await fetch(`${GALCON_BASE_URL}/api/Auth/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: GALCON_EMAIL, password: GALCON_PASSWORD })
  });
  console.log('Galcon login status:', resp.status);
  const data = await resp.json();
  console.log('Galcon login response:', JSON.stringify(data));
  const token = data && data.Body && data.Body.AccountToken;
  if (!token) throw new Error('Failed to get Galcon token: ' + JSON.stringify(data));
  return token;
}

async function getUserProjects(token) {
  // TODO: replace with exact URL from browser Network tab → UserProjects request
  const resp = await fetch(`${GALCON_BASE_URL}/api/api/UserProjects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('UserProjects status:', resp.status);
  const data = await resp.json();
  console.log('UserProjects response:', JSON.stringify(data));
  return data;
}

async function getProjectInfo(token, projectId) {
  const resp = await fetch(`${GALCON_BASE_URL}/api/api/project/${projectId}/Info`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Project ${projectId} status:`, resp.status);
  const data = await resp.json();
  console.log(`Project ${projectId} response:`, JSON.stringify(data));
  return data;
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

    const projects = await getUserProjects(token);

    const projectList = (projects && projects.Body) || projects || [];
    console.log('Projects count:', Array.isArray(projectList) ? projectList.length : JSON.stringify(projectList));

    const projectInfos = await Promise.all(
      projectList.map(p => getProjectInfo(token, p.ProjectId || p.projectId || p.id))
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ projects: projectInfos, clients })
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

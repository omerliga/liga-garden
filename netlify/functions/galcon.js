// netlify/functions/galcon.js

const GALCON_EMAIL    = process.env.GALCON_EMAIL;
const GALCON_PASSWORD = process.env.GALCON_PASSWORD;
const GALCON_BASE_URL = 'https://gsi.galcon-smart.com';

async function getToken() {
  const resp = await fetch(`${GALCON_BASE_URL}/api/Auth/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: GALCON_EMAIL, password: GALCON_PASSWORD })
  });
  const data = await resp.json();
  const token = data && data.Body && data.Body.AccountToken;
  if (!token) throw new Error('Login failed: ' + JSON.stringify(data));
  return token;
}

async function getUserProjects(token) {
  const resp = await fetch(`${GALCON_BASE_URL}/api/api/project/UserProjects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await resp.json();
  console.log('UserProjects response:', JSON.stringify(data));
  return data;
}

async function getUnitList(token, projectId) {
  const resp = await fetch(`${GALCON_BASE_URL}/api/api/project/${projectId}/UnitList`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await resp.json();
  console.log(`UnitList raw for project ${projectId}:`, JSON.stringify(data));
  console.log(`UnitList Body for project ${projectId}:`, JSON.stringify(data.Body));
  console.log(`UnitList Body type for project ${projectId}:`, typeof data.Body, Array.isArray(data.Body));
  return data.Body || [];
}

async function getUnitData(token, projectId, unitId) {
  const url = `${GALCON_BASE_URL}/api/api/project/${projectId}/${unitId}?ProjectID=${projectId}`;
  console.log('getUnitData URL:', url);
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await resp.json();
  console.log(`Unit ${unitId} response:`, JSON.stringify(data));
  return data;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { unitId, projectId } = event.queryStringParameters || {};

    const token = await getToken();

    if (unitId && projectId) {
      const data = await getUnitData(token, projectId, unitId);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    const projectsData = await getUserProjects(token);
    const projects = (projectsData && projectsData.Body) || [];
    console.log('Projects count:', projects.length, 'first:', JSON.stringify(projects[0]));

    const results = await Promise.all(
      projects.map(async (project) => {
        const units = await getUnitList(token, project.ProjectID);
        return { project, units };
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ projects: results })
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

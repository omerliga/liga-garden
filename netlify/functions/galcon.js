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

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const token = await getToken();

    const projectsData = await getUserProjects(token);
    const projects = (projectsData && projectsData.Body) || projectsData || [];

    const results = await Promise.all(
      projects.map(async (project) => {
        const projectId = project.ProjectId || project.projectId || project.id;
        const units = await getUnitList(token, projectId);
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

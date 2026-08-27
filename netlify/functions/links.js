const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const linksFile = path.join(process.cwd(), 'links.json');

async function readLinks() {
  const contents = await fs.readFile(linksFile, 'utf8');
  const links = JSON.parse(contents);
  return Array.isArray(links) ? links : [];
}

async function writeLinks(links) {
  await fs.writeFile(linksFile, `${JSON.stringify(links, null, 2)}\n`, 'utf8');
}

function response(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  try {
    const links = await readLinks();

    if (event.httpMethod === 'GET') return response(200, links);

    if (event.httpMethod === 'POST') {
      const { destination } = JSON.parse(event.body || '{}');
      let url;
      try { url = new URL(destination); } catch { return response(400, { error: 'Enter a valid HTTP or HTTPS URL.' }); }
      if (!['http:', 'https:'].includes(url.protocol) || destination.length > 2048) {
        return response(400, { error: 'Enter a valid HTTP or HTTPS URL.' });
      }

      let code;
      do { code = crypto.randomBytes(5).toString('base64url').slice(0, 6); }
      while (links.some((link) => link.code === code));
      const link = { id: crypto.randomUUID(), code, destination, clicks: 0, createdAt: new Date().toISOString() };
      links.unshift(link);
      await writeLinks(links);
      return response(201, link);
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.path.split('/').pop();
      const remaining = links.filter((link) => link.id !== id);
      if (remaining.length === links.length) return response(404, { error: 'Link not found.' });
      await writeLinks(remaining);
      return { statusCode: 204, body: '' };
    }

    return response(405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error(error);
    return response(500, { error: 'Netlify cannot write links.json. Local JSON files are read-only on deployed Netlify functions.' });
  }
};

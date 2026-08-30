const fs = require('fs/promises');
const path = require('path');

const linksFile = path.join(process.cwd(), 'data', 'links.json');

async function readLinks() {
  try {
    const contents = await fs.readFile(linksFile, 'utf8');
    const links = JSON.parse(contents);
    return Array.isArray(links) ? links : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeLinks([]);
      return [];
    }
    throw error;
  }
}

async function writeLinks(links) {
  await fs.writeFile(linksFile, `${JSON.stringify(links, null, 2)}\n`, 'utf8');
}

function isValidDestination(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { readLinks, writeLinks, isValidDestination };

const crypto = require('crypto');
const { readLinks, writeLinks, isValidDestination } = require('../lib/links-store');

module.exports = async function handler(req, res) {
  try {
    const links = await readLinks();

    if (req.method === 'GET') return res.status(200).json(links);

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

    const { destination } = req.body || {};
    if (!isValidDestination(destination)) {
      return res.status(400).json({ error: 'Enter a valid HTTP or HTTPS URL, such as https://example.com.' });
    }

    let code;
    do {
      code = crypto.randomBytes(5).toString('base64url').slice(0, 6);
    } while (links.some((link) => link.code === code));

    const link = {
      id: crypto.randomUUID(),
      code,
      destination,
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    links.unshift(link);
    await writeLinks(links);
    return res.status(201).json(link);
  } catch (error) {
    console.error('Links function failed:', error);
    return res.status(500).json({ error: 'Could not access links.json on Vercel.' });
  }
};

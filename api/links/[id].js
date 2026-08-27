const { readLinks, writeLinks } = require('../../lib/links-store');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    const links = await readLinks();
    const remainingLinks = links.filter((link) => link.id !== req.query.id);
    if (remainingLinks.length === links.length) return res.status(404).json({ error: 'Link not found.' });

    await writeLinks(remainingLinks);
    return res.status(204).end();
  } catch (error) {
    console.error('Delete function failed:', error);
    return res.status(500).json({ error: 'Could not access links.json on Vercel.' });
  }
};

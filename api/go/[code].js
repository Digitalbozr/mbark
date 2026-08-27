const fs = require('fs/promises');
const path = require('path');
const { readLinks, writeLinks } = require('../../lib/links-store');

module.exports = async function handler(req, res) {
  const code = req.query.code;
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{6}$/.test(code)) return res.status(404).send('Link not found.');

  try {
    const links = await readLinks();
    const link = links.find((item) => item.code === code);
    if (!link) return res.status(404).send('Link not found.');

    link.clicks += 1;
    await writeLinks(links);
    const page = await fs.readFile(path.join(process.cwd(), 'public', 'redirect.html'), 'utf8');
    const destination = JSON.stringify(link.destination).replace(/</g, '\\u003c');
    return res.status(200).setHeader('Content-Type', 'text/html; charset=UTF-8').send(page.replace('__DESTINATION__', destination));
  } catch (error) {
    console.error('Redirect function failed:', error);
    return res.status(500).send('Unable to open this redirect link.');
  }
};

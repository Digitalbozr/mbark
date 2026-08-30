const fs = require('fs/promises');
const path = require('path');

exports.handler = async (event) => {
  const code = (event.path.split('/').pop() || '').trim();
  if (!/^[A-Za-z0-9_-]{6}$/.test(code)) return notFound();

  try {
    const links = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'links.json'), 'utf8'));
    const link = links.find((item) => item.code === code);
    if (!link) return notFound();

    link.clicks += 1;
    await fs.writeFile(path.join(process.cwd(), 'data', 'links.json'), `${JSON.stringify(links, null, 2)}\n`, 'utf8');
    const page = await fs.readFile(path.join(process.cwd(), 'public/redirect.html'), 'utf8');
    const destination = JSON.stringify(link.destination).replace(/</g, '\\u003c');
    return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=UTF-8' }, body: page.replace('__DESTINATION__', destination) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Unable to open this redirect link.' };
  }
};

function notFound() {
  return { statusCode: 404, headers: { 'Content-Type': 'text/html; charset=UTF-8' }, body: '<h1>404 - Link not found</h1>' };
}

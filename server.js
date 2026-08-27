const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const LINKS_FILE = path.join(__dirname, 'links.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const CODE_LENGTH = 6;

app.use(express.json({ limit: '10kb' }));
app.use(express.static(PUBLIC_DIR));

async function readLinks() {
  try {
    const contents = await fs.readFile(LINKS_FILE, 'utf8');
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
  const temporaryFile = `${LINKS_FILE}.tmp`;
  await fs.writeFile(temporaryFile, `${JSON.stringify(links, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryFile, LINKS_FILE);
}

function createCode() {
  return crypto.randomBytes(5).toString('base64url').slice(0, CODE_LENGTH);
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

app.get('/admin', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

app.get('/api/links', async (req, res) => {
  try {
    const links = await readLinks();
    res.json(links);
  } catch (error) {
    console.error('Could not read links:', error);
    res.status(500).json({ error: 'Could not load links.' });
  }
});

app.post('/api/links', async (req, res) => {
  const { destination } = req.body;

  if (!isValidDestination(destination)) {
    return res.status(400).json({
      error: 'Enter a valid HTTP or HTTPS URL, such as https://example.com.'
    });
  }

  try {
    const links = await readLinks();
    let code;
    do {
      code = createCode();
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
    res.status(201).json(link);
  } catch (error) {
    console.error('Could not create link:', error);
    res.status(500).json({ error: 'Could not create the redirect link.' });
  }
});

app.delete('/api/links/:id', async (req, res) => {
  try {
    const links = await readLinks();
    const remainingLinks = links.filter((link) => link.id !== req.params.id);

    if (remainingLinks.length === links.length) {
      return res.status(404).json({ error: 'Link not found.' });
    }

    await writeLinks(remainingLinks);
    res.status(204).end();
  } catch (error) {
    console.error('Could not delete link:', error);
    res.status(500).json({ error: 'Could not delete the link.' });
  }
});

app.get('/go/:code', async (req, res) => {
  const code = req.params.code;

  if (!/^[A-Za-z0-9_-]{6}$/.test(code)) {
    return res.status(404).sendFile(path.join(PUBLIC_DIR, 'not-found.html'));
  }

  try {
    const links = await readLinks();
    const link = links.find((item) => item.code === code);

    if (!link) {
      return res.status(404).sendFile(path.join(PUBLIC_DIR, 'not-found.html'));
    }

    link.clicks += 1;
    await writeLinks(links);
    const redirectPage = await fs.readFile(path.join(PUBLIC_DIR, 'redirect.html'), 'utf8');
    const destinationJson = JSON.stringify(link.destination).replace(/</g, '\\u003c');
    res.type('html').send(redirectPage.replace('__DESTINATION__', destinationJson));
  } catch (error) {
    console.error('Could not open link:', error);
    res.status(500).send('Unable to open this redirect link.');
  }
});

app.listen(PORT, () => {
  console.log(`URL redirect system running at http://localhost:${PORT}`);
});

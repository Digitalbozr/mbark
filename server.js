const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// استيراد Firestore store
const linksStore = require('./lib/firestore-links-store');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const CODE_LENGTH = 6;

app.use(express.json({ limit: '10kb' }));
app.use(express.static(PUBLIC_DIR));

function createCode() {
  return crypto.randomBytes(5).toString('base64url').slice(0, CODE_LENGTH);
}

async function generateUniqueCode() {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = createCode();
    const existingLink = await linksStore.getLinkByCode(code);
    isUnique = !existingLink;
  }
  
  return code;
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
    const links = await linksStore.readLinks();
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
    const code = await generateUniqueCode();
    
    const link = await linksStore.createLink({
      code,
      destination,
      id: crypto.randomUUID()
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Could not create link:', error);
    res.status(500).json({ error: 'Could not create the redirect link.' });
  }
});

app.delete('/api/links/:id', async (req, res) => {
  try {
    const link = await linksStore.getLinkById(req.params.id);

    if (!link) {
      return res.status(404).json({ error: 'Link not found.' });
    }

    await linksStore.deleteLink(req.params.id);
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
    const link = await linksStore.getLinkByCode(code);

    if (!link) {
      return res.status(404).sendFile(path.join(PUBLIC_DIR, 'not-found.html'));
    }

    // تحديث عدد النقرات بشكل غير متزامن
    linksStore.updateLink(link.id, {
      clicks: (link.clicks || 0) + 1
    }).catch(error => console.error('Could not update clicks:', error));

    const redirectPage = await fs.readFile(path.join(PUBLIC_DIR, 'redirect.html'), 'utf8');
    const destinationJson = JSON.stringify(link.destination).replace(/</g, '\\u003c');
    res.type('html').send(redirectPage.replace('__DESTINATION__', destinationJson));
  } catch (error) {
    console.error('Could not open link:', error);
    res.status(500).send('Unable to open this redirect link.');
  }
});

app.listen(PORT, () => {
  console.log(`✓ URL redirect system running at http://localhost:${PORT}`);
  console.log(`✓ Admin panel: http://localhost:${PORT}/admin`);
});

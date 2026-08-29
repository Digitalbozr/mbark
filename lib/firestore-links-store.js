const { db, admin } = require('../firebase');

const LINKS_COLLECTION = 'links';

async function readLinks() {
  try {
    const snapshot = await db.collection(LINKS_COLLECTION).get();
    const links = [];
    snapshot.forEach(doc => {
      links.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return links;
  } catch (error) {
    console.error('Error reading links:', error);
    throw error;
  }
}

async function getLinkById(id) {
  try {
    const doc = await db.collection(LINKS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting link:', error);
    throw error;
  }
}

async function createLink(linkData) {
  try {
    const linkId = linkData.id || require('crypto').randomUUID();
    
    await db.collection(LINKS_COLLECTION).doc(linkId).set({
      id: linkId,
      code: linkData.code,
      destination: linkData.destination,
      createdAt: new Date(),
      clicks: 0
    });
    
    return {
      id: linkId,
      code: linkData.code,
      destination: linkData.destination,
      createdAt: new Date(),
      clicks: 0
    };
  } catch (error) {
    console.error('Error creating link:', error);
    throw error;
  }
}

async function updateLink(id, updates) {
  try {
    await db.collection(LINKS_COLLECTION).doc(id).update(updates);
    const doc = await db.collection(LINKS_COLLECTION).doc(id).get();
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error updating link:', error);
    throw error;
  }
}

async function deleteLink(id) {
  try {
    await db.collection(LINKS_COLLECTION).doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting link:', error);
    throw error;
  }
}

async function getLinkByCode(code) {
  try {
    const snapshot = await db.collection(LINKS_COLLECTION)
      .where('code', '==', code)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting link by code:', error);
    throw error;
  }
}

async function incrementClicks(id) {
  try {
    await db.collection(LINKS_COLLECTION).doc(id).update({
      clicks: admin.firestore.FieldValue.increment(1)
    });
  } catch (error) {
    console.error('Error incrementing clicks:', error);
    throw error;
  }
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

module.exports = {
  readLinks,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
  getLinkByCode,
  incrementClicks,
  isValidDestination
};

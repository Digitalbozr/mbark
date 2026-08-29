const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// تهيئة Firebase Admin SDK
// يمكنك استخدام ملف service account أو متغيرات البيئة
let db;

try {
  // محاولة تهيئة Firebase من متغيرات البيئة
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    // محاولة تهيئة Firebase من ملف service account محلي
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || ''
    });
  }

  db = admin.firestore();
  console.log('✓ Firebase initialized successfully');
} catch (error) {
  console.error('✗ Firebase initialization error:', error.message);
  console.error('\nالرجاء القيام بما يلي:');
  console.error('1. قم بتنزيل ملف serviceAccountKey.json من Firebase Console');
  console.error('2. ضعه في جذر المشروع');
  console.error('أو');
  console.error('1. عيّن متغير البيئة FIREBASE_SERVICE_ACCOUNT');
  console.error('2. عيّن متغير البيئة FIREBASE_DATABASE_URL');
  process.exit(1);
}

module.exports = { db, admin };

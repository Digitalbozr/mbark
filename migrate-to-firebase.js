#!/usr/bin/env node
/**
 * ملف مساعد لتهجير البيانات من links.json إلى Firestore
 * الاستخدام: node migrate-to-firebase.js
 */

require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const { db } = require('./firebase');

async function migrateLinksToFirestore() {
  try {
    console.log('🔄 جاري بدء عملية التهجير...\n');

    // قراءة ملف links.json
    const linksFile = path.join(__dirname, 'links.json');
    let links = [];

    try {
      const contents = await fs.readFile(linksFile, 'utf8');
      links = JSON.parse(contents);
      console.log(`✓ تم قراءة ${links.length} رابط من links.json\n`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('⚠️  ملف links.json غير موجود. لا توجد بيانات للتهجير.\n');
        return;
      }
      throw error;
    }

    if (!Array.isArray(links) || links.length === 0) {
      console.log('⚠️  لا توجد روابط للتهجير.\n');
      return;
    }

    // التحقق من الأذونات
    console.log('🔐 جاري التحقق من الأذونات...');
    const testDoc = await db.collection('links').doc('test-migration').get();
    console.log('✓ تم التحقق من الأذونات بنجاح\n');

    // بدء التهجير
    console.log('📤 جاري تهجير الروابط:\n');

    let successCount = 0;
    let errorCount = 0;

    for (const link of links) {
      try {
        const linkId = link.id || require('crypto').randomUUID();
        
        // التحقق من أن الرابط يحتوي على البيانات المطلوبة
        if (!link.code || !link.destination) {
          console.log(`  ✗ تخطيت: رابط بدون code أو destination`);
          errorCount++;
          continue;
        }

        // إضافة الرابط إلى Firestore
        await db.collection('links').doc(linkId).set({
          id: linkId,
          code: link.code,
          destination: link.destination,
          clicks: link.clicks || 0,
          createdAt: link.createdAt ? new Date(link.createdAt) : new Date(),
          migratedAt: new Date()
        });

        console.log(`  ✓ تم تهجير: ${link.code} → ${link.destination}`);
        successCount++;
      } catch (error) {
        console.log(`  ✗ خطأ في تهجير ${link.code}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n🎉 اكتملت عملية التهجير!`);
    console.log(`   ✓ نجح: ${successCount}`);
    console.log(`   ✗ فشل: ${errorCount}\n`);

    if (successCount === links.length) {
      console.log('💡 نصيحة: يمكنك الآن حذف ملف links.json\n');
      console.log('   rm links.json\n');
    }

  } catch (error) {
    console.error('❌ خطأ أثناء التهجير:\n', error.message);
    console.error('\nالرجاء التأكد من:');
    console.error('1. إعدادات Firebase صحيحة');
    console.error('2. ملف serviceAccountKey.json موجود');
    console.error('3. متغيرات البيئة صحيحة\n');
    process.exit(1);
  }
}

// تشغيل المهمة
if (require.main === module) {
  migrateLinksToFirestore();
}

module.exports = { migrateLinksToFirestore };

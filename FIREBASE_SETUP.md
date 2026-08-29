# دليل إعداد Firebase Firestore

## خطوات الإعداد

### 1. إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. انقر على "إنشاء مشروع جديد"
3. أدخل اسم المشروع (مثل: `url-shortener`)
4. اختر منطقتك الجغرافية
5. أكمل عملية الإنشاء

### 2. تفعيل Firestore

1. من لوحة تحكم Firebase، انقر على "Firestore Database"
2. انقر على "إنشاء قاعدة بيانات"
3. ابدأ في الوضع الآمن (Production mode)
4. اختر موقع القاعدة البيانات
5. أكمل الإنشاء

### 3. إنشاء Service Account

**الطريقة 1: تحميل ملف JSON**

1. من Firebase Console، انقر على الترس (⚙️) -> مشروع الإعدادات
2. انقر على علامة تبويب "حسابات الخدمة" (Service Accounts)
3. انقر على "إنشاء مفتاح جديد" (Create New Private Key)
4. سيتم تنزيل ملف JSON
5. ضع الملف في جذر المشروع وأعد تسميته إلى `serviceAccountKey.json`
6. **تنبيه أمان**: أضف هذا الملف إلى `.gitignore`

```bash
echo "serviceAccountKey.json" >> .gitignore
```

**الطريقة 2: استخدام متغيرات البيئة (آمن أكثر)**

1. انسخ محتوى ملف JSON كاملاً
2. في ملف `.env`، أنسخ المحتوى بدون فواصل سطور:

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

### 4. تثبيت المكتبات

```bash
npm install
```

### 5. إعداد متغيرات البيئة

1. انسخ ملف `.env.example` إلى `.env`
2. اِملأ القيم:

```bash
cp .env.example .env
```

3. من Firebase Console، انسخ معرف المشروع (Project ID)
   - يمكنك إيجاده في البريد الإلكتروني للخدمة: `firebase-adminsdk-fbsvc@**mbark-60c12**.iam.gserviceaccount.com`
   - المعرف هو: `mbark-60c12`

4. ستكون `FIREBASE_DATABASE_URL`:

```
https://mbark-60c12.firebaseio.com
```

### 6. بدء التطبيق

```bash
npm start
```

أو في وضع التطوير:

```bash
npm run dev
```

## البنية في Firestore

سيتم إنشاء المجموعة التالية تلقائياً:

### مجموعة `links`

```
links/
├── {linkId}
│   ├── code: string (الكود القصير، مثل "abc123")
│   ├── destination: string (الرابط الكامل)
│   ├── clicks: number (عدد النقرات)
│   ├── createdAt: timestamp (تاريخ الإنشاء)
│   └── id: string (معرف الرابط - UUID)
```

## API Endpoints

### إنشاء رابط جديد
```bash
POST /api/links
Content-Type: application/json

{
  "code": "abc123",
  "destination": "https://example.com"
}
```

### الحصول على جميع الروابط
```bash
GET /api/links
```

### حذف رابط
```bash
DELETE /api/links/{id}
```

### إعادة التوجيه
```bash
GET /go/{code}
```

## استكشاف الأخطاء

### خطأ: "Firebase initialization error"

**الحل:**
- تأكد من وجود `serviceAccountKey.json` في جذر المشروع
- أو تأكد من تعيين `FIREBASE_SERVICE_ACCOUNT` في ملف `.env`

### خطأ: "Permission denied"

**الحل:**
1. اذهب إلى Firebase Console
2. الذهاب إلى Firestore → Rules
3. عدّل القواعس إلى الوضع الآمن:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**ملاحظة**: استخدم بقواعس أكثر أماناً في الإنتاج (Production)

### خطأ: "Quota exceeded"

Firebase توفر درجة مجانية محدودة. تحقق من:
- عدد العمليات القراءة/الكتابة
- حجم تخزين البيانات
- معدل النقل

## الميزات المتقدمة

### 1. إنشاء فهرس (Index)

إذا واجهت خطأ حول الفهرسة:

```
The query requires an index. You can create it here:
https://console.firebase.google.com/v1/r/projects/...
```

انقر على الرابط وأنشئ الفهرس.

### 2. النسخ الاحتياطي والاستعادة

استخدم Google Cloud Backup:

```bash
# في Cloud Shell
gcloud firestore export gs://your-bucket/backup-$(date +%s)
```

### 3. المراقبة والتحليلات

استخدم Firebase Analytics من Console لمراقبة:
- عدد الطلبات
- استهلاك البيانات
- المناطق الجغرافية الأكثر استخداماً

## الأمان

### قواعس موصى بها للإنتاج:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /links/{document=**} {
      // السماح بالقراءة فقط من جانب العميل
      allow read: if true;
      
      // الكتابة والحذف من الخادم فقط
      allow write, delete: if false;
    }
  }
}
```

## مراجع مفيدة

- [وثائق Firebase](https://firebase.google.com/docs)
- [وثائق Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase CLI](https://firebase.google.com/docs/cli)

## الخطوات التالية

1. ✅ تثبيت Firebase SDK
2. ✅ إعداد Firestore
3. ✅ إنشاء Service Account
4. ⏳ تشغيل التطبيق
5. ⏳ تهجير البيانات من `links.json` (إذا لزم الأمر)
6. ⏳ اختبار API endpoints

---

بحاجة إلى مساعدة؟ راجع وثائق Firebase الرسمية أو ارفع مشكلة في المستودع.

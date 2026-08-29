# نظام اختصار الروابط مع Firebase

نظام اختصار روابط قوي مدعوم بـ **Firebase Firestore** لتخزين البيانات بشكل آمن وقابل للتوسع.

## ✨ الميزات

- ✅ اختصار روابط وتحويلها إلى أكواد قصيرة
- ✅ تخزين البيانات على Firebase Firestore (قاعدة بيانات سحابية)
- ✅ لوحة إدارة سهلة الاستخدام
- ✅ تتبع عدد النقرات على كل رابط
- ✅ API RESTful كاملة
- ✅ آمنة وقابلة للتوسع

## 🚀 البدء السريع

### 1. التثبيت

```bash
# تثبيت المكتبات
npm install
```

### 2. إعداد Firebase

اتبع [دليل إعداد Firebase](./FIREBASE_SETUP.md) بالتفصيل

**الخطوات الأساسية:**
1. أنشئ مشروع Firebase من [Firebase Console](https://console.firebase.google.com)
2. فعّل Firestore Database
3. نزّل ملف `serviceAccountKey.json` وضعه في جذر المشروع
4. أنشئ ملف `.env` من `.env.example` وأملأ البيانات

### 3. التشغيل

```bash
# وضع الإنتاج
npm start

# وضع التطوير (مع المراقبة)
npm run dev
```

التطبيق سيعمل على: **http://localhost:3000**

## 📁 البنية

```
├── firebase.js                   # تكوين Firebase
├── server.js                     # خادم Express
├── lib/
│   ├── firestore-links-store.js  # واجهة Firestore
│   └── links-store.js            # (قديم) واجهة الملفات المحلية
├── public/
│   ├── admin.html               # لوحة الإدارة
│   ├── redirect.html            # صفحة إعادة التوجيه
│   └── style.css                # الأنماط
├── migrate-to-firebase.js       # أداة التهجير
├── FIREBASE_SETUP.md            # دليل إعداد Firebase
├── .env.example                 # متغيرات البيئة (مثال)
└── package.json
```

## 🔌 API Endpoints

### الحصول على جميع الروابط
```bash
GET /api/links
```

**الرد:**
```json
[
  {
    "id": "8b16884c-872b-4275-9c51-212ddfe6382a",
    "code": "16CK9-",
    "destination": "https://example.com",
    "clicks": 5,
    "createdAt": "2026-08-27T19:17:07.891Z"
  }
]
```

### إنشاء رابط جديد
```bash
POST /api/links
Content-Type: application/json

{
  "destination": "https://example.com/very/long/url"
}
```

**الرد:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "abc123",
  "destination": "https://example.com/very/long/url",
  "clicks": 0,
  "createdAt": "2026-08-29T10:00:00.000Z"
}
```

### حذف رابط
```bash
DELETE /api/links/{id}
```

### إعادة التوجيه
```
GET /go/{code}
```

يحول الكود إلى الرابط الأصلي ويزيد عدد النقرات.

## 📊 لوحة الإدارة

اذهب إلى: **http://localhost:3000/admin**

**الميزات:**
- عرض جميع الروابط
- إنشاء روابط جديدة
- حذف الروابط
- مشاهدة عدد النقرات

## 🔄 تهجير البيانات

إذا كان لديك بيانات قديمة في `links.json`:

```bash
node migrate-to-firebase.js
```

سيتم نقل جميع الروابط من الملف إلى Firestore تلقائياً.

## 🔐 الأمان

### متغيرات البيئة الحساسة

**تنبيه:** لا تضع بيانات Firebase مباشرة في الكود!

استخدم ملف `.env`:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
PORT=3000
```

### قواعس Firestore

للإنتاج، استخدم قواعس آمنة:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /links/{document=**} {
      // قراءة عامة (اختياري)
      allow read: if request.auth != null;
      
      // كتابة من الخادم فقط
      allow write: if false;
    }
  }
}
```

## 🛠️ استكشاف الأخطاء

### Firebase لا يتهيأ
```
✗ Firebase initialization error
```

**الحل:**
- تأكد من وجود `serviceAccountKey.json` في جذر المشروع
- أو عيّن متغيرات البيئة بشكل صحيح

### خطأ "Permission denied"
```
Error: 7 PERMISSION_DENIED
```

**الحل:**
- اذهب إلى Firestore Console
- الذهاب إلى Rules
- عيّن القواعس إلى وضع الاختبار (Test Mode)

### الاتصال بطيء
- تحقق من الرابط بين الخادم وـ Firebase
- استخدم Firebase Emulator للاختبار المحلي

## 📚 مراجع

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Express.js Guide](https://expressjs.com)
- [Node.js Docs](https://nodejs.org/docs)

## 📝 الترخيص

هذا المشروع مفتوح المصدر تحت رخصة MIT

## 📞 الدعم

بحاجة إلى مساعدة؟
- اقرأ [دليل Firebase](./FIREBASE_SETUP.md)
- تحقق من وثائق Firebase الرسمية
- ارفع issue في المستودع

---

**تم تطويره بـ ❤️ مع Firebase و Express**

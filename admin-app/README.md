# LED LINE™ - Executive Standalone Admin App (Next.js 15 App Router)

تطبيق لوحة التحكم التنفيذية المستقلة بنسبة 100% لمتجر **LED LINE™** لأنظمة الإنارة المعمارية وأخشاب الجدران الديكورية.

---

## 🔒 1. المتطلبات المعمارية والأمنية (Security & Architecture)
1. **الاستقلالية التامة**: هذا المشروع (`admin-app`) عبارة عن تطبيق Next.js App Router مستقل بذاته بالكامل، يمتلك ملفاته الخاصة (`package.json`, `tsconfig.json`, `next.config.mjs`, `app/`, `lib/`, `types/`) دون أي مشاركة لملفات واجهة المتجر.
2. **أمان التوكن المطلق**: توكن الكتابة الخاص بـ Sanity (`SANITY_WRITE_TOKEN`) لا يظهر أبداً في جهة العميل (Browser/Client-side).
3. **نمط BFF (Backend-For-Frontend)**: جميع عمليات التعديل والإضافة والحذف (`Mutations`) تتم حصرياً عبر **Next.js Server Actions** (`admin-app/lib/actions.ts`).
4. **حماية الخادم**: تم استخدام حزمة `server-only` في `admin-app/lib/sanity.server.ts` لضمان عدم تسريب أي كود سري للمتصفح.

---

## 🚀 2. خطوات النشر على دومين منفصل (Standalone Deployment)

### الخطوة 1: نسخ المجلد
انسخ مجلد `admin-app` وضعه في مستودع جديد (GitHub Repository) أو انقله لخادمك.

### الخطوة 2: تثبيت الحزم
```bash
cd admin-app
npm install
```

### الخطوة 3: إعداد متغيرات البيئة (`.env`)
أنشئ ملف `.env` داخل المجلد وأضف المتغيرات التالية:
```env
SANITY_PROJECT_ID=your_sanity_project_id
SANITY_DATASET=production
SANITY_API_VERSION=2024-03-01
SANITY_READ_TOKEN=your_private_read_token
SANITY_WRITE_TOKEN=your_private_write_token
ADMIN_SECRET_KEY=ledline_admin_secure_2026
```

### الخطوة 4: البناء والتشغيل
```bash
npm run build
npm start
```

---

## 📦 3. أقسام لوحة التحكم (Dashboard Modules)
- **نظرة عامة (Overview)**: لوحة مؤشرات الأداء، إجمالي المبيعات، الطلبات المعلقة، وتنبيهات المخزون.
- **المنتجات (Products)**: إضافة، تعديل، حذف المنتجات، تحديد المواصفات، الفئات، الصور، وتعديل الأسعار.
- **الطلبات (Orders)**: تتبع الطلبات، فلاتر الحالات، زر مراسلة العميل عبر الواتساب بنقرة واحدة، وتحديث الحالة مباشرة.
- **المخزون (Inventory)**: إدارة كميات المنتجات والتوافر الفوري وتنبيهات نفاد الكمية.
- **الأقسام (Categories)**: إدارة فئات المتجر والتصنيفات وتوزيع المنتجات.
- **كوبونات الخصم (Coupons)**: إنشاء أكواد الخصم ونسب التخفيض وتاريخ الانتهاء.
- **إعدادات Sanity (Settings)**: فحص حالة الاتصال والتوكنات الموثقة على الخادم.

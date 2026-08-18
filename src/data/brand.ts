// ============================================================================
// BRAND LOGO ICON CONFIGURATION
// يمكنك وضع مسار أو رابط صورة الأيقونة / اللوجو المربع هنا مباشرة:
// You can replace the logo icon image URL/path here:
// ============================================================================

export const BRAND_CONFIG = {
  name: 'LED LINE',
  tagline: 'Architectural Lighting & Acoustic Solutions',
  
  // 1. أيقونة الشعار للهيدر (بجانب اسم المتجر)
  // ضع رابط صورتك مثل '/logo.png' أو رابط إنترنت 'https://...'
  headerIcon: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="24" fill="#111111" />
      <path d="M28 26 H38 V66 H66 V76 H28 Z" fill="#FFFFFF" />
      <path d="M48 26 H58 V56 H74 V66 H48 Z" fill="#FFF2B2" />
    </svg>
  `)}`,

  // 2. أيقونة الشعار للفوتر (بجانب اسم المتجر في الوضع الليلي)
  footerIcon: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="24" fill="#FFFFFF" />
      <path d="M28 26 H38 V66 H66 V76 H28 Z" fill="#111111" />
      <path d="M48 26 H58 V56 H74 V66 H48 Z" fill="#B38A38" />
    </svg>
  `)}`,
};

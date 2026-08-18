import { Product, CategoryId, LookbookItem } from '../types';

export const CATEGORIES: { id: CategoryId; name: string; nameEn: string; icon: string; count: number; image: string; description: string }[] = [
  {
    id: 'all',
    name: 'جميع المنتجات',
    nameEn: 'All Products',
    icon: 'Grid',
    count: 0,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    description: 'تشكيلة متكاملة من أحدث حلول الإنارة المعمارية والديكورات الخشبية.'
  },
  {
    id: 'led-cob',
    name: 'أشرطة ليد COB بدون نقاط',
    nameEn: 'COB LED Strips',
    icon: 'Sparkles',
    count: 0,
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    description: 'إنارة خطية متصلة وانسيابية فائقة الكثافة خالية تماماً من النقاط الظاهرة.'
  },
  {
    id: 'aluminum-profiles',
    name: 'بروفايلات ألمنيوم معمارية',
    nameEn: 'Aluminum Profiles',
    icon: 'Sliders',
    count: 0,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    description: 'قطاعات ألمنيوم غاطسة وظاهرة وزوايا مع ناشرات حليبية وموزعة للضوء.'
  },
  {
    id: 'wood-panels',
    name: 'ألواح بديل الخشب والسلات',
    nameEn: 'Acoustic Wood Panels',
    icon: 'Layers',
    count: 0,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    description: 'ألواح جدارية عازلة للصوت بتشطيبات خشبية طبيعية فاخرة وأخاديد لتثبيت الإنارة.'
  },
  {
    id: 'magnetic-track',
    name: 'الإنارة المغناطيسية الحديثة',
    nameEn: 'Magnetic Track Lights',
    icon: 'Zap',
    count: 0,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
    description: 'أنظمة مسارات مغناطيسية ذكية 48V تتيح تحريك وإضافة السبوت لايت بسهولة.'
  },
  {
    id: 'pendant-modern',
    name: 'ثريات وإنارات خطية معلقة',
    nameEn: 'Linear Pendants & Chandelier',
    icon: 'Compass',
    count: 0,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
    description: 'إنارات مودرن للمطابخ وطاولات الطعام والمكاتب الفخمة بتصاميم بسيطة.'
  },
  {
    id: 'outdoor-linear',
    name: 'إنارة الواجهات والحدائق المقاومة',
    nameEn: 'Outdoor Linear & Facade',
    icon: 'SunMedium',
    count: 0,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
    description: 'إضاءات سيليكون ونيون فليكس IP68 معالجة ضد الأشعة فوق البنفسجية والأمطار.'
  },
  {
    id: 'power-smart',
    name: 'المحولات والتحكم الذكي',
    nameEn: 'Smart Drivers & Dimmers',
    icon: 'Cpu',
    count: 0,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop',
    description: 'محولات MeanWell فائقة النحافة، ووحدات تحكم Zigbee / Tuya وريموترات ديمر.'
  }
];

export const PRODUCTS: Product[] = [];

export const LOOKBOOK_ITEMS: LookbookItem[] = [];

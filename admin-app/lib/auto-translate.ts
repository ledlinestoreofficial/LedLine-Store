import { toEnglishDigits } from './num-utils';

/**
 * Intelligent Lighting Dictionary for Automatic Arabic -> English Generation
 */
const DICTIONARY_PHRASES: Array<[RegExp, string]> = [
  // Multi-word phrases first (highest precedence)
  [/شريط ليد كوب فائق النعومة/gi, 'Ultra-Smooth COB LED Strip'],
  [/شريط ليد كوب/gi, 'COB LED Strip'],
  [/شريط ليد سيليكون/gi, 'Silicon LED Strip'],
  [/شريط ليد/gi, 'LED Strip'],
  [/شريط ليد نيون فليكس/gi, 'Neon Flex LED Strip'],
  [/نيون فليكس/gi, 'Neon Flex'],
  [/بديل خشب سلات عازل للصوت/gi, 'Acoustic Wood Slat Wall Panel'],
  [/بديل خشب سلات/gi, 'Wood Slat Wall Panel'],
  [/بديل الخشب السلات/gi, 'Acoustic Wood Slat Panel'],
  [/بديل الخشب المضلع/gi, 'Fluted Wood Panel'],
  [/بديل خشب مضلع/gi, 'Fluted Wood Panel'],
  [/بديل خشب/gi, 'Wood Wall Panel'],
  [/بديل الرخام/gi, 'Marble Alternative Sheet'],
  [/لوح خشب سلات/gi, 'Wood Slat Panel'],
  [/لوح خشب/gi, 'Wood Panel'],
  [/ألواح خشب/gi, 'Wood Panels'],
  [/بروفايل ألمنيوم غاطس/gi, 'Recessed Aluminum Profile'],
  [/بروفايل المنيوم غاطس/gi, 'Recessed Aluminum Profile'],
  [/بروفايل ألمنيوم لطش/gi, 'Surface Aluminum Profile'],
  [/بروفايل ألمنيوم معلق/gi, 'Suspended Aluminum Profile'],
  [/بروفايل ألمنيوم زاوية/gi, 'Corner Aluminum Profile'],
  [/بروفايل ألمنيوم مخفي/gi, 'Trimless Aluminum Profile'],
  [/بروفايل ألمنيوم/gi, 'Aluminum Profile Channel'],
  [/بروفايل المنيوم/gi, 'Aluminum Profile Channel'],
  [/بروفايل غاطس/gi, 'Recessed Profile Channel'],
  [/بروفايل لطش/gi, 'Surface Mount Profile'],
  [/مسار مغناطيسي لطش/gi, 'Surface Mount Magnetic Track'],
  [/مسار مغناطيسي غاطس/gi, 'Recessed Magnetic Track'],
  [/مسار مغناطيسي معلق/gi, 'Suspended Magnetic Track'],
  [/مسار مغناطيسي/gi, 'Magnetic Track Light Rail'],
  [/تراك مغناطيسي/gi, 'Magnetic Track Light'],
  [/كشاف مسار مغناطيسي/gi, 'Magnetic Track Spotlight'],
  [/كشاف خطي مغناطيسي/gi, 'Magnetic Linear Spotlight'],
  [/كشاف خطي/gi, 'Linear Flood Spotlight'],
  [/كشاف سبوت لايت/gi, 'Spotlight Fixture'],
  [/كشاف لطش/gi, 'Surface Spotlight'],
  [/كشاف غاطس/gi, 'Recessed Spotlight'],
  [/كشاف متحرك/gi, 'Adjustable Spotlight'],
  [/كشاف/gi, 'Spotlight'],
  [/إنارة معلقة مودرن/gi, 'Modern Linear Pendant Light'],
  [/إنارة معلقة حديثة/gi, 'Nordic Pendant Light Fixture'],
  [/إنارة معلقة/gi, 'Linear Pendant Light'],
  [/ثريا معلقة/gi, 'Modern Chandelier Light'],
  [/ثريا خطية/gi, 'Linear Chandelier'],
  [/إنارة خطية/gi, 'Architectural Linear Light'],
  [/محول ذكي فائق النحافة/gi, 'Ultra-Slim Smart LED Driver'],
  [/محول ذكي/gi, 'Smart LED Driver Power Supply'],
  [/محول إلكتروني/gi, 'Electronic Power Supply Driver'],
  [/محول ليد/gi, 'LED Power Supply Driver'],
  [/محول/gi, 'LED Driver Power Supply'],
  [/ديمر ذكي/gi, 'Smart Zigbee Dimmer Controller'],
  [/ديمر/gi, 'Dimmer Controller'],
  [/حساس حركة/gi, 'PIR Motion Sensor Switch'],
  [/حساس لمس/gi, 'Touch Dimmer Sensor'],
  [/مقاوم للماء/gi, 'Waterproof IP68'],
  [/مقاوم للرطوبة/gi, 'Water Resistant IP65'],
  [/مقاوم للغبار/gi, 'Dustproof Fixture'],
  [/بلوط طبيعي دافئ/gi, 'Warm Natural Oak'],
  [/بلوط طبيعي/gi, 'Natural Oak Finish'],
  [/بلوط داكن/gi, 'Dark Oak Finish'],
  [/خشب جوز مودرن/gi, 'Modern Walnut Finish'],
  [/خشب جوز/gi, 'Natural Walnut Wood'],
  [/جوز أمريكي/gi, 'American Walnut'],
  [/جوزي/gi, 'Walnut Finish'],
  [/أسود فاحم مطفي/gi, 'Matte Charcoal Black'],
  [/أسود مطفي/gi, 'Matte Black'],
  [/أسود فاحم/gi, 'Charcoal Black'],
  [/أبيض ناصع/gi, 'Pure White'],
  [/أبيض مطفي/gi, 'Matte White'],
  [/رمادي سموكي/gi, 'Smoked Grey'],
  [/رمادي خرساني/gi, 'Concrete Grey'],
  [/رمادي/gi, 'Modern Grey'],
  [/ذهبي ملكي/gi, 'Brushed Champagne Gold'],
  [/ذهبي مطفي/gi, 'Brushed Gold'],
  [/ذهبي/gi, 'Gold Finish'],
  [/فضي غير لامع/gi, 'Anodized Silver'],
  [/فضي/gi, 'Silver Aluminum'],
  [/أصفر دافئ/gi, 'Warm White 3000K'],
  [/شمسي طبيعي/gi, 'Natural Sun 4000K'],
  [/أبيض بارد/gi, 'Cool White 6500K'],
  [/أصفر/gi, 'Warm White 3000K'],
  [/أبيض/gi, 'White'],
  [/أسود/gi, 'Black'],
  [/خارجي/gi, 'Outdoor Architectural'],
  [/داخلي/gi, 'Indoor Architectural'],
  [/للحدائق/gi, 'Landscape Garden'],
  [/للواجهات/gi, 'Exterior Facade'],
  [/للمطابخ/gi, 'Under Cabinet & Kitchen'],
  [/للجبس/gi, 'Drywall & Gypsum Board'],
  [/فائق النعومة/gi, 'Ultra-Smooth Seamless'],
  [/عالي الكثافة/gi, 'High Density 480 LEDs/m'],
  [/فائق النقاء/gi, 'High CRI 95+'],
  [/بدون نقاط/gi, 'Dotless Seamless Glow'],
  [/ذكي/gi, 'Smart Zigbee / Wi-Fi'],
  [/مودرن/gi, 'Modern Minimalist'],
  [/حديث/gi, 'Modern'],
  [/فاخر/gi, 'Luxury Grade'],
  [/مع ديمر/gi, 'with Dimmer Function'],
  [/مع ريموت/gi, 'with Remote Control'],
  [/مع محول/gi, 'with Power Driver Included'],
];

const SINGLE_WORD_MAP: Record<string, string> = {
  شريط: 'Strip',
  ليد: 'LED',
  كوب: 'COB',
  سيليكون: 'Silicon',
  نيون: 'Neon',
  فليكس: 'Flex',
  بروفايل: 'Profile',
  المنيوم: 'Aluminum',
  ألمنيوم: 'Aluminum',
  غاطس: 'Recessed',
  لطش: 'Surface Mounted',
  ظاهر: 'Surface Mounted',
  معلق: 'Suspended Pendant',
  مخفي: 'Trimless',
  زاوية: 'Corner',
  خشب: 'Wood',
  سلات: 'Slat',
  عازل: 'Acoustic',
  مسار: 'Track',
  مغناطيسي: 'Magnetic',
  كشاف: 'Spotlight',
  محول: 'Driver',
  ديمر: 'Dimmer',
  متر: 'Meters',
  سم: 'cm',
  واط: 'W',
  فولت: 'V',
  بلوط: 'Oak',
  جوز: 'Walnut',
  اسود: 'Black',
  أسود: 'Black',
  ابيض: 'White',
  أبيض: 'White',
  ذهبي: 'Gold',
  رمادي: 'Grey',
  خارجي: 'Outdoor',
  داخلي: 'Indoor',
  ذكي: 'Smart',
  مودرن: 'Modern',
};

/**
 * Automatically transforms an Arabic lighting product name into a clean English name
 */
export function autoTranslateLightingName(arabicTitle: string, category?: string): string {
  if (!arabicTitle || !arabicTitle.trim()) return '';

  let normalized = toEnglishDigits(arabicTitle.trim());

  // 1. Check phrase substitutions
  let matchedEnglish = normalized;
  let phraseMatches: string[] = [];

  for (const [regex, replacement] of DICTIONARY_PHRASES) {
    if (regex.test(matchedEnglish)) {
      matchedEnglish = matchedEnglish.replace(regex, ` {${replacement}} `);
      phraseMatches.push(replacement);
    }
  }

  // 2. Process remaining Arabic words
  const tokens = matchedEnglish.split(/\s+/).filter(Boolean);
  const resultWords: string[] = [];

  for (const token of tokens) {
    if (token.startsWith('{') && token.endsWith('}')) {
      resultWords.push(token.slice(1, -1));
      continue;
    }

    const cleanToken = token.replace(/[^a-zA-Z0-9\u0600-\u06FF\-\.\/\+]/g, '');

    // Preserve numbers, English acronyms (COB, LED, 24V, 48V, 3000K, etc.)
    if (/^[0-9a-zA-Z\-\.\/\+]+$/.test(cleanToken)) {
      resultWords.push(cleanToken.toUpperCase());
      continue;
    }

    const arLower = cleanToken.toLowerCase();
    if (SINGLE_WORD_MAP[arLower]) {
      resultWords.push(SINGLE_WORD_MAP[arLower]);
    } else {
      // Remove common Arabic prefixes: ال، و، ب، ل
      const stripped = arLower.replace(/^(ال|و|ب|ل)/, '');
      if (SINGLE_WORD_MAP[stripped]) {
        resultWords.push(SINGLE_WORD_MAP[stripped]);
      }
    }
  }

  // 3. Deduplicate adjacent identical words
  const cleanedList: string[] = [];
  const seenSet = new Set<string>();

  for (const w of resultWords) {
    const normWord = w.trim();
    if (!normWord) continue;
    // Don't repeat key noun back-to-back
    if (cleanedList[cleanedList.length - 1]?.toLowerCase() === normWord.toLowerCase()) continue;
    cleanedList.push(normWord);
  }

  let finalTitle = cleanedList.join(' ').trim();

  // If translation was too sparse or completely untranslatable, supply a smart category fallback
  if (!finalTitle || finalTitle.length < 3) {
    const categoryFallbacks: Record<string, string> = {
      'led-cob': 'COB LED Strip Lighting Series',
      'aluminum-profiles': 'Architectural Aluminum Profile Channel',
      'wood-panels': 'Acoustic Wood Slat Wall Panel',
      'magnetic-track': 'Magnetic Track Light Fixture',
      'pendant-modern': 'Modern Minimalist Pendant Light',
      'outdoor-linear': 'Outdoor Waterproof Linear Lighting',
      'power-smart': 'Smart Power Supply Driver & Controller',
    };
    finalTitle = categoryFallbacks[category || ''] || 'Architectural Lighting Product';
  }

  return finalTitle;
}

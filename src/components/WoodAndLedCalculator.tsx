"use client";

import React, { useState } from 'react';
import { X, Sliders, Zap, Layers, Check, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface WoodAndLedCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  lang?: 'ar' | 'en';
}

export const WoodAndLedCalculator: React.FC<WoodAndLedCalculatorProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'led' | 'wood'>('led');

  // LED State
  const [ledLength, setLedLength] = useState<number>(15); // meters
  const [ledType, setLedType] = useState<'cob-12' | 'cob-18' | 'neon-14'>('cob-12');
  const [ledColor, setLedColor] = useState<string>('3000K');
  const [includeProfiles, setIncludeProfiles] = useState<boolean>(true);
  const [ledAdded, setLedAdded] = useState<boolean>(false);

  // Wood Panels State
  const [wallWidth, setWallWidth] = useState<number>(3.6); // meters
  const [wallHeight, setWallHeight] = useState<number>(2.8); // meters
  const [panelType, setPanelType] = useState<'slat-oak' | 'slat-black' | 'fluted-walnut'>('slat-oak');
  const [includeLedBacklight, setIncludeLedBacklight] = useState<boolean>(true);
  const [woodAdded, setWoodAdded] = useState<boolean>(false);

  if (!isOpen) return null;

  // LED Calculations
  const wattPerMeter = ledType === 'cob-12' ? 12 : ledType === 'cob-18' ? 18 : 14;
  const pricePerMeter = ledType === 'cob-12' ? 29 : ledType === 'cob-18' ? 38 : 39;
  const totalWatts = Math.ceil(ledLength * wattPerMeter);
  const recommendedDriverWatts = Math.ceil((totalWatts * 1.25) / 50) * 50; // 25% safety margin rounded to nearest 50W
  const rollsCount = Math.ceil(ledLength / 5);
  const profilesCount = includeProfiles ? Math.ceil(ledLength / 2) : 0;
  
  const ledCost = (rollsCount * 5 * pricePerMeter);
  const driverCost = recommendedDriverWatts <= 100 ? 85 : recommendedDriverWatts <= 200 ? 135 : 240;
  const profilesCost = profilesCount * 68;
  const totalLedPackageCost = ledCost + driverCost + profilesCost;

  // Wood Calculations
  // Slat panel width is 0.6m, height 2.4m. Fluted width is 0.16m, height 2.9m.
  const isSlat = panelType !== 'fluted-walnut';
  const panelWidth = isSlat ? 0.6 : 0.16;
  const panelHeight = isSlat ? 2.4 : 2.9;
  const panelPrice = panelType === 'slat-oak' ? 260 : panelType === 'slat-black' ? 275 : 79;
  
  // Calculate panels needed for width (with 1 extra for pattern match / cuts)
  const panelsNeeded = Math.ceil((wallWidth / panelWidth) * 1.05);
  const adhesiveTubesNeeded = Math.ceil(panelsNeeded * 0.75);
  const adhesiveCost = adhesiveTubesNeeded * 25;
  const totalPanelsCost = (panelsNeeded * panelPrice) + adhesiveCost;
  const woodBacklightCost = includeLedBacklight ? 320 : 0;
  const totalWoodPackageCost = totalPanelsCost + woodBacklightCost;

  const handleAddLedPackage = () => {
    onAddToCart({
      productId: 'package-custom-led',
      name: `باقة إنارة ليد COB متكاملة (${ledLength} متر) + محول ${recommendedDriverWatts}W + ${profilesCount} بروفايل`,
      price: totalLedPackageCost,
      image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
      quantity: 1,
      selectedColorTemp: ledColor,
      selectedLength: ledLength,
      sku: `PKG-LED-${ledLength}M-${recommendedDriverWatts}W`
    });
    setLedAdded(true);
    setTimeout(() => setLedAdded(false), 2500);
  };

  const handleAddWoodPackage = () => {
    onAddToCart({
      productId: 'package-custom-wood',
      name: `باقة ألواح جدارية متكاملة (${panelsNeeded} ألواح) لتغطية ${wallWidth}م × ${wallHeight}م ${includeLedBacklight ? '+ إنارة مخفية' : ''}`,
      price: totalWoodPackageCost,
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
      quantity: 1,
      selectedFinish: panelType === 'slat-oak' ? 'بلوط طبيعي دافئ' : panelType === 'slat-black' ? 'أسود كاربون فاحم' : 'جوزي أمريكي',
      sku: `PKG-WOOD-${panelsNeeded}PNL`
    });
    setWoodAdded(true);
    setTimeout(() => setWoodAdded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-[#E5E5E5] my-6">
        {/* Header */}
        <div className="bg-[#111111] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-[#FFF2B2]" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">
                حاسبة المشاريع والكميات الذكية
              </h3>
              <p className="text-xs text-[#E5E5E5] mt-0.5">
                احسب الأمتار الدقيقة، المحولات المناسبة، وألواح الخشب لجدارك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-[#F5F5F5] border-b border-[#E5E5E5] gap-2">
          <button
            onClick={() => setActiveTab('led')}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'led'
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-[#757575] hover:text-[#111111]'
            }`}
          >
            <Zap className="w-4 h-4 text-[#111111]" />
            <span>حاسبة أشرطة الليد والمحولات</span>
          </button>

          <button
            onClick={() => setActiveTab('wood')}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'wood'
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-[#757575] hover:text-[#111111]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#111111]" />
            <span>حاسبة ألواح أخشاب الجدران</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {activeTab === 'led' ? (
            <div className="space-y-6">
              {/* Length Slider */}
              <div className="bg-[#F5F5F5] p-5 rounded-2xl border border-[#E5E5E5] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#111111]">
                    إجمالي الطول المطلوب (بالمتر):
                  </label>
                  <span className="text-2xl font-black text-[#111111] font-mono">
                    {ledLength} <span className="text-sm font-normal text-[#757575]">متر</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  step="1"
                  value={ledLength}
                  onChange={(e) => setLedLength(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#111111]"
                />
                <div className="flex justify-between text-[11px] text-[#757575] font-mono">
                  <span>2 متر</span>
                  <span>15 متر</span>
                  <span>30 متر</span>
                  <span>60 متر</span>
                </div>
              </div>

              {/* Strip Type & Temp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#757575]">
                    نوع شريط الإضاءة
                  </label>
                  <select
                    value={ledType}
                    onChange={(e) => setLedType(e.target.value as any)}
                    className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-3 text-sm font-bold text-[#111111] outline-none focus:border-[#111111]"
                  >
                    <option value="cob-12">COB ناعم معماري (12 واط/متر)</option>
                    <option value="cob-18">COB عالي السطوع (18 واط/متر)</option>
                    <option value="neon-14">نيون فليكس سيليكون (14 واط/متر)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#757575]">
                    درجة حرارة اللون (كلفن)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '3000K دافئ', val: '3000K', hex: '#FFAE42' },
                      { label: '4000K شمسي', val: '4000K', hex: '#FFF2B2' },
                      { label: '6500K ناصع', val: '6500K', hex: '#E2F0FF' }
                    ].map((temp) => (
                      <button
                        key={temp.val}
                        onClick={() => setLedColor(temp.val)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                          ledColor === temp.val
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: temp.hex }} />
                        <span>{temp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Aluminum Profiles Checkbox */}
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProfiles}
                  onChange={(e) => setIncludeProfiles(e.target.checked)}
                  className="w-4 h-4 accent-[#111111] rounded"
                />
                <div className="text-xs">
                  <p className="font-bold text-[#111111]">
                    {`تضمين بروفايلات ألمنيوم غاطسة تريملس (${profilesCount} قطاعات × 2 متر)`}
                  </p>
                  <p className="text-[#757575] mt-0.5">
                    موصى به لحماية الشريط من الحرارة وتوزيع الضوء بسلاسة
                  </p>
                </div>
              </label>

              {/* Calculations Result Summary Box */}
              <div className="bg-[#111111] text-white p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-[#E5E5E5] uppercase font-bold tracking-wider">
                    المواصفات الفنية المحسوبة
                  </span>
                  <span className="text-xs px-2.5 py-1 bg-[#12805C] text-white rounded-full font-bold">
                    مطابق SASO
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[11px] text-[#757575]">القدرة الإجمالية</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{totalWatts}W</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-[#FFF2B2]/30">
                    <p className="text-[11px] text-[#FFF2B2]">المحول الموصى به</p>
                    <p className="text-lg font-black text-[#FFF2B2] font-mono mt-0.5">{recommendedDriverWatts}W 24V</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[11px] text-[#757575]">عدد اللفات (5م)</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{rollsCount} لفات</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[11px] text-[#757575]">إجمالي السعر</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{totalLedPackageCost} <span className="text-xs font-normal">ر.س</span></p>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddLedPackage}
                  disabled={ledAdded}
                  className={`w-full py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    ledAdded
                      ? 'bg-[#12805C] text-white'
                      : 'bg-white text-[#111111] hover:bg-[#E5E5E5] active:scale-98'
                  }`}
                >
                  {ledAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت إضافة الباقة المتكاملة إلى السلة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>{`إضافة باقة الليد المتكاملة للسلة (${totalLedPackageCost} ر.س)`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Wood Panels Calculator Tab */
            <div className="space-y-6">
              {/* Wall Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F5F5F5] p-4 rounded-2xl border border-[#E5E5E5] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#111111]">عرض الجدار (متر):</label>
                    <span className="text-lg font-black text-[#111111] font-mono">{wallWidth} م</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="12.0"
                    step="0.1"
                    value={wallWidth}
                    onChange={(e) => setWallWidth(Number(e.target.value))}
                    className="w-full h-2 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#111111]"
                  />
                </div>

                <div className="bg-[#F5F5F5] p-4 rounded-2xl border border-[#E5E5E5] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#111111]">ارتفاع الجدار (متر):</label>
                    <span className="text-lg font-black text-[#111111] font-mono">{wallHeight} م</span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="4.5"
                    step="0.1"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(Number(e.target.value))}
                    className="w-full h-2 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#111111]"
                  />
                </div>
              </div>

              {/* Panel Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#757575]">
                  اختر تشطيب ونوع اللوح
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'slat-oak', nameAr: 'سلات خشب صوتي - بلوط دافئ', price: '260 ر.س/لوح', color: '#C29B64' },
                    { id: 'slat-black', nameAr: 'سلات خشب صوتي - أسود فاحم', price: '275 ر.س/لوح', color: '#1A1A1A' },
                    { id: 'fluted-walnut', nameAr: 'بديل خشب مضلع WPC - جوزي', price: '79 ر.س/لوح', color: '#4A2E1B' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPanelType(p.id as any)}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                        panelType === p.id
                          ? 'border-[#111111] ring-2 ring-[#111111] bg-white'
                          : 'border-[#E5E5E5] bg-[#F5F5F5] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: p.color }} />
                        <span className="text-xs font-bold text-[#111111]">{p.nameAr}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#757575]">{p.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Ambient LED Backlight Package */}
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLedBacklight}
                  onChange={(e) => setIncludeLedBacklight(e.target.checked)}
                  className="w-4 h-4 accent-[#111111] rounded"
                />
                <div className="text-xs">
                  <p className="font-bold text-[#111111]">
                    إضافة باقة الإنارة المخفية خلف الألواح (+320 ر.س)
                  </p>
                  <p className="text-[#757575] mt-0.5">
                    تتضمن شريط ليد COB دافئ 3000K ومحول تيار وموصلات مخصصة لأخاديد الخشب
                  </p>
                </div>
              </label>

              {/* Wood Package Summary Box */}
              <div className="bg-[#111111] text-white p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-[#E5E5E5] uppercase font-bold tracking-wider">
                    كميات الألواح والمواد المحسوبة
                  </span>
                  <span className="text-xs text-[#FFF2B2] font-mono">
                    {(wallWidth * wallHeight).toFixed(1)} م² مساحة الجدار
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[11px] text-[#757575]">عدد الألواح</p>
                    <p className="text-xl font-black text-white font-mono mt-0.5">{panelsNeeded} لوح</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[11px] text-[#757575]">غراء سيليكون تثبيت</p>
                    <p className="text-xl font-black text-white font-mono mt-0.5">{adhesiveTubesNeeded} علب</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[11px] text-[#757575]">السعر التقديري</p>
                    <p className="text-xl font-black text-white font-mono mt-0.5">{totalWoodPackageCost} <span className="text-xs font-normal">ر.س</span></p>
                  </div>
                </div>

                <button
                  onClick={handleAddWoodPackage}
                  disabled={woodAdded}
                  className={`w-full py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    woodAdded
                      ? 'bg-[#12805C] text-white'
                      : 'bg-white text-[#111111] hover:bg-[#E5E5E5] active:scale-98'
                  }`}
                >
                  {woodAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت إضافة باقة الأخشاب إلى السلة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>{`إضافة باقة الأخشاب الكاملة للسلة (${totalWoodPackageCost} ر.س)`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

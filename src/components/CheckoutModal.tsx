"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  Upload, 
  Building2, 
  Wallet, 
  Info,
  Sparkles,
  Loader2,
  FileImage,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, BankAccount, CityDeliveryRate, PaymentDeliverySettings } from '../types';
import { INITIAL_BANK_ACCOUNTS, INITIAL_DELIVERY_RATES } from '../lib/store-data';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToCart?: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  finalTotal: number;
  appliedCoupon?: string | null;
  onOrderSuccess: () => void;
  lang?: 'ar' | 'en';
}

const YEMEN_GOVERNORATES: Record<string, string[]> = {
  'حضرموت': [
    'المكلا',
    'سيئون',
    'الشحر',
    'تريم',
    'شبام',
    'غيل باوزير',
    'الديس الشرقية',
    'القطن',
    'دوعن'
  ],
  'صنعاء (الأمانة والمحافظة)': [
    'صنعاء (أمانة العاصمة)',
    'حدة',
    'السبعين',
    'التحرير',
    'الحصبة',
    'بني الحارث',
    'شملان',
    'سنحان',
    'بني مطر',
    'همدان',
    'نهم',
    'أرحب'
  ],
  'عدن': [
    'المعلا',
    'كريتر (صيرة)',
    'خور مكسر',
    'المنصورة',
    'الشيخ عثمان',
    'التواهي',
    'دار سعد',
    'البريقة',
    'مدينة الشعب',
    'مدينة إنماء'
  ],
  'تعز': [
    'تعز (وسط المدينة)',
    'القاهرة',
    'المظفر',
    'صالة',
    'الحوبان',
    'دمنة خدير',
    'المعافر',
    'التربة',
    'المخا',
    'الشمايتين'
  ],
  'الحديدة': [
    'الحديدة (وسط المدينة)',
    'الحوك',
    'الميناء',
    'الحالي',
    'باجل',
    'زبيد',
    'بيت الفقيه',
    'الخوخة',
    'حيس',
    'الضحي'
  ],
  'إب': [
    'إب (المدينة)',
    'جبلة',
    'يريم',
    'العدين',
    'المخادر',
    'السدة',
    'النادرة',
    'ذي السفال (القاعدة)',
    'حبيش'
  ],
  'ذمار': [
    'ذمار (المدينة)',
    'معبر (جهران)',
    'الحداء',
    'عتمة',
    'ضوران آنس',
    'جبل الشرق',
    'مغرب عنس'
  ],
  'مأرب': [
    'مأرب (المدينة)',
    'مأرب الوادي',
    'حريب',
    'صرواح',
    'الجوبة',
    'رغوان'
  ],
  'شبوة': [
    'عتق',
    'بيحان',
    'حبان',
    'ميفعة',
    'رضوم',
    'الروضة',
    'عسيلان'
  ],
  'لحج': [
    'الحوطة',
    'تبن',
    'ردفان (الحبيلين)',
    'يافع (لبعوس)',
    'المفلحي',
    'طور الباحة'
  ],
  'أبين': [
    'زنجبار',
    'جعار (خنفر)',
    'لودر',
    'مودية',
    'أحور',
    'رصد (يافع)'
  ],
  'المهرة': [
    'الغيضة',
    'شحن',
    'حوف',
    'قشن',
    'سيحوت',
    'حصوين'
  ],
  'صعدة': [
    'صعدة (المدينة)',
    'سحار',
    'الطلح',
    'رازح',
    'حيدان',
    'باقم'
  ],
  'حجة': [
    'حجة (المدينة)',
    'عبس',
    'حرض',
    'كحلان عفار',
    'أفلح اليمن',
    'قفل شمر'
  ],
  'البيضاء': [
    'البيضاء (المدينة)',
    'رداع',
    'مكيراس',
    'ذي ناعم',
    'الزاهر',
    'السوادية'
  ],
  'عمران': [
    'عمران (المدينة)',
    'خمر',
    'حوث',
    'ريدة',
    'ثلاء',
    'حبور ظليمة'
  ],
  'الضالع': [
    'الضالع (المدينة)',
    'قعطبة',
    'دمت',
    'الحصين',
    'الأزارق',
    'جحاف'
  ],
  'ريمة': [
    'الجبين',
    'بلاد الطعام',
    'كسمة',
    'السلفية',
    'مزهر',
    'الجعفرية'
  ],
  'المحويت': [
    'المحويت (المدينة)',
    'شبام كوكبان',
    'الطويلة',
    'ملحان',
    'الرجم',
    'حفاش'
  ],
  'سقطرى': [
    'حديبو',
    'قلنسية'
  ],
  'الجوف': [
    'الحزم',
    'المتون',
    'برط العنان',
    'خب والشعف'
  ],
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onBackToCart,
  cartItems,
  subtotal,
  discountAmount,
  appliedCoupon,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('حضرموت');
  const [city, setCity] = useState(YEMEN_GOVERNORATES['حضرموت'][0]);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  
  // Bank & Settings State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [deliveryRates, setDeliveryRates] = useState<CityDeliveryRate[]>(INITIAL_DELIVERY_RATES);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(350);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState<number>(25);
  const [selectedBankId, setSelectedBankId] = useState<string>(INITIAL_BANK_ACCOUNTS[0]?.id || '');
  
  // Deposit Receipt State
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [receiptUploadedUrl, setReceiptUploadedUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bankSectionRef = useRef<HTMLDivElement | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [serverTotal, setServerTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch dynamic payment and delivery settings from API
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings/payment-delivery', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            if (data.settings.bankAccounts && data.settings.bankAccounts.length > 0) {
              setBankAccounts(data.settings.bankAccounts.filter((b: BankAccount) => b.isActive));
              if (!selectedBankId && data.settings.bankAccounts[0]) {
                setSelectedBankId(data.settings.bankAccounts[0].id);
              }
            }
            if (data.settings.deliveryRates && data.settings.deliveryRates.length > 0) {
              setDeliveryRates(data.settings.deliveryRates);
            }
            if (data.settings.freeShippingThreshold !== undefined) {
              setFreeShippingThreshold(data.settings.freeShippingThreshold);
            }
            if (data.settings.defaultDeliveryFee !== undefined) {
              setDefaultDeliveryFee(data.settings.defaultDeliveryFee);
            }
          }
        }
      } catch {
        // Fallback to static defaults
      }
    }
    loadSettings();
  }, []);

  // Compute active selected bank object
  const activeBankAccounts = bankAccounts.filter((b) => b.isActive);
  const selectedBank = activeBankAccounts.find((b) => b.id === selectedBankId) || activeBankAccounts[0] || null;

  // Calculate dynamic delivery fee based on selected city & subtotal
  const calculateCurrentDeliveryFee = (): number => {
    if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
      return 0;
    }

    if (!city) {
      return defaultDeliveryFee;
    }

    // Check exact city match in delivery rates
    const matchedCity = deliveryRates.find(
      (r) => r.isActive && (
        r.city.trim().toLowerCase() === city.trim().toLowerCase() ||
        city.trim().toLowerCase().includes(r.city.trim().toLowerCase()) ||
        r.city.trim().toLowerCase().includes(city.trim().toLowerCase())
      )
    );

    if (matchedCity) {
      return matchedCity.fee;
    }

    // Check governorate match
    const matchedGov = deliveryRates.find(
      (r) => r.isActive && r.governorate.trim().toLowerCase() === governorate.trim().toLowerCase()
    );

    if (matchedGov) {
      return matchedGov.fee;
    }

    return defaultDeliveryFee;
  };

  const currentDeliveryFee = calculateCurrentDeliveryFee();
  const currentFinalTotal = Math.max(0, subtotal - discountAmount + currentDeliveryFee);

  if (!isOpen) return null;

  const handleGovernorateChange = (newGov: string) => {
    setGovernorate(newGov);
    const availableCities = YEMEN_GOVERNORATES[newGov] || [];
    if (availableCities.length > 0) {
      setCity(availableCities[0]);
    }
  };

  const handleBack = () => {
    if (onBackToCart) {
      onBackToCart();
    } else {
      onClose();
    }
  };

  const handleCopyAccountNumber = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }).catch(() => {
      // Fallback
    });
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setReceiptPreviewUrl(localUrl);
    setIsUploadingReceipt(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setReceiptUploadedUrl(data.url);
        }
      } else {
        // Fallback to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptUploadedUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Convert to base64 on error
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUploadedUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptPreviewUrl(null);
    setReceiptUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!fullName.trim() || !cleanPhone || !address.trim()) {
      setErrorMessage('يرجى تعبئة كافة الحقول الإلزامية');
      return;
    }

    if (cleanPhone.length !== 9) {
      setErrorMessage('يرجى إدخال رقم جوال يمني مكون من 9 أرقام (مثال: 771234567)');
      return;
    }

    // Require deposit receipt image for bank transfer payments
    if (paymentMethod === 'bank_transfer' && !receiptUploadedUrl && !receiptPreviewUrl) {
      setErrorMessage('يرجى إرفاق صورة سند أو إشعار الإيداع البنكي لإتمام الطلب');
      return;
    }

    setIsProcessing(true);

    try {
      const fullPhoneNumber = `+967${cleanPhone}`;
      const payload = {
        customer: {
          fullName: fullName.trim(),
          phone: fullPhoneNumber,
          governorate: governorate.trim(),
          city: city.trim(),
          address: address.trim(),
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedColorTemp: item.selectedColorTemp,
          selectedFinish: item.selectedFinish,
          selectedLength: item.selectedLength,
          selectedDimensions: item.selectedDimensions,
          sku: item.sku,
        })),
        paymentMethod,
        couponCode: appliedCoupon || undefined,
        depositReceiptUrl: receiptUploadedUrl || receiptPreviewUrl || undefined,
        selectedBankId: paymentMethod === 'bank_transfer' ? selectedBank?.id : undefined,
        selectedBankName: paymentMethod === 'bank_transfer' ? selectedBank?.name : undefined,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'تعذر إتمام الطلب، يرجى المحاولة لاحقاً');
        setIsProcessing(false);
        return;
      }

      const confirmedOrderNo = data.orderDetails?.orderNumber || data.orderNumber || `LL-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(confirmedOrderNo);
      setServerTotal(data.orderDetails?.total ?? currentFinalTotal);
      setStep('success');

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    } catch {
      setErrorMessage('حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    onOrderSuccess();
    onClose();
    setStep('details');
  };

  const availableCities = YEMEN_GOVERNORATES[governorate] || [];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto animate-fadeIn">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] px-4 sm:px-8 lg:px-12 py-4 sm:py-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleBack}
            className="p-2.5 rounded-full hover:bg-[#F5F5F5] text-[#111111] transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label="الرجوع للسلة"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold">الرجوع للسلة</span>
          </button>

          <div className="h-5 w-px bg-[#E5E5E5] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight">
              الدفع وإتمام الطلب
            </h1>
          </div>
        </div>

        <button
          onClick={handleBack}
          className="p-2.5 text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Full-Screen Body */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 sm:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {step === 'details' ? (
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Right Column: Customer Info & Shipping Address + Payment Methods (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {errorMessage && (
                  <div className="bg-[#D33918]/10 border border-[#D33918]/30 rounded-2xl p-4 text-xs font-bold text-[#D33918] flex items-center justify-between shadow-2xs">
                    <span>{errorMessage}</span>
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      className="p-1 hover:bg-[#D33918]/20 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Shipping & Customer Information Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E5E5] shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                    <h3 className="text-sm sm:text-base font-black text-[#111111] flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#111111]" />
                      <span>بيانات الشحن والتوصيل</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#111111]">الاسم الكامل *</label>
                      <input
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm text-[#111111] outline-none focus:border-[#111111] transition-all"
                      />
                    </div>

                    {/* Phone Number with Yemen Key on the Left */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#111111]">رقم الجوال *</label>
                      <div className="flex items-center gap-2">
                        {/* 9-digit Phone Input on Right */}
                        <div className="relative flex-1">
                          <input
                            required
                            type="tel"
                            inputMode="numeric"
                            maxLength={9}
                            placeholder="7XXXXXXXX"
                            value={phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                              setPhone(val);
                            }}
                            className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm text-[#111111] outline-none focus:border-[#111111] font-mono transition-all placeholder:font-sans placeholder:text-[#A3A3A3] text-right"
                            dir="ltr"
                          />
                        </div>

                        {/* Fixed Yemen Country Key with Flag on Left */}
                        <div className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl px-3 py-3 text-xs sm:text-sm font-bold text-[#111111] shrink-0 select-none shadow-2xs">
                          <span className="font-mono text-xs sm:text-sm" dir="ltr">+967</span>
                          <span className="text-base leading-none">🇾🇪</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Governorate (المحافظة) - Default Hadhramout */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#111111]">المحافظة *</label>
                      <select
                        value={governorate}
                        onChange={(e) => handleGovernorateChange(e.target.value)}
                        className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#111111] outline-none focus:border-[#111111] transition-all cursor-pointer"
                      >
                        {Object.keys(YEMEN_GOVERNORATES).map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City / District (المدينة / المديرية بناءً على المحافظة) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#111111]">المدينة / المديرية *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#111111] outline-none focus:border-[#111111] transition-all cursor-pointer"
                      >
                        {availableCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Street & Landmark Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111111]">الحي والشارع وأقرب معلم *</label>
                    <input
                      required
                      type="text"
                      placeholder="مثال: فوة, المساكن, جوار مسجد البركة"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm text-[#111111] outline-none focus:border-[#111111] transition-all"
                    />
                  </div>
                </div>

                {/* Payment Methods Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E5E5] shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                    <h3 className="text-sm sm:text-base font-black text-[#111111] flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#111111]" />
                      <span>طريقة الدفع المعتمدة</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'cod', name: 'الدفع عند الاستلام', sub: 'الدفع نقداً عند استلام ومعاينة الطلب' },
                      { id: 'bank_transfer', name: 'تحويل بنكي / محفظة إلكترونية', sub: 'قروشي / بي كاش / بن دول باي / بنك أمجاد / البسيري ...' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(method.id as any);
                          if (method.id === 'bank_transfer') {
                            setTimeout(() => {
                              bankSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 80);
                          }
                        }}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                          paymentMethod === method.id
                            ? 'border-[#111111] ring-2 ring-[#111111] bg-[#F5F5F5]'
                            : 'border-[#E5E5E5] bg-white hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold text-[#111111]">{method.name}</span>
                        <span className="text-[11px] text-[#757575]">{method.sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* Bank Transfer Details Section (Conditional on selecting bank_transfer) */}
                  {paymentMethod === 'bank_transfer' && (
                    <div
                      ref={bankSectionRef}
                      className="mt-4 pt-5 border-t border-[#E5E5E5] space-y-5 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                        <Building2 className="w-4 h-4 text-[#111111]" />
                        <span>بيانات التحويل والإيداع البنكي</span>
                      </div>

                      {/* Bank / Wallet Selector Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#111111]">
                          اختر البنك أو المحفظة الإلكترونية التي ترغب بالتحويل إليها *
                        </label>
                        <select
                          value={selectedBank?.id || ''}
                          onChange={(e) => setSelectedBankId(e.target.value)}
                          className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#111111] outline-none focus:border-[#111111] transition-all cursor-pointer"
                        >
                          {activeBankAccounts.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selected Bank Account Details Card */}
                      {selectedBank && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#F9FAFB] border border-[#E5E5E5] space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {selectedBank.type === 'wallet' ? (
                                <Wallet className="w-5 h-5 text-[#111111]" />
                              ) : (
                                <Building2 className="w-5 h-5 text-[#111111]" />
                              )}
                              <div>
                                <h4 className="text-xs sm:text-sm font-black text-[#111111]">{selectedBank.name}</h4>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs pt-1 border-t border-[#E5E5E5]">
                            {/* Account Holder Name */}
                            <div className="flex items-center justify-between">
                              <span className="text-[#757575]">اسم المستفيد:</span>
                              <span className="font-bold text-[#111111]">{selectedBank.accountName}</span>
                            </div>

                            {/* Account Number with 1-click Copy */}
                            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#E5E5E5]">
                              <div>
                                <span className="text-[11px] text-[#757575] block">
                                  {selectedBank.type === 'wallet' ? 'رقم المحفظة:' : 'رقم الحساب:'}
                                </span>
                                <span className="font-mono text-sm sm:text-base font-black text-[#111111] tracking-wider" dir="ltr">
                                  {selectedBank.accountNumber}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCopyAccountNumber(selectedBank.accountNumber, 'acc')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  copiedField === 'acc'
                                    ? 'bg-[#12805C] text-white'
                                    : 'bg-[#111111] text-white hover:bg-[#2A2A2A]'
                                }`}
                              >
                                {copiedField === 'acc' ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>تم النسخ</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>نسخ الرقم</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* IBAN (if available) */}
                            {selectedBank.iban && (
                              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#E5E5E5]">
                                <div>
                                  <span className="text-[11px] text-[#757575] block">رقم الآيبان (IBAN):</span>
                                  <span className="font-mono text-xs font-black text-[#111111]" dir="ltr">
                                    {selectedBank.iban}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyAccountNumber(selectedBank.iban!, 'iban')}
                                  className="p-1.5 rounded-lg bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#111111] text-xs font-bold"
                                  title="نسخ الآيبان"
                                >
                                  {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-[#12805C]" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}

                            {/* Instructions */}
                            {selectedBank.instructions && (
                              <div className="flex items-start gap-1.5 text-[11px] text-[#757575] bg-[#F5F5F5] p-2 rounded-xl">
                                <Info className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                                <span>{selectedBank.instructions}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Deposit Receipt Upload Box (سند الإيداع) */}
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
                          <span>سند الإيداع / إشعار التحويل *</span>
                        </label>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="hidden"
                          id="deposit-receipt-input"
                        />

                        {receiptPreviewUrl ? (
                          <div className="relative rounded-2xl border border-emerald-300 bg-[#F0FDF4] p-3 sm:p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#E5E5E5] shrink-0">
                                <img
                                  src={receiptPreviewUrl}
                                  alt="سند الإيداع"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#12805C]">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>تم إرفاق سند الإيداع بنجاح</span>
                                </div>
                                <p className="text-[11px] text-[#757575] mt-0.5">
                                  {isUploadingReceipt ? 'جاري رفع الصورة للخادم بأمان...' : 'الصورة جاهزة للإرسال مع الطلب'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl text-[#111111] transition-colors cursor-pointer"
                              >
                                تغيير
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveReceipt}
                                className="p-2 text-[#757575] hover:text-[#D33918] hover:bg-[#FFF2F0] rounded-xl transition-colors cursor-pointer"
                                title="حذف السند"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-[#D4D4D4] hover:border-[#111111] bg-[#F9FAFB] hover:bg-[#F5F5F5] rounded-2xl p-5 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2"
                          >
                            <div className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center text-[#111111] shadow-2xs">
                              {isUploadingReceipt ? (
                                <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B]" />
                              ) : (
                                <Upload className="w-5 h-5 text-[#111111]" />
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#111111] block">
                                اضغط هنا لرفع صورة سند أو إشعار الإيداع
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Left Column: Order Summary & Review - Compact layout matching CartDrawer (5 Cols) */}
              <div className="lg:col-span-5 lg:sticky lg:top-0 space-y-5">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E5] shadow-xs space-y-6">
                  
                  <h2 className="text-lg font-black text-[#111111] tracking-tight pb-3 border-b border-[#E5E5E5]">
                    ملخص الطلب والفاتورة
                  </h2>

                  {/* Financial Breakdown */}
                  <div className="space-y-3.5 text-xs sm:text-sm text-[#757575]">
                    <div className="flex justify-between items-center">
                      <span>المجموع الفرعي للمنتجات</span>
                      <span className="text-[#111111] font-bold text-sm">{subtotal} ر.س</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-[#12805C] font-bold">
                        <span>خصم الكوبون {appliedCoupon ? `(${appliedCoupon})` : ''}</span>
                        <span>-{discountAmount} ر.س</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span>رسوم التوصيل ({city || governorate})</span>
                      </div>
                      <span className={`font-bold ${currentDeliveryFee === 0 ? 'text-[#12805C]' : 'text-[#111111]'}`}>
                        {currentDeliveryFee === 0 ? 'مجاناً' : `${currentDeliveryFee} ر.س`}
                      </span>
                    </div>

                    {freeShippingThreshold > 0 && subtotal >= freeShippingThreshold && (
                      <div className="text-[11px] text-[#12805C] bg-[#F0FDF4] p-2 rounded-xl border border-[#12805C]/20 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>مؤهل للشحن المجاني (طلبك يتجاوز {freeShippingThreshold} ر.س)</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-base sm:text-lg font-black text-[#111111] pt-4 border-t border-[#E5E5E5]">
                      <span>الإجمالي النهائي</span>
                      <span className="text-xl sm:text-2xl font-black">{currentFinalTotal} ر.س</span>
                    </div>
                  </div>

                  {/* Submit Order Action Button - Positioned immediately under totals with no artificial void */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded-full font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>جاري معالجة الطلب بأمان...</span>
                        </div>
                      ) : (
                        <>
                          <span>تأكيد وإتمام الطلب ({currentFinalTotal} ر.س)</span>
                          <ArrowLeft className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>

            </form>
          ) : (
            /* Full-Screen Order Success Screen */
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto py-10">
              <div className="w-20 h-20 bg-[#12805C]/10 text-[#12805C] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#12805C] uppercase tracking-wider">
                  تم استلام طلبك بنجاح!
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  شكراً لثقتكم في متجر LED LINE
                </h2>
                <p className="text-xs sm:text-sm text-[#757575] max-w-md mx-auto leading-relaxed">
                  تم إنشاء طلبكم برقم #{orderNumber}. سيتم تجهيز المنتجات وشحنها إلى {governorate} - {city} بأسرع وقت.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="w-full bg-white p-6 rounded-3xl border border-[#E5E5E5] text-right space-y-3.5 text-xs shadow-2xs">
                <div className="flex justify-between border-b border-[#E5E5E5] pb-2.5 font-bold">
                  <span>رقم الفاتورة الإلكترونية:</span>
                  <span className="font-mono text-sm">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>العميل المستلم:</span>
                  <span className="font-bold">{fullName} (+967 {phone})</span>
                </div>
                <div className="flex justify-between">
                  <span>عنوان التوصيل:</span>
                  <span>{governorate} - {city} ({address})</span>
                </div>
                <div className="flex justify-between">
                  <span>طريقة الدفع:</span>
                  <span className="font-bold">
                    {paymentMethod === 'cod' 
                      ? 'الدفع عند الاستلام' 
                      : `تحويل بنكي / محفظة (${selectedBank?.name || 'محفظة إلكترونية'})`}
                  </span>
                </div>
                {receiptPreviewUrl && (
                  <div className="flex justify-between items-center">
                    <span>سند الإيداع:</span>
                    <span className="text-[#12805C] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      تم إرفاق السند
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#E5E5E5] pt-3 font-black text-sm sm:text-base text-[#111111]">
                  <span>المبلغ الإجمالي:</span>
                  <span className="font-mono">{serverTotal || currentFinalTotal} ر.س</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                العودة للمتجر ومتابعة التسوق
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

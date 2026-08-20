'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Truck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  Wallet,
  Settings2,
  Search,
  Save,
  Loader2,
  Sparkles,
  Info,
  Check,
  ArrowUpDown
} from 'lucide-react';
import { BankAccount, CityDeliveryRate, PaymentDeliverySettings } from '../../types';
import {
  savePaymentSettingsAction,
  saveBankAccountAction,
  deleteBankAccountAction,
  saveDeliveryRateAction,
  deleteDeliveryRateAction,
} from '../../lib/actions';

interface PaymentsDeliveryClientProps {
  initialSettings: PaymentDeliverySettings;
}

const YEMEN_GOVERNORATES_LIST = [
  'حضرموت',
  'صنعاء (الأمانة والمحافظة)',
  'عدن',
  'تعز',
  'الحديدة',
  'إب',
  'ذمار',
  'مأرب',
  'شبوة',
  'لحج',
  'أبين',
  'المهرة',
  'صعدة',
  'حجة',
  'البيضاء',
  'عمران',
  'الضالع',
  'ريمة',
  'المحويت',
  'سقطرى',
  'الجوف',
];

export function PaymentsDeliveryClient({ initialSettings }: PaymentsDeliveryClientProps) {
  const [activeTab, setActiveTab] = useState<'delivery' | 'banks' | 'settings'>('delivery');
  const [settings, setSettings] = useState<PaymentDeliverySettings>(initialSettings);
  const [deliveryRates, setDeliveryRates] = useState<CityDeliveryRate[]>(initialSettings.deliveryRates || []);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialSettings.bankAccounts || []);
  
  // Search & Filter
  const [searchCity, setSearchCity] = useState('');
  const [filterGov, setFilterGov] = useState('ALL');

  // Loading & Toast State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delivery Rate Modal State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<Partial<CityDeliveryRate> | null>(null);

  // Bank Account Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Partial<BankAccount> | null>(null);

  // General Settings Form State
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(initialSettings.freeShippingThreshold);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState<number>(initialSettings.defaultDeliveryFee);
  const [codEnabled, setCodEnabled] = useState<boolean>(initialSettings.codEnabled);
  const [bankTransferEnabled, setBankTransferEnabled] = useState<boolean>(initialSettings.bankTransferEnabled);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Delivery Rates
  const filteredRates = deliveryRates.filter((r) => {
    const matchesSearch =
      r.city.toLowerCase().includes(searchCity.toLowerCase()) ||
      r.governorate.toLowerCase().includes(searchCity.toLowerCase());
    const matchesGov = filterGov === 'ALL' || r.governorate === filterGov;
    return matchesSearch && matchesGov;
  });

  // Save General Settings
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await savePaymentSettingsAction({
        freeShippingThreshold,
        defaultDeliveryFee,
        codEnabled,
        bankTransferEnabled,
      });

      if (res.success) {
        showToast('success', res.message || 'تم حفظ الإعدادات بنجاح');
      } else {
        showToast('error', res.error || 'فشل حفظ الإعدادات');
      }
    } catch {
      showToast('error', 'حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save / Update Delivery Rate
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate?.city?.trim() || !editingRate?.governorate?.trim()) {
      showToast('error', 'يرجى إدخال اسم المدينة والمحافظة');
      return;
    }

    setIsSubmitting(true);
    try {
      const ratePayload = {
        id: editingRate.id,
        governorate: editingRate.governorate.trim(),
        city: editingRate.city.trim(),
        fee: Number(editingRate.fee) >= 0 ? Number(editingRate.fee) : 25,
        estimatedDays: editingRate.estimatedDays?.trim() || 'خلال 24-48 ساعة',
        isActive: editingRate.isActive !== false,
      };

      const res = await saveDeliveryRateAction(ratePayload);
      if (res.success) {
        showToast('success', 'تم حفظ تسعيرة التوصيل بنجاح');
        // Update local state
        setDeliveryRates((prev) => {
          const idx = prev.findIndex((r) => r.id === (editingRate.id || ''));
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...ratePayload, id: updated[idx].id };
            return updated;
          } else {
            return [...prev, { ...ratePayload, id: `rate-${Date.now()}` }];
          }
        });
        setIsRateModalOpen(false);
        setEditingRate(null);
      } else {
        showToast('error', res.error || 'فشل حفظ التسعيرة');
      }
    } catch {
      showToast('error', 'حدث خطأ أثناء حفظ التسعيرة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Delivery Rate
  const handleDeleteRate = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف تسعيرة التوصيل لـ "${name}"؟`)) return;

    try {
      const res = await deleteDeliveryRateAction(id);
      if (res.success) {
        showToast('success', 'تم حذف التسعيرة بنجاح');
        setDeliveryRates((prev) => prev.filter((r) => r.id !== id));
      } else {
        showToast('error', res.error || 'فشل حذف التسعيرة');
      }
    } catch {
      showToast('error', 'حدث خطأ أثناء الحذف');
    }
  };

  // Save / Update Bank Account
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBank?.name?.trim() || !editingBank?.accountNumber?.trim()) {
      showToast('error', 'يرجى إدخال اسم البنك/المحفظة ورقم الحساب');
      return;
    }

    setIsSubmitting(true);
    try {
      const bankPayload = {
        id: editingBank.id,
        name: editingBank.name.trim(),
        type: editingBank.type || 'bank',
        accountName: editingBank.accountName?.trim() || 'متجر ليد لاين',
        accountNumber: editingBank.accountNumber.trim(),
        iban: editingBank.iban?.trim() || '',
        instructions: editingBank.instructions?.trim() || '',
        isActive: editingBank.isActive !== false,
      };

      const res = await saveBankAccountAction(bankPayload);
      if (res.success) {
        showToast('success', 'تم حفظ الحساب البنكي / المحفظة بنجاح');
        setBankAccounts((prev) => {
          const idx = prev.findIndex((b) => b.id === (editingBank.id || ''));
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...bankPayload, id: updated[idx].id };
            return updated;
          } else {
            return [...prev, { ...bankPayload, id: `bank-${Date.now()}` }];
          }
        });
        setIsBankModalOpen(false);
        setEditingBank(null);
      } else {
        showToast('error', res.error || 'فشل حفظ الحساب');
      }
    } catch {
      showToast('error', 'حدث خطأ أثناء حفظ الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Bank Account
  const handleDeleteBank = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب "${name}"؟`)) return;

    try {
      const res = await deleteBankAccountAction(id);
      if (res.success) {
        showToast('success', 'تم حذف الحساب بنجاح');
        setBankAccounts((prev) => prev.filter((b) => b.id !== id));
      } else {
        showToast('error', res.error || 'فشل حذف الحساب');
      }
    } catch {
      showToast('error', 'حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-[#12805C] text-white border-[#12805C]'
              : 'bg-[#D33918] text-white border-[#D33918]'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E5E5] shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#111111] tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-[#111111]" />
            <span>إدارة الدفع ورسوم التوصيل</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#757575] mt-1">
            التحكم في تسعيرات الشحن والتوصيل لكافة المدن اليمنية، وإدارة الحسابات البنكية والمحافظ الرقمية المعتمدة للتحويل.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F5F5F5] p-1.5 rounded-2xl border border-[#E5E5E5] w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'delivery'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#757575] hover:text-[#111111]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>رسوم المدن ({deliveryRates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'banks'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#757575] hover:text-[#111111]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>الحسابات والمحافظ ({bankAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#757575] hover:text-[#111111]'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>الإعدادات العامة</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DELIVERY RATES */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E5E5] shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input
                  type="text"
                  placeholder="بحث عن مدينة أو محافظة..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl pr-10 pl-4 py-2 text-xs font-medium text-[#111111] outline-none focus:border-[#111111]"
                />
              </div>

              {/* Filter Governorate */}
              <select
                value={filterGov}
                onChange={(e) => setFilterGov(e.target.value)}
                className="w-full sm:w-auto bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-bold text-[#111111] outline-none cursor-pointer"
              >
                <option value="ALL">جميع المحافظات ({deliveryRates.length})</option>
                {YEMEN_GOVERNORATES_LIST.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Rate Button */}
            <button
              onClick={() => {
                setEditingRate({
                  governorate: 'حضرموت',
                  city: '',
                  fee: 25,
                  estimatedDays: 'خلال 24-48 ساعة',
                  isActive: true,
                });
                setIsRateModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#111111] hover:bg-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تسعيرة لمدينة</span>
            </button>
          </div>

          {/* Rates Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRates.map((rate) => (
              <div
                key={rate.id}
                className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-xs ${
                  rate.isActive ? 'border-[#E5E5E5]' : 'border-[#E5E5E5] opacity-60 bg-[#F9FAFB]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5]">
                      {rate.governorate}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rate.isActive ? 'bg-[#F0FDF4] text-[#12805C]' : 'bg-[#FFF2F0] text-[#D33918]'
                      }`}
                    >
                      {rate.isActive ? 'مفعلة' : 'معطلة'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#111111]">{rate.city}</h3>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#757575]">رسوم التوصيل:</span>
                    <span className="font-mono text-base font-black text-[#111111]">
                      {rate.fee === 0 ? (
                        <span className="text-[#12805C]">مجاناً (0 ر.س)</span>
                      ) : (
                        `${rate.fee} ر.س`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#757575]">
                    <span>المدة المتوقعة:</span>
                    <span className="font-medium text-[#111111]">{rate.estimatedDays || 'خلال 24-48 ساعة'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                  <button
                    onClick={() => {
                      setEditingRate(rate);
                      setIsRateModalOpen(true);
                    }}
                    className="p-2 text-[#111111] hover:bg-[#F5F5F5] rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                    title="تعديل"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRate(rate.id, `${rate.governorate} - ${rate.city}`)}
                    className="p-2 text-[#757575] hover:text-[#D33918] hover:bg-[#FFF2F0] rounded-lg transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredRates.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-[#E5E5E5] text-center space-y-3">
              <Truck className="w-10 h-10 text-[#A3A3A3] mx-auto" />
              <h3 className="text-base font-bold text-[#111111]">لا توجد مدن مطابقة للبحث</h3>
              <p className="text-xs text-[#757575]">
                يمكنك إضافة تسعيرة جديدة بالضغط على زر "إضافة تسعيرة لمدينة" بالأعلى.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BANK ACCOUNTS & WALLETS */}
      {activeTab === 'banks' && (
        <div className="space-y-6">
          {/* Header Action */}
          <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E5E5] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
              <Building2 className="w-4 h-4 text-[#F59E0B]" />
              <span>الحسابات البنكية والمحافظ الرقمية المعتمدة للمتجر</span>
            </div>

            <button
              onClick={() => {
                setEditingBank({
                  name: '',
                  type: 'wallet',
                  accountName: 'متجر ليد لاين',
                  accountNumber: '',
                  iban: '',
                  instructions: 'يرجى كتابة رقم الطلب في ملاحظة الإيداع',
                  isActive: true,
                });
                setIsBankModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#111111] hover:bg-[#2A2A2A] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حساب / محفظة جديدة</span>
            </button>
          </div>

          {/* Banks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className={`bg-white p-6 rounded-3xl border transition-all flex flex-col justify-between gap-4 shadow-xs ${
                  bank.isActive ? 'border-[#E5E5E5]' : 'border-[#E5E5E5] opacity-60 bg-[#F9FAFB]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-[#111111]">
                        {bank.type === 'wallet' ? <Wallet className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-[#111111]">{bank.name}</h3>
                        <span className="text-[10px] text-[#757575] font-bold">
                          {bank.type === 'wallet' ? 'محفظة إلكترونية' : 'حساب بنكي'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bank.isActive ? 'bg-[#F0FDF4] text-[#12805C]' : 'bg-[#FFF2F0] text-[#D33918]'
                      }`}
                    >
                      {bank.isActive ? 'مفعل ويظهر للعميل' : 'معطل مؤقتاً'}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#E5E5E5] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#757575]">اسم المستفيد:</span>
                      <span className="font-bold text-[#111111]">{bank.accountName}</span>
                    </div>

                    <div className="flex items-center justify-between bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E5E5]">
                      <span className="text-[#757575]">
                        {bank.type === 'wallet' ? 'رقم المحفظة:' : 'رقم الحساب:'}
                      </span>
                      <span className="font-mono font-black text-sm text-[#111111]" dir="ltr">
                        {bank.accountNumber}
                      </span>
                    </div>

                    {bank.iban && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#757575]">الآيبان:</span>
                        <span className="font-mono font-bold text-[#111111]" dir="ltr">
                          {bank.iban}
                        </span>
                      </div>
                    )}

                    {bank.instructions && (
                      <div className="text-[11px] text-[#757575] bg-[#F5F5F5] p-2 rounded-xl">
                        {bank.instructions}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                  <button
                    onClick={() => {
                      setEditingBank(bank);
                      setIsBankModalOpen(true);
                    }}
                    className="p-2 text-[#111111] hover:bg-[#F5F5F5] rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBank(bank.id, bank.name)}
                    className="p-2 text-[#757575] hover:text-[#D33918] hover:bg-[#FFF2F0] rounded-lg transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GENERAL SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveGeneralSettings} className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E5E5] shadow-xs space-y-6">
          <div className="space-y-1 border-b border-[#E5E5E5] pb-4">
            <h3 className="text-base font-black text-[#111111]">الإعدادات العامة للشحن والدفع</h3>
            <p className="text-xs text-[#757575]">تحديد قيم الشحن المجاني والتسعيرة الافتراضية وخيارات السداد.</p>
          </div>

          <div className="space-y-4">
            {/* Free Shipping Threshold */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
                <span>حد الشحن المجاني (ر.س)</span>
                <span className="text-[10px] text-[#757575]">إذا وصل سلة العميل لهذا المبلغ يصبح التوصيل 0 ر.س تلقائياً</span>
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-[#111111] outline-none focus:border-[#111111]"
              />
            </div>

            {/* Default Delivery Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
                <span>رسوم التوصيل الافتراضية (ر.س)</span>
                <span className="text-[10px] text-[#757575]">تُطبق على أي مدينة ليس لها تسعيرة مخصصة</span>
              </label>
              <input
                type="number"
                min="0"
                value={defaultDeliveryFee}
                onChange={(e) => setDefaultDeliveryFee(Number(e.target.value))}
                className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-[#111111] outline-none focus:border-[#111111]"
              />
            </div>

            {/* Toggles */}
            <div className="pt-2 space-y-3">
              <label className="flex items-center justify-between p-4 rounded-2xl border border-[#E5E5E5] bg-[#F9FAFB] cursor-pointer hover:bg-white transition-colors">
                <div>
                  <span className="text-xs font-bold text-[#111111] block">تفعيل خيار "الدفع عند الاستلام"</span>
                  <span className="text-[10px] text-[#757575]">إتاحة سداد قيمة الطلب نقداً عند استلام الشحنة</span>
                </div>
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#111111] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl border border-[#E5E5E5] bg-[#F9FAFB] cursor-pointer hover:bg-white transition-colors">
                <div>
                  <span className="text-xs font-bold text-[#111111] block">تفعيل خيار "تحويل بنكي / محفظة إلكترونية"</span>
                  <span className="text-[10px] text-[#757575]">إتاحة إرسال الحسابات البنكية وإرفاق سند الإيداع</span>
                </div>
                <input
                  type="checkbox"
                  checked={bankTransferEnabled}
                  onChange={(e) => setBankTransferEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#111111] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات العامة</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* RATE MODAL (ADD / EDIT) */}
      {isRateModalOpen && editingRate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 border border-[#E5E5E5] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <h3 className="text-base font-black text-[#111111]">
                {editingRate.id ? 'تعديل تسعيرة التوصيل' : 'إضافة تسعيرة لمدينة جديدة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsRateModalOpen(false)}
                className="p-1 text-[#757575] hover:text-[#111111] rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">المحافظة *</label>
                <select
                  value={editingRate.governorate || 'حضرموت'}
                  onChange={(e) => setEditingRate({ ...editingRate, governorate: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-[#111111] outline-none"
                >
                  {YEMEN_GOVERNORATES_LIST.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">اسم المدينة / المنطقة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: المكلا، سيئون، حدة، المنصورة"
                  value={editingRate.city || ''}
                  onChange={(e) => setEditingRate({ ...editingRate, city: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#111111] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">رسوم التوصيل (ر.س) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingRate.fee !== undefined ? editingRate.fee : 25}
                  onChange={(e) => setEditingRate({ ...editingRate, fee: Number(e.target.value) })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-[#111111] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">المدة المتوقعة للتوصيل</label>
                <input
                  type="text"
                  placeholder="مثال: خلال 24 ساعة، خلال 2-3 أيام"
                  value={editingRate.estimatedDays || ''}
                  onChange={(e) => setEditingRate({ ...editingRate, estimatedDays: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#111111] outline-none"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingRate.isActive !== false}
                  onChange={(e) => setEditingRate({ ...editingRate, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#111111] rounded"
                />
                <span className="text-xs font-bold text-[#111111]">تفعيل التسعيرة وجعلها نشطة في السلة والدفع</span>
              </label>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ التسعيرة'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-4 py-3 border border-[#E5E5E5] hover:bg-[#F5F5F5] rounded-xl text-xs font-bold text-[#111111] cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANK MODAL (ADD / EDIT) */}
      {isBankModalOpen && editingBank && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 border border-[#E5E5E5] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <h3 className="text-base font-black text-[#111111]">
                {editingBank.id ? 'تعديل الحساب البنكي / المحفظة' : 'إضافة حساب أو محفظة جديدة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="p-1 text-[#757575] hover:text-[#111111] rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111111]">النوع *</label>
                  <select
                    value={editingBank.type || 'wallet'}
                    onChange={(e) => setEditingBank({ ...editingBank, type: e.target.value as any })}
                    className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-[#111111] outline-none"
                  >
                    <option value="wallet">محفظة إلكترونية</option>
                    <option value="bank">حساب بنكي / مصرفي</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111111]">اسم البنك أو المحفظة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: قروشي، بي كاش، بنك الكريمي"
                    value={editingBank.name || ''}
                    onChange={(e) => setEditingBank({ ...editingBank, name: e.target.value })}
                    className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#111111] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">اسم المستفيد (صاحب الحساب) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: متجر ليد لاين للإنارة المعمارية"
                  value={editingBank.accountName || ''}
                  onChange={(e) => setEditingBank({ ...editingBank, accountName: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#111111] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">رقم الحساب / رقم المحفظة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 771234567 أو 3001234567"
                  value={editingBank.accountNumber || ''}
                  onChange={(e) => setEditingBank({ ...editingBank, accountNumber: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-[#111111] outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">رقم الآيبان (IBAN) - اختياري</label>
                <input
                  type="text"
                  placeholder="YE00..."
                  value={editingBank.iban || ''}
                  onChange={(e) => setEditingBank({ ...editingBank, iban: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs font-mono text-[#111111] outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">تعليمات الإيداع للعميل</label>
                <input
                  type="text"
                  placeholder="مثال: يرجى إرسال إشعار الإيداع مع رقم الطلب"
                  value={editingBank.instructions || ''}
                  onChange={(e) => setEditingBank({ ...editingBank, instructions: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E5E5] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#111111] outline-none"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBank.isActive !== false}
                  onChange={(e) => setEditingBank({ ...editingBank, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#111111] rounded"
                />
                <span className="text-xs font-bold text-[#111111]">إظهار الحساب للعملاء في صفحة الدفع</span>
              </label>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ الحساب'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-3 border border-[#E5E5E5] hover:bg-[#F5F5F5] rounded-xl text-xs font-bold text-[#111111] cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

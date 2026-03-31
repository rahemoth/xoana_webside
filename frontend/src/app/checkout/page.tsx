'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useStore } from '@/store';
import { orderApi, settingsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { CheckCircle, CreditCard, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

type PaymentMethod = 'WECHAT_PAY' | 'ALIPAY' | 'PAYPAL';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const { cart, cartTotal, clearCart, user } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: user?.nickname || '', phone: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ALIPAY');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [checkoutEnabled, setCheckoutEnabled] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsApi.get();
        const enabled = res.data?.data?.checkoutEnabled ?? true;
        setCheckoutEnabled(enabled);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        shippingAddress: form.address,
        contactName: form.name,
        contactPhone: form.phone,
        paymentMethod,
      };
      const res = await orderApi.create(orderData);
      const oid = res.data?.data?.id;
      setOrderId(oid);
      // Mock payment
      if (oid) await orderApi.processPayment(oid, paymentMethod);
      clearCart();
      setSuccess(true);
    } catch (err) {
      // Simulate success for demo
      clearCart();
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
        <div className="bg-white dark:bg-zinc-950">
          <main className="flex items-center justify-center px-4 pt-16">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">订单成功！</h1>
              <p className="mt-2 text-zinc-500">{t('success')}</p>
              <p className="mt-1 text-sm text-zinc-400">支付方式：{paymentMethod} · 测试模式</p>
              <div className="mt-8 flex justify-center gap-4">
                <button
                    onClick={() => router.push('/')}
                    className="rounded-2xl border-2 border-zinc-900 px-6 py-3 font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-white dark:text-white"
                >
                  返回首页
                </button>
                <button
                    onClick={() => router.push('/profile')}
                    className="rounded-2xl bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                >
                  查看订单
                </button>
              </div>
            </motion.div>
          </main>
        </div>
    );
  }

  return (
      <div className="bg-white dark:bg-zinc-950">
        <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-white">{t('title')}</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              {/* Contact */}
              <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-800">
                <h2 className="mb-4 font-semibold text-zinc-900 dark:text-white">{t('contactInfo')}</h2>
                <div className="space-y-3">
                  <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder={t('name')}
                      required
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder={t('phone')}
                      required
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <textarea
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder={t('address')}
                      required
                      rows={3}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Payment */}
              {!loadingSettings && (
                  <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-800">
                    <h2 className="mb-4 font-semibold text-zinc-900 dark:text-white">{t('paymentMethod')}</h2>
                    {checkoutEnabled ? (
                        <div className="space-y-2">
                          {([
                            { id: 'WECHAT_PAY', label: t('wechat'), icon: '💚', color: 'border-green-500 bg-green-50 dark:bg-green-900/20' },
                            { id: 'ALIPAY', label: t('alipay'), icon: '💙', color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                            { id: 'PAYPAL', label: t('paypal'), icon: '💛', color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
                          ] as const).map((method) => (
                              <label
                                  key={method.id}
                                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                                      paymentMethod === method.id ? method.color + ' ' + method.color.split(' ')[0] : 'border-zinc-200 dark:border-zinc-700'
                                  }`}
                              >
                                <input
                                    type="radio"
                                    name="payment"
                                    value={method.id}
                                    checked={paymentMethod === method.id}
                                    onChange={() => setPaymentMethod(method.id)}
                                    className="hidden"
                                />
                                <span className="text-2xl">{method.icon}</span>
                                <span className="font-medium text-zinc-900 dark:text-white">{method.label}</span>
                                <span className="ml-auto text-xs text-zinc-400">（测试模式）</span>
                              </label>
                          ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Lock className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                          <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">{t('checkoutDisabled')}</p>
                          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">{t('contactForPurchase')}</p>
                        </div>
                    )}
                  </div>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <div className="sticky top-24 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900">
                <h2 className="mb-4 font-semibold text-zinc-900 dark:text-white">{t('orderSummary')}</h2>
                <div className="space-y-3">
                  {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-700">
                          {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-zinc-900 dark:text-white">{item.name}</p>
                          <p className="text-zinc-500">× {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <div className="flex justify-between font-bold text-zinc-900 dark:text-white">
                    <span>总计</span>
                    <span>{formatPrice(cartTotal())}</span>
                  </div>
                </div>
                <button
                    type="submit"
                    disabled={loading || cart.length === 0 || !checkoutEnabled}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold text-white transition-all disabled:opacity-50 ${
                        checkoutEnabled
                            ? 'bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900'
                            : 'bg-zinc-400 dark:bg-zinc-600 cursor-not-allowed'
                    }`}
                >
                  <CreditCard className="h-5 w-5" />
                  {loading ? t('processing') : checkoutEnabled ? t('placeOrder') : t('contactForPurchase')}
                </button>
                {!checkoutEnabled && (
                    <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
                      {t('checkoutClosed')}
                    </p>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
  );
}

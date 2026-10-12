'use client';

import { galleryImageUrl } from '@/lib/gallery';

import { useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useStore, type CartItem } from '@/store';
import { useHydrated } from '@/store/useHydrated';
import { orderApi, settingsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { CheckCircle, CreditCard, Lock, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

type PaymentMethod = 'PAYPAL';

function createCheckoutToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

// Prices are decided by the server; only the charged unit prices and quantities are taken
// from the created order so the summary matches the amount that will be paid.
function mergeServerPrices(created: unknown, fallback: CartItem[]): CartItem[] {
  const items = (created as { items?: unknown } | null)?.items;
  if (!Array.isArray(items)) return fallback;
  return fallback.map((item) => {
    const match = items.find((raw) => (raw as { product?: { id?: unknown } } | null)?.product?.id === item.id) as
      | { unitPrice?: unknown; quantity?: unknown }
      | undefined;
    const price = Number(match?.unitPrice);
    const quantity = Number(match?.quantity);
    if (!match || !Number.isFinite(price) || !Number.isInteger(quantity) || quantity <= 0) {
      return item;
    }
    return { ...item, price, quantity };
  });
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const { cart, user, token, pendingOrder, setPendingOrder, setCheckoutToken } = useStore();
  const hydrated = useHydrated();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [formChanges, setForm] = useState<Partial<{ name: string; phone: string; address: string }>>({});
  const form = {
    name: user?.nickname || user?.username || '',
    phone: user?.phone || '',
    address: user?.address || '',
    ...formChanges,
  };
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAYPAL');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [priceChanged, setPriceChanged] = useState(false);
  const [priceNotice, setPriceNotice] = useState('');
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const { data: settings, isPending: loadingSettings, isError: settingsError, refetch } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsApi.get(),
  });
  const checkoutEnabled = settings?.data?.data?.checkoutEnabled === true;
  const pendingForUser = pendingOrder && pendingOrder.userId === user?.id ? pendingOrder : null;
  const orderId = pendingForUser?.id;
  const summaryItems = pendingForUser ? pendingForUser.items : cart;
  const summaryTotal = pendingForUser?.totalAmount !== undefined
      ? pendingForUser.totalAmount
      : summaryItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current || !hydrated || loadingSettings || !checkoutEnabled || summaryItems.length === 0) return;
    if (!user || !token) {
      router.push('/login');
      return;
    }
    // Contact details are only required while creating the order; a resumed order already
    // carries them, and its form fields are disabled.
    if (!orderId && (!form.name.trim() || !form.phone.trim() || !form.address.trim())) {
      setError(t('contactRequired'));
      return;
    }
    submitting.current = true;
    setLoading(true);
    setError('');
    setPriceNotice('');
    try {
      const orderedItems = summaryItems.map(item => ({ ...item }));
      let oid = orderId;
      if (!oid) {
        // One token per checkout attempt: a retried submission returns the same order
        // instead of creating a duplicate one.
        const attemptToken = useStore.getState().checkoutToken ?? createCheckoutToken();
        setCheckoutToken(attemptToken);
        const clientTotal = orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const orderData = {
          items: orderedItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
          shippingAddress: form.address.trim(),
          contactName: form.name.trim(),
          contactPhone: form.phone.trim(),
          paymentMethod,
          clientToken: attemptToken,
        };
        const res = await orderApi.create(orderData);
        const created = res.data?.data as { id?: unknown; totalAmount?: unknown } | undefined;
        const createdId = created?.id;
        if (res.data?.success !== true || typeof createdId !== 'number' || !Number.isSafeInteger(createdId) || createdId <= 0) {
          throw new Error(t('createFailed'));
        }
        oid = createdId;
        setPendingOrder({
          id: oid,
          userId: user.id,
          items: mergeServerPrices(created, orderedItems),
          totalAmount: Number.isFinite(Number(created?.totalAmount)) ? Number(created?.totalAmount) : undefined,
        });
        setCheckoutToken(null);
        const serverTotal = Number(created?.totalAmount);
        if (Number.isFinite(serverTotal) && Math.abs(serverTotal - clientTotal) >= 0.01) {
          // Prices changed between filling the cart and submitting: let the user confirm
          // the new amount instead of paying it silently.
          setPriceChanged(true);
          setPriceNotice(t('priceUpdated', { amount: formatPrice(serverTotal, locale) }));
          return;
        }
      }
      if (useStore.getState().token !== token) throw new Error(t('sessionChanged'));
      // Payment retries reuse the created order instead of creating duplicates.
      const payment = await orderApi.processPayment(oid, paymentMethod);
      if (payment.data?.success !== true || payment.data?.data?.status !== 'PAID') {
        throw new Error(t('paymentIncomplete'));
      }
      const store = useStore.getState();
      if (store.token !== token) throw new Error(t('sessionChanged'));
      // Keep items added from another tab or after a failed payment.
      store.consumeOrdered(orderedItems);
      store.clearPendingOrder();
      setPriceChanged(false);
      void queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setSuccess(true);
    } catch (err) {
      const message = isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined;
      setError(message || (err instanceof Error && !isAxiosError(err) ? err.message : t('orderFailed')));
    } finally {
      submitting.current = false;
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
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{t('orderSuccess')}</h1>
              <p className="mt-2 text-zinc-500">{t('success')}</p>
              <p className="mt-1 text-sm text-zinc-400">{t('paidWith', { method: t('paypal') })}</p>
              <div className="mt-8 flex justify-center gap-4">
                <button
                    onClick={() => router.push('/')}
                    className="rounded-2xl border-2 border-zinc-900 px-6 py-3 font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-white dark:text-white"
                >
                  {t('backHome')}
                </button>
                <button
                    onClick={() => router.push('/profile')}
                    className="rounded-2xl bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                >
                  {t('viewOrders')}
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

          {settingsError && <p role="alert" className="mb-4 text-sm text-red-600">{t('settingsFailed')}<button type="button" onClick={() => { void refetch(); }} className="ml-2 underline">{t('retry')}</button></p>}
          {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
          {priceNotice && (
              <p role="alert" className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                {priceNotice}
              </p>
          )}
          {orderId && <p role="status" className="mb-4 text-sm text-zinc-500">{t('orderCreated', { id: orderId })}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              {/* Contact */}
              <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-800">
                <h2 className="mb-4 font-semibold text-zinc-900 dark:text-white">{t('contactInfo')}</h2>
                <div className="space-y-3">
                  <input
                      value={form.name}
                      disabled={loading || !!orderId}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder={t('name')}
                      required
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <input
                      value={form.phone}
                      disabled={loading || !!orderId}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder={t('phone')}
                      required
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <textarea
                      value={form.address}
                      disabled={loading || !!orderId}
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
                            { id: 'PAYPAL', label: t('paypal'), Icon: Wallet, color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
                          ] as const).map((method) => (
                              <label
                                  key={method.id}
                                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                                      paymentMethod === method.id ? method.color : 'border-zinc-200 dark:border-zinc-700'
                                  }`}
                              >
                                <input
                                    type="radio"
                                    name="payment"
                                    value={method.id}
                                    checked={paymentMethod === method.id}
                                    disabled={loading || !!orderId}
                                    onChange={() => setPaymentMethod(method.id)}
                                    className="hidden"
                                />
                                <method.Icon className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
                                <span className="font-medium text-zinc-900 dark:text-white">{method.label}</span>
                                <span className="ml-auto text-xs text-zinc-400">{t('testMode')}</span>
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
                  {summaryItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-700">
                          {item.image && <img src={galleryImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />}
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-zinc-900 dark:text-white">{locale === 'en' ? item.nameEn || item.name : item.name}</p>
                          <p className="text-zinc-500">× {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{formatPrice(item.price * item.quantity, locale)}</span>
                      </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <div className="flex justify-between font-bold text-zinc-900 dark:text-white">
                    <span>{t('total')}</span>
                    <span>{formatPrice(summaryTotal, locale)}</span>
                  </div>
                </div>
                <button
                    type="submit"
                    disabled={!hydrated || loadingSettings || loading || summaryItems.length === 0 || !checkoutEnabled}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold text-white transition-all disabled:opacity-50 ${
                        checkoutEnabled
                            ? 'bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900'
                            : 'bg-zinc-400 dark:bg-zinc-600 cursor-not-allowed'
                    }`}
                >
                  <CreditCard className="h-5 w-5" />
                  {loading || loadingSettings ? t('processing') : priceChanged ? t('confirmPayment') : orderId ? t('retryPayment') : checkoutEnabled ? t('placeOrder') : t('contactForPurchase')}
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

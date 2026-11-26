'use client';

import React, { useState, useEffect } from 'react';
import { useStudent } from '../layout';
import {
  Coins,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Package,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function StudentShopPage() {
  const { refreshData } = useStudent();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/shop', { headers });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: any) => {
    if (!confirm(`Haqiqatan ham "${product.title}" mahsulotini ${product.priceXCoin} XCoin evaziga xarid qilmoqchimisiz?`)) {
      return;
    }

    try {
      setPurchasingId(product._id);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/shop', {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId: product._id }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        alert(json.message || "Xarid muvaffaqiyatli amalga oshirildi! Buyurtmangiz qabul qilindi.");
        await fetchShop();
        await refreshData();
      } else {
        alert(json.error || "Xaridni amalga oshirishda xatolik");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setPurchasingId(null);
    }
  };

  const products = data?.products || [];
  const orders = data?.orders || [];
  const balance = data?.balanceXCoin || 0;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      
      {/* Header bar with Student XCoin Balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/15 border border-cyan-500/20 px-3.5 py-1 rounded-full text-[11px] font-bold text-[#00F0FF]">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>INFAST MERCH VA SOVG'ALAR DO'KONI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">XCoin Market</h1>
          <p className="text-xs text-neutral-400">
            Darslarda to'plagan XCoinlaringiz evaziga brendli kiyimlar, gadjetlar va merchlarni bepul xarid qiling!
          </p>
        </div>

        {/* Balance Card */}
        <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-black/50 border border-cyan-500/30 backdrop-blur-xl shrink-0">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00F0FF] flex items-center justify-center">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-neutral-400">Mavjud Balansingiz</span>
            <span className="text-xl sm:text-2xl font-black text-[#00F0FF] font-mono">{balance} XCoin</span>
          </div>
        </div>
      </div>

      {/* Tabs: Mahsulotlar / Buyurtmalarim */}
      <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Mahsulotlar ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Mening Buyurtmalarim ({orders.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-400">Do'kon yuklanmoqda...</p>
        </div>
      ) : activeTab === 'products' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod: any) => {
            const canAfford = balance >= prod.priceXCoin;
            const isBuying = purchasingId === prod._id;

            return (
              <div
                key={prod._id}
                className="rounded-3xl bg-neutral-900/40 border border-white/[0.08] overflow-hidden backdrop-blur-2xl flex flex-col justify-between shadow-xl hover:border-white/20 transition-all group"
              >
                <div>
                  {/* Image container */}
                  <div className="relative w-full h-48 bg-neutral-950 overflow-hidden">
                    <img
                      src={prod.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[#00F0FF] text-xs font-mono font-bold flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{prod.priceXCoin} XCoin</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {prod.category || "Merch"}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handlePurchase(prod)}
                    disabled={!canAfford || isBuying}
                    className={`w-full py-3 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center justify-center space-x-2 ${
                      canAfford
                        ? 'bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#FF2A85] bg-[length:200%_auto] hover:bg-right text-white shadow-lg shadow-[#FF2A85]/20 hover:scale-[1.02]'
                        : 'bg-white/5 border border-white/5 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {isBuying ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : canAfford ? (
                      <>
                        <span>Xarid qilish</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <span>Yetarli XCoin mavjud emas</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Orders View */
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-white/10 space-y-3">
              <Package className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Siz hali mahsulot xarid qilmadingiz</h3>
              <p className="text-xs text-neutral-400">Do'kondan istalgan mahsulotni tanlang va XCoinlaringizni almashtiring.</p>
            </div>
          ) : (
            orders.map((ord: any) => (
              <div
                key={ord._id}
                className="p-5 rounded-2xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={ord.productId?.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80"}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {ord.productId?.title || "InFast Mahsuloti"}
                    </h4>
                    <span className="text-xs text-neutral-400 font-mono">
                      Narxi: {ord.productId?.priceXCoin || ord.priceXCoin || 0} XCoin
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : ord.status === 'PROCESSING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-cyan-500/10 text-[#00F0FF] border border-cyan-500/20'
                    }`}
                  >
                    {ord.status === 'DELIVERED'
                      ? "Topshirildi"
                      : ord.status === 'PROCESSING'
                      ? "Tayyorlanmoqda"
                      : "Qabul qilindi"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
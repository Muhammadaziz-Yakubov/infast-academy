'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Coins,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  priceXCoin: number;
  stock: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface Order {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    studentCode?: string;
  };
  productId: {
    _id: string;
    title: string;
    priceXCoin: number;
    category: string;
    imageUrl?: string;
  };
  priceXCoin: number;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderActionLoading, setOrderActionLoading] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priceXCoin, setPriceXCoin] = useState('100');
  const [stock, setStock] = useState('10');
  const [category, setCategory] = useState('MERCH');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'FULFILLED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/shop');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !priceXCoin) {
      alert("Iltimos, mahsulot nomi va narxini to'ldiring!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          priceXCoin: Number(priceXCoin),
          stock: Number(stock),
          category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Mahsulot muvaffaqiyatli qo'shildi!");
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setImageUrl('');
        setPriceXCoin('100');
        setStock('10');
        fetchShopData();
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'FULFILLED' | 'CANCELLED') => {
    const confirmMsg =
      status === 'FULFILLED'
        ? "Talabaga sovg'a topshirildimi? Buyurtma holati 'Yetkazildi' deb belgilanadi."
        : "Buyurtma bekor qilinsinmi? Talabaga XCoin tangalari qaytarib beriladi.";

    if (!confirm(confirmMsg)) return;

    try {
      setOrderActionLoading(orderId);
      const res = await fetch('/api/admin/shop', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchShopData();
      } else {
        alert(data.error || 'Holatni yangilab bo‘lmadi');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setOrderActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (orderFilter !== 'ALL' && order.status !== orderFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const studentName = `${order.studentId?.firstName || ''} ${order.studentId?.lastName || ''}`.toLowerCase();
      const productTitle = (order.productId?.title || '').toLowerCase();
      const phone = (order.studentId?.phone || '').toLowerCase();
      return studentName.includes(q) || productTitle.includes(q) || phone.includes(q);
    }
    return true;
  });

  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-amber-500" />
            XCoin Sovg'alar Do'koni Boshqaruvi
          </h1>
          <p className="text-sm text-gray-500">
            Talabalar yig'gan XCoin tangalariga sovg'alar buyurtmasini qabul qilish va yangi mahsulotlar kiritish
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Yangi Mahsulot Qo'shish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Talabalar Buyurtmalari
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full font-bold">
              {pendingOrdersCount} yangi
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Mavjud Mahsulotlar Katalogi ({products.length})
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Talaba ismi, telefoni yoki mahsulot bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={orderFilter}
                onChange={(e: any) => setOrderFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">Barcha buyurtmalar</option>
                <option value="PENDING">Kutilmoqda (Topshirilmagan)</option>
                <option value="FULFILLED">Yetkazilgan (Topshirildi)</option>
                <option value="CANCELLED">Bekor qilingan</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Yuklanmoqda...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Ushbu toifada buyurtmalar mavjud emas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Talaba</th>
                      <th className="px-5 py-3">Mahsulot</th>
                      <th className="px-5 py-3">Narxi</th>
                      <th className="px-5 py-3">Vaqti</th>
                      <th className="px-5 py-3">Holati</th>
                      <th className="px-5 py-3 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => {
                      const isPending = order.status === 'PENDING';
                      const isFulfilled = order.status === 'FULFILLED';
                      const isCancelled = order.status === 'CANCELLED';

                      return (
                        <tr key={order._id} className="hover:bg-gray-50">
                          {/* Student */}
                          <td className="px-5 py-3">
                            <div className="font-semibold text-gray-900">
                              {order.studentId?.firstName} {order.studentId?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{order.studentId?.phone}</div>
                          </td>

                          {/* Product */}
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              {order.productId?.imageUrl ? (
                                <img
                                  src={order.productId.imageUrl}
                                  alt={order.productId?.title}
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {order.productId?.title || 'O‘chirilgan mahsulot'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {order.productId?.category || 'Sovg‘a'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-5 py-3 font-semibold text-amber-600">
                            {order.priceXCoin} 🪙
                          </td>

                          {/* Date */}
                          <td className="px-5 py-3 text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString('uz-UZ')}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                                <Clock className="w-3.5 h-3.5" />
                                Kutilmoqda
                              </span>
                            )}
                            {isFulfilled && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Topshirildi
                              </span>
                            )}
                            {isCancelled && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                                <XCircle className="w-3.5 h-3.5" />
                                Bekor qilindi
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3 text-right">
                            {isPending && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateOrderStatus(order._id, 'FULFILLED')}
                                  disabled={orderActionLoading === order._id}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                                >
                                  Topshirildi ✅
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order._id, 'CANCELLED')}
                                  disabled={orderActionLoading === order._id}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition-all"
                                >
                                  Bekor qilish
                                </button>
                              </div>
                            )}
                            {!isPending && (
                              <span className="text-xs text-gray-400">Amal bajarilgan</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur text-white text-xs font-bold rounded-lg">
                    {product.stock} dona qoldi
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <span className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 font-bold rounded-md">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base">{product.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="font-extrabold text-amber-600 text-lg">
                  {product.priceXCoin} 🪙
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {product.isActive ? 'Faol' : 'Nofaol'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-amber-500" />
                Yangi Mahsulot Qo'shish
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Mahsulot Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: InFast Dasturchi Xudi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Rasm Havolasi (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/rasm.jpg (yoki Unsplash / CDN)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Narxi (XCoin) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={priceXCoin}
                    onChange={(e) => setPriceXCoin(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Soni (Omborda) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Kategoriya
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                >
                  <option value="MERCH">MERCH (Kiyim, Futbolka, Xudi)</option>
                  <option value="ACCESSORY">ACCESSORY (Termos, Ryukzak, Stikerlar)</option>
                  <option value="TECH">TECH (Klaviatura, Sichqoncha, Quloqchin)</option>
                  <option value="SPECIAL">SPECIAL (Maxsus kurs, Sertifikat)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tavsif (Ixtiyoriy)
                </label>
                <textarea
                  rows={3}
                  placeholder="Mahsulot haqida batafsil ma'lumot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

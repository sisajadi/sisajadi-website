import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  Search,
  Package,
  Store,
  Leaf,
  Truck,
  Clock,
  CheckCircle2,
  PackageCheck,
  Sparkles,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka || 0);
};

const formatTanggal = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const STATUS_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'pending_payment', label: 'Belum Bayar' },
  { key: 'processing', label: 'Diproses' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'completed', label: 'Selesai' },
];

const STATUS_CONFIG = {
  pending_payment: {
    label: 'Menunggu Pembayaran',
    badgeClass: 'bg-[#D96B27]/10 text-[#D96B27] border-[#D96B27]/20',
    icon: Clock,
  },
  confirmed: {
    label: 'Pembayaran Dikonfirmasi',
    badgeClass: 'bg-[#1A5235]/10 text-[#1A5235] border-[#1A5235]/20',
    icon: CheckCircle2,
  },
  preparing: {
    label: 'Disiapkan Mitra',
    badgeClass: 'bg-[#1A5235]/10 text-[#1A5235] border-[#1A5235]/20',
    icon: PackageCheck,
  },
  shipped: {
    label: 'Dikirim / Siap Diambil',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Truck,
  },
  completed: {
    label: 'Selesai',
    badgeClass: 'bg-[#EAF4EE] text-[#1A5235] border-[#1A5235]/25',
    icon: Sparkles,
  },
};

export default function OrderHistoryPage() {
  const { orders, confirmOrderReceived } = useCart();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Hitung total limbah terselamatkan dari pesanan yang sudah dibayar / selesai
  const totalSavedWeight = useMemo(() => {
    return orders
      .filter((ord) => ord.status !== 'pending_payment')
      .reduce((sum, ord) => sum + (ord.total_berat_kg || 0), 0);
  }, [orders]);

  // Filter daftar pesanan berdasarkan tab status dan pencarian
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'processing'
          ? order.status === 'confirmed' || order.status === 'preparing'
          : order.status === activeTab;

      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchItem = order.items?.some(
        (item) =>
          item.nama_bahan.toLowerCase().includes(q) ||
          item.seller_name.toLowerCase().includes(q)
      );

      return matchId || matchItem;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link
            to="/"
            className="hover:text-[#1A5235] transition-colors flex items-center"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-800">Riwayat Pesanan</span>
        </nav>

        {/* Header & Banner Eco-Impact */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Daftar Pesanan Saya
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pantau status pengiriman bahan sisa dan catatan kontribusi lingkunganmu.
            </p>
          </div>

          <div className="rounded-xl bg-[#EAF4EE] border border-[#1A5235]/15 px-4 py-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#1A5235] text-white flex items-center justify-center flex-shrink-0">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-[#1A5235]/80 uppercase tracking-wide">
                Total Eco-Impact
              </span>
              <span className="text-base font-extrabold text-[#1A5235]">
                {totalSavedWeight} kg Limbah Terselamatkan
              </span>
            </div>
          </div>
        </div>

        {/* Filter Status & Pencarian */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tab Status */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {STATUS_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#1A5235] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Input Pencarian */}
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID pesanan atau bahan..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#1A5235]"
              />
            </div>
          </div>
        </div>

        {/* Daftar Kartu Pesanan */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Belum Ada Pesanan
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Tidak ada transaksi yang sesuai dengan filter saat ini.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#1A5235] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#144029] transition-colors"
            >
              Mulai Belanja Bahan Sisa
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo =
                STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;
              const StatusIcon = statusInfo.icon;
              const firstItem = order.items?.[0];
              const extraItemsCount = (order.items?.length || 1) - 1;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:border-[#1A5235]/30 transition-all"
                >
                  {/* Baris Atas: ID Pesanan, Tanggal & Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                        <Package className="h-4 w-4 text-[#1A5235]" />
                        {order.id}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">
                        {formatTanggal(order.created_at)}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="text-slate-500 hidden sm:inline">
                        {order.kurir}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Baris Tengah: Preview Produk & Ringkasan Nominal */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {firstItem && (
                      <div className="flex items-start gap-4">
                        <img
                          src={firstItem.foto}
                          alt={firstItem.nama_bahan}
                          className="h-16 w-20 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A5235]">
                            <Store className="h-3.5 w-3.5" />
                            <span>{firstItem.seller_name}</span>
                          </div>
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base mt-0.5">
                            {firstItem.nama_bahan}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {firstItem.qty} {firstItem.satuan} ×{' '}
                            {formatRupiah(firstItem.harga)}
                            {extraItemsCount > 0 && (
                              <span className="ml-2 font-semibold text-[#1A5235]">
                                (+{extraItemsCount} produk lainnya)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Total Bayar & Eco-Impact */}
                    <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex sm:flex-col justify-between items-center sm:items-end">
                      <div>
                        <span className="block text-xs text-slate-500">
                          Total Pembayaran
                        </span>
                        <span className="text-lg font-extrabold text-[#1A5235]">
                          {formatRupiah(order.total_bayar)}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A5235] bg-[#EAF4EE] px-2.5 py-0.5 rounded-full mt-1">
                        <Leaf className="h-3 w-3" />
                        {order.total_berat_kg} kg terselamatkan
                      </span>
                    </div>
                  </div>

                  {/* Baris Bawah: Tombol Aksi */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                    {order.status === 'shipped' && (
                      <button
                        type="button"
                        onClick={() => confirmOrderReceived(order.id)}
                        className="px-4 py-2 rounded-xl border border-[#1A5235] text-[#1A5235] hover:bg-[#1A5235]/5 text-xs sm:text-sm font-bold transition-colors"
                      >
                        Pesanan Diterima
                      </button>
                    )}

                    <Link
                      to={`/orders/${order.id}`}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-colors ${
                        order.status === 'pending_payment'
                          ? 'bg-[#D96B27] hover:bg-[#c25d1f]'
                          : 'bg-[#1A5235] hover:bg-[#144029]'
                      }`}
                    >
                      <span>
                        {order.status === 'pending_payment'
                          ? 'Bayar Sekarang'
                          : 'Lacak & Detail Pesanan'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
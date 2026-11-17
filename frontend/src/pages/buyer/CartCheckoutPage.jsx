import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  Store,
  BadgeCheck,
  MapPin,
  Leaf,
  Minus,
  Plus,
  Trash2,
  Pencil,
  Truck,
  Package,
  Building2,
  ReceiptText,
  Globe,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

// Helper format Rupiah lokal (bisa diganti import formatters.js setelah FE 1 merge)
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka || 0);
};

export default function CartCheckoutPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    groupedBySeller,
    shippingAddress,
    setShippingAddress,
    selectedCourierId,
    setSelectedCourierId,
    courierOptions,
    summary,
    updateQuantity,
    removeFromCart,
    createOrder,
  } = useCart();

  // State modal ubah alamat & pilihan metode pembayaran
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(shippingAddress);
  const [paymentMethod, setPaymentMethod] = useState('QRIS');

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setShippingAddress(addressForm);
    setIsEditingAddress(false);
  };

  const handleCheckout = () => {
    const newOrder = createOrder(paymentMethod);
    if (newOrder) {
      navigate(`/orders/${newOrder.id}`);
    }
  };

  const getCourierIcon = (id) => {
    if (id === 'pickup') return <Building2 className="h-5 w-5 text-[#1A5235]" />;
    if (id === 'local_instant') return <Truck className="h-5 w-5 text-[#1A5235]" />;
    return <Package className="h-5 w-5 text-[#1A5235]" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-[#1A5235] transition-colors flex items-center">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-800">Keranjang</span>
        </nav>

        {cartItems.length === 0 ? (
          /* Tampilan Jika Keranjang Kosong */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#1A5235]/10 text-[#1A5235] flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Keranjang Belanja Kosong</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Belum ada bahan sisa produksi yang dipilih. Yuk jelajahi katalog kain perca, kertas, atau kayu dari mitra sekitar!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#1A5235] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#144029] transition-colors"
            >
              Jelajahi Katalog Bahan
            </Link>
          </div>
        ) : (
          /* Layout Utama 2 Kolom sesuai Desain */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* KOLOM KIRI (8 Kolom): Daftar Item per Mitra, Alamat & Kurir */}
            <div className="lg:col-span-8 space-y-5">
              {/* Kartu Daftar Item Dikelompokkan per Toko Mitra */}
              {groupedBySeller.map((group) => (
                <div
                  key={group.seller_id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm"
                >
                  {/* Header Toko Mitra */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#1A5235]/10 text-[#1A5235] flex items-center justify-center">
                        <Store className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-slate-800 text-base">
                        {group.seller_name}
                      </span>
                      {group.seller_verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A5235] bg-[#1A5235]/10 px-2.5 py-0.5 rounded-full">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified Mitra
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{group.seller_city}</span>
                    </div>
                  </div>

                  {/* Daftar Bahan Sisa pada Mitra Ini */}
                  <div className="divide-y divide-slate-100">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="pt-4 first:pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Info Foto & Spesifikasi */}
                        <div className="flex items-start gap-4">
                          <img
                            src={item.foto}
                            alt={item.nama_bahan}
                            className="h-20 w-24 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-slate-100"
                          />
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                              {item.nama_bahan}
                            </h3>
                            <p className="text-sm font-bold text-[#1A5235] mt-1">
                              {formatRupiah(item.harga)} / {item.satuan}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <Leaf className="h-3.5 w-3.5 text-[#1A5235]" />
                              <span>
                                Stok: {item.stok} {item.satuan}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Kontrol Kuantitas, Subtotal Item & Hapus */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {/* Stepper Qty */}
                          <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white px-1 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.qty - 1)}
                              disabled={item.qty <= (item.min_order || 1)}
                              className="p-1.5 text-slate-600 hover:text-[#1A5235] disabled:opacity-30 transition-colors"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3 text-sm font-semibold text-slate-800 min-w-[60px] text-center">
                              {item.qty} {item.satuan}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.qty + 1)}
                              disabled={item.qty >= item.stok}
                              className="p-1.5 text-slate-600 hover:text-[#1A5235] disabled:opacity-30 transition-colors"
                              aria-label="Tambah jumlah"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Subtotal Item */}
                          <span className="font-bold text-slate-800 text-sm sm:text-base min-w-[95px] text-right">
                            {formatRupiah(item.harga * item.qty)}
                          </span>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Hapus item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Bar Ringkasan Berat Total & Jumlah Item */}
              <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-3.5 shadow-sm flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-bold text-[#1A5235]">
                  <Leaf className="h-4 w-4" />
                  <span>Total Berat: {summary.totalWeightKg} kg</span>
                </div>
                <span className="font-medium text-slate-500">
                  {summary.totalItems} item dipilih
                </span>
              </div>

              {/* Kartu Alamat Pengiriman */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#1A5235] mt-0.5 flex-shrink-0" />
                    <div>
                      <h2 className="font-bold text-slate-800 text-base">
                        Alamat Pengiriman
                      </h2>
                      <p className="font-bold text-slate-800 text-sm mt-2">
                        {shippingAddress.penerima}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {shippingAddress.telepon}
                      </p>
                      <p className="text-sm text-slate-600 mt-1 flex items-start gap-1.5">
                        <Home className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{shippingAddress.alamat_lengkap}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAddressForm(shippingAddress);
                      setIsEditingAddress(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#1A5235] hover:text-[#1A5235] transition-colors flex-shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Ubah Alamat
                  </button>
                </div>
              </div>

              {/* Kartu Pilih Kurir */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <Truck className="h-5 w-5 text-[#1A5235]" />
                  <h2 className="font-bold text-slate-800 text-base">Pilih Kurir</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {courierOptions.map((kurir) => {
                    const isSelected = selectedCourierId === kurir.id;
                    return (
                      <button
                        key={kurir.id}
                        type="button"
                        onClick={() => setSelectedCourierId(kurir.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#1A5235] bg-[#1A5235]/[0.04]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            {/* Radio Circle */}
                            <span
                              className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'border-[#1A5235]'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSelected && (
                                <span className="h-2 w-2 rounded-full bg-[#1A5235]" />
                              )}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                {getCourierIcon(kurir.id)}
                                <span className="font-bold text-slate-800 text-xs sm:text-sm leading-tight">
                                  {kurir.nama}
                                </span>
                              </div>
                            </div>
                          </div>

                          {kurir.badge && (
                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#1A5235]/15 text-[#1A5235]">
                              {kurir.badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 pl-6 flex items-center justify-between text-xs">
                          <span className="text-slate-500">{kurir.estimasi}</span>
                          {kurir.ongkir > 0 && (
                            <span className="font-bold text-slate-800">
                              {formatRupiah(kurir.ongkir)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* KOLOM KANAN (4 Kolom): Ringkasan Pesanan & Eco-Impact */}
            <div className="lg:col-span-4 lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="h-8 w-8 rounded-lg bg-[#1A5235] text-white flex items-center justify-center">
                    <ReceiptText className="h-4 w-4" />
                  </div>
                  <h2 className="font-bold text-slate-800 text-lg">
                    Ringkasan Pesanan
                  </h2>
                </div>

                {/* Rincian Subtotal */}
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Subtotal ({summary.totalItems} item)
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatRupiah(summary.subtotal)}
                    </span>
                  </div>

                  {/* Kotak Eco-Impact Tracker */}
                  <div className="rounded-xl bg-[#EAF4EE] border border-[#1A5235]/15 p-4 flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-full bg-[#1A5235]/15 text-[#1A5235] flex items-center justify-center flex-shrink-0">
                      <Globe className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-[#1A5235] leading-snug">
                      Kamu menyelamatkan {summary.totalWeightKg} kg limbah produksi!
                    </p>
                  </div>

                  {/* Ongkos Kirim */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Ongkos Kirim</span>
                    <span className="font-bold text-slate-800">
                      {summary.shippingCost === 0
                        ? 'Gratis'
                        : formatRupiah(summary.shippingCost)}
                    </span>
                  </div>

                  {/* Pilihan Metode Pembayaran Ringkas */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['QRIS', 'Virtual Account'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                            paymentMethod === method
                              ? 'border-[#1A5235] bg-[#1A5235]/10 text-[#1A5235]'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total Pembayaran */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between mb-5">
                  <span className="font-bold text-slate-800 text-base">
                    Total Pembayaran
                  </span>
                  <span className="font-extrabold text-[#1A5235] text-2xl">
                    {formatRupiah(summary.totalPayment)}
                  </span>
                </div>

                {/* Tombol CTA Oranye */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-[#D96B27] hover:bg-[#c25d1f] text-white font-bold py-3.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Lanjut ke Pembayaran</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ubah Alamat Pengiriman */}
      {isEditingAddress && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-lg">
                Ubah Alamat Pengiriman
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingAddress(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.penerima}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, penerima: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1A5235]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.telepon}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, telepon: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1A5235]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows="3"
                  required
                  value={addressForm.alamat_lengkap}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      alamat_lengkap: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1A5235] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1A5235] text-white text-xs font-bold hover:bg-[#144029]"
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
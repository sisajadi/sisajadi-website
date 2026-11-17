import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  Sparkles,
  Copy,
  Check,
  QrCode,
  CreditCard,
  MapPin,
  Store,
  Leaf,
  ReceiptText,
  AlertCircle,
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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { orders, confirmOrderReceived } = useCart();

  const order = orders.find((item) => item.id === id) || orders[0];

  // State lokal untuk simulasi perubahan status saat pengujian tanpa backend
  const [simulatedStatus, setSimulatedStatus] = useState(null);
  const [copiedText, setCopiedText] = useState('');
  const [timeLeft, setTimeLeft] = useState('23:59:59');

  const currentStatus = simulatedStatus || order?.status;

  // Hitung mundur batas waktu pembayaran
  useEffect(() => {
    if (!order?.batas_bayar || currentStatus !== 'pending_payment') return;

    const updateTimer = () => {
      const deadline = new Date(order.batas_bayar).getTime();
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [order, currentStatus]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleConfirmReceived = () => {
    confirmOrderReceived(order.id);
    setSimulatedStatus('completed');
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <AlertCircle className="h-12 w-12 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Pesanan Tidak Ditemukan
        </h2>
        <Link
          to="/orders"
          className="text-sm font-semibold text-[#1A5235] hover:underline"
        >
          Kembali ke Daftar Riwayat Pesanan
        </Link>
      </div>
    );
  }

  // Pemetaan status ke indeks stepper 4 tahap
  const statusIndexMap = {
    pending_payment: -1,
    confirmed: 0,
    preparing: 1,
    shipped: 2,
    completed: 3,
  };
  const activeStepIndex = statusIndexMap[currentStatus] ?? -1;

  const isPickup = order.kurir?.toLowerCase().includes('pick-up');

  const steps = [
    {
      key: 'confirmed',
      title: 'Pembayaran Dikonfirmasi',
      desc: 'Dana terverifikasi sistem SisaJadi',
      icon: CheckCircle2,
    },
    {
      key: 'preparing',
      title: 'Disiapkan Mitra',
      desc: 'Mitra mengemas potongan bahan sisa',
      icon: PackageCheck,
    },
    {
      key: 'shipped',
      title: isPickup ? 'Siap Diambil' : 'Dikirim Kargo',
      desc: isPickup
        ? 'Bahan siap diambil di lokasi mitra'
        : `Dalam pengiriman via ${order.kurir}`,
      icon: Truck,
    },
    {
      key: 'completed',
      title: 'Selesai',
      desc: 'Pesanan diterima & eco-impact tercatat',
      icon: Sparkles,
    },
  ];

  // Log status pengiriman dinamis berdasarkan progres
  const trackingLogs = [
    ...(activeStepIndex >= 3
      ? [
          {
            time: 'Baru saja',
            title: 'Pesanan Selesai',
            detail: `Pembeli mengonfirmasi bahan diterima. ${order.total_berat_kg} kg limbah produksi resmi terselamatkan.`,
          },
        ]
      : []),
    ...(activeStepIndex >= 2
      ? [
          {
            time: 'Hari ini, 14:20 WIB',
            title: isPickup
              ? 'Siap Diambil di Workshop Mitra'
              : `Paket Diserahkan ke ${order.kurir}`,
            detail: isPickup
              ? 'Tunjukkan kode pesanan saat pengambilan barang di lokasi mitra.'
              : `Nomor resi pengiriman: ${order.no_resi || 'SJ-Kargo-882190'}`,
          },
        ]
      : []),
    ...(activeStepIndex >= 1
      ? [
          {
            time: 'Hari ini, 10:05 WIB',
            title: 'Mitra Menyiapkan Bahan Sisa',
            detail: 'Mitra sedang melakukan penimbangan dan pengemasan bahan.',
          },
        ]
      : []),
    ...(activeStepIndex >= 0
      ? [
          {
            time: formatTanggal(order.created_at),
            title: 'Pembayaran Berhasil Dikonfirmasi',
            detail: `Pembayaran via ${order.metode_pembayaran} sebesar ${formatRupiah(
              order.total_bayar
            )} telah diterima.`,
          },
        ]
      : [
          {
            time: formatTanggal(order.created_at),
            title: 'Menunggu Pembayaran',
            detail: `Selesaikan pembayaran melalui ${order.metode_pembayaran} sebelum batas waktu berakhir.`,
          },
        ]),
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header Navigasi */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#1A5235] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Pesanan
          </Link>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500">ID Pesanan:</span>
            <span className="font-bold text-slate-800">{order.id}</span>
            <button
              type="button"
              onClick={() => handleCopy(order.id, 'orderId')}
              className="p-1 text-slate-400 hover:text-[#1A5235] transition-colors"
              title="Salin ID Pesanan"
            >
              {copiedText === 'orderId' ? (
                <Check className="h-4 w-4 text-[#1A5235]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Kotak Instruksi Pembayaran + Countdown (Tampil Jika Pending Payment) */}
        {currentStatus === 'pending_payment' && (
          <div className="bg-white rounded-2xl border-2 border-[#D96B27]/40 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#D96B27]/15 text-[#D96B27] flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#D96B27]">
                    Menunggu Pembayaran
                  </span>
                  <h2 className="text-lg font-bold text-slate-800">
                    Selesaikan Pembayaran via {order.metode_pembayaran}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Batas akhir: {formatTanggal(order.batas_bayar)}
                  </p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-[#D96B27]/10 border border-[#D96B27]/20 rounded-xl px-4 py-2.5 text-center">
                <span className="block text-[11px] font-semibold text-[#D96B27]">
                  Sisa Waktu Bayar
                </span>
                <span className="font-mono text-xl font-extrabold text-[#D96B27]">
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Detail QRIS / Virtual Account */}
            <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-500">Total Tagihan</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-extrabold text-[#1A5235]">
                      {formatRupiah(order.total_bayar)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(String(order.total_bayar), 'nominal')
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A5235] bg-[#1A5235]/10 px-2.5 py-1 rounded-lg hover:bg-[#1A5235]/20"
                    >
                      {copiedText === 'nominal' ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Salin
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {order.metode_pembayaran === 'QRIS' ? (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pindai kode QRIS di samping menggunakan aplikasi m-Banking
                    atau e-Wallet (GoPay, OVO, DANA, ShopeePay). Sistem akan
                    memverifikasi otomatis dalam 1–2 menit.
                  </p>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <span className="text-xs text-slate-500 block">
                      Nomor Virtual Account (BCA / Mandiri / BNI)
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-base font-bold text-slate-800 tracking-wider">
                        8801 0812 3456 7890
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy('8801081234567890', 'va')}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1A5235]"
                      >
                        {copiedText === 'va' ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Salin VA
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tombol Simulasi untuk Demo Flow FE 3 */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSimulatedStatus('shipped')}
                    className="text-xs font-semibold text-[#1A5235] underline hover:text-[#144029]"
                  >
                    [Simulasi Demo: Tandai Sudah Dibayar & Dikirim]
                  </button>
                </div>
              </div>

              {/* Visual Kotak QRIS / Icon VA */}
              <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                {order.metode_pembayaran === 'QRIS' ? (
                  <>
                    <div className="h-36 w-36 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-xs">
                      <QrCode className="h-28 w-28 text-slate-800" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 mt-2.5">
                      NMID: ID1026000918273 • SisaJadi
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full bg-[#1A5235]/10 text-[#1A5235] flex items-center justify-center mb-2">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {order.metode_pembayaran}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      Verifikasi Otomatis
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kartu Stepper Status 4 Tahap */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Status Pelacakan Pesanan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dipesan pada {formatTanggal(order.created_at)}
              </p>
            </div>

            {currentStatus === 'shipped' && (
              <button
                type="button"
                onClick={handleConfirmReceived}
                className="bg-[#1A5235] hover:bg-[#144029] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                Konfirmasi Pesanan Diterima
              </button>
            )}
          </div>

          {/* 4-Step Horizontal Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isCompleted = index <= activeStepIndex;
              const isCurrent = index === activeStepIndex;

              return (
                <div
                  key={step.key}
                  className={`relative rounded-xl border p-4 transition-all ${
                    isCurrent
                      ? 'border-[#1A5235] bg-[#1A5235]/[0.05]'
                      : isCompleted
                      ? 'border-[#1A5235]/30 bg-white'
                      : 'border-slate-200 bg-slate-50/60 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                        isCompleted
                          ? 'bg-[#1A5235] text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      Tahap {index + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid 2 Kolom: Log Pengiriman & Rincian Pesanan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri (7 Kolom): Info Resi, Alamat & Log Pengiriman */}
          <div className="lg:col-span-7 space-y-6">
            {/* Info Pengiriman & Nomor Resi */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#1A5235]" />
                  <h2 className="font-bold text-slate-800 text-base">
                    Informasi Logistik & Resi
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#1A5235] bg-[#1A5235]/10 px-3 py-1 rounded-full">
                  {order.kurir}
                </span>
              </div>

              {order.no_resi && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <div>
                    <span className="text-xs text-slate-500 block">
                      Nomor Resi Pengiriman
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-800">
                      {order.no_resi}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.no_resi, 'resi')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A5235] hover:underline"
                  >
                    {copiedText === 'resi' ? (
                      <>
                        <Check className="h-4 w-4" /> Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Salin Resi
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex items-start gap-3 pt-1">
                <MapPin className="h-5 w-5 text-[#1A5235] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-500">
                    Alamat Tujuan
                  </span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {order.alamat?.penerima} ({order.alamat?.telepon})
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {order.alamat?.alamat_lengkap}
                  </p>
                </div>
              </div>
            </div>

            {/* Riwayat Log Perjalanan / Status */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 text-base mb-5">
                Log Aktivitas Pesanan
              </h2>
              <div className="space-y-5 border-l-2 border-[#1A5235]/25 ml-2.5 pl-5">
                {trackingLogs.map((log, idx) => (
                  <div key={idx} className="relative">
                    <span
                      className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                        idx === 0 ? 'bg-[#1A5235]' : 'bg-slate-300'
                      }`}
                    />
                    <span className="text-xs font-medium text-slate-400">
                      {log.time}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-0.5">
                      {log.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {log.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan (5 Kolom): Daftar Item & Ringkasan Biaya */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ReceiptText className="h-5 w-5 text-[#1A5235]" />
              <h2 className="font-bold text-slate-800 text-base">
                Rincian Bahan Sisa
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 flex gap-3">
                  <img
                    src={item.foto}
                    alt={item.nama_bahan}
                    className="h-14 w-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1A5235]">
                      <Store className="h-3 w-3" />
                      <span className="truncate">{item.seller_name}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate mt-0.5">
                      {item.nama_bahan}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>
                        {item.qty} {item.satuan} × {formatRupiah(item.harga)}
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatRupiah(item.harga * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Eco-Impact Badge */}
            <div className="rounded-xl bg-[#EAF4EE] border border-[#1A5235]/15 p-3.5 flex items-center gap-3">
              <Leaf className="h-5 w-5 text-[#1A5235] flex-shrink-0" />
              <p className="text-xs font-bold text-[#1A5235]">
                Total limbah produksi terselamatkan: {order.total_berat_kg} kg
              </p>
            </div>

            {/* Rincian Nominal */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Bahan</span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim</span>
                <span className="font-semibold text-slate-800">
                  {order.ongkir === 0 ? 'Gratis' : formatRupiah(order.ongkir)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-base">
                <span className="text-slate-800">Total Bayar</span>
                <span className="text-[#1A5235]">
                  {formatRupiah(order.total_bayar)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
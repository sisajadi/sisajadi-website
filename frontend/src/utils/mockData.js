// Data dummy

export const MOCK_CART_ITEMS = [
  {
    id: 1,
    material_id: 101,
    seller_id: 11,
    seller_name: 'Konveksi Maju Jaya',
    seller_verified: true,
    seller_city: 'Kota Bandung',
    nama_bahan: 'Kain Katun Combed 30s Perca Warna Earth Tone',
    kategori: 'Kain Konveksi',
    harga: 18000,
    satuan: 'kg',
    stok: 45,
    min_order: 1,
    qty: 2,
    berat_per_unit_kg: 1, // 2 kg x 1 kg = 2 kg
    foto: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=300&q=80',
  },
  {
    id: 2,
    material_id: 102,
    seller_id: 12,
    seller_name: 'Percetakan Nusantara',
    seller_verified: false,
    seller_city: 'Kota Surabaya',
    nama_bahan: 'Sisa Kertas Art Carton 260gsm - 100 Lembar',
    kategori: 'Kertas Percetakan',
    harga: 45000,
    satuan: 'bundle',
    stok: 20,
    min_order: 1,
    qty: 1,
    berat_per_unit_kg: 6, // 1 bundle x 6 kg = 6 kg (Total bersama item 1 = 8 kg)
    foto: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&q=80',
  },
];

export const MOCK_SHIPPING_ADDRESS = {
  id: 1,
  penerima: 'Kinaya Arsara',
  telepon: '0812-3456-7890',
  alamat_lengkap: 'Jl. Melati No.123, Banjarmasin, Kalimantan Selatan, 70123',
};

export const COURIER_OPTIONS = [
  {
    id: 'pickup',
    nama: 'Ambil di Tempat / Pick-up',
    estimasi: 'Langsung ambil di lokasi seller',
    ongkir: 0,
    badge: 'Gratis',
  },
  {
    id: 'local_instant',
    nama: 'Kurir Lokal Instan',
    estimasi: '1–2 hari',
    ongkir: 25000,
    badge: null,
  },
  {
    id: 'cargo',
    nama: 'Kargo Ekonomis',
    estimasi: '3–7 hari',
    ongkir: 15000,
    badge: null,
  },
];

export const MOCK_ORDERS = [
  {
    id: 'ORD-20261117-001',
    created_at: '2026-11-17T08:30:00Z',
    status: 'pending_payment', // pending_payment | confirmed | preparing | shipped | completed
    metode_pembayaran: 'QRIS',
    batas_bayar: '2026-11-18T08:30:00Z',
    kurir: 'Kurir Lokal Instan',
    no_resi: null,
    alamat: MOCK_SHIPPING_ADDRESS,
    items: MOCK_CART_ITEMS,
    subtotal: 81000,
    ongkir: 25000,
    total_bayar: 106000,
    total_berat_kg: 8,
  },
  {
    id: 'ORD-20261114-002',
    created_at: '2026-11-14T10:15:00Z',
    status: 'shipped',
    metode_pembayaran: 'Virtual Account BCA',
    batas_bayar: null,
    kurir: 'Kargo Ekonomis',
    no_resi: 'KRG-8829104412',
    alamat: MOCK_SHIPPING_ADDRESS,
    items: [MOCK_CART_ITEMS[0]],
    subtotal: 36000,
    ongkir: 15000,
    total_bayar: 51000,
    total_berat_kg: 2,
  },
];
import { createContext, useContext, useState, useMemo } from 'react';
import {
  MOCK_CART_ITEMS,
  MOCK_SHIPPING_ADDRESS,
  COURIER_OPTIONS,
  MOCK_ORDERS,
} from '../utils/mockData';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Menggunakan data awal dari mockData agar tampilan keranjang & checkout langsung terisi saat pengujian
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [shippingAddress, setShippingAddress] = useState(MOCK_SHIPPING_ADDRESS);
  const [selectedCourierId, setSelectedCourierId] = useState('local_instant');
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // Tambah item ke keranjang dengan validasi min_order dan stok maksimal
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.material_id === product.material_id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const nextQty = Math.min(current.qty + (product.qty || 1), current.stok);
        updated[existingIndex] = { ...current, qty: nextQty };
        return updated;
      }

      const initialQty = Math.min(
        Math.max(product.min_order || 1, product.qty || 1),
        product.stok
      );

      return [
        ...prev,
        {
          ...product,
          id: Date.now(),
          qty: initialQty,
        },
      ];
    });
  };

  // Ubah kuantitas item dengan batas bawah (min_order) dan batas atas (stok)
  const updateQuantity = (itemId, newQty) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const minQty = item.min_order || 1;
        const clampedQty = Math.max(minQty, Math.min(newQty, item.stok));
        return { ...item, qty: clampedQty };
      })
    );
  };

  // Hapus satu item dari keranjang
  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Kosongkan keranjang setelah checkout berhasil
  const clearCart = () => {
    setCartItems([]);
  };

  // Kelompokkan item berdasarkan toko mitra (sesuai kartu per mitra pada desain)
  const groupedBySeller = useMemo(() => {
    const groups = {};
    cartItems.forEach((item) => {
      if (!groups[item.seller_id]) {
        groups[item.seller_id] = {
          seller_id: item.seller_id,
          seller_name: item.seller_name,
          seller_verified: item.seller_verified,
          seller_city: item.seller_city,
          items: [],
        };
      }
      groups[item.seller_id].items.push(item);
    });
    return Object.values(groups);
  }, [cartItems]);

  // Opsi kurir yang sedang dipilih
  const selectedCourier = useMemo(() => {
    return (
      COURIER_OPTIONS.find((c) => c.id === selectedCourierId) ||
      COURIER_OPTIONS[0]
    );
  }, [selectedCourierId]);

  // Kalkulasi ringkasan harga, ongkir, dan total berat limbah (kg)
  const summary = useMemo(() => {
    const totalItems = cartItems.length;
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.harga * item.qty,
      0
    );
    const totalWeightKg = cartItems.reduce(
      (sum, item) => sum + (item.berat_per_unit_kg || 1) * item.qty,
      0
    );
    const shippingCost = totalItems === 0 ? 0 : selectedCourier.ongkir;
    const totalPayment = subtotal + shippingCost;

    return {
      totalItems,
      subtotal,
      totalWeightKg,
      shippingCost,
      totalPayment,
    };
  }, [cartItems, selectedCourier]);

  // Buat pesanan baru dari keranjang (simulasi sebelum integrasi POST /api/v1/orders)
  const createOrder = (paymentMethod = 'QRIS') => {
    if (cartItems.length === 0) return null;

    const now = new Date();
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Batas bayar 24 jam
    const orderId = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = {
      id: orderId,
      created_at: now.toISOString(),
      status: 'pending_payment',
      metode_pembayaran: paymentMethod,
      batas_bayar: deadline.toISOString(),
      kurir: selectedCourier.nama,
      no_resi: null,
      alamat: shippingAddress,
      items: [...cartItems],
      subtotal: summary.subtotal,
      ongkir: summary.shippingCost,
      total_bayar: summary.totalPayment,
      total_berat_kg: summary.totalWeightKg,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Konfirmasi pesanan diterima oleh pembeli (ubah status ke 'completed')
  const confirmOrderReceived = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, status: 'completed' } : ord
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        groupedBySeller,
        shippingAddress,
        setShippingAddress,
        selectedCourierId,
        setSelectedCourierId,
        selectedCourier,
        courierOptions: COURIER_OPTIONS,
        summary,
        orders,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        createOrder,
        confirmOrderReceived,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart harus digunakan di dalam CartProvider');
  }
  return context;
}
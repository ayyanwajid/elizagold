/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Settings,
  LogOut,
  Search,
  Truck,
  Download,
  Eye,
  TrendingUp,
  DollarSign,
  Package,
  Lock,
  Filter,
  Printer,
  MessageCircle,
  Bell,
  Star,
  CheckCircle2,
  XCircle,
  MapPin,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Phone,
  Clock,
  AlertCircle,
  PackageCheck
} from "lucide-react";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type TabType = "overview" | "orders" | "reviews" | "products" | "coupons" | "settings";

interface AdminOrder {
  _id?: string;
  orderId: string;
  customer: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
  };
  items: Array<{ name: string; bundleTitle: string; price: number; quantity: number }>;
  addMassager?: boolean;
  total: number;
  date: string;
  status: string;
}

interface AdminReview {
  _id?: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

// Sample seed orders for first load
const SAMPLE_ORDERS: AdminOrder[] = [
  {
    orderId: "EG-94821",
    customer: { fullName: "Mohammad Hamza", phone: "03001234567", city: "Lahore", address: "House 45, Street 12, DHA Phase 5" },
    items: [{ name: "Roghan-e-Azam Misali Hair Oil", bundleTitle: "2 Bottles (Popular Pack)", price: 2699, quantity: 1 }],
    addMassager: true, total: 2998, date: "28 Jul 2026", status: "Processing"
  },
  {
    orderId: "EG-94820",
    customer: { fullName: "Saba Tariq", phone: "03219876543", city: "Karachi", address: "Flat 4B, Silver Heights, Clifton Block 2" },
    items: [{ name: "Roghan-e-Azam Misali Hair Oil", bundleTitle: "3 Bottles (Family Pack)", price: 3699, quantity: 1 }],
    addMassager: false, total: 3699, date: "28 Jul 2026", status: "Dispatched"
  },
  {
    orderId: "EG-94819",
    customer: { fullName: "Usman Raza", phone: "03451122334", city: "Islamabad", address: "House 102, Street 7, Sector F-8/3" },
    items: [{ name: "Roghan-e-Azam Misali Hair Oil", bundleTitle: "1 Bottle (Starter Pack)", price: 1499, quantity: 1 }],
    addMassager: false, total: 1499, date: "27 Jul 2026", status: "Delivered"
  }
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  Pending:    { label: "Pending",    bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-300" },
  Processing: { label: "Processing", bg: "bg-purple-100",  text: "text-purple-800",  border: "border-purple-300" },
  Dispatched: { label: "Dispatched", bg: "bg-blue-100",    text: "text-blue-800",    border: "border-blue-300" },
  Delivered:  { label: "Delivered",  bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  Cancelled:  { label: "Cancelled",  bg: "bg-red-100",     text: "text-red-800",     border: "border-red-300" }
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<AdminOrder | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // New order notification state
  const [newOrderAlert, setNewOrderAlert] = useState<AdminOrder | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const prevOrderCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Products Pricing State (synced via localStorage to storefront)
  const [productPrices, setProductPrices] = useState({ bottle1: 1499, bottle2: 2699, bottle3: 3699 });

  // Coupons State
  const [coupons, setCoupons] = useState([
    { id: 1, code: "ELIZA10", discount: "10% OFF", discountValue: 10, type: "Percentage", active: true },
    { id: 2, code: "FREESHIP", discount: "Free Delivery", discountValue: 0, type: "Shipping", active: true }
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");
  const [newCouponValue, setNewCouponValue] = useState("");

  // Store Settings State
  const [announcementText, setAnnouncementText] = useState("FLASH SALE: 40% OFF + FREE CASH ON DELIVERY ACROSS PAKISTAN");
  const [whatsappNumber, setWhatsappNumber] = useState("+923001234567");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // ── CONVEX LIVE SUBSCRIPTIONS ──────────────────────────────────────────
  const convexOrders = useQuery(api.orders.listOrders);
  const convexReviews = useQuery(api.reviews.listReviews);
  const updateOrderStatusMutation = useMutation(api.orders.updateOrderStatus);

  // ── AUTH & INITIAL LOAD ────────────────────────────────────────────────
  useEffect(() => {
    const authSaved = localStorage.getItem("eliza_admin_auth");
    if (authSaved === "true") setIsAuthenticated(true);

    // Load prices from localStorage (written by admin, read by storefront)
    const savedPrices = localStorage.getItem("eliza_product_prices");
    if (savedPrices) setProductPrices(JSON.parse(savedPrices));

    // Load coupons
    const savedCoupons = localStorage.getItem("eliza_coupons");
    if (savedCoupons) setCoupons(JSON.parse(savedCoupons));

    // Load settings
    const savedAnnouncement = localStorage.getItem("eliza_announcement");
    if (savedAnnouncement) setAnnouncementText(savedAnnouncement);

    const savedWhatsapp = localStorage.getItem("eliza_whatsapp");
    if (savedWhatsapp) setWhatsappNumber(savedWhatsapp);

    // Seed with sample if nothing in convex yet
    try {
      const storedOrders = localStorage.getItem("eliza_orders_list");
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (!convexOrders || convexOrders.length === 0) setOrders(parsed);
      } else {
        setOrders(SAMPLE_ORDERS);
        localStorage.setItem("eliza_orders_list", JSON.stringify(SAMPLE_ORDERS));
      }
    } catch { setOrders(SAMPLE_ORDERS); }
  }, []);

  // ── SYNC CONVEX ORDERS LIVE ────────────────────────────────────────────
  useEffect(() => {
    if (!convexOrders || !Array.isArray(convexOrders) || convexOrders.length === 0) return;
    const formatted: AdminOrder[] = convexOrders.map((o: any) => ({
      _id: o._id, orderId: o.orderId, customer: o.customer,
      items: o.items, addMassager: o.addMassager, total: o.total,
      date: o.date, status: o.status
    }));

    // Detect new orders for notification
    if (isAuthenticated && prevOrderCountRef.current > 0 && formatted.length > prevOrderCountRef.current) {
      const newest = formatted[0];
      setNewOrderAlert(newest);
      setNotificationCount(c => c + (formatted.length - prevOrderCountRef.current));
      try { audioRef.current?.play(); } catch { /* ignore */ }
      setTimeout(() => setNewOrderAlert(null), 8000);
    }
    prevOrderCountRef.current = formatted.length;
    setOrders(formatted);
  }, [convexOrders, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SYNC CONVEX REVIEWS LIVE ───────────────────────────────────────────
  useEffect(() => {
    if (convexReviews && Array.isArray(convexReviews)) {
      setReviews(convexReviews.map((r: any) => ({
        _id: r._id, name: r.name, city: r.city, rating: r.rating,
        date: r.date, title: r.title, comment: r.comment, verified: r.verified
      })));
    }
  }, [convexReviews]);

  // ── HANDLERS ──────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === "admin123" || passcodeInput === "admin") {
      setIsAuthenticated(true);
      localStorage.setItem("eliza_admin_auth", "true");
      setPasscodeError(false);
      prevOrderCountRef.current = orders.length;
    } else {
      setPasscodeError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("eliza_admin_auth");
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, docId?: string) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem("eliza_orders_list", JSON.stringify(updated));
    try {
      if (docId && updateOrderStatusMutation) {
        await updateOrderStatusMutation({ id: docId as any, status: newStatus });
      }
    } catch { /* local fallback */ }
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Order ID,Customer,Phone,City,Address,Package,Massager,Total (PKR),Date,Status\n";
    orders.forEach(o => {
      csv += `"${o.orderId}","${o.customer.fullName}","${o.customer.phone}","${o.customer.city}","${o.customer.address.replace(/"/g,'""')}","${o.items?.[0]?.bundleTitle || ''}","${o.addMassager ? 'Yes' : 'No'}","${o.total}","${o.date}","${o.status}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `ElizaGold_Orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveProductPrices = () => {
    localStorage.setItem("eliza_product_prices", JSON.stringify(productPrices));
    alert("✅ Prices saved! Storefront will reflect updated prices.");
  };

  const saveCoupons = useCallback((updated: typeof coupons) => {
    setCoupons(updated);
    localStorage.setItem("eliza_coupons", JSON.stringify(updated));
  }, []);

  const saveSettings = () => {
    localStorage.setItem("eliza_announcement", announcementText);
    localStorage.setItem("eliza_whatsapp", whatsappNumber);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // ── METRICS ───────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredRevenue = orders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const processingCount = orders.filter(o => o.status === "Processing").length;
  const dispatchedCount = orders.filter(o => o.status === "Dispatched").length;
  const deliveredCount = orders.filter(o => o.status === "Delivered").length;
  const cancelledCount = orders.filter(o => o.status === "Cancelled").length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // City breakdown
  const cityMap: Record<string, number> = {};
  orders.forEach(o => { cityMap[o.customer.city] = (cityMap[o.customer.city] || 0) + 1; });
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Bundle popularity
  const bundleMap: Record<string, number> = {};
  orders.forEach(o => {
    const bundle = o.items?.[0]?.bundleTitle || "Unknown";
    bundleMap[bundle] = (bundleMap[bundle] || 0) + 1;
  });

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || o.orderId.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.customer.city.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── LOGIN SCREEN ───────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#041207] via-[#0b2912] to-[#041207] text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-black/60 backdrop-blur-xl border border-[#d4af37]/40 p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.2)] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-black/60 border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.5)] mx-auto flex items-center justify-center p-1">
            <Image src="/assets/logo-icon.png" alt="Eliza Gold" width={100} height={100} className="w-full h-full object-cover mix-blend-screen" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
              Eliza Gold Admin Panel
            </h1>
            <p className="text-xs text-emerald-200/70 mt-1 uppercase tracking-widest font-semibold">Store Operations Control Center</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> Admin Passcode
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter passcode (default: admin123)"
                className="w-full px-4 py-3 bg-white/10 border border-[#d4af37]/40 rounded-xl text-white outline-none focus:border-[#d4af37] text-sm"
              />
              {passcodeError && <p className="text-xs text-red-400 mt-1 font-semibold">❌ Incorrect passcode! Use &quot;admin123&quot;</p>}
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-[#d4af37] via-[#f7e092] to-[#d4af37] text-[#041207] py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg">
              Sign In To Control Panel
            </button>
          </form>
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#d4af37] hover:underline pt-2">← Return to Storefront</Link>
        </div>
      </div>
    );
  }

  // ── MAIN DASHBOARD ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col font-sans">
      {/* Notification sound (silent mp3 fallback) */}
      <audio ref={audioRef} src="data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA" preload="auto" />

      {/* NEW ORDER NOTIFICATION TOAST */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-[999] max-w-sm w-full bg-[#0b2912] text-white rounded-2xl shadow-2xl border border-[#d4af37]/60 p-4 animate-bounce">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[#041207]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-[#d4af37]">🛒 NEW ORDER RECEIVED!</p>
              <p className="text-xs font-bold mt-0.5">{newOrderAlert.customer.fullName} — {newOrderAlert.customer.city}</p>
              <p className="text-xs text-gray-300">{newOrderAlert.items?.[0]?.bundleTitle} · Rs. {newOrderAlert.total?.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{newOrderAlert.orderId}</p>
            </div>
            <button onClick={() => setNewOrderAlert(null)} className="text-gray-400 hover:text-white shrink-0">✕</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#041207] via-[#0b2912] to-[#041207] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#d4af37]/30 shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#d4af37] bg-black/40 overflow-hidden flex items-center justify-center p-0.5">
            <Image src="/assets/logo-icon.png" alt="Logo" width={50} height={50} className="w-full h-full object-cover mix-blend-screen" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0] leading-none">
              Eliza Gold Manager
            </h1>
            <span className="text-[9px] text-emerald-300 font-extrabold uppercase tracking-widest">Operations Control Center</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification bell */}
          <button
            onClick={() => { setActiveTab("orders"); setNotificationCount(0); }}
            className="relative p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Bell className="w-4 h-4 text-[#d4af37]" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>

          <Link href="/" target="_blank" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-lg border border-white/20 transition-colors">
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">View Storefront</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs px-3 py-1.5 rounded-lg border border-red-500/30 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 bg-[#05180a] text-white p-4 space-y-1.5 border-r border-[#0b2912] shrink-0 md:min-h-screen">
          <div className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest px-3 py-2">Control Modules</div>
          {([
            { id: "overview",  label: "Dashboard Overview",  icon: LayoutDashboard, badge: null },
            { id: "orders",    label: `Orders (${orders.length})`, icon: ShoppingBag, badge: (pendingCount + processingCount) > 0 ? pendingCount + processingCount : null },
            { id: "reviews",   label: `Reviews (${reviews.length})`, icon: Star, badge: null },
            { id: "products",  label: "Products & Pricing",  icon: Package,   badge: null },
            { id: "coupons",   label: "Coupons & Offers",    icon: Tag,        badge: null },
            { id: "settings",  label: "Store Settings",      icon: Settings,   badge: null }
          ] as const).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === (tab.id as TabType);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive ? "bg-[#d4af37] text-[#041207] shadow-md" : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Stats in sidebar */}
          <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
            <div className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest px-3">Live Stats</div>
            {[
              { label: "Pending",    count: pendingCount,    color: "bg-amber-500" },
              { label: "Processing", count: processingCount, color: "bg-purple-500" },
              { label: "Dispatched", count: dispatchedCount, color: "bg-blue-500" },
              { label: "Delivered",  count: deliveredCount,  color: "bg-emerald-500" },
              { label: "Cancelled",  count: cancelledCount,  color: "bg-red-500" }
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-[11px] text-gray-300">{s.label}</span>
                </div>
                <span className="text-[11px] font-black text-white">{s.count}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">

          {/* ═══ TAB 1: OVERVIEW ═══════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Store Dashboard</h2>
                  <p className="text-xs text-gray-500">Live revenue analytics & fulfillment metrics</p>
                </div>
                <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {/* STAT CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, sub: "All orders incl. COD", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "COD Collected", value: `Rs. ${deliveredRevenue.toLocaleString()}`, sub: `${deliveredCount} orders delivered`, icon: PackageCheck, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Total Orders", value: String(orders.length), sub: `${pendingCount + processingCount} need action`, icon: ShoppingBag, color: "text-[#d4af37]", bg: "bg-amber-50" },
                  { label: "Avg. Order Value", value: `Rs. ${avgOrderValue.toLocaleString()}`, sub: "Per transaction", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" }
                ].map(card => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <span>{card.label}</span>
                        <div className={`w-7 h-7 ${card.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                      </div>
                      <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{card.value}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{card.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* STATUS FUNNEL + CITY BREAKDOWN */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Funnel */}
                <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#d4af37]" />
                    <h3 className="font-bold text-gray-900 text-sm">Order Status Funnel</h3>
                  </div>
                  {[
                    { label: "Pending",    count: pendingCount,    total: orders.length, color: "bg-amber-400" },
                    { label: "Processing", count: processingCount, total: orders.length, color: "bg-purple-400" },
                    { label: "Dispatched", count: dispatchedCount, total: orders.length, color: "bg-blue-400" },
                    { label: "Delivered",  count: deliveredCount,  total: orders.length, color: "bg-emerald-400" },
                    { label: "Cancelled",  count: cancelledCount,  total: orders.length, color: "bg-red-400" }
                  ].map(s => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{s.label}</span>
                        <span className="font-bold">{s.count} ({s.total > 0 ? Math.round((s.count / s.total) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${s.color} h-2 rounded-full transition-all duration-500`} style={{ width: s.total > 0 ? `${(s.count / s.total) * 100}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* City Breakdown */}
                <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#d4af37]" />
                    <h3 className="font-bold text-gray-900 text-sm">Top Cities by Orders</h3>
                  </div>
                  {topCities.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No orders yet</p>
                  ) : topCities.map(([city, count], i) => (
                    <div key={city} className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-400 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700 mb-0.5">
                          <span>{city}</span>
                          <span>{count} orders</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-[#d4af37] h-1.5 rounded-full" style={{ width: `${(count / (topCities[0]?.[1] || 1)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bundle Popularity */}
              <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="font-bold text-gray-900 text-sm">Bundle Popularity</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(bundleMap).map(([bundle, count]) => (
                    <div key={bundle} className="bg-[#faf8f5] p-3 rounded-xl border border-[#e7e1d5] text-center">
                      <p className="text-xs font-bold text-gray-700 mb-1">{bundle}</p>
                      <p className="text-2xl font-extrabold text-[#0b2912]">{count}</p>
                      <p className="text-[10px] text-gray-400">orders</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-[#e7e1d5] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-[#0b2912] font-bold hover:underline">View All →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase">
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">City</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {orders.slice(0, 5).map(o => {
                        const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.Pending;
                        return (
                          <tr key={o.orderId} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-bold text-[#0b2912]">{o.orderId}</td>
                            <td className="py-2.5 px-3">{o.customer.fullName}</td>
                            <td className="py-2.5 px-3">{o.customer.city}</td>
                            <td className="py-2.5 px-3 font-bold">Rs. {o.total?.toLocaleString()}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${sc.bg} ${sc.text}`}>{o.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB 2: ORDERS ══════════════════════════════════════════════ */}
          {activeTab === "orders" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Orders Manager</h2>
                  <p className="text-xs text-gray-500">Manage COD orders, dispatch status & courier manifests</p>
                </div>
                <button onClick={handleExportCSV} className="inline-flex items-center gap-2 bg-[#0b2912] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#154620] transition-colors shadow-md self-start sm:self-auto">
                  <Download className="w-4 h-4 text-[#d4af37]" />
                  Export CSV Manifest
                </button>
              </div>

              {/* Search & Filter */}
              <div className="bg-white p-4 rounded-2xl border border-[#e7e1d5] flex flex-col sm:flex-row items-center gap-3 shadow-sm">
                <div className="relative w-full sm:flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, city or order #..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:border-[#0b2912]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-bold text-gray-700">
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <span className="text-xs text-gray-400 font-medium shrink-0">{filteredOrders.length} orders</span>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-[#e7e1d5] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0b2912] text-white font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Order ID</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">City</th>
                        <th className="py-3.5 px-4">Package</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Status & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map(o => {
                        const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.Pending;
                        const isExpanded = expandedOrderId === o.orderId;
                        return (
                          <React.Fragment key={o.orderId}>
                            <tr className="hover:bg-amber-50/40 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#0b2912]">{o.orderId}</div>
                                <button onClick={() => setExpandedOrderId(isExpanded ? null : o.orderId)} className="text-[10px] text-gray-400 hover:text-gray-700 flex items-center gap-0.5 mt-0.5">
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  {isExpanded ? "Hide" : "Details"}
                                </button>
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-gray-900">{o.customer.fullName}</p>
                                <a href={`tel:${o.customer.phone}`} className="text-[11px] text-blue-600 flex items-center gap-1 mt-0.5 hover:underline">
                                  <Phone className="w-3 h-3" />{o.customer.phone}
                                </a>
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-gray-700">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />{o.customer.city}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-medium text-gray-800">{o.items?.[0]?.bundleTitle || "Roghan-e-Azam"}</span>
                                {o.addMassager && <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">+ Scalp Massager</span>}
                              </td>
                              <td className="py-3.5 px-4 font-extrabold text-gray-900">Rs. {o.total?.toLocaleString()}</td>
                              <td className="py-3.5 px-4 text-gray-500">
                                <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{o.date}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <select
                                    value={o.status || "Pending"}
                                    onChange={e => updateOrderStatus(o.orderId, e.target.value, o._id)}
                                    className={`px-2.5 py-1.5 text-xs rounded-lg font-bold outline-none border transition-colors cursor-pointer ${sc.bg} ${sc.text} ${sc.border}`}
                                  >
                                    <option value="Pending">🟡 Pending</option>
                                    <option value="Processing">🟣 Processing</option>
                                    <option value="Dispatched">🔵 Dispatched</option>
                                    <option value="Delivered">🟢 Delivered</option>
                                    <option value="Cancelled">🔴 Cancelled</option>
                                  </select>
                                  <a
                                    href={`https://wa.me/${o.customer.phone.replace(/[^0-9]/g, "")}?text=Assalam%20o%20Alaikum%20${encodeURIComponent(o.customer.fullName)}!%20Aapka%20Eliza%20Gold%20ka%20order%20${o.orderId}%20abhi%20*${o.status}*%20hai.%20Shukriya!%20%F0%9F%8C%BF`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 bg-[#25D366] text-white rounded-lg hover:brightness-110 transition-all inline-flex items-center justify-center shadow-sm"
                                    title="WhatsApp Customer"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => setSelectedPrintOrder(o)}
                                    className="p-1.5 bg-[#0b2912] text-[#d4af37] rounded-lg hover:bg-black transition-all inline-flex items-center justify-center shadow-sm"
                                    title="Print Courier Slip"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {/* Expanded Row */}
                            {isExpanded && (
                              <tr className="bg-amber-50/60">
                                <td colSpan={7} className="px-6 py-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                    <div>
                                      <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Full Address</span>
                                      <p className="font-semibold text-gray-800">{o.customer.address}</p>
                                      <p className="text-gray-600">{o.customer.city}</p>
                                    </div>
                                    <div>
                                      <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Items Ordered</span>
                                      {o.items?.map((item, i) => (
                                        <p key={i} className="font-semibold text-gray-800">{item.bundleTitle} × {item.quantity} — Rs. {item.price?.toLocaleString()}</p>
                                      ))}
                                      {o.addMassager && <p className="text-emerald-700 font-bold mt-0.5">+ Scalp Massager (Rs. 299)</p>}
                                    </div>
                                    <div>
                                      <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Payment</span>
                                      <p className="font-extrabold text-lg text-[#0b2912]">Rs. {o.total?.toLocaleString()}</p>
                                      <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded">Cash On Delivery</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-gray-400">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="font-medium">No orders found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB 3: REVIEWS ════════════════════════════════════════════ */}
          {activeTab === "reviews" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Customer Reviews</h2>
                <p className="text-xs text-gray-500">Live reviews submitted by customers on the storefront</p>
              </div>

              {/* Review Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[5, 4, 3, 2].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  return (
                    <div key={star} className="bg-white p-4 rounded-2xl border border-[#e7e1d5] shadow-sm text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[...Array(star)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                      </div>
                      <p className="text-xl font-extrabold text-gray-900">{count}</p>
                      <p className="text-[10px] text-gray-400">{star}-star reviews</p>
                    </div>
                  );
                })}
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#e7e1d5] p-12 text-center text-gray-400">
                    <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No customer reviews yet</p>
                    <p className="text-xs mt-1">Reviews submitted on the storefront will appear here in real-time</p>
                  </div>
                ) : reviews.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#e7e1d5] p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                            ))}
                          </div>
                          {r.verified && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" /> Verified</span>}
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{r.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{r.comment}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-xs text-gray-800">{r.name}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end"><MapPin className="w-2.5 h-2.5" />{r.city}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{r.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TAB 4: PRODUCTS & PRICING ══════════════════════════════════ */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Product Bundles & Pricing</h2>
                <p className="text-xs text-gray-500">Update bundle prices — changes sync to storefront on save</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Price changes are saved to the browser session. To make prices permanent across devices, the storefront needs a backend settings API (upgrade available).</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: "bottle1" as const, label: "1 Bottle (Starter Pack)", option: "Option 1", badge: null, badgeColor: "" },
                  { key: "bottle2" as const, label: "2 Bottles (Popular Pack)", option: "Option 2", badge: "Most Popular", badgeColor: "bg-[#d4af37] text-[#041207]" },
                  { key: "bottle3" as const, label: "3 Bottles (Family Pack)", option: "Option 3", badge: null, badgeColor: "" }
                ].map(p => (
                  <div key={p.key} className={`bg-white p-6 rounded-2xl shadow-sm space-y-4 relative ${p.badge ? "border-2 border-[#d4af37]" : "border border-[#e7e1d5]"}`}>
                    {p.badge && <span className={`absolute -top-3 right-4 text-[10px] font-black uppercase px-3 py-0.5 rounded-full ${p.badgeColor}`}>{p.badge}</span>}
                    <span className="text-xs font-bold text-gray-400 uppercase">{p.option}</span>
                    <h3 className="font-serif font-bold text-lg text-gray-900">{p.label}</h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (PKR)</label>
                      <input
                        type="number"
                        value={productPrices[p.key]}
                        onChange={e => setProductPrices({ ...productPrices, [p.key]: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0b2912] outline-none"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-bold">Margin est.:</span> ~40-60% on COD
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e7e1d5] flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  <span className="font-bold">1 Bottle:</span> Rs. {productPrices.bottle1.toLocaleString()} &nbsp;·&nbsp;
                  <span className="font-bold">2 Bottles:</span> Rs. {productPrices.bottle2.toLocaleString()} &nbsp;·&nbsp;
                  <span className="font-bold">3 Bottles:</span> Rs. {productPrices.bottle3.toLocaleString()}
                </div>
                <button onClick={saveProductPrices} className="bg-[#0b2912] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#154620] transition-colors">
                  Save Prices
                </button>
              </div>
            </div>
          )}

          {/* ═══ TAB 5: COUPONS ════════════════════════════════════════════ */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Coupon & Discount Manager</h2>
                <p className="text-xs text-gray-500">Create & activate promo codes — they sync to the checkout on this browser</p>
              </div>

              {/* Create Coupon */}
              <div className="bg-white p-6 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-4 max-w-xl">
                <h3 className="font-bold text-gray-900 text-sm">Create New Promo Code</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code</label>
                    <input type="text" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value.toUpperCase())} placeholder="e.g. EID2026" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl uppercase font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Discount Label</label>
                    <input type="text" value={newCouponDiscount} onChange={e => setNewCouponDiscount(e.target.value)} placeholder="e.g. 15% OFF" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Discount % Value (for calculation)</label>
                    <input type="number" value={newCouponValue} onChange={e => setNewCouponValue(e.target.value)} placeholder="e.g. 15" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl" />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (newCouponCode && newCouponDiscount) {
                      const updated = [...coupons, { id: Date.now(), code: newCouponCode, discount: newCouponDiscount, discountValue: Number(newCouponValue) || 0, type: "Custom", active: true }];
                      saveCoupons(updated);
                      setNewCouponCode(""); setNewCouponDiscount(""); setNewCouponValue("");
                    }
                  }}
                  className="bg-[#0b2912] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#154620] transition-colors"
                >
                  Add Coupon Code
                </button>
              </div>

              {/* Coupons Table */}
              <div className="bg-white rounded-2xl border border-[#e7e1d5] overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0b2912] text-white font-bold uppercase">
                      <th className="py-3.5 px-4">Code</th>
                      <th className="py-3.5 px-4">Discount</th>
                      <th className="py-3.5 px-4">Value %</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coupons.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="py-3.5 px-4 font-black text-[#0b2912] font-mono tracking-wider">{c.code}</td>
                        <td className="py-3.5 px-4 font-semibold">{c.discount}</td>
                        <td className="py-3.5 px-4 font-semibold">{c.discountValue || "—"}%</td>
                        <td className="py-3.5 px-4">
                          <button onClick={() => saveCoupons(coupons.map(x => x.id === c.id ? { ...x, active: !x.active } : x))}>
                            {c.active
                              ? <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded"><CheckCircle2 className="w-3 h-3" /> Active</span>
                              : <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded"><XCircle className="w-3 h-3" /> Paused</span>
                            }
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <button onClick={() => saveCoupons(coupons.filter(x => x.id !== c.id))} className="text-red-500 hover:text-red-700 font-bold text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ TAB 6: STORE SETTINGS ══════════════════════════════════════ */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Store Settings</h2>
                <p className="text-xs text-gray-500">Configure storefront banners, WhatsApp & business details</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-5 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Top Announcement Bar Text</label>
                  <input type="text" value={announcementText} onChange={e => setAnnouncementText(e.target.value)} className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl font-medium focus:border-[#0b2912] outline-none" />
                  <p className="text-[10px] text-gray-400 mt-1">This text shows in the scrolling gold banner at the top of the storefront.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer WhatsApp Number</label>
                  <input type="text" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+923001234567" className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl font-medium focus:border-[#0b2912] outline-none" />
                  <p className="text-[10px] text-gray-400 mt-1">Format: +923001234567 (no spaces or dashes)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Quick Links</label>
                  <div className="flex flex-wrap gap-2">
                    <a href="https://dashboard.convex.dev" target="_blank" rel="noreferrer" className="text-xs bg-[#0b2912] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#154620] transition-colors flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-[#d4af37]" /> Convex Cloud Dashboard
                    </a>
                    <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                      <Eye className="w-3 h-3" /> Vercel Deployments
                    </a>
                    <Link href="/" target="_blank" className="text-xs bg-[#d4af37] text-[#041207] px-3 py-1.5 rounded-lg font-bold hover:brightness-110 transition-colors flex items-center gap-1.5">
                      <Eye className="w-3 h-3" /> View Storefront Live
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    {settingsSaved && <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Settings saved!</p>}
                  </div>
                  <button onClick={saveSettings} className="bg-[#0b2912] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#154620] transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>

              {/* Admin Access Info */}
              <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] shadow-sm max-w-xl space-y-3">
                <h3 className="font-bold text-sm text-gray-900">Admin Access</h3>
                <div className="text-xs space-y-2 text-gray-600">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold">Admin URL</span>
                    <span className="font-mono text-gray-800">elizagold.vercel.app/admin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold">Default Passcode</span>
                    <span className="font-mono font-bold text-[#0b2912]">admin123</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold">Database</span>
                    <span className="font-mono text-blue-700">valiant-porcupine-369.convex.cloud</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ═══ PRINT COURIER SLIP MODAL ════════════════════════════════════════ */}
      {selectedPrintOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 space-y-4 border-2 border-black shadow-2xl font-sans text-black">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <div>
                <h3 className="font-serif font-black text-lg uppercase tracking-wider text-[#0b2912]">ELIZA GOLD PAKISTAN</h3>
                <p className="text-[10px] font-bold text-gray-500">COD COURIER DISPATCH SLIP</p>
              </div>
              <button onClick={() => setSelectedPrintOrder(null)} className="text-gray-400 hover:text-black font-bold text-xl">✕</button>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { label: "ORDER / TRACKING NO", value: <span className="font-mono text-sm font-black">{selectedPrintOrder.orderId}</span> },
                { label: "CONSIGNEE (CUSTOMER)", value: <><p className="font-bold text-sm">{selectedPrintOrder.customer.fullName}</p><p className="font-semibold">{selectedPrintOrder.customer.phone}</p></> },
                { label: "DESTINATION", value: <><p className="font-bold">{selectedPrintOrder.customer.city}</p><p className="text-gray-700">{selectedPrintOrder.customer.address}</p></> },
                { label: "CONTENTS", value: <><p className="font-semibold">{selectedPrintOrder.items?.[0]?.bundleTitle || "Roghan-e-Azam Hair Oil"}</p>{selectedPrintOrder.addMassager && <p className="text-emerald-700 font-bold">+ Neem Scalp Massager</p>}</> }
              ].map(row => (
                <div key={row.label} className="border-b border-gray-200 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 block mb-0.5">{row.label}:</span>
                  {row.value}
                </div>
              ))}
              <div className="bg-[#0b2912] text-white p-3 rounded-xl flex justify-between items-center">
                <span className="font-black text-sm">COLLECT CASH (COD):</span>
                <span className="text-xl font-black text-[#d4af37]">Rs. {selectedPrintOrder.total?.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800">
                <Printer className="w-4 h-4 text-[#d4af37]" /> Print Slip
              </button>
              <button onClick={() => setSelectedPrintOrder(null)} className="px-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-xs uppercase hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

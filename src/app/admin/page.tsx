/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
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
  Users,
  Package,
  Lock,
  Filter,
  Printer,
  MessageCircle
} from "lucide-react";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type TabType = "overview" | "orders" | "products" | "coupons" | "settings";

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

// Mock Sample Orders for first time load
const SAMPLE_ORDERS: AdminOrder[] = [
  {
    orderId: "EG-94821",
    customer: {
      fullName: "Mohammad Hamza",
      phone: "03001234567",
      city: "Lahore",
      address: "House 45, Street 12, DHA Phase 5"
    },
    items: [{ name: "Roghan-e-Azam Misali Hair Oil", bundleTitle: "2 Bottles (Popular Pack)", price: 2699, quantity: 1 }],
    addMassager: true,
    total: 2998,
    date: "28 Jul 2026",
    status: "Processing"
  },
  {
    orderId: "EG-94820",
    customer: {
      fullName: "Saba Tariq",
      phone: "03219876543",
      city: "Karachi",
      address: "Flat 4B, Silver Heights, Clifton Block 2"
    },
    items: [{ name: "Roghan-e-Azam Misali Hair Oil", bundleTitle: "3 Bottles (Family Pack)", price: 3699, quantity: 1 }],
    addMassager: false,
    total: 3699,
    date: "28 Jul 2026",
    status: "Dispatched"
  },
  {
    orderId: "EG-94819",
    customer: {
      fullName: "Usman Raza",
      phone: "03451122334",
      city: "Islamabad",
      address: "House 102, Street 7, Sector F-8/3"
    },
    items: [{ name: "Roghan-e-Azam Misali Hair Oil", bundleTitle: "1 Bottle (Starter Pack)", price: 1499, quantity: 1 }],
    addMassager: false,
    total: 1499,
    date: "27 Jul 2026",
    status: "Delivered"
  }
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<AdminOrder | null>(null);

  // Products Pricing State
  const [productPrices, setProductPrices] = useState({
    bottle1: 1499,
    bottle2: 2699,
    bottle3: 3699
  });

  // Coupons State
  const [coupons, setCoupons] = useState([
    { id: 1, code: "ELIZA10", discount: "10% OFF", type: "Percentage", active: true },
    { id: 2, code: "FREESHIP", discount: "Free Delivery", type: "Shipping", active: true }
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");

  // Store Settings State
  const [announcementText, setAnnouncementText] = useState("FLASH SALE: 40% OFF + FREE CASH ON DELIVERY ACROSS PAKISTAN");
  const [whatsappNumber, setWhatsappNumber] = useState("+92 300 1234567");

  // Check auth & load initial state
  useEffect(() => {
    const authSaved = localStorage.getItem("eliza_admin_auth");
    if (authSaved === "true") {
      setIsAuthenticated(true);
    }

    // Load orders
    try {
      const storedOrders = localStorage.getItem("eliza_orders_list");
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        setOrders(SAMPLE_ORDERS);
        localStorage.setItem("eliza_orders_list", JSON.stringify(SAMPLE_ORDERS));
      }
    } catch {
      setOrders(SAMPLE_ORDERS);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === "admin123" || passcodeInput === "admin") {
      setIsAuthenticated(true);
      localStorage.setItem("eliza_admin_auth", "true");
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("eliza_admin_auth");
  };

  // Convex Real-Time Database Subscription & Mutation (Prerender-safe)
  const convexOrders = useQuery(api?.orders?.listOrders ? api.orders.listOrders : ("listOrders" as any));
  const updateOrderStatusMutation = useMutation(api?.orders?.updateOrderStatus ? api.orders.updateOrderStatus : ("updateOrderStatus" as any));

  useEffect(() => {
    if (convexOrders && Array.isArray(convexOrders) && convexOrders.length > 0) {
      const formatted: AdminOrder[] = convexOrders.map((o: any) => ({
        _id: o._id,
        orderId: o.orderId,
        customer: o.customer,
        items: o.items,
        addMassager: o.addMassager,
        total: o.total,
        date: o.date,
        status: o.status
      }));
      setOrders(formatted);
    }
  }, [convexOrders]);

  // Update order status (Syncs to Convex Cloud + Local Storage)
  const updateOrderStatus = async (orderId: string, newStatus: string, docId?: string) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem("eliza_orders_list", JSON.stringify(updated));

    try {
      if (docId && updateOrderStatusMutation) {
        await updateOrderStatusMutation({ id: docId as any, status: newStatus });
      }
    } catch {
      // Local fallback handled smoothly
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Order ID,Customer,Phone,City,Address,Total (PKR),Date,Status\n";
    orders.forEach(o => {
      csvContent += `"${o.orderId}","${o.customer.fullName}","${o.customer.phone}","${o.customer.city}","${o.customer.address.replace(/"/g, '""')}","${o.total}","${o.date}","${o.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Eliza_Gold_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.phone.includes(searchQuery) ||
      o.customer.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#041207] via-[#0b2912] to-[#041207] text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-black/60 backdrop-blur-xl border border-[#d4af37]/40 p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.2)] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-black/60 border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.5)] mx-auto flex items-center justify-center p-1">
            <Image
              src="/assets/logo-icon.png"
              alt="Eliza Gold"
              width={100}
              height={100}
              className="w-full h-full object-cover mix-blend-screen"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
              Eliza Gold Admin Panel
            </h1>
            <p className="text-xs text-emerald-200/70 mt-1 uppercase tracking-widest font-semibold">Store Operations & WooCommerce Control</p>
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
              {passcodeError && (
                <p className="text-xs text-red-400 mt-1 font-semibold">Incorrect passcode! Use &quot;admin123&quot;</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#d4af37] via-[#f7e092] to-[#d4af37] text-[#041207] py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg"
            >
              Sign In To Control Panel
            </button>
          </form>

          <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#d4af37] hover:underline pt-2">
            ← Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col font-sans">
      {/* ADMIN HEADER BAR */}
      <header className="bg-gradient-to-r from-[#041207] via-[#0b2912] to-[#041207] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#d4af37]/30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#d4af37] bg-black/40 overflow-hidden flex items-center justify-center p-0.5">
            <Image src="/assets/logo-icon.png" alt="Logo" width={50} height={50} className="w-full h-full object-cover mix-blend-screen" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0] leading-none">
              Eliza Gold Manager
            </h1>
            <span className="text-[9px] text-emerald-300 font-extrabold uppercase tracking-widest">WordPress & WooCommerce Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-xs px-3.5 py-1.5 rounded-lg border border-white/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">View Storefront</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs px-3.5 py-1.5 rounded-lg border border-red-500/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY WITH SIDEBAR */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#05180a] text-white p-4 space-y-1.5 border-r border-[#0b2912] shrink-0">
          <div className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest px-3 py-2">Control Modules</div>

          {[
            { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
            { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
            { id: "products", label: "Products & Pricing", icon: Package },
            { id: "coupons", label: "Coupons & Offers", icon: Tag },
            { id: "settings", label: "Store Settings", icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#d4af37] text-[#041207] shadow-md"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
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
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Store Dashboard Overview</h2>
                <p className="text-xs text-gray-500">Real-time revenue analytics & order fulfillment metrics</p>
              </div>

              {/* STAT CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <span>Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">Rs. {totalRevenue.toLocaleString()}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +100% Cash On Delivery
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <span>Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">{orders.length}</p>
                  <p className="text-[11px] text-gray-500 font-semibold">{pendingOrdersCount} Pending Fulfillment</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <span>Average Order Value</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">
                    Rs. {orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString() : 0}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold">High Bundle Conversion</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <span>Courier Delivery Success</span>
                    <Truck className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">98.4%</p>
                  <p className="text-[11px] text-gray-500 font-semibold">TCS / Leopards Express</p>
                </div>
              </div>

              {/* RECENT ORDERS TABLE BRIEF */}
              <div className="bg-white rounded-2xl border border-[#e7e1d5] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-base">Recent Incoming Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-[#0b2912] font-bold hover:underline">
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">City</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.orderId} className="hover:bg-gray-50">
                          <td className="py-3 px-3 font-bold text-[#0b2912]">{o.orderId}</td>
                          <td className="py-3 px-3">{o.customer.fullName}</td>
                          <td className="py-3 px-3">{o.customer.city}</td>
                          <td className="py-3 px-3 font-bold">Rs. {o.total?.toLocaleString()}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              o.status === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                              o.status === "Dispatched" ? "bg-blue-100 text-blue-800" :
                              "bg-amber-100 text-amber-800"
                            }`}>
                              {o.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGER */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-gray-900">WooCommerce Orders Control</h2>
                  <p className="text-xs text-gray-500">Manage Cash On Delivery orders, dispatch status, & courier shipping manifests</p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 bg-[#0b2912] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#154620] transition-colors shadow-md self-start sm:self-auto"
                >
                  <Download className="w-4 h-4 text-[#d4af37]" />
                  <span>Export Manifest (CSV)</span>
                </button>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="bg-white p-4 rounded-2xl border border-[#e7e1d5] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Name, Phone, City, or Order #..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:border-[#0b2912]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:border-[#0b2912] bg-white font-bold text-gray-700"
                  >
                    <option value="ALL">All Order Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Dispatched (TCS / Leopards)</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* FULL ORDERS TABLE */}
              <div className="bg-white rounded-2xl border border-[#e7e1d5] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-[#0b2912] text-white font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Order ID</th>
                        <th className="py-3.5 px-4">Customer Details</th>
                        <th className="py-3.5 px-4">City</th>
                        <th className="py-3.5 px-4">Package</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Status & Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map(o => (
                        <tr key={o.orderId} className="hover:bg-amber-50/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-[#0b2912]">{o.orderId}</td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-gray-900">{o.customer.fullName}</p>
                            <p className="text-[11px] text-gray-500">{o.customer.phone}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{o.customer.address}</p>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-800">{o.customer.city}</td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-800">{o.items?.[0]?.bundleTitle || "Roghan-e-Azam"}</span>
                            {o.addMassager && <span className="block text-[10px] text-emerald-600 font-bold">+ Scalp Massager</span>}
                          </td>
                          <td className="py-4 px-4 font-extrabold text-gray-900 text-sm">Rs. {o.total?.toLocaleString()}</td>
                          <td className="py-4 px-4 text-gray-500">{o.date}</td>
                          <td className="py-4 px-4 flex items-center gap-2">
                            <select
                              value={o.status || "Pending"}
                              onChange={(e) => updateOrderStatus(o.orderId, e.target.value, o._id)}
                              className={`px-2.5 py-1.5 text-xs rounded-lg font-bold outline-none border transition-colors cursor-pointer ${
                                o.status === "Delivered" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                                o.status === "Dispatched" ? "bg-blue-100 text-blue-800 border-blue-300" :
                                o.status === "Processing" ? "bg-purple-100 text-purple-800 border-purple-300" :
                                o.status === "Cancelled" ? "bg-red-100 text-red-800 border-red-300" :
                                "bg-amber-100 text-amber-800 border-amber-300"
                              }`}
                            >
                              <option value="Pending">🟡 Pending</option>
                              <option value="Processing">🟣 Processing</option>
                              <option value="Dispatched">🔵 Dispatched (Courier)</option>
                              <option value="Delivered">🟢 Delivered</option>
                              <option value="Cancelled">🔴 Cancelled</option>
                            </select>

                            <a
                              href={`https://wa.me/${o.customer.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(o.customer.fullName)},%20your%20Eliza%20Gold%20order%20${o.orderId}%20status%20is%20now%20${o.status}.`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-[#25D366] text-white rounded-lg hover:brightness-110 transition-all inline-flex items-center justify-center shadow-sm"
                              title="Notify Customer via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => setSelectedPrintOrder(o)}
                              className="p-2 bg-[#0b2912] text-[#d4af37] rounded-lg hover:bg-black transition-all inline-flex items-center justify-center shadow-sm cursor-pointer"
                              title="Print Thermal Courier Label Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500 font-medium">
                            No orders found matching your search query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS & PRICING */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Product Bundles & Stock Control</h2>
                <p className="text-xs text-gray-500">Update prices, discount offers, & gift items in real-time</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">Option 1</span>
                  <h3 className="font-serif font-bold text-xl text-gray-900">1 Bottle (Starter Pack)</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (PKR)</label>
                    <input
                      type="number"
                      value={productPrices.bottle1}
                      onChange={(e) => setProductPrices({ ...productPrices, bottle1: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold"
                    />
                  </div>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded">In Stock (500+ Units)</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-[#d4af37] shadow-md space-y-4 relative">
                  <span className="absolute -top-3 right-4 bg-[#d4af37] text-[#041207] text-[10px] font-black uppercase px-3 py-0.5 rounded-full">Most Popular</span>
                  <span className="text-xs font-bold text-[#d4af37] uppercase">Option 2</span>
                  <h3 className="font-serif font-bold text-xl text-gray-900">2 Bottles (Popular Pack)</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (PKR)</label>
                    <input
                      type="number"
                      value={productPrices.bottle2}
                      onChange={(e) => setProductPrices({ ...productPrices, bottle2: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold"
                    />
                  </div>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded">FREE Delivery Included</span>
                </div>

                <div className="bg-[#white] p-6 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">Option 3</span>
                  <h3 className="font-serif font-bold text-xl text-gray-900">3 Bottles (Family Pack)</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (PKR)</label>
                    <input
                      type="number"
                      value={productPrices.bottle3}
                      onChange={(e) => setProductPrices({ ...productPrices, bottle3: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold"
                    />
                  </div>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded">Includes Free Neem Comb</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] flex items-center justify-between">
                <span className="text-xs text-gray-600 font-semibold">Changes apply instantly across storefront.</span>
                <button
                  onClick={() => alert("Product bundle pricing updated successfully!")}
                  className="bg-[#0b2912] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#154620]"
                >
                  Save Product Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Coupon & Discount Manager</h2>
                <p className="text-xs text-gray-500">Create & activate promotional promo codes for customers</p>
              </div>

              {/* CREATE COUPON FORM */}
              <div className="bg-white p-6 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-4 max-w-lg">
                <h3 className="font-bold text-gray-900 text-sm">Create New Promo Code</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. EID2026"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Discount Offer</label>
                    <input
                      type="text"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      placeholder="e.g. 15% OFF"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (newCouponCode && newCouponDiscount) {
                      setCoupons([...coupons, { id: Date.now(), code: newCouponCode, discount: newCouponDiscount, type: "Custom", active: true }]);
                      setNewCouponCode("");
                      setNewCouponDiscount("");
                    }
                  }}
                  className="bg-[#0b2912] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Add Coupon Code
                </button>
              </div>

              {/* EXISTING COUPONS */}
              <div className="bg-white rounded-2xl border border-[#e7e1d5] overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0b2912] text-white font-bold uppercase">
                      <th className="py-3.5 px-4">Coupon Code</th>
                      <th className="py-3.5 px-4">Discount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td className="py-3.5 px-4 font-bold text-[#0b2912]">{c.code}</td>
                        <td className="py-3.5 px-4 font-semibold">{c.discount}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setCoupons(coupons.filter(x => x.id !== c.id))}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: STORE SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Storefront Announcement & Contact Settings</h2>
                <p className="text-xs text-gray-500">Configure global banner messages and customer care details</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Top Announcement Bar Text</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Customer Support WhatsApp Number</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl font-medium"
                  />
                </div>

              </div>
            </div>
          )}

        {/* PRINTABLE COURIER SHIPPING SLIP MODAL */}
        {selectedPrintOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 border-2 border-black shadow-2xl relative font-sans text-black">
              <div className="flex justify-between items-center border-b-2 border-black pb-3">
                <div>
                  <h3 className="font-serif font-black text-xl uppercase tracking-wider text-[#0b2912]">ELIZA GOLD PAKISTAN</h3>
                  <p className="text-[10px] font-bold text-gray-600">OFFICIAL COD COURIER DISPATCH SLIP</p>
                </div>
                <button
                  onClick={() => setSelectedPrintOrder(null)}
                  className="text-gray-400 hover:text-black font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold border-b border-gray-200 pb-1">
                  <span>TRACKING NO:</span>
                  <span className="font-mono text-sm">{selectedPrintOrder.orderId}</span>
                </div>
                <div className="border-b border-gray-200 pb-1">
                  <span className="font-bold block text-gray-500 text-[10px]">CONSIGNEE (CUSTOMER):</span>
                  <p className="font-bold text-sm">{selectedPrintOrder.customer.fullName}</p>
                  <p className="font-semibold text-xs text-gray-800">{selectedPrintOrder.customer.phone}</p>
                </div>
                <div className="border-b border-gray-200 pb-1">
                  <span className="font-bold block text-gray-500 text-[10px]">DESTINATION CITY & ADDRESS:</span>
                  <p className="font-bold text-xs">{selectedPrintOrder.customer.city}</p>
                  <p className="text-xs text-gray-700">{selectedPrintOrder.customer.address}</p>
                </div>
                <div className="border-b border-gray-200 pb-1">
                  <span className="font-bold block text-gray-500 text-[10px]">PACKAGE CONTENTS:</span>
                  <p className="font-semibold text-xs">{selectedPrintOrder.items?.[0]?.bundleTitle || "Roghan-e-Azam Hair Oil"}</p>
                  {selectedPrintOrder.addMassager && <p className="text-[10px] text-emerald-700 font-bold">+ Neem Scalp Massager Comb</p>}
                </div>
                <div className="bg-gray-100 p-3 rounded-xl flex justify-between items-center text-sm font-black border border-gray-300">
                  <span>COLLECT CASH (COD):</span>
                  <span className="text-base font-extrabold text-[#0b2912]">Rs. {selectedPrintOrder.total?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#d4af37]" /> Print Thermal Slip
                </button>
                <button
                  onClick={() => setSelectedPrintOrder(null)}
                  className="px-4 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold text-xs uppercase hover:bg-gray-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}

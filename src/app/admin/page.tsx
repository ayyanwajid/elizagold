/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  PackageCheck,
  X,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  FileSpreadsheet,
  Calendar,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { useQuery, useMutation, useConvex } from "convex/react";
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
  total: number;
  adminNotes?: string;
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

// Ã¢â€â‚¬Ã¢â€â‚¬ DATE HELPERS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function parseOrderDate(dateStr: string): Date {
  // Handles "28 Jul 2026", "11 Sep 2026", ISO strings, etc.
  if (!dateStr) return new Date(0);
  const parts = dateStr.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
  if (parts) {
    const day = parseInt(parts[1]);
    const monthIdx = MONTHS.indexOf(parts[2]);
    const year = parseInt(parts[3]);
    if (monthIdx >= 0) return new Date(year, monthIdx, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function getDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getDateLabel(dateKey: string): string {
  const today = new Date();
  const todayKey = getDateKey(today);
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const yestKey = getDateKey(yest);
  if (dateKey === todayKey) return "Today";
  if (dateKey === yestKey) return "Yesterday";
  const [y,m,d] = dateKey.split("-").map(Number);
  return `${d} ${MONTHS[m-1]} ${y}`;
}

function isInDateRange(orderDate: Date, range: string): boolean {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (range) {
    case "TODAY": return orderDate >= startOfToday;
    case "YESTERDAY": {
      const startYest = new Date(startOfToday); startYest.setDate(startYest.getDate() - 1);
      return orderDate >= startYest && orderDate < startOfToday;
    }
    case "7DAYS": {
      const start7 = new Date(startOfToday); start7.setDate(start7.getDate() - 7);
      return orderDate >= start7;
    }
    case "MONTH": {
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return orderDate >= startMonth;
    }
    default: return true; // ALL
  }
}

type DateGroup = { dateKey: string; label: string; orders: AdminOrder[] };

function groupOrdersByDate(orders: AdminOrder[], sortOrder: "NEWEST" | "OLDEST" = "NEWEST"): DateGroup[] {
  const map = new Map<string, AdminOrder[]>();
  for (const o of orders) {
    const key = getDateKey(parseOrderDate(o.date));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(o);
  }
  // Sort date keys descending (newest first) or ascending (oldest first)
  const sortedKeys = Array.from(map.keys()).sort((a, b) => 
    sortOrder === "NEWEST" ? b.localeCompare(a) : a.localeCompare(b)
  );
  return sortedKeys.map(key => ({ dateKey: key, label: getDateLabel(key), orders: map.get(key)! }));
}

// Sample seed orders for first load
const SAMPLE_ORDERS: AdminOrder[] = [
  {
    orderId: "EG-94821",
    customer: { fullName: "Mohammad Hamza", phone: "03001234567", city: "Lahore", address: "House 45, Street 12, DHA Phase 5" },
    items: [{ name: "Roghan-e-Azam Misali Hair Oil", bundleTitle: "2 Bottles (Popular Pack)", price: 2699, quantity: 1 }],
    total: 2699, date: "28 Jul 2026", status: "Pending"
  },
  {
    orderId: "EG-94820",
    customer: { fullName: "Saba Tariq", phone: "03219876543", city: "Karachi", address: "Flat 4B, Silver Heights, Clifton Block 2" },
    items: [{ name: "Roghan-e-Azam Misali Hair Oil", bundleTitle: "3 Bottles (Family Pack)", price: 3699, quantity: 1 }],
    total: 3699, date: "28 Jul 2026", status: "Pending"
  },
  {
    orderId: "EG-94819",
    customer: { fullName: "Usman Raza", phone: "03451122334", city: "Islamabad", address: "House 102, Street 7, Sector F-8/3" },
    items: [{ name: "Roghan-e-Azam Misali Hair Oil", bundleTitle: "1 Bottle (Starter Pack)", price: 1499, quantity: 1 }],
    total: 1499, date: "27 Jul 2026", status: "Pending"
  }
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  Pending:    { label: "Pending",    bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-300" },
  Processing: { label: "Processing", bg: "bg-purple-100",  text: "text-purple-800",  border: "border-purple-300" },
  Dispatched: { label: "Dispatched", bg: "bg-blue-100",    text: "text-blue-800",    border: "border-blue-300" },
  Delivered:  { label: "Delivered",  bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  Cancelled:  { label: "Cancelled",  bg: "bg-red-100",     text: "text-red-800",     border: "border-red-300" }
};

// If Convex ever throws mid-render (e.g. an expired/invalid admin session),
// this catches it and hands control back to the login screen instead of
// crashing the whole dashboard.
class SessionBoundary extends React.Component<
  { onExpire: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { onExpire: () => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onExpire();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MS = 30_000;

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const isAuthenticated = adminToken !== null;
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<AdminOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [deleteConfirmOrderId, setDeleteConfirmOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Enhancements state
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"TODAY" | "YESTERDAY" | "7DAYS" | "MONTH" | "ALL">("ALL");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // New order notification state
  const [newOrderAlert, setNewOrderAlert] = useState<AdminOrder | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const prevOrderCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Store Settings State Ã¢â‚¬â€ loaded from Convex (source of truth for every
  // visitor), edited locally as a draft, persisted via updateSettings.
  const [productPrices, setProductPrices] = useState({ bottle1: 1499, bottle2: 2699, bottle3: 3699 });
  const [announcementText, setAnnouncementText] = useState("FLASH SALE: 40% OFF + FREE CASH ON DELIVERY ACROSS PAKISTAN");
  const [whatsappNumber, setWhatsappNumber] = useState("+923287657890");
  const [freeDeliverySiteWide, setFreeDeliverySiteWide] = useState(false);
  const [singleBottleShippingFee, setSingleBottleShippingFee] = useState(150);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const settingsLoadedRef = useRef(false);

  // New Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");
  const [newCouponValue, setNewCouponValue] = useState("");

  // Ã¢â€â‚¬Ã¢â€â‚¬ CONVEX LIVE SUBSCRIPTIONS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  // "skip" until we hold a verified session token Ã¢â‚¬â€ the query itself
  // rejects unauthenticated calls server-side, but there's no reason to
  // even attempt it before login.
  const convexOrders = useQuery(api.orders.listOrders, adminToken ? { token: adminToken } : "skip");
  const convexReviews = useQuery(api.reviews.listReviews);
  const convexSettings = useQuery(api.settings.getSettings);
  interface CouponDoc { _id: string; code: string; discount: string; discountValue: number; type: string; active: boolean; }
  const convexCoupons = (useQuery(api.coupons.listCoupons) ?? []) as CouponDoc[];
  const updateOrderStatusMutation = useMutation(api.orders.updateOrderStatus);
  const updateOrderDetailsMutation = useMutation(api.orders.updateOrderDetails);
  const deleteOrderMutation = useMutation(api.orders.deleteOrder);
  const loginMutation = useMutation(api.admin.login);
  const logoutMutation = useMutation(api.admin.logout);
  const updateSettingsMutation = useMutation(api.settings.updateSettings);
  const addCouponMutation = useMutation(api.coupons.addCoupon);
  const toggleCouponMutation = useMutation(api.coupons.toggleCoupon);
  const deleteCouponMutation = useMutation(api.coupons.deleteCoupon);
  const convexClient = useConvex();

  // Seed the local draft fields from Convex once settings load Ã¢â‚¬â€ only once,
  // so a live-query refresh (e.g. right after this admin's own save) doesn't
  // clobber an in-progress edit on another field.
  useEffect(() => {
    if (convexSettings && !settingsLoadedRef.current) {
      settingsLoadedRef.current = true;
      setAnnouncementText(convexSettings.announcementText);
      setWhatsappNumber(convexSettings.whatsappNumber);
      setProductPrices(convexSettings.productPrices);
      setFreeDeliverySiteWide(convexSettings.freeDeliverySiteWide);
      setSingleBottleShippingFee(convexSettings.singleBottleShippingFee);
    }
  }, [convexSettings]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ AUTH & INITIAL LOAD Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    const savedToken = localStorage.getItem("eliza_admin_token");
    if (savedToken) setAdminToken(savedToken);

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

  // Ã¢â€â‚¬Ã¢â€â‚¬ SYNC CONVEX ORDERS LIVE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    if (!convexOrders || !Array.isArray(convexOrders) || convexOrders.length === 0) return;
    const formatted: AdminOrder[] = convexOrders.map((o: any) => ({
      _id: o._id, orderId: o.orderId, customer: o.customer,
      items: o.items, total: o.total,
      date: o.date, status: o.status, adminNotes: o.adminNotes
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
  }, [convexOrders, isAuthenticated]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ SYNC CONVEX REVIEWS LIVE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    if (convexReviews && Array.isArray(convexReviews)) {
      setReviews(convexReviews.map((r: any) => ({
        _id: r._id, name: r.name, city: r.city, rating: r.rating,
        date: r.date, title: r.title, comment: r.comment, verified: r.verified
      })));
    }
  }, [convexReviews]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ HANDLERS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil && Date.now() < lockoutUntil) return;

    setLoginLoading(true);
    setPasscodeError(false);
    try {
      const token: string = await loginMutation({ password: passcodeInput });
      localStorage.setItem("eliza_admin_token", token);
      setAdminToken(token);
      setFailedAttempts(0);
      setLockoutUntil(null);
      setPasscodeInput("");
      prevOrderCountRef.current = orders.length;
    } catch {
      setPasscodeError(true);
      const attempts = failedAttempts + 1;
      if (attempts >= LOCKOUT_THRESHOLD) {
        setLockoutUntil(Date.now() + LOCKOUT_MS);
        setFailedAttempts(0);
      } else {
        setFailedAttempts(attempts);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    if (adminToken) logoutMutation({ token: adminToken }).catch(() => { /* best-effort */ });
    localStorage.removeItem("eliza_admin_token");
    setAdminToken(null);
  }, [adminToken, logoutMutation]);

  // A rejected query (expired/invalid session) throws during render; the
  // SessionBoundary below catches that and calls this to drop back to login.
  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem("eliza_admin_token");
    setAdminToken(null);
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string, docId?: string) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem("eliza_orders_list", JSON.stringify(updated));
    try {
      if (docId && updateOrderStatusMutation && adminToken) {
        await updateOrderStatusMutation({ token: adminToken, id: docId as any, status: newStatus });
      }
    } catch { /* local fallback */ }
  };

  const handleExportToSheets = async (order: AdminOrder) => {
    if (!adminToken) return;
    setSyncingOrderId(order.orderId);
    try {
      await convexClient.action((api as any).googleSheets.exportOrderToSheet, {
        token: adminToken,
        order: {
          orderId: order.orderId,
          customer: order.customer,
          items: order.items.map(i => ({ name: i.name, bundleTitle: i.bundleTitle, price: i.price, quantity: i.quantity })),
          total: order.total,
          status: order.status,
          date: order.date,
        },
      });
      alert("Ã¢Å“â€¦ Order synced to Google Sheets!");
    } catch (error: any) {
      alert("Failed to sync: " + (error.message || "Unknown error"));
    } finally {
      setSyncingOrderId(null);
    }
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Order ID,Customer,Phone,City,Address,Package,Total (PKR),Date,Status\n";
    orders.forEach(o => {
      csv += `"${o.orderId}","${o.customer.fullName}","${o.customer.phone}","${o.customer.city}","${o.customer.address.replace(/"/g,'""')}","${o.items?.[0]?.bundleTitle || ''}","${o.total}","${o.date}","${o.status}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `ElizaGold_Orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // All settings live in one Convex document, so both "Save Prices" and
  // "Save Settings" persist the full current draft Ã¢â‚¬â€ whichever tab the
  // admin is on, nothing else in the draft gets reverted.
  const persistSettings = useCallback(async () => {
    if (!adminToken) return false;
    try {
      await updateSettingsMutation({
        token: adminToken,
        announcementText,
        whatsappNumber,
        productPrices,
        freeDeliverySiteWide,
        singleBottleShippingFee,
      });
      return true;
    } catch {
      return false;
    }
  }, [adminToken, updateSettingsMutation, announcementText, whatsappNumber, productPrices, freeDeliverySiteWide, singleBottleShippingFee]);

  const saveProductPrices = async () => {
    const ok = await persistSettings();
    alert(ok ? "Prices saved Ã¢â‚¬â€ every visitor will now see the updated prices." : "Could not save prices. Please try again.");
  };

  const saveSettings = async () => {
    const ok = await persistSettings();
    if (ok) {
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } else {
      alert("Could not save settings. Please try again.");
    }
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ METRICS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

  let filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || o.orderId.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.customer.city.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchDate = dateRange === "ALL" || isInDateRange(parseOrderDate(o.date), dateRange);
    return matchSearch && matchStatus && matchDate;
  });

  if (sortOrder === "OLDEST") {
    filteredOrders = [...filteredOrders].reverse();
  }

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const dateGroups = groupOrdersByDate(currentOrders, sortOrder);

  // Today's summary stats
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayOrders = orders.filter(o => parseOrderDate(o.date) >= todayStart);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const todayPendingDispatch = todayOrders.filter(o => o.status === "Pending" || o.status === "Processing").length;

  // Bulk action helpers
  const allCurrentSelected = currentOrders.length > 0 && currentOrders.every(o => selectedOrders.has(o.orderId));
  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(currentOrders.map(o => o.orderId)));
    }
  };
  const toggleSelectOne = (orderId: string) => {
    const next = new Set(selectedOrders);
    if (next.has(orderId)) next.delete(orderId); else next.add(orderId);
    setSelectedOrders(next);
  };
  const bulkUpdateStatus = async (newStatus: string) => {
    const toUpdate = orders.filter(o => selectedOrders.has(o.orderId));
    const updated = orders.map(o => selectedOrders.has(o.orderId) ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem("eliza_orders_list", JSON.stringify(updated));
    for (const o of toUpdate) {
      if (o._id && adminToken) {
        try { await updateOrderStatusMutation({ token: adminToken, id: o._id as any, status: newStatus }); } catch { /* continue */ }
      }
    }
    setSelectedOrders(new Set());
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ LOGIN SCREEN Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  if (!isAuthenticated) {
    const isLockedOut = !!lockoutUntil && Date.now() < lockoutUntil;
    return (
      <div className="min-h-screen bg-[#0b2912] text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0e2f17] border border-[#a9812e]/40 p-8 sm:p-10 rounded-2xl max-w-md w-full shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] text-center space-y-7">
          <div className="w-16 h-16 rounded-full bg-[#06170b] border border-[#a9812e] mx-auto flex items-center justify-center p-1">
            <Image src="/assets/logo-icon.webp" alt="Eliza Gold" width={100} height={100} className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#e9c869]">
              Eliza Gold Admin
            </h1>
            <p className="text-[11px] text-[#9fb3a3] mt-1.5 uppercase tracking-[0.15em] font-semibold">Store Operations Control Center</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#c9a227]" /> Admin Passcode
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter your admin passcode"
                disabled={isLockedOut || loginLoading}
                autoFocus
                className="w-full px-4 py-3 bg-black/25 border border-[#a9812e]/40 rounded-lg text-white outline-none focus:border-[#c9a227] text-sm disabled:opacity-50"
              />
              {passcodeError && !isLockedOut && (
                <p className="text-xs text-[#e29184] mt-2 font-medium">Incorrect passcode. Please try again.</p>
              )}
              {isLockedOut && (
                <p className="text-xs text-[#e29184] mt-2 font-medium">Too many attempts Ã¢â‚¬â€ try again in a minute.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLockedOut || loginLoading || !passcodeInput}
              className="w-full bg-[#c9a227] text-[#06170b] py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#dab53a] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Sign In to Control Panel
                </>
              )}
            </button>
          </form>
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#c9a227] hover:underline pt-1">Ã¢â€ Â Return to Storefront</Link>
        </div>
      </div>
    );
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ MAIN DASHBOARD Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  return (
    <SessionBoundary onExpire={handleSessionExpired}>
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col font-sans">
      {/* Notification sound (silent mp3 fallback) */}
      <audio ref={audioRef} src="data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA" preload="auto" />

      {/* NEW ORDER NOTIFICATION TOAST */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-[999] max-w-sm w-full bg-[#0b2912] text-white rounded-xl shadow-2xl border border-[#a9812e]/50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#a9812e] rounded-lg flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[#041207]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#dab53a] uppercase tracking-wide">New Order Received</p>
              <p className="text-xs font-bold mt-1">{newOrderAlert.customer.fullName} Ã¢â‚¬â€ {newOrderAlert.customer.city}</p>
              <p className="text-xs text-gray-300">{newOrderAlert.items?.[0]?.bundleTitle} Ã‚Â· Rs. {newOrderAlert.total?.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{newOrderAlert.orderId}</p>
            </div>
            <button onClick={() => setNewOrderAlert(null)} className="text-gray-400 hover:text-white shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-[#0b2912] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#a9812e]/30 shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#a9812e] bg-black/40 overflow-hidden flex items-center justify-center p-0.5">
            <Image src="/assets/logo-icon.webp" alt="Logo" width={50} height={50} className="w-full h-full object-cover mix-blend-screen" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-[#dab53a] leading-none">
              Eliza Gold Manager
            </h1>
            <span className="text-[9px] text-emerald-300/80 font-extrabold uppercase tracking-widest">Operations Control Center</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification bell */}
          <button
            onClick={() => { setActiveTab("orders"); setNotificationCount(0); }}
            className="relative p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Bell className="w-4 h-4 text-[#c9a227]" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <Link href="/" target="_blank" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-lg border border-white/20 transition-colors">
            <Eye className="w-3.5 h-3.5 text-[#c9a227]" />
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
          <div className="text-[10px] uppercase font-bold text-[#a9812e] tracking-widest px-3 py-2">Control Modules</div>
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
                  isActive ? "bg-[#a9812e] text-[#041207] shadow-md" : "text-gray-300 hover:bg-white/10 hover:text-white"
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
            <div className="text-[10px] uppercase font-bold text-[#a9812e] tracking-widest px-3">Live Stats</div>
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

          {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TAB 1: OVERVIEW Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
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
                  { label: "Total Orders", value: String(orders.length), sub: `${pendingCount + processingCount} need action`, icon: ShoppingBag, color: "text-[#a9812e]", bg: "bg-amber-50" },
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
                    <BarChart3 className="w-4 h-4 text-[#a9812e]" />
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
                    <MapPin className="w-4 h-4 text-[#a9812e]" />
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
                          <div className="bg-[#a9812e] h-1.5 rounded-full" style={{ width: `${(count / (topCities[0]?.[1] || 1)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bundle Popularity */}
              <div className="bg-white p-5 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-[#a9812e]" />
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
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-[#0b2912] font-bold hover:underline">View All Ã¢â€ â€™</button>
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

          {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TAB 2: ORDERS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Ã¢â€â‚¬Ã¢â€â‚¬ Header Ã¢â€â‚¬Ã¢â€â‚¬ */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Orders Manager</h2>
                  <p className="text-xs text-gray-500">Manage COD orders, dispatch status & courier manifests</p>
                </div>
                <button onClick={handleExportCSV} className="inline-flex items-center gap-2 bg-[#0b2912] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#154620] transition-colors shadow-md self-start sm:self-auto">
                  <Download className="w-4 h-4 text-[#a9812e]" />
                  Export CSV Manifest
                </button>
              </div>

              {/* Ã¢â€â‚¬Ã¢â€â‚¬ Today's Summary Banner Ã¢â€â‚¬Ã¢â€â‚¬ */}
              <div className="bg-gradient-to-r from-[#0b2912] to-[#154620] rounded-2xl p-4 flex flex-wrap items-center gap-6 text-white shadow-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#a9812e]" />
                  <span className="font-bold text-sm">Today</span>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-2xl font-extrabold">{todayOrders.length}</p>
                    <p className="text-[10px] text-white/60 uppercase font-bold">New Orders</p>
                  </div>
                  <div className="w-px bg-white/20" />
                  <div>
                    <p className="text-2xl font-extrabold">Rs. {todayRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-white/60 uppercase font-bold">Revenue</p>
                  </div>
                  <div className="w-px bg-white/20" />
                  <div>
                    <p className="text-2xl font-extrabold text-amber-300">{todayPendingDispatch}</p>
                    <p className="text-[10px] text-white/60 uppercase font-bold">Pending Dispatch</p>
                  </div>
                </div>
              </div>

              {/* Ã¢â€â‚¬Ã¢â€â‚¬ Date Range Pills Ã¢â€â‚¬Ã¢â€â‚¬ */}
              <div className="flex flex-wrap gap-2">
                {([["TODAY","Today"],["YESTERDAY","Yesterday"],["7DAYS","Last 7 Days"],["MONTH","This Month"],["ALL","All Time"]] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setDateRange(val); setCurrentPage(1); setSelectedOrders(new Set()); }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                      dateRange === val
                        ? "bg-[#0b2912] text-white border-[#0b2912] shadow-md"
                        : "bg-white text-gray-600 border-gray-300 hover:border-[#0b2912] hover:text-[#0b2912]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Ã¢â€â‚¬Ã¢â€â‚¬ Search & Filter Bar Ã¢â€â‚¬Ã¢â€â‚¬ */}
              <div className="bg-white p-4 rounded-2xl border border-[#e7e1d5] flex flex-col sm:flex-row items-center gap-3 shadow-sm">
                <div className="relative w-full sm:flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by name, phone, city or order #..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:border-[#0b2912]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-bold text-gray-700">
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <select value={sortOrder} onChange={e => { setSortOrder(e.target.value as "NEWEST" | "OLDEST"); setCurrentPage(1); }} className="px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-bold text-gray-700">
                    <option value="NEWEST">Newest First</option>
                    <option value="OLDEST">Oldest First</option>
                  </select>
                </div>
                <span className="text-xs text-gray-400 font-medium shrink-0">{filteredOrders.length} orders</span>
              </div>

              {/* Ã¢â€â‚¬Ã¢â€â‚¬ Bulk Actions Bar Ã¢â€â‚¬Ã¢â€â‚¬ */}
              <AnimatePresence>
                {selectedOrders.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="bg-[#0b2912] text-white p-3 rounded-xl flex flex-wrap items-center gap-3 shadow-lg"
                  >
                    <span className="text-xs font-bold">{selectedOrders.size} order{selectedOrders.size > 1 ? "s" : ""} selected</span>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => bulkUpdateStatus("Processing")} className="px-3 py-1.5 text-[11px] font-bold bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors">Mark Processing</button>
                      <button onClick={() => bulkUpdateStatus("Dispatched")} className="px-3 py-1.5 text-[11px] font-bold bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">Mark Dispatched</button>
                      <button onClick={() => bulkUpdateStatus("Delivered")} className="px-3 py-1.5 text-[11px] font-bold bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">Mark Delivered</button>
                      <button onClick={() => bulkUpdateStatus("Cancelled")} className="px-3 py-1.5 text-[11px] font-bold bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Cancel</button>
                    </div>
                    <button onClick={() => setSelectedOrders(new Set())} className="ml-auto text-xs text-white/60 hover:text-white">Clear</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ã¢â€â‚¬Ã¢â€â‚¬ Orders Table with Date Groups Ã¢â€â‚¬Ã¢â€â‚¬ */}
              <div className="bg-white rounded-2xl border border-[#e7e1d5] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-[#0b2912] text-white font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-3 w-10">
                          <button onClick={toggleSelectAll} className="text-white/70 hover:text-white">
                            {allCurrentSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        </th>
                        <th className="py-3.5 px-4">Order ID</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">City</th>
                        <th className="py-3.5 px-4">Package</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4">Status & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dateGroups.map(group => (
                        <React.Fragment key={group.dateKey}>
                          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Date Group Header Ã¢â€â‚¬Ã¢â€â‚¬ */}
                          <tr className="bg-[#faf8f5]">
                            <td colSpan={7} className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-[#a9812e]" />
                                <span className="font-bold text-sm text-[#0b2912]">{group.label}</span>
                                <span className="text-[10px] font-bold bg-[#0b2912]/10 text-[#0b2912] px-2 py-0.5 rounded-full">{group.orders.length} order{group.orders.length !== 1 ? "s" : ""}</span>
                              </div>
                            </td>
                          </tr>
                          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Orders in this date group Ã¢â€â‚¬Ã¢â€â‚¬ */}
                          {group.orders.map(o => {
                            const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.Pending;
                            const isExpanded = expandedOrderId === o.orderId;
                            const isSelected = selectedOrders.has(o.orderId);
                            const isPending = o.status === "Pending";
                            return (
                              <React.Fragment key={o.orderId}>
                                <tr className={`transition-colors ${isPending ? "bg-amber-50/70 hover:bg-amber-50" : "hover:bg-gray-50/60"} ${isSelected ? "!bg-blue-50" : ""}`}>
                                  <td className="py-3.5 px-3">
                                    <button onClick={() => toggleSelectOne(o.orderId)} className="text-gray-400 hover:text-[#0b2912]">
                                      {isSelected ? <CheckSquare className="w-4 h-4 text-[#0b2912]" /> : <Square className="w-4 h-4" />}
                                    </button>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-[#0b2912]">{o.orderId}</div>
                                    <button onClick={() => setExpandedOrderId(isExpanded ? null : o.orderId)} className="text-[10px] text-gray-400 hover:text-gray-700 flex items-center gap-0.5 mt-0.5">
                                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      {isExpanded ? "Hide" : "Details"}
                                    </button>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                                      {o.customer.fullName}
                                      <button onClick={() => handleCopy(o.customer.fullName, `name-${o.orderId}`)} className="text-gray-400 hover:text-[#0b2912]" title="Copy Name">
                                        {copiedId === `name-${o.orderId}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </p>
                                    <div className="text-[11px] text-blue-600 flex items-center gap-1 mt-0.5 hover:underline">
                                      <a href={`tel:${o.customer.phone}`}><Phone className="w-3 h-3" />{o.customer.phone}</a>
                                      <button onClick={() => handleCopy(o.customer.phone, `phone-${o.orderId}`)} className="text-gray-400 hover:text-[#0b2912]" title="Copy Phone">
                                        {copiedId === `phone-${o.orderId}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 font-semibold text-gray-700">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-gray-400" />{o.customer.city}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="font-medium text-gray-800">{o.items?.[0]?.bundleTitle || "Roghan-e-Azam"}</span>
                                  </td>
                                  <td className="py-3.5 px-4 font-extrabold text-gray-900">Rs. {o.total?.toLocaleString()}</td>
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <select
                                        value={o.status || "Pending"}
                                        onChange={e => updateOrderStatus(o.orderId, e.target.value, o._id)}
                                        className={`px-2.5 py-1.5 text-xs rounded-lg font-bold outline-none border transition-colors cursor-pointer ${sc.bg} ${sc.text} ${sc.border}`}
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Dispatched">Dispatched</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
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
                                        className="p-1.5 bg-[#0b2912] text-[#a9812e] rounded-lg hover:bg-black transition-all inline-flex items-center justify-center shadow-sm"
                                        title="Print Courier Slip"
                                      >
                                        <Printer className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleExportToSheets(o)}
                                        disabled={syncingOrderId === o.orderId}
                                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all inline-flex items-center justify-center shadow-sm disabled:opacity-50"
                                        title="Push to Google Sheets"
                                      >
                                        {syncingOrderId === o.orderId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                                      </button>
                                      <button onClick={() => setEditingOrder(o)} className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all inline-flex items-center justify-center shadow-sm" title="Edit Order">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                      </button>
                                      <button onClick={() => setDeleteConfirmOrderId(o.orderId)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all inline-flex items-center justify-center shadow-sm" title="Delete Order">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
                                          <p className="font-semibold text-gray-800 flex items-start gap-1.5">
                                            {o.customer.address}
                                            <button onClick={() => handleCopy(o.customer.address, `address-${o.orderId}`)} className="text-gray-400 hover:text-[#0b2912] mt-0.5 shrink-0" title="Copy Address">
                                              {copiedId === `address-${o.orderId}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                          </p>
                                          <p className="text-gray-600">{o.customer.city}</p>
                                        </div>
                                        <div>
                                          <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Items Ordered</span>
                                          {o.items?.map((item, i) => (
                                            <p key={i} className="font-semibold text-gray-800">{item.bundleTitle} Ãƒâ€” {item.quantity} Ã¢â‚¬â€ Rs. {item.price?.toLocaleString()}</p>
                                          ))}
                                        </div>
                                        <div>
                                          <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1">Payment</span>
                                          <p className="font-extrabold text-lg text-[#0b2912]">Rs. {o.total?.toLocaleString()}</p>
                                          <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded">Cash On Delivery</span>
                                        </div>
                                      </div>
                                      {o.adminNotes && (
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                          <span className="font-bold text-yellow-800 uppercase text-[10px] flex items-center gap-1 mb-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            Admin Note
                                          </span>
                                          <p className="text-xs text-yellow-900 font-medium whitespace-pre-wrap">{o.adminNotes}</p>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      ))}
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
                {/* -- Improved Pagination -- */}
                {totalPages >= 1 && (
                  <div className="p-4 border-t border-[#e7e1d5] flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        Showing {filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
                      </span>
                      <select
                        value={itemsPerPage}
                        onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white font-bold text-gray-700 outline-none"
                      >
                        <option value={20}>20/page</option>
                        <option value={50}>50/page</option>
                        <option value={100}>100/page</option>
                      </select>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-30">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let page: number;
                          if (totalPages <= 7) { page = i + 1; }
                          else if (currentPage <= 4) { page = i + 1; }
                          else if (currentPage >= totalPages - 3) { page = totalPages - 6 + i; }
                          else { page = currentPage - 3 + i; }
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                                currentPage === page ? "bg-[#0b2912] text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-30">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
              {/* EDIT ORDER MODAL */}
              <AnimatePresence>
                {editingOrder && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
                      <button onClick={() => setEditingOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
                      <h3 className="text-xl font-bold font-serif text-[#0b2912] mb-4">Edit Order {editingOrder.orderId}</h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        if (!adminToken || !editingOrder._id) return;
                        try {
                          await updateOrderDetailsMutation({
                            token: adminToken,
                            id: editingOrder._id,
                            customer: {
                              fullName: formData.get("fullName") as string,
                              phone: formData.get("phone") as string,
                              city: formData.get("city") as string,
                              address: formData.get("address") as string,
                            },
                            adminNotes: formData.get("adminNotes") as string,
                          });
                          setEditingOrder(null);
                        } catch (err) { alert("Failed to update order"); }
                      }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                            <input name="fullName" defaultValue={editingOrder.customer.fullName} required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912]" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                            <input name="phone" defaultValue={editingOrder.customer.phone} required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Full Address</label>
                            <input name="address" defaultValue={editingOrder.customer.address} required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912]" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                            <input name="city" defaultValue={editingOrder.customer.city} required className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912]" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Internal Admin Note (Optional)</label>
                          <textarea name="adminNotes" defaultValue={editingOrder.adminNotes || ""} placeholder="Add a private note about this order..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-[#0b2912] resize-none h-24" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3 border-t">
                          <button type="button" onClick={() => setEditingOrder(null)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                          <button type="submit" className="bg-[#0b2912] text-white px-5 py-2 text-sm font-bold rounded-lg hover:bg-[#154620]">Save Changes</button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* DELETE CONFIRMATION MODAL */}
              <AnimatePresence>
                {deleteConfirmOrderId && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl relative">
                      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Order?</h3>
                      <p className="text-sm text-gray-500 mb-6">Are you sure you want to permanently delete order <strong>{deleteConfirmOrderId}</strong>? This action cannot be undone.</p>
                      <div className="flex justify-center gap-3">
                        <button onClick={() => setDeleteConfirmOrderId(null)} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                        <button onClick={async () => {
                          const order = orders.find(o => o.orderId === deleteConfirmOrderId);
                          if (!order) return;
                          
                          const updatedOrders = orders.filter(o => o.orderId !== deleteConfirmOrderId);
                          setOrders(updatedOrders);
                          localStorage.setItem("eliza_orders_list", JSON.stringify(updatedOrders));

                          if (adminToken && order._id) {
                            try {
                              await deleteOrderMutation({ token: adminToken, id: order._id as any });
                            } catch (err) { alert("Failed to delete order from server"); }
                          }
                          setDeleteConfirmOrderId(null);
                        }} className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl">Yes, Delete</button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

          {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TAB 3: REVIEWS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
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

          {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TAB 4: PRODUCTS & PRICING Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Product Bundles & Pricing</h2>
                <p className="text-xs text-gray-500">Update bundle prices Ã¢â‚¬â€ changes sync to storefront on save</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Prices are stored centrally Ã¢â‚¬â€ once saved, every visitor sees the new price immediately, on any device.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: "bottle1" as const, label: "1 Bottle (Starter Pack)", option: "Option 1", badge: null, badgeColor: "" },
                  { key: "bottle2" as const, label: "2 Bottles (Popular Pack)", option: "Option 2", badge: "Most Popular", badgeColor: "bg-[#a9812e] text-[#041207]" },
                  { key: "bottle3" as const, label: "3 Bottles (Family Pack)", option: "Option 3", badge: null, badgeColor: "" }
                ].map(p => (
                  <div key={p.key} className={`bg-white p-6 rounded-2xl shadow-sm space-y-4 relative ${p.badge ? "border-2 border-[#a9812e]" : "border border-[#e7e1d5]"}`}>
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
                  <span className="font-bold">1 Bottle:</span> Rs. {productPrices.bottle1.toLocaleString()} &nbsp;Ã‚Â·&nbsp;
                  <span className="font-bold">2 Bottles:</span> Rs. {productPrices.bottle2.toLocaleString()} &nbsp;Ã‚Â·&nbsp;
                  <span className="font-bold">3 Bottles:</span> Rs. {productPrices.bottle3.toLocaleString()}
                </div>
                <button onClick={saveProductPrices} className="bg-[#0b2912] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#154620] transition-colors">
                  Save Prices
                </button>
              </div>
            </div>
          )}

          {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TAB 5: COUPONS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Coupon & Discount Manager</h2>
                <p className="text-xs text-gray-500">Create & activate promo codes Ã¢â‚¬â€ changes apply at checkout for every customer, instantly</p>
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
                  onClick={async () => {
                    if (newCouponCode && newCouponDiscount && adminToken) {
                      try {
                        await addCouponMutation({
                          token: adminToken,
                          code: newCouponCode,
                          discount: newCouponDiscount,
                          discountValue: Number(newCouponValue) || 0,
                          type: "Custom",
                        });
                        setNewCouponCode(""); setNewCouponDiscount(""); setNewCouponValue("");
                      } catch {
                        alert("Could not add coupon. Please try again.");
                      }
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
                    {convexCoupons.map(c => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="py-3.5 px-4 font-black text-[#0b2912] font-mono tracking-wider">{c.code}</td>
                        <td className="py-3.5 px-4 font-semibold">{c.discount}</td>
                        <td className="py-3.5 px-4 font-semibold">{c.discountValue || "Ã¢â‚¬â€"}%</td>
                        <td className="py-3.5 px-4">
                          <button onClick={() => adminToken && toggleCouponMutation({ token: adminToken, id: c._id, active: !c.active }).catch(() => alert("Could not update coupon."))}>
                            {c.active
                              ? <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded"><CheckCircle2 className="w-3 h-3" /> Active</span>
                              : <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded"><XCircle className="w-3 h-3" /> Paused</span>
                            }
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <button onClick={() => adminToken && deleteCouponMutation({ token: adminToken, id: c._id }).catch(() => alert("Could not delete coupon."))} className="text-red-500 hover:text-red-700 font-bold text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TAB 6: STORE SETTINGS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
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
                  <input type="text" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+923287657890" className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl font-medium focus:border-[#0b2912] outline-none" />
                  <p className="text-[10px] text-gray-400 mt-1">Format: +923287657890 (no spaces or dashes)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Quick Links</label>
                  <div className="flex flex-wrap gap-2">
                    <a href="https://dashboard.convex.dev" target="_blank" rel="noreferrer" className="text-xs bg-[#0b2912] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#154620] transition-colors flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-[#a9812e]" /> Convex Cloud Dashboard
                    </a>
                    <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                      <Eye className="w-3 h-3" /> Vercel Deployments
                    </a>
                    <Link href="/" target="_blank" className="text-xs bg-[#a9812e] text-[#041207] px-3 py-1.5 rounded-lg font-bold hover:brightness-110 transition-colors flex items-center gap-1.5">
                      <Eye className="w-3 h-3" /> View Storefront Live
                    </Link>
                  </div>
                </div>
              </div>

              {/* Shipping & Delivery */}
              <div className="bg-white p-6 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-5 max-w-xl">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#a9812e]" /> Shipping &amp; Delivery</h3>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Free Delivery Site-Wide</label>
                    <p className="text-[10px] text-gray-400 mt-0.5">When on, every order ships free regardless of bundle Ã¢â‚¬â€ useful for promotions.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={freeDeliverySiteWide}
                    onClick={() => setFreeDeliverySiteWide(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${freeDeliverySiteWide ? "bg-emerald-500" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${freeDeliverySiteWide ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">1-Bottle Pack Shipping Fee (PKR)</label>
                  <input
                    type="number"
                    value={singleBottleShippingFee}
                    onChange={e => setSingleBottleShippingFee(Number(e.target.value))}
                    disabled={freeDeliverySiteWide}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl font-bold focus:border-[#0b2912] outline-none disabled:opacity-50 disabled:bg-gray-50"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Charged only on the 1-Bottle Starter Pack Ã¢â‚¬â€ 2 &amp; 3-Bottle packs always ship free.
                    {freeDeliverySiteWide && " Currently ignored because free delivery is on, site-wide."}
                  </p>
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
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#a9812e]" /> Admin Access</h3>
                <div className="text-xs space-y-2 text-gray-600">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold">Admin URL</span>
                    <span className="font-mono text-gray-800">elizagold.vercel.app/admin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold">Passcode</span>
                    <span className="text-gray-500">Stored server-side, never shown here. Session expires automatically after 24 hours.</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold">To change the passcode</span>
                    <span className="text-gray-500">Update <code className="bg-gray-100 px-1 rounded">ADMIN_PASSWORD</code> in the Convex dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â PRINT COURIER SLIP MODAL Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      {selectedPrintOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 space-y-4 border-2 border-black shadow-2xl font-sans text-black">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <div>
                <h3 className="font-serif font-black text-lg uppercase tracking-wider text-[#0b2912]">ELIZA GOLD PAKISTAN</h3>
                <p className="text-[10px] font-bold text-gray-500">COD COURIER DISPATCH SLIP</p>
              </div>
              <button onClick={() => setSelectedPrintOrder(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { label: "ORDER / TRACKING NO", value: <span className="font-mono text-sm font-black">{selectedPrintOrder.orderId}</span> },
                { label: "CONSIGNEE (CUSTOMER)", value: <><p className="font-bold text-sm">{selectedPrintOrder.customer.fullName}</p><p className="font-semibold">{selectedPrintOrder.customer.phone}</p></> },
                { label: "DESTINATION", value: <><p className="font-bold">{selectedPrintOrder.customer.city}</p><p className="text-gray-700">{selectedPrintOrder.customer.address}</p></> },
                { label: "CONTENTS", value: <p className="font-semibold">{selectedPrintOrder.items?.[0]?.bundleTitle || "Roghan-e-Azam Hair Oil"}</p> }
              ].map(row => (
                <div key={row.label} className="border-b border-gray-200 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 block mb-0.5">{row.label}:</span>
                  {row.value}
                </div>
              ))}
              <div className="bg-[#0b2912] text-white p-3 rounded-xl flex justify-between items-center">
                <span className="font-black text-sm">COLLECT CASH (COD):</span>
                <span className="text-xl font-black text-[#a9812e]">Rs. {selectedPrintOrder.total?.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800">
                <Printer className="w-4 h-4 text-[#a9812e]" /> Print Slip
              </button>
              <button onClick={() => setSelectedPrintOrder(null)} className="px-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-xs uppercase hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </SessionBoundary>
  );
}

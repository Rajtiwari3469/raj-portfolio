"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Users,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Trash2,
  Search,
  Calendar,
  ArrowUpRight,
  RefreshCw,
  Activity,
  Bot,
  User,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  TrendingUp,
  Timer,
  Layers,
  AppWindow,
  Apple,
  LayoutDashboard,
  Download,
  Folder,
  FolderOpen,
  FileText,
} from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

interface StatsData {
  total: number;
  recent: number;
  uniqueVisitors: number;
  recentUniqueVisitors: number;
  avgPerDay: number;
  bots: number;
  recentBots: number;
  humanVisits: number;
  recentUserVisits: number;
  recentHumanVisits: number;
  byPage: { name: string; count: number }[];
  byDevice: { name: string; count: number }[];
  byBrowser: { name: string; count: number }[];
  byOs: { name: string; count: number }[];
  byDay: { date: string; count: number }[];
  byHour: { hour: number; count: number }[];
  topReferrers: { name: string; count: number }[];
  period: number;
}

interface PublicRecord {
  id: string;
  page: string;
  ip: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  language: string | null;
  isBot: boolean;
  sessionId: string | null;
  visitDuration: number | null;
  createdAt: string;
}

interface RecordsResponse {
  records: PublicRecord[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

export default function PublicRecordsPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [records, setRecords] = useState<PublicRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPage, setFilterPage] = useState("");
  const [filterDevice, setFilterDevice] = useState("");
  const [filterBrowser, setFilterBrowser] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [deleteAll, setDeleteAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PublicRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "pages" | "devices" | "traffic" | "records" | "downloads">("overview");
  const [visitors, setVisitors] = useState<{ visitorId: string; label: string; records: PublicRecord[]; lastVisit: string; isBot: boolean }[]>([]);
  const [isVisitorsLoading, setIsVisitorsLoading] = useState(false);
  const [visitorSummary, setVisitorSummary] = useState({ total: 0, users: 0, bots: 0 });
  const [expandedVisitor, setExpandedVisitor] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const res = await fetch(`/api/admin/public-records/stats?period=${period}`);
      const data = await res.json();
      if (data.error) {
        console.error("Stats API error:", data.error);
        setStats(null);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  }, [period]);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (filterPage) params.set("filterPage", filterPage);
      if (filterDevice) params.set("filterDevice", filterDevice);
      if (filterBrowser) params.set("filterBrowser", filterBrowser);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/public-records?${params}`);
      const data: RecordsResponse = await res.json();
      if (data.error) {
        console.error("Records API error:", data.error);
        setRecords([]);
        setTotalPages(0);
        setTotalRecords(0);
      } else {
        setRecords(data.records || []);
        setTotalPages(data.totalPages || 0);
        setTotalRecords(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterPage, filterDevice, filterBrowser, dateFrom, dateTo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecords();
  }, [fetchRecords]);

  const fetchVisitors = useCallback(async () => {
    setIsVisitorsLoading(true);
    try {
      const res = await fetch("/api/admin/public-records/visitors");
      const data = await res.json();
      if (data.visitors) {
        setVisitors(data.visitors);
        setVisitorSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
    } finally {
      setIsVisitorsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "downloads") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchVisitors();
    }
  }, [activeTab, fetchVisitors]);

  const handleDownload = async (visitorId?: string) => {
    setIsDownloading(true);
    try {
      const url = visitorId
        ? `/api/admin/public-records/download?visitorId=${encodeURIComponent(visitorId)}`
        : "/api/admin/public-records/download";
      const res = await fetch(url);
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = visitorId ? `visitor-${visitorId}-records.csv` : "all-records.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast("Download started");
    } catch {
      toast("Download failed", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (deleteIds.length === 0) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/public-records?ids=${deleteIds.join(",")}`, { method: "DELETE" });
      if (res.ok) {
        toast(`${deleteIds.length} record(s) deleted`);
        setDeleteIds([]);
        fetchRecords();
        fetchStats();
      } else {
        toast("Failed to delete records", "error");
      }
    } catch {
      toast("Failed to delete records", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/public-records?all=true", { method: "DELETE" });
      if (res.ok) {
        toast("All records deleted");
        setDeleteAll(false);
        fetchRecords();
        fetchStats();
      } else {
        toast("Failed to delete records", "error");
      }
    } catch {
      toast("Failed to delete records", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleRecordSelection = (id: string) => {
    setDeleteIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllRecords = () => {
    if (deleteIds.length === records.length) {
      setDeleteIds([]);
    } else {
      setDeleteIds(records.map((r) => r.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatNumber = (n: number) => n.toLocaleString("en-IN");

  const getDeviceIcon = (device: string | null) => {
    switch (device?.toLowerCase()) {
      case "mobile": return <Smartphone size={14} />;
      case "tablet": return <Tablet size={14} />;
      default: return <Monitor size={14} />;
    }
  };

  const getBarWidth = (count: number, max: number) => {
    return max > 0 ? (count / max) * 100 : 0;
  };

  const filteredRecords = records.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.page?.toLowerCase().includes(term) ||
      r.ip?.toLowerCase().includes(term) ||
      r.browser?.toLowerCase().includes(term) ||
      r.os?.toLowerCase().includes(term) ||
      r.referrer?.toLowerCase().includes(term)
    );
  });

  const maxDayCount = stats ? Math.max(...stats.byDay.map((d) => d.count), 1) : 1;
  const maxHourCount = stats ? Math.max(...stats.byHour.map((h) => h.count), 1) : 1;

  const overviewStats = stats
    ? [
        { label: "Total Views", value: formatNumber(stats.total), icon: Eye, color: "text-primary", glow: "rgba(0,212,255,0.15)" },
        { label: "Unique Visitors", value: formatNumber(stats.uniqueVisitors), icon: Users, color: "text-secondary", glow: "rgba(139,92,246,0.15)" },
        { label: "Avg Daily Views", value: stats.avgPerDay.toString(), icon: TrendingUp, color: "text-green-400", glow: "rgba(74,222,128,0.15)" },
        { label: "User Visits", value: formatNumber(stats.humanVisits), icon: User, color: "text-accent", glow: "rgba(6,182,212,0.15)" },
        { label: "Bot Visits", value: formatNumber(stats.bots), icon: Bot, color: "text-gold", glow: "rgba(245,158,11,0.15)" },
        { label: `Last ${period}d Views`, value: formatNumber(stats.recent), icon: Activity, color: "text-neon-cyan", glow: "rgba(34,211,238,0.15)" },
      ]
    : [];

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { id: "pages" as const, label: "Pages", icon: Layers },
    { id: "devices" as const, label: "Devices", icon: Monitor },
    { id: "traffic" as const, label: "Traffic", icon: BarChart3 },
    { id: "records" as const, label: "Records", icon: Eye },
    { id: "downloads" as const, label: "Downloads", icon: Download },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Public Records</h1>
          <p className="text-foreground/60 mt-1">Track visitor analytics and page views</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            <span className="text-sm text-green-400 font-medium">Live Tracking</span>
          </div>
          <select
            value={period}
            onChange={(e) => { setPeriod(e.target.value); }}
            className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground/80 focus:outline-none focus:border-primary/30 cursor-pointer"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
            <option value="9999">All Time</option>
          </select>
          <button
            onClick={() => { fetchStats(); fetchRecords(); }}
            className="p-2.5 rounded-xl bg-glass-bg border border-glass-border hover:bg-primary/10 hover:border-primary/20 text-foreground/60 hover:text-primary transition-all duration-200"
          >
            <RefreshCw size={18} className={isStatsLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary/15 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,212,255,0.05)]"
                : "text-foreground/50 hover:bg-white/[0.03] border border-transparent hover:text-foreground/70"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {isStatsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <GlassPanel key={i} className="min-h-[120px]">
                      <div className="animate-pulse space-y-3 h-full flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-lg bg-white/5" />
                        <div className="space-y-2">
                          <div className="w-16 h-6 bg-white/5 rounded" />
                          <div className="w-20 h-3 bg-white/5 rounded" />
                        </div>
                      </div>
                    </GlassPanel>
                  ))
                : overviewStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="h-full"
                    >
                      <GlassPanel className="relative overflow-hidden group h-full min-h-[120px] flex flex-col justify-between">
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: `radial-gradient(circle at 50% 50%, ${stat.glow}, transparent 70%)` }}
                        />
                        <div className="relative flex flex-col justify-between h-full">
                          <stat.icon size={20} className={`${stat.color}`} />
                          <div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-foreground/50 mt-1">{stat.label}</p>
                          </div>
                        </div>
                      </GlassPanel>
                    </motion.div>
                  ))}
            </div>

            {stats && stats.byDay.length > 0 && (
              <GlassPanel>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" />
                  Daily Views (Last {period} Days)
                </h3>
                <div className="flex items-end gap-1 h-40 overflow-x-auto">
                  {stats.byDay.map((day, i) => (
                    <div key={day.date} className="flex flex-col items-center gap-1 min-w-[8px] group relative">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                        <div className="px-2 py-1 rounded-lg bg-[#0a0a1f] border border-white/10 text-xs whitespace-nowrap">
                          {formatNumber(day.count)} views
                        </div>
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${getBarWidth(day.count, maxDayCount) * 100}%` }}
                        transition={{ delay: i * 0.02, duration: 0.4 }}
                        className="w-2 min-h-[2px] rounded-t bg-gradient-to-t from-primary/40 to-primary hover:from-primary/60 hover:to-neon-cyan transition-colors cursor-pointer"
                        style={{ minHeight: day.count > 0 ? "4px" : "1px" }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-foreground/40">
                  <span>{stats.byDay[0]?.date ? formatDate(stats.byDay[0].date) : ""}</span>
                  <span>{stats.byDay[stats.byDay.length - 1]?.date ? formatDate(stats.byDay[stats.byDay.length - 1].date) : ""}</span>
                </div>
              </GlassPanel>
            )}

            {stats && stats.byHour.length > 0 && (
              <GlassPanel>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-secondary" />
                  Hourly Traffic Pattern
                </h3>
                <div className="grid grid-cols-12 gap-2">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const hourData = stats.byHour.find((h) => h.hour === hour);
                    const count = hourData?.count || 0;
                    const height = getBarWidth(count, maxHourCount);
                    return (
                      <div key={hour} className="flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                          <div className="px-2 py-1 rounded-lg bg-[#0a0a1f] border border-white/10 text-xs whitespace-nowrap">
                            {hour}:00 — {count} views
                          </div>
                        </div>
                        <div className="w-full h-20 flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: hour * 0.02, duration: 0.3 }}
                            className="w-full rounded-t bg-gradient-to-t from-secondary/30 to-secondary/60 hover:from-secondary/50 hover:to-neon-purple transition-colors"
                            style={{ minHeight: count > 0 ? "3px" : "1px" }}
                          />
                        </div>
                        <span className="text-[9px] text-foreground/30">{hour % 3 === 0 ? `${hour}` : ""}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            )}
          </motion.div>
        )}

        {activeTab === "pages" && (
          <motion.div
            key="pages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {isStatsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassPanel className="h-full">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Layers size={18} className="text-primary" />
                    Page Views Breakdown
                  </h3>
                  <div className="space-y-3">
                    {stats.byPage.map((item, i) => {
                      const maxPageCount = Math.max(...stats.byPage.map((p) => p.count), 1);
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="space-y-1"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/80 font-mono">{item.name || "/"}</span>
                            <span className="text-primary font-semibold">{formatNumber(item.count)}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${getBarWidth(item.count, maxPageCount)}%` }}
                              transition={{ delay: i * 0.1, duration: 0.5 }}
                              className="h-full rounded-full bg-gradient-to-r from-primary/50 to-neon-cyan"
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </GlassPanel>

                <GlassPanel className="h-full">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe size={18} className="text-secondary" />
                    Top Referrers
                  </h3>
                  {stats.topReferrers.length === 0 ? (
                    <p className="text-foreground/40 text-sm py-8 text-center">No referrer data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.topReferrers.map((ref, i) => (
                        <motion.div
                          key={ref.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ExternalLink size={14} className="text-foreground/40 shrink-0" />
                            <span className="text-sm text-foreground/70 truncate">{ref.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-primary shrink-0 ml-3">{ref.count}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </GlassPanel>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "devices" && (
          <motion.div
            key="devices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {isStatsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Devices", data: stats.byDevice, icon: Monitor, colors: ["from-primary/50 to-neon-cyan", "from-secondary/50 to-neon-purple", "from-gold/50 to-yellow-300"] },
                  { title: "Browsers", data: stats.byBrowser, icon: AppWindow, colors: ["from-green-400/50 to-emerald-300", "from-blue-400/50 to-cyan-300", "from-orange-400/50 to-yellow-300"] },
                  { title: "Operating Systems", data: stats.byOs, icon: Apple, colors: ["from-pink-400/50 to-rose-300", "from-indigo-400/50 to-blue-300", "from-teal-400/50 to-green-300"] },
                ].map((section) => {
                  const maxCount = Math.max(...section.data.map((d) => d.count), 1);
                  return (
                    <GlassPanel key={section.title} className="h-full">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <section.icon size={18} className="text-primary" />
                        {section.title}
                      </h3>
                      <div className="space-y-3">
                        {section.data.map((item, i) => (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 text-sm text-foreground/80">
                                {section.title === "Devices" && getDeviceIcon(item.name)}
                                {item.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-primary">{formatNumber(item.count)}</span>
                                <span className="text-xs text-foreground/40">
                                  ({stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0}%)
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getBarWidth(item.count, maxCount)}%` }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`h-full rounded-full bg-gradient-to-r ${section.colors[i % section.colors.length]}`}
                              />
                            </div>
                          </motion.div>
                        ))}
                        {section.data.length === 0 && (
                          <p className="text-foreground/40 text-sm text-center py-4">No data yet</p>
                        )}
                      </div>
                    </GlassPanel>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "traffic" && (
          <motion.div
            key="traffic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {isStatsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassPanel className="h-full">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User size={18} className="text-green-400" />
                      User vs Bot Traffic
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-green-400 flex items-center gap-1.5"><User size={14} /> User</span>
                          <span className="font-semibold">{formatNumber(stats.humanVisits)}</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.total > 0 ? (stats.humanVisits / stats.total) * 100 : 0}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full bg-gradient-to-r from-green-400/60 to-emerald-300"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gold flex items-center gap-1.5"><Bot size={14} /> Bot</span>
                          <span className="font-semibold">{formatNumber(stats.bots)}</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.total > 0 ? (stats.bots / stats.total) * 100 : 0}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full bg-gradient-to-r from-gold/60 to-yellow-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-400">{stats.total > 0 ? Math.round((stats.humanVisits / stats.total) * 100) : 0}%</p>
                        <p className="text-xs text-foreground/50">User Traffic</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gold">{stats.total > 0 ? Math.round((stats.bots / stats.total) * 100) : 0}%</p>
                        <p className="text-xs text-foreground/50">Bot Traffic</p>
                      </div>
                    </div>
                  </GlassPanel>

                  <GlassPanel className="h-full">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-neon-cyan" />
                      Traffic Summary
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: "Total Page Views", value: formatNumber(stats.total), color: "text-primary" },
                        { label: "Unique Visitors (All Time)", value: formatNumber(stats.uniqueVisitors), color: "text-secondary" },
                        { label: `Last ${period} Days Views`, value: formatNumber(stats.recent), color: "text-neon-cyan" },
                        { label: `Last ${period} Days Unique`, value: formatNumber(stats.recentUniqueVisitors), color: "text-accent" },
                        { label: "Average Views/Day", value: stats.avgPerDay.toString(), color: "text-green-400" },
                        { label: "Avg Daily Unique Visitors", value: (stats.recentUniqueVisitors / Math.max(parseInt(period), 1)).toFixed(1), color: "text-gold" },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                          <span className="text-sm text-foreground/60">{item.label}</span>
                          <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </GlassPanel>
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === "records" && (
          <motion.div
            key="records"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                  <Input
                    placeholder="Search by page, IP, browser..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  showFilters
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-foreground/60 hover:bg-white/[0.03] border border-white/[0.08]"
                }`}
              >
                <Filter size={16} />
                Filters
                <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
              {deleteIds.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setDeleteIds([])} className="text-foreground/60">
                  {deleteIds.length} selected
                </Button>
              )}
              {deleteIds.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleDeleteSelected} className="text-red-400 hover:text-red-300">
                  <Trash2 size={14} className="mr-1" /> Delete Selected
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setDeleteAll(true)} className="text-red-400/60 hover:text-red-400">
                <Trash2 size={14} className="mr-1" /> Delete All
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <GlassPanel className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-foreground/50 mb-1 block">Page</label>
                        <select
                          value={filterPage}
                          onChange={(e) => { setFilterPage(e.target.value); setPage(1); }}
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground/80 focus:outline-none focus:border-primary/30"
                        >
                          <option value="">All Pages</option>
                          {stats?.byPage.map((p) => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 mb-1 block">Device</label>
                        <select
                          value={filterDevice}
                          onChange={(e) => { setFilterDevice(e.target.value); setPage(1); }}
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground/80 focus:outline-none focus:border-primary/30"
                        >
                          <option value="">All Devices</option>
                          <option value="desktop">Desktop</option>
                          <option value="mobile">Mobile</option>
                          <option value="tablet">Tablet</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 mb-1 block">Date From</label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground/80 focus:outline-none focus:border-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 mb-1 block">Date To</label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground/80 focus:outline-none focus:border-primary/30"
                        />
                      </div>
                    </div>
                    {(filterPage || filterDevice || dateFrom || dateTo) && (
                      <button
                        onClick={() => { setFilterPage(""); setFilterDevice(""); setFilterBrowser(""); setDateFrom(""); setDateTo(""); setPage(1); }}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </GlassPanel>
          </motion.div>
        )}

        {activeTab === "downloads" && (
          <motion.div
            key="downloads"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <GlassPanel>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Download size={18} className="text-primary" />
                    Download Visitor Records
                  </h3>
                  <p className="text-foreground/50 text-sm mt-1">
                    Browse visitors as folders and download their records as CSV
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownload()}
                  disabled={isDownloading}
                  className="flex items-center gap-2"
                >
                  {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Download All
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-2xl font-bold text-primary">{visitorSummary.total}</p>
                  <p className="text-xs text-foreground/50 mt-1">Total Visitors</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-2xl font-bold text-green-400">{visitorSummary.users}</p>
                  <p className="text-xs text-foreground/50 mt-1">Users</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-2xl font-bold text-gold">{visitorSummary.bots}</p>
                  <p className="text-xs text-foreground/50 mt-1">Bots</p>
                </div>
              </div>

              {isVisitorsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              ) : visitors.length === 0 ? (
                <div className="text-center py-16">
                  <Folder size={48} className="mx-auto mb-4 text-foreground/20" />
                  <p className="text-foreground/60">No visitors found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visitors.map((visitor) => (
                    <motion.div
                      key={visitor.visitorId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div
                        className={`rounded-xl border transition-all duration-200 ${
                          expandedVisitor === visitor.visitorId
                            ? "bg-primary/[0.03] border-primary/20"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                        }`}
                      >
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer"
                          onClick={() => setExpandedVisitor(expandedVisitor === visitor.visitorId ? null : visitor.visitorId)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedVisitor === visitor.visitorId ? (
                              <FolderOpen size={20} className={visitor.isBot ? "text-gold" : "text-primary"} />
                            ) : (
                              <Folder size={20} className={visitor.isBot ? "text-gold" : "text-primary"} />
                            )}
                            <div>
                              <p className="font-medium text-sm">{visitor.label}</p>
                              <p className="text-xs text-foreground/40 font-mono">{visitor.visitorId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              visitor.isBot
                                ? "bg-gold/10 text-gold border border-gold/20"
                                : "bg-green-500/10 text-green-400 border border-green-500/20"
                            }`}>
                              {visitor.isBot ? "Bot" : "User"}
                            </span>
                            <span className="text-sm text-foreground/50">
                              {visitor.records.length} visit{visitor.records.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-xs text-foreground/40">
                              {formatDate(visitor.lastVisit)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(visitor.visitorId);
                              }}
                              disabled={isDownloading}
                              className="p-2 rounded-lg hover:bg-primary/10 text-foreground/40 hover:text-primary transition-colors"
                              title="Download records"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedVisitor === visitor.visitorId && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-white/5 pt-3">
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {visitor.records.slice(0, 20).map((record) => (
                                    <div
                                      key={record.id}
                                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors text-sm"
                                    >
                                      <div className="flex items-center gap-3">
                                        <FileText size={14} className="text-foreground/30" />
                                        <span className="text-foreground/70 font-mono">{record.page}</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-xs text-foreground/40">
                                        <span>{record.browser || "—"}</span>
                                        <span>{record.os || "—"}</span>
                                        <span>{formatDate(record.createdAt)} {formatTime(record.createdAt)}</span>
                                      </div>
                                    </div>
                                  ))}
                                  {visitor.records.length > 20 && (
                                    <p className="text-xs text-foreground/40 text-center py-2">
                                      + {visitor.records.length - 20} more records
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <GlassPanel className="text-center py-16">
                <Eye size={48} className="mx-auto mb-4 text-foreground/20" />
                <p className="text-foreground/60">No records found</p>
              </GlassPanel>
            ) : (
              <>
                <GlassPanel className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-3 py-3">
                            <input
                              type="checkbox"
                              checked={deleteIds.length === filteredRecords.length && filteredRecords.length > 0}
                              onChange={selectAllRecords}
                              className="rounded border-white/20 bg-white/5 accent-primary"
                            />
                          </th>
                          <th className="text-left px-3 py-3 text-sm font-semibold text-foreground/60">Page</th>
                          <th className="text-left px-3 py-3 text-sm font-semibold text-foreground/60">IP</th>
                          <th className="text-left px-3 py-3 text-sm font-semibold text-foreground/60">Browser</th>
                          <th className="text-left px-3 py-3 text-sm font-semibold text-foreground/60">OS</th>
                          <th className="text-left px-3 py-3 text-sm font-semibold text-foreground/60">Device</th>
                          <th className="text-left px-3 py-3 text-sm font-semibold text-foreground/60">Duration</th>
                          <th className="text-left px-3 py-3 text-sm font-semibold text-foreground/60">Type</th>
                          <th className="text-left px-3 py-3 text-sm font-semibold text-foreground/60">Date</th>
                          <th className="text-left px-3 py-3 text-sm font-semibold text-foreground/60">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record, index) => (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                              deleteIds.includes(record.id) ? "bg-primary/[0.05]" : ""
                            }`}
                            onClick={() => setSelectedRecord(record)}
                          >
                            <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={deleteIds.includes(record.id)}
                                onChange={() => toggleRecordSelection(record.id)}
                                className="rounded border-white/20 bg-white/5 accent-primary"
                              />
                            </td>
                            <td className="px-3 py-3 text-sm font-mono text-foreground/80 max-w-[150px] truncate">
                              {record.page}
                            </td>
                            <td className="px-3 py-3 text-sm text-foreground/50 font-mono max-w-[120px] truncate">
                              {record.ip || "—"}
                            </td>
                            <td className="px-3 py-3 text-sm text-foreground/70">{record.browser || "—"}</td>
                            <td className="px-3 py-3 text-sm text-foreground/70">{record.os || "—"}</td>
                            <td className="px-3 py-3 text-sm">
                              <span className="flex items-center gap-1.5 text-foreground/70">
                                {getDeviceIcon(record.device)}
                                {record.device || "—"}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-foreground/60">
                              {formatDuration(record.visitDuration)}
                            </td>
                            <td className="px-3 py-3">
                              {record.isBot ? (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-gold/10 text-gold border border-gold/20">Bot</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">User</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm text-foreground/60 whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                {formatDate(record.createdAt)}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-foreground/60 whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} />
                                {formatTime(record.createdAt)}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassPanel>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground/50">
                      Page {page} of {totalPages} ({formatNumber(totalRecords)} records)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-primary/10 hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        if (pageNum > totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                              pageNum === page
                                ? "bg-primary/15 text-primary border border-primary/20"
                                : "text-foreground/50 hover:bg-white/[0.03] border border-transparent"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-primary/10 hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="relative">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Eye size={20} className="text-primary" />
                  Visit Details
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Page", value: selectedRecord.page, icon: <Layers size={14} /> },
                    { label: "IP Address", value: selectedRecord.ip || "Unknown", icon: <Globe size={14} /> },
                    { label: "Browser", value: selectedRecord.browser || "Unknown", icon: <AppWindow size={14} /> },
                    { label: "OS", value: selectedRecord.os || "Unknown", icon: <Apple size={14} /> },
                    { label: "Device", value: selectedRecord.device || "Unknown", icon: <Monitor size={14} /> },
                    { label: "Duration", value: formatDuration(selectedRecord.visitDuration), icon: <Timer size={14} /> },
                    { label: "Language", value: selectedRecord.language || "Unknown", icon: <Globe size={14} /> },
                    { label: "Screen", value: selectedRecord.screenWidth && selectedRecord.screenHeight ? `${selectedRecord.screenWidth}x${selectedRecord.screenHeight}` : "Unknown", icon: <Monitor size={14} /> },
                    { label: "Referrer", value: selectedRecord.referrer || "Direct", icon: <ArrowUpRight size={14} /> },
                    { label: "Type", value: selectedRecord.isBot ? "Bot" : "User", icon: <Bot size={14} /> },
                    { label: "Session ID", value: selectedRecord.sessionId || "Unknown", icon: <Activity size={14} /> },
                    { label: "Date", value: formatDate(selectedRecord.createdAt), icon: <Calendar size={14} /> },
                    { label: "Time", value: formatTime(selectedRecord.createdAt), icon: <Clock size={14} /> },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="flex items-center gap-2 text-sm text-foreground/50">
                        {item.icon} {item.label}
                      </span>
                      <span className="text-sm font-medium text-foreground/80 max-w-[200px] truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteAll}
        title="Delete All Records"
        message="Are you sure you want to delete ALL visit records? This action cannot be undone."
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteAll(false)}
        loading={isDeleting}
      />

      <ConfirmModal
        isOpen={deleteIds.length > 0 && false}
        title="Delete Selected Records"
        message={`Delete ${deleteIds.length} selected record(s)?`}
        onConfirm={handleDeleteSelected}
        onCancel={() => setDeleteIds([])}
        loading={isDeleting}
      />
    </div>
  );
}

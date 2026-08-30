import React, { useState } from "react";
import { Member, Team, Session, Equipment, Transaction, AdministrativeDocument, ActiveView, AppTheme } from "../types";
import { formatCurrency, getCurrencySymbol } from "../utils";
import {
  Users,
  Shield,
  Calendar,
  MapPin,
  Activity,
  CalendarDays,
  TrendingUp,
  Wallet,
  Package,
  AlertTriangle,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  Filter,
  Sparkles,
  FolderArchive
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion } from "motion/react";

interface DashboardProps {
  members: Member[];
  teams: Team[];
  sessions: Session[];
  equipment?: Equipment[];
  transactions?: Transaction[];
  documents?: AdministrativeDocument[];
  theme?: AppTheme;
  currency?: string;
  onNavigate?: (view: ActiveView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  members,
  teams,
  sessions,
  equipment = [],
  transactions = [],
  documents = [],
  theme = "modern",
  currency,
  onNavigate
}) => {
  const [timeframe, setTimeframe] = useState<"season" | "30days" | "all">("all");

  const isClassic = theme === "classic";

  // Filter sessions by timeframe
  const filteredSessions = sessions.filter((s) => {
    if (timeframe === "all") return true;
    if (!s.date) return true;
    const sessionDate = new Date(s.date);
    const now = new Date();
    if (timeframe === "30days") {
      const diffMs = now.getTime() - sessionDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return Math.abs(diffDays) <= 30;
    }
    // "season": current year
    return sessionDate.getFullYear() === now.getFullYear();
  });

  // 1. KPI Calculations
  const totalMembers = members.length;
  const avgAge = totalMembers
    ? Math.round(members.reduce((acc, m) => acc + (m.age || 0), 0) / totalMembers)
    : 0;

  const totalTeams = teams.length;
  const totalCoaches = new Set(teams.map((t) => t.coach).filter(Boolean)).size;

  const totalSessions = filteredSessions.length;

  // Next 7 days sessions
  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeekSessionsCount = sessions.filter((s) => s.date >= todayStr).length;

  // Financial KPIs
  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "Payé")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "Payé")
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const pendingTransactions = transactions.filter((t) => t.status === "En attente");
  const pendingAmount = pendingTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Equipment Alerts
  const itemsNeedingAttention = equipment.filter(
    (e) => e.condition === "À réparer" || e.condition === "Hors service" || e.condition === "Usé"
  );

  // 2. Chart Data: Sessions per Team
  const sessionsPerTeamData = teams.map((team) => {
    const count = filteredSessions.filter((s) => s.teamId === team.id).length;
    return {
      name: team.name,
      sessions: count,
    };
  });

  // 3. Chart Data: Sessions Timeline
  const sessionsByDateMap: { [date: string]: number } = {};
  filteredSessions.forEach((s) => {
    if (s.date) {
      sessionsByDateMap[s.date] = (sessionsByDateMap[s.date] || 0) + 1;
    }
  });

  const sessionsPerDateData = Object.entries(sessionsByDateMap)
    .map(([date, count]) => ({
      date,
      dateFormatted: new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short"
      }),
      séances: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 4. Financial breakdown chart data
  const incomeCategoryMap: { [cat: string]: number } = {};
  transactions
    .filter((t) => t.type === "income" && t.status === "Payé")
    .forEach((t) => {
      incomeCategoryMap[t.category] = (incomeCategoryMap[t.category] || 0) + t.amount;
    });

  const financialBreakdownData = Object.entries(incomeCategoryMap).map(([name, value]) => ({
    name,
    value
  }));

  // 5. Recent/Upcoming Sessions
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date + "T" + b.time).getTime() - new Date(a.date + "T" + a.time).getTime()
  );
  const upcomingSessions = sortedSessions.filter((s) => s.date >= todayStr).reverse();
  const nextSession = upcomingSessions[0] || sortedSessions[0];
  const lastSessions = sortedSessions.slice(0, 5);

  const chartColors = ["#6366f1", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6"];

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.08, duration: 0.35, ease: "easeOut" }
    })
  };

  return (
    <div id="dashboard-view" className="space-y-8">
      {/* 1. Header Banner & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Tableau de Bord Administrateur
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
              isClassic ? "bg-[#0d6efd]/20 text-blue-300 border border-[#0d6efd]/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}>
              Live 2026
            </span>
          </div>
          <p className={`text-sm ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
            Supervision globale, statistiques en direct et accès rapide aux modules.
          </p>
        </div>

        {/* Timeframe selector & Quick Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center p-1 rounded-xl border text-xs font-medium ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}>
            <Filter className="w-3.5 h-3.5 ml-2 mr-1 text-slate-400" />
            {(["all", "season", "30days"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeframe === tf
                    ? isClassic
                      ? "bg-[#0d6efd] text-white font-bold shadow-sm"
                      : "bg-white text-indigo-600 font-bold shadow-sm"
                    : isClassic
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tf === "all" ? "Toutes les données" : tf === "season" ? "Saison en cours" : "30 Derniers jours"}
              </button>
            ))}
          </div>

          <div className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border ${
            isClassic ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}>
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            ASSOCIATION ACTIVE
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Shortcuts */}
      {onNavigate && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Ajouter Membre", view: "members" as ActiveView, icon: Users, color: "text-blue-500", bg: "hover:border-blue-500/40" },
            { label: "Créer Séance", view: "sessions" as ActiveView, icon: Calendar, color: "text-indigo-500", bg: "hover:border-indigo-500/40" },
            { label: "Gérer Matériel", view: "equipment" as ActiveView, icon: Package, color: "text-amber-500", bg: "hover:border-amber-500/40" },
            { label: "Nouvelle Fin. Transaction", view: "finances" as ActiveView, icon: Wallet, color: "text-emerald-500", bg: "hover:border-emerald-500/40" },
            { label: "Documents & Statuts", view: "documents" as ActiveView, icon: FolderArchive, color: "text-violet-500", bg: "hover:border-violet-500/40" },
          ].map((act, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onNavigate(act.view)}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition group cursor-pointer ${
                isClassic
                  ? `bg-slate-900 border-slate-800 ${act.bg} text-slate-200 hover:bg-slate-850`
                  : `bg-white border-slate-200/80 ${act.bg} text-slate-700 hover:bg-slate-50 shadow-sm`
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <act.icon className={`w-4 h-4 ${act.color} shrink-0`} />
                <span className="text-xs font-semibold truncate">{act.label}</span>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* 3. Top Executive KPI Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Members */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          onClick={() => onNavigate?.("members")}
          className={`p-5 rounded-3xl border relative overflow-hidden transition cursor-pointer group ${
            isClassic
              ? "bg-slate-900 border-slate-800 hover:border-blue-500/40"
              : "bg-white border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
              Membres
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-display font-extrabold tracking-tight">
              {totalMembers}
            </p>
            <span className="text-xs font-mono font-semibold text-slate-400">
              Moy. {avgAge} ans
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Inscrits dans le club</span>
            <span className="text-blue-500 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition">
              Voir la liste <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* KPI 2: Teams */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          onClick={() => onNavigate?.("teams")}
          className={`p-5 rounded-3xl border relative overflow-hidden transition cursor-pointer group ${
            isClassic
              ? "bg-slate-900 border-slate-800 hover:border-emerald-500/40"
              : "bg-white border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
              Équipes Actives
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-display font-extrabold tracking-tight">
              {totalTeams}
            </p>
            <span className="text-xs font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {totalCoaches} Entraîneur{totalCoaches > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Groupes d'entraînement</span>
            <span className="text-emerald-500 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition">
              Explorer <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* KPI 3: Sessions */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          onClick={() => onNavigate?.("sessions")}
          className={`p-5 rounded-3xl border relative overflow-hidden transition cursor-pointer group ${
            isClassic
              ? "bg-slate-900 border-slate-800 hover:border-purple-500/40"
              : "bg-white border-slate-200/80 hover:border-purple-300 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
              Séances
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-display font-extrabold tracking-tight">
              {totalSessions}
            </p>
            <span className="text-xs font-mono font-semibold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
              {nextWeekSessionsCount} à venir
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Planning de la saison</span>
            <span className="text-purple-500 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition">
              Programme <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* KPI 4: Financial Balance */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          onClick={() => onNavigate?.("finances")}
          className={`p-5 rounded-3xl border relative overflow-hidden transition cursor-pointer group ${
            isClassic
              ? "bg-slate-900 border-slate-800 hover:border-indigo-500/40"
              : "bg-white border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
              Solde Trésorerie
            </span>
            <div className={`p-2.5 rounded-2xl ${netBalance >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"} group-hover:scale-110 transition`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className={`text-3xl font-display font-extrabold tracking-tight ${netBalance < 0 ? "text-rose-500" : ""}`}>
              {formatCurrency(netBalance, currency)}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              netBalance >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500"
            }`}>
              {netBalance >= 0 ? "+ Positif" : "Déficit"}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              Recettes: <strong className="text-emerald-600">{formatCurrency(totalIncome, currency)}</strong>
            </span>
            <span className="text-indigo-500 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition">
              Comptabilité <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* 4. Attention Cards / Priority Alerts */}
      {(itemsNeedingAttention.length > 0 || pendingTransactions.length > 0 || nextSession) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Next Session Highlight */}
          {nextSession && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              isClassic ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-200" : "bg-indigo-50/80 border-indigo-100 text-indigo-900"
            }`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Prochaine séance</span>
                <p className="text-xs font-bold truncate">{nextSession.title}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <span>{new Date(nextSession.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} à {nextSession.time}</span>
                </p>
              </div>
            </div>
          )}

          {/* Pending Cotisations / Transactions Alert */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
            pendingTransactions.length > 0
              ? isClassic
                ? "bg-amber-950/30 border-amber-500/30 text-amber-200"
                : "bg-amber-50/80 border-amber-200 text-amber-900"
              : isClassic
              ? "bg-slate-900 border-slate-800 text-slate-300"
              : "bg-white border-slate-200/80 text-slate-700"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              pendingTransactions.length > 0 ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
            }`}>
              {pendingTransactions.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Trésorerie & Cotisations</span>
              {pendingTransactions.length > 0 ? (
                <p className="text-xs font-bold">
                  {pendingTransactions.length} paiement{pendingTransactions.length > 1 ? "s" : ""} en attente ({pendingAmount} €)
                </p>
              ) : (
                <p className="text-xs font-bold text-emerald-600">Tous les paiements sont à jour</p>
              )}
              <p className="text-[11px] text-slate-500 mt-0.5">Suivi des règlements reçus</p>
            </div>
          </div>

          {/* Equipment Status Alert */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
            itemsNeedingAttention.length > 0
              ? isClassic
                ? "bg-rose-950/30 border-rose-500/30 text-rose-200"
                : "bg-rose-50/80 border-rose-200 text-rose-900"
              : isClassic
              ? "bg-slate-900 border-slate-800 text-slate-300"
              : "bg-white border-slate-200/80 text-slate-700"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              itemsNeedingAttention.length > 0 ? "bg-rose-500 text-white" : "bg-blue-500 text-white"
            }`}>
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">État du Matériel</span>
              {itemsNeedingAttention.length > 0 ? (
                <p className="text-xs font-bold text-rose-600">
                  {itemsNeedingAttention.length} équipement{itemsNeedingAttention.length > 1 ? "s à réviser" : " à réviser"}
                </p>
              ) : (
                <p className="text-xs font-bold text-blue-600">Matériel en parfait état</p>
              )}
              <p className="text-[11px] text-slate-500 mt-0.5">Inventaire du club</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Sessions per Team */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className={`p-6 rounded-3xl border ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
          } space-y-4`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base md:text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Volume d'entraînement par équipe
            </h3>
            <span className="text-xs text-slate-400 font-mono">Nombre de séances</span>
          </div>

          <div className="h-64 w-full">
            {sessionsPerTeamData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Aucune équipe configurée.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsPerTeamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isClassic ? "#334155" : "#f1f5f9"} vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px"
                    }}
                    cursor={{ fill: isClassic ? "#1e293b" : "#f8fafc" }}
                  />
                  <Bar dataKey="sessions" radius={[6, 6, 0, 0]}>
                    {sessionsPerTeamData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Chart 2: Timeline Area Chart */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className={`p-6 rounded-3xl border ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
          } space-y-4`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base md:text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Activité & Rythme des Séances
            </h3>
            <span className="text-xs text-slate-400 font-mono">Chronologie</span>
          </div>

          <div className="h-64 w-full">
            {sessionsPerDateData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Aucune séance programmée.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sessionsPerDateData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isClassic ? "#334155" : "#f1f5f9"} vertical={false} />
                  <XAxis dataKey="dateFormatted" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="séances"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* 6. Recent Sessions & Financial Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sessions List (2 cols) */}
        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className={`lg:col-span-2 p-6 rounded-3xl border ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
          } space-y-5`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-500" />
              Dernières séances programmées
            </h3>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("sessions")}
                className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Voir tout ({sessions.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lastSessions.length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">Aucune séance enregistrée pour le moment.</p>
            ) : (
              lastSessions.map((s, index) => {
                const team = teams.find((t) => t.id === s.teamId);
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -14, y: 6 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.35), ease: "easeOut" }}
                    className={`py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl transition duration-150 ${
                      isClassic ? "hover:bg-slate-800/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isClassic ? "bg-indigo-950 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-sm truncate">{s.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className={`px-2 py-0.5 rounded font-medium ${
                            isClassic ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                          }`}>
                            {team ? team.name : "Équipe inconnue"}
                          </span>
                          {s.location && (
                            <span className="flex items-center gap-1 font-mono text-slate-400 truncate">
                              <MapPin className="w-3 h-3" />
                              {s.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
                      <span className={`px-2.5 py-1 rounded-lg font-medium ${
                        isClassic ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                      }`}>
                        {new Date(s.date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 font-bold">
                        {s.time}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Financial Distribution Widget (1 col) */}
        <motion.div
          custom={7}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className={`p-6 rounded-3xl border flex flex-col justify-between ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-500" />
                Recettes par Catégorie
              </h3>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate("finances")}
                  className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Finances →
                </button>
              )}
            </div>

            {financialBreakdownData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm text-center">
                Aucune recette enregistrée.
              </div>
            ) : (
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {financialBreakdownData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#f8fafc",
                        fontSize: "12px"
                      }}
                      formatter={(val: number) => [formatCurrency(val, currency), "Montant"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {financialBreakdownData.slice(0, 3).map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                  />
                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-[130px]">{item.name}</span>
                </div>
                <span className="font-bold font-mono">{formatCurrency(item.value, currency)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

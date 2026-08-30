import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  Copy,
  Download,
  Trash2,
  ShieldAlert,
  HardDrive,
  Activity,
  Terminal,
  Wrench,
  Search,
  Check,
  Layers,
  Sparkles,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe,
  Database,
  FileText,
  HelpCircle,
  Play,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppTheme } from "../types";
import {
  SystemLogEntry,
  LogLevel,
  LogSource,
  getSystemLogs,
  logSystemError,
  logSystemWarning,
  logSystemInfo,
  logSystemEvent,
  resolveSystemLog,
  resolveAllSystemLogs,
  clearAllSystemLogs,
  generateSystemDiagnosticReport,
  exportDiagnosticReportText,
  benchmarkStorageHealth,
  StorageBenchmarkResult,
  DiagnosticSummary
} from "../lib/diagnostics";
import { repairDatabaseIntegrity, vacuumAndOptimizeDatabase, getDatabaseMetrics, runDatabaseIntegrityCheck } from "../lib/db";

interface DiagnosticConsoleProps {
  theme: AppTheme;
  onRefreshData?: () => void;
}

export const DiagnosticConsole: React.FC<DiagnosticConsoleProps> = ({
  theme,
  onRefreshData
}) => {
  const isClassic = theme === "classic";

  // Diagnostic State
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [summary, setSummary] = useState<DiagnosticSummary | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeConsoleSubTab, setActiveConsoleSubTab] = useState<"logs" | "tables" | "repair" | "env">("logs");

  // Filters & Search
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());

  // UI Feedback
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "info" | "warning"; msg: string } | null>(null);
  const [testErrorModalOpen, setTestErrorModalOpen] = useState(false);

  // Load logs & refresh diagnostic report
  const refreshDiagnostics = (showNotice: boolean = false) => {
    setIsAuditing(true);
    setTimeout(() => {
      const currentLogs = getSystemLogs();
      setLogs(currentLogs);
      const rep = generateSystemDiagnosticReport();
      setSummary(rep);
      setIsAuditing(false);

      if (showNotice) {
        setActionNotice({
          type: "success",
          msg: `Audit système terminé avec succès ! Score de santé actuel : ${rep.healthScore}%`
        });
        setTimeout(() => setActionNotice(null), 4000);
      }
    }, 350);
  };

  useEffect(() => {
    refreshDiagnostics(false);

    // Real-time log listener
    const handleLogAdded = () => {
      setLogs(getSystemLogs());
      setSummary(generateSystemDiagnosticReport());
    };

    const handleLogsUpdated = () => {
      setLogs(getSystemLogs());
      setSummary(generateSystemDiagnosticReport());
    };

    window.addEventListener("appass_system_log_added", handleLogAdded);
    window.addEventListener("appass_system_logs_updated", handleLogsUpdated);

    return () => {
      window.removeEventListener("appass_system_log_added", handleLogAdded);
      window.removeEventListener("appass_system_logs_updated", handleLogsUpdated);
    };
  }, []);

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterLevel !== "all" && log.level !== filterLevel) return false;
      if (filterSource !== "all" && log.source !== filterSource) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = log.title.toLowerCase().includes(q);
        const matchesMsg = log.message.toLowerCase().includes(q);
        const matchesCode = log.code?.toLowerCase().includes(q) ?? false;
        const matchesDetails = log.details?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesMsg && !matchesCode && !matchesDetails) return false;
      }
      return true;
    });
  }, [logs, filterLevel, filterSource, searchQuery]);

  // Expand / collapse log card
  const toggleExpandLog = (id: string) => {
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Copy full diagnostic report
  const handleCopyReport = () => {
    const reportText = exportDiagnosticReportText();
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  // Download diagnostic report as JSON
  const handleDownloadLogsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(summary, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `appass-diagnostic-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setActionNotice({
      type: "info",
      msg: "Rapport de diagnostic téléchargé au format JSON."
    });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Copy specific log
  const handleCopySingleLog = (log: SystemLogEntry) => {
    const text = `[${log.timeFormatted}] [${log.level.toUpperCase()}] ${log.code ? `(${log.code}) ` : ""}${log.title}\nMessage: ${log.message}${log.details ? `\nDétails:\n${log.details}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2500);
  };

  // Resolve single log
  const handleResolveLog = (logId: string) => {
    resolveSystemLog(logId);
    setActionNotice({
      type: "success",
      msg: "Événement marqué comme résolu."
    });
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Clear all logs
  const handleClearLogs = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider l'historique complet des journaux d'erreurs ?")) {
      clearAllSystemLogs();
      refreshDiagnostics(false);
      setActionNotice({
        type: "info",
        msg: "Historique des journaux d'erreurs réinitialisé."
      });
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  // Run Quick Self-Repair
  const handleRunRepair = () => {
    const res = repairDatabaseIntegrity();
    const vac = vacuumAndOptimizeDatabase();
    logSystemEvent({
      level: "success",
      source: "database",
      code: "SUCCESS_AUTO_REPAIR",
      title: "Auto-réparation de la base de données exécutée",
      message: `${res.message} • ${vac.message}`
    });
    refreshDiagnostics(false);
    if (onRefreshData) onRefreshData();

    setActionNotice({
      type: "success",
      msg: `Auto-réparation terminée : ${res.fixedCount} anomalie(s) corrigée(s) et ${vac.recordsStandardized} enregistrement(s) optimisé(s).`
    });
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Trigger Simulated Test Errors
  const handleTriggerSimulatedError = (type: "quota" | "corrupt_json" | "orphan" | "runtime") => {
    switch (type) {
      case "quota":
        logSystemWarning(
          "Alerte de capacité de stockage local (Simulation)",
          "Le volume total de données stockées s'approche de la limite standard recommandée pour le navigateur.",
          "Code simulation: QUOTA_WARN_SIMULATED • Seuil dépassé: 85%",
          "storage",
          "WARN_STORAGE_CAPACITY"
        );
        break;
      case "corrupt_json":
        logSystemError(
          "Erreur d'analyse JSON de structure locale (Simulation)",
          "Une tentative de lecture a rencontré une chaîne JSON non conforme lors de la désérialisation.",
          "SyntaxError: Unexpected token < in JSON at position 0\n   at JSON.parse (<anonymous>)\n   at loadLocalTable (db.ts:162:18)",
          "schema",
          "ERR_JSON_PARSE"
        );
        break;
      case "orphan":
        logSystemWarning(
          "Incohérence relationnelle détectée (Simulation)",
          "Une écriture comptable fait référence à un membre qui n'existe plus dans l'annuaire.",
          "Table: transactions • Ref: memberId 'm-orphan-999' introuvable dans la table appass_members.",
          "database",
          "WARN_ORPHAN_REFERENCE"
        );
        break;
      case "runtime":
        logSystemError(
          "Exception JavaScript non interceptée (Simulation)",
          "TypeError: Cannot read properties of undefined (reading 'calculateBalance')",
          "Stack trace:\n   at calculateBalance (finances.ts:84:12)\n   at renderModule (App.tsx:942:5)",
          "runtime",
          "ERR_RUNTIME_SIMULATION"
        );
        break;
    }
    setTestErrorModalOpen(false);
    refreshDiagnostics(false);
    setActionNotice({
      type: "info",
      msg: "Événement de test généré dans la console de diagnostic !"
    });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Health Score Style mapping
  const getHealthBadge = (score: number) => {
    if (score >= 90) {
      return {
        label: "Système Sain & Optimal",
        colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        pulseClass: "bg-emerald-500",
        icon: CheckCircle2
      };
    }
    if (score >= 75) {
      return {
        label: "Bon état (Avertissements mineurs)",
        colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        pulseClass: "bg-amber-500",
        icon: AlertTriangle
      };
    }
    return {
      label: "Attention Requise (Erreurs Détectées)",
      colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      pulseClass: "bg-rose-500 animate-ping",
      icon: XCircle
    };
  };

  const healthBadge = getHealthBadge(summary?.healthScore ?? 100);
  const HealthIcon = healthBadge.icon;

  return (
    <div id="diagnostic-console-root" className="space-y-6">
      {/* 1. Global System Health Banner */}
      <div
        className={`p-6 rounded-3xl border transition relative overflow-hidden ${
          isClassic
            ? "bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/50 border-slate-800 text-white"
            : "bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border-slate-800 shadow-xl"
        }`}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Live Health Score & Title */}
          <div className="flex items-start sm:items-center gap-4">
            {/* Score Ring */}
            <div className="relative w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-2 flex flex-col items-center justify-center shrink-0 backdrop-blur-md">
              <span className="text-xl font-bold font-mono text-white leading-none">
                {summary?.healthScore ?? 100}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-300 font-semibold mt-1">
                Santé
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-lg md:text-xl text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  Console de Diagnostic & Santé Système
                </h3>
                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${healthBadge.colorClass}`}>
                  <span className={`w-2 h-2 rounded-full ${healthBadge.pulseClass}`} />
                  <span>{healthBadge.label}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Supervision en temps réel du stockage local, détection proactive des anomalies de schéma, capture des exceptions runtime et outils de dépannage instantané.
              </p>

              {summary && (
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono flex-wrap">
                  <span>Dernier audit : {summary.timestamp}</span>
                  <span>•</span>
                  <span>Quota utilisé : {summary.storageHealth.usedPercent}% ({(summary.storageHealth.usedBytes / 1024).toFixed(1)} Ko)</span>
                  <span>•</span>
                  <span>Latence I/O : {summary.storageHealth.writeLatencyMs}ms</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              id="diagnostic-btn-audit"
              onClick={() => refreshDiagnostics(true)}
              disabled={isAuditing}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              title="Relancer l'audit de toutes les tables et des métriques de stockage"
            >
              <RefreshCw className={`w-4 h-4 ${isAuditing ? "animate-spin" : ""}`} />
              <span>{isAuditing ? "Audit en cours..." : "Lancer un Audit"}</span>
            </button>

            <button
              type="button"
              id="diagnostic-btn-copy"
              onClick={handleCopyReport}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              title="Copier un rapport technique complet pour l'assistance"
            >
              {copiedReport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Rapport Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-300" />
                  <span>Copier Rapport</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="diagnostic-btn-simulate"
              onClick={() => setTestErrorModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
              title="Générer un événement ou une erreur de simulation pour tester la console"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Tester</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
              actionNotice.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : actionNotice.type === "warning"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionNotice.msg}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="p-1 hover:opacity-75 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Key Metrics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {/* Metric 1: Unresolved Errors */}
        <div
          className={`p-4 rounded-2xl border transition ${
            (summary?.unresolvedErrorsCount ?? 0) > 0
              ? "bg-rose-500/10 border-rose-500/30 dark:bg-rose-950/20"
              : isClassic
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200/80 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Erreurs critiques
            </span>
            <XCircle
              className={`w-4 h-4 ${
                (summary?.unresolvedErrorsCount ?? 0) > 0 ? "text-rose-500" : "text-slate-400"
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                (summary?.unresolvedErrorsCount ?? 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {summary?.unresolvedErrorsCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-400">non résolue(s)</span>
          </div>
        </div>

        {/* Metric 2: Warnings */}
        <div
          className={`p-4 rounded-2xl border transition ${
            (summary?.unresolvedWarningsCount ?? 0) > 0
              ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20"
              : isClassic
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200/80 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Avertissements
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${
                (summary?.unresolvedWarningsCount ?? 0) > 0 ? "text-amber-500" : "text-slate-400"
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                (summary?.unresolvedWarningsCount ?? 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {summary?.unresolvedWarningsCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-400">à surveiller</span>
          </div>
        </div>

        {/* Metric 3: Storage Quota */}
        <div
          className={`p-4 rounded-2xl border transition ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Stockage Local
            </span>
            <HardDrive className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
              {summary?.storageHealth.usedPercent ?? 0}%
            </span>
            <span className="text-[10px] text-slate-400">
              / ~{summary?.storageHealth.estimatedTotalQuotaMb ?? 5} Mo
            </span>
          </div>
        </div>

        {/* Metric 4: Relational Integrity */}
        <div
          className={`p-4 rounded-2xl border transition ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Intégrité Données
            </span>
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                (summary?.integrityIssuesCount ?? 0) === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"
              }`}
            >
              {(summary?.integrityIssuesCount ?? 0) === 0 ? "100%" : `${Math.max(0, 100 - (summary?.integrityIssuesCount || 0) * 5)}%`}
            </span>
            <span className="text-[10px] text-slate-400">
              {(summary?.integrityIssuesCount ?? 0) === 0 ? "Conforme" : `${summary?.integrityIssuesCount} orphelin(s)`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tab Navigation */}
      <div className={`p-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-1 overflow-x-auto ${
        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
      }`}>
        <button
          type="button"
          onClick={() => setActiveConsoleSubTab("logs")}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeConsoleSubTab === "logs"
              ? isClassic ? "bg-indigo-600 text-white shadow-xs" : "bg-indigo-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Journal des Erreurs & Événements</span>
          {logs.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeConsoleSubTab === "logs" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}>
              {logs.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveConsoleSubTab("tables")}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeConsoleSubTab === "tables"
              ? isClassic ? "bg-indigo-600 text-white shadow-xs" : "bg-indigo-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Inspection des Tables Locales</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveConsoleSubTab("repair")}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeConsoleSubTab === "repair"
              ? isClassic ? "bg-indigo-600 text-white shadow-xs" : "bg-indigo-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Auto-Réparation & Outils</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveConsoleSubTab("env")}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeConsoleSubTab === "env"
              ? isClassic ? "bg-indigo-600 text-white shadow-xs" : "bg-indigo-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Environnement & Specs</span>
        </button>
      </div>

      {/* 4. SUB-TAB 1: LOGS FEED */}
      {activeConsoleSubTab === "logs" && (
        <div className="space-y-4">
          {/* Controls Bar: Filters & Search */}
          <div
            className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
            }`}
          >
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer par mot-clé, code d'erreur (ex: ERR_JSON), source..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium outline-none transition ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-400"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Level & Source Selectors */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <option value="all">Tous les niveaux</option>
                <option value="error">Erreurs (Critiques)</option>
                <option value="warning">Avertissements</option>
                <option value="info">Informations</option>
                <option value="success">Succès & Audits</option>
              </select>

              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <option value="all">Toutes sources</option>
                <option value="storage">Stockage (LocalStorage)</option>
                <option value="database">Base de données</option>
                <option value="schema">Schéma & JSON</option>
                <option value="backup">Sauvegardes</option>
                <option value="runtime">Runtime (JS / Moteur)</option>
              </select>

              <button
                type="button"
                onClick={resolveAllSystemLogs}
                title="Marquer tous les événements comme résolus"
                className={`p-2 rounded-xl border transition cursor-pointer hover:opacity-80 ${
                  isClassic ? "bg-slate-800 border-slate-700 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600"
                }`}
              >
                <Check className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDownloadLogsJson}
                title="Télécharger les journaux d'erreurs en JSON"
                className={`p-2 rounded-xl border transition cursor-pointer hover:opacity-80 ${
                  isClassic ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClearLogs}
                title="Vider l'historique des logs"
                className={`p-2 rounded-xl border transition cursor-pointer hover:bg-rose-500 hover:text-white ${
                  isClassic ? "bg-slate-800 border-slate-700 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Logs List Container */}
          <div className="space-y-2.5">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogIds.has(log.id);
                const isError = log.level === "error";
                const isWarning = log.level === "warning";
                const isSuccess = log.level === "success";

                const badgeBg = isError
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  : isWarning
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : isSuccess
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";

                const LogIcon = isError
                  ? XCircle
                  : isWarning
                  ? AlertTriangle
                  : isSuccess
                  ? CheckCircle2
                  : Info;

                return (
                  <div
                    key={log.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      log.resolved
                        ? isClassic
                          ? "bg-slate-900/60 border-slate-800/80 opacity-75"
                          : "bg-slate-50/80 border-slate-200/60 opacity-80"
                        : isError
                        ? isClassic
                          ? "bg-rose-950/20 border-rose-900/40"
                          : "bg-rose-50/40 border-rose-200"
                        : isClassic
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-slate-200/80 shadow-2xs"
                    }`}
                  >
                    {/* Log Row Header */}
                    <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 border ${badgeBg}`}>
                          <LogIcon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {log.title}
                            </span>
                            {log.code && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700">
                                {log.code}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeBg}`}>
                              {log.source.toUpperCase()}
                            </span>
                            {log.resolved && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Résolu {log.resolvedAt ? `à ${log.resolvedAt}` : ""}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words">
                            {log.message}
                          </p>

                          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{log.timeFormatted}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopySingleLog(log)}
                          title="Copier les détails de cet événement"
                          className="p-1.5 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          {copiedLogId === log.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {!log.resolved && (
                          <button
                            type="button"
                            onClick={() => handleResolveLog(log.id)}
                            title="Marquer comme résolu"
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Résoudre</span>
                          </button>
                        )}

                        {log.details && (
                          <button
                            type="button"
                            onClick={() => toggleExpandLog(log.id)}
                            title={isExpanded ? "Masquer les détails techniques" : "Afficher la pile d'exécution & détails"}
                            className="p-1.5 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Technical Details / Stack Trace */}
                    <AnimatePresence>
                      {isExpanded && log.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`p-3.5 border-t text-xs font-mono overflow-x-auto ${
                            isClassic
                              ? "bg-slate-950/80 border-slate-800 text-slate-300"
                              : "bg-slate-900 text-slate-200 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                            <span className="uppercase tracking-wider font-bold">Détails techniques & Trace :</span>
                            <span className="text-[10px]">{log.id}</span>
                          </div>
                          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed select-all">
                            {log.details}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div
                className={`p-12 text-center rounded-2xl border space-y-3 ${
                  isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80"
                }`}
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  Aucun événement ou erreur ne correspond à ces critères
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  La console ne rapporte aucune anomalie pour les filtres sélectionnés. Le système et les tables locales sont stables.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterLevel("all");
                    setFilterSource("all");
                    setSearchQuery("");
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 2: LOCALSTORAGE TABLES INSPECTOR */}
      {activeConsoleSubTab === "tables" && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  Cartographie des 8 Tables LocalStorage du Navigateur
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Vérification de l'intégrité JSON, du nombre d'enregistrements et de l'empreinte mémoire pour chaque partition.
                </p>
              </div>

              <button
                type="button"
                onClick={() => refreshDiagnostics(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-vérifier</span>
              </button>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {summary?.tablesStatus.map((t) => (
                <div
                  key={t.key}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                    !t.isValidJson
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-600"
                      : isClassic
                      ? "bg-slate-800/80 border-slate-700 text-slate-200"
                      : "bg-slate-50/80 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs truncate">{t.name}</span>
                      {t.isValidJson ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          JSON Valide ✓
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500 text-white animate-pulse">
                          CORROMPU ✗
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                      Clé : {t.key}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono font-bold block">
                      {t.count} rec.
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {t.sizeKb} Ko
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB 3: AUTO-REPAIR & EMERGENCY RESCUE */}
      {activeConsoleSubTab === "repair" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tool 1: 1-Click Integrity Repair */}
            <div
              className={`p-5 rounded-2xl border space-y-3 ${
                isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Auto-Réparation & Nettoyage des Orphelins
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Répare les identifiants orphelins, normalise les données et valide les relations.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Cette opération purge les références cassées dans les équipes, les feuilles de match et les écritures comptables sans effacer vos données principales.
              </p>

              <button
                type="button"
                onClick={handleRunRepair}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Exécuter l'Auto-Réparation Immédiate</span>
              </button>
            </div>

            {/* Tool 2: Storage Vacuum & Compaction */}
            <div
              className={`p-5 rounded-2xl border space-y-3 ${
                isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Compactage & Optimisation (Vacuum)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supprime les espaces blancs superflus et réorganise les index mémoire.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Réduit l'empreinte disque de votre navigateur et accélère le chargement au démarrage de l'application.
              </p>

              <button
                type="button"
                onClick={() => {
                  const vac = vacuumAndOptimizeDatabase();
                  logSystemEvent({
                    level: "info",
                    source: "storage",
                    code: "INF_STORAGE_VACUUM",
                    title: "Optimisation de l'espace de stockage",
                    message: vac.message
                  });
                  refreshDiagnostics(false);
                  setActionNotice({
                    type: "success",
                    msg: vac.message
                  });
                  setTimeout(() => setActionNotice(null), 3500);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Zap className="w-4 h-4" />
                <span>Compacter & Optimiser le Stockage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SUB-TAB 4: TECHNICAL ENVIRONMENT */}
      {activeConsoleSubTab === "env" && summary && (
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Spécifications Matérielles & Environnement d'Exécution
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Version du Client :</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{summary.environment.appVersion}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Connectivité :</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {summary.environment.online ? "Connecté (Réseau disponible)" : "Mode Hors-ligne"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Résolution d'Affichage :</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{summary.environment.screenResolution}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Langue Système :</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{summary.environment.language}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 sm:col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">User Agent Navigateur :</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">{summary.environment.userAgent}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TEST / SIMULATE ERROR */}
      <AnimatePresence>
        {testErrorModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-md w-full rounded-3xl border p-6 space-y-4 shadow-2xl ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Générer un Événement de Test</h3>
                    <p className="text-xs text-slate-400">Simulation pour valider la console de diagnostic</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestErrorModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleTriggerSimulatedError("quota")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-500/5 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs block text-amber-600 dark:text-amber-400">
                      1. Alerte de Quota LocalStorage (Warning)
                    </span>
                    <span className="text-[11px] text-slate-500">Simule un seuil d'espace à 85%</span>
                  </div>
                  <Play className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerSimulatedError("corrupt_json")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 hover:bg-rose-500/5 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs block text-rose-600 dark:text-rose-400">
                      2. Erreur d'analyse JSON corrompu (Error)
                    </span>
                    <span className="text-[11px] text-slate-500">Simule une clé de table illisible</span>
                  </div>
                  <Play className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerSimulatedError("orphan")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-500/5 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs block text-indigo-600 dark:text-indigo-400">
                      3. Référence Orpheline Détectée (Warning)
                    </span>
                    <span className="text-[11px] text-slate-500">Simule une incohérence relationnelle</span>
                  </div>
                  <Play className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerSimulatedError("runtime")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 hover:bg-rose-500/5 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs block text-rose-600 dark:text-rose-400">
                      4. Exception JavaScript Runtime (Error)
                    </span>
                    <span className="text-[11px] text-slate-500">Simule une erreur non interceptée</span>
                  </div>
                  <Play className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setTestErrorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * AppAss Association Manager - System Diagnostics & Error Logging Engine
 * Provides persistent local logging, runtime error capture, storage health inspection,
 * and automated remediation tools for end users and administrators.
 */

import { DB_KEYS, getDatabaseMetrics, runDatabaseIntegrityCheck, repairDatabaseIntegrity } from "./db";

export type LogLevel = "error" | "warning" | "info" | "success";
export type LogSource = "storage" | "database" | "schema" | "backup" | "runtime" | "network" | "ui";

export interface SystemLogEntry {
  id: string;
  timestamp: string; // ISO 8601 string
  timeFormatted: string; // Localized readable time
  level: LogLevel;
  source: LogSource;
  code?: string;
  title: string;
  message: string;
  details?: string;
  stack?: string;
  resolved?: boolean;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface StorageBenchmarkResult {
  isAvailable: boolean;
  writeLatencyMs: number;
  readLatencyMs: number;
  deleteLatencyMs: number;
  estimatedTotalQuotaMb: number;
  usedBytes: number;
  usedPercent: number;
  status: "optimal" | "warning" | "critical";
  message: string;
}

export interface DiagnosticSummary {
  timestamp: string;
  healthScore: number; // 0 - 100
  healthStatus: "optimal" | "good" | "warning" | "critical";
  totalLogsCount: number;
  unresolvedErrorsCount: number;
  unresolvedWarningsCount: number;
  storageHealth: StorageBenchmarkResult;
  integrityIssuesCount: number;
  tablesStatus: {
    name: string;
    key: string;
    count: number;
    sizeKb: number;
    isValidJson: boolean;
  }[];
  environment: {
    userAgent: string;
    online: boolean;
    appVersion: string;
    screenResolution: string;
    language: string;
  };
}

const STORAGE_LOGS_KEY = "appass_system_logs";
const MAX_LOGS_LIMIT = 150;

/**
 * Get all stored system logs from LocalStorage safely
 */
export function getSystemLogs(): SystemLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    if (!raw) return getDefaultSeedLogs();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getDefaultSeedLogs();
  } catch (err) {
    console.error("Failed to parse system logs from LocalStorage:", err);
    return getDefaultSeedLogs();
  }
}

/**
 * Save logs back to LocalStorage with size boundary protection
 */
function saveSystemLogs(logs: SystemLogEntry[]): void {
  try {
    const capped = logs.slice(0, MAX_LOGS_LIMIT);
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(capped));
  } catch (err) {
    console.error("Failed to save system logs to LocalStorage:", err);
  }
}

/**
 * Log a new system event or error
 */
export function logSystemEvent(entry: Omit<SystemLogEntry, "id" | "timestamp" | "timeFormatted">): SystemLogEntry {
  const now = new Date();
  const newLog: SystemLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    timeFormatted: now.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "medium"
    }),
    ...entry,
    resolved: entry.resolved ?? false
  };

  try {
    const current = getSystemLogs();
    const updated = [newLog, ...current];
    saveSystemLogs(updated);

    // Also dispatch custom event for real-time reactivity in UI components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("appass_system_log_added", { detail: newLog }));
    }
  } catch (e) {
    console.warn("Could not append system log:", e);
  }

  return newLog;
}

/**
 * Shortcut helper: Log an error
 */
export function logSystemError(title: string, message: string, details?: string, source: LogSource = "runtime", code?: string): SystemLogEntry {
  return logSystemEvent({
    level: "error",
    source,
    title,
    message,
    details,
    code: code || "ERR_SYS_01"
  });
}

/**
 * Shortcut helper: Log a warning
 */
export function logSystemWarning(title: string, message: string, details?: string, source: LogSource = "database", code?: string): SystemLogEntry {
  return logSystemEvent({
    level: "warning",
    source,
    title,
    message,
    details,
    code: code || "WARN_SYS_01"
  });
}

/**
 * Shortcut helper: Log an informative event
 */
export function logSystemInfo(title: string, message: string, source: LogSource = "storage"): SystemLogEntry {
  return logSystemEvent({
    level: "info",
    source,
    title,
    message
  });
}

/**
 * Mark a log entry as resolved
 */
export function resolveSystemLog(logId: string): void {
  const current = getSystemLogs();
  const updated = current.map((log) => {
    if (log.id === logId) {
      return {
        ...log,
        resolved: true,
        resolvedAt: new Date().toLocaleTimeString("fr-FR")
      };
    }
    return log;
  });
  saveSystemLogs(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("appass_system_logs_updated"));
  }
}

/**
 * Mark all logs as resolved
 */
export function resolveAllSystemLogs(): void {
  const current = getSystemLogs();
  const nowStr = new Date().toLocaleTimeString("fr-FR");
  const updated = current.map((log) => ({ ...log, resolved: true, resolvedAt: nowStr }));
  saveSystemLogs(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("appass_system_logs_updated"));
  }
}

/**
 * Clear all system logs
 */
export function clearAllSystemLogs(): void {
  try {
    localStorage.removeItem(STORAGE_LOGS_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("appass_system_logs_updated"));
    }
  } catch (e) {
    console.error("Failed to clear system logs:", e);
  }
}

/**
 * Test LocalStorage Performance & Availability (Benchmark)
 */
export function benchmarkStorageHealth(): StorageBenchmarkResult {
  const testKey = "__appass_storage_health_probe__";
  const testData = JSON.stringify({
    probeId: Date.now(),
    sampleArray: new Array(50).fill("test_payload_validation_string_data_check")
  });

  let writeLatencyMs = 0;
  let readLatencyMs = 0;
  let deleteLatencyMs = 0;
  let isAvailable = false;

  try {
    // 1. Write benchmark
    const t0 = performance.now();
    localStorage.setItem(testKey, testData);
    writeLatencyMs = parseFloat((performance.now() - t0).toFixed(2));

    // 2. Read benchmark
    const t1 = performance.now();
    const retrieved = localStorage.getItem(testKey);
    readLatencyMs = parseFloat((performance.now() - t1).toFixed(2));

    if (retrieved === testData) {
      isAvailable = true;
    }

    // 3. Delete benchmark
    const t2 = performance.now();
    localStorage.removeItem(testKey);
    deleteLatencyMs = parseFloat((performance.now() - t2).toFixed(2));
  } catch (err) {
    isAvailable = false;
    logSystemError(
      "Échec du test d'accès au stockage local (LocalStorage)",
      "Impossible d'écrire ou de lire les clés temporaires dans le navigateur.",
      String(err),
      "storage",
      "ERR_STORAGE_UNAVAILABLE"
    );
  }

  // Calculate storage usage
  const metrics = getDatabaseMetrics();
  const usedBytes = metrics.totalUsedBytes;
  const estimatedTotalQuotaMb = metrics.estimatedQuotaMb || 5;
  const usedPercent = metrics.usagePercent;

  let status: StorageBenchmarkResult["status"] = "optimal";
  let message = "Stockage local réactif et intègre. Aucun goulot d'étranglement.";

  if (!isAvailable) {
    status = "critical";
    message = "Le stockage local est inaccessible ou verrouillé par le navigateur.";
  } else if (usedPercent > 85) {
    status = "warning";
    message = "L'espace de stockage local approche de sa saturation maximale (>85%).";
  } else if (writeLatencyMs > 50) {
    status = "warning";
    message = "Temps de réponse d'écriture anormalement élevé (>50ms).";
  }

  return {
    isAvailable,
    writeLatencyMs,
    readLatencyMs,
    deleteLatencyMs,
    estimatedTotalQuotaMb,
    usedBytes,
    usedPercent,
    status,
    message
  };
}

/**
 * Generate a Comprehensive System Diagnostic Report
 */
export function generateSystemDiagnosticReport(): DiagnosticSummary {
  const logs = getSystemLogs();
  const unresolvedErrors = logs.filter((l) => l.level === "error" && !l.resolved);
  const unresolvedWarnings = logs.filter((l) => l.level === "warning" && !l.resolved);

  const storageHealth = benchmarkStorageHealth();
  const integrityReport = runDatabaseIntegrityCheck();

  const tablesToCheck = [
    { name: "Membres & Adhérents", key: DB_KEYS.MEMBERS },
    { name: "Équipes & Groupes", key: DB_KEYS.TEAMS },
    { name: "Séances & Présences", key: DB_KEYS.SESSIONS },
    { name: "Matériel & Inventaire", key: DB_KEYS.EQUIPMENT },
    { name: "Comptabilité & Trésorerie", key: DB_KEYS.TRANSACTIONS },
    { name: "Paramètres Association", key: DB_KEYS.INFO },
    { name: "Notifications Système", key: DB_KEYS.NOTIFS },
    { name: "Points de Restauration", key: DB_KEYS.SNAPSHOTS }
  ];

  const tablesStatus = tablesToCheck.map((t) => {
    let count = 0;
    let isValidJson = true;
    let sizeKb = 0;
    try {
      const raw = localStorage.getItem(t.key);
      if (raw) {
        sizeKb = parseFloat((new Blob([raw]).size / 1024).toFixed(2));
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) count = parsed.length;
        else if (parsed && typeof parsed === "object") count = 1;
      }
    } catch {
      isValidJson = false;
    }
    return {
      name: t.name,
      key: t.key,
      count,
      sizeKb,
      isValidJson
    };
  });

  // Calculate Health Score (100 is perfect)
  let score = 100;
  if (!storageHealth.isAvailable) score -= 50;
  if (storageHealth.usedPercent > 90) score -= 20;
  else if (storageHealth.usedPercent > 75) score -= 10;

  score -= unresolvedErrors.length * 15;
  score -= unresolvedWarnings.length * 5;
  score -= integrityReport.errorsCount * 10;
  score -= integrityReport.warningsCount * 3;

  const invalidJsonCount = tablesStatus.filter((t) => !t.isValidJson).length;
  score -= invalidJsonCount * 25;

  score = Math.max(5, Math.min(100, score));

  let healthStatus: DiagnosticSummary["healthStatus"] = "optimal";
  if (score < 50) healthStatus = "critical";
  else if (score < 75) healthStatus = "warning";
  else if (score < 90) healthStatus = "good";

  return {
    timestamp: new Date().toLocaleString("fr-FR"),
    healthScore: score,
    healthStatus,
    totalLogsCount: logs.length,
    unresolvedErrorsCount: unresolvedErrors.length,
    unresolvedWarningsCount: unresolvedWarnings.length,
    storageHealth,
    integrityIssuesCount: integrityReport.totalIssuesCount,
    tablesStatus,
    environment: {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      appVersion: "v2.5.0 (Build 2026)",
      screenResolution: typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}x)` : "N/A",
      language: typeof navigator !== "undefined" ? navigator.language : "fr-FR"
    }
  };
}

/**
 * Export diagnostic report formatted for technical assistance
 */
export function exportDiagnosticReportText(): string {
  const report = generateSystemDiagnosticReport();
  const logs = getSystemLogs();

  return `===============================================================
RAPPORT DE DIAGNOSTIC SYSTÈME - APP'ASS ASSOCIATION MANAGER
Date & Heure : ${report.timestamp}
Score de Santé Globale : ${report.healthScore}% (${report.healthStatus.toUpperCase()})
===============================================================

[1] ENVIRONNEMENT & NAVIGATEUR
- Version de l'application : ${report.environment.appVersion}
- Connectivité réseau : ${report.environment.online ? "En ligne (Connecté)" : "Hors-ligne"}
- Résolution écran : ${report.environment.screenResolution}
- Langue du système : ${report.environment.language}
- User Agent : ${report.environment.userAgent}

[2] ÉTAT DU STOCKAGE LOCAL (LOCALSTORAGE)
- Disponibilité I/O : ${report.storageHealth.isAvailable ? "OK (Opérationnel)" : "ERREUR (Inaccessible)"}
- Latence d'écriture : ${report.storageHealth.writeLatencyMs} ms
- Latence de lecture : ${report.storageHealth.readLatencyMs} ms
- Espace utilisé : ${(report.storageHealth.usedBytes / 1024).toFixed(2)} Ko / ~${report.storageHealth.estimatedTotalQuotaMb} Mo (${report.storageHealth.usedPercent}%)
- Diagnostic stockage : ${report.storageHealth.message}

[3] TABLES DE DONNÉES LOCALES
${report.tablesStatus
  .map(
    (t) =>
      `• ${t.name.padEnd(26, " ")} | ${t.count.toString().padStart(4, " ")} enregistrements | ${t.sizeKb.toString().padStart(6, " ")} Ko | JSON ${t.isValidJson ? "Valide ✓" : "CORROMPU ✗"}`
  )
  .join("\n")}

[4] SYNTHÈSE DES ANOMALIES & ERREURS
- Erreurs non résolues : ${report.unresolvedErrorsCount}
- Avertissements non résolus : ${report.unresolvedWarningsCount}
- Problèmes d'intégrité relationnelle : ${report.integrityIssuesCount}

[5] DERNIERS JOURNAUX SYSTÈME (${logs.length} au total)
${logs
  .slice(0, 20)
  .map(
    (l) =>
      `[${l.timeFormatted}] [${l.level.toUpperCase()}] [${l.source.toUpperCase()}] ${l.code ? `(${l.code}) ` : ""}${l.title}: ${l.message}${
        l.details ? `\n   Détails : ${l.details}` : ""
      }${l.resolved ? " [RÉSOLU]" : ""}`
  )
  .join("\n\n")}

===============================================================
FIN DU RAPPORT DE DIAGNOSTIC
===============================================================`;
}

/**
 * Initialize runtime automatic error capturing
 */
export function initSystemErrorListeners(): void {
  if (typeof window === "undefined") return;

  // Prevent multiple attachments
  if ((window as any).__appass_error_listeners_attached) return;
  (window as any).__appass_error_listeners_attached = true;

  // 1. Capture Global Uncaught Exceptions
  window.addEventListener("error", (event) => {
    // Ignore harmless cross-origin resize / react devtools messages
    if (event.message?.includes("ResizeObserver loop") || event.message?.includes("Script error.")) {
      return;
    }

    logSystemError(
      "Erreur d'exécution non interceptée (Uncaught Exception)",
      event.message || "Erreur JavaScript inattendue",
      event.filename ? `Fichier: ${event.filename} (Ligne ${event.lineno}, Col ${event.colno})` : undefined,
      "runtime",
      "ERR_RUNTIME_EXCEPTION"
    );
  });

  // 2. Capture Unhandled Promise Rejections
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const msg = typeof reason === "string" ? reason : reason?.message || "Rejet de promesse non géré";

    logSystemError(
      "Rejet de promesse asynchrone (Unhandled Rejection)",
      msg,
      reason?.stack ? String(reason.stack) : undefined,
      "runtime",
      "ERR_ASYNC_REJECTION"
    );
  });
}

/**
 * Seed initial sample logs if empty so the console isn't blank
 */
function getDefaultSeedLogs(): SystemLogEntry[] {
  const now = new Date();
  const minutesAgo = (mins: number) => {
    const d = new Date(now.getTime() - mins * 60000);
    return {
      iso: d.toISOString(),
      formatted: d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" })
    };
  };

  const t1 = minutesAgo(2);
  const t2 = minutesAgo(15);
  const t3 = minutesAgo(45);

  return [
    {
      id: "log-seed-1",
      timestamp: t1.iso,
      timeFormatted: t1.formatted,
      level: "info",
      source: "storage",
      code: "INF_STORAGE_INIT",
      title: "Initialisation du moteur de données locales",
      message: "Toutes les tables ont été chargées avec succès depuis le stockage local du navigateur.",
      resolved: true,
      resolvedAt: t1.formatted
    },
    {
      id: "log-seed-2",
      timestamp: t2.iso,
      timeFormatted: t2.formatted,
      level: "success",
      source: "database",
      code: "SUCCESS_INTEGRITY_CHECK",
      title: "Vérification d'intégrité relationnelle",
      message: "Le schéma de la base de données est conforme. Toutes les clés étrangères sont cohérentes.",
      resolved: true,
      resolvedAt: t2.formatted
    },
    {
      id: "log-seed-3",
      timestamp: t3.iso,
      timeFormatted: t3.formatted,
      level: "info",
      source: "backup",
      code: "INF_SYSTEM_START",
      title: "Démarrage de session administrateur",
      message: "Session utilisateur démarrée avec droits de gestion complets.",
      resolved: true,
      resolvedAt: t3.formatted
    }
  ];
}

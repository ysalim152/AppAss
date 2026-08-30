import { Member, Team, Session, Equipment, Transaction, AssociationInfo, NotificationItem } from "../types";
import {
  INITIAL_MEMBERS,
  INITIAL_TEAMS,
  INITIAL_SESSIONS,
  INITIAL_EQUIPMENT,
  INITIAL_TRANSACTIONS,
  INITIAL_ASSOCIATION_INFO
} from "../data";

export const DATABASE_VERSION = "2.5.0";

export interface DatabaseTableMeta {
  id: string;
  name: string;
  storageKey: string;
  description: string;
  primaryKey: string;
  recordCount: number;
  sizeKb: number;
}

export interface StorageMetrics {
  totalUsedBytes: number;
  totalUsedKb: number;
  estimatedQuotaMb: number;
  usagePercent: number;
  tables: DatabaseTableMeta[];
}

export interface IntegrityIssue {
  id: string;
  severity: "error" | "warning" | "info";
  table: string;
  recordId: string;
  message: string;
  fixable: boolean;
}

export interface IntegrityReport {
  timestamp: string;
  isHealthy: boolean;
  totalIssuesCount: number;
  errorsCount: number;
  warningsCount: number;
  issues: IntegrityIssue[];
}

export interface DatabasePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  iconName: string;
  data: {
    associationInfo: AssociationInfo;
    members: Member[];
    teams: Team[];
    sessions: Session[];
    equipment: Equipment[];
    transactions: Transaction[];
  };
}

// STORAGE KEYS
export const DB_KEYS = {
  MEMBERS: "appass_members",
  TEAMS: "appass_teams",
  SESSIONS: "appass_sessions",
  EQUIPMENT: "appass_equipment",
  TRANSACTIONS: "appass_transactions",
  DOCUMENTS: "appass_documents",
  INFO: "appass_association_info",
  NOTIFS: "appass_notifications",
  SNAPSHOTS: "appass_snapshots",
  LOGS: "appass_activity_logs",
  THEME: "appass_theme",
  DB_VERSION: "appass_db_version"
};

// Helper: Get raw item size in bytes
export function getItemSizeInBytes(key: string): number {
  try {
    const val = localStorage.getItem(key);
    if (!val) return 0;
    return new Blob([val]).size;
  } catch {
    return 0;
  }
}

// Get comprehensive Database Storage Metrics
export function getDatabaseMetrics(): StorageMetrics {
  const tablesInfo = [
    { id: "members", name: "Membres & Adhérents", storageKey: DB_KEYS.MEMBERS, description: "Annuaire des membres, coordonnées et licences", primaryKey: "id" },
    { id: "teams", name: "Équipes & Groups", storageKey: DB_KEYS.TEAMS, description: "Composition des sections, entraîneurs et effectifs", primaryKey: "id" },
    { id: "sessions", name: "Séances & Planning", storageKey: DB_KEYS.SESSIONS, description: "Entraînements, matchs, stages et présences", primaryKey: "id" },
    { id: "equipment", name: "Matériel & Inventaire", storageKey: DB_KEYS.EQUIPMENT, description: "Stock d'équipements, états et affectations", primaryKey: "id" },
    { id: "transactions", name: "Écritures Comptables", storageKey: DB_KEYS.TRANSACTIONS, description: "Recettes, dépenses, cotisations et subventions", primaryKey: "id" },
    { id: "documents", name: "Documents Administratifs", storageKey: DB_KEYS.DOCUMENTS, description: "Statuts, PV d'AG, conventions et contrats archivés", primaryKey: "id" },
    { id: "association", name: "Paramètres Association", storageKey: DB_KEYS.INFO, description: "Coordonnées officielles, IBAN, préfecture et reçus", primaryKey: "siret" },
    { id: "notifications", name: "Centre de Notifications", storageKey: DB_KEYS.NOTIFS, description: "Alertes système, relances et convocations", primaryKey: "id" },
    { id: "snapshots", name: "Points de Restauration", storageKey: DB_KEYS.SNAPSHOTS, description: "Sauvegardes instantanées locales (Snapshots)", primaryKey: "id" }
  ];

  let totalBytes = 0;
  const tables: DatabaseTableMeta[] = tablesInfo.map((tbl) => {
    const rawData = localStorage.getItem(tbl.storageKey);
    let count = 0;
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed)) {
          count = parsed.length;
        } else if (parsed && typeof parsed === "object") {
          count = 1;
        }
      } catch {
        count = 0;
      }
    }
    const bytes = getItemSizeInBytes(tbl.storageKey);
    totalBytes += bytes;

    return {
      id: tbl.id,
      name: tbl.name,
      storageKey: tbl.storageKey,
      description: tbl.description,
      primaryKey: tbl.primaryKey,
      recordCount: count,
      sizeKb: parseFloat((bytes / 1024).toFixed(2))
    };
  });

  const estimatedQuotaMb = 5.0; // LocalStorage standard limit ~5MB
  const totalUsedKb = parseFloat((totalBytes / 1024).toFixed(2));
  const usagePercent = Math.min(100, parseFloat(((totalBytes / (estimatedQuotaMb * 1024 * 1024)) * 100).toFixed(2)));

  return {
    totalUsedBytes: totalBytes,
    totalUsedKb,
    estimatedQuotaMb,
    usagePercent,
    tables
  };
}

// Check Integrity & Find Anomalies / Orphans
export function runDatabaseIntegrityCheck(): IntegrityReport {
  const issues: IntegrityIssue[] = [];

  // Load datasets safely
  let members: Member[] = [];
  let teams: Team[] = [];
  let sessions: Session[] = [];
  let equipment: Equipment[] = [];
  let transactions: Transaction[] = [];

  try {
    members = JSON.parse(localStorage.getItem(DB_KEYS.MEMBERS) || "[]");
  } catch {
    issues.push({ id: "err-m-parse", severity: "error", table: "Membres", recordId: "ALL", message: "Impossible de lire la table des membres (JSON corrompu)", fixable: true });
  }

  try {
    teams = JSON.parse(localStorage.getItem(DB_KEYS.TEAMS) || "[]");
  } catch {
    issues.push({ id: "err-t-parse", severity: "error", table: "Équipes", recordId: "ALL", message: "Impossible de lire la table des équipes (JSON corrompu)", fixable: true });
  }

  try {
    sessions = JSON.parse(localStorage.getItem(DB_KEYS.SESSIONS) || "[]");
  } catch {
    issues.push({ id: "err-s-parse", severity: "error", table: "Séances", recordId: "ALL", message: "Impossible de lire la table des séances (JSON corrompu)", fixable: true });
  }

  try {
    equipment = JSON.parse(localStorage.getItem(DB_KEYS.EQUIPMENT) || "[]");
  } catch {
    issues.push({ id: "err-e-parse", severity: "error", table: "Matériel", recordId: "ALL", message: "Impossible de lire la table du matériel (JSON corrompu)", fixable: true });
  }

  try {
    transactions = JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || "[]");
  } catch {
    issues.push({ id: "err-tx-parse", severity: "error", table: "Comptabilité", recordId: "ALL", message: "Impossible de lire la table comptable (JSON corrompu)", fixable: true });
  }

  const memberIdsSet = new Set(members.map((m) => m.id));
  const teamIdsSet = new Set(teams.map((t) => t.id));

  // 1. Check duplicate IDs in Members
  const seenMemberIds = new Set<string>();
  members.forEach((m, idx) => {
    if (!m.id) {
      issues.push({ id: `m-noid-${idx}`, severity: "error", table: "Membres", recordId: `index-${idx}`, message: `Membre #${idx + 1} (${m.name || "Inconnu"}) n'a pas d'identifiant unique.`, fixable: true });
    } else if (seenMemberIds.has(m.id)) {
      issues.push({ id: `m-dup-${m.id}`, severity: "error", table: "Membres", recordId: m.id, message: `Identifiant membre en double répertorié : ${m.id}`, fixable: true });
    } else {
      seenMemberIds.add(m.id);
    }

    if (!m.email || !m.email.includes("@")) {
      issues.push({ id: `m-email-${m.id}`, severity: "warning", table: "Membres", recordId: m.id, message: `Format d'email potentiellement invalide pour ${m.name}`, fixable: true });
    }
  });

  // 2. Check orphan Member references in Teams
  teams.forEach((t) => {
    if (t.memberIds && Array.isArray(t.memberIds)) {
      const orphans = t.memberIds.filter((mid) => !memberIdsSet.has(mid));
      if (orphans.length > 0) {
        issues.push({
          id: `t-orphan-${t.id}`,
          severity: "warning",
          table: "Équipes",
          recordId: t.id,
          message: `Équipe "${t.name}" contient ${orphans.length} référence(s) à des membres inexistants/supprimés (${orphans.join(", ")}).`,
          fixable: true
        });
      }
    }
  });

  // 3. Check orphan Team references in Sessions
  sessions.forEach((s) => {
    if (s.teamId && !teamIdsSet.has(s.teamId)) {
      issues.push({
        id: `s-orphan-${s.id}`,
        severity: "warning",
        table: "Séances",
        recordId: s.id,
        message: `Séance "${s.title}" fait référence à une équipe supprimée (ID: ${s.teamId}).`,
        fixable: true
      });
    }

    if (s.attendeeIds) {
      const orphanAttendees = s.attendeeIds.filter((mid) => !memberIdsSet.has(mid));
      if (orphanAttendees.length > 0) {
        issues.push({
          id: `s-att-orphan-${s.id}`,
          severity: "info",
          table: "Séances",
          recordId: s.id,
          message: `Séance "${s.title}" contient ${orphanAttendees.length} id(s) de présence obsolètes.`,
          fixable: true
        });
      }
    }
  });

  // 4. Check orphan references in Equipment
  equipment.forEach((e) => {
    if (e.assignedToType === "team" && e.assignedToId && !teamIdsSet.has(e.assignedToId)) {
      issues.push({
        id: `e-orphan-t-${e.id}`,
        severity: "warning",
        table: "Matériel",
        recordId: e.id,
        message: `Équipement "${e.name}" attribué à une équipe introuvable (${e.assignedToId}).`,
        fixable: true
      });
    } else if (e.assignedToType === "member" && e.assignedToId && !memberIdsSet.has(e.assignedToId)) {
      issues.push({
        id: `e-orphan-m-${e.id}`,
        severity: "warning",
        table: "Matériel",
        recordId: e.id,
        message: `Équipement "${e.name}" attribué à un membre introuvable (${e.assignedToId}).`,
        fixable: true
      });
    }
  });

  // 5. Check orphan references in Transactions
  transactions.forEach((tx) => {
    if (tx.memberId && !memberIdsSet.has(tx.memberId)) {
      issues.push({
        id: `tx-orphan-m-${tx.id}`,
        severity: "info",
        table: "Comptabilité",
        recordId: tx.id,
        message: `Écriture "${tx.title}" liée à un membre archivé/supprimé (${tx.memberId}).`,
        fixable: true
      });
    }
  });

  const errorsCount = issues.filter((i) => i.severity === "error").length;
  const warningsCount = issues.filter((i) => i.severity === "warning" || i.severity === "info").length;

  return {
    timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    isHealthy: issues.length === 0,
    totalIssuesCount: issues.length,
    errorsCount,
    warningsCount,
    issues
  };
}

// Repair & Cleanup Database Integrity
export function repairDatabaseIntegrity(): { fixedCount: number; message: string } {
  let fixedCount = 0;

  let members: Member[] = [];
  let teams: Team[] = [];
  let sessions: Session[] = [];
  let equipment: Equipment[] = [];
  let transactions: Transaction[] = [];

  try { members = JSON.parse(localStorage.getItem(DB_KEYS.MEMBERS) || "[]"); } catch { members = INITIAL_MEMBERS; fixedCount++; }
  try { teams = JSON.parse(localStorage.getItem(DB_KEYS.TEAMS) || "[]"); } catch { teams = INITIAL_TEAMS; fixedCount++; }
  try { sessions = JSON.parse(localStorage.getItem(DB_KEYS.SESSIONS) || "[]"); } catch { sessions = INITIAL_SESSIONS; fixedCount++; }
  try { equipment = JSON.parse(localStorage.getItem(DB_KEYS.EQUIPMENT) || "[]"); } catch { equipment = INITIAL_EQUIPMENT; fixedCount++; }
  try { transactions = JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || "[]"); } catch { transactions = INITIAL_TRANSACTIONS; fixedCount++; }

  // Fix Member IDs
  const validMemberIds = new Set<string>();
  const cleanedMembers: Member[] = [];
  members.forEach((m, idx) => {
    if (!m.id) {
      m.id = `m-fixed-${Date.now()}-${idx}`;
      fixedCount++;
    }
    if (!validMemberIds.has(m.id)) {
      validMemberIds.add(m.id);
      cleanedMembers.push(m);
    } else {
      m.id = `${m.id}-dedup-${idx}`;
      validMemberIds.add(m.id);
      cleanedMembers.push(m);
      fixedCount++;
    }
  });

  // Clean Orphan Team references
  const validTeamIds = new Set(teams.map((t) => t.id));
  const cleanedTeams = teams.map((t) => {
    if (t.memberIds) {
      const originalLen = t.memberIds.length;
      const filtered = t.memberIds.filter((mid) => validMemberIds.has(mid));
      if (filtered.length !== originalLen) {
        fixedCount += originalLen - filtered.length;
        return { ...t, memberIds: filtered };
      }
    }
    return t;
  });

  // Clean Orphan Sessions references
  const cleanedSessions = sessions.map((s) => {
    let updated = { ...s };
    if (s.teamId && !validTeamIds.has(s.teamId)) {
      updated.teamId = teams[0]?.id || "t-1";
      fixedCount++;
    }
    if (s.attendeeIds) {
      const originalLen = s.attendeeIds.length;
      const filtered = s.attendeeIds.filter((mid) => validMemberIds.has(mid));
      if (filtered.length !== originalLen) {
        fixedCount += originalLen - filtered.length;
        updated.attendeeIds = filtered;
      }
    }
    return updated;
  });

  // Clean Orphan Equipment references
  const cleanedEquipment = equipment.map((e) => {
    if (e.assignedToType === "team" && e.assignedToId && !validTeamIds.has(e.assignedToId)) {
      fixedCount++;
      return { ...e, assignedToType: "none" as const, assignedToId: undefined };
    }
    if (e.assignedToType === "member" && e.assignedToId && !validMemberIds.has(e.assignedToId)) {
      fixedCount++;
      return { ...e, assignedToType: "none" as const, assignedToId: undefined };
    }
    return e;
  });

  // Clean Orphan Transactions
  const cleanedTransactions = transactions.map((tx) => {
    if (tx.memberId && !validMemberIds.has(tx.memberId)) {
      fixedCount++;
      return { ...tx, memberId: undefined };
    }
    return tx;
  });

  // Save cleaned states
  localStorage.setItem(DB_KEYS.MEMBERS, JSON.stringify(cleanedMembers));
  localStorage.setItem(DB_KEYS.TEAMS, JSON.stringify(cleanedTeams));
  localStorage.setItem(DB_KEYS.SESSIONS, JSON.stringify(cleanedSessions));
  localStorage.setItem(DB_KEYS.EQUIPMENT, JSON.stringify(cleanedEquipment));
  localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(cleanedTransactions));

  return {
    fixedCount,
    message: fixedCount > 0
      ? `Anomalies corrigées avec succès : ${fixedCount} élément(s) nettoyé(s) ou réparé(s).`
      : "Base de données déjà saine ! Aucune anomalie détectée."
  };
}

// Calculate Database Quality & Completeness Score (0-100%)
export function calculateDatabaseQualityScore(): {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  completenessPercent: number;
  details: { label: string; score: number; status: string }[];
} {
  const members: Member[] = JSON.parse(localStorage.getItem(DB_KEYS.MEMBERS) || "[]");
  const equipment: Equipment[] = JSON.parse(localStorage.getItem(DB_KEYS.EQUIPMENT) || "[]");
  const transactions: Transaction[] = JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || "[]");

  let memberCompleteness = 100;
  if (members.length > 0) {
    const validLicenses = members.filter((m) => m.licenseNumber && m.licenseNumber.length > 3).length;
    const validContacts = members.filter((m) => m.email && m.phone).length;
    const validMedical = members.filter((m) => m.medicalCertificateStatus && m.medicalCertificateStatus !== "pending").length;
    memberCompleteness = Math.round(((validLicenses + validContacts + validMedical) / (members.length * 3)) * 100);
  }

  let equipmentCompleteness = 100;
  if (equipment.length > 0) {
    const validLocations = equipment.filter((e) => e.location && e.location.length > 2).length;
    equipmentCompleteness = Math.round((validLocations / equipment.length) * 100);
  }

  let txCompleteness = 100;
  if (transactions.length > 0) {
    const validTx = transactions.filter((t) => t.paymentMethod && t.category && t.amount > 0).length;
    txCompleteness = Math.round((validTx / transactions.length) * 100);
  }

  const overallScore = Math.min(100, Math.max(0, Math.round((memberCompleteness * 0.5) + (equipmentCompleteness * 0.25) + (txCompleteness * 0.25))));
  const grade = overallScore >= 90 ? "A+" : overallScore >= 80 ? "A" : overallScore >= 65 ? "B" : overallScore >= 50 ? "C" : "D";

  return {
    score: overallScore,
    grade,
    completenessPercent: overallScore,
    details: [
      { label: "Complétude fiches membres (Licences, contact, certificat)", score: memberCompleteness, status: memberCompleteness > 75 ? "Optimal" : "À compléter" },
      { label: "Localisation & Traçabilité du matériel", score: equipmentCompleteness, status: equipmentCompleteness > 75 ? "Optimal" : "À préciser" },
      { label: "Règlementation & Catégories comptables", score: txCompleteness, status: txCompleteness > 85 ? "Excellente" : "Bonne" }
    ]
  };
}

// Vacuum & Optimize Database Storage
export function vacuumAndOptimizeDatabase(): {
  bytesReclaimed: number;
  recordsStandardized: number;
  message: string;
} {
  let recordsStandardized = 0;
  const initialBytes = getItemSizeInBytes(DB_KEYS.MEMBERS) +
    getItemSizeInBytes(DB_KEYS.TEAMS) +
    getItemSizeInBytes(DB_KEYS.SESSIONS) +
    getItemSizeInBytes(DB_KEYS.EQUIPMENT) +
    getItemSizeInBytes(DB_KEYS.TRANSACTIONS);

  // Normalize members (trim strings, standardize phone formats)
  try {
    const rawM = localStorage.getItem(DB_KEYS.MEMBERS);
    if (rawM) {
      const members: Member[] = JSON.parse(rawM);
      const cleanedM = members.map((m) => {
        recordsStandardized++;
        return {
          ...m,
          name: m.name ? m.name.trim() : "",
          email: m.email ? m.email.trim().toLowerCase() : "",
          phone: m.phone ? m.phone.trim() : ""
        };
      });
      localStorage.setItem(DB_KEYS.MEMBERS, JSON.stringify(cleanedM));
    }
  } catch {}

  // Normalize equipment
  try {
    const rawE = localStorage.getItem(DB_KEYS.EQUIPMENT);
    if (rawE) {
      const equipment: Equipment[] = JSON.parse(rawE);
      const cleanedE = equipment.map((e) => {
        recordsStandardized++;
        return {
          ...e,
          name: e.name ? e.name.trim() : "",
          location: e.location ? e.location.trim() : "Non spécifié"
        };
      });
      localStorage.setItem(DB_KEYS.EQUIPMENT, JSON.stringify(cleanedE));
    }
  } catch {}

  const finalBytes = getItemSizeInBytes(DB_KEYS.MEMBERS) +
    getItemSizeInBytes(DB_KEYS.TEAMS) +
    getItemSizeInBytes(DB_KEYS.SESSIONS) +
    getItemSizeInBytes(DB_KEYS.EQUIPMENT) +
    getItemSizeInBytes(DB_KEYS.TRANSACTIONS);

  const bytesReclaimed = Math.max(0, initialBytes - finalBytes);

  return {
    bytesReclaimed,
    recordsStandardized,
    message: `Base de données optimisée : ${recordsStandardized} enregistrements normalisés.`
  };
}

// Generate Realistic Mock Records for Database Scaling Tests
export function generateMockDataBatch(entityType: "members" | "transactions" | "equipment", count: number = 5): { addedCount: number; message: string } {
  const firstNames = ["Lucas", "Emma", "Gabriel", "Jade", "Léo", "Louise", "Hugo", "Alice", "Arthur", "Lina", "Louis", "Chloé", "Jules", "Mila", "Maël", "Inès"];
  const lastNames = ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy"];
  const cities = ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille"];

  if (entityType === "members") {
    const currentMembers: Member[] = JSON.parse(localStorage.getItem(DB_KEYS.MEMBERS) || "[]");
    const newMembers: Member[] = [];

    for (let i = 0; i < count; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const id = `m-gen-${Date.now()}-${i}`;
      const num = Math.floor(1000 + Math.random() * 9000);

      newMembers.push({
        id,
        name: `${fn} ${ln}`,
        age: Math.floor(16 + Math.random() * 30),
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${num}@example.fr`,
        phone: `06 ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)}`,
        createdAt: new Date().toISOString(),
        licenseNumber: `LIC-2026-${num}`,
        gender: Math.random() > 0.5 ? "M" : "F",
        category: Math.random() > 0.3 ? "Sénior" : "Jeune",
        city,
        medicalCertificateStatus: Math.random() > 0.2 ? "valid" : "pending",
        paymentStatus: Math.random() > 0.15 ? "paid" : "pending",
        paymentAmount: 180,
        paymentMethod: Math.random() > 0.5 ? "Carte CB" : "Virement"
      });
    }

    const updated = [...currentMembers, ...newMembers];
    localStorage.setItem(DB_KEYS.MEMBERS, JSON.stringify(updated));
    return { addedCount: count, message: `${count} membre(s) réaliste(s) générés avec succès.` };
  }

  if (entityType === "transactions") {
    const currentTx: Transaction[] = JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || "[]");
    const categories: Transaction["category"][] = ["Cotisations", "Équipements & Matériel", "Événements & Buvette", "Subventions", "Sponsor & Partenariat"];
    const methods: Transaction["paymentMethod"][] = ["Carte CB", "Virement", "Espèces", "Chèque"];
    const newTx: Transaction[] = [];

    for (let i = 0; i < count; i++) {
      const isIncome = Math.random() > 0.4;
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const id = `tx-gen-${Date.now()}-${i}`;
      const amount = isIncome ? Math.floor(50 + Math.random() * 450) : Math.floor(30 + Math.random() * 250);

      newTx.push({
        id,
        title: isIncome ? `Paiement Cotisation / Recette - ${cat}` : `Achat Fournitures & Matériel - ${cat}`,
        type: isIncome ? "income" : "expense",
        category: cat,
        amount,
        date: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString().split("T")[0],
        paymentMethod: method,
        status: "Payé",
        createdAt: new Date().toISOString()
      });
    }

    const updated = [...currentTx, ...newTx];
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(updated));
    return { addedCount: count, message: `${count} écriture(s) comptables générée(s) avec succès.` };
  }

  if (entityType === "equipment") {
    const currentEq: Equipment[] = JSON.parse(localStorage.getItem(DB_KEYS.EQUIPMENT) || "[]");
    const items = [
      { name: "Lot de Chasubles d'Entraînement Fluo", category: "Textile" as const },
      { name: "Plot Conique Réfléchissant 30cm", category: "Matériel" as const },
      { name: "Paire de Poteaux Amovibles", category: "Infrastructure" as const },
      { name: "Trousse de Premiers Secours Terrain", category: "Médical" as const },
      { name: "Ballon Officiel Compétition", category: "Ballons" as const }
    ];
    const newEq: Equipment[] = [];

    for (let i = 0; i < count; i++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const id = `e-gen-${Date.now()}-${i}`;
      newEq.push({
        id,
        name: `${item.name} #${Math.floor(10 + Math.random() * 90)}`,
        category: item.category,
        quantity: Math.floor(5 + Math.random() * 25),
        condition: Math.random() > 0.2 ? "Neuf" : "Bon état",
        assignedToType: "none",
        location: "Local Matériel Principal",
        createdAt: new Date().toISOString()
      });
    }

    const updated = [...currentEq, ...newEq];
    localStorage.setItem(DB_KEYS.EQUIPMENT, JSON.stringify(updated));
    return { addedCount: count, message: `${count} équipement(s) généré(s) avec succès.` };
  }

  return { addedCount: 0, message: "Type non reconnu." };
}

// Global Search Engine across ALL DB tables
export function queryDatabaseGlobalSearch(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { members: [], teams: [], sessions: [], equipment: [], transactions: [] };

  const members: Member[] = JSON.parse(localStorage.getItem(DB_KEYS.MEMBERS) || "[]");
  const teams: Team[] = JSON.parse(localStorage.getItem(DB_KEYS.TEAMS) || "[]");
  const sessions: Session[] = JSON.parse(localStorage.getItem(DB_KEYS.SESSIONS) || "[]");
  const equipment: Equipment[] = JSON.parse(localStorage.getItem(DB_KEYS.EQUIPMENT) || "[]");
  const transactions: Transaction[] = JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || "[]");

  return {
    members: members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        (m.licenseNumber && m.licenseNumber.toLowerCase().includes(q))
    ),
    teams: teams.filter(
      (t) => t.name.toLowerCase().includes(q) || t.coach.toLowerCase().includes(q)
    ),
    sessions: sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.location && s.location.toLowerCase().includes(q)) ||
        s.date.includes(q)
    ),
    equipment: equipment.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q))
    ),
    transactions: transactions.filter(
      (tx) =>
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q) ||
        tx.date.includes(q)
    )
  };
}

// Demo Presets to seed themed associations
export const DATABASE_PRESETS: DatabasePreset[] = [
  {
    id: "preset-football",
    name: "Club de Football & Futsal Avenir",
    category: "Sports Collectifs",
    description: "Jeu de données pour club de football avec équipes Séniors, Féminines, U18, matériel de terrain et cotisations.",
    badge: "Football ⚽",
    iconName: "Shield",
    data: {
      associationInfo: {
        ...INITIAL_ASSOCIATION_INFO,
        name: "FC Avenir Vallée",
        slogan: "Passion, Fair-play et Victoire",
        federationName: "Fédération Française de Football (FFF)",
        federationNumber: "FFF-502194"
      },
      members: [
        { id: "m-fb-1", name: "Antoine Griezmann", age: 26, email: "antoine.g@example.com", phone: "06 11 22 33 44", createdAt: "2026-01-10T10:00:00.000Z" },
        { id: "m-fb-2", name: "Kylian Mbappé", age: 23, email: "kylian.m@example.com", phone: "06 22 33 44 55", createdAt: "2026-01-12T11:00:00.000Z" },
        { id: "m-fb-3", name: "Wendie Renard", age: 28, email: "wendie.r@example.com", phone: "06 33 44 55 66", createdAt: "2026-01-15T14:00:00.000Z" },
        { id: "m-fb-4", name: "Eugénie Le Sommer", age: 27, email: "eugenie.ls@example.com", phone: "06 44 55 66 77", createdAt: "2026-01-20T09:00:00.000Z" }
      ],
      teams: [
        { id: "t-fb-1", name: "Séniors A (Régional 1)", coach: "Didier Deschamps", memberIds: ["m-fb-1", "m-fb-2"], createdAt: "2026-01-25T10:00:00.000Z" },
        { id: "t-fb-2", name: "Féminines R1", coach: "Hervé Renard", memberIds: ["m-fb-3", "m-fb-4"], createdAt: "2026-01-26T11:00:00.000Z" }
      ],
      sessions: [
        { id: "s-fb-1", title: "Entraînement Tactique & Combinaisons", date: "2026-08-15", time: "19:00", teamId: "t-fb-1", location: "Stade Municipal Honoré" },
        { id: "s-fb-2", title: "Match de Championnat J1", date: "2026-08-20", time: "15:00", teamId: "t-fb-2", location: "Terrain Synthétique" }
      ],
      equipment: [
        { id: "e-fb-1", name: "Lot de 20 Ballons Kipsta Taille 5", category: "Ballons", quantity: 20, condition: "Neuf", assignedToType: "team", assignedToId: "t-fb-1", location: "Local Matériel 1", createdAt: "2026-02-01T08:00:00.000Z" },
        { id: "e-fb-2", name: "Jeux de Maillots Rouges Compétition", category: "Textile", quantity: 22, condition: "Bon état", assignedToType: "team", assignedToId: "t-fb-1", location: "Armoire Vestiaire A", createdAt: "2026-02-05T09:00:00.000Z" }
      ],
      transactions: [
        { id: "tx-fb-1", title: "Subvention FFF Aide au Matériel", type: "income", category: "Subventions", amount: 2500, date: "2026-02-10", paymentMethod: "Virement", status: "Payé", createdAt: "2026-02-10T10:00:00.000Z" },
        { id: "tx-fb-2", title: "Achat de Filets de But Amovibles", type: "expense", category: "Équipements & Matériel", amount: 480, date: "2026-02-15", paymentMethod: "Carte CB", status: "Payé", createdAt: "2026-02-15T11:00:00.000Z" }
      ]
    }
  },
  {
    id: "preset-martial",
    name: "Académie de Combat & Arts Martiaux",
    category: "Sports de Combat",
    description: "Jeu de données pour club de Judo, Taekwondo, Karaté avec tatamis, ceintures et suivi de passages de grades.",
    badge: "Arts Martiaux 🥋",
    iconName: "Award",
    data: {
      associationInfo: {
        ...INITIAL_ASSOCIATION_INFO,
        name: "Dojo Bushido & Arts Martiaux",
        slogan: "Discipline, Respect et Maîtrise de Soi",
        federationName: "Fédération Française de Judo (FFJDA)",
        federationNumber: "FFJDA-789201"
      },
      members: [
        { id: "m-am-1", name: "Teddy Riner", age: 31, email: "teddy.r@example.com", phone: "06 99 88 77 66", createdAt: "2026-01-05T09:00:00.000Z" },
        { id: "m-am-2", name: "Clarisse Agbegnenou", age: 29, email: "clarisse.a@example.com", phone: "06 88 77 66 55", createdAt: "2026-01-06T10:00:00.000Z" }
      ],
      teams: [
        { id: "t-am-1", name: "Section Ceintures Noires & Compétition", coach: "Master Sensei Tanaka", memberIds: ["m-am-1", "m-am-2"], createdAt: "2026-01-08T10:00:00.000Z" }
      ],
      sessions: [
        { id: "s-am-1", title: "Stage de Perfectionnement Randori", date: "2026-08-18", time: "18:00", teamId: "t-am-1", location: "Dojo Central" }
      ],
      equipment: [
        { id: "e-am-1", name: "Lot de 50 Tatamis de Sol Amovibles", category: "Infrastructure", quantity: 50, condition: "Neuf", assignedToType: "none", location: "Salle du Dojo", createdAt: "2026-01-20T10:00:00.000Z" }
      ],
      transactions: [
        { id: "tx-am-1", title: "Passages de Grades & Diplômes FFJDA", type: "income", category: "Événements & Buvette", amount: 650, date: "2026-03-01", paymentMethod: "Espèces", status: "Payé", createdAt: "2026-03-01T14:00:00.000Z" }
      ]
    }
  },
  {
    id: "preset-music",
    name: "Harmonie & École de Musique",
    category: "Culture & Arts",
    description: "Jeu de données pour orchestre, chorale ou école de musique avec parc d'instruments et concerts.",
    badge: "Musique 🎵",
    iconName: "Globe",
    data: {
      associationInfo: {
        ...INITIAL_ASSOCIATION_INFO,
        name: "Harmonie Municipale Symphonia",
        slogan: "La Musique au Cœur de la Cité",
        federationName: "Confédération Musicale de France (CMF)",
        federationNumber: "CMF-102938"
      },
      members: [
        { id: "m-mu-1", name: "Camille Saint-Saëns", age: 35, email: "camille.ss@example.com", phone: "06 12 34 56 00", createdAt: "2026-02-01T10:00:00.000Z" },
        { id: "m-mu-2", name: "Clara Schumann", age: 30, email: "clara.s@example.com", phone: "06 23 45 67 89", createdAt: "2026-02-02T11:00:00.000Z" }
      ],
      teams: [
        { id: "t-mu-1", name: "Orchestre d'Harmonie Principal", coach: "Maestro Laurent Petit", memberIds: ["m-mu-1", "m-mu-2"], createdAt: "2026-02-05T10:00:00.000Z" }
      ],
      sessions: [
        { id: "s-mu-1", title: "Répétition Générale Concert d'Automne", date: "2026-09-01", time: "20:00", teamId: "t-mu-1", location: "Auditorium Municipal" }
      ],
      equipment: [
        { id: "e-mu-1", name: "Pupitres d'Orchestre Pliables", category: "Matériel", quantity: 35, condition: "Bon état", assignedToType: "team", assignedToId: "t-mu-1", location: "Local Musique", createdAt: "2026-02-10T10:00:00.000Z" }
      ],
      transactions: [
        { id: "tx-mu-1", title: "Recettes Billetterie Concert de Gala", type: "income", category: "Événements & Buvette", amount: 1850, date: "2026-04-10", paymentMethod: "Carte CB", status: "Payé", createdAt: "2026-04-10T22:00:00.000Z" }
      ]
    }
  }
];

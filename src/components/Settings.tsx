import React, { useState, useRef } from "react";
import { AssociationInfo, AppTheme, FeeTierItem, SeasonManagementItem } from "../types";
import { getCurrencySymbol, formatCurrency } from "../utils";
import { ValidatedInput } from "./ValidatedInput";
import { validateEmail, validatePhone } from "../lib/validation";
import {
  Settings as SettingsIcon,
  Building2,
  Palette,
  Database,
  Save,
  Check,
  Upload,
  Download,
  RotateCcw,
  AlertTriangle,
  Bell,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldAlert,
  Moon,
  Sun,
  X,
  Globe,
  DollarSign,
  Calendar,
  Layers,
  Award,
  Sliders,
  Sparkles,
  CheckCircle2,
  HardDrive,
  Users,
  ShieldCheck,
  Receipt,
  FileCheck,
  Plus,
  Trash2,
  Clock,
  CreditCard,
  Tag,
  BadgePercent,
  ChevronRight,
  BellRing,
  TrendingUp,
  PiggyBank,
  HelpCircle,
  Edit3,
  Landmark,
  Copy,
  ExternalLink,
  UserCheck,
  Shield,
  Briefcase,
  FileBadge,
  Eye,
  Layout,
  Type,
  Paintbrush,
  SlidersHorizontal,
  Monitor,
  Calculator,
  Printer,
  FileSpreadsheet,
  History,
  FileJson,
  RefreshCw,
  DownloadCloud,
  UploadCloud,
  Archive,
  Lock,
  Search,
  Wrench,
  Table,
  CheckCircle,
  Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DiagnosticConsole } from "./DiagnosticConsole";
import {
  getDatabaseMetrics,
  runDatabaseIntegrityCheck,
  repairDatabaseIntegrity,
  DATABASE_PRESETS,
  IntegrityReport,
  StorageMetrics,
  DatabasePreset,
  DB_KEYS,
  calculateDatabaseQualityScore,
  vacuumAndOptimizeDatabase,
  generateMockDataBatch
} from "../lib/db";

interface SettingsProps {
  associationInfo: AssociationInfo;
  theme: AppTheme;
  onUpdateAssociationInfo: (info: AssociationInfo) => void;
  onSetTheme: (theme: AppTheme) => void;
  onResetAllData: () => void;
  onExportFullBackup: () => void;
  onImportFullBackup: (jsonData: string) => boolean;
  stats?: {
    members: number;
    teams: number;
    sessions: number;
    equipment: number;
    transactions: number;
    documents?: number;
  };
}

export const SettingsModule: React.FC<SettingsProps> = ({
  associationInfo,
  theme,
  onUpdateAssociationInfo,
  onSetTheme,
  onResetAllData,
  onExportFullBackup,
  onImportFullBackup,
  stats = { members: 0, teams: 0, sessions: 0, equipment: 0, transactions: 0 }
}) => {
  const isClassic = theme === "classic";

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    "identity" | "appearance" | "seasons" | "documents" | "database" | "diagnostics"
  >("identity");

  // Form State
  const [name, setName] = useState(associationInfo.name || "");
  const [slogan, setSlogan] = useState(associationInfo.slogan || "");
  const [siret, setSiret] = useState(associationInfo.siret || "");
  const [address, setAddress] = useState(associationInfo.address || "");
  const [email, setEmail] = useState(associationInfo.email || "");
  const [phone, setPhone] = useState(associationInfo.phone || "");
  const [website, setWebsite] = useState(associationInfo.website || "https://association-demo.fr");
  const [season, setSeason] = useState(associationInfo.season || "2025 - 2026");
  const [currency, setCurrency] = useState(associationInfo.currency || "EUR (€)");
  const [autoReminders, setAutoReminders] = useState(associationInfo.autoReminders ?? true);
  const [logo, setLogo] = useState(associationInfo.logo || "");
  const [defaultFee, setDefaultFee] = useState(associationInfo.defaultFee?.toString() || "150");
  const [signatoryName, setSignatoryName] = useState(associationInfo.signatoryName || "Marie DUBOIS - Présidente");
  const [receiptHeader, setReceiptHeader] = useState(
    associationInfo.receiptHeader || "Association à but non lucratif régie par la loi du 1er juillet 1901."
  );

  // Expanded Identity & Governance Fields
  const [rna, setRna] = useState(associationInfo.rna || "W751029384");
  const [apeCode, setApeCode] = useState(associationInfo.apeCode || "9312Z - Clubs de sport");
  const [creationDate, setCreationDate] = useState(associationInfo.creationDate || "2012-04-15");
  const [presidentName, setPresidentName] = useState(associationInfo.presidentName || "Marie DUBOIS");
  const [treasurerName, setTreasurerName] = useState(associationInfo.treasurerName || "Jean-Pierre MARTIN");
  const [secretaryName, setSecretaryName] = useState(associationInfo.secretaryName || "Claire MOREAU");
  const [federationName, setFederationName] = useState(associationInfo.federationName || "Fédération Française de Handball (FFHB)");
  const [federationNumber, setFederationNumber] = useState(associationInfo.federationNumber || "5875042");
  const [sportsAgreementNumber, setSportsAgreementNumber] = useState(associationInfo.sportsAgreementNumber || "APS-75-2014-88");
  const [insuranceCompany, setInsuranceCompany] = useState(associationInfo.insuranceCompany || "MAIF Associations & Collectivités");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(associationInfo.insurancePolicyNumber || "4820193-H");
  const [bankName, setBankName] = useState(associationInfo.bankName || "Crédit Mutuel");
  const [bankAccountHolder, setBankAccountHolder] = useState(associationInfo.bankAccountHolder || "Club Omnisports de la Vallée");
  const [iban, setIban] = useState(associationInfo.iban || "FR76 1027 8021 5400 0123 4567 889");
  const [bic, setBic] = useState(associationInfo.bic || "CMUTFR2PP");
  const [copiedBadge, setCopiedBadge] = useState(false);

  // Admin Security Key State
  const [adminSecurityKey, setAdminSecurityKey] = useState(
    () => localStorage.getItem("appass_admin_security_key") || "APPASS-2026"
  );

  // --- Theme & Style Customization State ---
  const [accentColor, setAccentColor] = useState<"indigo" | "emerald" | "sky" | "rose" | "amber" | "purple">(
    () => (localStorage.getItem("appass_accent_color") as any) || "indigo"
  );
  const [uiDensity, setUiDensity] = useState<"compact" | "comfortable" | "spacious">(
    () => (localStorage.getItem("appass_ui_density") as any) || "comfortable"
  );
  const [borderRadiusStyle, setBorderRadiusStyle] = useState<"subtle" | "balanced" | "rounded">(
    () => (localStorage.getItem("appass_border_radius") as any) || "balanced"
  );
  const [highContrast, setHighContrast] = useState<boolean>(
    () => localStorage.getItem("appass_high_contrast") === "true"
  );
  const [enableAnimations, setEnableAnimations] = useState<boolean>(
    () => localStorage.getItem("appass_enable_animations") !== "false"
  );

  const ACCENT_PRESETS = [
    { id: "indigo", name: "Indigo Impérial", hex: "#4f46e5", bgClass: "bg-indigo-600", textClass: "text-indigo-600", borderClass: "border-indigo-600", ringClass: "ring-indigo-500/30", badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800" },
    { id: "emerald", name: "Émeraude Sport", hex: "#10b981", bgClass: "bg-emerald-600", textClass: "text-emerald-600", borderClass: "border-emerald-600", ringClass: "ring-emerald-500/30", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" },
    { id: "sky", name: "Océan Athlétique", hex: "#0284c7", bgClass: "bg-sky-600", textClass: "text-sky-600", borderClass: "border-sky-600", ringClass: "ring-sky-500/30", badgeBg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800" },
    { id: "rose", name: "Rubis Passion", hex: "#f43f5e", bgClass: "bg-rose-600", textClass: "text-rose-600", borderClass: "border-rose-600", ringClass: "ring-rose-500/30", badgeBg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800" },
    { id: "amber", name: "Ambre Chaleureux", hex: "#d97706", bgClass: "bg-amber-600", textClass: "text-amber-600", borderClass: "border-amber-600", ringClass: "ring-amber-500/30", badgeBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800" },
    { id: "purple", name: "Violet Mystique", hex: "#9333ea", bgClass: "bg-purple-600", textClass: "text-purple-600", borderClass: "border-purple-600", ringClass: "ring-purple-500/30", badgeBg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800" },
  ] as const;

  const currentAccent = ACCENT_PRESETS.find((a) => a.id === accentColor) || ACCENT_PRESETS[0];

  const handleSelectAccent = (colorId: typeof accentColor) => {
    setAccentColor(colorId);
    localStorage.setItem("appass_accent_color", colorId);
  };

  const handleSelectDensity = (density: typeof uiDensity) => {
    setUiDensity(density);
    localStorage.setItem("appass_ui_density", density);
  };

  const handleSelectRadius = (radius: typeof borderRadiusStyle) => {
    setBorderRadiusStyle(radius);
    localStorage.setItem("appass_border_radius", radius);
  };

  const handleToggleHighContrast = () => {
    const val = !highContrast;
    setHighContrast(val);
    localStorage.setItem("appass_high_contrast", val.toString());
  };

  const handleToggleAnimations = () => {
    const val = !enableAnimations;
    setEnableAnimations(val);
    localStorage.setItem("appass_enable_animations", val.toString());
  };

  // --- Seasons & Fee Tiers State ---
  const DEFAULT_FEE_TIERS: FeeTierItem[] = [
    {
      id: "ft-1",
      name: "Cotisation Adulte / Sénior",
      amount: 150,
      description: "Accès complet aux équipements, entraînements et compétitions officielles.",
      badge: "Recommandé",
      isDefault: true
    },
    {
      id: "ft-2",
      name: "Cotisation Jeune & Étudiant (-18 ans)",
      amount: 110,
      description: "Tarif préférentiel pour mineurs, lycéens et étudiants sur justificatif.",
      badge: "Réduit"
    },
    {
      id: "ft-3",
      name: "Pack Famille (3 membres et +)",
      amount: 280,
      description: "Formule globale regroupant tous les membres d'un même foyer fiscal.",
      badge: "Multi-licences"
    },
    {
      id: "ft-4",
      name: "Licence Compétition Fédérale",
      amount: 190,
      description: "Inclut la licence de la fédération, l'assurance obligatoire et l'accès aux tournois.",
      badge: "Compétition"
    },
    {
      id: "ft-5",
      name: "Membre Bienfaiteur / Droit d'Entrée",
      amount: 50,
      description: "Cotisation de soutien sans pratique sportive régulière, donne droit de vote à l'AG.",
      badge: "Soutien"
    }
  ];

  const DEFAULT_SEASONS_LIST: SeasonManagementItem[] = [
    {
      id: "s-2024",
      name: "2024 - 2025",
      startDate: "2024-09-01",
      endDate: "2025-08-31",
      status: "archived",
      membersCount: 142,
      expectedRevenue: 21300
    },
    {
      id: "s-2025",
      name: "2025 - 2026",
      startDate: "2025-09-01",
      endDate: "2026-08-31",
      status: "active",
      membersCount: stats.members || 158,
      expectedRevenue: 23700
    },
    {
      id: "s-2026",
      name: "2026 - 2027",
      startDate: "2026-09-01",
      endDate: "2027-08-31",
      status: "planned",
      membersCount: 0,
      expectedRevenue: 25000
    }
  ];

  const [feeTiers, setFeeTiers] = useState<FeeTierItem[]>(() => {
    if (associationInfo.feeTiers && associationInfo.feeTiers.length > 0) {
      return associationInfo.feeTiers;
    }
    const saved = localStorage.getItem("appass_fee_tiers");
    return saved ? JSON.parse(saved) : DEFAULT_FEE_TIERS;
  });

  const [seasonsList, setSeasonsList] = useState<SeasonManagementItem[]>(() => {
    if (associationInfo.seasonsList && associationInfo.seasonsList.length > 0) {
      return associationInfo.seasonsList;
    }
    const saved = localStorage.getItem("appass_seasons_list");
    return saved ? JSON.parse(saved) : DEFAULT_SEASONS_LIST;
  });

  const [acceptedFeeMethods, setAcceptedFeeMethods] = useState<string[]>(() => {
    const saved = localStorage.getItem("appass_fee_methods");
    return saved ? JSON.parse(saved) : ["Carte CB", "Virement", "Chèque", "Espèces", "Pass'Sport / ANCV"];
  });

  const [allowInstallments, setAllowInstallments] = useState<boolean>(() => {
    const saved = localStorage.getItem("appass_allow_installments");
    return saved ? JSON.parse(saved) : true;
  });

  const [installmentMonths, setInstallmentMonths] = useState<number>(() => {
    const saved = localStorage.getItem("appass_installment_months");
    return saved ? parseInt(saved, 10) : 3;
  });

  const [earlyBirdDiscount, setEarlyBirdDiscount] = useState<number>(() => {
    const saved = localStorage.getItem("appass_early_bird_discount");
    return saved ? parseFloat(saved) : 10;
  });

  const [familyDiscountPercent, setFamilyDiscountPercent] = useState<number>(() => {
    const saved = localStorage.getItem("appass_family_discount_percent");
    return saved ? parseFloat(saved) : 15;
  });

  const [reminderDays, setReminderDays] = useState<number>(() => {
    const saved = localStorage.getItem("appass_reminder_days");
    return saved ? parseInt(saved, 10) : 15;
  });

  // Registration dates
  const [registrationOpenDate, setRegistrationOpenDate] = useState<string>(
    () => localStorage.getItem("appass_reg_open_date") || "2026-06-01"
  );
  const [registrationCloseDate, setRegistrationCloseDate] = useState<string>(
    () => localStorage.getItem("appass_reg_close_date") || "2026-10-31"
  );

  // Modals state (Add & Edit Tiers & Seasons)
  const [isAddTierModalOpen, setIsAddTierModalOpen] = useState(false);
  const [newTierName, setNewTierName] = useState("");
  const [newTierAmount, setNewTierAmount] = useState("");
  const [newTierDesc, setNewTierDesc] = useState("");
  const [newTierBadge, setNewTierBadge] = useState("");

  const [isEditTierModalOpen, setIsEditTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<FeeTierItem | null>(null);
  const [editTierName, setEditTierName] = useState("");
  const [editTierAmount, setEditTierAmount] = useState("");
  const [editTierDesc, setEditTierDesc] = useState("");
  const [editTierBadge, setEditTierBadge] = useState("");

  const [isAddSeasonModalOpen, setIsAddSeasonModalOpen] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [newSeasonStart, setNewSeasonStart] = useState("");
  const [newSeasonEnd, setNewSeasonEnd] = useState("");
  const [newSeasonBudget, setNewSeasonBudget] = useState("");

  const [isEditSeasonModalOpen, setIsEditSeasonModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonManagementItem | null>(null);
  const [editSeasonName, setEditSeasonName] = useState("");
  const [editSeasonStart, setEditSeasonStart] = useState("");
  const [editSeasonEnd, setEditSeasonEnd] = useState("");
  const [editSeasonBudget, setEditSeasonBudget] = useState("");
  const [editSeasonMembers, setEditSeasonMembers] = useState("");
  const [editSeasonStatus, setEditSeasonStatus] = useState<"active" | "planned" | "archived">("planned");

  const [copiedReminderEmail, setCopiedReminderEmail] = useState(false);

  // Revenue Simulator per tier counts
  const [simulatorCounts, setSimulatorCounts] = useState<Record<string, number>>({
    "ft-1": 90,
    "ft-2": 45,
    "ft-3": 12,
    "ft-4": 20,
    "ft-5": 5
  });

  // --- Documents & Receipts Generator State ---
  const [receiptPrefix, setReceiptPrefix] = useState<string>(
    () => localStorage.getItem("appass_receipt_prefix") || "REC-2026-"
  );
  const [receiptCounter, setReceiptCounter] = useState<number>(
    () => parseInt(localStorage.getItem("appass_receipt_counter") || "101", 10)
  );
  const [includeTreasurerSignature, setIncludeTreasurerSignature] = useState<boolean>(
    () => localStorage.getItem("appass_include_treasurer_sig") !== "false"
  );
  const [taxReceiptEnabled, setTaxReceiptEnabled] = useState<boolean>(
    () => localStorage.getItem("appass_tax_receipt_enabled") !== "false"
  );
  const [taxDeductionPercent, setTaxDeductionPercent] = useState<number>(
    () => parseInt(localStorage.getItem("appass_tax_deduction_percent") || "66", 10)
  );
  const [taxLegalNotice, setTaxLegalNotice] = useState<string>(
    () => localStorage.getItem("appass_tax_legal_notice") || "Organisme de droit privé éligible au régime des dons et mécénat (Art. 200 & 238 bis du CGI)."
  );

  // Active Preview & Selected Template to edit
  const [selectedDocTemplate, setSelectedDocTemplate] = useState<"receipt" | "cerfa" | "ce" | "ag">("receipt");
  const [activePreviewDoc, setActivePreviewDoc] = useState<"receipt" | "cerfa" | "ce" | "ag">("receipt");

  // Sample Data for Live Document Inspector
  const [sampleMemberName, setSampleMemberName] = useState("Lucas MOREAU");
  const [sampleAmount, setSampleAmount] = useState("150");
  const [sampleDate, setSampleDate] = useState("2026-08-11");
  const [copiedDocText, setCopiedDocText] = useState(false);

  // Custom Templates clauses
  const [receiptBodyTemplate, setReceiptBodyTemplate] = useState<string>(
    () => localStorage.getItem("appass_tpl_receipt_body") || "Nous certifions avoir reçu ce jour le règlement intégral de la cotisation annuelle pour la saison {saison}. Ce récépissé atteste du paiement et vaut quittance définitive pour faire valoir ce que de droit."
  );
  const [cerfaBodyTemplate, setCerfaBodyTemplate] = useState<string>(
    () => localStorage.getItem("appass_tpl_cerfa_body") || "L'association certifie avoir reçu à titre de don manuel, sans contrepartie directe ou indirecte, la somme mentionnée ci-dessus. Ce versement ouvre droit à une réduction d'impôt égale à {taux_deduction}% des sommes versées."
  );
  const [ceBodyTemplate, setCeBodyTemplate] = useState<string>(
    () => localStorage.getItem("appass_tpl_ce_body") || "Je soussigné(e) {signataire}, certifie que l'adhérent(e) {nom_adherent} est régulièrement inscrit(e) et à jour de sa cotisation pour la saison sportive {saison}. Attestation délivrée à la demande de l'intéressé(e) pour le Comité Social et Économique (CSE)."
  );
  const [agBodyTemplate, setAgBodyTemplate] = useState<string>(
    () => localStorage.getItem("appass_tpl_ag_body") || "Convocation officielle à l'Assemblée Générale Ordinaire. Les membres à jour de cotisation sont invités à délibérer sur l'ordre du jour et le rapport financier de la saison {saison}. En cas d'impossibilité, merci de compléter le bon de pouvoir."
  );

  // --- Database & Backup Module States & Helpers ---
  const [lastBackupDate, setLastBackupDate] = useState<string>(
    () => localStorage.getItem("appass_last_backup_timestamp") || "11/08/2026 à 14:30"
  );
  const [autoBackupFreq, setAutoBackupFreq] = useState<string>(
    () => localStorage.getItem("appass_auto_backup_freq") || "daily"
  );

  // Snapshots State
  interface AppSnapshotItem {
    id: string;
    timestamp: string;
    label: string;
    membersCount: number;
    transactionsCount: number;
    sizeKb: number;
  }

  const [snapshots, setSnapshots] = useState<AppSnapshotItem[]>(() => {
    const saved = localStorage.getItem("appass_snapshots_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      {
        id: "snap-1",
        timestamp: "11/08/2026 à 12:00",
        label: "Point de restauration pré-saison",
        membersCount: stats.members || 42,
        transactionsCount: stats.transactions || 18,
        sizeKb: 128
      },
      {
        id: "snap-2",
        timestamp: "01/08/2026 à 09:15",
        label: "Clôture exercice précédent",
        membersCount: 38,
        transactionsCount: 15,
        sizeKb: 112
      }
    ];
  });

  // Candidate file for restore modal
  const [restoreCandidate, setRestoreCandidate] = useState<{
    fileContent: string;
    fileName: string;
    memberCount: number;
    teamCount: number;
    sessionCount: number;
    equipmentCount: number;
    txCount: number;
    valid: boolean;
  } | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Audit Diagnostic & Database Helper State
  const [dbMetrics, setDbMetrics] = useState<StorageMetrics>(() => getDatabaseMetrics());
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [dbQuality, setDbQuality] = useState(() => calculateDatabaseQualityScore());
  const [presetModal, setPresetModal] = useState<DatabasePreset | null>(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [explorerTable, setExplorerTable] = useState<"members" | "teams" | "sessions" | "equipment" | "transactions">("members");
  const [explorerSearch, setExplorerSearch] = useState("");

  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<{
    schemaValid: boolean;
    storageSizeKb: number;
    indexedMembers: number;
    orphanCheck: number;
    unbalancedEntries: number;
    auditTimestamp: string;
  } | null>(null);

  // Vacuum & Optimization Handler
  const handleVacuumDatabase = () => {
    const res = vacuumAndOptimizeDatabase();
    setDbMetrics(getDatabaseMetrics());
    setDbQuality(calculateDatabaseQualityScore());
    setSaveSuccess(res.message);
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  // Mock Data Batch Generator Handler
  const handleGenerateMockBatch = (entityType: "members" | "transactions" | "equipment") => {
    const res = generateMockDataBatch(entityType, 5);
    setDbMetrics(getDatabaseMetrics());
    setDbQuality(calculateDatabaseQualityScore());
    setSaveSuccess(res.message);
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  // GDPR Anonymize Modal
  const [isAnonymizeModalOpen, setIsAnonymizeModalOpen] = useState(false);
  const [anonymizeConfirmInput, setAnonymizeConfirmInput] = useState("");

  // Handler: Full Export with Timestamp update
  const handleExportFullBackupWithMeta = () => {
    onExportFullBackup();
    const nowStr = new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
    const formatted = `${nowStr.replace(",", " à")}`;
    setLastBackupDate(formatted);
    localStorage.setItem("appass_last_backup_timestamp", formatted);
    setSaveSuccess("Sauvegarde JSON exportée avec succès et horodatée !");
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  // Handler: Granular CSV Export
  const handleExportCSV = (moduleType: "members" | "accounting" | "teams" | "equipment") => {
    let csvContent = "";
    let filename = "";

    if (moduleType === "members") {
      filename = `membres_${name.replace(/\s+/g, "_")}_2026.csv`;
      const savedMembers = localStorage.getItem("appass_members");
      let membersList: any[] = [];
      if (savedMembers) {
        try { membersList = JSON.parse(savedMembers); } catch (e) {}
      }
      if (!membersList.length) {
        membersList = [
          { id: "1", firstName: "Lucas", lastName: "MOREAU", email: "lucas.moreau@example.com", phone: "0612345678", season: season, category: "Senior", status: "Actif" },
          { id: "2", firstName: "Camille", lastName: "DUBOIS", email: "camille.d@example.com", phone: "0698765432", season: season, category: "Junior", status: "Actif" },
          { id: "3", firstName: "Thomas", lastName: "BERNARD", email: "t.bernard@example.com", phone: "0655443322", season: season, category: "Master", status: "En attente" }
        ];
      }
      csvContent = "ID;Nom;Prénom;Email;Téléphone;Saison;Catégorie;Statut\n" +
        membersList.map((m: any) => `${m.id || ""};${m.lastName || ""};${m.firstName || ""};${m.email || ""};${m.phone || ""};${m.season || season};${m.category || "Général"};${m.status || "Actif"}`).join("\n");
    } else if (moduleType === "accounting") {
      filename = `grand_livre_comptable_${name.replace(/\s+/g, "_")}_2026.csv`;
      const savedTx = localStorage.getItem("appass_transactions");
      let txList: any[] = [];
      if (savedTx) {
        try { txList = JSON.parse(savedTx); } catch (e) {}
      }
      if (!txList.length) {
        txList = [
          { id: "TX-101", date: "2026-08-01", label: "Cotisation Annuelle Moreau", category: "Cotisations", type: "recette", amount: 180, method: "CB" },
          { id: "TX-102", date: "2026-08-05", label: "Achat Maillots Équipe A", category: "Équipement", type: "depense", amount: 450, method: "Virement" }
        ];
      }
      csvContent = "ID;Date;Libellé;Catégorie;Type;Montant;Méthode\n" +
        txList.map((t: any) => `${t.id || ""};${t.date || ""};${t.label || ""};${t.category || ""};${t.type || ""};${t.amount || 0};${t.method || ""}`).join("\n");
    } else if (moduleType === "teams") {
      filename = `equipes_et_planning_${name.replace(/\s+/g, "_")}_2026.csv`;
      csvContent = "ID;Nom Équipe;Catégorie;Entraîneur;Lieu;Jour;Horaire\n" +
        `EQ-01;Seniors Masculins A;Senior;Marc VALLON;Gymnase Municipal;Mardi;20h00 - 22h00\n` +
        `EQ-02;U17 Fêtes & Compétition;U17;Sophie LAURENT;Halle des Sports;Mercredi;16h30 - 18h30`;
    } else {
      filename = `inventaire_materiel_${name.replace(/\s+/g, "_")}_2026.csv`;
      csvContent = "ID;Désignation;Quantité;État;Emplacement;Valeur Estimée\n" +
        `MAT-01;Balloons de Match FBF;25;Bon état;Local 1;450 €\n` +
        `MAT-02;Jeu de Maillots Compétition;20;Neuf;Armoire B;800 €`;
    }

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSaveSuccess(`Export CSV téléchargé : ${filename}`);
    setTimeout(() => setSaveSuccess(""), 3000);
  };

  // Handler: Create Instant Snapshot
  const handleCreateSnapshot = () => {
    const nowStr = new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
    const newSnap: AppSnapshotItem = {
      id: `snap-${Date.now()}`,
      timestamp: `${nowStr.replace(",", " à")}`,
      label: `Point manuel (${stats.members} membres, ${stats.transactions} écritures)`,
      membersCount: stats.members,
      transactionsCount: stats.transactions,
      sizeKb: Math.round(100 + Math.random() * 40)
    };

    const updated = [newSnap, ...snapshots].slice(0, 5);
    setSnapshots(updated);
    localStorage.setItem("appass_snapshots_list", JSON.stringify(updated));
    setSaveSuccess("Nouveau point de restauration instantané créé !");
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  // Handler: Run Diagnostic Audit & Integrity Check
  const handleRunDiagnostic = () => {
    setIsDiagnosticRunning(true);
    setTimeout(() => {
      const metrics = getDatabaseMetrics();
      setDbMetrics(metrics);

      const report = runDatabaseIntegrityCheck();
      setIntegrityReport(report);

      const nowStr = new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
      setDiagnosticReport({
        schemaValid: report.errorsCount === 0,
        storageSizeKb: metrics.totalUsedKb,
        indexedMembers: stats.members || 42,
        orphanCheck: report.totalIssuesCount,
        unbalancedEntries: 0,
        auditTimestamp: nowStr.replace(",", " à")
      });
      setIsDiagnosticRunning(false);
    }, 400);
  };

  const handleRepairIntegrity = () => {
    const res = repairDatabaseIntegrity();
    setDbMetrics(getDatabaseMetrics());
    const report = runDatabaseIntegrityCheck();
    setIntegrityReport(report);
    setSaveSuccess(res.message);
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  const handleApplyPresetData = (preset: DatabasePreset) => {
    const jsonStr = JSON.stringify(preset.data);
    const success = onImportFullBackup(jsonStr);
    if (success) {
      setDbMetrics(getDatabaseMetrics());
      setSaveSuccess(`Jeu de données "${preset.name}" injecté avec succès !`);
      setPresetModal(null);
      setTimeout(() => setSaveSuccess(""), 4000);
    }
  };

  // Handler: Anonymize GDPR Data
  const handleAnonymizeDataSubmit = () => {
    if (anonymizeConfirmInput !== "ANONYMISER") return;
    const savedMembers = localStorage.getItem("appass_members");
    if (savedMembers) {
      try {
        const parsed = JSON.parse(savedMembers);
        const anonymized = parsed.map((m: any, idx: number) => ({
          ...m,
          firstName: `Membre`,
          lastName: `#${idx + 101}`,
          email: `adherent${idx + 101}@anonyme.fr`,
          phone: "0600000000",
          address: "1 Rue de l'Anonymat, 75000 Paris"
        }));
        localStorage.setItem("appass_members", JSON.stringify(anonymized));
      } catch (e) {}
    }
    setIsAnonymizeModalOpen(false);
    setAnonymizeConfirmInput("");
    setSaveSuccess("Données nominatives anonymisées conformément au RGPD !");
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  // Handlers for Seasons & Fee Tiers
  const handleSwitchActiveSeason = (targetSeasonName: string) => {
    setSeason(targetSeasonName);
    setSeasonsList((prev) =>
      prev.map((s) => {
        if (s.name === targetSeasonName) {
          return { ...s, status: "active" as const };
        } else if (s.status === "active") {
          return { ...s, status: "archived" as const };
        } else {
          return s;
        }
      })
    );
    setSaveSuccess(`Saison active basculée sur : ${targetSeasonName}`);
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  const handleDuplicateNextSeason = () => {
    const lastSeason = seasonsList[seasonsList.length - 1];
    let nextStartYear = 2027;
    let nextEndYear = 2028;
    if (lastSeason && lastSeason.startDate) {
      const startY = parseInt(lastSeason.startDate.split("-")[0], 10);
      if (!isNaN(startY)) {
        nextStartYear = startY + 1;
        nextEndYear = startY + 2;
      }
    }
    const nextSeasonName = `${nextStartYear} - ${nextEndYear}`;
    const newSeason: SeasonManagementItem = {
      id: `s-${Date.now()}`,
      name: nextSeasonName,
      startDate: `${nextStartYear}-09-01`,
      endDate: `${nextEndYear}-08-31`,
      status: "planned",
      membersCount: 0,
      expectedRevenue: Math.round((lastSeason?.expectedRevenue || 25000) * 1.05)
    };
    setSeasonsList((prev) => [...prev, newSeason]);
    setSaveSuccess(`Saison planifiée ${nextSeasonName} générée automatiquement (+1 An) !`);
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  const handleDeleteSeason = (seasonId: string) => {
    const target = seasonsList.find((s) => s.id === seasonId);
    if (target?.status === "active") {
      setErrorMsg("Impossible de supprimer la saison actuellement active !");
      setTimeout(() => setErrorMsg(""), 3500);
      return;
    }
    setSeasonsList((prev) => prev.filter((s) => s.id !== seasonId));
    setSaveSuccess("Saison retirée du calendrier avec succès.");
    setTimeout(() => setSaveSuccess(""), 3000);
  };

  const handleOpenEditSeason = (s: SeasonManagementItem) => {
    setEditingSeason(s);
    setEditSeasonName(s.name);
    setEditSeasonStart(s.startDate || "");
    setEditSeasonEnd(s.endDate || "");
    setEditSeasonBudget(s.expectedRevenue?.toString() || "");
    setEditSeasonMembers(s.membersCount?.toString() || "0");
    setEditSeasonStatus(s.status);
    setIsEditSeasonModalOpen(true);
  };

  const handleSaveEditedSeasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeason || !editSeasonName.trim()) return;

    setSeasonsList((prev) =>
      prev.map((s) => {
        if (s.id === editingSeason.id) {
          return {
            ...s,
            name: editSeasonName.trim(),
            startDate: editSeasonStart,
            endDate: editSeasonEnd,
            membersCount: parseInt(editSeasonMembers, 10) || 0,
            expectedRevenue: parseFloat(editSeasonBudget) || 0,
            status: editSeasonStatus
          };
        }
        if (editSeasonStatus === "active" && s.id !== editingSeason.id && s.status === "active") {
          return { ...s, status: "archived" as const };
        }
        return s;
      })
    );

    if (editSeasonStatus === "active") {
      setSeason(editSeasonName.trim());
    }

    setIsEditSeasonModalOpen(false);
    setEditingSeason(null);
    setSaveSuccess("Mise à jour de la saison enregistrée !");
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  const handleAddSeasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeasonName.trim()) return;

    const newSeasonItem: SeasonManagementItem = {
      id: `s-${Date.now()}`,
      name: newSeasonName.trim(),
      startDate: newSeasonStart || "2026-09-01",
      endDate: newSeasonEnd || "2027-08-31",
      status: "planned",
      membersCount: 0,
      expectedRevenue: parseFloat(newSeasonBudget) || 25000
    };

    setSeasonsList((prev) => [...prev, newSeasonItem]);
    setNewSeasonName("");
    setNewSeasonStart("");
    setNewSeasonEnd("");
    setNewSeasonBudget("");
    setIsAddSeasonModalOpen(false);
    setSaveSuccess("Nouvelle saison ajoutée au calendrier !");
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  const handleOpenEditTier = (tier: FeeTierItem) => {
    setEditingTier(tier);
    setEditTierName(tier.name);
    setEditTierAmount(tier.amount.toString());
    setEditTierDesc(tier.description || "");
    setEditTierBadge(tier.badge || "");
    setIsEditTierModalOpen(true);
  };

  const handleSaveEditedTierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier || !editTierName.trim() || !editTierAmount.trim()) return;

    const updatedAmount = parseFloat(editTierAmount) || 150;
    setFeeTiers((prev) =>
      prev.map((t) =>
        t.id === editingTier.id
          ? {
              ...t,
              name: editTierName.trim(),
              amount: updatedAmount,
              description: editTierDesc.trim(),
              badge: editTierBadge.trim()
            }
          : t
      )
    );

    if (editingTier.isDefault || defaultFee === editingTier.amount.toString()) {
      setDefaultFee(updatedAmount.toString());
    }

    setIsEditTierModalOpen(false);
    setEditingTier(null);
    setSaveSuccess("Formule de cotisation mise à jour !");
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  const handleAddTierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName.trim() || !newTierAmount.trim()) return;

    const newTierItem: FeeTierItem = {
      id: `ft-${Date.now()}`,
      name: newTierName.trim(),
      amount: parseFloat(newTierAmount) || 150,
      description: newTierDesc.trim() || "Nouvelle formule de cotisation personnalisée.",
      badge: newTierBadge.trim() || "Spécial"
    };

    setFeeTiers((prev) => [...prev, newTierItem]);
    setNewTierName("");
    setNewTierAmount("");
    setNewTierDesc("");
    setNewTierBadge("");
    setIsAddTierModalOpen(false);
    setSaveSuccess("Nouvelle formule de cotisation enregistrée !");
    setTimeout(() => setSaveSuccess(""), 3500);
  };

  const handleDeleteFeeTier = (id: string) => {
    setFeeTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTogglePaymentMethod = (method: string) => {
    setAcceptedFeeMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleSetDefaultTier = (tier: FeeTierItem) => {
    setDefaultFee(tier.amount.toString());
    setFeeTiers((prev) =>
      prev.map((t) => ({ ...t, isDefault: t.id === tier.id }))
    );
    setSaveSuccess(`Montant de référence par défaut mis à jour : ${tier.amount} €`);
    setTimeout(() => setSaveSuccess(""), 3000);
  };

  const handleCopyReminderEmail = () => {
    const text = `Objet : Rappel de règlement de cotisation - ${name || "Club Omnisports"}
Bonjour {nom_adherent},

Sauf erreur ou omission de notre part, votre cotisation pour la saison ${season} (Montant : ${defaultFee} ${getCurrencySymbol(currency)}) est actuellement en attente de régularisation.

Merci de bien vouloir procéder au règlement via vos modes autorisés (${acceptedFeeMethods.join(", ")}).
IBAN du club : ${iban || "Non renseigné"} (BIC : ${bic || "N/A"})

Cordialement,
Le Bureau - ${name || "Club Omnisports"}`;

    navigator.clipboard.writeText(text);
    setCopiedReminderEmail(true);
    setTimeout(() => setCopiedReminderEmail(false), 3000);
  };

  // Status Alerts
  const [saveSuccess, setSaveSuccess] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState("");
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Veuillez importer un fichier image (PNG, JPG, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Le logo ne doit pas dépasser 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result);
        setErrorMsg("");
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Save Settings
  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveSuccess("");
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Le nom officiel de l'association ne peut pas être vide.");
      return;
    }

    if (email.trim()) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) {
        setErrorMsg(emailCheck.errorMessage || "Format d'adresse e-mail officiel invalide.");
        return;
      }
    }

    if (phone.trim()) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.isValid) {
        setErrorMsg(phoneCheck.errorMessage || "Format du numéro de téléphone du secrétariat invalide.");
        return;
      }
    }

    const updatedInfo: AssociationInfo = {
      name: name.trim(),
      slogan: slogan.trim(),
      siret: siret.trim(),
      address: address.trim(),
      email: email.trim(),
      phone: phone.trim(),
      season,
      currency,
      autoReminders,
      logo: logo || undefined,
      website: website.trim() || undefined,
      defaultFee: parseFloat(defaultFee) || 150,
      receiptHeader: receiptHeader.trim() || undefined,
      signatoryName: signatoryName.trim() || undefined,
      feeTiers,
      seasonsList,
      rna: rna.trim() || undefined,
      apeCode: apeCode.trim() || undefined,
      creationDate: creationDate.trim() || undefined,
      presidentName: presidentName.trim() || undefined,
      treasurerName: treasurerName.trim() || undefined,
      secretaryName: secretaryName.trim() || undefined,
      federationName: federationName.trim() || undefined,
      federationNumber: federationNumber.trim() || undefined,
      sportsAgreementNumber: sportsAgreementNumber.trim() || undefined,
      insuranceCompany: insuranceCompany.trim() || undefined,
      insurancePolicyNumber: insurancePolicyNumber.trim() || undefined,
      bankName: bankName.trim() || undefined,
      bankAccountHolder: bankAccountHolder.trim() || undefined,
      iban: iban.trim() || undefined,
      bic: bic.trim() || undefined
    };

    if (adminSecurityKey.trim()) {
      localStorage.setItem("appass_admin_security_key", adminSecurityKey.trim().toUpperCase());
    }

    localStorage.setItem("appass_fee_tiers", JSON.stringify(feeTiers));
    localStorage.setItem("appass_seasons_list", JSON.stringify(seasonsList));
    localStorage.setItem("appass_fee_methods", JSON.stringify(acceptedFeeMethods));
    localStorage.setItem("appass_allow_installments", JSON.stringify(allowInstallments));
    localStorage.setItem("appass_installment_months", installmentMonths.toString());
    localStorage.setItem("appass_early_bird_discount", earlyBirdDiscount.toString());
    localStorage.setItem("appass_family_discount_percent", familyDiscountPercent.toString());
    localStorage.setItem("appass_reminder_days", reminderDays.toString());
    localStorage.setItem("appass_reg_open_date", registrationOpenDate);
    localStorage.setItem("appass_reg_close_date", registrationCloseDate);

    // Document Generator LocalStorage Saves
    localStorage.setItem("appass_receipt_prefix", receiptPrefix);
    localStorage.setItem("appass_receipt_counter", receiptCounter.toString());
    localStorage.setItem("appass_include_treasurer_sig", includeTreasurerSignature.toString());
    localStorage.setItem("appass_tax_receipt_enabled", taxReceiptEnabled.toString());
    localStorage.setItem("appass_tax_deduction_percent", taxDeductionPercent.toString());
    localStorage.setItem("appass_tax_legal_notice", taxLegalNotice);
    localStorage.setItem("appass_tpl_receipt_body", receiptBodyTemplate);
    localStorage.setItem("appass_tpl_cerfa_body", cerfaBodyTemplate);
    localStorage.setItem("appass_tpl_ce_body", ceBodyTemplate);
    localStorage.setItem("appass_tpl_ag_body", agBodyTemplate);

    onUpdateAssociationInfo(updatedInfo);
    setSaveSuccess("Tous les paramètres, saisons et barèmes de cotisations ont été enregistrés avec succès !");

    setTimeout(() => {
      setSaveSuccess("");
    }, 4000);
  };

  // Handle Backup Import & Preview Modal
  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let mCount = 0;
        let tCount = 0;
        let sCount = 0;
        let eCount = 0;
        let txCount = 0;

        if (Array.isArray(parsed.members)) mCount = parsed.members.length;
        if (Array.isArray(parsed.teams)) tCount = parsed.teams.length;
        if (Array.isArray(parsed.sessions)) sCount = parsed.sessions.length;
        if (Array.isArray(parsed.equipment)) eCount = parsed.equipment.length;
        if (Array.isArray(parsed.transactions)) txCount = parsed.transactions.length;

        setRestoreCandidate({
          fileContent: content,
          fileName: file.name,
          memberCount: mCount || stats.members || 0,
          teamCount: tCount || stats.teams || 0,
          sessionCount: sCount || stats.sessions || 0,
          equipmentCount: eCount || stats.equipment || 0,
          txCount: txCount || stats.transactions || 0,
          valid: true
        });
        setIsRestoreModalOpen(true);
      } catch (err) {
        setImportStatus({
          type: "error",
          msg: "Le fichier sélectionné n'est pas un fichier JSON de sauvegarde valide."
        });
      }
    };
    reader.readAsText(file);
    if (backupInputRef.current) backupInputRef.current.value = "";
  };

  const handleConfirmRestoreCandidate = () => {
    if (!restoreCandidate) return;
    const success = onImportFullBackup(restoreCandidate.fileContent);
    if (success) {
      const nowStr = new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
      const formatted = `${nowStr.replace(",", " à")}`;
      setLastBackupDate(formatted);
      localStorage.setItem("appass_last_backup_timestamp", formatted);
      setImportStatus({
        type: "success",
        msg: "Restauration effectuée avec succès ! La base de données a été réactualisée."
      });
      setSaveSuccess("Base de données restaurée avec succès !");
      setTimeout(() => setSaveSuccess(""), 3500);
    } else {
      setImportStatus({
        type: "error",
        msg: "Échec de la restauration : le format des données n'a pas pu être validé."
      });
    }
    setIsRestoreModalOpen(false);
    setRestoreCandidate(null);
  };

  const cardStyle = `p-6 rounded-3xl border transition ${
    isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
  }`;

  const labelStyle = `block text-xs font-semibold mb-1.5 ${
    isClassic ? "text-slate-300" : "text-slate-700"
  }`;

  const inputStyle = `w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
    isClassic
      ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500"
  }`;

  return (
    <div id="settings-view" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Paramètres & Configuration
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              isClassic ? "bg-[#0d6efd]/20 text-blue-300 border border-[#0d6efd]/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}>
              {season}
            </span>
          </div>
          <p className={`text-sm ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
            Gérez l'identité administrative, l'apparence visuelle, les règles financières et la sauvegarde des données.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveSettings()}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
            isClassic
              ? "bg-[#0d6efd] text-white hover:bg-blue-700 border border-blue-400"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
          }`}
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer les paramètres</span>
        </button>
      </div>

      {/* Global Alerts */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{saveSuccess}</span>
            </div>
            <button type="button" onClick={() => setSaveSuccess("")} className="hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
            <button type="button" onClick={() => setErrorMsg("")} className="hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {importStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
              importStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                : "bg-rose-500/10 border-rose-500/30 text-rose-600"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {importStatus.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span>{importStatus.msg}</span>
            </div>
            <button type="button" onClick={() => setImportStatus(null)} className="p-1 hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Categorized Tab Navigation */}
      <div className={`p-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-1 overflow-x-auto ${
        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab("identity")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "identity"
              ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identité & Structure</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "appearance"
              ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Thème & Style</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seasons")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "seasons"
              ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Saisons & Cotisations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "documents"
              ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documents & Reçus</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("database")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "database"
              ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Sauvegardes & Données</span>
        </button>

        <button
          type="button"
          id="tab-btn-diagnostics"
          onClick={() => setActiveTab("diagnostics")}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "diagnostics"
              ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Console de Diagnostic</span>
        </button>
      </div>

      {/* 3. TAB CONTENTS */}

      {/* TAB 1: IDENTITY & STRUCTURE */}
      {activeTab === "identity" && (
        <div className="space-y-6">
          {/* Card 0: Identity Summary Badge */}
          <div className={`p-5 rounded-3xl border transition ${
            isClassic
              ? "bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border-slate-800"
              : "bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border-indigo-900/50 shadow-lg shadow-indigo-950/20"
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/95 border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-inner">
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-indigo-700" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-lg md:text-xl text-white">
                      {name || "Nom de l'Association"}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      RNA: {rna || "Non renseigné"}
                    </span>
                  </div>
                  {slogan && (
                    <p className="text-xs text-indigo-200/80 italic mt-0.5">
                      « {slogan} »
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-2 flex-wrap font-mono">
                    <span>SIRET : {siret || "Non renseigné"}</span>
                    <span>•</span>
                    <span>Présidence : {presidentName || "Non désignée"}</span>
                    <span>•</span>
                    <span>{address || "Adresse siège social"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const snippet = `=== ${name} ===\nSlogan: ${slogan}\nSIRET: ${siret}\nRNA: ${rna}\nAPE: ${apeCode}\nAdresse: ${address}\nEmail: ${email} | Tél: ${phone}\nPrésidence: ${presidentName} | Trésorerie: ${treasurerName}\nIBAN: ${iban} (BIC: ${bic} - ${bankName})`;
                    navigator.clipboard.writeText(snippet);
                    setCopiedBadge(true);
                    setTimeout(() => setCopiedBadge(false), 3000);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition flex items-center gap-2 cursor-pointer backdrop-blur-sm"
                >
                  {copiedBadge ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Identité Copiée !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-indigo-300" />
                      <span>Copier la Fiche Administrative</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 1: Identité Administrative & Immatriculation */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Immatriculation & Structure Administrative</h3>
                <p className="text-xs text-slate-400">Renseignez la dénomination officielle, le logo et les registres légaux de la structure.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Logo Upload Box */}
              <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/70 border-slate-200/80"}`}>
                <label className={labelStyle}>Logo Officiel de l'Association</label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-4 mt-2">
                  <div className="w-20 h-20 rounded-2xl border bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                    {logo ? (
                      <img src={logo} alt="Logo association" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-10 h-10 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                          isClassic
                            ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm"
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-500" />
                        Importer un logo (PNG, JPG)
                      </button>

                      {logo && (
                        <button
                          type="button"
                          onClick={() => setLogo("")}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Format recommandé : PNG fond transparent ou SVG, maximum 5 Mo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Nom officiel de la structure *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputStyle}
                    placeholder="Ex: Club Omnisports de la Vallée"
                  />
                </div>

                <div>
                  <label className={labelStyle}>Slogan ou Devise</label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className={inputStyle}
                    placeholder="Ex: Passion, Rigueur & Esprit d'équipe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelStyle}>Numéro SIRET (14 chiffres)</label>
                  <input
                    type="text"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    className={inputStyle}
                    placeholder="Ex: 123 456 789 00012"
                  />
                </div>

                <div>
                  <label className={labelStyle}>Numéro RNA (Préfecture)</label>
                  <input
                    type="text"
                    value={rna}
                    onChange={(e) => setRna(e.target.value)}
                    className={inputStyle}
                    placeholder="Ex: W751029384"
                  />
                </div>

                <div>
                  <label className={labelStyle}>Code APE / NAF</label>
                  <input
                    type="text"
                    value={apeCode}
                    onChange={(e) => setApeCode(e.target.value)}
                    className={inputStyle}
                    placeholder="Ex: 9312Z (Clubs de sport)"
                  />
                </div>

                <div>
                  <label className={labelStyle}>Date de Parution / Création</label>
                  <input
                    type="date"
                    value={creationDate}
                    onChange={(e) => setCreationDate(e.target.value)}
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Gouvernance & Organes de Direction (Bureau Officiel) */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Gouvernance & Bureau Officiel</h3>
                <p className="text-xs text-slate-400">Dirigeants légaux élus et signataires autorisés pour les actes et reçus de cotisations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelStyle}>Président(e) de l'Association</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={presidentName}
                    onChange={(e) => setPresidentName(e.target.value)}
                    className={`${inputStyle} pl-9`}
                    placeholder="Ex: Marie DUBOIS"
                  />
                </div>
              </div>

              <div>
                <label className={labelStyle}>Trésorier(e) Général(e)</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={treasurerName}
                    onChange={(e) => setTreasurerName(e.target.value)}
                    className={`${inputStyle} pl-9`}
                    placeholder="Ex: Jean-Pierre MARTIN"
                  />
                </div>
              </div>

              <div>
                <label className={labelStyle}>Secrétaire Général(e)</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={secretaryName}
                    onChange={(e) => setSecretaryName(e.target.value)}
                    className={`${inputStyle} pl-9`}
                    placeholder="Ex: Claire MOREAU"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className={labelStyle}>Signataire Officiel Apparissant sur les Reçus & Attestations</label>
              <div className="relative">
                <Edit3 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className={`${inputStyle} pl-9`}
                  placeholder="Ex: Marie DUBOIS - Présidente du Club"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Ce nom est imprimé en bas des reçus fiscaux et attestations de paiement délivrées aux adhérents.
              </p>
            </div>
          </div>

          {/* Card 3: Affiliation Fédérale & Agrément Jeunesse et Sports */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600">
                <FileBadge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Affiliation Fédérale & Assurances</h3>
                <p className="text-xs text-slate-400">Organisme de tutelle sportive, agrément Jeunesse & Sports et couverture d'assurance RC.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelStyle}>Fédération d'Affiliation</label>
                <input
                  type="text"
                  value={federationName}
                  onChange={(e) => setFederationName(e.target.value)}
                  className={inputStyle}
                  placeholder="Ex: Fédération Française de Handball (FFHB)"
                />
              </div>

              <div>
                <label className={labelStyle}>N° d'Affiliation Fédérale</label>
                <input
                  type="text"
                  value={federationNumber}
                  onChange={(e) => setFederationNumber(e.target.value)}
                  className={inputStyle}
                  placeholder="Ex: 5875042"
                />
              </div>

              <div>
                <label className={labelStyle}>N° Agrément Jeunesse & Sports / SDJES</label>
                <input
                  type="text"
                  value={sportsAgreementNumber}
                  onChange={(e) => setSportsAgreementNumber(e.target.value)}
                  className={inputStyle}
                  placeholder="Ex: APS-75-2014-88"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelStyle}>Compagnie d'Assurance Officielle</label>
                <input
                  type="text"
                  value={insuranceCompany}
                  onChange={(e) => setInsuranceCompany(e.target.value)}
                  className={inputStyle}
                  placeholder="Ex: MAIF Associations & Collectivités"
                />
              </div>

              <div>
                <label className={labelStyle}>N° de Contrat Responsabilité Civile</label>
                <input
                  type="text"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  className={inputStyle}
                  placeholder="Ex: 4820193-H"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Coordonnées de Contact & Siège Social */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Coordonnées de Contact & Siège Social</h3>
                <p className="text-xs text-slate-400">Adresse officielle et moyens de communication avec les adhérents et partenaires.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Adresse du Siège Social</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`${inputStyle} pl-9`}
                    placeholder="Ex: 12 Avenue des Sports, 75000 Paris"
                  />
                </div>
              </div>

              <div>
                <ValidatedInput
                  id="settings-input-email"
                  type="email"
                  label="Email Officiel de Contact"
                  placeholder="contact@association.fr"
                  value={email}
                  onChange={setEmail}
                  validate={(val) => validateEmail(val, false)}
                  icon={Mail}
                  theme={theme === "classic" ? "classic" : "modern"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <ValidatedInput
                  id="settings-input-phone"
                  type="tel"
                  label="Téléphone du Secrétariat"
                  placeholder="01 42 68 00 00"
                  value={phone}
                  onChange={setPhone}
                  validate={(val) => validatePhone(val, false)}
                  icon={Phone}
                  theme={theme === "classic" ? "classic" : "modern"}
                />
              </div>

              <div>
                <label className={labelStyle}>Site Web Officiel</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className={`${inputStyle} pl-9`}
                    placeholder="https://www.mon-association.fr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Coordonnées Bancaires Officielles (RIB Association) */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Coordonnées Bancaires Officielles (RIB Association)</h3>
                <p className="text-xs text-slate-400">Informations bancaires utilisées pour les virements des adhérents, subventions et appels de fonds.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Établissement Bancaire</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className={inputStyle}
                  placeholder="Ex: Crédit Mutuel, Banque Postale..."
                />
              </div>

              <div>
                <label className={labelStyle}>Titulaire du Compte (Intitulé du RIB)</label>
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  className={inputStyle}
                  placeholder="Ex: Club Omnisports de la Vallée"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-2">
                <label className={labelStyle}>IBAN (International Bank Account Number)</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className={`${inputStyle} font-mono`}
                  placeholder="Ex: FR76 1027 8021 5400 0123 4567 889"
                />
              </div>

              <div>
                <label className={labelStyle}>Code BIC / SWIFT</label>
                <input
                  type="text"
                  value={bic}
                  onChange={(e) => setBic(e.target.value)}
                  className={`${inputStyle} font-mono`}
                  placeholder="Ex: CMUTFR2PP"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Sécurité & Clé d'Activation Administration */}
          <div className={cardStyle}>
            <div className={`p-4 rounded-2xl border space-y-2 ${isClassic ? "bg-slate-950 border-slate-800" : "bg-indigo-50/50 border-indigo-200/80 dark:bg-indigo-950/20 dark:border-indigo-900/40"}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Clé d'Activation de Sécurité Création Compte Admin
                </label>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">Code Organisation</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cette clé est exigée lors de la création d'un nouveau compte administrateur sur la page de connexion pour empêcher la création non autorisée d'accès.
              </p>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={adminSecurityKey}
                  onChange={(e) => setAdminSecurityKey(e.target.value.toUpperCase())}
                  className={inputStyle}
                  placeholder="Ex: APPASS-2026"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("appass_admin_security_key", adminSecurityKey.trim().toUpperCase() || "APPASS-2026");
                    setSaveSuccess("Clé de sécurité mise à jour !");
                    setTimeout(() => setSaveSuccess(""), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition cursor-pointer"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEME & STYLE */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          {/* Studio Preview Banner */}
          <div className={`p-5 rounded-3xl border transition relative overflow-hidden ${
            isClassic
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200/80 shadow-md"
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl text-white ${currentAccent.bgClass}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Studio de Personnalisation Graphique</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${currentAccent.badgeBg}`}>
                      {currentAccent.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Aperçu dynamique en temps réel de votre interface d'administration.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectAccent("indigo");
                    handleSelectDensity("comfortable");
                    handleSelectRadius("balanced");
                    setHighContrast(false);
                    setEnableAnimations(true);
                    localStorage.setItem("appass_accent_color", "indigo");
                    localStorage.setItem("appass_ui_density", "comfortable");
                    localStorage.setItem("appass_border_radius", "balanced");
                    localStorage.setItem("appass_high_contrast", "false");
                    localStorage.setItem("appass_enable_animations", "true");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                    isClassic
                      ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Style par défaut</span>
                </button>
              </div>
            </div>

            {/* Live Interactive UI Widget Preview */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Rendu en Direct (Live Interface Sandbox)</span>
                <span className="font-mono">{theme === "classic" ? "Mode Sombre" : "Mode Clair"} • {uiDensity} • {borderRadiusStyle}</span>
              </div>

              <div className={`p-4 border transition-all ${
                theme === "classic"
                  ? "bg-slate-950/80 border-slate-800 text-slate-100"
                  : "bg-slate-50/80 border-slate-200 text-slate-900"
              } ${
                borderRadiusStyle === "subtle"
                  ? "rounded-xl"
                  : borderRadiusStyle === "rounded"
                  ? "rounded-3xl"
                  : "rounded-2xl"
              } ${highContrast ? "ring-2 ring-slate-400 dark:ring-slate-600" : ""}`}>

                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  uiDensity === "compact" ? "p-2 gap-2" : uiDensity === "spacious" ? "p-4 gap-4" : "p-3 gap-3"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${currentAccent.bgClass}`}>
                      COV
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{name || "Club Omnisports"}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${currentAccent.badgeBg}`}>
                          Cotisation à Jour
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">Saison {season} • 248 Adhérents actifs</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`px-3.5 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm ${currentAccent.bgClass} ${
                        borderRadiusStyle === "subtle"
                          ? "rounded-lg"
                          : borderRadiusStyle === "rounded"
                          ? "rounded-full"
                          : "rounded-xl"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un Adhérent</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 1: Mode d'Affichage Général */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Mode d'Affichage Général</h3>
                <p className="text-xs text-slate-400">Basculez entre le thème Épuré Moderne (Clair) et le thème Sombre Classique (Bleu nuit).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onSetTheme("modern")}
                className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                  theme === "modern"
                    ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/30 dark:bg-indigo-950/40"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">Épuré Moderne</p>
                      {theme === "modern" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">Actif</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Fond clair lumineux, typographie à haut contraste et lisibilité maximale de jour
                    </p>
                  </div>
                </div>
                {theme === "modern" && <Check className="w-5 h-5 text-indigo-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => onSetTheme("classic")}
                className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                  theme === "classic"
                    ? "border-blue-500 bg-slate-900 text-white ring-2 ring-blue-500/30"
                    : "border-slate-200 bg-slate-900/90 text-slate-200 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-white">Sombre Classique</p>
                      {theme === "classic" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">Actif</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fond bleu nuit élégant, confort visuel nocturne et faible fatigue oculaire
                    </p>
                  </div>
                </div>
                {theme === "classic" && <Check className="w-5 h-5 text-blue-400 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Card 2: Palette d'Couleurs d'Accentuation Graphique */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
                <Paintbrush className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Couleur d'Accentuation Graphique</h3>
                <p className="text-xs text-slate-400">Définissez la teinte dominante des boutons d'action, sélecteurs et badges.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {ACCENT_PRESETS.map((preset) => {
                const isSelected = accentColor === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectAccent(preset.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? `border-2 ${preset.borderClass} ${preset.ringClass} ring-2 bg-slate-50 dark:bg-slate-900`
                        : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`w-6 h-6 rounded-xl ${preset.bgClass} shadow-sm border border-white/20`} />
                      {isSelected && <Check className={`w-4 h-4 ${preset.textClass}`} />}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{preset.name}</p>
                      <span className="text-[10px] font-mono text-slate-400">{preset.hex}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Densité d'Affichage & Espacements */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Densité d'Affichage & Tableaux</h3>
                <p className="text-xs text-slate-400">Ajustez les marges et la hauteur des lignes selon votre écran.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleSelectDensity("compact")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  uiDensity === "compact"
                    ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Compact</span>
                  {uiDensity === "compact" && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hauteur de ligne réduite. Idéal pour afficher un maximum de membres sur grands écrans.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDensity("comfortable")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  uiDensity === "comfortable"
                    ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Équilibré (Standard)</span>
                  {uiDensity === "comfortable" && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Espacement standard optimisé pour la lisibilité et l'ergonomie au quotidien.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDensity("spacious")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  uiDensity === "spacious"
                    ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Aéré & Tactile</span>
                  {uiDensity === "spacious" && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Marges généreuses et zones de clics élargies pour tablettes et écrans tactiles.
                </p>
              </button>
            </div>
          </div>

          {/* Card 4: Style des Bords & Arrondis (Border Radius) */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Arrondis des Cartes & Boutons</h3>
                <p className="text-xs text-slate-400">Choisissez la courbure géométrique des conteneurs de l'interface.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleSelectRadius("subtle")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  borderRadiusStyle === "subtle"
                    ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Subtil (8px / 12px)</span>
                  {borderRadiusStyle === "subtle" && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="w-full h-8 rounded-lg bg-slate-200 dark:bg-slate-800 mb-2 border border-slate-300 dark:border-slate-700" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Angles modérés pour un style sobre et institutionnel.</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRadius("balanced")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  borderRadiusStyle === "balanced"
                    ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Harmonie (16px)</span>
                  {borderRadiusStyle === "balanced" && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="w-full h-8 rounded-2xl bg-slate-200 dark:bg-slate-800 mb-2 border border-slate-300 dark:border-slate-700" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Style équilibré s'adaptant à tous les écrans.</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRadius("rounded")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  borderRadiusStyle === "rounded"
                    ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Prononcé & Pilule (24px)</span>
                  {borderRadiusStyle === "rounded" && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="w-full h-8 rounded-full bg-slate-200 dark:bg-slate-800 mb-2 border border-slate-300 dark:border-slate-700" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Arrondis très doux et modernes type application mobile.</p>
              </button>
            </div>
          </div>

          {/* Card 5: Accessibilité & Effets Visuels */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Accessibilité & Confort Visuel</h3>
                <p className="text-xs text-slate-400">Options de contraste et comportement des animations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/80 border-slate-200/80"
              }`}>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Mode Contraste Renforcé</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Accentue les contours des conteneurs et améliore la lisibilité des textes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleHighContrast}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    highContrast ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    highContrast ? "translate-x-6 text-indigo-600" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/80 border-slate-200/80"
              }`}>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Animations & Transitions Fluides</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Active les transitions au survol et les animations d'ouverture de menus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAnimations}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    enableAnimations ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    enableAnimations ? "translate-x-6 text-indigo-600" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEASONS & FEES */}
      {activeTab === "seasons" && (
        <div className="space-y-6">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Saison Active</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{season}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Exercice en cours</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Cotisation Référence</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">{defaultFee} {getCurrencySymbol(currency)} <span className="text-xs font-normal text-slate-400">/ an</span></p>
              <span className="text-[11px] text-slate-400 block mt-1">Tarif Adulte de référence</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Formules Tarifaires</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Tag className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display text-xl font-bold text-indigo-600 dark:text-indigo-400">{feeTiers.length} Formules</p>
              <span className="text-[11px] text-slate-400 block mt-1">Grille tarifaire active</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Budget Prévu Active</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <PiggyBank className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(
                  seasonsList.find((s) => s.name === season || s.status === "active")?.expectedRevenue || 23700,
                  currency
                )}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1">Objectif recettes annuelles</span>
            </div>
          </div>

          {/* SIMULATEUR DE BUDGET & RECETTES DE COTISATION */}
          <div className={`p-5 rounded-3xl border transition-all ${
            isClassic
              ? "bg-slate-900 border-indigo-500/40 shadow-xl"
              : "bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 border-indigo-200/80 shadow-sm"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-indigo-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Simulateur de Recettes & Budget Prévisionnel</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                      Calculateur interactif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Simulez la répartition d'adhérents par formule pour évaluer le chiffre d'affaires prévisionnel de la saison.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const simulatedTotal = feeTiers.reduce((acc, tier) => acc + (tier.amount * (simulatorCounts[tier.id] || 0)), 0);
                  const totalMembers = Object.values(simulatorCounts).reduce((a, b) => a + (b || 0), 0);
                  setSeasonsList((prev) =>
                    prev.map((s) => {
                      if (s.name === season || s.status === "active") {
                        return {
                          ...s,
                          membersCount: totalMembers,
                          expectedRevenue: simulatedTotal
                        };
                      }
                      return s;
                    })
                  );
                  setSaveSuccess(`Budget prévisionnel (${formatCurrency(simulatedTotal, currency)}) appliqué à la saison active !`);
                  setTimeout(() => setSaveSuccess(""), 3500);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0 self-start sm:self-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Appliquer à la saison active</span>
              </button>
            </div>

            {/* Inputs grid per fee tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {feeTiers.map((tier) => {
                const count = simulatorCounts[tier.id] ?? 20;
                const subtotal = tier.amount * count;
                return (
                  <div
                    key={tier.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      isClassic ? "bg-slate-950 border-slate-800" : "bg-white/80 border-slate-200/80 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate pr-2">{tier.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                        {tier.amount} {getCurrencySymbol(currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Adhérents :</span>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={count}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setSimulatorCounts((prev) => ({ ...prev, [tier.id]: val }));
                          }}
                          className={`w-20 px-2.5 py-1 rounded-lg text-xs font-bold border font-mono text-center outline-none ${
                            isClassic
                              ? "bg-slate-900 border-slate-700 text-white"
                              : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(subtotal, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Bar */}
            {(() => {
              const totalRevenue = feeTiers.reduce((acc, tier) => acc + (tier.amount * (simulatorCounts[tier.id] || 0)), 0);
              const totalMembers = Object.values(simulatorCounts).reduce((a, b) => a + (b || 0), 0);
              return (
                <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  isClassic ? "bg-slate-950/80 border-slate-800" : "bg-indigo-900 text-white border-indigo-800 shadow-md"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Total Répartition Simulée : <span className="font-mono text-amber-300">{totalMembers} Adhérents</span></p>
                      <p className="text-[11px] opacity-80">Chiffre d'affaires annuel prévisionnel estimé</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs opacity-80 block">Recettes Totales Simulées</span>
                    <span className="text-2xl font-black font-mono text-amber-300">
                      {formatCurrency(totalRevenue, currency)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* SECTION 1: SEASONS MANAGEMENT */}
          <div className={cardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Gestionnaire des Exercices & Saisons</h3>
                  <p className="text-xs text-slate-400">Configurez le calendrier des saisons passées, en cours et futures de l'association.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDuplicateNextSeason}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                    isClassic
                      ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                  title="Créer automatiquement la saison suivante (+1 an)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Saison Suivante (+1 An)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddSeasonModalOpen(true)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                    isClassic
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                      : "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Planifier une saison</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {seasonsList.map((s) => {
                const isActive = s.name === season || s.status === "active";
                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                      isActive
                        ? isClassic
                          ? "bg-slate-950 border-amber-500/60 ring-2 ring-amber-500/20"
                          : "bg-amber-50/40 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800 ring-2 ring-amber-500/20"
                        : isClassic
                        ? "bg-slate-950 border-slate-800 hover:border-slate-700"
                        : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display font-bold text-lg text-slate-900 dark:text-white">{s.name}</span>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                            Saison Actuelle
                          </span>
                        )}
                        {!isActive && s.status === "archived" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Archivée
                          </span>
                        )}
                        {!isActive && s.status === "planned" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            Planifiée
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Du {s.startDate} au {s.endDate}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{s.membersCount ?? 0} Adhérents enregistrés</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {formatCurrency(s.expectedRevenue || 0, currency)}
                      </span>

                      <div className="flex items-center gap-1">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSwitchActiveSeason(s.name)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <span>Activer</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditSeason(s)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Modifier les détails de cette saison"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {!isActive && seasonsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSeason(s.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Supprimer cette saison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inscriptions Window Parameters */}
            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/70 border-slate-200/80"}`}>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> Période d'Ouverture des Adhésions & Inscriptions en Ligne
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Ouverture officielle des Ré-inscriptions</label>
                  <input
                    type="date"
                    value={registrationOpenDate}
                    onChange={(e) => setRegistrationOpenDate(e.target.value)}
                    className={inputStyle}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Date à partir de laquelle le formulaire d'inscription en ligne accepte les dossiers.
                  </span>
                </div>

                <div>
                  <label className={labelStyle}>Clôture des Dossiers de Cotisation</label>
                  <input
                    type="date"
                    value={registrationCloseDate}
                    onChange={(e) => setRegistrationCloseDate(e.target.value)}
                    className={inputStyle}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Date limite pour l'application du tarif normal sans pénalité de retard.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: FEE TIERS & BARÈMES */}
          <div className={cardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Grille Tarifaire & Formules de Cotisation</h3>
                  <p className="text-xs text-slate-400">Définissez les différentes catégories de cotisations proposées aux adhérents.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddTierModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                  isClassic
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Créer une formule</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {feeTiers.map((tier) => {
                const isRef = defaultFee === tier.amount.toString() || tier.isDefault;
                return (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      isRef
                        ? isClassic
                          ? "bg-slate-950 border-indigo-500/60 ring-2 ring-indigo-500/20"
                          : "bg-indigo-50/40 border-indigo-300 dark:bg-indigo-950/20 dark:border-indigo-800 ring-2 ring-indigo-500/20"
                        : isClassic
                        ? "bg-slate-950 border-slate-800 hover:border-slate-700"
                        : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white block">{tier.name}</span>
                          {tier.badge && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              {tier.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-display font-extrabold text-lg text-indigo-600 dark:text-indigo-400 block">
                            {tier.amount} {getCurrencySymbol(currency)}
                          </span>
                          <span className="text-[10px] text-slate-400">/ an</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                        {tier.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                      {isRef ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tarif Référence
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultTier(tier)}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                        >
                          Définir comme référence
                        </button>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTier(tier)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Modifier cette formule"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {!isRef && feeTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFeeTier(tier.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Supprimer cette formule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={labelStyle}>Cotisation Annuelle de Référence par défaut (€) *</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={defaultFee}
                  onChange={(e) => setDefaultFee(e.target.value)}
                  className={inputStyle}
                  placeholder="150"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Montant pré-rempli lors de la saisie d'un nouveau membre.
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: PAYMENT CONDITIONS & DISCOUNTS */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Modalités d'Encaissement & Échéanciers</h3>
                <p className="text-xs text-slate-400">Définissez les modes de règlement acceptés et les règles d'échelonnement.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Accepted Payment Methods */}
              <div>
                <label className={labelStyle}>Modes de Règlement Autorisés pour les Cotisations</label>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {["Carte CB", "Virement", "Chèque", "Espèces", "Pass'Sport / ANCV", "Coupons Sport", "Prélèvement SEPA"].map((method) => {
                    const isChecked = acceptedFeeMethods.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleTogglePaymentMethod(method)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                          isChecked
                            ? isClassic
                              ? "bg-[#0d6efd] text-white border-blue-400 shadow-sm"
                              : "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : isClassic
                            ? "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                        <span>{method}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Installment Options */}
              <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/70 border-slate-200/80"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowInstallments}
                      onChange={(e) => setAllowInstallments(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Facilités de Paiement en Plusieurs Fois sans Frais
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Autoriser le découpage des cotisations en plusieurs prélèvements ou chèques différés.
                      </span>
                    </div>
                  </label>

                  {allowInstallments && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500">Nombre d'échéances :</span>
                      <select
                        value={installmentMonths}
                        onChange={(e) => setInstallmentMonths(parseInt(e.target.value, 10))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${inputStyle}`}
                      >
                        <option value={2}>2 mensualités (50% / 50%)</option>
                        <option value={3}>3 mensualités (Classique)</option>
                        <option value={4}>4 mensualités</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Simulated Schedule */}
                {allowInstallments && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Échéancier indicatif pour un tarif de {defaultFee} {getCurrencySymbol(currency)} :
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                      {Array.from({ length: installmentMonths }).map((_, idx) => {
                        const amountPerInst = Math.round((parseFloat(defaultFee) || 150) / installmentMonths);
                        return (
                          <div key={idx} className="p-2 rounded-xl bg-white dark:bg-slate-900 border text-center">
                            <span className="text-[10px] text-slate-400 block">Échéance {idx + 1} ({idx === 0 ? "À l'inscription" : `M+${idx}`})</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{amountPerInst} {getCurrencySymbol(currency)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Discounts & Advantages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Remise Inscription Précoce ("Early Bird") (€)</label>
                  <div className="relative">
                    <BadgePercent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      min="0"
                      value={earlyBirdDiscount}
                      onChange={(e) => setEarlyBirdDiscount(parseFloat(e.target.value) || 0)}
                      className={`${inputStyle} pl-9`}
                      placeholder="10"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Réduction forfaitaire appliquée pour tout dossier validé avant le 30 septembre.
                  </span>
                </div>

                <div>
                  <label className={labelStyle}>Réduction Famille Nombreuse (%)</label>
                  <div className="relative">
                    <BadgePercent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={familyDiscountPercent}
                      onChange={(e) => setFamilyDiscountPercent(parseFloat(e.target.value) || 0)}
                      className={`${inputStyle} pl-9`}
                      placeholder="15"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Pourcentage de remise applicable à partir du 2ème membre inscrit du même foyer.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: RECOVERY & AUTO REMINDERS */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Politique de Relance & Recouvrement des Impayés</h3>
                <p className="text-xs text-slate-400">Automatisez le suivi et les rappels pour les cotisations en retard.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoReminders}
                      onChange={(e) => setAutoReminders(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Alertes Automatiques sur le Tableau de Bord
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Signale les membres n'ayant pas soldé leur cotisation dans les délais.
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className={labelStyle}>Délai avant première relance (en jours)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={reminderDays}
                    onChange={(e) => setReminderDays(parseInt(e.target.value, 10) || 15)}
                    className={inputStyle}
                    placeholder="15"
                  />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/70 border-slate-200/80"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-500" /> Modèle d'Alerte de Relance Générée
                  </h4>

                  <button
                    type="button"
                    onClick={handleCopyReminderEmail}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedReminderEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReminderEmail ? "Modèle copié !" : "Copier le modèle"}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white text-slate-800 border text-[11px] space-y-1 font-mono leading-relaxed">
                  <p className="font-bold text-slate-900">Objet : Rappel de règlement de cotisation - {name || "Club Omnisports"}</p>
                  <p className="text-slate-600 mt-1">
                    Bonjour <span className="text-indigo-600 font-bold">&#123;nom_adherent&#125;</span>, sauf erreur ou omission de notre part, votre cotisation pour la saison {season} (Montant : {defaultFee} {getCurrencySymbol(currency)}) est actuellement en attente de régularisation.
                  </p>
                  <p className="text-slate-500 italic mt-2 border-t pt-1">
                    Merci de bien vouloir procéder au règlement via vos modes autorisés ({acceptedFeeMethods.join(", ")}). IBAN : {iban || "Non renseigné"}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTS & RECEIPTS */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* TOP METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">N° Reçu Séquentiel Active</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <FileBadge className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {receiptPrefix}{receiptCounter.toString().padStart(4, "0")}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1">Séquence de numérotation automatique</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Reçu Fiscal CERFA</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {taxReceiptEnabled ? `${taxDeductionPercent}% Déduction` : "Désactivé"}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1">Art. 200 & 238 bis du CGI</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Signataire Habilité</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display text-base font-bold text-slate-900 dark:text-white truncate">
                {signatoryName || "Non spécifié"}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1">Présidence du club</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Co-Signature Trésorerie</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display text-base font-bold text-purple-600 dark:text-purple-400 truncate">
                {includeTreasurerSignature ? (treasurerName || "Trésorier") : "Désactivée"}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1">{includeTreasurerSignature ? "Double validation sur reçu" : "Signature unique"}</span>
            </div>
          </div>

          {/* SECTION 1: RECEIPT GENERATOR CONFIG & NUMERATION */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Configuration du Générateur de Reçus & Numérotation</h3>
                <p className="text-xs text-slate-400">Définissez la structure des identifiants et les signataires habilités pour les justificatifs.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelStyle}>Préfixe de Numérotation Séquentielle des Reçus</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={receiptPrefix}
                    onChange={(e) => setReceiptPrefix(e.target.value)}
                    className={`${inputStyle} pl-9 font-mono`}
                    placeholder="REC-2026-"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Exemple généré : <span className="font-mono text-indigo-600 font-bold">{receiptPrefix}{receiptCounter.toString().padStart(4, "0")}</span>
                </span>
              </div>

              <div>
                <label className={labelStyle}>N° Séquentiel de Départ / Prochain Compteur</label>
                <div className="relative">
                  <Calculator className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="1"
                    value={receiptCounter}
                    onChange={(e) => setReceiptCounter(parseInt(e.target.value, 10) || 1)}
                    className={`${inputStyle} pl-9 font-mono`}
                    placeholder="101"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Incrémenté automatiquement à chaque émission officielle de reçu.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelStyle}>Nom & Qualité du Signataire Habilité (Présidence) *</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className={`${inputStyle} pl-9`}
                    placeholder="Ex: Marie DUBOIS - Présidente du Club"
                  />
                </div>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTreasurerSignature}
                    onChange={(e) => setIncludeTreasurerSignature(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Exiger la Co-Signature du Trésorier
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Affiche l'emplacement pour la signature de {treasurerName || "Jean-Pierre MARTIN (Trésorier)"} en bas de reçu.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Mentions Légales & Pied de Page des Attestations Officiels</label>
              <textarea
                rows={2}
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className={inputStyle}
                placeholder="Indiquez la mention légale..."
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Texte légal affiché au bas de tous les reçus de cotisation, attestations de présence et fiches de paie/reçus.
              </span>
            </div>
          </div>

          {/* SECTION 2: CERFA 11580*05 & TAX DEDUCTIONS */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Agrément Reçus Fiscaux pour Dons & Mécénat (CERFA n° 11580*05)</h3>
                <p className="text-xs text-slate-400">Générez automatiquement des reçus fiscaux conformes pour les dons de bienfaiteurs et mécènes.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-950 border-slate-800" : "bg-emerald-50/50 border-emerald-200/80"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taxReceiptEnabled}
                      onChange={(e) => setTaxReceiptEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Activer la Délivrance de Reçus Fiscaux pour Dons & Mécénat
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Permet de créer des attestations Cerfa déductibles des impôts sur le revenu ou impôts sur les sociétés.
                      </span>
                    </div>
                  </label>

                  {taxReceiptEnabled && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                      Éligible Mécénat Loi 1901
                    </span>
                  )}
                </div>
              </div>

              {taxReceiptEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className={labelStyle}>Taux de Réduction d'Impôt Réglementaire</label>
                    <select
                      value={taxDeductionPercent}
                      onChange={(e) => setTaxDeductionPercent(parseInt(e.target.value, 10))}
                      className={inputStyle}
                    >
                      <option value={66}>66% pour les Particuliers (Article 200 du CGI)</option>
                      <option value={60}>60% pour les Entreprises / Mécénat (Article 238 bis du CGI)</option>
                      <option value={75}>75% Organisme d'Aide aux Personnes (Coluche / Réductions Spéciales)</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Notice Légale & Article de Loi sur le Cerfa</label>
                    <input
                      type="text"
                      value={taxLegalNotice}
                      onChange={(e) => setTaxLegalNotice(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: TEMPLATE EDITOR STUDIO */}
          <div className={cardStyle}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Éditeur de Modèles & Clauses Personnalisables</h3>
                  <p className="text-xs text-slate-400">Personnalisez le corps du texte pour chaque type de document officiel émis par l'association.</p>
                </div>
              </div>
            </div>

            {/* Template Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: "receipt", label: "Reçu de Cotisation", icon: Receipt },
                { id: "cerfa", label: "Reçu Fiscal CERFA", icon: Award },
                { id: "ce", label: "Attestation CE / CSE", icon: Briefcase },
                { id: "ag", label: "Convocation AG & Pouvoir", icon: Landmark },
              ].map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedDocTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedDocTemplate(tpl.id as any);
                      setActivePreviewDoc(tpl.id as any);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                      isSelected
                        ? isClassic
                          ? "bg-[#0d6efd] text-white border-blue-400 shadow-sm"
                          : "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : isClassic
                        ? "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tpl.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Tags Toolbar */}
            <div className={`p-3 rounded-2xl border mb-3 ${isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Cliquer sur une balise pour l'insérer dans le texte du modèle :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "{nom_adherent}",
                  "{montant}",
                  "{saison}",
                  "{nom_association}",
                  "{siret}",
                  "{rna}",
                  "{mode_reglement}",
                  "{n_licence}",
                  "{signataire}",
                  "{taux_deduction}"
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (selectedDocTemplate === "receipt") setReceiptBodyTemplate((prev) => prev + " " + tag);
                      if (selectedDocTemplate === "cerfa") setCerfaBodyTemplate((prev) => prev + " " + tag);
                      if (selectedDocTemplate === "ce") setCeBodyTemplate((prev) => prev + " " + tag);
                      if (selectedDocTemplate === "ag") setAgBodyTemplate((prev) => prev + " " + tag);
                    }}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Template Textarea */}
            <div>
              <label className={labelStyle}>
                Texte explicatif du modèle : <span className="text-indigo-600 font-bold uppercase">{selectedDocTemplate}</span>
              </label>
              <textarea
                rows={4}
                value={
                  selectedDocTemplate === "receipt"
                    ? receiptBodyTemplate
                    : selectedDocTemplate === "cerfa"
                    ? cerfaBodyTemplate
                    : selectedDocTemplate === "ce"
                    ? ceBodyTemplate
                    : agBodyTemplate
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (selectedDocTemplate === "receipt") setReceiptBodyTemplate(val);
                  if (selectedDocTemplate === "cerfa") setCerfaBodyTemplate(val);
                  if (selectedDocTemplate === "ce") setCeBodyTemplate(val);
                  if (selectedDocTemplate === "ag") setAgBodyTemplate(val);
                }}
                className={`${inputStyle} font-mono text-xs`}
                placeholder="Rédigez le texte officiel avec les variables..."
              />
            </div>
          </div>

          {/* SECTION 4: LIVE INTERACTIVE DOCUMENT INSPECTOR & PRINT */}
          <div className={`p-6 rounded-3xl border transition-all ${
            isClassic
              ? "bg-slate-900 border-indigo-500/40 shadow-xl"
              : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 border-slate-200/90 shadow-sm"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Studio de Prévisualisation & Génération PDF</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                      Rendu Officiel
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Visualisez et imprimez en direct le feuillet officiel mis à jour avec vos données actuelles.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const templateText =
                      activePreviewDoc === "receipt"
                        ? receiptBodyTemplate
                        : activePreviewDoc === "cerfa"
                        ? cerfaBodyTemplate
                        : activePreviewDoc === "ce"
                        ? ceBodyTemplate
                        : agBodyTemplate;

                    const formatted = templateText
                      .replace(/\{nom_adherent\}/g, sampleMemberName)
                      .replace(/\{montant\}/g, `${sampleAmount} ${getCurrencySymbol(currency)}`)
                      .replace(/\{saison\}/g, season)
                      .replace(/\{nom_association\}/g, name || "Club Omnisports")
                      .replace(/\{siret\}/g, siret || "Non renseigné")
                      .replace(/\{rna\}/g, rna || "Non renseigné")
                      .replace(/\{mode_reglement\}/g, acceptedFeeMethods[0] || "CB / Virement")
                      .replace(/\{n_licence\}/g, `${federationNumber || "LIC"}-7589`)
                      .replace(/\{signataire\}/g, signatoryName)
                      .replace(/\{taux_deduction\}/g, `${taxDeductionPercent}`);

                    navigator.clipboard.writeText(formatted);
                    setCopiedDocText(true);
                    setTimeout(() => setCopiedDocText(false), 2500);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  {copiedDocText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDocText ? "Texte copié !" : "Copier le texte"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le document</span>
                </button>
              </div>
            </div>

            {/* Preview Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Nom du Membre (Test) :</label>
                <input
                  type="text"
                  value={sampleMemberName}
                  onChange={(e) => setSampleMemberName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold border outline-none ${
                    isClassic ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Montant ({getCurrencySymbol(currency)}) :</label>
                <input
                  type="number"
                  value={sampleAmount}
                  onChange={(e) => setSampleAmount(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold border outline-none ${
                    isClassic ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Date d'Émission :</label>
                <input
                  type="date"
                  value={sampleDate}
                  onChange={(e) => setSampleDate(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold border outline-none ${
                    isClassic ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {/* OFFICIAL SHEET RENDERER */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-lg font-sans space-y-6 relative overflow-hidden">
              {/* Official Stamp Watermark */}
              <div className="absolute right-6 top-6 opacity-10 pointer-events-none select-none text-right">
                <Landmark className="w-32 h-32 text-indigo-900" />
              </div>

              {/* Header section with Logo & Assoc info */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                <div className="flex items-center gap-3">
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-14 h-14 object-contain rounded-xl border p-1" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                      {name.substring(0, 2).toUpperCase() || "AS"}
                    </div>
                  )}
                  <div>
                    <h2 className="font-extrabold text-lg uppercase tracking-tight text-slate-900">{name || "Nom Association"}</h2>
                    <p className="text-xs text-slate-600 font-medium">{slogan || "Association sportive et culturelle loi 1901"}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      SIRET : <span className="font-mono font-bold">{siret || "W751029384"}</span> | RNA : <span className="font-mono font-bold">{rna || "W751029384"}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="px-3 py-1 rounded-md text-xs font-extrabold font-mono bg-slate-900 text-white inline-block mb-1">
                    {receiptPrefix}{receiptCounter.toString().padStart(4, "0")}
                  </span>
                  <p className="text-[11px] text-slate-500">Saison sportive : <span className="font-bold">{season}</span></p>
                  <p className="text-[11px] text-slate-500">Fait à {address ? address.split(",")[1] || address : "Paris"}, le {sampleDate}</p>
                </div>
              </div>

              {/* Document Title Banner */}
              <div className="text-center py-2 px-4 rounded-xl bg-slate-100 border border-slate-300">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                  {activePreviewDoc === "receipt" && "Attestation de Paiement & Récépissé de Cotisation"}
                  {activePreviewDoc === "cerfa" && "Reçu Fiscal pour Dons & Mécénat - CERFA N° 11580*05"}
                  {activePreviewDoc === "ce" && "Attestation de Licencié pour Comité d'Entreprise (CSE)"}
                  {activePreviewDoc === "ag" && "Convocation Officielle à l'Assemblée Générale"}
                </h3>
              </div>

              {/* Key Beneficiary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">ADHÉRENT / BÉNÉFICIAIRE :</span>
                  <span className="font-extrabold text-slate-900 text-sm">{sampleMemberName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">MONTANT RÉGLÉ :</span>
                  <span className="font-black text-indigo-700 text-sm font-mono">{sampleAmount} {getCurrencySymbol(currency)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">MODE DE RÈGLEMENT :</span>
                  <span className="font-bold text-slate-800">{acceptedFeeMethods[0] || "Carte CB / Virement"}</span>
                </div>
              </div>

              {/* Substituted Body Content */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-serif">
                {(() => {
                  const templateText =
                    activePreviewDoc === "receipt"
                      ? receiptBodyTemplate
                      : activePreviewDoc === "cerfa"
                      ? cerfaBodyTemplate
                      : activePreviewDoc === "ce"
                      ? ceBodyTemplate
                      : agBodyTemplate;

                  return templateText
                    .replace(/\{nom_adherent\}/g, sampleMemberName)
                    .replace(/\{montant\}/g, `${sampleAmount} ${getCurrencySymbol(currency)}`)
                    .replace(/\{saison\}/g, season)
                    .replace(/\{nom_association\}/g, name || "Club Omnisports")
                    .replace(/\{siret\}/g, siret || "Non renseigné")
                    .replace(/\{rna\}/g, rna || "Non renseigné")
                    .replace(/\{mode_reglement\}/g, acceptedFeeMethods[0] || "CB / Virement")
                    .replace(/\{n_licence\}/g, `${federationNumber || "LIC"}-7589`)
                    .replace(/\{signataire\}/g, signatoryName)
                    .replace(/\{taux_deduction\}/g, `${taxDeductionPercent}`);
                })()}
              </div>

              {/* Tax Deduction Banner for Cerfa */}
              {activePreviewDoc === "cerfa" && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Déduction Fiscale de {taxDeductionPercent}% pour le donateur</p>
                    <p className="text-[11px] text-emerald-700">{taxLegalNotice}</p>
                  </div>
                </div>
              )}

              {/* Signatures Footer */}
              <div className="pt-4 border-t border-slate-300 flex items-start justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Mentions Obligatoires :</p>
                  <p className="text-[10px] text-slate-500 max-w-sm italic leading-tight mt-0.5">
                    {receiptHeader || "Association à but non lucratif régie par la loi du 1er juillet 1901."}
                  </p>
                </div>

                <div className="flex gap-8 text-right">
                  {includeTreasurerSignature && (
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Le Trésorier :</p>
                      <p className="font-bold text-slate-800 mt-1">{treasurerName || "Jean-Pierre MARTIN"}</p>
                      <div className="h-10 mt-1 border-b border-dashed border-slate-300 flex items-end justify-center">
                        <span className="text-[9px] text-slate-300 italic">[Visa Trésorerie]</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Pour le Bureau Dirigeant :</p>
                    <p className="font-bold text-slate-900 mt-1">{signatoryName}</p>
                    <div className="h-10 mt-1 border-b border-dashed border-slate-300 flex items-end justify-center">
                      <span className="text-[9px] text-slate-300 italic">[Tampon & Signature]</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE & BACKUP MANAGEMENT */}
      {activeTab === "database" && (
        <div className="space-y-6">
          {/* Top Storage Meter & System Status */}
          <div className={cardStyle}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Studio de Gestion & Moteur de Base de Données</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LocalStorage v2.5
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Monitoring des quotas, audit d'intégrité, inspecteur de tables et injection de thèmes démo.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Explorer & Auto Backup & Diagnostics */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("diagnostics")}
                  className="px-3.5 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  Console Diagnostic
                </button>

                <button
                  type="button"
                  onClick={() => setIsExplorerOpen(true)}
                  className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Table className="w-4 h-4" />
                  Inspecteur de Tables JSON
                </button>

                <div className={`px-3 py-2 rounded-2xl border text-xs flex items-center gap-2 ${
                  isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block leading-none">Dernier Export</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{lastBackupDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LocalStorage Quota Usage Visualizer */}
            <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                  Volume de Données Occupé en Mémoire
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {dbMetrics.totalUsedKb} Ko / ~5 000 Ko ({dbMetrics.usagePercent}%)
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${Math.max(3, dbMetrics.usagePercent)}%` }}
                />
              </div>

              {/* Table breakdown pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                {dbMetrics.tables.map((tbl) => (
                  <div key={tbl.id} className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-2xs">
                    <span className="font-bold text-slate-900 dark:text-white">{tbl.name}:</span>
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{tbl.recordCount} r.</span>
                    <span className="text-[10px] text-slate-400">({tbl.sizeKb} Ko)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Entity Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isClassic ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200/80 shadow-2xs"}`}>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Membres</span>
                  <span className="text-lg font-extrabold font-display text-indigo-600">{stats.members}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isClassic ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200/80 shadow-2xs"}`}>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Équipes</span>
                  <span className="text-lg font-extrabold font-display text-blue-600">{stats.teams}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isClassic ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200/80 shadow-2xs"}`}>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Séances</span>
                  <span className="text-lg font-extrabold font-display text-amber-600">{stats.sessions}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isClassic ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200/80 shadow-2xs"}`}>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Matériel</span>
                  <span className="text-lg font-extrabold font-display text-emerald-600">{stats.equipment}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isClassic ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200/80 shadow-2xs"}`}>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Écritures</span>
                  <span className="text-lg font-extrabold font-display text-rose-600">{stats.transactions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Database Quality Score & Vacuum Optimizer */}
          <div className={cardStyle}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 font-extrabold text-lg flex items-center justify-center">
                  {dbQuality.grade}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Indice de Qualité & Optimisation de la Base ({dbQuality.score}%)</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Grade {dbQuality.grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Mesure le niveau de complétude, de normalisation et d'intégrité des enregistrements.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleVacuumDatabase}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Optimiser & Nettoyer (Vacuum)
                </button>
              </div>
            </div>

            {/* Quality Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {dbQuality.details.map((det, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border ${isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/60 border-slate-200/80"}`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300 text-[11px] truncate">{det.label}</span>
                    <span className="font-mono text-emerald-600 font-extrabold">{det.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${det.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Realistic Data Generators for Scaling Tests */}
            <div className={`p-3.5 rounded-2xl border ${isClassic ? "bg-slate-950 border-slate-800" : "bg-indigo-50/40 border-indigo-100"}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Générateur de Données de Test en Lot</h4>
                    <p className="text-[11px] text-slate-500">Injectez des enregistrements réalistes pour tester la montée en charge et la recherche.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateMockBatch("members")}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                  >
                    +5 Membres
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateMockBatch("transactions")}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                  >
                    +5 Écritures
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateMockBatch("equipment")}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                  >
                    +5 Matériel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Theme Presets / Demo Datasets Seeder */}
          <div className={cardStyle}>
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thèmes & Jeux de Données Prédéfinis (Database Seeders)</h3>
                <p className="text-xs text-slate-400">Injectez un environnement de démonstration complet adapté à la spécialité de votre association.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DATABASE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition hover:border-purple-500/50 ${
                    isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/70 border-slate-200/80"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        {preset.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{preset.category}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{preset.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{preset.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {preset.data.members.length} memb. • {preset.data.teams.length} éq.
                    </span>
                    <button
                      type="button"
                      onClick={() => setPresetModal(preset)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Injecter ce Thème
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: Audit & Integrity Repairs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audit Diagnostic */}
            <div className={cardStyle}>
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Audit & Contrôle d'Intégrité des Données</h3>
                  <p className="text-xs text-slate-400">Détection d'identifiants orphelins, doublons et clés corrompues.</p>
                </div>
              </div>

              {integrityReport ? (
                <div className="space-y-3">
                  <div className={`p-3 rounded-2xl border text-xs ${
                    integrityReport.isHealthy
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className={`flex items-center gap-1.5 ${integrityReport.isHealthy ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                        {integrityReport.isHealthy ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {integrityReport.isHealthy ? "Base de Données Saine" : `${integrityReport.totalIssuesCount} Anomalie(s) Détectée(s)`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{integrityReport.timestamp}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {integrityReport.isHealthy
                        ? "Toutes les clés étrangères, références de membres et transactions sont parfaitement indexées."
                        : `${integrityReport.errorsCount} erreur(s) critique(s) et ${integrityReport.warningsCount} avertissement(s) à réviser.`}
                    </p>
                  </div>

                  {integrityReport.issues.length > 0 && (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {integrityReport.issues.map((iss) => (
                        <div key={iss.id} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] flex items-start gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                            iss.severity === "error" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                          }`}>
                            {iss.table}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{iss.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!integrityReport.isHealthy && (
                    <button
                      type="button"
                      onClick={handleRepairIntegrity}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Nettoyer & Réparer Automatiquement
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mb-3">
                  Aucun audit récent exécuté. Lancez l'analyse pour vérifier l'intégrité de vos enregistrements.
                </p>
              )}

              <button
                type="button"
                disabled={isDiagnosticRunning}
                onClick={handleRunDiagnostic}
                className="w-full mt-3 py-2.5 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                {isDiagnosticRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyse du Stockage en cours...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Lancer l'Audit d'Intégrité
                  </>
                )}
              </button>
            </div>

            {/* GDPR Anonymization */}
            <div className={cardStyle}>
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Conformité RGPD & Anonymisation</h3>
                  <p className="text-xs text-slate-400">Masquez les données personnelles nominatives pour démonstrations.</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Remplace automatiquement les noms, prénoms et emails des membres par des pseudonymes anonymisés (`Membre #101`), tout en préservant l'historique comptable.
              </p>

              <button
                type="button"
                onClick={() => {
                  setAnonymizeConfirmInput("");
                  setIsAnonymizeModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <Lock className="w-3.5 h-3.5" />
                Anonymiser les Données Nominatives
              </button>
            </div>
          </div>

          {/* Section: Points de Restauration Instantanés (Snapshots Local) */}
          <div className={cardStyle}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Points de Restauration Instantanés (Snapshots)</h3>
                  <p className="text-xs text-slate-400">Restaurez l'état de l'application en un clic à partir d'un point de contrôle enregistré.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateSnapshot}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Créer un Point Instantané
              </button>
            </div>

            <div className="space-y-2">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isClassic ? "bg-slate-950/60 border-slate-800" : "bg-slate-50/60 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <FileJson className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{snap.label}</p>
                      <p className="text-[11px] text-slate-400">
                        Horodatage : <span className="font-mono font-semibold">{snap.timestamp}</span> • <span className="text-indigo-600 dark:text-indigo-400 font-medium">{snap.membersCount} membres, {snap.transactionsCount} transactions</span> ({snap.sizeKb} Ko)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSaveSuccess(`Point de restauration "${snap.label}" réactivé !`);
                      setTimeout(() => setSaveSuccess(""), 3500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-indigo-600 text-[11px] font-bold transition cursor-pointer shrink-0"
                  >
                    Restaurer ce point
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Granular CSV / Excel Exports */}
          <div className={cardStyle}>
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Exportations Sélectives (CSV / Excel)</h3>
                <p className="text-xs text-slate-400">Téléchargez des extractions de données ciblées exploitables dans Excel ou Google Sheets.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/50 border-slate-200/80"
              }`}>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block mb-0.5">Annuaire Membres</span>
                  <p className="text-[11px] text-slate-500">Nom, prénom, email, téléphone, catégorie et statut.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV("members")}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  Membres (.csv)
                </button>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/50 border-slate-200/80"
              }`}>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block mb-0.5">Grand Livre Comptable</span>
                  <p className="text-[11px] text-slate-500">Dates, libellés, catégories, recettes/dépenses et règlements.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV("accounting")}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  Comptabilité (.csv)
                </button>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/50 border-slate-200/80"
              }`}>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block mb-0.5">Équipes & Planning</span>
                  <p className="text-[11px] text-slate-500">Sections, entraîneurs, créneaux et lieux d'entraînement.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV("teams")}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  Planning (.csv)
                </button>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/50 border-slate-200/80"
              }`}>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block mb-0.5">Inventaire Matériel</span>
                  <p className="text-[11px] text-slate-500">Équipements, quantités, état et emplacements de stockage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV("equipment")}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  Matériel (.csv)
                </button>
              </div>
            </div>
          </div>

          <input
            ref={backupInputRef}
            type="file"
            accept=".json"
            onChange={handleBackupFileSelect}
            className="hidden"
          />

          {/* Section: Primary Operations (Full Backup JSON, Restore, Reset) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Export Full Backup JSON */}
            <div className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-2xs"
            }`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-1">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Exporter Sauvegarde Intégrale</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Téléchargez un fichier JSON complet contenant l'ensemble de vos membres, équipes, séances, matériel et écritures comptables.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportFullBackupWithMeta}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger Sauvegarde JSON
              </button>
            </div>

            {/* Import Backup JSON */}
            <div className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-2xs"
            }`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-1">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Restaurer Fichier JSON</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Restaurez la base de données avec prévisualisation des comptes et enregistrements avant validation définitive.
                </p>
              </div>
              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Upload className="w-3.5 h-3.5" />
                Importer Sauvegarde JSON
              </button>
            </div>

            {/* Reset Application Data */}
            <div className={`p-5 rounded-3xl border border-rose-500/30 flex flex-col justify-between space-y-4 ${
              isClassic ? "bg-rose-950/20" : "bg-rose-50/50"
            }`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-rose-600 mb-1">
                  <RotateCcw className="w-4 h-4" />
                  <span>Réinitialiser Données</span>
                </div>
                <p className="text-xs text-slate-500">
                  Efface les données actuelles et réinjecte le jeu de données de démonstration initial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetConfirmInput("");
                  setIsResetModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser l'App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SYSTEM DIAGNOSTICS & ERROR LOGS CONSOLE */}
      {activeTab === "diagnostics" && (
        <DiagnosticConsole
          theme={theme}
          onRefreshData={() => {
            setDbMetrics(getDatabaseMetrics());
            setIntegrityReport(runDatabaseIntegrityCheck());
          }}
        />
      )}

      {/* MODAL: ADD NEW SEASON */}
      <AnimatePresence>
        {isAddSeasonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display text-base">Planifier une Nouvelle Saison</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddSeasonModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSeasonSubmit} className="space-y-4 mt-4">
                <div>
                  <label className={labelStyle}>Intitulé de la Saison *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 2027 - 2028"
                    value={newSeasonName}
                    onChange={(e) => setNewSeasonName(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Date de Début</label>
                    <input
                      type="date"
                      value={newSeasonStart}
                      onChange={(e) => setNewSeasonStart(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Date de Fin</label>
                    <input
                      type="date"
                      value={newSeasonEnd}
                      onChange={(e) => setNewSeasonEnd(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Objectif Budget Recettes ({getCurrencySymbol(currency)})</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newSeasonBudget}
                    onChange={(e) => setNewSeasonBudget(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddSeasonModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Enregistrer la Saison
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD NEW FEE TIER */}
      <AnimatePresence>
        {isAddTierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Tag className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display text-base">Ajouter une Formule de Cotisation</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddTierModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTierSubmit} className="space-y-4 mt-4">
                <div>
                  <label className={labelStyle}>Nom de la Formule *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Cotisation Senior Compétition"
                    value={newTierName}
                    onChange={(e) => setNewTierName(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Montant Annuel ({getCurrencySymbol(currency)}) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="180"
                      value={newTierAmount}
                      onChange={(e) => setNewTierAmount(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Badge / Libellé</label>
                    <input
                      type="text"
                      placeholder="ex: Compétition, Réduit"
                      value={newTierBadge}
                      onChange={(e) => setNewTierBadge(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Description explicative</label>
                  <textarea
                    rows={2}
                    placeholder="Description des prestations et droits inclus..."
                    value={newTierDesc}
                    onChange={(e) => setNewTierDesc(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddTierModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Créer la Formule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT EXISTING SEASON */}
      <AnimatePresence>
        {isEditSeasonModalOpen && editingSeason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display text-base">Modifier la Saison {editingSeason.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditSeasonModalOpen(false);
                    setEditingSeason(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedSeasonSubmit} className="space-y-4 mt-4">
                <div>
                  <label className={labelStyle}>Intitulé de la Saison *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 2026 - 2027"
                    value={editSeasonName}
                    onChange={(e) => setEditSeasonName(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Date de Début</label>
                    <input
                      type="date"
                      value={editSeasonStart}
                      onChange={(e) => setEditSeasonStart(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Date de Fin</label>
                    <input
                      type="date"
                      value={editSeasonEnd}
                      onChange={(e) => setEditSeasonEnd(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Statut de l'Exercice</label>
                    <select
                      value={editSeasonStatus}
                      onChange={(e) => setEditSeasonStatus(e.target.value as "active" | "planned" | "archived")}
                      className={inputStyle}
                    >
                      <option value="active">Saison Active (En cours)</option>
                      <option value="planned">Saison Planifiée</option>
                      <option value="archived">Saison Archivée</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Membres Estimés / Inscrits</label>
                    <input
                      type="number"
                      min="0"
                      value={editSeasonMembers}
                      onChange={(e) => setEditSeasonMembers(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Recettes Annuelles / Budget Prévisionnel ({getCurrencySymbol(currency)})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="25000"
                    value={editSeasonBudget}
                    onChange={(e) => setEditSeasonBudget(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditSeasonModalOpen(false);
                      setEditingSeason(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Mettre à jour la saison
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT EXISTING FEE TIER */}
      <AnimatePresence>
        {isEditTierModalOpen && editingTier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display text-base">Modifier la Formule {editingTier.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditTierModalOpen(false);
                    setEditingTier(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedTierSubmit} className="space-y-4 mt-4">
                <div>
                  <label className={labelStyle}>Nom de la Formule *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Cotisation Senior Compétition"
                    value={editTierName}
                    onChange={(e) => setEditTierName(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Montant Annuel ({getCurrencySymbol(currency)}) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="180"
                      value={editTierAmount}
                      onChange={(e) => setEditTierAmount(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Badge / Libellé</label>
                    <input
                      type="text"
                      placeholder="ex: Compétition, Réduit"
                      value={editTierBadge}
                      onChange={(e) => setEditTierBadge(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Description explicative</label>
                  <textarea
                    rows={2}
                    placeholder="Description des prestations et droits inclus..."
                    value={editTierDesc}
                    onChange={(e) => setEditTierDesc(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditTierModalOpen(false);
                      setEditingTier(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Mettre à jour la formule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PREVIEW & CONFIRM RESTORE */}
      <AnimatePresence>
        {isRestoreModalOpen && restoreCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-base">Vérification de la Sauvegarde</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{restoreCandidate.fileName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Contenu du fichier détecté :</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                  <div>• Membres : <span className="font-extrabold text-indigo-600">{restoreCandidate.memberCount}</span></div>
                  <div>• Équipes : <span className="font-extrabold text-indigo-600">{restoreCandidate.teamCount}</span></div>
                  <div>• Séances : <span className="font-extrabold text-indigo-600">{restoreCandidate.sessionCount}</span></div>
                  <div>• Matériel : <span className="font-extrabold text-indigo-600">{restoreCandidate.equipmentCount}</span></div>
                  <div>• Écritures : <span className="font-extrabold text-indigo-600">{restoreCandidate.txCount}</span></div>
                </div>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 leading-relaxed">
                ⚠️ Attention : La restauration remplacera l'ensemble de vos données actuelles par celles contenues dans ce fichier.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestoreCandidate}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Confirmer la Restauration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: GDPR ANONYMIZE CONFIRMATION */}
      <AnimatePresence>
        {isAnonymizeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3 text-purple-600">
                <div className="p-2.5 rounded-2xl bg-purple-500/10">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display">Anonymiser les données RGPD ?</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Cette opération va remplacer de manière irréversible le nom, prénom et email de tous les membres par des pseudonymes anonymes.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tapez <span className="font-mono text-purple-600 font-extrabold">ANONYMISER</span> pour confirmer :
                </label>
                <input
                  type="text"
                  value={anonymizeConfirmInput}
                  onChange={(e) => setAnonymizeConfirmInput(e.target.value)}
                  placeholder="ANONYMISER"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold outline-none uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAnonymizeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={anonymizeConfirmInput !== "ANONYMISER"}
                  onClick={handleAnonymizeDataSubmit}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow-md ${
                    anonymizeConfirmInput === "ANONYMISER"
                      ? "bg-purple-600 hover:bg-purple-500 cursor-pointer"
                      : "bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-60"
                  }`}
                >
                  Confirmer l'Anonymisation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4 ${
                isClassic ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-2xl bg-rose-500/10">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display">Réinitialiser l'application ?</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Cette action réinitialisera l'ensemble de vos données personnalisées (membres, équipes, séances, équipements et écritures comptables).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tapez <span className="font-mono text-rose-600 font-extrabold">SUPPRIMER</span> pour confirmer :
                </label>
                <input
                  type="text"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold outline-none uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={resetConfirmInput !== "SUPPRIMER"}
                  onClick={() => {
                    onResetAllData();
                    setIsResetModalOpen(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow-md ${
                    resetConfirmInput === "SUPPRIMER"
                      ? "bg-rose-600 hover:bg-rose-500 cursor-pointer"
                      : "bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-60"
                  }`}
                >
                  Confirmer la réinitialisation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: PRESET SEEDER CONFIRMATION */}
      <AnimatePresence>
        {presetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Injecter le Thème Démo ?</h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{presetModal.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPresetModal(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">Éléments inclus dans ce jeu de données :</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                  <div>• Membres : <span className="font-bold text-purple-600">{presetModal.data.members.length}</span></div>
                  <div>• Équipes : <span className="font-bold text-purple-600">{presetModal.data.teams.length}</span></div>
                  <div>• Séances : <span className="font-bold text-purple-600">{presetModal.data.sessions.length}</span></div>
                  <div>• Matériel : <span className="font-bold text-purple-600">{presetModal.data.equipment.length}</span></div>
                  <div>• Écritures : <span className="font-bold text-purple-600">{presetModal.data.transactions.length}</span></div>
                </div>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 leading-relaxed">
                ⚠️ Remarque : L'injection de ce thème remplacera vos données actuelles par les enregistrements de démonstration du thème sélectionné.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPresetModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetData(presetModal)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Appliquer ce Thème
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: JSON TABLE INSPECTOR & EXPLORER */}
      <AnimatePresence>
        {isExplorerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-4xl h-[85vh] p-6 rounded-3xl border shadow-2xl flex flex-col justify-between ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
                    <Table className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Inspecteur & Explorateur de Tables JSON</h3>
                    <p className="text-xs text-slate-400">Consultez, filtrez et vérifiez les enregistrements directement stockés en mémoire LocalStorage.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExplorerOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Table Selector Pills & Search Bar */}
              {(() => {
                const getTableData = (key: string): any[] => {
                  try {
                    const raw = localStorage.getItem(key);
                    return raw ? JSON.parse(raw) : [];
                  } catch {
                    return [];
                  }
                };

                const storedMembers = getTableData(DB_KEYS.MEMBERS);
                const storedTeams = getTableData(DB_KEYS.TEAMS);
                const storedSessions = getTableData(DB_KEYS.SESSIONS);
                const storedEquipment = getTableData(DB_KEYS.EQUIPMENT);
                const storedTransactions = getTableData(DB_KEYS.TRANSACTIONS);

                return (
                  <>
                    <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                        {(["members", "teams", "sessions", "equipment", "transactions"] as const).map((tbl) => {
                          const count = tbl === "members" ? storedMembers.length
                            : tbl === "teams" ? storedTeams.length
                            : tbl === "sessions" ? storedSessions.length
                            : tbl === "equipment" ? storedEquipment.length
                            : storedTransactions.length;

                          const label = tbl === "members" ? "Membres"
                            : tbl === "teams" ? "Équipes"
                            : tbl === "sessions" ? "Séances"
                            : tbl === "equipment" ? "Matériel"
                            : "Transactions";

                          return (
                            <button
                              key={tbl}
                              type="button"
                              onClick={() => setExplorerTable(tbl)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                explorerTable === tbl
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                              }`}
                            >
                              <span>{label}</span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${explorerTable === tbl ? "bg-indigo-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={explorerSearch}
                          onChange={(e) => setExplorerSearch(e.target.value)}
                          placeholder="Filtrer la table..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Table Data View */}
                    <div className="flex-1 overflow-auto border rounded-2xl border-slate-200 dark:border-slate-800 my-2 bg-slate-50/50 dark:bg-slate-950/50">
                      {explorerTable === "members" && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-3">ID / Licence</th>
                              <th className="p-3">Nom & Prénom</th>
                              <th className="p-3">Email</th>
                              <th className="p-3">Téléphone</th>
                              <th className="p-3">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono text-[11px]">
                            {storedMembers
                              .filter((m: any) => `${m.name || ""} ${m.email || ""} ${m.phone || ""} ${m.licenseNumber || ""}`.toLowerCase().includes(explorerSearch.toLowerCase()))
                              .map((m: any) => (
                                <tr key={m.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
                                  <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400">{m.licenseNumber || m.id?.substring(0, 8) || "N/A"}</td>
                                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{m.name || "Membre Inconnu"}</td>
                                  <td className="p-3 text-slate-500">{m.email || "-"}</td>
                                  <td className="p-3 font-sans text-slate-500">{m.phone || "-"}</td>
                                  <td className="p-3 font-sans">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                      Actif
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}

                      {explorerTable === "teams" && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-3">Équipe</th>
                              <th className="p-3">Entraîneur</th>
                              <th className="p-3">Membres</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono text-[11px]">
                            {storedTeams
                              .filter((t: any) => `${t.name || ""} ${t.coach || ""}`.toLowerCase().includes(explorerSearch.toLowerCase()))
                              .map((t: any) => (
                                <tr key={t.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
                                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{t.name || "Sans nom"}</td>
                                  <td className="p-3 font-sans text-slate-600 dark:text-slate-300">{t.coach || "Non assigné"}</td>
                                  <td className="p-3 text-slate-400">{t.memberIds?.length || 0} membre(s) rattaché(s)</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}

                      {explorerTable === "sessions" && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-3">Titre</th>
                              <th className="p-3">Date & Horaire</th>
                              <th className="p-3">Lieu</th>
                              <th className="p-3">Présents</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono text-[11px]">
                            {storedSessions
                              .filter((s: any) => `${s.title || ""} ${s.date || ""} ${s.location || ""}`.toLowerCase().includes(explorerSearch.toLowerCase()))
                              .map((s: any) => (
                                <tr key={s.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
                                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{s.title || "Séance"}</td>
                                  <td className="p-3 font-sans text-indigo-600 dark:text-indigo-400 font-medium">{s.date} ({s.time || "N/A"})</td>
                                  <td className="p-3 font-sans text-slate-500">{s.location || "Non spécifié"}</td>
                                  <td className="p-3 font-sans"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-bold">{s.attendeeIds?.length || 0} p.</span></td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}

                      {explorerTable === "equipment" && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-3">Désignation</th>
                              <th className="p-3">Catégorie</th>
                              <th className="p-3">Quantité</th>
                              <th className="p-3">État</th>
                              <th className="p-3">Emplacement</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono text-[11px]">
                            {storedEquipment
                              .filter((eq: any) => `${eq.name || ""} ${eq.category || ""} ${eq.location || ""}`.toLowerCase().includes(explorerSearch.toLowerCase()))
                              .map((eq: any) => (
                                <tr key={eq.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
                                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{eq.name || "Matériel"}</td>
                                  <td className="p-3 font-sans text-slate-500">{eq.category || "Autre"}</td>
                                  <td className="p-3 font-bold text-indigo-600">{eq.quantity || 1} ex.</td>
                                  <td className="p-3 font-sans">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                      {eq.condition || "Bon état"}
                                    </span>
                                  </td>
                                  <td className="p-3 font-sans text-slate-500">{eq.location || "-"}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}

                      {explorerTable === "transactions" && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-3">Date</th>
                              <th className="p-3">Libellé</th>
                              <th className="p-3">Type</th>
                              <th className="p-3">Montant</th>
                              <th className="p-3">Mode</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono text-[11px]">
                            {storedTransactions
                              .filter((tx: any) => `${tx.title || ""} ${tx.category || ""} ${tx.paymentMethod || ""}`.toLowerCase().includes(explorerSearch.toLowerCase()))
                              .map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
                                  <td className="p-3 text-slate-400">{tx.date || "-"}</td>
                                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{tx.title || "Opération"}</td>
                                  <td className="p-3 font-sans">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                                      {tx.type === "income" ? "Recette" : "Dépense"}
                                    </span>
                                  </td>
                                  <td className={`p-3 font-bold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                                    {tx.type === "income" ? "+" : "-"}{(tx.amount || 0).toFixed(2)} €
                                  </td>
                                  <td className="p-3 font-sans text-slate-500">{tx.paymentMethod || "-"}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <span className="font-mono">
                  Base de Données In-Memory: LocalStorage Key `appass_{explorerTable}`
                </span>
                <button
                  type="button"
                  onClick={() => setIsExplorerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  Fermer la vue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

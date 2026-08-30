import React, { useState, useMemo } from "react";
import { Transaction, Member, AppTheme } from "../types";
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from "../utils";
import { exportFinancialReportPDF } from "../lib/pdfExporter";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  CreditCard,
  User,
  Info,
  PieChart,
  Users,
  Check,
  DollarSign,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Sparkles,
  Eye,
  Receipt,
  Calendar,
  Tag,
  FileText,
  RotateCcw,
  Building2,
  Hash,
  QrCode,
  Package,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface FinancesProps {
  transactions: Transaction[];
  members: Member[];
  theme?: AppTheme;
  currency?: string;
  onAddTransaction: (item: Omit<Transaction, "id" | "createdAt">) => void;
  onUpdateTransaction: (item: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORIES: Transaction["category"][] = [
  "Cotisations",
  "Subventions",
  "Sponsor & Partenariat",
  "Équipements & Matériel",
  "Infrastructures & Salles",
  "Événements & Buvette",
  "Autre"
];

const OPERATION_PRESETS = [
  {
    label: "Cotisation Annuelle",
    icon: "💳",
    type: "income" as const,
    category: "Cotisations" as const,
    title: "Cotisation Annuelle 2026",
    amount: "150",
    paymentMethod: "Virement" as const,
    status: "Payé" as const,
    notes: "Cotisation membre licence adulte 2026"
  },
  {
    label: "Subvention Municipale",
    icon: "🏛️",
    type: "income" as const,
    category: "Subventions" as const,
    title: "Subvention Mairie d'Exploitation",
    amount: "1200",
    paymentMethod: "Virement" as const,
    status: "Payé" as const,
    notes: "Arrêté municipal d'attribution N° 2026/042"
  },
  {
    label: "Achat Ballons Decathlon",
    icon: "⚽",
    type: "expense" as const,
    category: "Équipements & Matériel" as const,
    title: "Achat Lot de 10 Ballons T5",
    amount: "280",
    paymentMethod: "Carte CB" as const,
    status: "Payé" as const,
    notes: "Facture N° DEC-98211"
  },
  {
    label: "Recette Buvette",
    icon: "🥤",
    type: "income" as const,
    category: "Événements & Buvette" as const,
    title: "Recettes Buvette - Tournoi Régional",
    amount: "450",
    paymentMethod: "Espèces" as const,
    status: "Payé" as const,
    notes: "Caisse du samedi après-midi"
  },
  {
    label: "Contrat Sponsoring",
    icon: "🤝",
    type: "income" as const,
    category: "Sponsor & Partenariat" as const,
    title: "Sponsoring Flocage Maillots",
    amount: "800",
    paymentMethod: "Virement" as const,
    status: "Payé" as const,
    notes: "Contrat de partenariat officiel saison 2026"
  },
  {
    label: "Location Gymnase",
    icon: "🏢",
    type: "expense" as const,
    category: "Infrastructures & Salles" as const,
    title: "Echéance Location Salle Municipale",
    amount: "200",
    paymentMethod: "Prélèvement" as const,
    status: "Payé" as const,
    notes: "Prélèvement mensuel Ville"
  }
];

const PAYMENT_METHODS: Transaction["paymentMethod"][] = [
  "Virement",
  "Carte CB",
  "Chèque",
  "Espèces",
  "Prélèvement"
];

const STATUSES: Transaction["status"][] = [
  "Payé",
  "En attente",
  "Annulé"
];

export const FinancesModule: React.FC<FinancesProps> = ({
  transactions,
  members,
  theme = "modern",
  currency,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const isClassic = theme === "classic";

  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<"history" | "breakdown" | "members">("history");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("Tous");
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [selectedStatus, setSelectedStatus] = useState<string>("Tous");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportPDFModalOpen, setIsExportPDFModalOpen] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("Rapport Comptable & Bilan Financier");
  const [pdfPeriodLabel, setPdfPeriodLabel] = useState("Saison 2025 - 2026");
  const [pdfIncludeSignatures, setPdfIncludeSignatures] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State & Tabs
  const [activeFormTab, setActiveFormTab] = useState<"general" | "payment" | "member" | "receipt">("general");
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<Transaction["type"]>("income");
  const [category, setCategory] = useState<Transaction["category"]>("Cotisations");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<Transaction["paymentMethod"]>("Virement");
  const [status, setStatus] = useState<Transaction["status"]>("Payé");
  const [memberId, setMemberId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const FORM_TABS = [
    { id: "general", label: "1. Type & Montant", icon: Wallet },
    { id: "payment", label: "2. Règlement & Date", icon: CreditCard },
    { id: "member", label: "3. Membre & Justificatif", icon: User },
    { id: "receipt", label: "4. Aperçu Reçu", icon: Eye }
  ];

  const completionPercent = useMemo(() => {
    let score = 0;
    if (title.trim()) score += 30;
    if (amount && parseFloat(amount) > 0) score += 30;
    if (category) score += 15;
    if (date) score += 10;
    if (paymentMethod) score += 10;
    if (status) score += 5;
    return Math.min(100, score);
  }, [title, amount, category, date, paymentMethod, status]);

  const resetForm = () => {
    setTitle("");
    setType("income");
    setCategory("Cotisations");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Virement");
    setStatus("Payé");
    setMemberId("");
    setNotes("");
    setError("");
    setEditingTransaction(null);
    setActiveFormTab("general");
    setTemplateNotice(null);
  };

  const handleApplyPreset = (preset: (typeof OPERATION_PRESETS)[0]) => {
    setType(preset.type);
    setCategory(preset.category);
    setTitle(preset.title);
    setAmount(preset.amount);
    setPaymentMethod(preset.paymentMethod);
    setStatus(preset.status);
    setNotes(preset.notes);
    setTemplateNotice(`Modèle "${preset.label}" appliqué !`);
    setTimeout(() => setTemplateNotice(null), 3000);
  };

  const handleFillDemoData = () => {
    const choice = OPERATION_PRESETS[Math.floor(Math.random() * OPERATION_PRESETS.length)];
    handleApplyPreset(choice);
    if (members.length > 0 && Math.random() > 0.4) {
      const randomMember = members[Math.floor(Math.random() * members.length)];
      setMemberId(randomMember.id);
    }
  };

  const handleOpenAdd = (prefillMemberId?: string, prefillTitle?: string) => {
    resetForm();
    if (prefillMemberId) {
      setMemberId(prefillMemberId);
      const m = members.find((mem) => mem.id === prefillMemberId);
      setTitle(prefillTitle || (m ? `Cotisation - ${m.name}` : "Cotisation Annuelle"));
      setCategory("Cotisations");
      setType("income");
      setAmount("150");
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTitle(tx.title);
    setType(tx.type);
    setCategory(tx.category);
    setAmount(tx.amount.toString());
    setDate(tx.date);
    setPaymentMethod(tx.paymentMethod);
    setStatus(tx.status);
    setMemberId(tx.memberId || "");
    setNotes(tx.notes || "");
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Le libellé de la transaction est obligatoire.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Veuillez saisir un montant valide supérieur à 0.");
      return;
    }

    if (editingTransaction) {
      onUpdateTransaction({
        ...editingTransaction,
        title: title.trim(),
        type,
        category,
        amount: parsedAmount,
        date,
        paymentMethod,
        status,
        memberId: memberId || undefined,
        notes: notes.trim() || undefined
      });
    } else {
      onAddTransaction({
        title: title.trim(),
        type,
        category,
        amount: parsedAmount,
        date,
        paymentMethod,
        status,
        memberId: memberId || undefined,
        notes: notes.trim() || undefined
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleQuickMarkAsPaid = (tx: Transaction) => {
    onUpdateTransaction({
      ...tx,
      status: "Payé"
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Titre", "Type", "Catégorie", `Montant (${getCurrencySymbol(currency)})`, "Date", "Moyen de paiement", "Statut", "Membre", "Remarques"];
    const rows = transactions.map((t) => {
      const member = t.memberId ? members.find((m) => m.id === t.memberId)?.name || "" : "";
      return [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.type === "income" ? "Recette" : "Dépense",
        `"${t.category}"`,
        t.amount.toFixed(2),
        t.date,
        t.paymentMethod,
        t.status,
        `"${member}"`,
        `"${(t.notes || "").replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finances_association_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Financial Calculations
  const paidIncome = transactions
    .filter((t) => t.type === "income" && t.status === "Payé")
    .reduce((sum, t) => sum + t.amount, 0);

  const paidExpenses = transactions
    .filter((t) => t.type === "expense" && t.status === "Payé")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = paidIncome - paidExpenses;

  const pendingIncome = transactions
    .filter((t) => t.type === "income" && t.status === "En attente")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "En attente")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseRatio = paidIncome > 0 ? Math.round((paidExpenses / paidIncome) * 100) : 0;

  // Filtered List
  const filteredTransactions = transactions.filter((t) => {
    const search = searchTerm.toLowerCase().trim();
    const memberName = t.memberId ? members.find((m) => m.id === t.memberId)?.name || "" : "";

    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search) ||
      (t.notes && t.notes.toLowerCase().includes(search)) ||
      memberName.toLowerCase().includes(search);

    const matchesType =
      selectedType === "Tous" ||
      (selectedType === "Recettes" && t.type === "income") ||
      (selectedType === "Dépenses" && t.type === "expense");

    const matchesCategory =
      selectedCategory === "Toutes" || t.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "Tous" || t.status === selectedStatus;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const formatCurrency = (val: number) => {
    return formatCurrencyUtil(val, currency);
  };

  // Category Breakdown Calculations
  const categoryStats = CATEGORIES.map((cat) => {
    const catIncomes = transactions
      .filter((t) => t.category === cat && t.type === "income" && t.status === "Payé")
      .reduce((s, t) => s + t.amount, 0);

    const catExpenses = transactions
      .filter((t) => t.category === cat && t.type === "expense" && t.status === "Payé")
      .reduce((s, t) => s + t.amount, 0);

    const count = transactions.filter((t) => t.category === cat).length;

    return {
      category: cat,
      incomes: catIncomes,
      expenses: catExpenses,
      balance: catIncomes - catExpenses,
      count
    };
  });

  return (
    <div id="finances-view" className="space-y-6">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Finances
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              isClassic ? "bg-[#0d6efd]/20 text-blue-300 border border-[#0d6efd]/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}>
              {transactions.length} écritures
            </span>
          </div>
          <p className={`text-sm ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
            Gérez le budget de l'association, contrôlez les cotisations des membres et suivez la trésorerie.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsExportPDFModalOpen(true)}
            className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs ${
              isClassic
                ? "bg-slate-800 border border-slate-700 text-emerald-400 hover:bg-slate-700"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Exporter Bilan PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className={`px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition flex items-center gap-2 border cursor-pointer ${
              isClassic
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            }`}
            title="Exporter l'historique comptable en CSV"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            id="btn-add-transaction"
            onClick={() => handleOpenAdd()}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
              isClassic
                ? "bg-[#0d6efd] text-white hover:bg-blue-700 border border-blue-400"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Saisir une opération</span>
          </button>
        </div>
      </div>

      {/* 2. Key Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde Net */}
        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Solde de Trésorerie</span>
            <Wallet className="w-4 h-4 text-indigo-500" />
          </div>
          <p className={`text-2xl font-bold font-display ${currentBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatCurrency(currentBalance)}
          </p>
          <span className="text-[10px] text-slate-400 block mt-1">Opérations encaissées</span>
        </div>

        {/* Recettes */}
        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Recettes Encaissées</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-display text-emerald-600">
            +{formatCurrency(paidIncome)}
          </p>
          <span className="text-[10px] text-slate-400 block mt-1">Cotisations, sponsors, aides</span>
        </div>

        {/* Dépenses */}
        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Dépenses Réglées</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-display text-rose-600">
            -{formatCurrency(paidExpenses)}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Ratio dépenses:</span>
            <span className="font-bold font-mono">{expenseRatio}%</span>
          </div>
        </div>

        {/* En attente */}
        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Flux En Attente</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-display text-amber-600">
            +{formatCurrency(pendingIncome)}
          </p>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold block mt-1">
            {pendingIncome > 0 ? "Cotisations / Subventions à recevoir" : "À jour"}
          </span>
        </div>
      </div>

      {/* 3. Navigation View Switcher Bar */}
      <div className={`p-4 rounded-3xl border ${
        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      } space-y-3`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* View Switcher Pills */}
          <div className={`flex items-center p-1 rounded-2xl border text-xs font-semibold w-full lg:w-auto justify-center ${
            isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200/80"
          }`}>
            <button
              type="button"
              onClick={() => setViewMode("history")}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "history"
                  ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Historique Écritures
            </button>

            <button
              type="button"
              onClick={() => setViewMode("breakdown")}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "breakdown"
                  ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" /> Ventilation & Catégories
            </button>

            <button
              type="button"
              onClick={() => setViewMode("members")}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "members"
                  ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Cotisations Membres
            </button>
          </div>

          {/* Search & Filters (for history) */}
          {viewMode === "history" && (
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrer libellé, membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full py-1.5 pl-9 pr-3 rounded-xl text-xs outline-none border transition ${
                    isClassic
                      ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                  }`}
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <option value="Tous">Tous les types</option>
                <option value="Recettes">Recettes (+)</option>
                <option value="Dépenses">Dépenses (-)</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <option value="Toutes">Toutes catégories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <option value="Tous">Tous statuts</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 4. MAIN VIEWS */}

      {/* VIEW A: TRANSACTIONS HISTORY TABLE */}
      {viewMode === "history" && (
        <div className={`rounded-3xl border overflow-hidden ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Aucune écriture comptable trouvée.</p>
              <p className="text-slate-500 mt-1">Essayez de modifier vos filtres ou de saisir une opération.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-slate-400 font-bold uppercase tracking-wider ${
                  isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Libellé</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4">Moyen</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((tx, index) => {
                      const linkedMember = tx.memberId ? members.find((m) => m.id === tx.memberId) : null;
                      const isIncome = tx.type === "income";

                      return (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0, x: -16, y: 6 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.35), ease: "easeOut" }}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="py-3 px-4 font-mono font-medium text-slate-500 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                                isIncome ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                              }`}>
                                {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">{tx.title}</span>
                                {linkedMember && (
                                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                                    <User className="w-3 h-3" /> Membre: {linkedMember.name}
                                  </span>
                                )}
                                {tx.notes && !linkedMember && (
                                  <span className="text-[10px] text-slate-400 italic block truncate max-w-xs">{tx.notes}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                            <span className="flex items-center gap-1 font-medium">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                tx.status === "Payé"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : tx.status === "En attente"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  : "bg-slate-500/10 text-slate-500 border-slate-500/30"
                              }`}>
                                {tx.status}
                              </span>
                              {tx.status === "En attente" && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickMarkAsPaid(tx)}
                                  className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                                  title="Marquer comme payé"
                                >
                                  (Valider)
                                </button>
                              )}
                            </div>
                          </td>
                          <td className={`py-3 px-4 text-right font-display font-extrabold text-sm whitespace-nowrap ${
                            isIncome ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(tx)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(tx.id)}
                                className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW B: CATEGORY BREAKDOWN & STATS */}
      {viewMode === "breakdown" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryStats.map((cat, index) => {
            const maxCategoryAmount = Math.max(...categoryStats.map((c) => Math.max(c.incomes, c.expenses)), 1);
            const incomePercent = Math.round((cat.incomes / maxCategoryAmount) * 100);
            const expensePercent = Math.round((cat.expenses / maxCategoryAmount) * 100);

            return (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, x: -16, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
                className={`p-5 rounded-3xl border space-y-3 ${
                  isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    {cat.category}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {cat.count} écriture{cat.count > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Recettes bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Recettes Encaissées</span>
                      <span className="font-bold text-emerald-600">+{formatCurrency(cat.incomes)}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${incomePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Dépenses bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Dépenses Effectuées</span>
                      <span className="font-bold text-rose-600">-{formatCurrency(cat.expenses)}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${expensePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Solde de la catégorie:</span>
                  <span className={`font-display font-extrabold ${cat.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {cat.balance >= 0 ? "+" : ""}{formatCurrency(cat.balance)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW C: MEMBERSHIP FEE TRACKER */}
      {viewMode === "members" && (
        <div className={`p-5 rounded-3xl border space-y-4 ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Suivi des Cotisations Membres
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Vérifiez quels membres sont à jour de leur cotisation annuelle.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900 self-start sm:self-auto">
              Total membres : {members.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((member, index) => {
              const memberTransactions = transactions.filter((t) => t.memberId === member.id && t.category === "Cotisations");
              const totalPaid = memberTransactions.filter((t) => t.status === "Payé").reduce((s, t) => s + t.amount, 0);
              const isPaid = totalPaid > 0;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -16, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.28, delay: Math.min(index * 0.03, 0.4), ease: "easeOut" }}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50/50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</h4>
                      <span className="text-[11px] text-slate-500 font-mono block">{member.email || member.phone || "Membre active"}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      isPaid
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    }`}>
                      {isPaid ? "Cotisation Réglée" : "Non payée"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Versé : <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(totalPaid)}</strong></span>
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => handleOpenAdd(member.id, `Cotisation - ${member.name}`)}
                        className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-500 transition cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Encaisser
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT TRANSACTION SIDE DRAWER */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`w-full max-w-xl h-full shadow-2xl flex flex-col justify-between border-l ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display leading-snug">
                        {editingTransaction ? "Modifier l'opération comptable" : "Saisir une nouvelle opération"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enregistrez une recette ou une dépense pour l'association
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFillDemoData}
                      title="Remplir automatiquement avec des données de test"
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ Démo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Completion bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">Complétude de la saisie</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{completionPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Form Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
                  {FORM_TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeFormTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFormTab(tab.id as typeof activeFormTab)}
                        className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer text-[11px] font-bold ${
                          isActive
                            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tab.label.split(". ")[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {templateNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {templateNotice}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTemplateNotice(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* TAB 1: TYPE & MONTANT */}
                {activeFormTab === "general" && (
                  <div className="space-y-5">
                    {/* Presets Quick Bar */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Modèles rapides d'opérations
                      </label>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {OPERATION_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 transition text-xs font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <span>{preset.icon}</span>
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type selection: Income / Expense */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Sens de l'opération *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setType("income")}
                          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition text-left cursor-pointer ${
                            type === "income"
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-bold"
                              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${type === "income" ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold">Recette (+)</span>
                            <span className="text-[10px] text-slate-400 block font-normal">Entrée de trésorerie</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setType("expense")}
                          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition text-left cursor-pointer ${
                            type === "expense"
                              ? "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 ring-2 ring-rose-500/20 font-bold"
                              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${type === "expense" ? "bg-rose-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                            <TrendingDown className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold">Dépense (-)</span>
                            <span className="text-[10px] text-slate-400 block font-normal">Sortie de trésorerie</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Amount & Currency */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Montant ({getCurrencySymbol(currency)}) *
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Montant net TTC
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={`w-full pl-4 pr-16 py-3.5 rounded-2xl border text-xl font-mono font-black outline-none transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                              : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold font-mono text-slate-700 dark:text-slate-200 text-sm">
                          {getCurrencySymbol(currency)}
                        </div>
                      </div>

                      {/* Quick Amount adjustments */}
                      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                        <span className="text-[10px] text-slate-400 font-semibold mr-1">Ajuster:</span>
                        {["10", "20", "50", "100", "150", "250", "500"].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold transition cursor-pointer ${
                              amount === val
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                            }`}
                          >
                            {val} {getCurrencySymbol(currency)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title / Libellé */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Libellé de l'opération *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Subvention Mairie, Achat Ballons Decathlon..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border font-medium outline-none transition text-sm ${
                          isClassic
                            ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                            : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                        }`}
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Catégorie Budgétaire
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => {
                          const isSelected = category === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setCategory(cat)}
                              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm"
                                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300"
                              }`}
                            >
                              <Tag className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-indigo-500"}`} />
                              <span className="text-xs truncate">{cat}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: RÈGLEMENT & DATE */}
                {activeFormTab === "payment" && (
                  <div className="space-y-5">
                    {/* Date */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Date de l'opération *
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border outline-none font-medium text-sm transition ${
                          isClassic
                            ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                            : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                        }`}
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Moyen de paiement
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map((pm) => {
                          const isSelected = paymentMethod === pm;
                          return (
                            <button
                              key={pm}
                              type="button"
                              onClick={() => setPaymentMethod(pm)}
                              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition font-bold cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300"
                              }`}
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>{pm}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Statut du règlement
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {STATUSES.map((st) => {
                          const isSelected = status === st;
                          let activeColor = "bg-emerald-600 text-white border-emerald-600";
                          if (st === "En attente") activeColor = "bg-amber-500 text-white border-amber-500";
                          if (st === "Annulé") activeColor = "bg-rose-600 text-white border-rose-600";

                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setStatus(st)}
                              className={`p-3 rounded-xl border flex items-center justify-center gap-1.5 transition font-bold cursor-pointer ${
                                isSelected
                                  ? activeColor
                                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                              }`}
                            >
                              {st === "Payé" && <CheckCircle2 className="w-4 h-4" />}
                              {st === "En attente" && <Clock className="w-4 h-4" />}
                              {st === "Annulé" && <X className="w-4 h-4" />}
                              <span>{st}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: MEMBRE & JUSTIFICATIF */}
                {activeFormTab === "member" && (
                  <div className="space-y-5">
                    {/* Associated Member */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Membre associé (Optionnel)
                      </label>
                      <select
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border outline-none cursor-pointer font-medium text-sm transition ${
                          isClassic
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        <option value="">Aucun membre (Opération générale du club)</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.category ? `(${m.category})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Member preview if selected */}
                    {memberId && (
                      <div className="p-4 rounded-2xl border bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                          {members.find((m) => m.id === memberId)?.name.charAt(0) || "M"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {members.find((m) => m.id === memberId)?.name}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            {members.find((m) => m.id === memberId)?.email || "Rattaché à l'écriture"}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-600 text-white shrink-0">
                          Membre Fiche
                        </span>
                      </div>
                    )}

                    {/* Notes & References */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Notes & Références de pièces comptables
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Référence de facture, numéro de chèque, détails du virement..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border outline-none font-medium text-xs transition ${
                          isClassic
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: APERÇU REÇU COMPTABLE */}
                {activeFormTab === "receipt" && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-inner space-y-4 relative overflow-hidden">
                      {/* Watermark stamp */}
                      <div className="absolute right-4 top-4 opacity-10 pointer-events-none rotate-12">
                        <QrCode className="w-28 h-28 text-slate-900 dark:text-white" />
                      </div>

                      <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 block">
                            Association Sportive • Reçu Pièce N° TX-2026
                          </span>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {title || "Libellé de l'opération"}
                          </h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          type === "income"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                        }`}>
                          {type === "income" ? "Recette (+)" : "Dépense (-)"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] block font-semibold">Montant Net:</span>
                          <span className="font-mono font-black text-2xl text-slate-900 dark:text-white">
                            {type === "income" ? "+" : "-"}{amount || "0.00"} {getCurrencySymbol(currency)}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] block font-semibold">Catégorie:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{category}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] block font-semibold">Date d'effet:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{date}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] block font-semibold">Règlement:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{paymentMethod} • {status}</span>
                        </div>
                      </div>

                      {memberId && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                          <span className="text-slate-400 text-[10px] block font-semibold">Tiers / Membre concerné:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {members.find((m) => m.id === memberId)?.name}
                          </span>
                        </div>
                      )}

                      {notes && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                          <span className="text-slate-400 text-[10px] block font-semibold">Notes / Pièce justificative:</span>
                          <p className="text-slate-600 dark:text-slate-400 italic text-[11px]">{notes}</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Validation Comptable Automatique
                        </span>
                        <span>Fait le {new Date().toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              {/* Sticky Footer */}
              <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer text-xs"
                >
                  Réinitialiser
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer shadow-md shadow-indigo-600/20 text-xs flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingTransaction ? "Enregistrer l'opération" : "Ajouter l'écriture"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4 ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Confirmer la suppression
              </h3>
              <p className="text-xs text-slate-500">
                Êtes-vous sûr de vouloir supprimer définitivement cette écriture comptable ?
              </p>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTransaction(deletingId);
                    setDeletingId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition cursor-pointer shadow-md"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* PDF Financial Report Modal */}
      <AnimatePresence>
        {isExportPDFModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Rapport Financier PDF Officiel</h3>
                    <p className="text-xs text-slate-500">
                      Générez le bilan comptable complet certifié pour l'assemblée ou les tiers.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExportPDFModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1">Titre du Rapport</label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Libellé de la Période / Exercice</label>
                  <input
                    type="text"
                    value={pdfPeriodLabel}
                    onChange={(e) => setPdfPeriodLabel(e.target.value)}
                    placeholder="ex: Saison 2025 - 2026, Exercice 2026..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Écritures incluses</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-mono font-bold">
                      {filteredTransactions.length} sur {transactions.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    L'export prend en compte la recherche et les filtres de type, catégorie et statut actuellement sélectionnés.
                  </p>
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <input
                    type="checkbox"
                    checked={pdfIncludeSignatures}
                    onChange={(e) => setPdfIncludeSignatures(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold block">Zone d'approbation et signatures</span>
                    <span className="text-[11px] text-slate-500">Ajoute les mentions "Vu & Approuvé" et encadrés pour le Trésorier et le Président.</span>
                  </div>
                </label>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExportPDFModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportFinancialReportPDF(filteredTransactions, {
                      title: pdfTitle,
                      periodLabel: pdfPeriodLabel,
                      includeSignatures: pdfIncludeSignatures
                    });
                    setIsExportPDFModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Télécharger le Bilan PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE TRANSACTION CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            onDeleteTransaction(deletingId);
            setDeletingId(null);
          }
        }}
        title="Supprimer cette transaction ?"
        itemName={transactions.find((t) => t.id === deletingId)?.title}
        description="Cette écriture comptable sera définitivement supprimée des livres de comptes de l'association."
        confirmText="Supprimer la transaction"
        cancelText="Conserver"
        theme={theme}
      />
    </div>
  );
};

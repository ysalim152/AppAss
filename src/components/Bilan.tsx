import React, { useState, useEffect } from "react";
import { Member, Team, Session, Equipment, Transaction, AssociationInfo, AppTheme, MoralReport } from "../types";
import { formatCurrency } from "../utils";
import {
  exportBilanMoralPDF,
  exportFinancialReportPDF,
  exportInventairePDF,
  exportBilanAnnuelCompletPDF
} from "../lib/pdfExporter";
import {
  FileText,
  DollarSign,
  Package,
  FileCheck,
  Download,
  Edit2,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Building2,
  Plus,
  Trash2,
  Save,
  Printer,
  Archive,
  Info,
  Award,
  Vote
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BilanProps {
  members: Member[];
  teams: Team[];
  sessions: Session[];
  equipment: Equipment[];
  transactions: Transaction[];
  associationInfo: AssociationInfo;
  theme: AppTheme;
  onUpdateEquipment?: (equipment: Equipment) => void;
}

export function BilanModule({
  members,
  teams,
  sessions,
  equipment,
  transactions,
  associationInfo,
  theme,
  onUpdateEquipment
}: BilanProps) {
  const isClassic = theme === "classic";

  // Sub-tabs state
  const [activeTab, setActiveTab] = useState<"moral" | "financier" | "inventaire">("moral");
  const [selectedSeason, setSelectedSeason] = useState<string>(associationInfo.season || "2025 - 2026");

  // Local storage for Moral Report persistence
  const [moralReport, setMoralReport] = useState<MoralReport>(() => {
    const saved = localStorage.getItem("appass_moral_report");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: "moral-2026",
      season: associationInfo.season || "2025 - 2026",
      title: "Rapport Moral & D'Activité Annuel",
      date: new Date().toISOString().split("T")[0],
      presidentWord:
        "La saison sportive écoulée a été marquée par un engagement exemplaire de l'ensemble des bénévoles, éducateurs et licenciés. Grâce au renforcement de nos partenariats et à une rigueur de gestion constante, notre association continue d'offrir un cadre sportif de premier ordre à nos jeunes et séniors.",
      sportingResults:
        "Nos équipes séniors se sont brillamment qualifiées pour les phases finales du championnat régional. Les sections jeunes (U18 / Espoirs) affichent un taux de progression exceptionnel avec une hausse significative du niveau de pratique et plusieurs podiums en tournois inter-clubs.",
      membershipSummary:
        "L'association compte à ce jour " +
        members.filter(m => !m.isArchived).length +
        " membres actifs. La parité se renforce avec une augmentation de 18% des adhésions féminines. L'assiduité moyenne aux créneaux d'entraînement dépasse 85%.",
      perspectives:
        "Pour la saison à venir, nous projetons la création d'un nouveau créneau de perfectionnement, l'acquisition d'équipements numériques de suivi de performance, et la rénovation du matériel d'entraînement partagé.",
      status: "approved",
      voteFor: 42,
      voteAgainst: 2,
      voteAbstain: 1,
      approvalDate: "2026-06-20",
      authorName: associationInfo.presidentName || "Présidence de l'Association"
    };
  });

  // Financial balance state (Bank & Cash balances)
  const [bankBalance, setBankBalance] = useState<number>(() => {
    const saved = localStorage.getItem("appass_bank_balance");
    return saved ? parseFloat(saved) : 12450;
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem("appass_cash_balance");
    return saved ? parseFloat(saved) : 620;
  });

  const [reserveFund, setReserveFund] = useState<number>(() => {
    const saved = localStorage.getItem("appass_reserve_fund");
    return saved ? parseFloat(saved) : 5000;
  });

  // Modal edit state for Moral Report
  const [isEditingMoral, setIsEditingMoral] = useState(false);
  const [editForm, setEditForm] = useState<MoralReport>(moralReport);

  // Inventaire Filters
  const [inventaireSearch, setInventaireSearch] = useState("");
  const [inventaireCategory, setInventaireCategory] = useState("all");
  const [inventaireCondition, setInventaireCondition] = useState("all");

  // Save Moral Report
  const handleSaveMoralReport = (e: React.FormEvent) => {
    e.preventDefault();
    setMoralReport(editForm);
    localStorage.setItem("appass_moral_report", JSON.stringify(editForm));
    setIsEditingMoral(false);
  };

  // Save Financial Treasury Adjustments
  const handleSaveBalances = () => {
    localStorage.setItem("appass_bank_balance", bankBalance.toString());
    localStorage.setItem("appass_cash_balance", cashBalance.toString());
    localStorage.setItem("appass_reserve_fund", reserveFund.toString());
    alert("Solde de trésorerie sauvegardé avec succès !");
  };

  // CALCULATIONS
  // 1. Members stats
  const activeMembers = members.filter(m => !m.isArchived);
  const totalMembersCount = activeMembers.length;
  const menCount = activeMembers.filter(m => m.gender === "M").length;
  const womenCount = activeMembers.filter(m => m.gender === "F").length;
  const paidMembersCount = activeMembers.filter(m => !m.paymentStatus || m.paymentStatus === "paid").length;

  // 2. Financials stats
  const totalIncome = transactions
    .filter(t => t.type === "income" && t.status !== "Annulé")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense" && t.status !== "Annulé")
    .reduce((acc, t) => acc + t.amount, 0);

  const netResult = totalIncome - totalExpense;

  // Unpaid member dues
  const pendingMemberDues = activeMembers
    .filter(m => m.paymentStatus === "pending")
    .reduce((acc, m) => acc + (m.paymentAmount || 150), 0);

  // Income by category
  const incomeByCat: Record<string, number> = {};
  const expenseByCat: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.status === "Annulé") return;
    const cat = t.category || "Autre";
    if (t.type === "income") {
      incomeByCat[cat] = (incomeByCat[cat] || 0) + t.amount;
    } else {
      expenseByCat[cat] = (expenseByCat[cat] || 0) + t.amount;
    }
  });

  // 3. Inventaire / Assets valuation
  const totalAssetValuation = equipment.reduce((acc, item) => {
    const val = (item.unitPrice || 0) * (item.quantity || 0);
    return acc + val;
  }, 0);

  const totalEquipmentQty = equipment.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const itemsNeufOrBon = equipment.filter(e => e.condition === "Neuf" || e.condition === "Bon état").length;
  const itemsToReplace = equipment.filter(e => e.condition === "À remplacer" || e.condition === "Hors service" || e.condition === "À réparer").length;

  // Filtered Inventaire
  const filteredInventaire = equipment.filter(item => {
    const matchSearch =
      !inventaireSearch ||
      item.name.toLowerCase().includes(inventaireSearch.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(inventaireSearch.toLowerCase()));
    const matchCategory = inventaireCategory === "all" || item.category === inventaireCategory;
    const matchCondition = inventaireCondition === "all" || item.condition === inventaireCondition;
    return matchSearch && matchCategory && matchCondition;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
                  Bilan & Assemblée Générale
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Saison {selectedSeason}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Rapport moral, bilan comptable financier et valorisation de l'inventaire du patrimoine.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Season Selector */}
            <select
              value={selectedSeason}
              onChange={e => setSelectedSeason(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none ${
                isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="2025 - 2026">Saison 2025 - 2026</option>
              <option value="2024 - 2025">Saison 2024 - 2025</option>
              <option value="2023 - 2024">Saison 2023 - 2024</option>
            </select>

            {/* Complete Annual Report PDF button */}
            <button
              type="button"
              onClick={() =>
                exportBilanAnnuelCompletPDF(
                  moralReport,
                  transactions,
                  equipment,
                  associationInfo,
                  {
                    membersCount: totalMembersCount,
                    teamsCount: teams.length,
                    sessionsCount: sessions.length
                  }
                )
              }
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Dossier Annuel Complet (PDF)</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="flex items-center gap-1 mt-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("moral")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "moral"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Bilan Moral & Activité</span>
            {moralReport.status === "approved" && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("financier")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "financier"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>2. Bilan Financier & Trésorerie</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${netResult >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
              {netResult >= 0 ? "+" : ""}{formatCurrency(netResult, "EUR")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inventaire")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "inventaire"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>3. Inventaire du Patrimoine</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-600">
              {formatCurrency(totalAssetValuation, "EUR")}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* TAB 1: BILAN MORAL */}
      {/* ========================================== */}
      {activeTab === "moral" && (
        <div className="space-y-6">
          {/* Moral Status Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            moralReport.status === "approved"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-300"
          }`}>
            <div className="flex items-center gap-3">
              {moralReport.status === "approved" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  {moralReport.status === "approved"
                    ? `Bilan Moral Officiellement Approuvé en AG (${moralReport.approvalDate || "Saison en cours"})`
                    : "Projet de Bilan Moral (En cours de rédaction)"}
                </span>
                <span className="text-xs opacity-80">
                  Auteur : {moralReport.authorName || "Présidence"} • Dernière mise à jour : {moralReport.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditForm(moralReport);
                  setIsEditingMoral(true);
                }}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 shadow-xs hover:bg-indigo-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modifier le Bilan Moral</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  exportBilanMoralPDF(moralReport, {
                    membersCount: totalMembersCount,
                    teamsCount: teams.length,
                    sessionsCount: sessions.length
                  })
                }
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF Bilan Moral</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Adhérents Actifs</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="font-display text-2xl font-extrabold mt-1">{totalMembersCount}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{menCount} H • {womenCount} F ({paidMembersCount} cotisations réglées)</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Équipes Engagées</span>
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="font-display text-2xl font-extrabold mt-1">{teams.length}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Compétitions & Loisirs</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Séances Organisées</span>
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <p className="font-display text-2xl font-extrabold mt-1">{sessions.length}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Entraînements, Matchs & Stages</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Vote Assemblée Générale</span>
                <Vote className="w-4 h-4 text-purple-500" />
              </div>
              <p className="font-display text-2xl font-extrabold mt-1 text-emerald-600">
                {moralReport.voteFor ? `${Math.round((moralReport.voteFor / ((moralReport.voteFor || 1) + (moralReport.voteAgainst || 0))) * 100)}%` : "100%"}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {moralReport.voteFor || 0} Pour, {moralReport.voteAgainst || 0} Contre
              </span>
            </div>
          </div>

          {/* Detailed Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1 */}
            <div className={`p-5 rounded-3xl border space-y-3 ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
                <Award className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base">1. Mot de la Présidence & Orientations</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {moralReport.presidentWord || "Aucun mot de la présidence renseigné."}
              </p>
            </div>

            {/* Section 2 */}
            <div className={`p-5 rounded-3xl border space-y-3 ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <Shield className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base">2. Bilan Sportif & Réalisations</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {moralReport.sportingResults || "Aucun bilan sportif renseigné."}
              </p>
            </div>

            {/* Section 3 */}
            <div className={`p-5 rounded-3xl border space-y-3 ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <Users className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base">3. Vie de l'Association & Effectifs</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {moralReport.membershipSummary || "Aucune analyse des effectifs renseignée."}
              </p>
            </div>

            {/* Section 4 */}
            <div className={`p-5 rounded-3xl border space-y-3 ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base">4. Projets & Perspectives Prochaine Saison</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {moralReport.perspectives || "Aucune perspective renseignée."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: BILAN FINANCIER */}
      {/* ========================================== */}
      {activeTab === "financier" && (
        <div className="space-y-6">
          {/* Treasury & Key Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <span className="text-xs font-semibold text-slate-400 block">Recettes Totales (+)</span>
              <p className="font-display text-2xl font-extrabold text-emerald-600 mt-1">
                +{formatCurrency(totalIncome, "EUR")}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Cotisations, Subventions, Buvette</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <span className="text-xs font-semibold text-slate-400 block">Dépenses Totales (-)</span>
              <p className="font-display text-2xl font-extrabold text-rose-600 mt-1">
                -{formatCurrency(totalExpense, "EUR")}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Équipements, Salles, Licences</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <span className="text-xs font-semibold text-slate-400 block">Résultat Net de l'Exercice</span>
              <p className={`font-display text-2xl font-extrabold mt-1 ${netResult >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {netResult >= 0 ? "+" : ""}{formatCurrency(netResult, "EUR")}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {netResult >= 0 ? "Excédent budgétaire" : "Déficit à résorber"}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <span className="text-xs font-semibold text-slate-400 block">Trésorerie Disponible</span>
              <p className="font-display text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {formatCurrency(bankBalance + cashBalance, "EUR")}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Banque ({formatCurrency(bankBalance, "EUR")}) + Caisse</span>
            </div>
          </div>

          {/* Financial Breakdown Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recettes (Income) Breakdown */}
            <div className={`p-5 rounded-3xl border space-y-4 ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-base">Ventilation des Produits (Recettes)</h3>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  Total : +{formatCurrency(totalIncome, "EUR")}
                </span>
              </div>

              <div className="space-y-2.5">
                {Object.keys(incomeByCat).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center">Aucune recette enregistrée sur cette période.</p>
                ) : (
                  Object.entries(incomeByCat).map(([cat, amount]) => {
                    const pct = totalIncome ? Math.round((amount / totalIncome) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span>{cat}</span>
                          <span className="font-bold font-mono text-emerald-600">+{formatCurrency(amount, "EUR")} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Dépenses (Expenses) Breakdown */}
            <div className={`p-5 rounded-3xl border space-y-4 ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-base">Ventilation des Charges (Dépenses)</h3>
                </div>
                <span className="text-xs font-extrabold text-rose-600 bg-rose-500/10 px-2.5 py-1 rounded-full">
                  Total : -{formatCurrency(totalExpense, "EUR")}
                </span>
              </div>

              <div className="space-y-2.5">
                {Object.keys(expenseByCat).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center">Aucune dépense enregistrée sur cette période.</p>
                ) : (
                  Object.entries(expenseByCat).map(([cat, amount]) => {
                    const pct = totalExpense ? Math.round((amount / totalExpense) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span>{cat}</span>
                          <span className="font-bold font-mono text-rose-600">-{formatCurrency(amount, "EUR")} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Compte de Bilan Simplifié (Actif vs Passif & Trésorerie) */}
          <div className={`p-5 rounded-3xl border space-y-4 ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base">Compte de Bilan Comptable & Trésorerie de Clôture</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveBalances}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les Soldes</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportFinancialReportPDF(transactions, { currency: "EUR" })}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF Bilan Financier</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ACTIF (Assets & Cash) */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isClassic ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">ACTIF (Avoir & Créances)</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Solde Compte Bancaire (€) :</span>
                    <input
                      type="number"
                      value={bankBalance}
                      onChange={e => setBankBalance(parseFloat(e.target.value) || 0)}
                      className="w-28 text-right font-mono font-bold px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Solde Caisse Espèces (€) :</span>
                    <input
                      type="number"
                      value={cashBalance}
                      onChange={e => setCashBalance(parseFloat(e.target.value) || 0)}
                      className="w-28 text-right font-mono font-bold px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-300">Créances Cotisations Dues (€) :</span>
                    <span className="font-mono font-bold text-amber-600">+{formatCurrency(pendingMemberDues, "EUR")}</span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2 border-slate-200 dark:border-slate-700 font-extrabold text-sm">
                    <span>TOTAL ACTIF :</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(bankBalance + cashBalance + pendingMemberDues, "EUR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* PASSIF & FONDS PROPRES */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isClassic ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">PASSIF & FONDS PROPRES</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Fonds de Réserve (€) :</span>
                    <input
                      type="number"
                      value={reserveFund}
                      onChange={e => setReserveFund(parseFloat(e.target.value) || 0)}
                      className="w-28 text-right font-mono font-bold px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-300">Résultat de l'Exercice (€) :</span>
                    <span className={`font-mono font-bold ${netResult >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {netResult >= 0 ? "+" : ""}{formatCurrency(netResult, "EUR")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-300">Valeur Patrimoine Matériel (€) :</span>
                    <span className="font-mono font-bold text-indigo-600">{formatCurrency(totalAssetValuation, "EUR")}</span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2 border-slate-200 dark:border-slate-700 font-extrabold text-sm">
                    <span>TOTAL FONDS PROPRES :</span>
                    <span className="font-mono text-emerald-600">
                      {formatCurrency(reserveFund + netResult + totalAssetValuation, "EUR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: INVENTAIRE DU PATRIMOINE */}
      {/* ========================================== */}
      {activeTab === "inventaire" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <span className="text-xs font-semibold text-slate-400 block">Valeur Globale Estimée</span>
              <p className="font-display text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {formatCurrency(totalAssetValuation, "EUR")}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{equipment.length} références d'équipements</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <span className="text-xs font-semibold text-slate-400 block">Quantité Totale en Stock</span>
              <p className="font-display text-2xl font-extrabold mt-1">{totalEquipmentQty}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Articles physiques répertoriés</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <span className="text-xs font-semibold text-slate-400 block">Matériel Neuf / Bon État</span>
              <p className="font-display text-2xl font-extrabold text-emerald-600 mt-1">{itemsNeufOrBon}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {equipment.length ? Math.round((itemsNeufOrBon / equipment.length) * 100) : 0}% du parc en état optimal
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <span className="text-xs font-semibold text-slate-400 block">À Réparer / Remplacer</span>
              <p className="font-display text-2xl font-extrabold text-amber-600 mt-1">{itemsToReplace}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Requiert renouvellement</span>
            </div>
          </div>

          {/* Filter Bar & Export */}
          <div className={`p-4 rounded-2xl border space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3 ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
          }`}>
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <input
                type="text"
                placeholder="Rechercher un équipement..."
                value={inventaireSearch}
                onChange={e => setInventaireSearch(e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-xs border outline-none min-w-[200px] ${
                  isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              />

              <select
                value={inventaireCategory}
                onChange={e => setInventaireCategory(e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-xs border outline-none ${
                  isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <option value="all">Toutes catégories</option>
                <option value="Textile">Textile</option>
                <option value="Matériel">Matériel</option>
                <option value="Ballons">Ballons</option>
                <option value="Médical">Médical</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Autre">Autre</option>
              </select>

              <select
                value={inventaireCondition}
                onChange={e => setInventaireCondition(e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-xs border outline-none ${
                  isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <option value="all">Tous états</option>
                <option value="Neuf">Neuf</option>
                <option value="Bon état">Bon état</option>
                <option value="Usé">Usé</option>
                <option value="À réparer">À réparer</option>
                <option value="À remplacer">À remplacer</option>
                <option value="Hors service">Hors service</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => exportInventairePDF(equipment)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Exporter l'Inventaire (PDF)</span>
            </button>
          </div>

          {/* Inventory Table */}
          <div className={`rounded-3xl border overflow-hidden ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-extrabold uppercase tracking-wider text-[10px] ${
                  isClassic ? "bg-slate-800/50 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200/80 text-slate-400"
                }`}>
                  <tr>
                    <th className="py-3 px-4">Désignation</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4 text-center">Quantité</th>
                    <th className="py-3 px-4 text-right">Prix Unitaire Est.</th>
                    <th className="py-3 px-4 text-right">Valeur Totale</th>
                    <th className="py-3 px-4 text-center">État Physique</th>
                    <th className="py-3 px-4">Emplacement</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isClassic ? "divide-slate-800" : "divide-slate-100"}`}>
                  {filteredInventaire.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Aucun équipement trouvé dans l'inventaire.
                      </td>
                    </tr>
                  ) : (
                    filteredInventaire.map(item => {
                      const totalVal = (item.unitPrice || 0) * item.quantity;
                      return (
                        <tr key={item.id} className={`transition ${isClassic ? "hover:bg-slate-800/40" : "hover:bg-indigo-50/30"}`}>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{item.category}</td>
                          <td className="py-3.5 px-4 text-center font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono">
                            {item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(totalVal, "EUR")}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.condition === "Neuf"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : item.condition === "Bon état"
                                ? "bg-blue-500/10 text-blue-600"
                                : item.condition === "Usé"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-rose-500/10 text-rose-600"
                            }`}>
                              {item.condition}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{item.location || "Local du club"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT MORAL REPORT */}
      <AnimatePresence>
        {isEditingMoral && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg">Éditer le Bilan Moral & Rapport d'Activité</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingMoral(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveMoralReport} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Auteur / Rapporteur</label>
                  <input
                    type="text"
                    value={editForm.authorName || ""}
                    onChange={e => setEditForm({ ...editForm, authorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">1. Mot de la Présidence & Orientations</label>
                  <textarea
                    rows={4}
                    value={editForm.presidentWord}
                    onChange={e => setEditForm({ ...editForm, presidentWord: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">2. Bilan Sportif & Réalisations</label>
                  <textarea
                    rows={4}
                    value={editForm.sportingResults}
                    onChange={e => setEditForm({ ...editForm, sportingResults: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">3. Vie de l'Association & Effectifs</label>
                  <textarea
                    rows={3}
                    value={editForm.membershipSummary}
                    onChange={e => setEditForm({ ...editForm, membershipSummary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">4. Projets & Perspectives</label>
                  <textarea
                    rows={3}
                    value={editForm.perspectives}
                    onChange={e => setEditForm({ ...editForm, perspectives: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 border-t pt-4 border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-600 mb-1">Votes POUR</label>
                    <input
                      type="number"
                      value={editForm.voteFor || 0}
                      onChange={e => setEditForm({ ...editForm, voteFor: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-rose-600 mb-1">Votes CONTRE</label>
                    <input
                      type="number"
                      value={editForm.voteAgainst || 0}
                      onChange={e => setEditForm({ ...editForm, voteAgainst: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Abstentions</label>
                    <input
                      type="number"
                      value={editForm.voteAbstain || 0}
                      onChange={e => setEditForm({ ...editForm, voteAbstain: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingMoral(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
                  >
                    Enregistrer le Bilan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

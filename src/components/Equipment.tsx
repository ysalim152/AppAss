import React, { useState, useMemo } from "react";
import { Equipment, Team, Member, AppTheme } from "../types";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Tag,
  Boxes,
  X,
  Users,
  User,
  Info,
  Minus,
  Download,
  LayoutGrid,
  Table as TableIcon,
  Wrench,
  Shield,
  Eye,
  FileSpreadsheet,
  TrendingDown,
  ArrowUpDown,
  Activity,
  ShieldCheck,
  AlertCircle,
  HeartPulse,
  RefreshCw,
  Check,
  Sparkles,
  DollarSign,
  Calendar,
  Hash,
  Building,
  Layers,
  RotateCcw,
  Stethoscope,
  Shirt,
  Dribbble,
  Zap,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface EquipmentProps {
  equipment: Equipment[];
  teams: Team[];
  members: Member[];
  theme?: AppTheme;
  onAddEquipment: (item: Omit<Equipment, "id" | "createdAt">) => void;
  onUpdateEquipment: (item: Equipment) => void;
  onDeleteEquipment: (id: string) => void;
}

const CATEGORIES: Equipment["category"][] = [
  "Textile",
  "Matériel",
  "Ballons",
  "Médical",
  "Infrastructure",
  "Autre"
];

const CONDITIONS: Equipment["condition"][] = [
  "Neuf",
  "Bon état",
  "Usé",
  "À réparer",
  "À remplacer",
  "Hors service"
];

export type HealthGroup = "good" | "repair" | "replace";

export interface HealthInfo {
  group: HealthGroup;
  label: string;
  badgeLabel: string;
  bg: string;
  text: string;
  border: string;
  badgeBgClass: string;
  dotColor: string;
  barColor: string;
  progressPercent: number;
  statusText: string;
  icon: React.FC<any>;
}

export const getHealthInfo = (cond: Equipment["condition"]): HealthInfo => {
  switch (cond) {
    case "Neuf":
      return {
        group: "good",
        label: "En bon état",
        badgeLabel: "Neuf",
        bg: "bg-emerald-500/10 dark:bg-emerald-950/40",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-500/30",
        badgeBgClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
        dotColor: "bg-emerald-500",
        barColor: "bg-emerald-500",
        progressPercent: 100,
        statusText: "Opérationnel",
        icon: CheckCircle2
      };
    case "Bon état":
      return {
        group: "good",
        label: "En bon état",
        badgeLabel: "Bon état",
        bg: "bg-emerald-500/10 dark:bg-emerald-950/40",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-500/30",
        badgeBgClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
        dotColor: "bg-emerald-500",
        barColor: "bg-emerald-500",
        progressPercent: 85,
        statusText: "Opérationnel",
        icon: CheckCircle2
      };
    case "Usé":
      return {
        group: "repair",
        label: "Nécessite réparation",
        badgeLabel: "Usé (Maintenance)",
        bg: "bg-amber-500/10 dark:bg-amber-950/40",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/30",
        badgeBgClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700",
        dotColor: "bg-amber-500",
        barColor: "bg-amber-500",
        progressPercent: 50,
        statusText: "Entretien recommandé",
        icon: Wrench
      };
    case "À réparer":
      return {
        group: "repair",
        label: "Nécessite réparation",
        badgeLabel: "À réparer",
        bg: "bg-orange-500/10 dark:bg-orange-950/40",
        text: "text-orange-700 dark:text-orange-400",
        border: "border-orange-500/30",
        badgeBgClass: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-700",
        dotColor: "bg-orange-500",
        barColor: "bg-orange-500",
        progressPercent: 35,
        statusText: "Réparation requise",
        icon: Wrench
      };
    case "À remplacer":
      return {
        group: "replace",
        label: "À remplacer",
        badgeLabel: "À remplacer",
        bg: "bg-rose-500/10 dark:bg-rose-950/40",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-500/30",
        badgeBgClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700",
        dotColor: "bg-rose-500",
        barColor: "bg-rose-500",
        progressPercent: 15,
        statusText: "Remplacement requis",
        icon: RefreshCw
      };
    case "Hors service":
    default:
      return {
        group: "replace",
        label: "À remplacer",
        badgeLabel: "Hors service",
        bg: "bg-rose-500/10 dark:bg-rose-950/40",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-500/30",
        badgeBgClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700",
        dotColor: "bg-rose-600",
        barColor: "bg-rose-600",
        progressPercent: 0,
        statusText: "Hors service / Réforme",
        icon: AlertCircle
      };
  }
};

export const EquipmentModule: React.FC<EquipmentProps> = ({
  equipment,
  teams,
  members,
  theme = "modern",
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment
}) => {
  const isClassic = theme === "classic";

  // Views & Display
  const [viewMode, setViewMode] = useState<"grid" | "table" | "alerts">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [selectedCondition, setSelectedCondition] = useState<string>("Tous");
  const [healthGroupFilter, setHealthGroupFilter] = useState<"all" | "good" | "repair" | "replace">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "lowStock" | "outOfStock">("all");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<Equipment | null>(null);

  // Form states
  const [activeFormTab, setActiveFormTab] = useState<"general" | "stock" | "assignment" | "preview">("general");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Equipment["category"]>("Matériel");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState<Equipment["condition"]>("Bon état");
  const [assignedToType, setAssignedToType] = useState<"none" | "team" | "member">("none");
  const [assignedToId, setAssignedToId] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [minQuantityAlert, setMinQuantityAlert] = useState("2");
  const [error, setError] = useState("");
  const [templateAppliedNotice, setTemplateAppliedNotice] = useState<string | null>(null);

  // Preset Equipment Templates
  const PRESET_TEMPLATES = [
    {
      label: "Ballons Taille 5",
      icon: "⚽",
      name: "Ballons de Compétition Taille 5",
      category: "Ballons" as Equipment["category"],
      quantity: "12",
      condition: "Bon état" as Equipment["condition"],
      location: "Sac à ballons N°1 - Local Matériel",
      notes: "Pression recommandée 0.8 bar. Gonfleur disponible au local.",
      unitPrice: "25"
    },
    {
      label: "Jeu de Maillots",
      icon: "👕",
      name: "Jeu de Maillots Match Domicile",
      category: "Textile" as Equipment["category"],
      quantity: "16",
      condition: "Neuf" as Equipment["condition"],
      location: "Vestiaire Principal - Sac 1",
      notes: "Numerotés de 1 à 16. Lavage 30°C sans adoucissant.",
      unitPrice: "35"
    },
    {
      label: "Plots & Cônes",
      icon: "🟡",
      name: "Lot de Cônes & Plots d'entraînement",
      category: "Matériel" as Equipment["category"],
      quantity: "40",
      condition: "Bon état" as Equipment["condition"],
      location: "Armoire 2 - Bac 1",
      notes: "4 couleurs (10 jaunes, 10 rouges, 10 bleus, 10 blancs).",
      unitPrice: "1.5"
    },
    {
      label: "Pharmacie Terrain",
      icon: "🩹",
      name: "Trousse de Premiers Secours Terrain",
      category: "Médical" as Equipment["category"],
      quantity: "2",
      condition: "Neuf" as Equipment["condition"],
      location: "Infirmerie / Sac Soigneur",
      notes: "Contient bandages, bombe de froid, désinfectant et strapp.",
      unitPrice: "45"
    },
    {
      label: "Chasubles Bicolores",
      icon: "🎽",
      name: "Lot de Chasubles d'entraînement (Jaune/Vert)",
      category: "Textile" as Equipment["category"],
      quantity: "20",
      condition: "Bon état" as Equipment["condition"],
      location: "Armoire 1 - Étagère 2",
      notes: "10 Jaunes (Taille L) et 10 Vertes (Taille L).",
      unitPrice: "5"
    },
    {
      label: "Mini-Buts Pop-Up",
      icon: "🥅",
      name: "Paire de Mini-Buts Amovibles Pop-Up",
      category: "Infrastructure" as Equipment["category"],
      quantity: "4",
      condition: "Bon état" as Equipment["condition"],
      location: "Local Matériel Extérieur",
      notes: "Inclus piquet d'ancrage et sac de transport.",
      unitPrice: "75"
    }
  ];

  const resetForm = () => {
    setName("");
    setCategory("Matériel");
    setQuantity("1");
    setCondition("Bon état");
    setAssignedToType("none");
    setAssignedToId("");
    setLocation("");
    setNotes("");
    setSerialNumber("");
    setUnitPrice("");
    setPurchaseDate("");
    setSupplier("");
    setMinQuantityAlert("2");
    setError("");
    setEditingItem(null);
    setActiveFormTab("general");
    setTemplateAppliedNotice(null);
  };

  const FORM_TABS = [
    { id: "general", label: "1. Général & Catégorie", icon: Package },
    { id: "stock", label: "2. Stock & État", icon: Boxes },
    { id: "assignment", label: "3. Affectation & Prix", icon: Users },
    { id: "preview", label: "4. Aperçu Carte", icon: Eye }
  ];

  const completionPercent = useMemo(() => {
    let score = 0;
    if (name.trim()) score += 30;
    if (category) score += 20;
    if (quantity && parseInt(quantity, 10) >= 0) score += 20;
    if (condition) score += 10;
    if (location.trim()) score += 10;
    if (assignedToType !== "none" ? assignedToId : true) score += 10;
    return Math.min(100, score);
  }, [name, category, quantity, condition, location, assignedToType, assignedToId]);

  const handleApplyTemplate = (tmpl: (typeof PRESET_TEMPLATES)[0]) => {
    setName(tmpl.name);
    setCategory(tmpl.category);
    setQuantity(tmpl.quantity);
    setCondition(tmpl.condition);
    setLocation(tmpl.location);
    setNotes(tmpl.notes);
    setUnitPrice(tmpl.unitPrice);
    setTemplateAppliedNotice(`Modèle "${tmpl.label}" appliqué !`);
    setTimeout(() => setTemplateAppliedNotice(null), 3000);
  };

  const handleFillDemoData = () => {
    const choice = PRESET_TEMPLATES[Math.floor(Math.random() * PRESET_TEMPLATES.length)];
    handleApplyTemplate(choice);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Equipment) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity.toString());
    setCondition(item.condition);
    setAssignedToType(item.assignedToType || "none");
    setAssignedToId(item.assignedToId || "");
    setLocation(item.location || "");
    setNotes(item.notes || "");
    setSerialNumber(item.serialNumber || "");
    setUnitPrice(item.unitPrice !== undefined ? item.unitPrice.toString() : "");
    setPurchaseDate(item.purchaseDate || "");
    setSupplier(item.supplier || "");
    setMinQuantityAlert(item.minQuantityAlert !== undefined ? item.minQuantityAlert.toString() : "2");
    setError("");
    setActiveFormTab("general");
    setTemplateAppliedNotice(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Le nom de l'équipement est requis.");
      setActiveFormTab("general");
      return;
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      setError("La quantité doit être un nombre positif ou nul.");
      setActiveFormTab("stock");
      return;
    }

    const parsedUnitPrice = unitPrice ? parseFloat(unitPrice) : undefined;
    const parsedMinAlert = minQuantityAlert ? parseInt(minQuantityAlert, 10) : undefined;

    if (editingItem) {
      onUpdateEquipment({
        ...editingItem,
        name: name.trim(),
        category,
        quantity: parsedQty,
        condition,
        assignedToType,
        assignedToId: assignedToType !== "none" ? assignedToId : undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        unitPrice: parsedUnitPrice,
        purchaseDate: purchaseDate || undefined,
        supplier: supplier.trim() || undefined,
        minQuantityAlert: parsedMinAlert
      });
    } else {
      onAddEquipment({
        name: name.trim(),
        category,
        quantity: parsedQty,
        condition,
        assignedToType,
        assignedToId: assignedToType !== "none" ? assignedToId : undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        unitPrice: parsedUnitPrice,
        purchaseDate: purchaseDate || undefined,
        supplier: supplier.trim() || undefined,
        minQuantityAlert: parsedMinAlert
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleAdjustQuantity = (item: Equipment, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    onUpdateEquipment({
      ...item,
      quantity: newQty
    });
  };

  const handleQuickConditionChange = (item: Equipment, newCondition: Equipment["condition"]) => {
    onUpdateEquipment({
      ...item,
      condition: newCondition
    });
  };

  // CSV Export
  const exportEquipmentCSV = () => {
    const headers = ["Nom", "Catégorie", "Quantité", "État", "Attribution Type", "Attribué à", "Emplacement", "Notes", "Date création"];
    const rows = equipment.map((item) => {
      let assignedName = "";
      if (item.assignedToType === "team") {
        const t = teams.find((team) => team.id === item.assignedToId);
        assignedName = t ? t.name : "";
      } else if (item.assignedToType === "member") {
        const m = members.find((mem) => mem.id === item.assignedToId);
        assignedName = m ? m.name : "";
      }

      return [
        `"${item.name}"`,
        `"${item.category}"`,
        item.quantity,
        `"${item.condition}"`,
        `"${item.assignedToType || "Aucune"}"`,
        `"${assignedName}"`,
        `"${item.location || ""}"`,
        `"${item.notes || ""}"`,
        `"${item.createdAt || ""}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventaire_equipements_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Equipment List
  const filteredEquipment = equipment.filter((item) => {
    const search = searchTerm.toLowerCase().trim();
    const assignedText =
      item.assignedToType === "team"
        ? teams.find((t) => t.id === item.assignedToId)?.name || ""
        : item.assignedToType === "member"
        ? members.find((m) => m.id === item.assignedToId)?.name || ""
        : "";

    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search) ||
      (item.location && item.location.toLowerCase().includes(search)) ||
      (item.notes && item.notes.toLowerCase().includes(search)) ||
      assignedText.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "Toutes" || item.category === selectedCategory;

    const matchesCondition =
      selectedCondition === "Tous" || item.condition === selectedCondition;

    let matchesStock = true;
    if (stockFilter === "inStock") matchesStock = item.quantity >= 3;
    if (stockFilter === "lowStock") matchesStock = item.quantity < 3;
    if (stockFilter === "outOfStock") matchesStock = item.quantity === 0;

    const healthInfo = getHealthInfo(item.condition);
    const matchesHealthGroup =
      healthGroupFilter === "all" || healthInfo.group === healthGroupFilter;

    // View mode specific logic for alerts
    if (viewMode === "alerts") {
      const isAlertCondition =
        item.condition === "À réparer" ||
        item.condition === "Hors service" ||
        item.condition === "Usé" ||
        item.condition === "À remplacer" ||
        item.quantity === 0;
      return matchesSearch && isAlertCondition;
    }

    return matchesSearch && matchesCategory && matchesCondition && matchesStock && matchesHealthGroup;
  });

  // Calculate Metrics & Health Index
  const totalQuantity = equipment.reduce((acc, curr) => acc + curr.quantity, 0);
  const goodItems = equipment.filter((e) => getHealthInfo(e.condition).group === "good");
  const repairItems = equipment.filter((e) => getHealthInfo(e.condition).group === "repair");
  const replaceItems = equipment.filter((e) => getHealthInfo(e.condition).group === "replace");

  const totalItemsCount = equipment.length || 1;
  const goodPct = Math.round((goodItems.length / totalItemsCount) * 100);
  const repairPct = Math.round((repairItems.length / totalItemsCount) * 100);
  const replacePct = Math.round((replaceItems.length / totalItemsCount) * 100);

  const healthIndex = Math.round(
    equipment.reduce((acc, curr) => acc + getHealthInfo(curr.condition).progressPercent, 0) / totalItemsCount
  );

  const needsAttentionList = equipment.filter(
    (e) =>
      e.condition === "À réparer" ||
      e.condition === "Hors service" ||
      e.condition === "À remplacer" ||
      e.quantity === 0
  );
  const needsAttentionCount = needsAttentionList.length;
  const assignedCount = equipment.filter((e) => e.assignedToType && e.assignedToType !== "none").length;

  const getConditionBadgeClass = (cond: Equipment["condition"]) => {
    return getHealthInfo(cond).badgeBgClass;
  };

  const getCategoryBadgeClass = (cat: Equipment["category"]) => {
    switch (cat) {
      case "Ballons":
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800";
      case "Textile":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800";
      case "Matériel":
        return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800";
      case "Médical":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
      case "Infrastructure":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      default:
        return "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800";
    }
  };

  const getAssignedLabel = (item: Equipment) => {
    if (!item.assignedToType || item.assignedToType === "none") return null;
    if (item.assignedToType === "team") {
      const team = teams.find((t) => t.id === item.assignedToId);
      return team ? `Équipe : ${team.name}` : "Équipe assignée";
    }
    if (item.assignedToType === "member") {
      const member = members.find((m) => m.id === item.assignedToId);
      return member ? `Membre : ${member.name}` : "Membre assigné";
    }
    return null;
  };

  return (
    <div id="equipment-view" className="space-y-6">
      {/* 1. Top Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Gestion des Équipements
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              isClassic ? "bg-[#0d6efd]/20 text-blue-300 border border-[#0d6efd]/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}>
              {equipment.length} références
            </span>
          </div>
          <p className={`text-sm ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
            Suivez l'inventaire, contrôlez les stocks, l'état du matériel et affectez-le aux équipes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={exportEquipmentCSV}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs transition flex items-center gap-2 border cursor-pointer ${
              isClassic
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
            title="Exporter l'inventaire en CSV"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>

          <button
            id="btn-add-equipment"
            onClick={handleOpenAdd}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
              isClassic
                ? "bg-[#0d6efd] text-white hover:bg-blue-700 border border-blue-400"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un matériel</span>
          </button>
        </div>
      </div>

      {/* Stock Critical Alert Banner (< 3 units) */}
      {equipment.some((item) => item.quantity < 3) && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isClassic ? "bg-rose-950/40 border-rose-800/60 text-rose-200" : "bg-rose-50 border-rose-200 text-rose-900 shadow-sm"
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold flex items-center gap-2 flex-wrap">
                Alerte Stock Critique
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white">
                  {equipment.filter((item) => item.quantity < 3).length} article(s) &lt; 3 unités
                </span>
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Un ou plusieurs articles ont une quantité inférieure à 3 unités. Pensez au réapprovisionnement.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStockFilter(stockFilter === "lowStock" ? "all" : "lowStock")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
              stockFilter === "lowStock"
                ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                : "bg-white text-rose-700 hover:bg-rose-100 border-rose-300 dark:bg-slate-900 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            {stockFilter === "lowStock" ? "Afficher tout l'inventaire" : "Filtrer les stocks faibles (< 3)"}
          </button>
        </div>
      )}

      {/* 2. Key KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Unités en Stock</span>
            <Boxes className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold font-display">{totalQuantity}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Références d'articles</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-display text-blue-600">{equipment.length}</p>
        </div>

        <div
          onClick={() => setViewMode("alerts")}
          className={`p-4 rounded-2xl border cursor-pointer transition hover:border-amber-400 ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Alertes Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-display text-amber-600 flex items-center gap-2">
            {needsAttentionCount}
            {needsAttentionCount > 0 && (
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Action requise
              </span>
            )}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Équipements Attribués</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-display text-emerald-600">{assignedCount}</p>
        </div>
      </div>

      {/* 2.5 Health Status Overview Banner (Bilan de Santé du Matériel) */}
      <div className={`p-5 rounded-3xl border transition ${
        isClassic ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  État de Santé du Parc Équipements
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  healthIndex >= 75
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : healthIndex >= 50
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300"
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
                }`}>
                  Indice Global : {healthIndex}% Opérationnel
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution visuelle de l'état du matériel : bon état, maintenance requise et articles à remplacer.
              </p>
            </div>
          </div>

          {/* Multi-segment Health Bar */}
          <div className="w-full md:w-64 space-y-1 shrink-0">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Répartition santé</span>
              <span>{equipment.length} références</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60 dark:border-slate-700">
              <div
                style={{ width: `${goodPct}%` }}
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                title={`En bon état : ${goodItems.length} (${goodPct}%)`}
              />
              <div
                style={{ width: `${repairPct}%` }}
                className="h-full bg-amber-500 transition-all duration-500"
                title={`Nécessite réparation : ${repairItems.length} (${repairPct}%)`}
              />
              <div
                style={{ width: `${replacePct}%` }}
                className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                title={`À remplacer : ${replaceItems.length} (${replacePct}%)`}
              />
            </div>
          </div>
        </div>

        {/* Interactive Health Category Filter Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Good Health Button */}
          <button
            type="button"
            onClick={() => setHealthGroupFilter(healthGroupFilter === "good" ? "all" : "good")}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              healthGroupFilter === "good"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/20"
                : isClassic
                ? "bg-slate-950/60 border-slate-800 hover:border-emerald-500/50"
                : "bg-slate-50/80 border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow-sm" />
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                  🟢 En Bon État
                </span>
                <span className="text-[11px] text-slate-500">
                  Opérationnels / Neufs
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-xl">
              {goodItems.length}
            </span>
          </button>

          {/* Repair Needed Button */}
          <button
            type="button"
            onClick={() => setHealthGroupFilter(healthGroupFilter === "repair" ? "all" : "repair")}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              healthGroupFilter === "repair"
                ? "bg-amber-50 dark:bg-amber-950/60 border-amber-400 ring-2 ring-amber-500/20"
                : isClassic
                ? "bg-slate-950/60 border-slate-800 hover:border-amber-500/50"
                : "bg-slate-50/80 border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 shadow-sm" />
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                  🟠 Nécessite Réparation
                </span>
                <span className="text-[11px] text-slate-500">
                  Usés / En révision
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold font-mono text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 rounded-xl">
              {repairItems.length}
            </span>
          </button>

          {/* Replace Needed Button */}
          <button
            type="button"
            onClick={() => setHealthGroupFilter(healthGroupFilter === "replace" ? "all" : "replace")}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              healthGroupFilter === "replace"
                ? "bg-rose-50 dark:bg-rose-950/60 border-rose-400 ring-2 ring-rose-500/20"
                : isClassic
                ? "bg-slate-950/60 border-slate-800 hover:border-rose-500/50"
                : "bg-slate-50/80 border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-sm animate-pulse" />
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-100">
                  🔴 À Remplacer
                </span>
                <span className="text-[11px] text-slate-500">
                  Hors service / Vétustes
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold font-mono text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-2.5 py-1 rounded-xl">
              {replaceItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Filter Bar & View Switcher */}
      <div className={`p-4 rounded-3xl border ${
        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      } space-y-3`}>
        {/* Top bar controls */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* View Mode Switcher */}
          <div className={`flex items-center p-1 rounded-2xl border text-xs font-semibold w-full lg:w-auto justify-center ${
            isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200/80"
          }`}>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cartes
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "table"
                  ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Tableau
            </button>

            <button
              type="button"
              onClick={() => setViewMode("alerts")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "alerts"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Maintenance & Alertes</span>
              {needsAttentionCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold">
                  {needsAttentionCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Input & Select Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher nom, lieu, affectation..."
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
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                isClassic
                  ? "bg-slate-800 border-slate-700 text-slate-200"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <option value="Tous">Tous les états</option>
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                isClassic
                  ? "bg-slate-800 border-slate-700 text-slate-200"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <option value="all">Tous les stocks</option>
              <option value="inStock">En stock (&gt;2)</option>
              <option value="lowStock">Stock faible (1-2)</option>
              <option value="outOfStock">Rupture (0)</option>
            </select>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("Toutes")}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
              selectedCategory === "Toutes"
                ? isClassic ? "bg-slate-700 text-white border-slate-600" : "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Toutes ({equipment.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = equipment.filter((e) => e.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? isClassic ? "bg-slate-700 text-white border-slate-600" : "bg-indigo-600 text-white border-indigo-600"
                    : "bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:bg-slate-200"
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN CONTENT VIEWS */}
      {filteredEquipment.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {viewMode === "alerts" ? "Aucune alerte de maintenance !" : "Aucun équipement trouvé"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {viewMode === "alerts"
              ? "Tout votre matériel est en bon état ou neuf. Aucun équipement ne requiert de réparation ou de réapprovisionnement."
              : "Aucun article ne correspond à votre recherche ou à vos filtres sélectionnés."}
          </p>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map((item, index) => {
                const health = getHealthInfo(item.condition);
                const HealthIcon = health.icon;
                const assignedText = getAssignedLabel(item);
                const isLowStock = item.quantity <= 2 && item.quantity > 0;
                const isOutOfStock = item.quantity === 0;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -16, y: 12 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-5 rounded-3xl border transition hover:shadow-md flex flex-col justify-between relative overflow-hidden ${
                      isClassic
                        ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                        : "bg-white border-slate-200/80 hover:border-indigo-200 shadow-sm"
                    }`}
                  >
                    {/* Visual Health Indicator Bar on Top Edge */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${health.barColor}`} />

                    <div className="pt-1">
                      {/* Top Header badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>

                        {/* Visual Health Indicator Badge */}
                        <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${health.badgeBgClass}`}>
                          <span className={`w-2 h-2 rounded-full ${health.dotColor} ${health.group === "replace" ? "animate-pulse" : ""}`} />
                          <HealthIcon className="w-3.5 h-3.5" />
                          <span>{health.badgeLabel}</span>
                        </div>
                      </div>

                      {/* Title & Detail Trigger */}
                      <div className="flex items-start justify-between gap-2 mt-2">
                        <h3
                          onClick={() => setViewingItem(item)}
                          className="text-lg font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 transition"
                        >
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setViewingItem(item)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Fiche détaillée"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Visual Health Progress Bar */}
                      <div className="mt-2.5 mb-3 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-slate-400" />
                            Santé du matériel :
                          </span>
                          <span className={health.text}>{health.statusText} ({health.progressPercent}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${health.progressPercent}%` }}
                            className={`h-full ${health.barColor} transition-all duration-300`}
                          />
                        </div>
                      </div>

                      {/* Location & Notes */}
                      <div className="space-y-1.5 mt-2">
                        {item.location && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        )}

                        {assignedText && (
                          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            <Tag className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{assignedText}</span>
                          </div>
                        )}

                        {item.notes && (
                          <div className="flex items-start gap-1.5 text-xs text-slate-400 mt-2 bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="line-clamp-2 italic">{item.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Quick Health Condition Switcher Buttons */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-[10px] font-semibold">
                        <span className="text-slate-400 shrink-0">Modifier état :</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickConditionChange(item, "Bon état")}
                            className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                              health.group === "good"
                                ? "bg-emerald-500 text-white border-emerald-600 font-bold"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                            title="Marquer en bon état"
                          >
                            🟢 Bon
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickConditionChange(item, "À réparer")}
                            className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                              health.group === "repair"
                                ? "bg-amber-500 text-white border-amber-600 font-bold"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-700"
                            }`}
                            title="Signaler à réparer"
                          >
                            🟠 Réparer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickConditionChange(item, "À remplacer")}
                            className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                              health.group === "replace"
                                ? "bg-rose-500 text-white border-rose-600 font-bold"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-700"
                            }`}
                            title="Signaler à remplacer"
                          >
                            🔴 Remplacer
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer Controls & Stock */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Stock:</span>
                        <div className={`flex items-center gap-1 border rounded-xl p-0.5 ${
                          isOutOfStock
                            ? "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800"
                            : isLowStock
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        }`}>
                          <button
                            type="button"
                            onClick={() => handleAdjustQuantity(item, -1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                            title="Diminuer le stock"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`px-1 text-xs font-bold min-w-[22px] text-center ${
                            isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-800 dark:text-slate-100"
                          }`}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustQuantity(item, 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                            title="Augmenter le stock"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition cursor-pointer"
                          title="Modifier l'équipement"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(item.id)}
                          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* TABLE VIEW */}
          {viewMode === "table" && (
            <div className={`rounded-3xl border overflow-hidden ${
              isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b text-slate-400 font-bold uppercase tracking-wider ${
                    isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <tr>
                      <th className="py-3 px-4">Équipement</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4">État & Santé</th>
                      <th className="py-3 px-4">Stock & Ajustement</th>
                      <th className="py-3 px-4">Attribution</th>
                      <th className="py-3 px-4">Emplacement</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEquipment.map((item, index) => {
                      const health = getHealthInfo(item.condition);
                      const HealthIcon = health.icon;
                      const assignedText = getAssignedLabel(item);
                      const isOutOfStock = item.quantity === 0;

                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -16, y: 6 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.35), ease: "easeOut" }}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            <button
                              type="button"
                              onClick={() => setViewingItem(item)}
                              className="hover:underline text-left cursor-pointer"
                            >
                              {item.name}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getCategoryBadgeClass(item.category)}`}>
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${health.badgeBgClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${health.dotColor}`} />
                                <HealthIcon className="w-3 h-3" />
                                {health.badgeLabel}
                              </span>
                              <div className="w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div style={{ width: `${health.progressPercent}%` }} className={`h-full ${health.barColor}`} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAdjustQuantity(item, -1)}
                                className="w-5 h-5 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                              >
                                -
                              </button>
                              <span className={`font-mono font-bold px-1.5 ${isOutOfStock ? "text-rose-600" : ""}`}>
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAdjustQuantity(item, 1)}
                                className="w-5 h-5 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {assignedText || <span className="text-slate-400 italic">Non assigné</span>}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono">
                            {item.location || "-"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setViewingItem(item)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600"
                                title="Voir la fiche"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600"
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(item.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
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
            </div>
          )}

          {/* ALERTS & MAINTENANCE VIEW */}
          {viewMode === "alerts" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
                <Wrench className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold">Centre de Réparation, Maintenance & Remplacement</h4>
                  <p className="opacity-90">
                    Ces équipements nécessitent une révision, une réparation, un remplacement urgent ou sont actuellement en rupture de stock.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEquipment.map((item, index) => {
                  const health = getHealthInfo(item.condition);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -16, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
                      className={`p-5 rounded-3xl border space-y-4 relative overflow-hidden ${
                        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
                      }`}
                    >
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${health.barColor}`} />

                      <div className="flex items-start justify-between gap-2 pt-1">
                        <div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${health.badgeBgClass}`}>
                            {health.badgeLabel}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{item.name}</h3>
                          <p className="text-xs text-slate-500">Catégorie: {item.category}</p>
                        </div>

                        <div className="text-right">
                          <span className={`text-sm font-mono font-bold ${item.quantity === 0 ? "text-rose-600" : "text-amber-600"}`}>
                            Stock: {item.quantity}
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-xs italic bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          "{item.notes}"
                        </p>
                      )}

                      {/* Quick Maintenance Resolution Buttons */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-400 text-[11px]">Changer l'état rapide :</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickConditionChange(item, "Bon état")}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold transition cursor-pointer"
                          >
                            🟢 Bon état
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickConditionChange(item, "À remplacer")}
                            className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold transition cursor-pointer"
                          >
                            🔴 À remplacer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                            title="Éditer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. ITEM DETAIL DRAWER / MODAL */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 relative ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getCategoryBadgeClass(viewingItem.category)}`}>
                    {viewingItem.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getConditionBadgeClass(viewingItem.condition)}`}>
                    {viewingItem.condition}
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl">{viewingItem.name}</h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Diagnostic de Santé Box */}
                {(() => {
                  const health = getHealthInfo(viewingItem.condition);
                  const HealthIcon = health.icon;
                  return (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-500" />
                          Diagnostic & État de Santé
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${health.badgeBgClass}`}>
                          <HealthIcon className="w-3.5 h-3.5" />
                          {health.badgeLabel}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-600 dark:text-slate-300">Niveau d'état opérationnel</span>
                          <span className={health.text}>{health.progressPercent}% - {health.statusText}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div style={{ width: `${health.progressPercent}%` }} className={`h-full ${health.barColor}`} />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {health.group === "good" && "Matériel en parfait état de fonctionnement. Aucune intervention requise."}
                        {health.group === "repair" && "Matériel usé ou dégradé nécessitant une réparation, un entretien ou un contrôle préventif."}
                        {health.group === "replace" && "Matériel à remplacer en priorité ou hors service. Planifier un réapprovisionnement urgent."}
                      </p>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block font-medium">Quantité disponible</span>
                    <span className="text-lg font-bold font-mono">{viewingItem.quantity} unités</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Emplacement</span>
                    <span className="text-sm font-bold font-mono text-emerald-600">
                      {viewingItem.location || "Non spécifié"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">
                    Attribution Actuelle
                  </span>
                  <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    {getAssignedLabel(viewingItem) || "Matériel non attribué (stock général)"}
                  </p>
                </div>

                {viewingItem.notes && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="text-amber-700 dark:text-amber-300 font-bold block">Notes & Remarques</span>
                    <p className="text-slate-700 dark:text-slate-200 italic">{viewingItem.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingItem;
                    setViewingItem(null);
                    handleOpenEdit(target);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 transition cursor-pointer flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                </button>

                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Form Drawer: Create / Edit Equipment */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              id="equipment-form-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className={`w-full max-w-xl h-full shadow-2xl flex flex-col justify-between border-l overflow-hidden ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
              }`}
            >
              {/* Drawer Top Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-xl">
                        {editingItem ? "Modifier l'Équipement" : "Nouveau Matériel"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {editingItem ? `Mise à jour de la fiche ${editingItem.name}` : "Enregistrez un nouvel équipement dans l'inventaire du club"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!editingItem && (
                      <button
                        type="button"
                        onClick={handleFillDemoData}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
                        title="Remplir automatiquement des données de test"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>✨ Démo</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-400">Complétude du dossier :</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{completionPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 mt-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 overflow-x-auto scrollbar-none">
                  {FORM_TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeFormTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFormTab(tab.id as any)}
                        className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isActive
                            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tab.label.split(". ")[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3.5 rounded-2xl font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Quick Presets Bar (Only when creating) */}
                {!editingItem && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        Modèles Rapides & Autoremplissage
                      </span>
                      {templateAppliedNotice && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                          {templateAppliedNotice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {PRESET_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.label}
                          type="button"
                          onClick={() => handleApplyTemplate(tmpl)}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-slate-700 dark:text-slate-200 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{tmpl.icon}</span>
                          <span>{tmpl.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form id="equipment-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* TAB 1: GENERAL */}
                  {activeFormTab === "general" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Nom de l'équipement *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Ballons Taille 5, Jeu de Maillots Domicile, Plots..."
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Catégorie d'équipement *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {CATEGORIES.map((cat) => {
                            const isSelected = category === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                                  isSelected
                                    ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30 font-bold"
                                    : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                                }`}
                              >
                                <span className={`p-2 rounded-xl text-xs ${getCategoryBadgeClass(cat)}`}>
                                  <Tag className="w-3.5 h-3.5" />
                                </span>
                                <div>
                                  <span className="block text-xs font-bold">{cat}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Code / Référence interne
                          </label>
                          <div className="relative">
                            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              placeholder="Ex: EQ-2026-004"
                              value={serialNumber}
                              onChange={(e) => setSerialNumber(e.target.value)}
                              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border outline-none text-xs ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-slate-50 border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Fournisseur / Marque
                          </label>
                          <div className="relative">
                            <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              placeholder="Ex: Decathlon Pro, Nike..."
                              value={supplier}
                              onChange={(e) => setSupplier(e.target.value)}
                              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border outline-none text-xs ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-slate-50 border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: STOCK & CONDITION */}
                  {activeFormTab === "stock" && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Quantité disponible en stock *
                          </label>
                          {(() => {
                            const qtyNum = parseInt(quantity, 10) || 0;
                            if (qtyNum === 0) {
                              return (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                  🔴 Rupture de stock
                                </span>
                              );
                            }
                            if (qtyNum <= (parseInt(minQuantityAlert, 10) || 2)) {
                              return (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                  🟠 Stock faible
                                </span>
                              );
                            }
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                🟢 Stock suffisant
                              </span>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(0, (parseInt(quantity, 10) || 0) - 1).toString())}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition flex items-center justify-center cursor-pointer text-lg shadow-xs"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-24 text-center text-lg font-black font-mono py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => setQuantity(((parseInt(quantity, 10) || 0) + 1).toString())}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition flex items-center justify-center cursor-pointer text-lg shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-1.5 ml-auto">
                            <button
                              type="button"
                              onClick={() => setQuantity(((parseInt(quantity, 10) || 0) + 5).toString())}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold hover:bg-slate-100 transition"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuantity(((parseInt(quantity, 10) || 0) + 10).toString())}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold hover:bg-slate-100 transition"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuantity("0")}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 text-[11px] font-bold hover:bg-rose-100 transition"
                            >
                              Rézéro
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          État général & Santé du matériel *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {CONDITIONS.map((cond) => {
                            const health = getHealthInfo(cond);
                            const isSelected = condition === cond;
                            return (
                              <button
                                key={cond}
                                type="button"
                                onClick={() => setCondition(cond)}
                                className={`p-3 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden ${
                                  isSelected
                                    ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30"
                                    : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300"
                                }`}
                              >
                                <div className={`absolute top-0 left-0 right-0 h-1 ${health.barColor}`} />
                                <div className="flex items-center justify-between mb-1 pt-1">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${health.badgeBgClass}`}>
                                    {health.badgeLabel}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-slate-400">
                                    {health.progressPercent}%
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">{cond}</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                  {health.statusText}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Emplacement / Local de rangement
                        </label>
                        <div className="relative mb-2">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="Ex: Local A, Armoire 2 - Étagère Basse, Sac 1..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-semibold">Suggestions :</span>
                          {["Local Matériel A", "Armoire 1", "Vestiaire Principal", "Infirmerie", "Terrain Annexe"].map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => setLocation(loc)}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                            >
                              + {loc}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ASSIGNMENT & FINANCIAL DETAILS */}
                  {activeFormTab === "assignment" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Attribution du matériel
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAssignedToType("none");
                              setAssignedToId("");
                            }}
                            className={`p-2.5 rounded-xl border text-center transition ${
                              assignedToType === "none"
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600"
                            }`}
                          >
                            <Boxes className="w-4 h-4 mx-auto mb-1 opacity-70" />
                            <span className="text-xs">Aucune (Stock Général)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAssignedToType("team")}
                            className={`p-2.5 rounded-xl border text-center transition ${
                              assignedToType === "team"
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600"
                            }`}
                          >
                            <Users className="w-4 h-4 mx-auto mb-1 opacity-70" />
                            <span className="text-xs">Équipe</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAssignedToType("member")}
                            className={`p-2.5 rounded-xl border text-center transition ${
                              assignedToType === "member"
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600"
                            }`}
                          >
                            <User className="w-4 h-4 mx-auto mb-1 opacity-70" />
                            <span className="text-xs">Membre</span>
                          </button>
                        </div>

                        {assignedToType === "team" && (
                          <div className="space-y-2 pt-2">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Équipe destinataire :
                            </label>
                            <select
                              value={assignedToId}
                              onChange={(e) => setAssignedToId(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                            >
                              <option value="">Sélectionner une équipe...</option>
                              {teams.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} (Entraîneur: {t.coach})
                                </option>
                              ))}
                            </select>

                            {(() => {
                              const selectedTeam = teams.find((t) => t.id === assignedToId);
                              if (!selectedTeam) return null;
                              return (
                                <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 text-indigo-900 dark:text-indigo-200 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    <div>
                                      <span className="font-bold block">{selectedTeam.name}</span>
                                      <span className="text-[10px] text-indigo-600 dark:text-indigo-300">
                                        Coach : {selectedTeam.coach} • Catégorie : {selectedTeam.category}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-[10px] font-bold">
                                    {selectedTeam.memberIds?.length || 0} membres
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {assignedToType === "member" && (
                          <div className="space-y-2 pt-2">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Membre responsable :
                            </label>
                            <select
                              value={assignedToId}
                              onChange={(e) => setAssignedToId(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                            >
                              <option value="">Sélectionner un membre...</option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.email})
                                </option>
                              ))}
                            </select>

                            {(() => {
                              const selectedMember = members.find((m) => m.id === assignedToId);
                              if (!selectedMember) return null;
                              return (
                                <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200/80 text-purple-900 dark:text-purple-200 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-purple-600" />
                                    <div>
                                      <span className="font-bold block">{selectedMember.name}</span>
                                      <span className="text-[10px] text-purple-600 dark:text-purple-300">
                                        {selectedMember.email} • {selectedMember.category}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-[10px] font-bold">
                                    {selectedMember.role || "Membre"}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Prix unitaire (€)
                          </label>
                          <div className="relative">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Ex: 25.50"
                              value={unitPrice}
                              onChange={(e) => setUnitPrice(e.target.value)}
                              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border outline-none text-xs ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-slate-50 border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Date d'achat
                          </label>
                          <div className="relative">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="date"
                              value={purchaseDate}
                              onChange={(e) => setPurchaseDate(e.target.value)}
                              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border outline-none text-xs ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-slate-50 border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Consignes & Remarques
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ex: Pression recommandée, consignes de lavage, réparations..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: LIVE PREVIEW */}
                  {activeFormTab === "preview" && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                        Aperçu de la fiche équipement :
                      </span>
                      {(() => {
                        const health = getHealthInfo(condition);
                        const qtyNum = parseInt(quantity, 10) || 0;
                        return (
                          <div
                            className={`p-5 rounded-3xl border space-y-4 relative overflow-hidden shadow-lg ${
                              isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                            }`}
                          >
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${health.barColor}`} />

                            <div className="flex items-start justify-between gap-2 pt-1">
                              <div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${health.badgeBgClass}`}>
                                  {health.badgeLabel}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                                  {name.trim() || "Nom de l'équipement"}
                                </h3>
                                <p className="text-xs text-slate-500">Catégorie: {category}</p>
                              </div>

                              <div className="text-right">
                                <span className={`text-sm font-mono font-bold ${qtyNum === 0 ? "text-rose-600" : "text-amber-600"}`}>
                                  Stock: {qtyNum}
                                </span>
                                {unitPrice && (
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    ~{(parseFloat(unitPrice) * qtyNum).toFixed(2)} € total
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 border-y border-slate-100 dark:border-slate-800 py-2">
                              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                                <MapPin className="w-3.5 h-3.5" />
                                {location || "Non spécifié"}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {assignedToType === "team"
                                  ? `Équipe: ${teams.find((t) => t.id === assignedToId)?.name || "Sélectionner..."}`
                                  : assignedToType === "member"
                                  ? `Membre: ${members.find((m) => m.id === assignedToId)?.name || "Sélectionner..."}`
                                  : "Stock général"}
                              </span>
                            </div>

                            {notes && (
                              <p className="text-xs italic bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                "{notes}"
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </form>
              </div>

              {/* Drawer Bottom Action Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  form="equipment-form"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? "Enregistrer les modifications" : "Ajouter l'équipement"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            onDeleteEquipment(deletingId);
            setDeletingId(null);
          }
        }}
        title="Supprimer cet équipement ?"
        itemName={equipment.find((e) => e.id === deletingId)?.name}
        description="Cet équipement sera définitivement retiré du registre d'inventaire du club."
        confirmText="Supprimer l'équipement"
        cancelText="Conserver"
        theme={theme}
      />
    </div>
  );
};

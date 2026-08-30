import React, { useState } from "react";
import { Team, Member, Session, AppTheme } from "../types";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  User,
  X,
  Check,
  Download,
  Calendar,
  Eye,
  UserCheck,
  UserMinus,
  Sparkles,
  ChevronRight,
  Filter,
  Award,
  Crown,
  Clock,
  MapPin,
  Palette,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCog,
  Dumbbell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface TeamsProps {
  teams: Team[];
  members: Member[];
  sessions?: Session[];
  theme?: AppTheme;
  onAddTeam: (team: Omit<Team, "id" | "createdAt">) => void;
  onUpdateTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;
}

const COLOR_PRESETS = [
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Rose", hex: "#ec4899" },
  { name: "Émeraude", hex: "#10b981" },
  { name: "Ambre", hex: "#f59e0b" },
  { name: "Bleu Royal", hex: "#2563eb" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Rouge", hex: "#ef4444" },
  { name: "Cyan", hex: "#06b6d4" }
];

const SPORT_OPTIONS = [
  "Football",
  "Basketball",
  "Handball",
  "Volleyball",
  "Rugby",
  "Tennis",
  "Badminton",
  "Athlétisme",
  "Gymnastique",
  "Natation",
  "Autre Sport"
];

const CATEGORY_OPTIONS = [
  "U7 / Poussins",
  "U9 / Écoles de sport",
  "U11 / Benjamins",
  "U13 / Minimes",
  "U15 / Cadets",
  "U18 / Juniors",
  "Sénior",
  "Vétéran (+35)",
  "Loisir"
];

export const Teams: React.FC<TeamsProps> = ({
  teams,
  members,
  sessions = [],
  theme = "modern",
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam
}) => {
  const isClassic = theme === "classic";

  // Controls & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [rosterFilter, setRosterFilter] = useState<"all" | "active" | "empty">("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "members-desc" | "members-asc">("name-asc");

  // Drawer & Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  // Form Tab Control
  const [activeFormTab, setActiveFormTab] = useState<"general" | "staff" | "roster" | "notes">("general");

  // Form Input States
  const [name, setName] = useState("");
  const [sport, setSport] = useState("Football");
  const [category, setCategory] = useState("Sénior");
  const [genderCategory, setGenderCategory] = useState<"Masculin" | "Féminin" | "Mixte">("Masculin");
  const [division, setDivision] = useState("");
  const [teamColor, setTeamColor] = useState("#4f46e5");

  const [coach, setCoach] = useState("");
  const [assistantCoach, setAssistantCoach] = useState("");
  const [trainingSchedule, setTrainingSchedule] = useState("");
  const [homeGround, setHomeGround] = useState("");

  const [maxMembers, setMaxMembers] = useState("15");
  const [captainId, setCaptainId] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [memberCategoryFilter, setMemberCategoryFilter] = useState("all");

  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setSport("Football");
    setCategory("Sénior");
    setGenderCategory("Masculin");
    setDivision("");
    setTeamColor("#4f46e5");
    setCoach("");
    setAssistantCoach("");
    setTrainingSchedule("");
    setHomeGround("");
    setMaxMembers("15");
    setCaptainId("");
    setSelectedMemberIds([]);
    setMemberSearchTerm("");
    setMemberCategoryFilter("all");
    setDescription("");
    setError("");
    setEditingTeam(null);
    setActiveFormTab("general");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setName(team.name || "");
    setSport(team.sport || "Football");
    setCategory(team.category || "Sénior");
    setGenderCategory(team.genderCategory || "Masculin");
    setDivision(team.division || "");
    setTeamColor(team.teamColor || "#4f46e5");

    setCoach(team.coach || "");
    setAssistantCoach(team.assistantCoach || "");
    setTrainingSchedule(team.trainingSchedule || "");
    setHomeGround(team.homeGround || "");

    setMaxMembers(team.maxMembers ? team.maxMembers.toString() : "15");
    setCaptainId(team.captainId || "");
    setSelectedMemberIds(team.memberIds || []);
    setMemberSearchTerm("");
    setMemberCategoryFilter("all");
    setDescription(team.description || "");
    setError("");
    setActiveFormTab("general");
    setIsFormOpen(true);
  };

  const applyPreset = (preset: {
    name: string;
    sport: string;
    category: string;
    genderCategory: "Masculin" | "Féminin" | "Mixte";
    division: string;
    coach: string;
    assistantCoach: string;
    trainingSchedule: string;
    homeGround: string;
    maxMembers: string;
    teamColor: string;
    description: string;
  }) => {
    setName(preset.name);
    setSport(preset.sport);
    setCategory(preset.category);
    setGenderCategory(preset.genderCategory);
    setDivision(preset.division);
    setCoach(preset.coach);
    setAssistantCoach(preset.assistantCoach);
    setTrainingSchedule(preset.trainingSchedule);
    setHomeGround(preset.homeGround);
    setMaxMembers(preset.maxMembers);
    setTeamColor(preset.teamColor);
    setDescription(preset.description);
  };

  const handleFillDemoData = () => {
    const demoPresets = [
      {
        name: "Équipe U18 Féminine A",
        sport: "Basketball",
        category: "U18 / Juniors",
        genderCategory: "Féminin" as const,
        division: "Régionale 1",
        coach: "Nathalie Simon",
        assistantCoach: "Antoine Roux",
        trainingSchedule: "Mardi & Jeudi • 18h00 - 19h30",
        homeGround: "Gymnase Pasteur - Salle Couverte A",
        maxMembers: "14",
        teamColor: "#ec4899",
        description: "Équipe compétition régionale visant la qualification pour les phases finales."
      },
      {
        name: "Séniors A Compétition",
        sport: "Football",
        category: "Sénior",
        genderCategory: "Masculin" as const,
        division: "Départementale 1",
        coach: "Philippe Garcia",
        assistantCoach: "Marc Vasseur",
        trainingSchedule: "Mercredi & Vendredi • 19h30 - 21h00",
        homeGround: "Stade Municipal - Terrain Synthétique 1",
        maxMembers: "18",
        teamColor: "#4f46e5",
        description: "Équipe fanion du club engagée en coupe et championnat départemental."
      },
      {
        name: "Section Loisir Adultes",
        sport: "Volleyball",
        category: "Loisir",
        genderCategory: "Mixte" as const,
        division: "Loisir Inter-Clubs",
        coach: "Lucie Bernard",
        assistantCoach: "",
        trainingSchedule: "Lundi • 20h00 - 22h00",
        homeGround: "Halle des Sports Municipal",
        maxMembers: "20",
        teamColor: "#f59e0b",
        description: "Groupe loisir mixte axé sur la convivialité et des matchs amicaux."
      }
    ];

    const chosen = demoPresets[Math.floor(Math.random() * demoPresets.length)];
    applyPreset(chosen);

    // Auto select up to 4 available members
    if (members.length > 0) {
      const sampleIds = members.slice(0, 4).map((m) => m.id);
      setSelectedMemberIds(sampleIds);
      setCaptainId(sampleIds[0] || "");
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds((prev) => {
      const exists = prev.includes(memberId);
      const next = exists ? prev.filter((id) => id !== memberId) : [...prev, memberId];
      // If we deselected the captain, reset captain
      if (exists && captainId === memberId) {
        setCaptainId(next[0] || "");
      }
      return next;
    });
  };

  const handleSelectAllMembers = () => {
    if (selectedMemberIds.length === members.length) {
      setSelectedMemberIds([]);
      setCaptainId("");
    } else {
      const allIds = members.map((m) => m.id);
      setSelectedMemberIds(allIds);
      if (!captainId && allIds.length > 0) {
        setCaptainId(allIds[0]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setActiveFormTab("general");
      setError("Le nom de l'équipe est obligatoire.");
      return;
    }

    if (!coach.trim()) {
      setActiveFormTab("staff");
      setError("Le nom de l'entraîneur (coach) est obligatoire.");
      return;
    }

    const teamPayload = {
      name: name.trim(),
      coach: coach.trim(),
      assistantCoach: assistantCoach.trim() || undefined,
      memberIds: selectedMemberIds,
      category,
      genderCategory,
      sport,
      division: division.trim() || undefined,
      trainingSchedule: trainingSchedule.trim() || undefined,
      homeGround: homeGround.trim() || undefined,
      maxMembers: parseInt(maxMembers) || 15,
      captainId: captainId || undefined,
      teamColor,
      description: description.trim() || undefined
    };

    if (editingTeam) {
      onUpdateTeam({
        ...editingTeam,
        ...teamPayload
      });
    } else {
      onAddTeam(teamPayload);
    }

    resetForm();
    setIsFormOpen(false);
  };

  // CSV Export for Teams
  const exportTeamsCSV = () => {
    const headers = [
      "ID Équipe",
      "Nom Équipe",
      "Sport",
      "Catégorie",
      "Genre",
      "Division",
      "Entraîneur",
      "Entraîneur Adjoint",
      "Capitaine",
      "Créneau",
      "Lieu",
      "Effectif",
      "Membres"
    ];

    const rows = teams.map((t) => {
      const rosterNames = members
        .filter((m) => t.memberIds?.includes(m.id))
        .map((m) => m.name)
        .join("; ");

      const captain = members.find((m) => m.id === t.captainId);

      return [
        `"${t.id}"`,
        `"${t.name}"`,
        `"${t.sport || "Non spécifié"}"`,
        `"${t.category || "Sénior"}"`,
        `"${t.genderCategory || "Masculin"}"`,
        `"${t.division || ""}"`,
        `"${t.coach}"`,
        `"${t.assistantCoach || ""}"`,
        `"${captain ? captain.name : ""}"`,
        `"${t.trainingSchedule || ""}"`,
        `"${t.homeGround || ""}"`,
        t.memberIds?.length || 0,
        `"${rosterNames}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `equipes_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const totalTeams = teams.length;
  const assignedMemberIds = new Set(teams.flatMap((t) => t.memberIds || []));
  const totalAssignedPlayers = assignedMemberIds.size;
  const unassignedPlayersCount = members.length - totalAssignedPlayers;
  const totalCoaches = new Set(teams.map((t) => t.coach.trim()).filter(Boolean)).size;

  // Filtered Teams
  const filteredTeams = teams
    .filter((t) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search) ||
        t.coach.toLowerCase().includes(search) ||
        (t.sport && t.sport.toLowerCase().includes(search)) ||
        (t.division && t.division.toLowerCase().includes(search));

      let matchesCategory = true;
      if (categoryFilter !== "all") {
        matchesCategory = t.category === categoryFilter;
      }

      let matchesRoster = true;
      const count = t.memberIds?.length || 0;
      if (rosterFilter === "active") matchesRoster = count > 0;
      if (rosterFilter === "empty") matchesRoster = count === 0;

      return matchesSearch && matchesCategory && matchesRoster;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "members-desc") return (b.memberIds?.length || 0) - (a.memberIds?.length || 0);
      if (sortBy === "members-asc") return (a.memberIds?.length || 0) - (b.memberIds?.length || 0);
      return 0;
    });

  // Filter members inside form
  const filteredFormMembers = members.filter((m) => {
    const search = memberSearchTerm.toLowerCase();
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search) ||
      (m.email && m.email.toLowerCase().includes(search));

    let matchesCat = true;
    if (memberCategoryFilter !== "all") {
      matchesCat = m.category === memberCategoryFilter;
    }

    return matchesSearch && matchesCat;
  });

  // Completion percentage of team form
  const filledFieldsCount = [
    !!name,
    !!sport,
    !!category,
    !!genderCategory,
    !!coach,
    !!trainingSchedule,
    !!homeGround,
    selectedMemberIds.length > 0,
    !!captainId,
    !!description
  ].filter(Boolean).length;
  const formCompletionPercent = Math.round((filledFieldsCount / 10) * 100);

  const FORM_TABS = [
    { id: "general", label: "1. Général & Style", icon: Shield },
    { id: "staff", label: "2. Staff & Terrains", icon: UserCog },
    { id: "roster", label: "3. Effectif & Capitaine", icon: Users },
    { id: "notes", label: "4. Description & Notes", icon: FileText }
  ] as const;

  return (
    <div id="teams-view" className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Gestion des Équipes
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              isClassic ? "bg-[#0d6efd]/20 text-blue-300 border border-[#0d6efd]/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}>
              {totalTeams} Équipes enregistrées
            </span>
          </div>
          <p className={`text-sm ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
            Créez vos sections, attribuez les entraîneurs, gérez les créneaux et composez les effectifs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportTeamsCSV}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              isClassic
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            }`}
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>

          <button
            id="btn-add-team"
            type="button"
            onClick={handleOpenAdd}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 transition shadow-md cursor-pointer ${
              isClassic
                ? "bg-[#0d6efd] hover:bg-blue-600 shadow-blue-600/20"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouvelle Équipe</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Nombre d'Équipes</span>
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1">{totalTeams}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Joueurs Rattachés</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1 text-emerald-600">{totalAssignedPlayers} <span className="text-xs font-normal text-slate-400">/ {members.length}</span></p>
        </div>

        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Joueurs Sans Équipe</span>
            <UserMinus className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1 text-amber-600">{unassignedPlayersCount}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Coachs Référents</span>
            <UserCog className="w-4 h-4 text-purple-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1">{totalCoaches}</p>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className={`p-4 rounded-2xl border space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3 ${
        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-teams"
            type="text"
            placeholder="Rechercher par nom, coach, sport, division..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border outline-none transition ${
              isClassic
                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
              isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Roster Filter */}
          <select
            value={rosterFilter}
            onChange={(e) => setRosterFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
              isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <option value="all">Tous les effectifs</option>
            <option value="active">Avec effectif (&gt; 0)</option>
            <option value="empty">Effectif vide (0)</option>
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
              isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <option value="name-asc">Nom (A - Z)</option>
            <option value="name-desc">Nom (Z - A)</option>
            <option value="members-desc">Effectif le plus élevé</option>
            <option value="members-asc">Effectif le plus faible</option>
          </select>
        </div>
      </div>

      {/* 4. Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.length === 0 ? (
          <div className={`col-span-full p-12 text-center rounded-3xl border ${
            isClassic ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-400"
          }`}>
            Aucune équipe ne correspond à vos critères.
          </div>
        ) : (
          filteredTeams.map((team, index) => {
            const roster = members.filter((m) => team.memberIds?.includes(m.id));
            const captain = members.find((m) => m.id === team.captainId);
            const teamHex = team.teamColor || "#4f46e5";
            const max = team.maxMembers || 15;
            const currentCount = roster.length;
            const fillPercent = Math.min(100, Math.round((currentCount / max) * 100));

            return (
              <motion.div
                key={team.id}
                id={`team-card-${team.id}`}
                initial={{ opacity: 0, x: -16, y: 12 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition group hover:shadow-lg relative overflow-hidden ${
                  isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90 shadow-xs"
                }`}
              >
                {/* Top Colored Accent Strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
                  style={{ backgroundColor: teamHex }}
                />

                <div className="space-y-4 pt-1">
                  {/* Title & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md font-bold text-lg"
                        style={{ backgroundColor: teamHex }}
                      >
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg leading-tight line-clamp-1">
                          {team.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {team.sport || "Multisport"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                            {team.category || "Sénior"} • {team.genderCategory || "Masculin"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-edit-team-${team.id}`}
                        type="button"
                        onClick={() => handleOpenEdit(team)}
                        className="p-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                        title="Modifier l'équipe"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-delete-team-${team.id}`}
                        type="button"
                        onClick={() => setDeletingTeam(team)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Supprimer l'équipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Coach & Division */}
                  <div className={`p-3 rounded-2xl border space-y-1.5 text-xs ${
                    isClassic ? "bg-slate-950/60 border-slate-800" : "bg-slate-50/80 border-slate-200/60"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Coach :</span>
                      <strong className="font-semibold">{team.coach}</strong>
                    </div>

                    {team.assistantCoach && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Adjoint :</span>
                        <span>{team.assistantCoach}</span>
                      </div>
                    )}

                    {team.division && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-400 font-medium">Niveau / Division :</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{team.division}</span>
                      </div>
                    )}

                    {captain && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-500" /> Capitaine :
                        </span>
                        <span>{captain.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Schedule & Ground */}
                  {(team.trainingSchedule || team.homeGround) && (
                    <div className="space-y-1 text-xs text-slate-500">
                      {team.trainingSchedule && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{team.trainingSchedule}</span>
                        </div>
                      )}
                      {team.homeGround && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{team.homeGround}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Roster Capacity & Gauge */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" /> Effectif
                      </span>
                      <span className="font-mono font-bold">
                        {currentCount} <span className="text-slate-400 font-normal">/ {max} joueurs</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${fillPercent}%`,
                          backgroundColor: fillPercent > 100 ? "#ef4444" : teamHex
                        }}
                      />
                    </div>

                    {roster.length === 0 ? (
                      <p className="text-slate-400 text-xs italic py-1">
                        Aucun membre rattaché à cette équipe.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
                        {roster.map((m) => (
                          <span
                            key={m.id}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border ${
                              m.id === team.captainId
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold"
                                : isClassic
                                ? "bg-slate-800 border-slate-700 text-slate-300"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            {m.id === team.captainId && <Crown className="w-3 h-3 text-amber-500" />}
                            {m.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">Créé le {new Date(team.createdAt).toLocaleDateString("fr-FR")}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamDetail(team)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Fiche complète
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 5. Team Detail Roster Modal */}
      <AnimatePresence>
        {selectedTeamDetail && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedTeamDetail(null)}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg text-xl font-bold"
                  style={{ backgroundColor: selectedTeamDetail.teamColor || "#4f46e5" }}
                >
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-2xl">{selectedTeamDetail.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {selectedTeamDetail.sport || "Multisport"} • {selectedTeamDetail.category || "Sénior"} ({selectedTeamDetail.genderCategory || "Masculin"})
                    </span>
                    {selectedTeamDetail.division && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        {selectedTeamDetail.division}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Staff & Info Grid */}
              <div className={`p-4 rounded-2xl border space-y-2 text-xs sm:text-sm ${
                isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200/80"
              }`}>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Entraîneur Principal :</span>
                  <strong className="font-bold">{selectedTeamDetail.coach}</strong>
                </div>

                {selectedTeamDetail.assistantCoach && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400">Entraîneur Adjoint :</span>
                    <span className="font-semibold">{selectedTeamDetail.assistantCoach}</span>
                  </div>
                )}

                {selectedTeamDetail.trainingSchedule && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400">Créneaux :</span>
                    <span className="font-mono font-semibold">{selectedTeamDetail.trainingSchedule}</span>
                  </div>
                )}

                {selectedTeamDetail.homeGround && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400">Terrain Habituel :</span>
                    <span className="font-semibold">{selectedTeamDetail.homeGround}</span>
                  </div>
                )}

                {selectedTeamDetail.description && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px] font-semibold mb-1">Description / Objectifs :</span>
                    <p className="italic text-slate-600 dark:text-slate-300 text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      "{selectedTeamDetail.description}"
                    </p>
                  </div>
                )}
              </div>

              {/* Roster Members Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Effectif de l'Équipe ({selectedTeamDetail.memberIds?.length || 0} / {selectedTeamDetail.maxMembers || 15} membres)
                  </span>
                </h4>

                <div className={`border rounded-2xl overflow-hidden ${
                  isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  {(!selectedTeamDetail.memberIds || selectedTeamDetail.memberIds.length === 0) ? (
                    <p className="p-6 text-center text-xs text-slate-400 italic">Aucun membre rattaché.</p>
                  ) : (
                    <div className="divide-y divide-slate-200/60 dark:divide-slate-800 max-h-60 overflow-y-auto text-xs">
                      {members
                        .filter((m) => selectedTeamDetail.memberIds?.includes(m.id))
                        .map((m) => {
                          const isCaptain = m.id === selectedTeamDetail.captainId;
                          return (
                            <div key={m.id} className="p-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                                  isCaptain ? "bg-amber-500 text-white" : "bg-indigo-100 text-indigo-700"
                                }`}>
                                  {m.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm">{m.name}</span>
                                    {isCaptain && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1">
                                        <Crown className="w-3 h-3" /> Capitaine
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400">{m.age} ans • {m.category || "Joueur"}</span>
                                </div>
                              </div>
                              <div className="text-right text-[11px] text-slate-400 font-mono">
                                {m.phone || m.email || "Contact non renseigné"}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Upcoming Sessions */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  Séances programmées pour cette équipe
                </h4>

                <div className="space-y-2">
                  {sessions.filter((s) => s.teamId === selectedTeamDetail.id).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Aucune séance planifiée pour le moment.</p>
                  ) : (
                    sessions
                      .filter((s) => s.teamId === selectedTeamDetail.id)
                      .map((s) => (
                        <div
                          key={s.id}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            isClassic ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
                          }`}
                        >
                          <div>
                            <span className="font-bold block">{s.title}</span>
                            <span className="text-[10px] text-slate-400">{s.location}</span>
                          </div>
                          <div className="font-mono text-purple-600 font-bold">
                            {s.date} à {s.time}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const teamToEdit = selectedTeamDetail;
                    setSelectedTeamDetail(null);
                    handleOpenEdit(teamToEdit);
                  }}
                  className="py-2.5 px-5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 transition cursor-pointer flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier cette équipe
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTeamDetail(null)}
                  className="py-2.5 px-5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Form Drawer: Create / Edit Team (Enriched Multi-Tab Form) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              id="team-form-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className={`w-full max-w-xl h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between border-l overflow-y-auto ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
              }`}
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="space-y-3 border-b pb-4 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-extrabold text-2xl">
                        {editingTeam ? "Modifier l'Équipe" : "Créer une Nouvelle Équipe"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Renseignez la discipline, l'encadrement, les terrains et composez l'effectif.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Completion Gauge & Demo Fill Button */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 flex-1 max-w-[220px]">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${formCompletionPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-400">{formCompletionPercent}%</span>
                    </div>

                    {!editingTeam && (
                      <button
                        type="button"
                        onClick={handleFillDemoData}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-indigo-200 dark:border-indigo-800"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        Exemple Rapide
                      </button>
                    )}
                  </div>

                  {/* Form Step Tabs */}
                  <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
                    {FORM_TABS.map((tab) => {
                      const Icon = tab.icon;
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
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{tab.label.split(". ")[1]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form id="team-form" onSubmit={handleSubmit} className="space-y-4">
                  {/* TAB 1: General Info & Style */}
                  {activeFormTab === "general" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Nom de l'Équipe *
                        </label>
                        <input
                          id="input-team-name"
                          type="text"
                          required
                          placeholder="Ex: Séniors Masculins A, U18 Féminines..."
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Discipline / Sport *
                          </label>
                          <select
                            value={sport}
                            onChange={(e) => setSport(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3 outline-none text-xs sm:text-sm border transition cursor-pointer ${
                              isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                          >
                            {SPORT_OPTIONS.map((sp) => (
                              <option key={sp} value={sp}>{sp}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Catégorie d'Âge *
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3 outline-none text-xs sm:text-sm border transition cursor-pointer ${
                              isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                          >
                            {CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Genre de l'Équipe
                          </label>
                          <select
                            value={genderCategory}
                            onChange={(e) => setGenderCategory(e.target.value as any)}
                            className={`w-full rounded-xl py-2.5 px-3 outline-none text-xs sm:text-sm border transition cursor-pointer ${
                              isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                          >
                            <option value="Masculin">Masculin</option>
                            <option value="Féminin">Féminin</option>
                            <option value="Mixte">Mixte</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Niveau / Division
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Régionale 1, D2..."
                            value={division}
                            onChange={(e) => setDivision(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Team Color Picker */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-indigo-500" />
                          Couleur & Badge de l'Équipe
                        </label>
                        <div className="flex flex-wrap gap-2 items-center">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => setTeamColor(preset.hex)}
                              style={{ backgroundColor: preset.hex }}
                              className={`w-8 h-8 rounded-xl transition cursor-pointer flex items-center justify-center text-white ${
                                teamColor === preset.hex ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : "opacity-80 hover:opacity-100"
                              }`}
                              title={preset.name}
                            >
                              {teamColor === preset.hex && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>
                          ))}
                          <input
                            type="color"
                            value={teamColor}
                            onChange={(e) => setTeamColor(e.target.value)}
                            className="w-8 h-8 rounded-xl border-none cursor-pointer bg-transparent"
                            title="Couleur personnalisée"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Staff & Grounds */}
                  {activeFormTab === "staff" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Entraîneur Principal (Coach) *
                        </label>
                        <input
                          id="input-team-coach"
                          type="text"
                          required
                          placeholder="Ex: Philippe Garcia"
                          value={coach}
                          onChange={(e) => setCoach(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Entraîneur Adjoint / Manager (Optionnel)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Antoine Roux"
                          value={assistantCoach}
                          onChange={(e) => setAssistantCoach(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Créneaux d'Entraînement
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Mardi & Jeudi • 18h30 - 20h00"
                          value={trainingSchedule}
                          onChange={(e) => setTrainingSchedule(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Terrain / Lieu Habituel
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Gymnase Pasteur - Salle Couverte A"
                          value={homeGround}
                          onChange={(e) => setHomeGround(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Roster & Captain */}
                  {activeFormTab === "roster" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Capacité Max Joueurs
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={maxMembers}
                            onChange={(e) => setMaxMembers(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Capitaine Désigné
                          </label>
                          <select
                            value={captainId}
                            onChange={(e) => setCaptainId(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3 outline-none text-xs sm:text-sm border transition cursor-pointer ${
                              isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                          >
                            <option value="">Aucun capitaine</option>
                            {members
                              .filter((m) => selectedMemberIds.includes(m.id))
                              .map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Member Selection Box */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Membres de l'Équipe ({selectedMemberIds.length} / {maxMembers})
                          </label>
                          {members.length > 0 && (
                            <button
                              type="button"
                              onClick={handleSelectAllMembers}
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              {selectedMemberIds.length === members.length ? "Désélectionner tout" : "Sélectionner tout"}
                            </button>
                          )}
                        </div>

                        {/* Search & Category Filter for Members */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Filtrer nom..."
                              value={memberSearchTerm}
                              onChange={(e) => setMemberSearchTerm(e.target.value)}
                              className={`w-full py-1.5 pl-8 pr-2 rounded-lg text-xs outline-none border ${
                                isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>

                          <select
                            value={memberCategoryFilter}
                            onChange={(e) => setMemberCategoryFilter(e.target.value)}
                            className={`py-1.5 px-2 rounded-lg text-xs outline-none border ${
                              isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}
                          >
                            <option value="all">Toutes catégories</option>
                            {CATEGORY_OPTIONS.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        {/* List of Members with Selection Toggle */}
                        <div className={`border rounded-2xl p-2 max-h-52 overflow-y-auto space-y-1.5 ${
                          isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}>
                          {filteredFormMembers.length === 0 ? (
                            <p className="text-slate-400 text-xs italic text-center py-4">Aucun membre disponible.</p>
                          ) : (
                            filteredFormMembers.map((member) => {
                              const isSelected = selectedMemberIds.includes(member.id);
                              const isCaptain = member.id === captainId;

                              return (
                                <div
                                  key={member.id}
                                  onClick={() => toggleMemberSelection(member.id)}
                                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer select-none transition ${
                                    isSelected
                                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800"
                                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center text-[10px] shrink-0 ${
                                      isCaptain ? "bg-amber-500 text-white" : "bg-indigo-100 text-indigo-700"
                                    }`}>
                                      {member.name.charAt(0)}
                                    </div>
                                    <span className="text-xs font-semibold truncate">
                                      {member.name} ({member.age} ans)
                                    </span>
                                    {isCaptain && (
                                      <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                                    )}
                                  </div>

                                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition shrink-0 ${
                                    isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Notes & Description */}
                  {activeFormTab === "notes" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Description & Objectifs de l'Équipe
                        </label>
                        <textarea
                          rows={5}
                          placeholder="Saisissez les objectifs sportifs de la saison, les consignes d'entraînement, ou toute note administrative concernant cette équipe..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className={`w-full rounded-2xl p-3.5 outline-none text-xs sm:text-sm border transition resize-none ${
                            isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Drawer Footer Controls */}
              <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-2xl transition text-xs sm:text-sm text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`flex-1 font-bold py-3 rounded-2xl transition text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer text-white ${
                    isClassic ? "bg-[#0d6efd] hover:bg-blue-600" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {editingTeam ? "Enregistrer les modifications" : "Créer l'Équipe"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE TEAM CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onConfirm={() => {
          if (deletingTeam) {
            onDeleteTeam(deletingTeam.id);
            setDeletingTeam(null);
          }
        }}
        title="Supprimer cette équipe ?"
        itemName={deletingTeam?.name}
        description="L'équipe sera supprimée. Les adhérents rattachés à cette équipe repasseront en statut sans équipe."
        confirmText="Supprimer l'équipe"
        cancelText="Conserver"
        theme={theme}
      />
    </div>
  );
};

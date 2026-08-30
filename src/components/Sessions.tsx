import React, { useState } from "react";
import { Session, Team, Member, AppTheme } from "../types";
import {
  CalendarRange,
  Plus,
  Edit2,
  Trash2,
  Shield,
  MapPin,
  Search,
  X,
  Check,
  Clock,
  Download,
  Users,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  Filter,
  Grid,
  List,
  FileText,
  AlertCircle,
  Trophy,
  Zap,
  Flame,
  Repeat,
  PackageCheck,
  Send,
  ChevronRight,
  UserCheck,
  Building2,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface SessionsProps {
  sessions: Session[];
  teams: Team[];
  members?: Member[];
  theme?: AppTheme;
  onAddSession: (session: Omit<Session, "id">) => void;
  onUpdateSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
}

const EQUIPMENT_PRESETS = [
  "Chasubles rouges & bleues",
  "Ballons de match officiels",
  "Plots & cônes de balisage",
  "Échelles de rythme & haies",
  "Trousse de premiers secours",
  "Tapis de sol & étirements",
  "Sifflet & Chronomètres",
  "Feuille de match & Stylo"
];

const LOCATION_PRESETS = [
  "Stade Municipal - Terrain Synthétique A",
  "Gymnase Pasteur - Grande Salle",
  "Complexe Sportif - Terrain d'Honneur",
  "Salle de Musculation & Fitness",
  "Piste d'Athlétisme Intercommunale",
  "Extérieur / Déplacement"
];

export const Sessions: React.FC<SessionsProps> = ({
  sessions,
  teams,
  members = [],
  theme = "modern",
  onAddSession,
  onUpdateSession,
  onDeleteSession
}) => {
  const isClassic = theme === "classic";

  // Controls & View States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "today" | "past">("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

  // Drawer & Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<Session | null>(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);

  // Attendance modification state inside detail modal
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent" | "excused">>({});

  // Form Tab Control
  const [activeFormTab, setActiveFormTab] = useState<"general" | "schedule" | "details" | "consignes">("general");

  // Form input states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'Entraînement' | 'Match' | 'Stage' | 'Réunion' | 'Autre'>('Entraînement');
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [teamId, setTeamId] = useState("");
  const [location, setLocation] = useState("");
  const [intensity, setIntensity] = useState<'Faible' | 'Modérée' | 'Élevée' | 'Récupération'>('Modérée');
  const [opponent, setOpponent] = useState("");
  const [homeAway, setHomeAway] = useState<'Domicile' | 'Extérieur'>('Domicile');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState("");
  const [notes, setNotes] = useState("");
  const [notifyMembers, setNotifyMembers] = useState(true);
  const [recurrenceWeeks, setRecurrenceWeeks] = useState<number>(1);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle("");
    setType("Entraînement");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("18:30");
    setDurationMinutes(90);
    const initialTeam = teams[0];
    setTeamId(initialTeam?.id || "");
    setLocation(initialTeam?.homeGround || "");
    setIntensity("Modérée");
    setOpponent("");
    setHomeAway("Domicile");
    setSelectedEquipment(["Chasubles rouges & bleues", "Ballons de match officiels"]);
    setCustomEquipment("");
    setNotes("");
    setNotifyMembers(true);
    setRecurrenceWeeks(1);
    setError("");
    setEditingSession(null);
    setActiveFormTab("general");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (session: Session) => {
    setEditingSession(session);
    setTitle(session.title);
    setType(session.type || "Entraînement");
    setDate(session.date);
    setTime(session.time);
    setDurationMinutes(session.durationMinutes || 90);
    setTeamId(session.teamId);
    setLocation(session.location || "");
    setIntensity(session.intensity || "Modérée");
    setOpponent(session.opponent || "");
    setHomeAway(session.homeAway || "Domicile");
    setSelectedEquipment(session.equipment || []);
    setCustomEquipment("");
    setNotes(session.notes || "");
    setNotifyMembers(session.notifyMembers !== false);
    setRecurrenceWeeks(1);
    setError("");
    setActiveFormTab("general");
    setIsFormOpen(true);
  };

  const handleTeamChange = (newTeamId: string) => {
    setTeamId(newTeamId);
    const selectedTeam = teams.find((t) => t.id === newTeamId);
    if (selectedTeam && selectedTeam.homeGround && !location) {
      setLocation(selectedTeam.homeGround);
    }
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustomEquipment = () => {
    if (customEquipment.trim() && !selectedEquipment.includes(customEquipment.trim())) {
      setSelectedEquipment((prev) => [...prev, customEquipment.trim()]);
      setCustomEquipment("");
    }
  };

  const applyTitlePreset = (preset: string) => {
    setTitle(preset);
  };

  const handleFillDemoData = () => {
    const selectedTeam = teams.find((t) => t.id === teamId) || teams[0];
    const demoPresets = [
      {
        title: "Match de Championnat - J5",
        type: "Match" as const,
        durationMinutes: 120,
        intensity: "Élevée" as const,
        opponent: "AS Saint-Michel",
        homeAway: "Domicile" as const,
        location: selectedTeam?.homeGround || "Stade Municipal - Terrain Synthétique A",
        equipment: ["Ballons de match officiels", "Trousse de premiers secours", "Feuille de match & Stylo"],
        notes: "Rendez-vous obligatoire à 18h45 aux vestiaires. Tenue de compétition officielle."
      },
      {
        title: "Entraînement Tactique & Placement",
        type: "Entraînement" as const,
        durationMinutes: 90,
        intensity: "Modérée" as const,
        opponent: "",
        homeAway: "Domicile" as const,
        location: selectedTeam?.homeGround || "Gymnase Pasteur - Grande Salle",
        equipment: ["Chasubles rouges & bleues", "Plots & cônes de balisage", "Ballons de match officiels"],
        notes: "Analyse vidéo des 15 premières minutes puis ateliers spécifiques par poste."
      },
      {
        title: "Séance Récupération & Étirements",
        type: "Entraînement" as const,
        durationMinutes: 60,
        intensity: "Récupération" as const,
        opponent: "",
        homeAway: "Domicile" as const,
        location: "Salle de Musculation & Fitness",
        equipment: ["Tapis de sol & étirements", "Trousse de premiers secours"],
        notes: "Séance axée sur la mobilité, les étirements passifs et l'hydratation."
      }
    ];

    const chosen = demoPresets[Math.floor(Math.random() * demoPresets.length)];
    setTitle(chosen.title);
    setType(chosen.type);
    setDurationMinutes(chosen.durationMinutes);
    setIntensity(chosen.intensity);
    setOpponent(chosen.opponent);
    setHomeAway(chosen.homeAway);
    setLocation(chosen.location);
    setSelectedEquipment(chosen.equipment);
    setNotes(chosen.notes);
    if (selectedTeam) {
      setTeamId(selectedTeam.id);
    }
  };

  const handleDuplicate = (session: Session) => {
    const current = new Date(session.date);
    current.setDate(current.getDate() + 7);
    const nextWeekDate = current.toISOString().split("T")[0];

    onAddSession({
      title: `${session.title} (Copie)`,
      type: session.type || "Entraînement",
      date: nextWeekDate,
      time: session.time,
      durationMinutes: session.durationMinutes || 90,
      teamId: session.teamId,
      location: session.location,
      intensity: session.intensity,
      opponent: session.opponent,
      homeAway: session.homeAway,
      equipment: session.equipment,
      notes: session.notes,
      attendeeIds: []
    });
  };

  // Calculate End Time Helper
  const calculateEndTime = (startTimeStr: string, durationMin: number) => {
    if (!startTimeStr) return "";
    const [h, m] = startTimeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "";
    const totalMin = h * 60 + m + durationMin;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setActiveFormTab("general");
      setError("Le titre de la séance est obligatoire.");
      return;
    }

    if (!teamId) {
      setActiveFormTab("general");
      setError("Veuillez sélectionner une équipe concernée.");
      return;
    }

    if (!date) {
      setActiveFormTab("schedule");
      setError("La date de la séance est obligatoire.");
      return;
    }

    if (!time) {
      setActiveFormTab("schedule");
      setError("L'heure de début est obligatoire.");
      return;
    }

    const payload = {
      title: title.trim(),
      type,
      date,
      time,
      durationMinutes,
      teamId,
      location: location.trim() || undefined,
      intensity,
      opponent: type === "Match" ? opponent.trim() || undefined : undefined,
      homeAway: type === "Match" ? homeAway : undefined,
      equipment: selectedEquipment,
      notes: notes.trim() || undefined,
      notifyMembers
    };

    if (editingSession) {
      onUpdateSession({
        ...editingSession,
        ...payload
      });
    } else {
      // Handle optional multi-week recurrence
      const weeksToCreate = recurrenceWeeks || 1;
      const baseDate = new Date(date);

      for (let i = 0; i < weeksToCreate; i++) {
        const sessionDate = new Date(baseDate);
        sessionDate.setDate(sessionDate.getDate() + i * 7);
        const formattedDate = sessionDate.toISOString().split("T")[0];

        onAddSession({
          ...payload,
          date: formattedDate,
          attendeeIds: []
        });
      }
    }

    resetForm();
    setIsFormOpen(false);
  };

  // CSV Export for Sessions Planning
  const exportSessionsCSV = () => {
    const headers = [
      "ID Séance",
      "Titre",
      "Type",
      "Équipe",
      "Coach",
      "Date",
      "Heure Début",
      "Durée (min)",
      "Lieu",
      "Intensité",
      "Adversaire",
      "Notes",
      "Présents"
    ];
    const rows = filteredSessions.map((s) => {
      const team = teams.find((t) => t.id === s.teamId);
      const attendeeCount = s.attendeeIds?.length || 0;
      return [
        `"${s.id}"`,
        `"${s.title}"`,
        `"${s.type || "Entraînement"}"`,
        `"${team?.name || ""}"`,
        `"${team?.coach || ""}"`,
        `"${s.date}"`,
        `"${s.time}"`,
        s.durationMinutes || 90,
        `"${s.location || ""}"`,
        `"${s.intensity || "Modérée"}"`,
        `"${s.opponent || ""}"`,
        `"${(s.notes || "").replace(/"/g, '""')}"`,
        attendeeCount
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `planning_seances_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Detail / Attendance Modal
  const handleOpenDetail = (session: Session) => {
    setSelectedSessionDetail(session);
    const team = teams.find((t) => t.id === session.teamId);
    const teamMembers = members.filter((m) => team?.memberIds?.includes(m.id));

    const initialMap: Record<string, "present" | "absent" | "excused"> = {};
    teamMembers.forEach((m) => {
      if (session.attendeeIds?.includes(m.id)) {
        initialMap[m.id] = "present";
      } else {
        initialMap[m.id] = "absent";
      }
    });
    setAttendanceMap(initialMap);
  };

  const handleToggleMemberAttendance = (memberId: string, status: "present" | "absent" | "excused") => {
    setAttendanceMap((prev) => ({
      ...prev,
      [memberId]: status
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedSessionDetail) return;
    const presentIds = Object.keys(attendanceMap).filter((id) => attendanceMap[id] === "present");

    onUpdateSession({
      ...selectedSessionDetail,
      attendeeIds: presentIds
    });

    setSelectedSessionDetail({
      ...selectedSessionDetail,
      attendeeIds: presentIds
    });
  };

  const handleMarkAllPresent = () => {
    if (!selectedSessionDetail) return;
    const team = teams.find((t) => t.id === selectedSessionDetail.teamId);
    const teamMembers = members.filter((m) => team?.memberIds?.includes(m.id));

    const newMap: Record<string, "present" | "absent" | "excused"> = {};
    teamMembers.forEach((m) => {
      newMap[m.id] = "present";
    });
    setAttendanceMap(newMap);
  };

  // Helper date calculations
  const todayStr = new Date().toISOString().split("T")[0];

  // KPI Calculations
  const totalSessions = sessions.length;
  const upcomingCount = sessions.filter((s) => s.date >= todayStr).length;
  const todayCount = sessions.filter((s) => s.date === todayStr).length;
  const pastCount = sessions.filter((s) => s.date < todayStr).length;

  // Dynamic presets based on session type
  const getDynamicTitlePresets = () => {
    switch (type) {
      case "Match":
        return [
          "Match de Championnat - J1",
          "Match Amical de Préparation",
          "Derby Régional",
          "Match de Coupe - 1er Tour"
        ];
      case "Stage":
        return [
          "Stage de Perfectionnement Intensif",
          "Stage Multi-Sports de Vacances",
          "Stage de Rentrée & Cohésion"
        ];
      case "Réunion":
        return [
          "Réunion Tactique & Analyse Vidéo",
          "Réunion Parents & Encadrement",
          "Bilan de Mi-Saison"
        ];
      case "Autre":
        return [
          "Soirée Club & Convivialité",
          "Séance Photo & Média Day",
          "Événement Sponsor & Partenaires"
        ];
      default: // Entraînement
        return [
          "Entraînement Tactique & Placement",
          "Préparation Physique & Cardio",
          "Séance Technique & Tirs au But",
          "Ateliers Réduits & Jeu"
        ];
    }
  };

  // Filtered & Sorted Sessions
  const filteredSessions = sessions
    .filter((s) => {
      const search = searchTerm.toLowerCase().trim();
      const team = teams.find((t) => t.id === s.teamId);
      const matchesSearch =
        !search ||
        s.title.toLowerCase().includes(search) ||
        (s.location && s.location.toLowerCase().includes(search)) ||
        (s.opponent && s.opponent.toLowerCase().includes(search)) ||
        (s.notes && s.notes.toLowerCase().includes(search)) ||
        (team && team.name.toLowerCase().includes(search)) ||
        (team && team.coach.toLowerCase().includes(search));

      let matchesStatus = true;
      if (statusFilter === "upcoming") matchesStatus = s.date >= todayStr;
      if (statusFilter === "today") matchesStatus = s.date === todayStr;
      if (statusFilter === "past") matchesStatus = s.date < todayStr;

      let matchesTeam = true;
      if (teamFilter !== "all") matchesTeam = s.teamId === teamFilter;

      let matchesType = true;
      if (typeFilter !== "all") matchesType = (s.type || "Entraînement") === typeFilter;

      return matchesSearch && matchesStatus && matchesTeam && matchesType;
    })
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return a.time.localeCompare(b.time);
    });

  const getTypeBadgeClass = (sessionType?: string) => {
    switch (sessionType) {
      case "Match":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "Stage":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "Réunion":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Autre":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: // Entraînement
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  const getIntensityBadgeClass = (intensityLevel?: string) => {
    switch (intensityLevel) {
      case "Élevée":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "Modérée":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Faible":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "Récupération":
        return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Completion percentage calculation
  const filledFieldsCount = [
    !!title,
    !!type,
    !!teamId,
    !!date,
    !!time,
    !!location,
    selectedEquipment.length > 0,
    !!notes
  ].filter(Boolean).length;
  const formCompletionPercent = Math.round((filledFieldsCount / 8) * 100);

  const FORM_TABS = [
    { id: "general", label: "1. Type & Équipe", icon: CalendarRange },
    { id: "schedule", label: "2. Date & Durée", icon: Clock },
    { id: "details", label: "3. Lieu & Matériel", icon: MapPin },
    { id: "consignes", label: "4. Consignes & Convocation", icon: FileText }
  ] as const;

  const currentSelectedTeam = teams.find((t) => t.id === teamId);

  return (
    <div id="sessions-view" className="space-y-6">
      {/* 1. Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Planning des Séances
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              isClassic ? "bg-[#0d6efd]/20 text-blue-300 border border-[#0d6efd]/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}>
              {totalSessions} Séances au total
            </span>
          </div>
          <p className={`text-sm ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
            Planifiez vos entraînements, matchs et rassemblements. Gérez la présence des membres et le matériel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportSessionsCSV}
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
            id="btn-add-session"
            type="button"
            onClick={handleOpenAdd}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 transition shadow-md cursor-pointer ${
              isClassic
                ? "bg-[#0d6efd] hover:bg-blue-600 shadow-blue-600/20"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Planifier une Séance</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">À venir</span>
            <CalendarRange className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1 text-indigo-600">{upcomingCount}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Aujourd'hui</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1 text-amber-600">{todayCount}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Séances Passées</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1 text-slate-600">{pastCount}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Programmé</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1">{totalSessions}</p>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className={`p-4 rounded-2xl border space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3 ${
        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-sessions"
            type="text"
            placeholder="Rechercher par titre, lieu, adversaire, coach..."
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
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
              isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <option value="all">Toutes les dates</option>
            <option value="upcoming">Séances à venir</option>
            <option value="today">Séances d'aujourd'hui</option>
            <option value="past">Séances passées</option>
          </select>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
              isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <option value="all">Toutes les équipes</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
              isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <option value="all">Tous les types</option>
            <option value="Entraînement">Entraînement</option>
            <option value="Match">Match</option>
            <option value="Stage">Stage</option>
            <option value="Réunion">Réunion</option>
            <option value="Autre">Autre</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Vue Cartes"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Vue Liste / Tableau"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Sessions Render */}
      {filteredSessions.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isClassic ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-400"
        }`}>
          Aucune séance ne correspond à votre recherche.
        </div>
      ) : viewMode === "cards" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => {
            const team = teams.find((t) => t.id === session.teamId);
            const isToday = session.date === todayStr;
            const teamRoster = members.filter((m) => team?.memberIds?.includes(m.id));
            const attendeeCount = session.attendeeIds?.length || 0;

            return (
              <div
                id={`session-card-${session.id}`}
                key={session.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between transition group hover:shadow-lg relative overflow-hidden ${
                  isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90 shadow-xs"
                }`}
              >
                {/* Team accent border top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: team?.teamColor || "#4f46e5" }}
                />

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getTypeBadgeClass(session.type)}`}>
                      {session.type || "Entraînement"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {session.intensity && (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getIntensityBadgeClass(session.intensity)}`}>
                          Intensité : {session.intensity}
                        </span>
                      )}
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                          Aujourd'hui
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base leading-snug group-hover:text-indigo-600 transition">
                      {session.title}
                    </h3>
                    {team && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{team.name}</span>
                        <span className="text-slate-400">({team.coach})</span>
                      </p>
                    )}
                  </div>

                  {session.type === "Match" && session.opponent && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs flex items-center justify-between text-rose-800 dark:text-rose-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-rose-500" /> vs {session.opponent}
                      </span>
                      <span className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded-md text-[10px] uppercase font-mono">
                        {session.homeAway || "Domicile"}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>
                        {new Date(session.date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short"
                        })} à <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{session.time}</strong>
                        {session.durationMinutes ? ` (${session.durationMinutes} min)` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{session.location || "Lieu non spécifié"}</span>
                    </div>

                    {session.equipment && session.equipment.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                        <PackageCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{session.equipment.join(" • ")}</span>
                      </div>
                    )}

                    {session.notes && (
                      <p className="text-[11px] text-slate-400 italic pt-1 line-clamp-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(session)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Appel ({attendeeCount}/{teamRoster.length})
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(session)}
                      className="p-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-lg transition cursor-pointer"
                      title="Dupliquer pour la semaine prochaine"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(session)}
                      className="p-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                      title="Modifier la séance"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingSession(session)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      title="Supprimer la séance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table / List View */
        <div className={`border rounded-3xl overflow-hidden shadow-xs ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-bold text-slate-400 uppercase tracking-wider ${
                  isClassic ? "bg-slate-950/80 border-slate-800" : "bg-slate-50/80 border-slate-200/80"
                }`}>
                  <th className="p-3.5">Séance & Type</th>
                  <th className="p-3.5">Équipe</th>
                  <th className="p-3.5">Date & Heure</th>
                  <th className="p-3.5">Lieu</th>
                  <th className="p-3.5">Présence</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isClassic ? "divide-slate-800" : "divide-slate-100"}`}>
                {filteredSessions.map((session) => {
                  const team = teams.find((t) => t.id === session.teamId);
                  const attendeeCount = session.attendeeIds?.length || 0;
                  const totalRoster = team?.memberIds?.length || 0;

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getTypeBadgeClass(session.type)}`}>
                            {session.type || "Entraînement"}
                          </span>
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{session.title}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold">
                        {team ? team.name : "Équipe inconnue"}
                      </td>
                      <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {session.date} à {session.time} ({session.durationMinutes || 90}m)
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {session.location || "-"}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px]">
                          {attendeeCount} / {totalRoster} inscrits
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(session)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                            title="Appel"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(session)}
                            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingSession(session)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Detail & Attendance Modal */}
      <AnimatePresence>
        {selectedSessionDetail && (
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
                onClick={() => setSelectedSessionDetail(null)}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                  isClassic ? "bg-[#0d6efd]" : "bg-indigo-600"
                }`}>
                  <CalendarRange className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getTypeBadgeClass(selectedSessionDetail.type)}`}>
                      {selectedSessionDetail.type || "Entraînement"}
                    </span>
                    {selectedSessionDetail.intensity && (
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getIntensityBadgeClass(selectedSessionDetail.intensity)}`}>
                        {selectedSessionDetail.intensity}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-extrabold text-xl mt-1">{selectedSessionDetail.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {selectedSessionDetail.date} à {selectedSessionDetail.time} ({selectedSessionDetail.durationMinutes || 90}m)</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> {selectedSessionDetail.location || "Lieu non spécifié"}</span>
                  </p>
                </div>
              </div>

              {selectedSessionDetail.type === "Match" && selectedSessionDetail.opponent && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between font-bold">
                  <span>Match contre : {selectedSessionDetail.opponent}</span>
                  <span className="uppercase font-mono text-[10px] bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {selectedSessionDetail.homeAway || "Domicile"}
                  </span>
                </div>
              )}

              {selectedSessionDetail.equipment && selectedSessionDetail.equipment.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <strong className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Matériel Requis :</strong>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedSessionDetail.equipment.map((eq) => (
                      <span key={eq} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-[11px]">
                        • {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSessionDetail.notes && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                  <strong className="block font-bold mb-0.5">Consignes / Notes du coach :</strong>
                  {selectedSessionDetail.notes}
                </div>
              )}

              {/* Attendance Sheet */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Feuille de Présence Équipe
                  </h4>
                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Tout marquer présent
                  </button>
                </div>

                {(() => {
                  const team = teams.find((t) => t.id === selectedSessionDetail.teamId);
                  const teamMembers = members.filter((m) => team?.memberIds?.includes(m.id));

                  if (!teamMembers.length) {
                    return (
                      <p className="text-xs text-slate-400 italic p-4 text-center border rounded-2xl">
                        Aucun membre n'est actuellement rattaché à cette équipe. Veuillez affecter des membres dans la rubrique "Équipes".
                      </p>
                    );
                  }

                  const presentCount = Object.values(attendanceMap).filter((v) => v === "present").length;
                  const ratio = Math.round((presentCount / teamMembers.length) * 100);

                  return (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{presentCount} présent(s)</span>
                          <span className="text-slate-400 font-normal"> / {teamMembers.length} joueurs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${ratio}%` }} />
                          </div>
                          <span className="font-bold font-mono text-emerald-600">{ratio}%</span>
                        </div>
                      </div>

                      <div className={`border rounded-2xl divide-y text-xs max-h-60 overflow-y-auto ${
                        isClassic ? "bg-slate-950 border-slate-800 divide-slate-800" : "bg-white border-slate-200 divide-slate-100"
                      }`}>
                        {teamMembers.map((member) => {
                          const status = attendanceMap[member.id] || "absent";
                          return (
                            <div key={member.id} className="p-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                                  {member.name.charAt(0)}
                                </div>
                                <span className="font-bold truncate">{member.name}</span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleMemberAttendance(member.id, "present")}
                                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                                    status === "present"
                                      ? "bg-emerald-500 text-white shadow-sm"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600"
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Présent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleMemberAttendance(member.id, "absent")}
                                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                                    status === "absent"
                                      ? "bg-rose-500 text-white shadow-sm"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600"
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Absent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleMemberAttendance(member.id, "excused")}
                                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                                    status === "excused"
                                      ? "bg-amber-500 text-white shadow-sm"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-600"
                                  }`}
                                >
                                  <HelpCircle className="w-3.5 h-3.5" /> Excusé
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSessionDetail(null)}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="py-2.5 px-6 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-500 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Enregistrer la présence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Form Drawer: Plan / Edit Session (Enriched Multi-Tab Form) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              id="session-form-drawer"
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
                        {editingSession ? "Modifier la Séance" : "Planifier une Nouvelle Séance"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Définit le type de rassemblement, le créneau horraire, le lieu et les équipements requis.
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

                    {!editingSession && (
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
                          className={`flex-1 min-w-[100px] py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
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

                <form id="session-form" onSubmit={handleSubmit} className="space-y-4">
                  {/* TAB 1: General & Type */}
                  {activeFormTab === "general" && (
                    <div className="space-y-4">
                      {/* Type Selector with Cards */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Type de Séance *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {[
                            { id: "Entraînement", icon: CalendarRange, color: "text-blue-500", desc: "Pratique régulière" },
                            { id: "Match", icon: Trophy, color: "text-rose-500", desc: "Compétition" },
                            { id: "Stage", icon: Zap, color: "text-purple-500", desc: "Perfectionnement" },
                            { id: "Réunion", icon: FileText, color: "text-emerald-500", desc: "Staff / Tactique" },
                            { id: "Autre", icon: Sparkles, color: "text-amber-500", desc: "Événement spécial" }
                          ].map((t) => {
                            const Icon = t.icon;
                            const isSelected = type === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setType(t.id as any)}
                                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                                  isSelected
                                    ? isClassic
                                      ? "bg-slate-800 border-blue-500 ring-2 ring-blue-500/30"
                                      : "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20"
                                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <Icon className={`w-4 h-4 ${t.color}`} />
                                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                                </div>
                                <div>
                                  <strong className="block font-bold text-slate-800 dark:text-slate-200">{t.id}</strong>
                                  <span className="text-[10px] text-slate-400">{t.desc}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Title & Presets */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Titre de la Séance *
                        </label>
                        <input
                          id="input-session-title"
                          type="text"
                          required
                          placeholder="Ex: Entraînement Tactique, Match vs AS Saint-Michel..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-[10px] text-slate-400 self-center mr-1">Suggestions :</span>
                          {getDynamicTitlePresets().map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => applyTitlePreset(preset)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            >
                              + {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Team Selection */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Équipe Concernée *
                        </label>
                        <select
                          id="input-session-team"
                          required
                          value={teamId}
                          onChange={(e) => handleTeamChange(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        >
                          <option value="">-- Sélectionner une équipe --</option>
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} (Coach: {t.coach}) • {t.sport || "Sport"} ({t.category || "Sénior"})
                            </option>
                          ))}
                        </select>

                        {currentSelectedTeam && (
                          <div className="mt-2 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-indigo-500" />
                              <div>
                                <span className="font-bold text-indigo-900 dark:text-indigo-200 block">{currentSelectedTeam.name}</span>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                                  Entraîneur : {currentSelectedTeam.coach} • {currentSelectedTeam.memberIds?.length || 0} membres rattachés
                                </span>
                              </div>
                            </div>
                            {currentSelectedTeam.homeGround && (
                              <button
                                type="button"
                                onClick={() => setLocation(currentSelectedTeam.homeGround || "")}
                                className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 text-indigo-600 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 transition cursor-pointer"
                              >
                                Utiliser terrain habituel
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Schedule & Duration */}
                  {activeFormTab === "schedule" && (
                    <div className="space-y-4">
                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Date de la séance *
                          </label>
                          <input
                            id="input-session-date"
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                                : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Heure de début *
                          </label>
                          <input
                            id="input-session-time"
                            type="time"
                            required
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                                : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Duration Chips & End Time Calculation */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Durée Estimée
                          </label>
                          {time && (
                            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              Fin estimée à {calculateEndTime(time, durationMinutes)}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
                          {[
                            { label: "45m", min: 45 },
                            { label: "1h (60m)", min: 60 },
                            { label: "1h15", min: 75 },
                            { label: "1h30", min: 90 },
                            { label: "2h (120m)", min: 120 },
                            { label: "2h30", min: 150 }
                          ].map((d) => (
                            <button
                              key={d.min}
                              type="button"
                              onClick={() => setDurationMinutes(d.min)}
                              className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer ${
                                durationMinutes === d.min
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Intensity Level */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Niveau d'Intensité Physique
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {[
                            { id: "Faible", label: "🟢 Faible", desc: "Échauffement / Repos" },
                            { id: "Modérée", label: "🟡 Modérée", desc: "Rythme classique" },
                            { id: "Élevée", label: "🔴 Élevée", desc: "Haute intensité / VMA" },
                            { id: "Récupération", label: "🔵 Récupération", desc: "Étirements / Soins" }
                          ].map((lvl) => (
                            <button
                              key={lvl.id}
                              type="button"
                              onClick={() => setIntensity(lvl.id as any)}
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                intensity === lvl.id
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <strong className="block font-bold">{lvl.label}</strong>
                              <span className={`text-[10px] block ${intensity === lvl.id ? "text-indigo-100" : "text-slate-400"}`}>
                                {lvl.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recurrence Options (Create Multiple Weeks) */}
                      {!editingSession && (
                        <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-300">
                            <Repeat className="w-4 h-4 text-purple-600" />
                            Programmation Récurrente (Optionnel)
                          </label>
                          <p className="text-[11px] text-purple-700 dark:text-purple-400">
                            Générez automatiquement cette séance chaque semaine sur plusieurs semaines consécutives.
                          </p>
                          <select
                            value={recurrenceWeeks}
                            onChange={(e) => setRecurrenceWeeks(Number(e.target.value))}
                            className="w-full rounded-xl py-2 px-3 text-xs border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-200 font-semibold cursor-pointer outline-none"
                          >
                            <option value={1}>Séance unique (1 semaine)</option>
                            <option value={2}>Répéter sur 2 semaines</option>
                            <option value={4}>Répéter sur 4 semaines (1 mois)</option>
                            <option value={8}>Répéter sur 8 semaines (2 mois)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Location, Match Spec & Equipment */}
                  {activeFormTab === "details" && (
                    <div className="space-y-4">
                      {/* Location Input & Presets */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Lieu / Terrain
                        </label>
                        <input
                          id="input-session-location"
                          type="text"
                          placeholder="Ex: Stade Municipal - Terrain Synthétique A"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          {LOCATION_PRESETS.map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => setLocation(loc)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            >
                              + {loc}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Match Specific Fields */}
                      {type === "Match" && (
                        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-3">
                          <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-rose-500" /> Détails de la Rencontre / Match
                          </h4>

                          <div>
                            <label className="block text-[11px] font-bold text-rose-700 dark:text-rose-400 mb-1">
                              Nom de l'Équipe Adversaire
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: AS Saint-Michel, FC Métropole..."
                              value={opponent}
                              onChange={(e) => setOpponent(e.target.value)}
                              className="w-full rounded-xl py-2 px-3 text-xs border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-rose-700 dark:text-rose-400 mb-1">
                              Lieu de la rencontre
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setHomeAway("Domicile")}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                                  homeAway === "Domicile"
                                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-rose-200 dark:border-rose-800"
                                }`}
                              >
                                🏠 Match à Domicile
                              </button>
                              <button
                                type="button"
                                onClick={() => setHomeAway("Extérieur")}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                                  homeAway === "Extérieur"
                                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-rose-200 dark:border-rose-800"
                                }`}
                              >
                                🚌 Match à l'Extérieur
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Equipment Checklist */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Matériel & Équipement à Prévoir
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {EQUIPMENT_PRESETS.map((item) => {
                            const isChecked = selectedEquipment.includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => toggleEquipment(item)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                                  isChecked
                                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3" />}
                                {item}
                              </button>
                            );
                          })}
                        </div>

                        {/* Add custom equipment */}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Autre matériel spécifique..."
                            value={customEquipment}
                            onChange={(e) => setCustomEquipment(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomEquipment();
                              }
                            }}
                            className="flex-1 rounded-xl py-2 px-3 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomEquipment}
                            className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Consignes & Convocation */}
                  {activeFormTab === "consignes" && (
                    <div className="space-y-4">
                      {/* Coach Notes & Snippets */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Consignes du Coach pour les Joueurs
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Ex: Rendez-vous 15min avant le début aux vestiaires. Tenue d'entraînement complète et gourde d'eau obligatoire..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-[10px] text-slate-400 self-center mr-1">Raccourcis :</span>
                          {[
                            "Rendez-vous 15 min avant aux vestiaires",
                            "Tenue officielle & protège-tibias",
                            "Apporter gourde d'eau individuelle",
                            "Analyse vidéo d'avant-match"
                          ].map((snippet) => (
                            <button
                              key={snippet}
                              type="button"
                              onClick={() => setNotes((prev) => (prev ? `${prev} ${snippet}.` : `${snippet}.`))}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            >
                              + {snippet}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notification Checkbox */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <strong className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-indigo-500" /> Notifications Joueurs
                          </strong>
                          <span className="text-[11px] text-slate-400 block">
                            Envoyer une alerte de convocation aux membres rattachés à cette équipe.
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifyMembers}
                          onChange={(e) => setNotifyMembers(e.target.checked)}
                          className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                      </div>

                      {/* Live Session Preview Banner */}
                      <div className="p-4 rounded-2xl border bg-slate-900 text-white space-y-2 relative overflow-hidden">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Aperçu de la séance
                          </span>
                          <span>{date || "Aujourd'hui"} à {time || "18:30"}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-white">{title || "Titre de la séance"}</h4>
                          <span className="text-xs text-slate-300">
                            Équipe : {currentSelectedTeam ? currentSelectedTeam.name : "Non sélectionnée"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          <span>⏱️ {durationMinutes} min</span>
                          <span>📍 {location || "Lieu à définir"}</span>
                          {selectedEquipment.length > 0 && <span>📦 {selectedEquipment.length} équipements</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-6 mt-8">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-xl transition text-xs sm:text-sm text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`flex-1 font-bold py-3 rounded-xl transition text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer text-white ${
                    isClassic ? "bg-[#0d6efd] hover:bg-blue-600" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {editingSession ? "Enregistrer" : recurrenceWeeks > 1 ? `Planifier (${recurrenceWeeks} sem.)` : "Planifier"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE SESSION CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        onConfirm={() => {
          if (deletingSession) {
            onDeleteSession(deletingSession.id);
            setDeletingSession(null);
          }
        }}
        title="Supprimer cette séance ?"
        itemName={deletingSession?.title}
        description="La séance sera retirée du calendrier. La feuille d'appel et les présences associées seront effacées."
        confirmText="Supprimer la séance"
        cancelText="Conserver"
        theme={theme}
      />
    </div>
  );
};

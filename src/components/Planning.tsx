import React, { useState, useMemo } from "react";
import { Session, Team, Member, AppTheme } from "../types";
import { exportPlanningPDF } from "../lib/pdfExporter";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Shield,
  MapPin,
  Users,
  Clock,
  Search,
  Download,
  List,
  Calendar as CalendarIcon,
  X,
  Award,
  Info,
  CheckCircle2,
  Filter,
  AlertTriangle,
  Grid,
  Share2,
  CalendarPlus,
  Trophy,
  Flame,
  Eye,
  Layers,
  Sparkles,
  ExternalLink,
  Building2,
  FileText,
  Printer,
  UserCheck,
  RotateCcw,
  Check,
  SlidersHorizontal,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const locales = {
  fr: fr
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales
});

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  teamId: string;
  teamName: string;
  teamColor?: string;
  coachName?: string;
  location?: string;
  intensity?: string;
  opponent?: string;
  homeAway?: string;
  equipment?: string[];
  notes?: string;
  attendeeIds?: string[];
  session: Session;
}

interface PlanningProps {
  sessions: Session[];
  teams: Team[];
  members: Member[];
  theme?: AppTheme;
}

type MainViewMode = "calendar" | "team_grid" | "timeline" | "conflicts";
type ColorByMode = "type" | "team";

export const Planning: React.FC<PlanningProps> = ({
  sessions,
  teams,
  members,
  theme = "modern"
}) => {
  const isClassic = theme === "classic";

  // Main Display Modes
  const [mainViewMode, setMainViewMode] = useState<MainViewMode>("calendar");
  const [colorBy, setColorBy] = useState<ColorByMode>("type");

  // Calendar Navigation & Views
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 18)); // Default July 18, 2026
  const [calView, setCalView] = useState<View>(Views.MONTH);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [coachFilter, setCoachFilter] = useState<string>("all");
  const [isMultiTeamMode, setIsMultiTeamMode] = useState<boolean>(false);
  const [teamCategoryFilter, setTeamCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [timePeriodFilter, setTimePeriodFilter] = useState<"all" | "upcoming" | "weekend" | "past">("all");

  // Modal State for Selected Session / Day / PDF
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);
  const [copiedIcsNotice, setCopiedIcsNotice] = useState(false);
  const [isExportPDFModalOpen, setIsExportPDFModalOpen] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("Planning Officiel des Entraînements & Compétitions");

  // Map teams for fast lookup
  const teamsMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  // Extract unique locations for filtering
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    sessions.forEach((s) => {
      if (s.location) locs.add(s.location);
    });
    return Array.from(locs);
  }, [sessions]);

  // Extract unique coach profiles with their associated teams
  const coachProfiles = useMemo(() => {
    const map = new Map<string, { coach: string; teamIds: string[]; teamNames: string[]; totalSessions: number }>();
    teams.forEach((t) => {
      if (t.coach && t.coach.trim()) {
        const cName = t.coach.trim();
        const entry = map.get(cName) || { coach: cName, teamIds: [], teamNames: [], totalSessions: 0 };
        if (!entry.teamIds.includes(t.id)) {
          entry.teamIds.push(t.id);
          entry.teamNames.push(t.name);
        }
        map.set(cName, entry);
      }
      if (t.assistantCoach && t.assistantCoach.trim()) {
        const aName = t.assistantCoach.trim();
        const entry = map.get(aName) || { coach: aName, teamIds: [], teamNames: [], totalSessions: 0 };
        if (!entry.teamIds.includes(t.id)) {
          entry.teamIds.push(t.id);
          entry.teamNames.push(`${t.name} (Adjoint)`);
        }
        map.set(aName, entry);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.coach.localeCompare(b.coach));
  }, [teams]);

  // Extract unique categories (e.g., Seniors, U17, U15, etc.)
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    teams.forEach((t) => {
      if (t.category && t.category.trim()) cats.add(t.category.trim());
    });
    return Array.from(cats).sort();
  }, [teams]);

  // Convert sessions to react-big-calendar events
  const allEvents = useMemo(() => {
    return sessions.map((s) => {
      const team = teamsMap.get(s.teamId);
      const dateParts = s.date.split("-").map(Number);
      const year = dateParts[0] || 2026;
      const month = (dateParts[1] || 7) - 1;
      const day = dateParts[2] || 1;

      let hours = 10;
      let minutes = 0;
      if (s.time) {
        const cleanTime = s.time.replace("h", ":").replace("H", ":");
        const parts = cleanTime.split(":");
        if (parts.length >= 1) hours = parseInt(parts[0], 10) || 10;
        if (parts.length >= 2) minutes = parseInt(parts[1], 10) || 0;
      }

      const start = new Date(year, month, day, hours, minutes);
      const duration = s.durationMinutes || 90;
      const end = new Date(start.getTime() + duration * 60 * 1000);

      return {
        id: s.id,
        title: s.title,
        start,
        end,
        type: s.type || "Entraînement",
        teamId: s.teamId,
        teamName: team ? team.name : "Équipe Générale",
        teamColor: team?.teamColor || "#4f46e5",
        coachName: team?.coach,
        location: s.location,
        intensity: s.intensity,
        opponent: s.opponent,
        homeAway: s.homeAway,
        equipment: s.equipment,
        notes: s.notes,
        attendeeIds: s.attendeeIds,
        session: s
      } as CalendarEvent;
    });
  }, [sessions, teamsMap]);

  // Precompute session counts per team for real-time badge counts
  const teamSessionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allEvents.forEach((ev) => {
      counts[ev.teamId] = (counts[ev.teamId] || 0) + 1;
    });
    return counts;
  }, [allEvents]);

  // Conflict Detection Engine
  const locationConflicts = useMemo(() => {
    const conflicts: { location: string; date: string; events: CalendarEvent[] }[] = [];
    const grouped: Record<string, CalendarEvent[]> = {};

    allEvents.forEach((ev) => {
      if (!ev.location) return;
      const key = `${ev.session.date}___${ev.location.toLowerCase().trim()}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ev);
    });

    Object.entries(grouped).forEach(([key, evList]) => {
      if (evList.length < 2) return;
      // Check for overlapping start/end times
      for (let i = 0; i < evList.length; i++) {
        for (let j = i + 1; j < evList.length; j++) {
          const a = evList[i];
          const b = evList[j];
          if (a.start < b.end && b.start < a.end) {
            const [dateStr, locStr] = key.split("___");
            conflicts.push({
              location: a.location || locStr,
              date: dateStr,
              events: [a, b]
            });
          }
        }
      }
    });

    return conflicts;
  }, [allEvents]);

  // Filter events based on search, coach, teams, category, type, location, time period
  const filteredEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return allEvents.filter((event) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        (event.location && event.location.toLowerCase().includes(search)) ||
        (event.opponent && event.opponent.toLowerCase().includes(search)) ||
        event.teamName.toLowerCase().includes(search) ||
        (event.coachName && event.coachName.toLowerCase().includes(search));

      // Coach Filter
      let matchesCoach = true;
      if (coachFilter !== "all") {
        const teamObj = teamsMap.get(event.teamId);
        const matchesMainCoach = teamObj?.coach?.toLowerCase().trim() === coachFilter.toLowerCase().trim();
        const matchesAssistant = teamObj?.assistantCoach?.toLowerCase().trim() === coachFilter.toLowerCase().trim();
        matchesCoach = Boolean(matchesMainCoach || matchesAssistant);
      }

      // Team Filter: respects selectedTeamIds list or single teamFilter
      let matchesTeam = true;
      if (selectedTeamIds.length > 0) {
        matchesTeam = selectedTeamIds.includes(event.teamId);
      } else if (teamFilter !== "all") {
        matchesTeam = event.teamId === teamFilter;
      }

      // Team Category Filter
      let matchesCategory = true;
      if (teamCategoryFilter !== "all") {
        const teamObj = teamsMap.get(event.teamId);
        matchesCategory = teamObj?.category === teamCategoryFilter;
      }

      const matchesType = typeFilter === "all" || event.type === typeFilter;
      const matchesLocation = locationFilter === "all" || event.location === locationFilter;

      let matchesPeriod = true;
      const evDateStr = event.session.date;
      const dayOfWeek = event.start.getDay(); // 0 is Sun, 6 is Sat

      if (timePeriodFilter === "upcoming") {
        matchesPeriod = evDateStr >= todayStr;
      } else if (timePeriodFilter === "past") {
        matchesPeriod = evDateStr < todayStr;
      } else if (timePeriodFilter === "weekend") {
        matchesPeriod = dayOfWeek === 0 || dayOfWeek === 6;
      }

      return matchesSearch && matchesCoach && matchesTeam && matchesCategory && matchesType && matchesLocation && matchesPeriod;
    });
  }, [allEvents, searchTerm, coachFilter, selectedTeamIds, teamFilter, teamCategoryFilter, typeFilter, locationFilter, timePeriodFilter, teamsMap]);

  // Handler: Select/Toggle a Team
  const handleSelectTeam = (teamId: string) => {
    if (isMultiTeamMode) {
      setSelectedTeamIds((prev) => {
        if (prev.includes(teamId)) {
          const next = prev.filter((id) => id !== teamId);
          setTeamFilter(next.length === 1 ? next[0] : next.length === 0 ? "all" : "multi");
          return next;
        } else {
          const next = [...prev, teamId];
          setTeamFilter(next.length === 1 ? next[0] : "multi");
          return next;
        }
      });
    } else {
      if (selectedTeamIds.length === 1 && selectedTeamIds[0] === teamId) {
        // Toggle off back to all
        setSelectedTeamIds([]);
        setTeamFilter("all");
      } else {
        setSelectedTeamIds([teamId]);
        setTeamFilter(teamId);
      }
    }
  };

  // Handler: Select a Coach
  const handleSelectCoach = (cName: string) => {
    setCoachFilter(cName);
    if (cName !== "all") {
      // Find teams coached by this coach
      const matchingTeams = teams.filter(
        (t) => t.coach?.trim().toLowerCase() === cName.trim().toLowerCase() ||
               t.assistantCoach?.trim().toLowerCase() === cName.trim().toLowerCase()
      );
      if (matchingTeams.length > 0) {
        setSelectedTeamIds(matchingTeams.map((t) => t.id));
        setTeamFilter(matchingTeams.length === 1 ? matchingTeams[0].id : "multi");
      }
    } else {
      setSelectedTeamIds([]);
      setTeamFilter("all");
    }
  };

  // Handler: Reset all filters
  const handleResetFilters = () => {
    setSelectedTeamIds([]);
    setTeamFilter("all");
    setCoachFilter("all");
    setTeamCategoryFilter("all");
    setTypeFilter("all");
    setLocationFilter("all");
    setTimePeriodFilter("all");
    setSearchTerm("");
  };

  // Navigation handlers
  const handleNavigateToday = () => {
    setCurrentDate(new Date(2026, 6, 18));
  };

  const handleNavigatePrev = () => {
    const newDate = new Date(currentDate);
    if (calView === Views.MONTH) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (calView === Views.WEEK) {
      newDate.setDate(newDate.getDate() - 7);
    } else if (calView === Views.DAY) {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNavigateNext = () => {
    const newDate = new Date(currentDate);
    if (calView === Views.MONTH) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (calView === Views.WEEK) {
      newDate.setDate(newDate.getDate() + 7);
    } else if (calView === Views.DAY) {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Event Prop Getter for Color-Coding
  const eventPropGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3b82f6";
    let borderColor = "#2563eb";

    if (colorBy === "team" && event.teamColor) {
      backgroundColor = event.teamColor;
      borderColor = event.teamColor;
    } else {
      switch (event.type) {
        case "Match":
          backgroundColor = "#f43f5e";
          borderColor = "#e11d48";
          break;
        case "Stage":
          backgroundColor = "#8b5cf6";
          borderColor = "#7c3aed";
          break;
        case "Réunion":
          backgroundColor = "#10b981";
          borderColor = "#059669";
          break;
        case "Autre":
          backgroundColor = "#f59e0b";
          borderColor = "#d97706";
          break;
        default:
          // Entraînement
          backgroundColor = "#3b82f6";
          borderColor = "#2563eb";
          break;
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: "#ffffff",
        borderRadius: "8px",
        fontSize: "0.75rem",
        fontWeight: "600",
        border: `1px solid ${borderColor}`,
        padding: "2px 6px"
      }
    };
  };

  // Custom Event component inside calendar cell
  const CustomEventComponent = ({ event }: { event: CalendarEvent }) => {
    return (
      <div className="flex items-center justify-between gap-1 overflow-hidden text-white leading-tight">
        <div className="truncate font-bold text-[11px]">
          <span>{format(event.start, "HH:mm")}</span> <span className="font-semibold">{event.title}</span>
        </div>
        {event.teamName && (
          <span className="text-[9px] font-mono opacity-90 shrink-0 bg-black/25 px-1 py-0.5 rounded">
            {event.teamName.replace("Seniors", "Sen.").replace("Féminine", "Fém.")}
          </span>
        )}
      </div>
    );
  };

  // Export ICS iCal Calendar File
  const exportICSFile = (eventsToExport: CalendarEvent[] = filteredEvents, fileNameSuffix = "club") => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//APPASS Association Manager//Planning//FR\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

    eventsToExport.forEach((ev) => {
      const formatICSDate = (d: Date) => {
        return d.toISOString().replace(/-|:|\.\d+/g, "");
      };

      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:${ev.id}@appass-club.org\n`;
      icsContent += `DTSTAMP:${formatICSDate(new Date())}\n`;
      icsContent += `DTSTART:${formatICSDate(ev.start)}\n`;
      icsContent += `DTEND:${formatICSDate(ev.end)}\n`;
      icsContent += `SUMMARY:[${ev.teamName}] ${ev.title}\n`;
      if (ev.location) icsContent += `LOCATION:${ev.location.replace(/,/g, "\\,")}\n`;
      
      let description = `Type: ${ev.type}\\nÉquipe: ${ev.teamName}`;
      if (ev.coachName) description += `\\nCoach: ${ev.coachName}`;
      if (ev.opponent) description += `\\nAdversaire: ${ev.opponent}`;
      if (ev.notes) description += `\\nNotes: ${ev.notes.replace(/\n/g, "\\n")}`;
      icsContent += `DESCRIPTION:${description}\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `planning_${fileNameSuffix}_${format(new Date(), "yyyy-MM-dd")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedIcsNotice(true);
    setTimeout(() => setCopiedIcsNotice(false), 3000);
  };

  // Export CSV
  const exportPlanningCSV = () => {
    const headers = ["Date", "Heure", "Type", "Titre", "Équipe", "Entraîneur", "Lieu", "Durée (min)", "Présents"];
    const rows = filteredEvents
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((ev) => {
        const attendeeCount = ev.attendeeIds?.length || 0;
        return [
          `"${format(ev.start, "yyyy-MM-dd")}"`,
          `"${format(ev.start, "HH:mm")}"`,
          `"${ev.type}"`,
          `"${ev.title}"`,
          `"${ev.teamName}"`,
          `"${ev.coachName || ""}"`,
          `"${ev.location || ""}"`,
          ev.session.durationMinutes || 90,
          attendeeCount
        ].join(",");
      });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `planning_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const currentMonthNum = currentDate.getMonth();
  const currentYearNum = currentDate.getFullYear();
  const currentMonthEvents = allEvents.filter((e) => {
    return e.start.getMonth() === currentMonthNum && e.start.getFullYear() === currentYearNum;
  });
  const matchCountMonth = currentMonthEvents.filter((e) => e.type === "Match").length;
  const trainingCountMonth = currentMonthEvents.filter((e) => e.type === "Entraînement").length;
  const activeTeamsMonth = new Set(currentMonthEvents.map((e) => e.teamId)).size;
  const totalHoursMonth = Math.round(
    currentMonthEvents.reduce((acc, e) => acc + (e.session.durationMinutes || 90), 0) / 60
  );

  const monthNamesFr = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  return (
    <div id="planning-view" className="space-y-6">
      {/* 1. Top Header & Primary Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Planning Général du Club
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              isClassic ? "bg-[#0d6efd]/20 text-blue-300 border border-[#0d6efd]/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}>
              {monthNamesFr[currentMonthNum]} {currentYearNum}
            </span>
          </div>
          <p className={`text-sm ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
            Visualisation interactive des créneaux, matchs et entraînements. Exportation iCal/CSV et détection de conflits.
          </p>
        </div>

        {/* Global Export & Mode Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsExportPDFModalOpen(true)}
            className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs ${
              isClassic
                ? "bg-slate-800 border border-slate-700 text-indigo-300 hover:bg-slate-700"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Exporter Planning PDF</span>
          </button>

          <button
            type="button"
            onClick={() => exportICSFile(filteredEvents, "club_complet")}
            className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 border transition cursor-pointer shadow-xs ${
              isClassic
                ? "bg-slate-800 border-slate-700 text-blue-300 hover:bg-slate-700"
                : "bg-indigo-50/80 border-indigo-200/80 text-indigo-700 hover:bg-indigo-100"
            }`}
            title="Exporter vers Google Calendar / Apple Calendar / Outlook"
          >
            <CalendarPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>.ics</span>
          </button>

          <button
            type="button"
            onClick={exportPlanningCSV}
            className={`px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition flex items-center gap-2 border cursor-pointer ${
              isClassic
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            }`}
            title="Exporter en fichier CSV"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Color-By Toggle Switch */}
          <div className={`p-1 rounded-2xl border flex items-center gap-1 text-xs font-bold ${
            isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
          }`}>
            <span className="text-[10px] text-slate-400 px-2 uppercase font-mono hidden md:inline">Couleurs :</span>
            <button
              type="button"
              onClick={() => setColorBy("type")}
              className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                colorBy === "type"
                  ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Par Type
            </button>
            <button
              type="button"
              onClick={() => setColorBy("team")}
              className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                colorBy === "team"
                  ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Par Équipe
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Stats KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Séances du mois</span>
            <CalendarDays className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold font-display">{currentMonthEvents.length}</p>
            <span className="text-xs text-slate-400 font-mono">({trainingCountMonth} ent.)</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Matches au Programme</span>
            <Trophy className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold font-display text-rose-600">{matchCountMonth}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Occupation Terrains</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold font-display text-emerald-600">{totalHoursMonth}h</p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Équipes Actives</span>
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold font-display text-purple-600">{activeTeamsMonth}</p>
        </div>
      </div>

      {/* Conflict Warning Banner if overlaps detected */}
      {locationConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <strong className="font-bold block">Attention : {locationConflicts.length} chevauchement(s) de terrain détecté(s) !</strong>
              <span className="text-[11px] opacity-90 truncate block">
                Exemple: "{locationConflicts[0].events[0].title}" et "{locationConflicts[0].events[1].title}" le {locationConflicts[0].date} à {locationConflicts[0].location}.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMainViewMode("conflicts")}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold shrink-0 hover:bg-amber-600 transition cursor-pointer"
          >
            Examiner
          </button>
        </div>
      )}

      {/* ICS Export Success Toast Notice */}
      <AnimatePresence>
        {copiedIcsNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            Fichier iCal (.ics) généré et téléchargé avec succès !
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main View Switcher Bar */}
      <div className={`p-2 rounded-2xl border flex flex-wrap items-center justify-between gap-2 ${
        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
      }`}>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1">
          <button
            type="button"
            onClick={() => setMainViewMode("calendar")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mainViewMode === "calendar"
                ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Calendrier Interactif</span>
          </button>

          <button
            type="button"
            onClick={() => setMainViewMode("team_grid")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mainViewMode === "team_grid"
                ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Planning par Équipe</span>
          </button>

          <button
            type="button"
            onClick={() => setMainViewMode("timeline")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mainViewMode === "timeline"
                ? isClassic ? "bg-[#0d6efd] text-white" : "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <List className="w-4 h-4" />
            <span>Chronologie & Feed</span>
          </button>

          {locationConflicts.length > 0 && (
            <button
              type="button"
              onClick={() => setMainViewMode("conflicts")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                mainViewMode === "conflicts"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Conflits ({locationConflicts.length})</span>
            </button>
          )}
        </div>

        {/* BigCalendar Sub-Views (Month, Week, Day, Agenda) when in Calendar Mode */}
        {mainViewMode === "calendar" && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCalView(Views.MONTH)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                calView === Views.MONTH ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-500"
              }`}
            >
              Mois
            </button>
            <button
              type="button"
              onClick={() => setCalView(Views.WEEK)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                calView === Views.WEEK ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-500"
              }`}
            >
              Semaine
            </button>
            <button
              type="button"
              onClick={() => setCalView(Views.DAY)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                calView === Views.DAY ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-500"
              }`}
            >
              Jour
            </button>
            <button
              type="button"
              onClick={() => setCalView(Views.AGENDA)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                calView === Views.AGENDA ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-500"
              }`}
            >
              Agenda
            </button>
          </div>
        )}
      </div>

      {/* 4. DEDICATED TEAM & COACH FILTERING SECTION (POUR LES ENTRAÎNEURS & ÉQUIPES) */}
      <div
        className={`p-4 md:p-5 rounded-3xl border transition space-y-3.5 ${
          isClassic
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200/90 shadow-xs text-slate-800"
        }`}
      >
        {/* Header & Quick Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-sm md:text-base">
                  Filtres par Équipe & Vue Entraîneur
                </h3>
                {selectedTeamIds.length > 0 || coachFilter !== "all" || teamCategoryFilter !== "all" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-xs">
                    Filtre Actif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Vue Club Complet
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Sélectionnez votre équipe ou votre profil d'entraîneur pour n'afficher que les séances, matchs et convocations vous concernant.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Coach Filter Dropdown */}
            <div className="relative">
              <select
                value={coachFilter}
                onChange={(e) => handleSelectCoach(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                  coachFilter !== "all"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                    : isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <option value="all">👤 Tous les entraîneurs / coachs</option>
                {coachProfiles.map((c) => (
                  <option key={c.coach} value={c.coach}>
                    Entraîneur : {c.coach} ({c.teamNames.join(", ")})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter Dropdown if categories exist */}
            {uniqueCategories.length > 0 && (
              <select
                value={teamCategoryFilter}
                onChange={(e) => setTeamCategoryFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                  teamCategoryFilter !== "all"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                    : isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <option value="all">Catégorie : Toutes</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    Catégorie : {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Multi-Selection Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsMultiTeamMode(!isMultiTeamMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isMultiTeamMode
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold"
                  : isClassic
                  ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title="Permet de combiner plusieurs équipes simultanément"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isMultiTeamMode ? "Mode Multi-Équipes (Actif)" : "Mode Multi-Équipes"}</span>
            </button>

            {/* Clear all filters button if active */}
            {(selectedTeamIds.length > 0 || coachFilter !== "all" || teamCategoryFilter !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition hover:bg-rose-100 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Team Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {/* All Teams Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedTeamIds([]);
              setTeamFilter("all");
              setCoachFilter("all");
            }}
            className={`shrink-0 px-3.5 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedTeamIds.length === 0 && teamFilter === "all" && coachFilter === "all"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30"
                : isClassic
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Tout le club</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedTeamIds.length === 0 && teamFilter === "all" && coachFilter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {allEvents.length}
            </span>
          </button>

          {/* Individual Team Buttons */}
          {teams.map((t) => {
            const isSelected = selectedTeamIds.includes(t.id) || (selectedTeamIds.length === 0 && teamFilter === t.id);
            const count = teamSessionCounts[t.id] || 0;
            const teamColor = t.teamColor || "#4f46e5";

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTeam(t.id)}
                className={`shrink-0 px-3.5 py-2 rounded-2xl border text-xs transition flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white dark:bg-indigo-600 dark:border-indigo-600 shadow-sm ring-2 ring-indigo-500/40 font-bold"
                    : isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-white/40"
                  style={{ backgroundColor: teamColor }}
                />
                <span className="font-semibold">{t.name}</span>
                {t.coach && (
                  <span className={`text-[10px] hidden sm:inline px-1.5 py-0.5 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                  }`}>
                    Coach: {t.coach.split(" ")[0]}
                  </span>
                )}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {count}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Active Team Focus Banner when single team or coach is active */}
        {(() => {
          const singleTeam =
            selectedTeamIds.length === 1
              ? teamsMap.get(selectedTeamIds[0])
              : teamFilter !== "all" && teamFilter !== "multi"
              ? teamsMap.get(teamFilter)
              : null;

          if (!singleTeam && coachFilter === "all") return null;

          return (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                isClassic ? "bg-slate-950/80 border-slate-800" : "bg-indigo-50/70 border-indigo-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {singleTeam && (
                  <div
                    className="w-3 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: singleTeam.teamColor || "#4f46e5" }}
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                      {singleTeam ? `Équipe ciblée : ${singleTeam.name}` : `Entraîneur ciblé : ${coachFilter}`}
                    </span>
                    {singleTeam?.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                        {singleTeam.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300 mt-0.5">
                    {singleTeam?.coach ? `Entraîneur principal : ${singleTeam.coach}` : ""}
                    {singleTeam?.assistantCoach ? ` • Adjoint : ${singleTeam.assistantCoach}` : ""}
                    {singleTeam?.trainingSchedule ? ` • Créneaux habituels : ${singleTeam.trainingSchedule}` : ""}
                    {` • ${filteredEvents.length} créneau(x) affiché(s)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => exportICSFile(filteredEvents, singleTeam ? singleTeam.name.toLowerCase().replace(/\s+/g, "_") : "planning_coach")}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>iCal (.ics)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (singleTeam) {
                      setPdfTitle(`Planning Officiel — ${singleTeam.name}`);
                    }
                    setIsExportPDFModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF de l'équipe</span>
                </button>
              </div>
            </motion.div>
          );
        })()}
      </div>

      {/* 5. Filter Toolbar & Legend */}
      <div className={`p-4 rounded-3xl border space-y-3 ${
        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
      }`}>
        <div className="flex flex-col xl:flex-row items-center justify-between gap-3">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-start">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNavigatePrev}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
                title="Période précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNavigateToday}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={handleNavigateNext}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
                title="Période suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-display font-extrabold text-base md:text-lg">
              {format(currentDate, "MMMM yyyy", { locale: fr })}
            </h3>
          </div>

          {/* Search & Multi-Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-between xl:justify-end">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Chercher séance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-1.5 pl-9 pr-3 rounded-xl text-xs outline-none border transition ${
                  isClassic
                    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                }`}
              />
            </div>

            {/* Filter by Team */}
            <select
              value={selectedTeamIds.length === 1 ? selectedTeamIds[0] : selectedTeamIds.length > 1 ? "multi" : teamFilter}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") {
                  setSelectedTeamIds([]);
                  setTeamFilter("all");
                } else if (val !== "multi") {
                  setSelectedTeamIds([val]);
                  setTeamFilter(val);
                  setCoachFilter("all");
                }
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                teamFilter !== "all" || selectedTeamIds.length > 0
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                  : isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <option value="all">Toutes les équipes</option>
              {selectedTeamIds.length > 1 && (
                <option value="multi" disabled>
                  {selectedTeamIds.length} équipes sélectionnées
                </option>
              )}
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  Équipe : {t.name}
                </option>
              ))}
            </select>

            {/* Filter by Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                typeFilter !== "all"
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                  : isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <option value="all">Tous les types</option>
              <option value="Entraînement">Entraînement</option>
              <option value="Match">Match</option>
              <option value="Stage">Stage</option>
              <option value="Réunion">Réunion</option>
              <option value="Autre">Autre</option>
            </select>

            {/* Filter by Location */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                locationFilter !== "all"
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                  : isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <option value="all">Tous les lieux</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Time Period Filter */}
            <select
              value={timePeriodFilter}
              onChange={(e) => setTimePeriodFilter(e.target.value as any)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                timePeriodFilter !== "all"
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                  : isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <option value="all">Toutes les dates</option>
              <option value="upcoming">Séances à venir</option>
              <option value="weekend">Week-ends uniquement</option>
              <option value="past">Séances passées</option>
            </select>
          </div>
        </div>

        {/* Clickable Color Legend Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Légende :</span>
          {colorBy === "type" ? (
            <>
              <button
                type="button"
                onClick={() => setTypeFilter(typeFilter === "Entraînement" ? "all" : "Entraînement")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  typeFilter === "Entraînement" ? "ring-2 ring-blue-500 font-bold" : "opacity-80"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Entraînement</span>
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter(typeFilter === "Match" ? "all" : "Match")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  typeFilter === "Match" ? "ring-2 ring-rose-500 font-bold" : "opacity-80"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Match</span>
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter(typeFilter === "Stage" ? "all" : "Stage")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  typeFilter === "Stage" ? "ring-2 ring-purple-500 font-bold" : "opacity-80"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Stage</span>
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter(typeFilter === "Réunion" ? "all" : "Réunion")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  typeFilter === "Réunion" ? "ring-2 ring-emerald-500 font-bold" : "opacity-80"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Réunion</span>
              </button>
            </>
          ) : (
            teams.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTeam(t.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  selectedTeamIds.includes(t.id) || teamFilter === t.id ? "ring-2 ring-indigo-500 font-bold" : "opacity-80"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.teamColor || "#4f46e5" }} />
                <span>{t.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 6. MAIN CONTENT DISPLAY (DYNAMIC VIEW MODE) */}
      {mainViewMode === "calendar" && (
        <div className={`p-4 md:p-6 rounded-3xl border shadow-xs ${
          isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
        }`}>
          {filteredEvents.length === 0 && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Aucune séance ne correspond aux filtres actifs sur cette période.
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            view={calView}
            onView={(view) => setCalView(view)}
            style={{ height: 650 }}
            culture="fr"
            messages={{
              allDay: "Toute la journée",
              previous: "Précédent",
              next: "Suivant",
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Agenda",
              date: "Date",
              time: "Heure",
              event: "Événement",
              noEventsInRange: "Aucune séance planifiée dans cette période."
            }}
            eventPropGetter={eventPropGetter}
            components={{
              event: CustomEventComponent
            }}
            onSelectEvent={(event: CalendarEvent) => {
              setSelectedEvent(event);
            }}
            onSelectSlot={(slotInfo) => {
              const dateStr = format(slotInfo.start, "yyyy-MM-dd");
              setSelectedDayString(dateStr);
            }}
            selectable
          />
        </div>
      )}

      {/* VIEW MODE 2: TEAM GRID VIEW */}
      {mainViewMode === "team_grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team) => {
            const teamEvents = filteredEvents.filter((e) => e.teamId === team.id);
            return (
              <div
                key={team.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90 shadow-xs"
                }`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: team.teamColor || "#4f46e5" }}
                />

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base">{team.name}</h3>
                        <p className="text-xs text-slate-400">Coach: {team.coach}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800">
                      {teamEvents.length} séance(s)
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-80 overflow-y-auto pr-1">
                    {teamEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-4 text-center">Aucune séance planifiée pour cette équipe.</p>
                    ) : (
                      teamEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-3 rounded-2xl border transition cursor-pointer hover:scale-[1.01] space-y-1.5 ${
                            isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200/80"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {format(ev.start, "EEE d MMM", { locale: fr })} • {format(ev.start, "HH:mm")}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                              ev.type === "Match" ? "bg-rose-500" : "bg-blue-500"
                            }`}>
                              {ev.type}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs">{ev.title}</h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            <span className="truncate">{ev.location || "Lieu non spécifié"}</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => exportICSFile(teamEvents, team.name.toLowerCase().replace(/\s+/g, "_"))}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Exporter le planning ({team.name})
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 3: TIMELINE / FEED VIEW */}
      {mainViewMode === "timeline" && (
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90 shadow-xs"
        }`}>
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <List className="w-5 h-5 text-indigo-500" /> Chronologie des Prochaines Séances
          </h3>

          {filteredEvents.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-8 text-center">Aucune séance ne correspond aux critères.</p>
          ) : (
            <div className="space-y-3">
              {filteredEvents
                .sort((a, b) => a.start.getTime() - b.start.getTime())
                .map((ev) => {
                  const attendeeCount = ev.attendeeIds?.length || 0;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition cursor-pointer hover:border-indigo-500/50 ${
                        isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-3 rounded-2xl text-white font-bold shrink-0 ${
                          ev.type === "Match" ? "bg-rose-500" : "bg-indigo-600"
                        }`}>
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                              {format(ev.start, "EEEE d MMMM yyyy", { locale: fr })} à {format(ev.start, "HH:mm")} ({ev.session.durationMinutes || 90} min)
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600">
                              {ev.teamName}
                            </span>
                          </div>
                          <h4 className="font-bold text-base mt-0.5">{ev.title}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> {ev.location || "Lieu non spécifié"}</span>
                            {ev.coachName && <span>• Coach : {ev.coachName}</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          {attendeeCount} inscrit(s)
                        </span>
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                          Voir détails →
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 4: CONFLICTS RESOLUTION VIEW */}
      {mainViewMode === "conflicts" && (
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90 shadow-xs"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-amber-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Gestionnaire des Conflits d'Occupation de Terrains
            </h3>
            <span className="text-xs text-slate-400">{locationConflicts.length} conflit(s) détecté(s)</span>
          </div>

          {locationConflicts.length === 0 ? (
            <p className="text-xs text-emerald-600 font-bold p-8 text-center bg-emerald-50 rounded-2xl">
              ✓ Aucun conflit de réservation détecté. Tous les terrains et créneaux sont fluides !
            </p>
          ) : (
            <div className="space-y-4">
              {locationConflicts.map((conf, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
                    <span>Lieu : {conf.location} le {conf.date}</span>
                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded">Superposition directe</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {conf.events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="p-3 bg-white dark:bg-slate-900 border rounded-xl cursor-pointer hover:border-amber-500"
                      >
                        <span className="font-mono font-bold text-indigo-600">{format(ev.start, "HH:mm")} - {format(ev.end, "HH:mm")}</span>
                        <h5 className="font-bold text-sm mt-0.5">{ev.title}</h5>
                        <p className="text-slate-400 text-[11px]">{ev.teamName} (Coach {ev.coachName})</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL: SELECTED EVENT DETAILS */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    selectedEvent.type === "Match"
                      ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      : selectedEvent.type === "Stage"
                      ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                      : selectedEvent.type === "Réunion"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                  }`}>
                    {selectedEvent.type}
                  </span>
                  {selectedEvent.intensity && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Intensité : {selectedEvent.intensity}
                    </span>
                  )}
                </div>

                <h3 className="font-display font-extrabold text-2xl">{selectedEvent.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {format(selectedEvent.start, "EEEE d MMMM yyyy", { locale: fr })} de {format(selectedEvent.start, "HH:mm")} à {format(selectedEvent.end, "HH:mm")}
                </p>
              </div>

              {selectedEvent.type === "Match" && selectedEvent.opponent && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-rose-500" /> Match contre : {selectedEvent.opponent}
                  </span>
                  <span className="uppercase font-mono text-[10px] bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {selectedEvent.homeAway || "Domicile"}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Équipe Engagée</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedEvent.teamName}</strong>
                    {selectedEvent.coachName && <span className="block text-slate-400 text-[11px]">Coach {selectedEvent.coachName}</span>}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Lieu de la séance</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedEvent.location || "Stade Principal"}</strong>
                  </div>
                </div>
              </div>

              {selectedEvent.equipment && selectedEvent.equipment.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <strong className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Matériel Préconisé :</strong>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedEvent.equipment.map((eq) => (
                      <span key={eq} className="px-2 py-0.5 bg-white dark:bg-slate-900 border rounded-lg font-medium text-[11px]">
                        • {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.notes && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  <strong className="block font-bold mb-0.5">Note de l'entraîneur :</strong>
                  <p className="italic">{selectedEvent.notes}</p>
                </div>
              )}

              {/* Roster Convocations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Joueurs Convoqués ({
                      members.filter((m) => {
                        const team = teamsMap.get(selectedEvent.teamId);
                        return team?.memberIds?.includes(m.id);
                      }).length
                    })
                  </span>
                  {selectedEvent.attendeeIds && selectedEvent.attendeeIds.length > 0 && (
                    <span className="text-emerald-600 font-normal normal-case flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedEvent.attendeeIds.length} confirmé(s)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                  {(() => {
                    const team = teamsMap.get(selectedEvent.teamId);
                    const roster = members.filter((m) => team?.memberIds?.includes(m.id));

                    if (roster.length === 0) {
                      return <p className="text-xs text-slate-400 italic">Aucun membre assigné à cette équipe.</p>;
                    }

                    return roster.map((m) => {
                      const isPresent = selectedEvent.attendeeIds?.includes(m.id);
                      return (
                        <span
                          key={m.id}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                            isPresent
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                              : isClassic ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPresent ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {m.name}
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => exportICSFile([selectedEvent], selectedEvent.title.toLowerCase().replace(/\s+/g, "_"))}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarPlus className="w-4 h-4" /> Ajouter à mon agenda (.ics)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. MODAL: DAY SUMMARY FROM SLOT SELECT */}
      <AnimatePresence>
        {selectedDayString && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedDayString(null)}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-display font-extrabold text-xl">
                  Séances du {selectedDayString}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Aperçu des événements planifiés pour cette journée.
                </p>
              </div>

              <div className="space-y-3">
                {(() => {
                  const dayEvents = filteredEvents.filter((ev) => format(ev.start, "yyyy-MM-dd") === selectedDayString);

                  if (dayEvents.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-400 text-xs border rounded-2xl p-4">
                        <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p>Aucune séance enregistrée pour cette date.</p>
                      </div>
                    );
                  }

                  return dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => {
                        setSelectedDayString(null);
                        setSelectedEvent(ev);
                      }}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition hover:scale-[1.01] ${
                        isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono block">
                          {format(ev.start, "HH:mm")} - {format(ev.end, "HH:mm")}
                        </span>
                        <h4 className="font-bold text-sm">{ev.title}</h4>
                        <span className="text-xs text-slate-500">{ev.teamName}</span>
                      </div>
                      <span className="text-xs text-indigo-600 font-bold">Détails →</span>
                    </div>
                  ));
                })()}
              </div>

              <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedDayString(null)}
                  className="py-2.5 px-6 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* PDF Planning Export Modal */}
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
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Exportation PDF du Planning</h3>
                    <p className="text-xs text-slate-500">
                      Générez un document officiel imprimable des créneaux et matchs.
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
                  <label className="block font-bold mb-1">Titre du Planning</label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Séances / Créneaux inclus</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-mono font-bold">
                      {filteredEvents.length} séance(s)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    L'export prendra en compte le filtre d'équipe, le type d'événement et le lieu actuellement sélectionnés.
                  </p>
                </div>
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
                    const currentTeamObj = teams.find((t) => t.id === teamFilter);
                    const teamFilterName = currentTeamObj ? currentTeamObj.name : "Toutes les équipes";
                    exportPlanningPDF(
                      filteredEvents.map((e) => e.session),
                      teams,
                      {
                        title: pdfTitle,
                        teamFilterName
                      }
                    );
                    setIsExportPDFModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Télécharger le Planning PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

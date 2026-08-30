import React, { useState, useEffect, useRef } from "react";
import { Member, Team, Session, User, ActiveView, AppTheme, Equipment, Transaction, AdministrativeDocument, AssociationInfo, NotificationItem } from "./types";
import { INITIAL_MEMBERS, INITIAL_TEAMS, INITIAL_SESSIONS, INITIAL_EQUIPMENT, INITIAL_TRANSACTIONS, INITIAL_DOCUMENTS, INITIAL_ASSOCIATION_INFO } from "./data";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Members } from "./components/Members";
import { Teams } from "./components/Teams";
import { Sessions } from "./components/Sessions";
import { Planning } from "./components/Planning";
import { Profile } from "./components/Profile";
import { EquipmentModule } from "./components/Equipment";
import { FinancesModule } from "./components/Finances";
import { AdministrativeDocuments } from "./components/AdministrativeDocuments";
import { BilanModule } from "./components/Bilan";
import { SettingsModule } from "./components/Settings";
import { NotificationsPopover } from "./components/NotificationsPopover";
import { ExpandableSearch } from "./components/ExpandableSearch";
import { BreadcrumbTrail } from "./components/BreadcrumbTrail";
import {
  DashboardSkeleton,
  MembersSkeleton,
  TeamsSkeleton,
  FinancesSkeleton,
  SessionsSkeleton,
  EquipmentSkeleton,
  BilanSkeleton,
  GenericSkeleton
} from "./components/Skeletons";

import {
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  CalendarDays,
  Package,
  Wallet,
  BarChart3,
  Settings,
  FolderArchive,
  User as UserIcon,
  LogOut,
  Sparkles,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Building2,
  ChevronRight,
  Maximize,
  Minimize,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("settings");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>("modern");
  const [logoError, setLogoError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen Change Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Erreur lors du passage en plein écran:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Core Entity States
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<AdministrativeDocument[]>([]);
  const [associationInfo, setAssociationInfo] = useState<AssociationInfo>(INITIAL_ASSOCIATION_INFO);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Global Refs & Skeleton State
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Module Skeleton Loading State
  const [isModuleLoading, setIsModuleLoading] = useState(false);

  // Scroll to top & trigger brief skeleton loader when switching views
  useEffect(() => {
    setIsModuleLoading(true);
    const timer = setTimeout(() => {
      setIsModuleLoading(false);
    }, 250);

    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    return () => clearTimeout(timer);
  }, [activeView]);

  // 1. Initial State Loading & Seed Setup
  useEffect(() => {
    // Check active session
    const storedUser = localStorage.getItem("appass_active_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check active theme
    const storedTheme = localStorage.getItem("appass_theme") as AppTheme | null;
    if (storedTheme && (storedTheme === "modern" || storedTheme === "classic")) {
      setTheme(storedTheme);
    }

    // Check & Seed Association Info
    const storedInfo = localStorage.getItem("appass_association_info");
    if (storedInfo) {
      setAssociationInfo(JSON.parse(storedInfo));
    } else {
      setAssociationInfo(INITIAL_ASSOCIATION_INFO);
      localStorage.setItem("appass_association_info", JSON.stringify(INITIAL_ASSOCIATION_INFO));
    }

    // Check & Seed Members
    const storedMembers = localStorage.getItem("appass_members");
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    } else {
      setMembers(INITIAL_MEMBERS);
      localStorage.setItem("appass_members", JSON.stringify(INITIAL_MEMBERS));
    }

    // Check & Seed Teams
    const storedTeams = localStorage.getItem("appass_teams");
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    } else {
      setTeams(INITIAL_TEAMS);
      localStorage.setItem("appass_teams", JSON.stringify(INITIAL_TEAMS));
    }

    // Check & Seed Sessions
    const storedSessions = localStorage.getItem("appass_sessions");
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    } else {
      setSessions(INITIAL_SESSIONS);
      localStorage.setItem("appass_sessions", JSON.stringify(INITIAL_SESSIONS));
    }

    // Check & Seed Equipment
    const storedEquipment = localStorage.getItem("appass_equipment");
    if (storedEquipment) {
      setEquipment(JSON.parse(storedEquipment));
    } else {
      setEquipment(INITIAL_EQUIPMENT);
      localStorage.setItem("appass_equipment", JSON.stringify(INITIAL_EQUIPMENT));
    }

    // Check & Seed Transactions / Finances
    const storedTransactions = localStorage.getItem("appass_transactions");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem("appass_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
    }

    // Check & Seed Administrative Documents
    const storedDocs = localStorage.getItem("appass_documents");
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    } else {
      setDocuments(INITIAL_DOCUMENTS);
      localStorage.setItem("appass_documents", JSON.stringify(INITIAL_DOCUMENTS));
    }

    // Check & Seed Notifications
    const storedNotifs = localStorage.getItem("appass_notifications");
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    } else {
      const defaultNotifs: NotificationItem[] = [
        {
          id: "notif-1",
          title: "Rappel Réunion du Bureau",
          message: "Réunion mensuelle de préparation du Tournoi de Printemps prévue ce vendredi à 18h30.",
          type: "meeting",
          date: "Aujourd'hui, 09:00",
          isRead: false,
          targetView: "planning",
          priority: "high"
        },
        {
          id: "notif-2",
          title: "Échéance Cotisations Saison 2025/2026",
          message: "3 membres présentent des cotisations en attente de règlement (total 380 €). Pensez à relancer.",
          type: "membership_fee",
          date: "Hier, 14:15",
          isRead: false,
          targetView: "finances",
          priority: "medium"
        },
        {
          id: "notif-3",
          title: "Nouvelle Inscription : Sophie Martin",
          message: "Sophie Martin a été enregistrée en U18 Féminines. Certificat médical validé.",
          type: "new_member",
          date: "Il y a 2 jours",
          isRead: true,
          targetView: "members",
          priority: "normal"
        },
        {
          id: "notif-4",
          title: "Demande de Licence : Lucas Bernard",
          message: "Lucas Bernard a soumis sa demande de licence en ligne. Dossier complet.",
          type: "new_member",
          date: "Il y a 3 jours",
          isRead: false,
          targetView: "members",
          priority: "normal"
        }
      ];
      setNotifications(defaultNotifs);
      localStorage.setItem("appass_notifications", JSON.stringify(defaultNotifs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("appass_theme", theme);
  }, [theme]);

  // Notification Handlers
  const handleMarkNotifAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    localStorage.setItem("appass_notifications", JSON.stringify(updated));
  };

  const handleMarkAllNotifsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem("appass_notifications", JSON.stringify(updated));
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("appass_notifications", JSON.stringify(updated));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("appass_notifications", JSON.stringify([]));
  };

  const handleAddNotification = (newNotifData: Omit<NotificationItem, "id" | "date" | "isRead">) => {
    const newNotif: NotificationItem = {
      ...newNotifData,
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      date: "À l'instant",
      isRead: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem("appass_notifications", JSON.stringify(updated));
  };

  // 2. Auth handlers
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("appass_active_user", JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("appass_active_user");
    setActiveView("dashboard");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("appass_active_user", JSON.stringify(updatedUser));

    const storedUsers = localStorage.getItem("appass_users");
    if (storedUsers) {
      const users: User[] = JSON.parse(storedUsers);
      const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      localStorage.setItem("appass_users", JSON.stringify(updatedUsers));
    }
  };

  // 3. Member CRUD Ops
  const handleAddMember = (newMemberData: Omit<Member, "id" | "createdAt">) => {
    const newMember: Member = {
      ...newMemberData,
      id: "m-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    const updated = [newMember, ...members];
    setMembers(updated);
    localStorage.setItem("appass_members", JSON.stringify(updated));

    // Auto-generate notification for new member registration
    handleAddNotification({
      title: `Nouvelle Inscription : ${newMember.name}`,
      message: `${newMember.name} (${newMember.age} ans) s'est inscrit(e) avec l'adresse ${newMember.email}.`,
      type: "new_member",
      priority: "normal",
      targetView: "members",
      targetId: newMember.id
    });
  };

  const handleUpdateMember = (updatedMember: Member) => {
    const updated = members.map((m) => (m.id === updatedMember.id ? updatedMember : m));
    setMembers(updated);
    localStorage.setItem("appass_members", JSON.stringify(updated));
  };

  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = members.filter((m) => m.id !== memberId);
    setMembers(updatedMembers);
    localStorage.setItem("appass_members", JSON.stringify(updatedMembers));

    // Cleanup relationships: remove deleted member from all teams
    const updatedTeams = teams.map((team) => ({
      ...team,
      memberIds: team.memberIds.filter((id) => id !== memberId)
    }));
    setTeams(updatedTeams);
    localStorage.setItem("appass_teams", JSON.stringify(updatedTeams));
  };

  // 4. Team CRUD Ops
  const handleAddTeam = (newTeamData: Omit<Team, "id" | "createdAt">) => {
    const newTeam: Team = {
      ...newTeamData,
      id: "t-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    const updated = [newTeam, ...teams];
    setTeams(updated);
    localStorage.setItem("appass_teams", JSON.stringify(updated));
  };

  const handleUpdateTeam = (updatedTeam: Team) => {
    const updated = teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t));
    setTeams(updated);
    localStorage.setItem("appass_teams", JSON.stringify(updated));
  };

  const handleDeleteTeam = (teamId: string) => {
    const updatedTeams = teams.filter((t) => t.id !== teamId);
    setTeams(updatedTeams);
    localStorage.setItem("appass_teams", JSON.stringify(updatedTeams));

    // Cleanup relationships: delete sessions associated with this team
    const updatedSessions = sessions.filter((s) => s.teamId !== teamId);
    setSessions(updatedSessions);
    localStorage.setItem("appass_sessions", JSON.stringify(updatedSessions));
  };

  // 5. Session CRUD Ops
  const handleAddSession = (newSessionData: Omit<Session, "id">) => {
    const newSession: Session = {
      ...newSessionData,
      id: "s-" + Math.random().toString(36).substring(2, 9)
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("appass_sessions", JSON.stringify(updated));

    // Auto-generate notification for meeting or match
    if (newSession.type === "Réunion" || newSession.type === "Match" || newSession.type === "Stage") {
      handleAddNotification({
        title: `Nouveau Rappel : ${newSession.title}`,
        message: `${newSession.type} planifié(e) le ${newSession.date} à ${newSession.time}${newSession.location ? ` (${newSession.location})` : ""}.`,
        type: "meeting",
        priority: newSession.type === "Réunion" ? "high" : "medium",
        targetView: "planning",
        targetId: newSession.id
      });
    }
  };

  const handleUpdateSession = (updatedSession: Session) => {
    const updated = sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    setSessions(updated);
    localStorage.setItem("appass_sessions", JSON.stringify(updated));
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem("appass_sessions", JSON.stringify(updated));
  };

  // 6. Equipment CRUD Ops
  const handleAddEquipment = (newItemData: Omit<Equipment, "id" | "createdAt">) => {
    const newItem: Equipment = {
      ...newItemData,
      id: "e-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...equipment];
    setEquipment(updated);
    localStorage.setItem("appass_equipment", JSON.stringify(updated));
  };

  const handleUpdateEquipment = (updatedItem: Equipment) => {
    const updated = equipment.map((e) => (e.id === updatedItem.id ? updatedItem : e));
    setEquipment(updated);
    localStorage.setItem("appass_equipment", JSON.stringify(updated));
  };

  const handleDeleteEquipment = (id: string) => {
    const updated = equipment.filter((e) => e.id !== id);
    setEquipment(updated);
    localStorage.setItem("appass_equipment", JSON.stringify(updated));
  };

  // 7. Transaction / Finances CRUD Ops
  const handleAddTransaction = (newTxData: Omit<Transaction, "id" | "createdAt">) => {
    const newTx: Transaction = {
      ...newTxData,
      id: "tx-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem("appass_transactions", JSON.stringify(updated));
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    const updated = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(updated);
    localStorage.setItem("appass_transactions", JSON.stringify(updated));
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    localStorage.setItem("appass_transactions", JSON.stringify(updated));
  };

  // 8. Documents CRUD Ops
  const handleAddDocument = (newDocData: Omit<AdministrativeDocument, "id" | "createdAt">) => {
    const newDoc: AdministrativeDocument = {
      ...newDocData,
      id: "doc-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    localStorage.setItem("appass_documents", JSON.stringify(updated));

    handleAddNotification({
      title: `Nouveau Document Archivé : ${newDoc.title}`,
      message: `Document de type "${newDoc.type}" enregistré avec succès dans le registre officiel.`,
      type: "meeting",
      priority: "normal",
      targetView: "documents",
      targetId: newDoc.id
    });
  };

  const handleUpdateDocument = (id: string, updates: Partial<AdministrativeDocument>) => {
    const updated = documents.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
    setDocuments(updated);
    localStorage.setItem("appass_documents", JSON.stringify(updated));
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    localStorage.setItem("appass_documents", JSON.stringify(updated));
  };

  // 9. Association Info & Settings Handlers
  const handleUpdateAssociationInfo = (info: AssociationInfo) => {
    setAssociationInfo(info);
    localStorage.setItem("appass_association_info", JSON.stringify(info));
  };

  const handleResetAllData = () => {
    setMembers(INITIAL_MEMBERS);
    setTeams(INITIAL_TEAMS);
    setSessions(INITIAL_SESSIONS);
    setEquipment(INITIAL_EQUIPMENT);
    setTransactions(INITIAL_TRANSACTIONS);
    setDocuments(INITIAL_DOCUMENTS);
    setAssociationInfo(INITIAL_ASSOCIATION_INFO);

    localStorage.setItem("appass_members", JSON.stringify(INITIAL_MEMBERS));
    localStorage.setItem("appass_teams", JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem("appass_sessions", JSON.stringify(INITIAL_SESSIONS));
    localStorage.setItem("appass_equipment", JSON.stringify(INITIAL_EQUIPMENT));
    localStorage.setItem("appass_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem("appass_documents", JSON.stringify(INITIAL_DOCUMENTS));
    localStorage.setItem("appass_association_info", JSON.stringify(INITIAL_ASSOCIATION_INFO));
  };

  const handleExportFullBackup = () => {
    const backupData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      associationInfo,
      members,
      teams,
      sessions,
      equipment,
      transactions,
      documents
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sauvegarde_${associationInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFullBackup = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.members && data.teams && data.sessions) {
        if (data.associationInfo) {
          setAssociationInfo(data.associationInfo);
          localStorage.setItem("appass_association_info", JSON.stringify(data.associationInfo));
        }
        setMembers(data.members);
        localStorage.setItem("appass_members", JSON.stringify(data.members));

        setTeams(data.teams);
        localStorage.setItem("appass_teams", JSON.stringify(data.teams));

        setSessions(data.sessions);
        localStorage.setItem("appass_sessions", JSON.stringify(data.sessions));

        if (data.equipment) {
          setEquipment(data.equipment);
          localStorage.setItem("appass_equipment", JSON.stringify(data.equipment));
        }

        if (data.transactions) {
          setTransactions(data.transactions);
          localStorage.setItem("appass_transactions", JSON.stringify(data.transactions));
        }

        if (data.documents) {
          setDocuments(data.documents);
          localStorage.setItem("appass_documents", JSON.stringify(data.documents));
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Guard for Login View
  if (!user) {
    return <Login onLogin={handleLogin} theme={theme} setTheme={setTheme} />;
  }

  const lowStockEquipmentCount = equipment.filter((item) => item.quantity < 3).length;

  // Sidebar Menu Config
  const navigationItems = [
    {
      id: "nav-dashboard",
      view: "dashboard" as ActiveView,
      label: "Dashboard",
      icon: LayoutDashboard,
      count: undefined
    },
    {
      id: "nav-members",
      view: "members" as ActiveView,
      label: "Membres",
      icon: Users,
      count: members.length
    },
    {
      id: "nav-teams",
      view: "teams" as ActiveView,
      label: "Équipes",
      icon: Shield,
      count: teams.length
    },
    {
      id: "nav-sessions",
      view: "sessions" as ActiveView,
      label: "Séances",
      icon: Calendar,
      count: sessions.length
    },
    {
      id: "nav-planning",
      view: "planning" as ActiveView,
      label: "Planning",
      icon: CalendarDays,
      count: undefined
    },
    {
      id: "nav-equipment",
      view: "equipment" as ActiveView,
      label: "Équipements",
      icon: Package,
      count: equipment.length,
      hasAlert: lowStockEquipmentCount > 0,
      alertCount: lowStockEquipmentCount
    },
    {
      id: "nav-finances",
      view: "finances" as ActiveView,
      label: "Finances",
      icon: Wallet,
      count: transactions.length
    },
    {
      id: "nav-documents",
      view: "documents" as ActiveView,
      label: "Documents",
      icon: FolderArchive,
      count: documents.length
    },
    {
      id: "nav-bilan",
      view: "bilan" as ActiveView,
      label: "Bilan & AG",
      icon: BarChart3,
      count: undefined
    },
    {
      id: "nav-settings",
      view: "settings" as ActiveView,
      label: "Paramètres",
      icon: Settings,
      count: undefined
    }
  ];

  return (
    <div className={`flex h-screen overflow-hidden font-sans relative transition-colors duration-300 ${theme === "classic" ? "bg-black text-white" : "bg-slate-50 text-slate-800"}`}>
      {/* MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Mobile Sidebar Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className={`w-[300px] max-w-[85vw] ${
                theme === "classic" ? "bg-slate-950 border-r border-[#0d6efd]/40" : "bg-slate-900 border-r border-slate-800"
              } text-white flex flex-col justify-between shrink-0 shadow-2xl relative z-10 h-full rounded-r-3xl overflow-hidden transition-all duration-300`}
            >
              <div className="flex flex-col flex-1 min-h-0">
                {/* Logo Brand Header */}
                <div className={`px-5 py-5 flex items-center justify-between border-b ${theme === "classic" ? "border-[#0d6efd]/20 bg-blue-950/30" : "border-slate-800/80 bg-slate-950/40"}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    {associationInfo.logo ? (
                      <img
                        src={associationInfo.logo}
                        alt="Logo"
                        className="w-10 h-10 object-contain rounded-xl border border-white/10 bg-white/5 p-1 shrink-0"
                      />
                    ) : !logoError ? (
                      <img
                        src="/assets/img/Logo2.png"
                        alt="AppAss Logo"
                        onError={() => setLogoError(true)}
                        className="w-10 h-10 object-contain rounded-xl shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        theme === "classic" ? "bg-[#0d6efd]/20 text-blue-400 border-[#0d6efd]/30" : "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      }`}>
                        <Shield className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h1 className="font-display font-bold text-base tracking-wide text-white flex items-center gap-1.5">
                        AppAss <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                          theme === "classic" ? "bg-[#0d6efd]/30 text-blue-200" : "bg-indigo-600/30 text-indigo-300"
                        }`}>Club</span>
                      </h1>
                      <p className="text-[11px] text-slate-400 font-medium truncate" title={associationInfo.name}>{associationInfo.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition shrink-0"
                    aria-label="Fermer le menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Info Card / Season Badge */}
                <div className="px-4 pt-4 pb-2">
                  <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    theme === "classic" ? "bg-blue-900/30 border-blue-500/20 text-blue-200" : "bg-slate-800/50 border-slate-700/50 text-slate-300"
                  }`}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-medium truncate">{associationInfo.season}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Actif
                    </span>
                  </div>
                </div>

                {/* Nav list */}
                <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                  {navigationItems.map((item) => {
                    const isActive = activeView === item.view;
                    return (
                      <button
                        id={`${item.id}-mobile`}
                        key={`${item.id}-mobile`}
                        onClick={() => {
                          setActiveView(item.view);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group relative ${
                          isActive
                            ? theme === "classic"
                              ? "bg-[#0d6efd] text-white shadow-lg shadow-blue-600/25 font-semibold"
                              : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold"
                            : theme === "classic"
                              ? "text-slate-300 hover:text-white hover:bg-slate-900"
                              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isActive && (
                            <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-white rounded-r-md" />
                          )}
                          <div className="relative shrink-0 flex items-center justify-center">
                            <item.icon className={`w-4 h-4 transition ${
                              isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                            }`} />
                            {item.hasAlert && (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5" title={`${item.alertCount} article(s) avec stock < 3`}>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-slate-950"></span>
                              </span>
                            )}
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {item.hasAlert ? (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-xs"
                              title={`${item.alertCount} article(s) en stock critique (< 3)`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              {item.count}
                            </span>
                          ) : (
                            item.count !== undefined && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                              }`}>
                                {item.count}
                              </span>
                            )
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                            isActive ? "text-white translate-x-0.5" : "text-slate-500 opacity-0 group-hover:opacity-100"
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* User Account footer */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3 shrink-0">

                <button
                  type="button"
                  onClick={() => {
                    setActiveView("profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 transition group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white border border-indigo-400/30 flex items-center justify-center font-bold text-sm shrink-0 uppercase shadow-sm overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white group-hover:text-indigo-300 truncate transition">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{user.email || "Administrateur"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 transition shrink-0" />
                </button>

                <button
                  id="btn-signout-mobile"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/10 text-xs font-semibold text-rose-300 hover:text-rose-200 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Se déconnecter
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`hidden md:flex w-64 ${theme === "classic" ? "bg-black border-r border-[#0d6efd]/30" : "bg-slate-900 border-r border-slate-800"} text-white flex-col justify-between shrink-0 shadow-xl relative z-20 transition-all duration-300`}>
        <div className="flex flex-col flex-1">
          {/* Logo Brand Header */}
          <div className={`px-6 py-7 flex items-center gap-3 border-b ${theme === "classic" ? "border-[#0d6efd]/20" : "border-slate-800/60"}`}>
            {!logoError ? (
              <img
                src="/assets/img/Logo2.png"
                alt="AppAss Logo"
                onError={() => setLogoError(true)}
                className="w-10 h-10 object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner ${
                theme === "classic" ? "bg-[#0d6efd]/15 text-blue-400 border-[#0d6efd]/20" : "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
              }`}>
                <Shield className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="font-display font-bold text-lg tracking-wide text-white flex items-center gap-1.5">
                AppAss <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium uppercase tracking-wider ${
                  theme === "classic" ? "bg-[#0d6efd]/20 text-white" : "bg-indigo-600/20 text-indigo-400"
                }`}>Club</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-sans tracking-tight truncate max-w-[130px]" title={associationInfo.name}>{associationInfo.name}</p>
            </div>
          </div>

          {/* Nav list */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = activeView === item.view;
              return (
                <button
                  id={item.id}
                  key={item.id}
                  onClick={() => setActiveView(item.view)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition duration-200 group relative ${
                    isActive
                      ? theme === "classic"
                        ? "bg-[#0d6efd] text-white shadow-lg shadow-blue-600/20 font-semibold"
                        : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 font-semibold"
                      : theme === "classic"
                        ? "text-slate-400 hover:text-white hover:bg-slate-900/80"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  {/* Left Accent indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r-md" />
                  )}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0 flex items-center justify-center">
                      <item.icon className={`w-4.5 h-4.5 transition ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"
                      }`} />
                      {item.hasAlert && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5" title={`${item.alertCount} article(s) avec stock < 3`}>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-slate-900"></span>
                        </span>
                      )}
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.hasAlert ? (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-xs"
                        title={`${item.alertCount} article(s) en stock critique (< 3)`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {item.count}
                      </span>
                    ) : (
                      item.count !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                        }`}>
                          {item.count}
                        </span>
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Signout footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/25 space-y-3">
          <button
            type="button"
            onClick={() => setActiveView("profile")}
            className="w-full text-left flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white border border-slate-700/50 flex items-center justify-center font-bold text-sm shrink-0 uppercase transition overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white group-hover:text-indigo-300 truncate transition">{user.name}</p>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">Voir mon profil →</p>
            </div>
          </button>
          <button
            id="btn-signout"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-xs font-semibold text-slate-400 hover:text-red-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* 2. MAIN SCROLLABLE WRAPPER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className={`h-16 border-b shrink-0 flex items-center justify-between gap-4 relative z-30 transition-all duration-300 ${
          theme === "classic" 
            ? "bg-[#0d6efd] border-[#0d6efd] text-white" 
            : "border-slate-100 bg-white/80 backdrop-blur-md text-slate-800"
        } px-4 md:px-8`}>
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-toggle-mobile-menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`md:hidden p-2.5 rounded-2xl flex items-center justify-center border transition active:scale-95 cursor-pointer ${
                theme === "classic"
                  ? "bg-blue-700/80 border-blue-400/40 text-white hover:bg-blue-600 shadow-sm"
                  : "bg-slate-100/80 border-slate-200/80 text-slate-700 hover:bg-slate-200/80 shadow-sm"
              }`}
              aria-label="Ouvrir le menu principal"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className={`hidden sm:flex text-xs font-mono items-center gap-1.5 ${
              theme === "classic" ? "text-blue-100" : "text-slate-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                theme === "classic" ? "bg-white animate-pulse" : "bg-indigo-500"
              }`} />
              AppAss 2026
            </div>
          </div>

          {/* Global Search Bar (Logo icon by default -> Expands into input area on click) */}
          <div className="mx-1 sm:mx-3">
            <ExpandableSearch
              members={members}
              teams={teams}
              sessions={sessions}
              equipment={equipment}
              transactions={transactions}
              documents={documents}
              theme={theme}
              currency={associationInfo.currency}
              onNavigate={(view) => setActiveView(view)}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 text-xs font-semibold shrink-0">
            {/* Season Badge */}
            <span className={`hidden lg:inline-block px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-medium ${
              theme === "classic" ? "bg-blue-900/40 border-blue-400/30 text-blue-200" : "bg-slate-100/90 border-slate-200/80 text-slate-600"
            }`}>
              {associationInfo.season}
            </span>

            {/* Theme Toggle Button */}
            <button
              id="btn-toggle-theme"
              type="button"
              onClick={() => setTheme(theme === "modern" ? "classic" : "modern")}
              className={`p-2 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                theme === "classic"
                  ? "bg-blue-800/60 border-blue-400/40 text-blue-200 hover:bg-blue-700 hover:text-white"
                  : "bg-slate-100/90 border-slate-200/90 text-slate-700 hover:bg-slate-200 hover:text-indigo-600"
              }`}
              title={theme === "modern" ? "Passer au thème Sombre Classique" : "Passer au thème Épuré Moderne"}
              aria-label="Changer de thème"
            >
              {theme === "modern" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle Button */}
            <button
              id="btn-toggle-fullscreen"
              type="button"
              onClick={toggleFullscreen}
              className={`px-2.5 py-2 rounded-xl border transition flex items-center gap-1.5 cursor-pointer font-sans text-xs font-semibold ${
                isFullscreen
                  ? theme === "classic"
                    ? "bg-blue-600 border-blue-400 text-white shadow-sm ring-2 ring-blue-400/30"
                    : "bg-indigo-600 border-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30"
                  : theme === "classic"
                  ? "bg-blue-800/60 border-blue-400/40 text-blue-200 hover:bg-blue-700 hover:text-white"
                  : "bg-slate-100/90 border-slate-200/90 text-slate-700 hover:bg-slate-200 hover:text-indigo-600"
              }`}
              title={isFullscreen ? "Quitter le mode plein écran" : "Activer le mode plein écran"}
              aria-label="Basculer en plein écran"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px] font-semibold">Réduire</span>
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px] font-semibold">Plein écran</span>
                </>
              )}
            </button>

            {/* Quick Print Button */}
            <button
              id="btn-quick-print"
              type="button"
              onClick={() => window.print()}
              className={`p-2 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                theme === "classic"
                  ? "bg-blue-800/60 border-blue-400/40 text-blue-200 hover:bg-blue-700 hover:text-white"
                  : "bg-slate-100/90 border-slate-200/90 text-slate-700 hover:bg-slate-200 hover:text-indigo-600"
              }`}
              title="Imprimer cette vue (Ctrl+P)"
              aria-label="Imprimer le document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Notifications Popover (Positioned on the Far Right) */}
            <NotificationsPopover
              notifications={notifications}
              onMarkAsRead={handleMarkNotifAsRead}
              onMarkAllAsRead={handleMarkAllNotifsAsRead}
              onDeleteNotification={handleDeleteNotification}
              onClearAll={handleClearAllNotifications}
              onAddNotification={handleAddNotification}
              onNavigate={(view) => setActiveView(view)}
              theme={theme}
            />
          </div>
        </header>

        {/* Breadcrumb Navigation Trail */}
        <BreadcrumbTrail
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          theme={theme}
          associationName={associationInfo.name}
          season={associationInfo.season}
          membersCount={members.length}
          teamsCount={teams.length}
          sessionsCount={sessions.length}
          equipmentCount={equipment.length}
          transactionsCount={transactions.length}
          documentsCount={documents.length}
          lowStockCount={lowStockEquipmentCount}
        />

        {/* Main interactive area */}
        <div ref={mainContentRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Official Document Print Header (Only visible when printing) */}
            <div className="print-only mb-6 pb-4 border-b-2 border-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">{associationInfo.name}</h1>
                  <p className="text-xs text-slate-600 mt-0.5">Saison {associationInfo.season} • Document Officiel Association</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-semibold text-slate-900">
                    Édition du {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Généré par AppAss Club
                  </p>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {isModuleLoading ? (
                  activeView === "dashboard" ? (
                    <DashboardSkeleton theme={theme} />
                  ) : activeView === "members" ? (
                    <MembersSkeleton theme={theme} />
                  ) : activeView === "teams" ? (
                    <TeamsSkeleton theme={theme} />
                  ) : activeView === "finances" ? (
                    <FinancesSkeleton theme={theme} />
                  ) : activeView === "sessions" || activeView === "planning" ? (
                    <SessionsSkeleton theme={theme} />
                  ) : activeView === "equipment" ? (
                    <EquipmentSkeleton theme={theme} />
                  ) : activeView === "bilan" ? (
                    <BilanSkeleton theme={theme} />
                  ) : (
                    <GenericSkeleton theme={theme} />
                  )
                ) : (
                  <>
                    {activeView === "dashboard" && (
                      <Dashboard
                        members={members}
                        teams={teams}
                        sessions={sessions}
                        equipment={equipment}
                        transactions={transactions}
                        documents={documents}
                        theme={theme}
                        currency={associationInfo.currency}
                        onNavigate={(view) => setActiveView(view)}
                      />
                    )}
                    {activeView === "members" && (
                      <Members
                        members={members}
                        teams={teams}
                        theme={theme}
                        onAddMember={handleAddMember}
                        onUpdateMember={handleUpdateMember}
                        onDeleteMember={handleDeleteMember}
                        onUpdateTeam={handleUpdateTeam}
                      />
                    )}
                    {activeView === "teams" && (
                      <Teams
                        teams={teams}
                        members={members}
                        sessions={sessions}
                        theme={theme}
                        onAddTeam={handleAddTeam}
                        onUpdateTeam={handleUpdateTeam}
                        onDeleteTeam={handleDeleteTeam}
                      />
                    )}
                    {activeView === "sessions" && (
                      <Sessions
                        sessions={sessions}
                        teams={teams}
                        members={members}
                        theme={theme}
                        onAddSession={handleAddSession}
                        onUpdateSession={handleUpdateSession}
                        onDeleteSession={handleDeleteSession}
                      />
                    )}
                    {activeView === "planning" && (
                      <Planning sessions={sessions} teams={teams} members={members} theme={theme} />
                    )}
                    {activeView === "equipment" && (
                      <EquipmentModule
                        equipment={equipment}
                        teams={teams}
                        members={members}
                        theme={theme}
                        onAddEquipment={handleAddEquipment}
                        onUpdateEquipment={handleUpdateEquipment}
                        onDeleteEquipment={handleDeleteEquipment}
                      />
                    )}
                    {activeView === "finances" && (
                      <FinancesModule
                        transactions={transactions}
                        members={members}
                        theme={theme}
                        currency={associationInfo.currency}
                        onAddTransaction={handleAddTransaction}
                        onUpdateTransaction={handleUpdateTransaction}
                        onDeleteTransaction={handleDeleteTransaction}
                      />
                    )}
                    {activeView === "documents" && (
                      <AdministrativeDocuments
                        documents={documents}
                        associationInfo={associationInfo}
                        theme={theme}
                        onAddDocument={handleAddDocument}
                        onUpdateDocument={handleUpdateDocument}
                        onDeleteDocument={handleDeleteDocument}
                      />
                    )}
                    {activeView === "bilan" && (
                      <BilanModule
                        members={members}
                        teams={teams}
                        sessions={sessions}
                        equipment={equipment}
                        transactions={transactions}
                        associationInfo={associationInfo}
                        theme={theme}
                        onUpdateEquipment={handleUpdateEquipment}
                      />
                    )}
                    {activeView === "settings" && (
                      <SettingsModule
                        associationInfo={associationInfo}
                        theme={theme}
                        onUpdateAssociationInfo={handleUpdateAssociationInfo}
                        onSetTheme={setTheme}
                        onResetAllData={handleResetAllData}
                        onExportFullBackup={handleExportFullBackup}
                        onImportFullBackup={handleImportFullBackup}
                        stats={{
                          members: members.length,
                          teams: teams.length,
                          sessions: sessions.length,
                          equipment: equipment.length,
                          transactions: transactions.length,
                          documents: documents.length
                        }}
                      />
                    )}
                    {activeView === "profile" && (
                      <Profile
                        user={user}
                        onUpdateUser={handleUpdateUser}
                        theme={theme}
                        membersCount={members.length}
                        teamsCount={teams.length}
                        sessionsCount={sessions.length}
                        onLogout={handleLogout}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

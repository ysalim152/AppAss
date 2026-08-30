import React, { useState, useRef, useEffect } from "react";
import { User, AppTheme } from "../types";
import { ValidatedInput } from "./ValidatedInput";
import { validateEmail, validatePhone } from "../lib/validation";
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
  Clock,
  Sparkles,
  Save,
  Camera,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  QrCode,
  Smartphone,
  Bell,
  FileText,
  Activity,
  Check,
  Copy,
  Download,
  BadgeCheck,
  Briefcase,
  History,
  Award,
  LogOut,
  Sliders,
  MapPin,
  Building,
  PhoneCall,
  Contact,
  FileCheck,
  Globe,
  Printer,
  Share2,
  CreditCard,
  Percent,
  X,
  Key,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  MessageSquare,
  Send,
  Settings2,
  RotateCcw,
  BellRing,
  Search,
  Filter,
  Layers,
  RefreshCw,
  ExternalLink,
  FileSpreadsheet,
  Plus,
  FileJson
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  theme: AppTheme;
  membersCount: number;
  teamsCount: number;
  sessionsCount: number;
  onLogout?: () => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250"
];

const MOCK_ACTIVITY_LOGS = [
  {
    id: 1,
    action: "Mise à jour des paramètres généraux de l'association",
    date: "11/08/2026 à 14:32",
    timeframe: "Aujourd'hui",
    category: "Paramètres",
    actor: "Mass26 (Président)",
    ip: "192.168.1.42",
    device: "Chrome / macOS",
    status: "success",
    details: "Mise à jour du siège social, numéro SIRET et enregistrement du nouveau numéro d'affiliation de la fédération nationale.",
    icon: Sliders
  },
  {
    id: 2,
    action: "Validation de 3 cotisations d'adhérents (450,00 €)",
    date: "11/08/2026 à 10:15",
    timeframe: "Aujourd'hui",
    category: "Finances",
    actor: "Mass26 (Président)",
    ip: "192.168.1.42",
    device: "Chrome / macOS",
    status: "success",
    details: "Paiements vérifiés par CB Stripe. Envoi automatique des reçus de dons fiscaux Cerfa n°2026-881 à 883.",
    icon: CheckCircle2
  },
  {
    id: 3,
    action: "Création de la séance d'entraînement U17 Masculin",
    date: "10/08/2026 à 18:45",
    timeframe: "7 jours",
    category: "Planning",
    actor: "Coach Thomas (Entraîneur)",
    ip: "82.124.90.11",
    device: "Safari iOS / iPhone",
    status: "success",
    details: "Planification du créneau Gymnase Municipal B - Terrain N°2. Convocation automatique envoyée à 18 joueurs.",
    icon: Calendar
  },
  {
    id: 4,
    action: "Exportation de la liste globale des 142 adhérents",
    date: "09/08/2026 à 11:20",
    timeframe: "7 jours",
    category: "Membres",
    actor: "Mass26 (Président)",
    ip: "192.168.1.42",
    device: "Chrome / macOS",
    status: "info",
    details: "Génération et téléchargement du registre complet des membres au format CSV conforme au registre préfectoral.",
    icon: Download
  },
  {
    id: 5,
    action: "Modification du mot de passe de la session administrateur",
    date: "05/08/2026 à 09:00",
    timeframe: "30 jours",
    category: "Sécurité",
    actor: "Mass26 (Président)",
    ip: "192.168.1.42",
    device: "Chrome / macOS",
    status: "warning",
    details: "Mise à jour sécurisée du mot de passe principal administrateur suite à la revue semestrielle de sécurité.",
    icon: KeyRound
  },
  {
    id: 6,
    action: "Archivage du matériel d'entraînement usagé",
    date: "02/08/2026 à 16:10",
    timeframe: "30 jours",
    category: "Matériel",
    actor: "Paul Durand (Trésorier)",
    ip: "109.212.45.89",
    device: "Firefox / Windows",
    status: "info",
    details: "Mise au rebut officielle de 10 ballons défectueux et mise à jour de l'inventaire matériel du club.",
    icon: Trash2
  },
  {
    id: 7,
    action: "Convocation officielle à l'Assemblée Générale Ordinaire",
    date: "28/07/2026 à 08:30",
    timeframe: "30 jours",
    category: "Gouvernance",
    actor: "Mass26 (Président)",
    ip: "192.168.1.42",
    device: "Chrome / macOS",
    status: "success",
    details: "Envoi automatisé de la convocation par e-mail avec ordre du jour et formulaire de procuration aux 142 membres.",
    icon: Send
  },
  {
    id: 8,
    action: "Tentative de connexion refusée (IP non reconnue)",
    date: "24/07/2026 à 23:14",
    timeframe: "30 jours",
    category: "Sécurité",
    actor: "Anonyme / Bot Firewall",
    ip: "185.220.101.5",
    device: "Linux / Bot Script",
    status: "warning",
    details: "Échec d'authentification sur la mire de connexion administrateur. Tentative isolée et bloquée par le pare-feu.",
    icon: Shield
  }
];

const MOCK_ACTIVE_SESSIONS = [
  { id: "sess-1", device: "Chrome 128 / macOS Sonoma", location: "Paris, France", ip: "192.168.1.42", current: true, lastActive: "En cours" },
  { id: "sess-2", device: "Safari iOS 18 / iPhone 15 Pro", location: "Lyon, France", ip: "82.124.90.11", current: false, lastActive: "Il y a 3 heures" },
];

export const Profile: React.FC<ProfileProps> = ({
  user,
  onUpdateUser,
  theme,
  membersCount,
  teamsCount,
  sessionsCount,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "security" | "notifications" | "activity">("info");

  // Edit Profile form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "+33 6 12 34 56 78");
  const [functionTitle, setFunctionTitle] = useState(user.functionTitle || "Président & Administrateur Système");
  const [bio, setBio] = useState(user.bio || "Passionné de sport, responsable de la gestion administrative et sportive de l'association depuis 2023.");
  const [avatar, setAvatar] = useState<string>(user.avatar || "");
  
  // Extended Personal & Administrative details
  const [address, setAddress] = useState(user.address || "12 Avenue des Sports");
  const [city, setCity] = useState(user.city || "Paris");
  const [postalCode, setPostalCode] = useState(user.postalCode || "75012");
  const [licenseNumber, setLicenseNumber] = useState(user.licenseNumber || "LIC-2026-8894A");
  const [emergencyContactName, setEmergencyContactName] = useState(user.emergencyContactName || "Claire Martin (Épouse)");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user.emergencyContactPhone || "+33 6 98 76 54 32");
  const [officialTitle, setOfficialTitle] = useState(user.officialTitle || "Président du Bureau Exécutif");
  const [preferredLanguage, setPreferredLanguage] = useState(user.preferredLanguage || "Français (FR)");

  const [showDigitalCardModal, setShowDigitalCardModal] = useState(false);

  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Completion Calculation
  const getProfileCompletion = () => {
    const fields = [
      { name: "name", val: name },
      { name: "email", val: email },
      { name: "phone", val: phone },
      { name: "functionTitle", val: functionTitle },
      { name: "bio", val: bio },
      { name: "avatar", val: avatar || user.avatar },
      { name: "address", val: address },
      { name: "city", val: city },
      { name: "postalCode", val: postalCode },
      { name: "licenseNumber", val: licenseNumber },
      { name: "emergencyContactName", val: emergencyContactName },
      { name: "emergencyContactPhone", val: emergencyContactPhone },
    ];
    const filled = fields.filter((f) => Boolean(f.val && f.val.toString().trim() !== ""));
    return Math.round((filled.length / fields.length) * 100);
  };

  const profileCompletion = getProfileCompletion();

  // Change Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  // 2FA state
  const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled || false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Active Sessions State
  const [activeSessions, setActiveSessions] = useState([
    { id: "sess-1", device: "Chrome 128 / macOS Sonoma", location: "Paris, France", ip: "192.168.1.42", current: true, lastActive: "En cours" },
    { id: "sess-2", device: "Safari iOS 18 / iPhone 15 Pro", location: "Lyon, France", ip: "82.124.90.11", current: false, lastActive: "Il y a 3 heures" },
    { id: "sess-3", device: "Firefox 130 / Windows 11", location: "Marseille, France", ip: "176.158.22.4", current: false, lastActive: "Hier à 19:20" },
  ]);
  const [sessionNotice, setSessionNotice] = useState("");

  // Backup Codes Modal State
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [backupCodes] = useState([
    "8492-1029", "7301-9284", "1190-2847", "6540-3321",
    "9012-4411", "3381-0029", "5512-8834", "7749-1102"
  ]);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  // Security Audit Log State
  const [securityLogs] = useState([
    { id: 1, event: "Connexion réussie à l'espace d'administration", device: "Chrome / macOS", ip: "192.168.1.42", location: "Paris", date: "Aujourd'hui à 14:32", status: "success" },
    { id: 2, event: "Changement de mot de passe administrateur", device: "Chrome / macOS", ip: "192.168.1.42", location: "Paris", date: "05/08/2026 à 09:00", status: "info" },
    { id: 3, event: "Authentification à double facteur (2FA) activée", device: "Chrome / macOS", ip: "192.168.1.42", location: "Paris", date: "01/08/2026 à 16:15", status: "success" },
    { id: 4, event: "Tentative de connexion refusée (mot de passe invalide)", device: "Firefox / Linux", ip: "45.14.220.1", location: "Francfort", date: "28/07/2026 à 03:12", status: "warning" },
  ]);

  // Security Score Calculation
  const getSecurityScore = () => {
    let score = 50; // base score for password
    if (twoFactor) score += 35;
    if (activeSessions.length <= 2) score += 15;
    return score;
  };

  const securityScore = getSecurityScore();

  // Password Strength Calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Non renseigné", color: "bg-slate-700" };
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { score, label: "Faible", color: "bg-red-500" };
    if (score <= 50) return { score, label: "Moyen", color: "bg-amber-500" };
    if (score <= 75) return { score, label: "Bon", color: "bg-indigo-500" };
    return { score, label: "Fort & Sécurisé", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Generate strong random password
  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(gen);
    setConfirmNewPassword(gen);
    setShowNewPass(true);
    setShowConfirmPass(true);
    setPassSuccess("Mot de passe hautement sécurisé généré avec succès ! Cliquez sur 'Mettre à jour' pour enregistrer.");
  };

  // Revoke individual session
  const handleRevokeSession = (id: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    setSessionNotice("La session a été fermée et déconnectée à distance.");
    setTimeout(() => setSessionNotice(""), 3500);
  };

  // Revoke all other sessions
  const handleRevokeAllOther = () => {
    setActiveSessions((prev) => prev.filter((s) => s.current));
    setSessionNotice("Toutes les autres sessions distantes ont été révoquées.");
    setTimeout(() => setSessionNotice(""), 3500);
  };

  // Copy Backup codes
  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2500);
  };

  // Export security audit log CSV
  const handleExportSecurityLogs = () => {
    const headers = ["ID", "Événement", "Appareil", "IP", "Localisation", "Date", "Statut"];
    const rows = securityLogs.map((l) => [
      l.id,
      `"${l.event}"`,
      `"${l.device}"`,
      l.ip,
      `"${l.location}"`,
      `"${l.date}"`,
      l.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-securite-${user.name.toLowerCase().replace(/\s+/g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Saved User Preferences from LocalStorage / User Object
  const savedUserPrefs = (() => {
    try {
      const stored = localStorage.getItem("appass_user_preferences");
      if (stored) return JSON.parse(stored);
      if (user.preferences) return user.preferences;
      return null;
    } catch {
      return null;
    }
  })();

  // Notification Preferences Matrix
  const [notificationMatrix, setNotificationMatrix] = useState(
    savedUserPrefs?.notificationMatrix || {
      receipts: { email: true, push: true, sms: false, label: "Cotisations & Reçus Fiscaux", desc: "Notification lors de la réception d'un règlement d'adhésion." },
      lateDues: { email: true, push: true, sms: true, label: "Relances Impayés Cotisations", desc: "Alerte automatique pour les retardataires après 30 jours." },
      sessions: { email: true, push: true, sms: false, label: "Séances, Entraînements & Convocations", desc: "Rappels 24h avant les événements et matchs sportifs." },
      assemblies: { email: true, push: true, sms: false, label: "Convocations AG & Réunions Bureau", desc: "Invitations officielles, ordres du jour et bilans d'AG." },
      equipment: { email: true, push: true, sms: false, label: "Alertes Matériel & Incidents Salles", desc: "Signaux pour matériel endommagé ou réservation de terrain." },
      medicalCert: { email: true, push: false, sms: false, label: "Expiration Certificats Médicaux", desc: "Rappel d'expiration 30 jours avant pour les licenciés." },
      monthlyReport: { email: true, push: false, sms: false, label: "Rapports & Synthèses Comptables", desc: "Bilan mensuel automatique envoyé au 1er jour du mois." },
      security: { email: true, push: true, sms: true, label: "Sécurité & Connexions Suspicieuses", desc: "Alertes immédiates en cas de nouvelle connexion sur un appareil inconnu." },
    }
  );

  // Quiet Hours & Schedule Preferences
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<boolean>(savedUserPrefs?.quietHoursEnabled ?? true);
  const [quietHoursStart, setQuietHoursStart] = useState<string>(savedUserPrefs?.quietHoursStart || "22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState<string>(savedUserPrefs?.quietHoursEnd || "07:00");
  const [allowEmergencyAlerts, setAllowEmergencyAlerts] = useState<boolean>(savedUserPrefs?.allowEmergencyAlerts ?? true);
  const [digestFrequency, setDigestFrequency] = useState<string>(savedUserPrefs?.digestFrequency || "Immédiat");

  // System & Display Preferences
  const [dateFormat, setDateFormat] = useState<string>(savedUserPrefs?.dateFormat || "DD/MM/YYYY");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<string>(savedUserPrefs?.firstDayOfWeek || "Lundi");
  const [uiDensity, setUiDensity] = useState<string>(savedUserPrefs?.uiDensity || "Confortable");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(savedUserPrefs?.soundEnabled ?? true);

  // Live Test Toast State
  const [showTestToast, setShowTestToast] = useState(false);

  const [notifications, setNotifications] = useState({
    emailReceipts: user.notifications?.emailReceipts ?? true,
    sessionAlerts: user.notifications?.sessionAlerts ?? true,
    equipmentAlerts: user.notifications?.equipmentAlerts ?? true,
    monthlyReport: user.notifications?.monthlyReport ?? false,
  });
  const [prefSaved, setPrefSaved] = useState(false);

  // Play audio chime function
  const playAudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context fallback
    }
  };

  const handleToggleMatrixChannel = (key: keyof typeof notificationMatrix, channel: "email" | "push" | "sms") => {
    setNotificationMatrix((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [channel]: !prev[key][channel],
      },
    }));
  };

  // Preset Batch Toggles for Notification Matrix
  const handleApplyMatrixPreset = (preset: "all" | "critical" | "silent") => {
    setNotificationMatrix((prev: any) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        const key = k as keyof typeof updated;
        if (preset === "all") {
          updated[key] = { ...updated[key], email: true, push: true, sms: key === "security" || key === "lateDues" };
        } else if (preset === "critical") {
          const isCrit = key === "receipts" || key === "lateDues" || key === "security" || key === "assemblies";
          updated[key] = { ...updated[key], email: isCrit, push: isCrit, sms: key === "security" || key === "lateDues" };
        } else {
          updated[key] = { ...updated[key], email: key === "security", push: false, sms: key === "security" };
        }
      });
      return updated;
    });
    if (soundEnabled) playAudioChime();
  };

  const handleTriggerTestNotification = () => {
    setShowTestToast(true);
    if (soundEnabled) playAudioChime();
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("AppAss Omnisports", {
          body: "Test d'alerte en direct reçu ! Vos canaux sont configurés.",
        });
      } catch (e) {
        console.log(e);
      }
    } else if ("Notification" in window && Notification.permission !== "denied") {
      try {
        Notification.requestPermission();
      } catch (e) {
        console.log(e);
      }
    }
    setTimeout(() => setShowTestToast(false), 4500);
  };

  const handleResetDefaultPreferences = () => {
    setQuietHoursEnabled(true);
    setQuietHoursStart("22:00");
    setQuietHoursEnd("07:00");
    setAllowEmergencyAlerts(true);
    setDigestFrequency("Immédiat");
    setDateFormat("DD/MM/YYYY");
    setFirstDayOfWeek("Lundi");
    setUiDensity("Confortable");
    setSoundEnabled(true);
    setNotificationMatrix({
      receipts: { email: true, push: true, sms: false, label: "Cotisations & Reçus Fiscaux", desc: "Notification lors de la réception d'un règlement d'adhésion." },
      lateDues: { email: true, push: true, sms: true, label: "Relances Impayés Cotisations", desc: "Alerte automatique pour les retardataires après 30 jours." },
      sessions: { email: true, push: true, sms: false, label: "Séances, Entraînements & Convocations", desc: "Rappels 24h avant les événements et matchs sportifs." },
      assemblies: { email: true, push: true, sms: false, label: "Convocations AG & Réunions Bureau", desc: "Invitations officielles, ordres du jour et bilans d'AG." },
      equipment: { email: true, push: true, sms: false, label: "Alertes Matériel & Incidents Salles", desc: "Signaux pour matériel endommagé ou réservation de terrain." },
      medicalCert: { email: true, push: false, sms: false, label: "Expiration Certificats Médicaux", desc: "Rappel d'expiration 30 jours avant pour les licenciés." },
      monthlyReport: { email: true, push: false, sms: false, label: "Rapports & Synthèses Comptables", desc: "Bilan mensuel automatique envoyé au 1er jour du mois." },
      security: { email: true, push: true, sms: true, label: "Sécurité & Connexions Suspicieuses", desc: "Alertes immédiates en cas de nouvelle connexion sur un appareil inconnu." },
    });
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  // Activity Log Search, Category, Timeframe & Modal state
  const [activitySearchQuery, setActivitySearchQuery] = useState("");
  const [selectedActivityCategory, setSelectedActivityCategory] = useState("Toutes");
  const [selectedActivityTimeframe, setSelectedActivityTimeframe] = useState("Tous");
  const [selectedActivityStatus, setSelectedActivityStatus] = useState("Tous");
  const [inspectingLogModal, setInspectingLogModal] = useState<typeof MOCK_ACTIVITY_LOGS[0] | null>(null);
  const [activityFeedback, setActivityFeedback] = useState("");
  
  // Activity Logs List with localStorage persistence
  const [activityLogsList, setActivityLogsList] = useState(() => {
    try {
      const stored = localStorage.getItem("appass_activity_logs");
      return stored ? JSON.parse(stored) : MOCK_ACTIVITY_LOGS;
    } catch {
      return MOCK_ACTIVITY_LOGS;
    }
  });

  // Save activity logs to localStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem("appass_activity_logs", JSON.stringify(activityLogsList));
    } catch (e) {
      console.error(e);
    }
  }, [activityLogsList]);

  // Manual Activity Log Modal State
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [newLogAction, setNewLogAction] = useState("");
  const [newLogCategory, setNewLogCategory] = useState("Gouvernance");
  const [newLogDetails, setNewLogDetails] = useState("");
  const [newLogStatus, setNewLogStatus] = useState<"success" | "warning" | "info">("success");

  const handleAddManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogAction.trim()) return;

    const newLog = {
      id: Date.now(),
      action: newLogAction.trim(),
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      timeframe: "Aujourd'hui",
      category: newLogCategory,
      actor: `${user.name} (Saisie Manuelle)`,
      ip: "192.168.1.42",
      device: "Admin AppAss Omnisports",
      status: newLogStatus,
      details: newLogDetails.trim() || "Consignation administrative directe enregistrée par l'administrateur.",
      icon: Activity,
    };

    setActivityLogsList((prev: any[]) => [newLog, ...prev]);
    setShowAddLogModal(false);
    setNewLogAction("");
    setNewLogDetails("");
    setActivityFeedback("Nouvelle entrée enregistrée avec succès dans le registre d'audit !");
    setTimeout(() => setActivityFeedback(""), 3500);
  };

  const handleRestoreDemoActivityLogs = () => {
    setActivityLogsList(MOCK_ACTIVITY_LOGS);
    setActivityFeedback("Journal d'activités réinitialisé avec les données d'origine.");
    setTimeout(() => setActivityFeedback(""), 3500);
  };

  const handleExportActivityCSV = () => {
    const headers = ["ID", "Action", "Catégorie", "Date", "Auteur", "IP", "Appareil", "Statut", "Détails"];
    const rows = filteredActivityLogs.map((log: any) => [
      log.id,
      `"${log.action.replace(/"/g, '""')}"`,
      log.category,
      log.date,
      `"${log.actor}"`,
      log.ip,
      `"${log.device}"`,
      log.status,
      `"${log.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `journal_activite_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActivityFeedback("Journal d'activités exporté en CSV !");
    setTimeout(() => setActivityFeedback(""), 3500);
  };

  const handleExportActivityJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredActivityLogs, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `journal_activites_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActivityFeedback("Journal d'activités exporté en JSON !");
    setTimeout(() => setActivityFeedback(""), 3500);
  };

  const handleRefreshActivityLogs = () => {
    setActivityFeedback("Journal d'activités synchronisé à l'instant.");
    setTimeout(() => setActivityFeedback(""), 2500);
  };

  const handleClearNonSystemLogs = () => {
    setActivityLogsList((prev: any[]) => prev.filter(l => l.category === "Sécurité" || l.category === "Gouvernance"));
    setActivityFeedback("Logs archivés. Seuls les événements critiques de sécurité et de gouvernance ont été conservés.");
    setTimeout(() => setActivityFeedback(""), 4000);
  };

  const filteredActivityLogs = activityLogsList.filter((log: any) => {
    const query = activitySearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      log.action.toLowerCase().includes(query) ||
      log.actor.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.category.toLowerCase().includes(query) ||
      log.ip.includes(query);

    const matchesCategory =
      selectedActivityCategory === "Toutes" || log.category === selectedActivityCategory;

    const matchesTimeframe =
      selectedActivityTimeframe === "Tous" || log.timeframe === selectedActivityTimeframe || log.timeframe === "Aujourd'hui";

    const matchesStatus =
      selectedActivityStatus === "Tous" || log.status === selectedActivityStatus;

    return matchesSearch && matchesCategory && matchesTimeframe && matchesStatus;
  });

  // Clipboard copy state
  const [copiedId, setCopiedId] = useState(false);

  const isClassic = theme === "classic";

  // Formatter for dates
  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Copy User ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id || "u-admin-01");
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setInfoError("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP...).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setInfoError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
        setInfoError("");
      }
    };
    reader.readAsDataURL(file);
  };

  // Update profile info handler
  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError("");
    setInfoSuccess("");

    if (!name.trim() || !email.trim()) {
      setInfoError("Le nom et l'adresse e-mail ne peuvent pas être vides.");
      return;
    }

    const emailCheck = validateEmail(email, true);
    if (!emailCheck.isValid) {
      setInfoError(emailCheck.errorMessage || "Adresse e-mail invalide.");
      return;
    }

    if (phone.trim()) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.isValid) {
        setInfoError(phoneCheck.errorMessage || "Numéro de téléphone principal invalide.");
        return;
      }
    }

    if (emergencyContactPhone.trim()) {
      const emergencyPhoneCheck = validatePhone(emergencyContactPhone);
      if (!emergencyPhoneCheck.isValid) {
        setInfoError("Contact d'urgence: " + (emergencyPhoneCheck.errorMessage || "Numéro de téléphone invalide."));
        return;
      }
    }

    // Check duplicate email in stored users (excluding current user)
    const storedUsers = localStorage.getItem("appass_users");
    if (storedUsers) {
      const users: User[] = JSON.parse(storedUsers);
      const isDuplicate = users.some(
        (u) => u.id !== user.id && u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (isDuplicate) {
        setInfoError("Cette adresse e-mail est déjà utilisée par un autre utilisateur.");
        return;
      }
    }

    // If email changed, migrate password entry in localStorage
    if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const passwords = JSON.parse(localStorage.getItem("appass_passwords") || "{}");
      const currentPass = passwords[user.email.toLowerCase()] || "admin";
      delete passwords[user.email.toLowerCase()];
      passwords[email.trim().toLowerCase()] = currentPass;
      localStorage.setItem("appass_passwords", JSON.stringify(passwords));
    }

    const updatedUser: User = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      functionTitle: functionTitle.trim(),
      bio: bio.trim(),
      avatar: avatar || undefined,
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      licenseNumber: licenseNumber.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      officialTitle: officialTitle.trim(),
      preferredLanguage: preferredLanguage.trim(),
      twoFactorEnabled: twoFactor,
      notifications,
    };

    onUpdateUser(updatedUser);
    setInfoSuccess("Vos informations personnelles et votre profil ont été enregistrés avec succès.");
  };

  // Change password handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPassError("Veuillez remplir tous les champs du mot de passe.");
      return;
    }

    if (newPassword.length < 4) {
      setPassError("Le nouveau mot de passe doit comporter au moins 4 caractères.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    // Check current password
    const passwords = JSON.parse(localStorage.getItem("appass_passwords") || "{}");
    const storedPass = passwords[user.email.toLowerCase()] || "admin";

    if (currentPassword !== storedPass) {
      setPassError("Le mot de passe actuel est incorrect.");
      return;
    }

    // Save new password
    passwords[user.email.toLowerCase()] = newPassword;
    localStorage.setItem("appass_passwords", JSON.stringify(passwords));

    setPassSuccess("Votre mot de passe a été modifié avec succès !");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  // Toggle 2FA
  const handleToggle2FA = () => {
    if (!twoFactor) {
      setShow2FAModal(true);
    } else {
      setTwoFactor(false);
      onUpdateUser({ ...user, twoFactorEnabled: false });
    }
  };

  const confirm2FA = () => {
    setTwoFactor(true);
    setShow2FAModal(false);
    onUpdateUser({ ...user, twoFactorEnabled: true });
  };

  // Save Notifications & Preferences
  const handleSaveNotifications = () => {
    const preferencesPayload = {
      notificationMatrix,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      allowEmergencyAlerts,
      digestFrequency,
      dateFormat,
      firstDayOfWeek,
      uiDensity,
      soundEnabled,
    };

    try {
      localStorage.setItem("appass_user_preferences", JSON.stringify(preferencesPayload));
    } catch (e) {
      console.error(e);
    }

    onUpdateUser({
      ...user,
      notifications,
      preferences: preferencesPayload,
    });

    if (soundEnabled) playAudioChime();
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  // Download Profile Data as JSON
  const handleExportProfileJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `profil_appass_${user.id || "admin"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const cardStyle = isClassic
    ? "bg-[#111] border border-[#0d6efd]/40 rounded-3xl p-6 shadow-xl"
    : "bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm";

  const inputStyle = isClassic
    ? "w-full bg-black border border-[#0d6efd]/50 focus:border-[#0d6efd] text-white rounded-xl py-2.5 px-4 outline-none transition text-sm font-medium"
    : "w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-2.5 px-4 outline-none transition text-sm font-medium";

  const labelStyle = isClassic
    ? "block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
    : "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

  const primaryBtnStyle = isClassic
    ? "bg-[#0d6efd] hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl py-2.5 px-5 text-sm font-semibold transition flex items-center gap-2 shadow-md cursor-pointer font-display"
    : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl py-2.5 px-5 text-sm font-semibold transition flex items-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer";

  const tabActiveStyle = isClassic
    ? "bg-[#0d6efd] text-white font-bold shadow-md shadow-blue-500/20"
    : "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20";

  const tabInactiveStyle = isClassic
    ? "bg-black text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-transparent";

  const secScore = securityScore;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isClassic
                ? "bg-[#0d6efd]/15 text-blue-400 border border-[#0d6efd]/30"
                : "bg-indigo-600/10 text-indigo-600 border border-indigo-500/20"
            }`}
          >
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Profil Administrateur
            </h1>
            <p className={`text-sm ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
              Gérez votre identité, votre sécurité et vos préférences de compte AppAss
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportProfileJson}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              isClassic
                ? "bg-black text-slate-300 border-[#0d6efd]/40 hover:border-[#0d6efd]"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm"
            }`}
            title="Télécharger une sauvegarde de mon profil en format JSON"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            Exporter mes données
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          )}
        </div>
      </div>

      {/* HERO USER BANNER CARD */}
      <div className={cardStyle}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Avatar Container */}
            <div className="relative group shrink-0">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold uppercase overflow-hidden border ${
                  isClassic
                    ? "bg-[#0d6efd] text-white border-blue-400 shadow-lg shadow-blue-500/20"
                    : "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-indigo-400/30 shadow-lg shadow-indigo-600/20"
                }`}
              >
                {(avatar || user.avatar) ? (
                  <img
                    src={avatar || user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer border-2 border-white/30"
                title="Changer de photo de profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold font-display">{user.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isClassic
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.role}
                </span>

                {twoFactor && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    <Smartphone className="w-3 h-3" />
                    2FA Activé
                  </span>
                )}
              </div>

              <p className={`text-xs font-semibold ${isClassic ? "text-blue-400" : "text-indigo-600"} flex items-center gap-1.5`}>
                <Briefcase className="w-3.5 h-3.5" />
                {functionTitle}
              </p>

              <div className="flex items-center gap-4 text-xs flex-wrap text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Membre depuis {formatDate(user.createdAt)}
                </span>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md ${isClassic ? "bg-black text-slate-400 border border-slate-800" : "bg-slate-100 text-slate-600"}`}>
                  ID: {user.id || "u-admin-01"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-[11px] text-slate-400 hover:text-indigo-500 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? "Copié !" : "Copier ID"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Security Score */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-700/30">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 flex-grow lg:flex-grow-0">
              <div
                className={`p-3 rounded-2xl text-center min-w-[70px] ${
                  isClassic ? "bg-black border border-[#0d6efd]/30" : "bg-slate-50 border border-slate-100"
                }`}
              >
                <span className="block text-lg font-extrabold">{membersCount}</span>
                <span className={`text-[9px] uppercase font-semibold tracking-wider ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                  Membres
                </span>
              </div>
              <div
                className={`p-3 rounded-2xl text-center min-w-[70px] ${
                  isClassic ? "bg-black border border-[#0d6efd]/30" : "bg-slate-50 border border-slate-100"
                }`}
              >
                <span className="block text-lg font-extrabold">{teamsCount}</span>
                <span className={`text-[9px] uppercase font-semibold tracking-wider ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                  Équipes
                </span>
              </div>
              <div
                className={`p-3 rounded-2xl text-center min-w-[70px] ${
                  isClassic ? "bg-black border border-[#0d6efd]/30" : "bg-slate-50 border border-slate-100"
                }`}
              >
                <span className="block text-lg font-extrabold">{sessionsCount}</span>
                <span className={`text-[9px] uppercase font-semibold tracking-wider ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                  Séances
                </span>
              </div>
            </div>

            {/* Security Audit Badge */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col justify-center min-w-[140px] text-center ${
                isClassic
                  ? "bg-black border-[#0d6efd]/40"
                  : "bg-gradient-to-br from-slate-50 to-indigo-50/50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Score Sécurité</span>
              </div>
              <span className="text-xl font-extrabold text-emerald-500">{secScore}%</span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">Niveau de protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "info" ? tabActiveStyle : tabInactiveStyle
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Informations Personnelles
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "security" ? tabActiveStyle : tabInactiveStyle
          }`}
        >
          <Lock className="w-4 h-4" />
          Sécurité & Accès
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "notifications" ? tabActiveStyle : tabInactiveStyle
          }`}
        >
          <Bell className="w-4 h-4" />
          Préférences & Notifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "activity" ? tabActiveStyle : tabInactiveStyle
          }`}
        >
          <History className="w-4 h-4" />
          Historique d'Activité
        </button>
      </div>

      {/* TAB CONTENT 1: INFORMATIONS PERSONNELLES */}
      {activeTab === "info" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* PROFILE COMPLETION & DIGITAL CARD BANNER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Completion Progress Card */}
            <div className={`p-5 rounded-3xl border lg:col-span-2 flex flex-col justify-between ${
              isClassic ? "bg-[#111] border-[#0d6efd]/40 shadow-xl" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">
                        Niveau de Complétion du Profil
                      </h3>
                      <p className={`text-[11px] ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                        Un profil complet garantit l'exactitude des attestations, contrats & reçus fiscaux édités.
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                    profileCompletion === 100
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : profileCompletion >= 75
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {profileCompletion}% Renseigné
                  </span>
                </div>

                <div className="space-y-1.5 my-3">
                  <div className={`h-2.5 w-full rounded-full overflow-hidden border ${
                    isClassic ? "bg-black border-slate-800" : "bg-slate-100 border-slate-200"
                  }`}>
                    <div
                      style={{ width: `${profileCompletion}%` }}
                      className={`h-full transition-all duration-500 rounded-full ${
                        profileCompletion === 100
                          ? "bg-emerald-500"
                          : profileCompletion >= 75
                          ? "bg-indigo-600"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className={`flex items-center justify-between text-[11px] pt-2 border-t ${
                isClassic ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"
              }`}>
                <span className="flex items-center gap-1.5">
                  {profileCompletion === 100 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Votre dossier d'administrateur est 100% complet et à jour.
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Complétez votre contact d'urgence & adresse pour atteindre 100%.
                    </>
                  )}
                </span>
                <span className="font-semibold text-indigo-500">
                  {profileCompletion === 100 ? "Validé" : "À compléter"}
                </span>
              </div>
            </div>

            {/* Digital Pass Preview Card */}
            <div className={`p-5 rounded-3xl border flex flex-col justify-between relative overflow-hidden ${
              isClassic
                ? "bg-gradient-to-br from-slate-900 to-slate-950 border-[#0d6efd]/40 shadow-xl"
                : "bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border-indigo-800/80 shadow-md"
            }`}>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300/80 flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Badge Officiel Asso
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                    Saison 2025/2026
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                    {avatar ? (
                      <img src={avatar} alt="Avatar badge" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-white">{name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white line-clamp-1">{name}</h4>
                    <p className="text-[11px] text-indigo-200/80 line-clamp-1">{functionTitle}</p>
                    <p className="text-[10px] font-mono text-indigo-300/60 mt-0.5">N° {licenseNumber}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDigitalCardModal(true)}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-300" />
                Afficher le Pass Membre Officiel
              </button>
            </div>
          </div>

          {/* MAIN FORM */}
          <div className={cardStyle}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/20">
              <div className="flex items-center gap-2.5">
                <UserIcon className={`w-5 h-5 ${isClassic ? "text-blue-400" : "text-indigo-600"}`} />
                <div>
                  <h3 className="font-bold text-lg">Mise à jour des Informations Personnelles</h3>
                  <p className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                    Renseignez vos coordonnées d'identité, de contact administratif et d'urgence.
                  </p>
                </div>
              </div>
            </div>

            {infoError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {infoError}
              </div>
            )}

            {infoSuccess && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {infoSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateInfo} className="space-y-8">
              {/* SECTION 1: PHOTO & AVATAR */}
              <div className={`p-5 rounded-2xl border ${isClassic ? "bg-black/60 border-slate-800" : "bg-slate-50/80 border-slate-200/80"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isClassic ? "text-slate-300" : "text-slate-700"}`}>
                    Photo de Profil & Persona
                  </h4>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-4 my-2">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold uppercase overflow-hidden border shrink-0 ${
                      isClassic
                        ? "bg-[#0d6efd] text-white border-blue-400 shadow-md"
                        : "bg-indigo-600 text-white border-indigo-500/30 shadow-md"
                    }`}
                  >
                    {avatar ? (
                      <img src={avatar} alt="Aperçu avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                        isClassic
                          ? "bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-500" />
                      Importer une photo
                    </button>

                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar("")}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset avatars */}
                <div className={`mt-3 pt-3 border-t ${isClassic ? "border-slate-800" : "border-slate-200"}`}>
                  <span className={`block text-[11px] font-medium mb-2 ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                    Ou choisissez un avatar prédéfini :
                  </span>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(url)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                          avatar === url
                            ? "border-indigo-500 scale-105 ring-2 ring-indigo-500/40"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 2: IDENTITÉ & RÔLE ADMINISTRATIF */}
              <div className="space-y-4">
                <div className={`flex items-center gap-2 pb-2 border-b ${isClassic ? "border-slate-800" : "border-slate-100"}`}>
                  <UserIcon className="w-4 h-4 text-indigo-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isClassic ? "text-slate-300" : "text-slate-700"}`}>
                    1. Identité & Rôle Administratif
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Nom & Prénom *</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`${inputStyle} pl-10`}
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <ValidatedInput
                      id="profile-input-email"
                      type="email"
                      label="Adresse E-mail Officielle"
                      required
                      placeholder="votre.email@example.com"
                      value={email}
                      onChange={setEmail}
                      validate={(val) => validateEmail(val, true)}
                      icon={Mail}
                      theme={isClassic ? "classic" : "modern"}
                    />
                  </div>

                  <div>
                    <ValidatedInput
                      id="profile-input-phone"
                      type="tel"
                      label="Numéro de Téléphone Principal"
                      placeholder="+33 6 12 34 56 78"
                      value={phone}
                      onChange={setPhone}
                      validate={(val) => validatePhone(val, false)}
                      icon={Phone}
                      theme={isClassic ? "classic" : "modern"}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Fonction dans l'Association</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={functionTitle}
                        onChange={(e) => setFunctionTitle(e.target.value)}
                        className={`${inputStyle} pl-10`}
                        placeholder="ex: Président, Secrétaire Général"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>N° de Licence / N° Bénévole Officiel</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className={`${inputStyle} pl-10 font-mono`}
                        placeholder="ex: LIC-2026-8894A"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Titre / Signataire pour Documents & Reçus</label>
                    <div className="relative">
                      <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={officialTitle}
                        onChange={(e) => setOfficialTitle(e.target.value)}
                        className={`${inputStyle} pl-10`}
                        placeholder="ex: Le Président du Bureau Exécutif"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: COORDONNÉES POSTALES & SECOURS */}
              <div className="space-y-4 pt-2">
                <div className={`flex items-center gap-2 pb-2 border-b ${isClassic ? "border-slate-800" : "border-slate-100"}`}>
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isClassic ? "text-slate-300" : "text-slate-700"}`}>
                    2. Coordonnées Postales & Contact d'Urgence
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className={labelStyle}>Adresse Domicile / Postale</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`${inputStyle} pl-10`}
                        placeholder="12 Avenue des Sports"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Code Postal</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className={`${inputStyle} pl-10 font-mono`}
                        placeholder="75012"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Ville</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`${inputStyle} pl-10`}
                        placeholder="Paris"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Contact d'Urgence (Nom & Lien)</label>
                    <div className="relative">
                      <Contact className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className={`${inputStyle} pl-10`}
                        placeholder="ex: Claire Martin (Épouse)"
                      />
                    </div>
                  </div>

                  <div>
                    <ValidatedInput
                      id="profile-input-emergency-phone"
                      type="tel"
                      label="Téléphone du Contact d'Urgence"
                      placeholder="+33 6 98 76 54 32"
                      value={emergencyContactPhone}
                      onChange={setEmergencyContactPhone}
                      validate={(val) => validatePhone(val, false)}
                      icon={PhoneCall}
                      theme={isClassic ? "classic" : "modern"}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: PRÉSENTATION & PREF */}
              <div className="space-y-4 pt-2">
                <div className={`flex items-center gap-2 pb-2 border-b ${isClassic ? "border-slate-800" : "border-slate-100"}`}>
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isClassic ? "text-slate-300" : "text-slate-700"}`}>
                    3. Présentation & Langue
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className={labelStyle}>Présentation / Bio Courte</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={inputStyle}
                      placeholder="Rédigez une courte présentation de votre rôle au sein du club..."
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Langue d'Affichage</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <select
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        className={`${inputStyle} pl-10 appearance-none`}
                      >
                        <option value="Français (FR)">Français (FR)</option>
                        <option value="English (US)">English (US)</option>
                        <option value="Español (ES)">Español (ES)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t ${isClassic ? "border-slate-800" : "border-slate-200"} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <span className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                  Dernière modification enregistrée dans la session locale.
                </span>

                <div className="flex items-center gap-3">
                  <button type="submit" className={primaryBtnStyle}>
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT 2: SECURITY & PASSWORDS */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* SECURITY SCORE BANNER */}
          <div className={`p-6 rounded-3xl border ${
            isClassic
              ? "bg-[#111] border-[#0d6efd]/40 shadow-xl"
              : "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-800/80 shadow-md"
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${
                  securityScore >= 80
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                }`}>
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      securityScore >= 80 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {securityScore >= 80 ? "Protection Maximale 🛡️" : "Protection Moyenne"}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Score de Sécurité : {securityScore}/100</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">Diagnostic d'Accès Administrateur</h3>
                  <p className="text-xs text-slate-300/80">
                    {twoFactor
                      ? "L'authentification 2FA est active et votre mot de passe administrateur est protégé."
                      : "Activez l'authentification à double facteur (2FA) pour atteindre un score de protection de 100%."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 justify-end">
                {!twoFactor && (
                  <button
                    type="button"
                    onClick={() => setShow2FAModal(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    Activer la 2FA (+35 pts)
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExportSecurityLogs}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Journal d'Audit (.csv)
                </button>
              </div>
            </div>

            {/* Visual checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mot de passe fort enregistré</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                {twoFactor ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>Double Facteur (2FA) : {twoFactor ? "Actif" : "Inactif"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sessions actives : {activeSessions.length} appareil(s)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Niveau : Super-Admin</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Change Password Card */}
            <div className={cardStyle}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/20">
                <div className="flex items-center gap-2.5">
                  <KeyRound className={`w-5 h-5 ${isClassic ? "text-blue-400" : "text-indigo-600"}`} />
                  <div>
                    <h3 className="font-bold text-lg">Changer de Mot de Passe</h3>
                    <p className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                      Modifiez le mot de passe d'accès à votre espace de gestion.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    isClassic
                      ? "bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                  }`}
                  title="Générer un mot de passe fort automatiquement"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Générer
                </button>
              </div>

              {passError && (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {passError}
                </div>
              )}

              {passSuccess && (
                <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {passSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className={labelStyle}>Mot de passe actuel *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${inputStyle} pl-10 pr-10`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelStyle}>Nouveau mot de passe *</label>
                    {newPassword && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        passwordStrength.score >= 75 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        Force : {passwordStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputStyle} pl-10 pr-10`}
                      placeholder="Saisissez ou générez un mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Gauge */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isClassic ? "bg-black" : "bg-slate-200"}`}>
                        <div
                          style={{ width: `${passwordStrength.score}%` }}
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Confirmer le nouveau mot de passe *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={`${inputStyle} pl-10 pr-10`}
                      placeholder="Ressaisir le nouveau mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className={`text-[11px] ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                    Modifié le 05/08/2026
                  </span>
                  <button type="submit" className={primaryBtnStyle}>
                    <Lock className="w-4 h-4" />
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </form>
            </div>

            {/* 2FA & Security Protection Card */}
            <div className={cardStyle}>
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-700/20">
                <ShieldCheck className={`w-5 h-5 ${isClassic ? "text-blue-400" : "text-indigo-600"}`} />
                <h3 className="font-bold text-lg">Protection & Authentification 2FA</h3>
              </div>

              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  twoFactor
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : isClassic
                    ? "bg-black/60 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-200/80 text-slate-700"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${twoFactor ? "bg-emerald-500/20 text-emerald-500" : "bg-slate-800 text-slate-400"}`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold">Authentification à Double Facteur (2FA)</h4>
                        {twoFactor && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[10px]">
                            ACTIF
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Exigez un code à 6 chiffres depuis votre application Mobile Authenticator (Google/Authy) lors de chaque connexion.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      twoFactor
                        ? "bg-red-500 text-white hover:bg-red-600 shadow-md"
                        : isClassic
                        ? "bg-[#0d6efd] text-white hover:bg-blue-600"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {twoFactor ? "Désactiver" : "Activer la 2FA"}
                  </button>
                </div>

                {/* Backup Emergency Codes Button */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isClassic ? "bg-black/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Codes de Secours 2FA</h4>
                      <p className="text-xs text-slate-400">
                        8 codes à usage unique en cas de perte de votre téléphone.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBackupCodesModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    Afficher
                  </button>
                </div>

                {/* Audit Checklist */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Normes de Sécurité & Conformité</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-500 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Stockage chiffré des mots de passe en mémoire sécurisée local/session</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Verrouillage automatique des sessions inactives & jetons de session</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Conformité RGPD & Chiffrement SSL/TLS des flux réseau</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE SESSIONS MANAGEMENT TABLE */}
          <div className={cardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/20">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-500" />
                  Appareils & Sessions Actives
                </h3>
                <p className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                  Consultez et révoquez les accès connectés à votre compte administrateur.
                </p>
              </div>

              {activeSessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeAllOther}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Déconnecter tous les autres appareils
                </button>
              )}
            </div>

            {sessionNotice && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {sessionNotice}
              </div>
            )}

            <div className="divide-y divide-slate-800/40">
              {activeSessions.map((sess) => (
                <div key={sess.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${sess.current ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-slate-800 text-slate-400"}`}>
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sess.device}</span>
                        {sess.current && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            Session Actuelle
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-xs">{sess.location} • IP: {sess.ip} • <span className="text-slate-300 font-mono">{sess.lastActive}</span></span>
                    </div>
                  </div>

                  {!sess.current && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Déconnecter
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECURITY AUDIT LOGS TABLE */}
          <div className={cardStyle}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/20">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
                  Journal Récents des Connexions & Activités de Sécurité
                </h3>
              </div>
              <span className="text-xs text-slate-500">{securityLogs.length} événements enregistrés</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isClassic ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                    <th className="pb-2.5 font-bold">Événement</th>
                    <th className="pb-2.5 font-bold">Appareil & Navigateur</th>
                    <th className="pb-2.5 font-bold">Adresse IP / Lieu</th>
                    <th className="pb-2.5 font-bold">Horodatage</th>
                    <th className="pb-2.5 font-bold text-right">Résultat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {securityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-3 font-semibold text-white">{log.event}</td>
                      <td className="py-3 text-slate-400">{log.device}</td>
                      <td className="py-3 text-slate-400 font-mono">{log.ip} ({log.location})</td>
                      <td className="py-3 text-slate-400">{log.date}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          log.status === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : log.status === "warning"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                        }`}>
                          {log.status === "success" ? "Succès 🟢" : log.status === "warning" ? "Refusé 🔴" : "Info ℹ️"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT 3: PREFERENCES & NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* TEST NOTIFICATION TOAST ANNOUNCEMENT */}
          <AnimatePresence>
            {showTestToast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="p-4 rounded-2xl bg-indigo-600 text-white border border-indigo-400/40 shadow-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <BellRing className="w-5 h-5 text-white animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Notification de Test AppAss Reçue 🔔</h4>
                    <p className="text-xs text-indigo-100">
                      Vos canaux de communication (Email, In-App, SMS) fonctionnent parfaitement.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTestToast(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTIVE CHANNELS STATUS BANNER */}
          <div className={`p-6 rounded-3xl border ${
            isClassic
              ? "bg-[#111] border-[#0d6efd]/40 shadow-xl"
              : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-700/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Canaux de Réception des Alertes</h3>
                  <p className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                    Vérifiez le statut de vos terminaux et testez l'envoi d'alertes en temps réel.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerTestNotification}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 shadow-md shadow-indigo-600/30 cursor-pointer self-start sm:self-auto"
              >
                <Send className="w-3.5 h-3.5" />
                Tester une Notification
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Email Channel */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                isClassic ? "bg-black/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
              }`}>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Canal E-mail</span>
                  <p className="font-bold text-xs truncate">{email}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Vérifié & Actif
                  </span>
                </div>
              </div>

              {/* Push Web Channel */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                isClassic ? "bg-black/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
              }`}>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">In-App & Push Web</span>
                  <p className="font-bold text-xs truncate">Chrome / Web App</p>
                  <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Notifications Autorisées
                  </span>
                </div>
              </div>

              {/* SMS Emergency Channel */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                isClassic ? "bg-black/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
              }`}>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Canal SMS Urgences</span>
                  <p className="font-bold text-xs truncate">{phone || "Non renseigné"}</p>
                  <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> Urgences uniquement
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: NOTIFICATION MATRIX TABLE */}
          <div className={cardStyle}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-700/20">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-500" />
                  Matrice Multi-Canaux des Notifications
                </h3>
                <p className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                  Choisissez précisément sur quel canal (E-mail, In-App ou SMS) recevoir chaque type d'alerte.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mr-1">Préréglages rapide :</span>
                <button
                  type="button"
                  onClick={() => handleApplyMatrixPreset("all")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition cursor-pointer"
                >
                  ⚡ Tout Activer
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyMatrixPreset("critical")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition cursor-pointer"
                >
                  🛡️ Urgences
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyMatrixPreset("silent")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition cursor-pointer"
                >
                  🔕 Minimal
                </button>

                {prefSaved && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 ml-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Enregistré !
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isClassic ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[11px]">Type de Notification</th>
                    <th className="pb-3 font-bold text-center w-24 uppercase tracking-wider text-[10px]">✉️ E-mail</th>
                    <th className="pb-3 font-bold text-center w-24 uppercase tracking-wider text-[10px]">🔔 Push</th>
                    <th className="pb-3 font-bold text-center w-24 uppercase tracking-wider text-[10px]">📱 SMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {Object.entries(notificationMatrix).map(([key, item]: [string, any]) => (
                    <tr key={key} className="hover:bg-slate-800/20 transition">
                      <td className="py-3.5 pr-4">
                        <span className="font-bold text-white text-xs block">{item.label}</span>
                        <span className="text-slate-400 text-[11px] block mt-0.5">{item.desc}</span>
                      </td>

                      {/* Email Toggle */}
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleMatrixChannel(key as keyof typeof notificationMatrix, "email")}
                          className={`w-9 h-5 rounded-full p-0.5 transition cursor-pointer mx-auto ${
                            item.email ? "bg-indigo-600" : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              item.email ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Push Toggle */}
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleMatrixChannel(key as keyof typeof notificationMatrix, "push")}
                          className={`w-9 h-5 rounded-full p-0.5 transition cursor-pointer mx-auto ${
                            item.push ? "bg-indigo-600" : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              item.push ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      {/* SMS Toggle */}
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleMatrixChannel(key as keyof typeof notificationMatrix, "sms")}
                          className={`w-9 h-5 rounded-full p-0.5 transition cursor-pointer mx-auto ${
                            item.sms ? "bg-amber-500" : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              item.sms ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: QUIET HOURS & DIGEST FREQUENCY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quiet Hours Card */}
            <div className={cardStyle}>
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-700/20">
                <Moon className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base">Mode "Ne Pas Déranger" & Plage du Silence</h3>
                  <p className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                    Suspendez la réception des notifications pendant vos heures de repos.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isClassic ? "bg-black/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
                }`}>
                  <div>
                    <h4 className="text-xs font-bold">Activer les Heures de Silence</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Met en sourdine les alertes non-urgentes.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
                    className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer ${
                      quietHoursEnabled ? "bg-indigo-600" : "bg-slate-700"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      quietHoursEnabled ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Début du silence</label>
                      <input
                        type="time"
                        value={quietHoursStart}
                        onChange={(e) => setQuietHoursStart(e.target.value)}
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Fin du silence</label>
                      <input
                        type="time"
                        value={quietHoursEnd}
                        onChange={(e) => setQuietHoursEnd(e.target.value)}
                        className={inputStyle}
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-start gap-2.5 cursor-pointer pt-2 text-xs">
                  <input
                    type="checkbox"
                    checked={allowEmergencyAlerts}
                    onChange={(e) => setAllowEmergencyAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-white block">Autoriser les alertes d'urgence critique</span>
                    <span className="text-[11px] text-slate-400">Les alertes de sécurité et annulations d'événements de dernière minute passeront malgré le silence.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Digest & Report Preferences Card */}
            <div className={cardStyle}>
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-700/20">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base">Fréquence de Réception & Résumés</h3>
                  <p className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                    Réglez le rythme d'envoi des rapports de l'association.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Fréquence des rapports & alertes</label>
                  <select
                    value={digestFrequency}
                    onChange={(e) => setDigestFrequency(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="Immédiat">Immédiat (Alertes envoyées en temps réel)</option>
                    <option value="Quotidien">Résumé Quotidien (Un e-mail chaque matin à 08h00)</option>
                    <option value="Hebdomadaire">Résumé Hebdomadaire (Le lundi matin à 08h00)</option>
                  </select>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isClassic ? "bg-black/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                    <FileText className="w-4 h-4" />
                    <span>Synthèse Comptable Mensuelle</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Générait un rapport PDF détaillé le 1er de chaque mois avec le bilan des cotisations perçues, des dépenses et de l'état de la trésorerie.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SYSTEM DISPLAY & ACCESSIBILITY PREFERENCES */}
          <div className={cardStyle}>
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-700/20">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="font-bold text-lg">Préférences Système, Format & Ergonomie</h3>
                <p className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                  Personnalisez l'affichage des dates, le comportement sonore et la densité de l'application.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className={labelStyle}>Format des Dates</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className={inputStyle}
                >
                  <option value="DD/MM/YYYY">11/08/2026 (Français)</option>
                  <option value="YYYY-MM-DD">2026-08-11 (ISO)</option>
                  <option value="D MMM YYYY">11 août 2026 (Texte)</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Premier jour de la semaine</label>
                <select
                  value={firstDayOfWeek}
                  onChange={(e) => setFirstDayOfWeek(e.target.value)}
                  className={inputStyle}
                >
                  <option value="Lundi">Lundi</option>
                  <option value="Dimanche">Dimanche</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Densité de l'Interface</label>
                <select
                  value={uiDensity}
                  onChange={(e) => setUiDensity(e.target.value)}
                  className={inputStyle}
                >
                  <option value="Confortable">Confortable (Espacée)</option>
                  <option value="Compacte">Compacte (Haute densité)</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Signal Sonore des Notifications</label>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                    soundEnabled
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  {soundEnabled ? "Carillon Activé" : "Silencieux"}
                </button>
              </div>
            </div>

            <div className={`mt-8 pt-5 border-t ${isClassic ? "border-slate-800" : "border-slate-200"} flex flex-col sm:flex-row items-center justify-between gap-4`}>
              <button
                type="button"
                onClick={handleResetDefaultPreferences}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                Réinitialiser les réglages par défaut
              </button>

              <button
                type="button"
                onClick={handleSaveNotifications}
                className={primaryBtnStyle}
              >
                <Save className="w-4 h-4" />
                Enregistrer toutes mes préférences
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT 4: ACTIVITY LOGS */}
      {activeTab === "activity" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* FEEDBACK BANNER */}
          <AnimatePresence>
            {activityFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 text-xs font-bold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>{activityFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivityFeedback("")}
                  className="p-1 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTIVITY OVERVIEW KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-[#111] border-[#0d6efd]/30" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Actions</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <History className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{activityLogsList.length}</div>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">Tracés en base de données</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-[#111] border-[#0d6efd]/30" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Période Active</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">30 Jours</div>
              <span className="text-[11px] text-slate-400 mt-1 inline-block">Aujourd'hui à 14:32</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-[#111] border-[#0d6efd]/30" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catégorie Principale</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-white truncate">Finances & Sécurité</div>
              <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">Surveillance renforcée</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isClassic ? "bg-[#111] border-[#0d6efd]/30" : "bg-white border-slate-200/80 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conformité RGPD</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Verified
              </div>
              <span className="text-[11px] text-slate-400 mt-1 inline-block">Journal crypté & anonymisé</span>
            </div>
          </div>

          {/* MAIN LOGS CARD */}
          <div className={cardStyle}>
            {/* CARD HEADER & TOP ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-700/20">
              <div className="flex items-center gap-2.5">
                <History className={`w-5 h-5 ${isClassic ? "text-blue-400" : "text-indigo-600"}`} />
                <div>
                  <h3 className="font-bold text-lg">Journal Audit d'Activité Récent</h3>
                  <p className={`text-xs ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
                    Historique des modifications, exports et actions administratives du compte.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleRefreshActivityLogs}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                  title="Rafraîchir les données"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualiser
                </button>

                <button
                  type="button"
                  onClick={handleExportActivityCSV}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Exporter CSV
                </button>

                <button
                  type="button"
                  onClick={handleClearNonSystemLogs}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 transition flex items-center gap-1.5 cursor-pointer"
                  title="Purger les logs non-essentiels"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge Logs
                </button>
              </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={activitySearchQuery}
                  onChange={(e) => setActivitySearchQuery(e.target.value)}
                  placeholder="Rechercher une action, auteur, IP ou détail..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {activitySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setActivitySearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="md:col-span-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedActivityCategory}
                  onChange={(e) => setSelectedActivityCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl text-xs bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Toutes">Toutes les catégories</option>
                  <option value="Finances">Finances & Cotisations</option>
                  <option value="Membres">Gestion des Membres</option>
                  <option value="Planning">Planning & Entraînements</option>
                  <option value="Paramètres">Paramètres Association</option>
                  <option value="Sécurité">Sécurité & Accès</option>
                  <option value="Matériel">Inventaire Matériel</option>
                  <option value="Gouvernance">Gouvernance & AG</option>
                </select>
              </div>

              {/* Timeframe Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedActivityTimeframe}
                  onChange={(e) => setSelectedActivityTimeframe(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl text-xs bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Tous">Toutes les dates</option>
                  <option value="Aujourd'hui">Aujourd'hui uniquement</option>
                  <option value="7 jours">7 derniers jours</option>
                  <option value="30 jours">30 derniers jours</option>
                </select>
              </div>
            </div>

            {/* LOGS LIST TIMELINE */}
            <div className="space-y-3">
              {filteredActivityLogs.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl">
                  <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-slate-300">Aucune activité ne correspond à vos critères</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Essayez de réinitialiser vos filtres de recherche ou de modifier la période sélectionnée.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActivitySearchQuery("");
                      setSelectedActivityCategory("Toutes");
                      setSelectedActivityTimeframe("Tous");
                    }}
                    className="mt-4 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                  >
                    Réinitialiser tous les filtres
                  </button>
                </div>
              ) : (
                filteredActivityLogs.map((log: any) => {
                  const LogIcon = log.icon || History;

                  // Dynamic Badge Styles
                  let categoryBadgeClass = "bg-slate-800 text-slate-300 border-slate-700";
                  if (log.category === "Finances") categoryBadgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                  else if (log.category === "Membres") categoryBadgeClass = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                  else if (log.category === "Planning") categoryBadgeClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
                  else if (log.category === "Sécurité") categoryBadgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                  else if (log.category === "Matériel") categoryBadgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                  else if (log.category === "Gouvernance") categoryBadgeClass = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";

                  return (
                    <div
                      key={log.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 hover:border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isClassic ? "bg-black/60 border-slate-800" : "bg-slate-50/90 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                          log.category === "Sécurité"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : log.category === "Finances"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30"
                        }`}>
                          <LogIcon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">{log.action}</h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${categoryBadgeClass}`}>
                              {log.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-1">{log.details}</p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {log.date}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-slate-300">{log.actor}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{log.ip}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspectingLogModal(log)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Inspecter
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* INSPECT LOG DETAIL MODAL */}
      <AnimatePresence>
        {inspectingLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-lg w-full bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-2xl relative space-y-5"
            >
              <button
                type="button"
                onClick={() => setInspectingLogModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Rapport d'Audit N° {inspectingLogModal.id}</span>
                  <h3 className="text-lg font-bold">{inspectingLogModal.action}</h3>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Horodatage</span>
                    <span className="font-semibold text-white">{inspectingLogModal.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Catégorie</span>
                    <span className="font-semibold text-indigo-400">{inspectingLogModal.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Auteur / Acteur</span>
                    <span className="font-semibold text-white">{inspectingLogModal.actor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Adresse IP</span>
                    <span className="font-mono text-slate-300">{inspectingLogModal.ip}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Navigateur & Système</span>
                  <span className="font-mono text-slate-300 text-[11px]">{inspectingLogModal.device}</span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Détails & Impact de l'Événement</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{inspectingLogModal.details}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectingLogModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(inspectingLogModal, null, 2));
                    setActivityFeedback("Payload JSON copié dans le presse-papier !");
                    setInspectingLogModal(null);
                    setTimeout(() => setActivityFeedback(""), 3000);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  Copier JSON Audit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIGITAL ADMIN PASS MODAL */}
      <AnimatePresence>
        {showDigitalCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-lg w-full bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setShowDigitalCardModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Pass Membre Officiel
                </div>
                <h3 className="text-xl font-extrabold font-display">Carte Administrateur Club</h3>
                <p className="text-xs text-slate-400">Présentez ce badge pour le contrôle d'accès aux équipements et événements.</p>
              </div>

              {/* CARD PREVIEW CONTAINER */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-xl space-y-5 relative">
                <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                      AA
                    </div>
                    <div>
                      <span className="block text-xs font-black uppercase tracking-wider text-indigo-200">AppAss Omnisports</span>
                      <span className="block text-[10px] text-indigo-400">Fédération Nationale</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30">
                    Saison 2025/2026
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-20 h-24 rounded-2xl bg-indigo-900/50 border-2 border-indigo-400/30 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-indigo-200">{name.charAt(0)}</span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Titulaire du Pass</span>
                    <h4 className="text-lg font-extrabold text-white leading-tight">{name}</h4>
                    <p className="text-indigo-200 font-medium">{functionTitle}</p>
                    <p className="text-slate-400 text-[11px] font-mono">Licence : {licenseNumber}</p>
                    {address && (
                      <p className="text-slate-400 text-[11px] line-clamp-1">{address}, {postalCode} {city}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60 text-[11px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Urgence</span>
                    <span className="font-semibold text-indigo-200 block">{emergencyContactName}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{emergencyContactPhone}</span>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <div className="bg-white p-1.5 rounded-xl border border-indigo-300">
                      <div className="w-12 h-12 grid grid-cols-4 gap-0.5 bg-white p-0.5">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-[1px] ${
                              i % 2 === 0 || i === 0 || i === 3 || i === 12 || i === 15 ? "bg-slate-900" : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5">
                <button
                  type="button"
                  onClick={() => setShowDigitalCardModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer / Exporter PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2FA SETUP MODAL */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-5 ${
                isClassic ? "bg-[#111] border-[#0d6efd] text-white" : "bg-slate-900 border-slate-800 text-white"
              }`}
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-1">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold">Activer l'Authentification 2FA</h3>
                <p className="text-xs text-slate-400">
                  Scannez ce QR Code avec votre application d'authentification (Google Authenticator, Authy, Microsoft Authenticator).
                </p>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex justify-center py-2">
                <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200">
                  {/* Visual simulated QR pattern */}
                  <div className="w-36 h-36 border-4 border-slate-900 p-2 grid grid-cols-5 gap-1 bg-white">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          i % 2 === 0 || i % 7 === 0 || i === 0 || i === 4 || i === 20 || i === 24
                            ? "bg-slate-900"
                            : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs text-indigo-400">
                Clef Secrète : <strong>APPASS-2026-ADM-X89</strong>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirm2FA}
                  className={primaryBtnStyle}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmer l'Activation 2FA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* 2FA BACKUP CODES MODAL */}
      <AnimatePresence>
        {showBackupCodesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-2xl relative space-y-5"
            >
              <button
                type="button"
                onClick={() => setShowBackupCodesModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold">Codes de Secours Administrateur</h3>
                <p className="text-xs text-slate-400">
                  Conservez ces 8 codes uniques en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois si vous perdez l'accès à votre application 2FA.
                </p>
              </div>

              {/* CODES GRID */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="grid grid-cols-2 gap-3 text-center font-mono text-xs font-bold text-indigo-300">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 tracking-wider">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Ne partagez jamais ces codes. Ils permettent un accès direct à votre espace de gestion.</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedBackupCodes ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedBackupCodes ? "Copiés !" : "Copier les codes"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

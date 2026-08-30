import React, { useState } from "react";
import { Member, Team, AppTheme } from "../types";
import { exportMembersPDF } from "../lib/pdfExporter";
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  User,
  X,
  Check,
  Download,
  Filter,
  Grid,
  List,
  Shield,
  Eye,
  Calendar,
  Sparkles,
  Award,
  Users,
  MapPin,
  HeartPulse,
  CreditCard,
  Zap,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ChevronRight,
  RefreshCw,
  Printer,
  FileCheck,
  Archive,
  ArchiveRestore
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { ValidatedInput } from "./ValidatedInput";
import { validateEmail, validatePhone } from "../lib/validation";

interface MembersProps {
  members: Member[];
  teams?: Team[];
  theme?: AppTheme;
  onAddMember: (member: Omit<Member, "id" | "createdAt">) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onUpdateTeam?: (team: Team) => void;
}

const getSuggestedCategory = (ageVal: number): string => {
  if (ageVal <= 7) return "U7 / Poussins";
  if (ageVal <= 9) return "U9 / Ecoles de sport";
  if (ageVal <= 11) return "U11 / Benjamins";
  if (ageVal <= 13) return "U13 / Minimes";
  if (ageVal <= 15) return "U15 / Cadets";
  if (ageVal <= 18) return "U18 / Juniors";
  if (ageVal <= 35) return "Sénior";
  if (ageVal <= 50) return "Vétéran (+35)";
  return "Master (+50)";
};

export const Members: React.FC<MembersProps> = ({
  members,
  teams = [],
  theme = "modern",
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onUpdateTeam
}) => {
  const isClassic = theme === "classic";

  // Controls & States
  const [searchTerm, setSearchTerm] = useState("");
  const [ageCategory, setAgeCategory] = useState<"all" | "under18" | "18to30" | "31to50" | "over50">("all");
  const [memberStatusFilter, setMemberStatusFilter] = useState<"active" | "archived" | "all">("active");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "age-asc" | "age-desc">("name-asc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Drawer / Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportPDFModalOpen, setIsExportPDFModalOpen] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("Registre Officiel des Membres & Licenciés");
  const [pdfIncludeSignatures, setPdfIncludeSignatures] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [archivingMember, setArchivingMember] = useState<Member | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<"identity" | "contact" | "sports" | "medical" | "payment">("identity");
  const [copiedLicense, setCopiedLicense] = useState(false);

  // Form input states
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"M" | "F" | "Autre">("M");
  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [category, setCategory] = useState("");
  const [role, setRole] = useState("Joueur");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [medicalCertificateStatus, setMedicalCertificateStatus] = useState<"valid" | "pending" | "expired" | "exempt">("valid");
  const [medicalCertificateDate, setMedicalCertificateDate] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("Parent");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending" | "exempt">("paid");
  const [paymentAmount, setPaymentAmount] = useState("150");
  const [paymentMethod, setPaymentMethod] = useState("CB");
  const [notes, setNotes] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setGender("M");
    setAge("");
    setBirthDate("");
    setLicenseNumber("");
    setEmail("");
    setPhone("");
    setAddress("");
    setCity("");
    setPostalCode("");
    setCategory("");
    setRole("Joueur");
    setSelectedTeamIds([]);
    setMedicalCertificateStatus("valid");
    setMedicalCertificateDate("");
    setEmergencyContactName("");
    setEmergencyContactPhone("");
    setEmergencyContactRelation("Parent");
    setPaymentStatus("paid");
    setPaymentAmount("150");
    setPaymentMethod("CB");
    setNotes("");
    setIsArchived(false);
    setError("");
    setEditingMember(null);
    setActiveFormTab("identity");
  };

  const handleOpenAdd = () => {
    resetForm();
    // Pre-generate a license number for convenience
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    setLicenseNumber(`LIC-2026-${randomNum}`);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setName(member.name || "");
    setGender(member.gender || "M");
    setAge(member.age?.toString() || "");
    setBirthDate("");
    setLicenseNumber(member.licenseNumber || `LIC-2026-${Math.floor(10000 + Math.random() * 90000)}`);
    setEmail(member.email || "");
    setPhone(member.phone || "");
    setAddress(member.address || "");
    setCity(member.city || "");
    setPostalCode(member.postalCode || "");
    setCategory(member.category || getSuggestedCategory(member.age));
    setRole(member.role || "Joueur");
    
    // Member teams
    const currentTeamIds = member.selectedTeamIds || teams.filter((t) => t.memberIds?.includes(member.id)).map((t) => t.id);
    setSelectedTeamIds(currentTeamIds);

    setMedicalCertificateStatus(member.medicalCertificateStatus || "valid");
    setMedicalCertificateDate(member.medicalCertificateDate || "");
    setEmergencyContactName(member.emergencyContactName || "");
    setEmergencyContactPhone(member.emergencyContactPhone || "");
    setEmergencyContactRelation(member.emergencyContactRelation || "Parent");
    setPaymentStatus(member.paymentStatus || "paid");
    setPaymentAmount(member.paymentAmount ? member.paymentAmount.toString() : "150");
    setPaymentMethod(member.paymentMethod || "CB");
    setNotes(member.notes || "");
    setIsArchived(!!member.isArchived);
    setError("");
    setActiveFormTab("identity");
    setIsFormOpen(true);
  };

  const handleGenerateLicenseNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    setLicenseNumber(`LIC-${year}-${randomNum}`);
  };

  const handleBirthDateChange = (dateVal: string) => {
    setBirthDate(dateVal);
    if (dateVal) {
      const today = new Date();
      const birth = new Date(dateVal);
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 0 && calculatedAge <= 120) {
        setAge(calculatedAge.toString());
        setCategory(getSuggestedCategory(calculatedAge));
      }
    }
  };

  const handleAgeChange = (ageVal: string) => {
    setAge(ageVal);
    const ageNum = parseInt(ageVal);
    if (!isNaN(ageNum) && ageNum > 0) {
      setCategory(getSuggestedCategory(ageNum));
    }
  };

  const handleFillDemoData = () => {
    const demoProfiles = [
      { name: "Thomas Moreau", gender: "M" as const, age: "22", bdate: "2004-05-14", cat: "Sénior", role: "Joueur" },
      { name: "Camille Dubois", gender: "F" as const, age: "16", bdate: "2010-09-21", cat: "U18 / Juniors", role: "Capitaine" },
      { name: "Lucas Bernard", gender: "M" as const, age: "28", bdate: "1998-02-11", cat: "Sénior", role: "Joueur" },
      { name: "Emma Laurent", gender: "F" as const, age: "14", bdate: "2012-11-03", cat: "U15 / Cadets", role: "Joueur" }
    ];
    const choice = demoProfiles[Math.floor(Math.random() * demoProfiles.length)];
    const randomLicense = `LIC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    setName(choice.name);
    setGender(choice.gender);
    setAge(choice.age);
    setBirthDate(choice.bdate);
    setLicenseNumber(randomLicense);
    setEmail(`${choice.name.toLowerCase().replace(/\s+/g, ".")}@example.fr`);
    setPhone("06 " + Math.floor(10 + Math.random() * 89) + " " + Math.floor(10 + Math.random() * 89) + " " + Math.floor(10 + Math.random() * 89) + " " + Math.floor(10 + Math.random() * 89));
    setAddress("12 Avenue des Sports");
    setCity("Paris");
    setPostalCode("75015");
    setCategory(choice.cat);
    setRole(choice.role);
    setMedicalCertificateStatus("valid");
    setMedicalCertificateDate("2025-09-01");
    setEmergencyContactName("Claire " + choice.name.split(" ")[1]);
    setEmergencyContactPhone("06 98 76 54 32");
    setEmergencyContactRelation("Parent");
    setPaymentStatus("paid");
    setPaymentAmount("150");
    setPaymentMethod("CB");
    setNotes("Dossier complet de test créé via la démo rapide.");
    if (teams.length > 0) {
      setSelectedTeamIds([teams[0].id]);
    }
  };

  const handleToggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setActiveFormTab("identity");
      setError("Le nom complet est obligatoire.");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setActiveFormTab("identity");
      setError("Veuillez saisir un âge valide (entre 1 et 120 ans).");
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setActiveFormTab("contact");
      setError(emailCheck.errorMessage || "Format d'adresse email invalide.");
      return;
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid) {
      setActiveFormTab("contact");
      setError(phoneCheck.errorMessage || "Format de numéro de téléphone invalide.");
      return;
    }

    if (emergencyContactPhone.trim()) {
      const emergencyPhoneCheck = validatePhone(emergencyContactPhone);
      if (!emergencyPhoneCheck.isValid) {
        setActiveFormTab("medical");
        setError("Contact d'urgence: " + (emergencyPhoneCheck.errorMessage || "Numéro de téléphone invalide."));
        return;
      }
    }

    const finalLicense = licenseNumber.trim() || `LIC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const finalCategory = category.trim() || getSuggestedCategory(ageNum);

    const memberPayload = {
      name: name.trim(),
      age: ageNum,
      email: email.trim(),
      phone: phone.trim(),
      gender,
      licenseNumber: finalLicense,
      category: finalCategory,
      role: role.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      medicalCertificateStatus,
      medicalCertificateDate: medicalCertificateDate || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      emergencyContactRelation: emergencyContactRelation.trim() || undefined,
      paymentStatus,
      paymentAmount: parseFloat(paymentAmount) || 0,
      paymentMethod,
      selectedTeamIds,
      notes: notes.trim() || undefined,
      isArchived,
      archivedAt: isArchived ? (editingMember?.archivedAt || new Date().toISOString()) : undefined
    };

    let targetMemberId = editingMember?.id;

    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        ...memberPayload
      });
    } else {
      onAddMember(memberPayload);
    }

    // Sync teams if callback provided
    if (onUpdateTeam && teams.length > 0) {
      teams.forEach((t) => {
        const isSelected = selectedTeamIds.includes(t.id);
        const currentlyInTeam = targetMemberId ? t.memberIds?.includes(targetMemberId) : false;

        if (isSelected && !currentlyInTeam && targetMemberId) {
          onUpdateTeam({
            ...t,
            memberIds: [...(t.memberIds || []), targetMemberId]
          });
        } else if (!isSelected && currentlyInTeam && targetMemberId) {
          onUpdateTeam({
            ...t,
            memberIds: (t.memberIds || []).filter((id) => id !== targetMemberId)
          });
        }
      });
    }

    resetForm();
    setIsFormOpen(false);
  };

  // Archiving actions
  const handleArchiveMember = (member: Member) => {
    const updatedMember: Member = {
      ...member,
      isArchived: true,
      archivedAt: new Date().toISOString()
    };
    onUpdateMember(updatedMember);
    if (selectedMember?.id === member.id) {
      setSelectedMember(updatedMember);
    }
  };

  const handleUnarchiveMember = (member: Member) => {
    const updatedMember: Member = {
      ...member,
      isArchived: false,
      archivedAt: undefined
    };
    onUpdateMember(updatedMember);
    if (selectedMember?.id === member.id) {
      setSelectedMember(updatedMember);
    }
  };

  // CSV Export helper
  const exportCSV = () => {
    const headers = ["ID", "Statut", "N Licence", "Nom Complet", "Age", "Categorie", "Email", "Telephone", "Certificat Medical", "Cotisation", "Equipes"];
    const rows = filteredMembers.map((m) => {
      const memberTeams = teams.filter((t) => t.memberIds?.includes(m.id)).map((t) => t.name).join("; ");
      return [
        `"${m.id}"`,
        `"${m.isArchived ? "Archivé" : "Actif"}"`,
        `"${m.licenseNumber || ""}"`,
        `"${m.name}"`,
        m.age,
        `"${m.category || getSuggestedCategory(m.age)}"`,
        `"${m.email || ""}"`,
        `"${m.phone || ""}"`,
        `"${m.medicalCertificateStatus || "Valide"}"`,
        `"${m.paymentStatus || "Payée"}"`,
        `"${memberTeams}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `membres_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort logic
  const filteredMembers = members
    .filter((m) => {
      const isArchived = !!m.isArchived;
      if (memberStatusFilter === "active" && isArchived) return false;
      if (memberStatusFilter === "archived" && !isArchived) return false;

      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search) ||
        (m.email && m.email.toLowerCase().includes(search)) ||
        (m.phone && m.phone.toLowerCase().includes(search)) ||
        (m.licenseNumber && m.licenseNumber.toLowerCase().includes(search)) ||
        (m.category && m.category.toLowerCase().includes(search));

      let matchesAge = true;
      if (ageCategory === "under18") matchesAge = m.age < 18;
      else if (ageCategory === "18to30") matchesAge = m.age >= 18 && m.age <= 30;
      else if (ageCategory === "31to50") matchesAge = m.age >= 31 && m.age <= 50;
      else if (ageCategory === "over50") matchesAge = m.age > 50;

      return matchesSearch && matchesAge;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "age-asc") return a.age - b.age;
      if (sortBy === "age-desc") return b.age - a.age;
      return 0;
    });

  // Calculate Stats
  const totalCount = members.length;
  const activeCount = members.filter((m) => !m.isArchived).length;
  const archivedCount = members.filter((m) => m.isArchived).length;
  const avgAge = activeCount ? Math.round(members.filter((m) => !m.isArchived).reduce((acc, m) => acc + m.age, 0) / activeCount) : 0;
  const validMedicalCount = members.filter((m) => !m.isArchived && (!m.medicalCertificateStatus || m.medicalCertificateStatus === "valid")).length;
  const paidMembersCount = members.filter((m) => !m.isArchived && (!m.paymentStatus || m.paymentStatus === "paid")).length;

  // Calculate completion percentage for form
  const filledFields = [!!name, !!age, !!email, !!phone, !!licenseNumber, !!address, !!medicalCertificateStatus, !!emergencyContactName, !!paymentStatus].filter(Boolean).length;
  const completionPercent = Math.round((filledFields / 9) * 100);

  const FORM_TABS = [
    { id: "identity", label: "1. Identité", icon: User },
    { id: "contact", label: "2. Contact & Adresse", icon: Mail },
    { id: "sports", label: "3. Sport & Équipes", icon: Shield },
    { id: "medical", label: "4. Santé & Urgence", icon: HeartPulse },
    { id: "payment", label: "5. Cotisation & Notes", icon: CreditCard }
  ] as const;

  return (
    <div id="members-view" className="space-y-6">
      {/* 1. Header & Primary Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Gestion des Membres
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              isClassic ? "bg-[#0d6efd]/20 text-blue-300 border border-[#0d6efd]/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}>
              {totalCount} Adhérents
            </span>
          </div>
          <p className={`text-sm ${isClassic ? "text-slate-400" : "text-slate-500"}`}>
            Inscrivez, modifiez et gérez les fiches administratives complètes de vos licenciés.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsExportPDFModalOpen(true)}
            className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs ${
              isClassic
                ? "bg-slate-800 border border-slate-700 text-blue-400 hover:bg-slate-700"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Exporter PDF Officiel</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              isClassic
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            }`}
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            id="btn-add-member"
            type="button"
            onClick={handleOpenAdd}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 transition shadow-md cursor-pointer ${
              isClassic
                ? "bg-[#0d6efd] hover:bg-blue-600 shadow-blue-600/20"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau Membre</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Actifs / Total</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="font-display text-2xl font-extrabold">{activeCount}</p>
            <span className="text-xs font-semibold text-slate-400">/ {totalCount} total</span>
            {archivedCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-mono">
                {archivedCount} arch.
              </span>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Âge Moyen (Actifs)</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1">{avgAge} <span className="text-xs font-normal text-slate-400">ans</span></p>
        </div>

        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Certificats Validés</span>
            <HeartPulse className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1 text-emerald-600">{validMedicalCount} <span className="text-xs font-normal text-slate-400">/ {activeCount}</span></p>
        </div>

        <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cotisations Réglées</span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <p className="font-display text-2xl font-extrabold mt-1 text-blue-600">{paidMembersCount} <span className="text-xs font-normal text-slate-400">/ {activeCount}</span></p>
        </div>
      </div>

      {/* 3. Filter & Controls Bar */}
      <div className={`p-4 rounded-2xl border space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-3 ${
        isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-members"
            type="text"
            placeholder="Rechercher par nom, licence, email, téléphone..."
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
          {/* Status Filter Pills */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs font-bold gap-0.5">
            <button
              type="button"
              onClick={() => setMemberStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                memberStatusFilter === "active"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span>Actifs</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-mono">
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMemberStatusFilter("archived")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                memberStatusFilter === "archived"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-extrabold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archivés</span>
              {archivedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-mono">
                  {archivedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMemberStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                memberStatusFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs font-extrabold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span>Tous</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                {totalCount}
              </span>
            </button>
          </div>

          {/* Age category filter */}
          <select
            value={ageCategory}
            onChange={(e) => setAgeCategory(e.target.value as any)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition cursor-pointer ${
              isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <option value="all">Toutes tranches d'âge</option>
            <option value="under18">Moins de 18 ans</option>
            <option value="18to30">18 - 30 ans</option>
            <option value="31to50">31 - 50 ans</option>
            <option value="over50">Plus de 50 ans</option>
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
            <option value="age-asc">Âge croissant</option>
            <option value="age-desc">Âge décroissant</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Vue Tableau"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Vue Cartes"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Members View: Table Layout */}
      {viewMode === "table" ? (
        <div className={`rounded-2xl border overflow-hidden ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                  isClassic ? "bg-slate-800/80 border-slate-800 text-slate-400" : "bg-slate-50/80 border-slate-200 text-slate-500"
                }`}>
                  <th className="py-4 px-6">Membre & Licence</th>
                  <th className="py-4 px-6">Âge & Catégorie</th>
                  <th className="py-4 px-6">Coordonnées</th>
                  <th className="py-4 px-6">Santé / Cotisation</th>
                  <th className="py-4 px-6">Équipe(s)</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Aucun membre ne correspond à vos critères.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, index) => {
                    const memberTeams = teams.filter((t) => t.memberIds?.includes(member.id));
                    const isMedValid = !member.medicalCertificateStatus || member.medicalCertificateStatus === "valid";
                    const isPaid = !member.paymentStatus || member.paymentStatus === "paid";

                    return (
                      <motion.tr
                        key={member.id}
                        id={`member-row-${member.id}`}
                        initial={{ opacity: 0, x: -16, y: 6 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.35), ease: "easeOut" }}
                        className={`transition group ${
                          isClassic ? "hover:bg-slate-800/50" : "hover:bg-indigo-50/30"
                        }`}
                      >
                        {/* Member Avatar & Name */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                              isClassic
                                ? "bg-blue-900/60 text-blue-300 border border-blue-500/30"
                                : "bg-indigo-100 text-indigo-700"
                            }`}>
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedMember(member)}
                                className="font-bold hover:underline text-left cursor-pointer block text-slate-900 dark:text-white"
                              >
                                {member.name}
                              </button>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                                  {member.licenseNumber || `LIC-2026-${member.id.substring(0, 5).toUpperCase()}`}
                                </span>
                                {member.isArchived && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                                    <Archive className="w-3 h-3" />
                                    Archivé
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Age & Category */}
                        <td className="py-3.5 px-6">
                          <span className="font-semibold block">{member.age} ans</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 inline-block mt-0.5">
                            {member.category || getSuggestedCategory(member.age)}
                          </span>
                        </td>

                        {/* Email & Phone */}
                        <td className="py-3.5 px-6 space-y-1">
                          {member.email ? (
                            <a
                              href={`mailto:${member.email}`}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{member.email}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Email non renseigné</span>
                          )}
                          {member.phone ? (
                            <a
                              href={`tel:${member.phone}`}
                              className="text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1.5 font-mono text-xs"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{member.phone}</span>
                            </a>
                          ) : null}
                        </td>

                        {/* Health & Payment Badges */}
                        <td className="py-3.5 px-6 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isMedValid ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                            }`}>
                              <HeartPulse className="w-3 h-3" />
                              {isMedValid ? "Certificat OK" : "Certificat Attente"}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPaid ? "bg-blue-500/10 text-blue-600" : "bg-rose-500/10 text-rose-600"
                            }`}>
                              <CreditCard className="w-3 h-3" />
                              {isPaid ? "Cotisation Réglée" : "Cotisation En Attente"}
                            </span>
                          </div>
                        </td>

                        {/* Teams */}
                        <td className="py-3.5 px-6">
                          <div className="flex flex-wrap gap-1">
                            {memberTeams.length > 0 ? (
                              memberTeams.map((t) => (
                                <span
                                  key={t.id}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    isClassic
                                      ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  }`}
                                >
                                  {t.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs italic">Sans équipe</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedMember(member)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
                              title="Voir fiche"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-edit-member-${member.id}`}
                              type="button"
                              onClick={() => handleOpenEdit(member)}
                              className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition cursor-pointer"
                              title="Modifier"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {member.isArchived ? (
                              <button
                                type="button"
                                onClick={() => handleUnarchiveMember(member)}
                                className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg transition cursor-pointer"
                                title="Désarchiver / Réactiver"
                              >
                                <ArchiveRestore className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setArchivingMember(member)}
                                className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition cursor-pointer"
                                title="Archiver ce membre"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              id={`btn-delete-member-${member.id}`}
                              type="button"
                              onClick={() => setDeletingMember(member)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 5. Members View: Grid Cards Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.length === 0 ? (
            <div className={`col-span-full p-12 text-center rounded-3xl border ${
              isClassic ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-400"
            }`}>
              Aucun membre trouvé.
            </div>
          ) : (
            filteredMembers.map((member, index) => {
              const memberTeams = teams.filter((t) => t.memberIds?.includes(member.id));
              const isMedValid = !member.medicalCertificateStatus || member.medicalCertificateStatus === "valid";
              const isPaid = !member.paymentStatus || member.paymentStatus === "paid";

              return (
                <motion.div
                  key={member.id}
                  id={`member-card-${member.id}`}
                  initial={{ opacity: 0, x: -16, y: 12 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
                  className={`p-5 rounded-3xl border flex flex-col justify-between transition group hover:shadow-md ${
                    isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl font-extrabold flex items-center justify-center text-sm shrink-0 ${
                          isClassic
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        }`}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-base line-clamp-1">{member.name}</h4>
                          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold block">
                            {member.licenseNumber || `LIC-2026-${member.id.substring(0, 5).toUpperCase()}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(member)}
                          className="p-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {member.isArchived ? (
                          <button
                            type="button"
                            onClick={() => handleUnarchiveMember(member)}
                            className="p-1.5 hover:bg-emerald-50 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-lg transition cursor-pointer"
                            title="Désarchiver / Réactiver"
                          >
                            <ArchiveRestore className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setArchivingMember(member)}
                            className="p-1.5 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-600 rounded-lg transition cursor-pointer"
                            title="Archiver ce membre"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeletingMember(member)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {member.isArchived && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                          <Archive className="w-3 h-3" />
                          Archivé
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isClassic ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                      }`}>
                        {member.age} ans • {member.category || getSuggestedCategory(member.age)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isMedValid ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {isMedValid ? "Certificat Valide" : "Certificat Attente"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {member.email ? (
                          <a href={`mailto:${member.email}`} className="hover:underline truncate">{member.email}</a>
                        ) : (
                          <span className="italic text-slate-400">Non renseigné</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {member.phone ? (
                          <a href={`tel:${member.phone}`} className="hover:underline font-mono">{member.phone}</a>
                        ) : (
                          <span className="italic text-slate-400">Non renseigné</span>
                        )}
                      </div>
                    </div>

                    {memberTeams.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {memberTeams.map((t) => (
                          <span key={t.id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-semibold border transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      isClassic
                        ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    Voir la fiche licencié
                  </button>
                  </motion.div>
                );
            })
          )}
        </div>
      )}

      {/* 6. Member Detail Profile Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badge Header */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl font-extrabold text-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                  isClassic ? "bg-[#0d6efd]" : "bg-indigo-600"
                }`}>
                  {selectedMember.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-xl">{selectedMember.name}</h3>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                      {selectedMember.licenseNumber || `LIC-2026-${selectedMember.id.substring(0, 5).toUpperCase()}`}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedMember.licenseNumber || `LIC-2026-${selectedMember.id.substring(0, 5).toUpperCase()}`);
                          setCopiedLicense(true);
                          setTimeout(() => setCopiedLicense(false), 2000);
                        }}
                        title="Copier le numéro de licence"
                        className="hover:text-indigo-800 transition cursor-pointer ml-1"
                      >
                        {copiedLicense ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>
                  </div>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                    {selectedMember.category || getSuggestedCategory(selectedMember.age)} • {selectedMember.role || "Joueur"}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className={`p-4 rounded-2xl border space-y-3 text-xs sm:text-sm ${
                isClassic ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200/80"
              }`}>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Âge :</span>
                  <span className="font-bold">{selectedMember.age} ans</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Email :</span>
                  {selectedMember.email ? (
                    <a href={`mailto:${selectedMember.email}`} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                      {selectedMember.email}
                    </a>
                  ) : (
                    <span className="italic text-slate-400">Non renseigné</span>
                  )}
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Téléphone :</span>
                  {selectedMember.phone ? (
                    <a href={`tel:${selectedMember.phone}`} className="font-mono font-bold hover:underline">
                      {selectedMember.phone}
                    </a>
                  ) : (
                    <span className="italic text-slate-400">Non renseigné</span>
                  )}
                </div>

                {selectedMember.address && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400">Adresse :</span>
                    <span className="font-semibold text-right">{selectedMember.address}, {selectedMember.postalCode} {selectedMember.city}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Certificat Médical :</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    (!selectedMember.medicalCertificateStatus || selectedMember.medicalCertificateStatus === "valid")
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {selectedMember.medicalCertificateStatus === "valid" || !selectedMember.medicalCertificateStatus ? "Valide / Conforme" : "En Attente de Transmission"}
                  </span>
                </div>

                {selectedMember.emergencyContactName && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400">Contact Urgence :</span>
                    <span className="font-semibold text-right">
                      {selectedMember.emergencyContactName} ({selectedMember.emergencyContactRelation || "Parent"}) - <span className="font-mono">{selectedMember.emergencyContactPhone}</span>
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Cotisation :</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    (!selectedMember.paymentStatus || selectedMember.paymentStatus === "paid")
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-rose-500/10 text-rose-600"
                  }`}>
                    {selectedMember.paymentStatus === "paid" || !selectedMember.paymentStatus ? `Réglée (${selectedMember.paymentAmount || 150} €)` : "Non réglée"}
                  </span>
                </div>

                <div className="flex justify-between items-start py-1">
                  <span className="text-slate-400">Équipes :</span>
                  <div className="flex flex-wrap justify-end gap-1 max-w-[200px]">
                    {teams.filter((t) => t.memberIds?.includes(selectedMember.id)).length > 0 ? (
                      teams
                        .filter((t) => t.memberIds?.includes(selectedMember.id))
                        .map((t) => (
                          <span key={t.id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                            {t.name}
                          </span>
                        ))
                    ) : (
                      <span className="text-slate-400 italic">Aucune équipe assignée</span>
                    )}
                  </div>
                </div>

                {selectedMember.notes && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-1 font-semibold">Remarques / Observations :</span>
                    <p className="text-slate-600 dark:text-slate-300 italic text-xs bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl">
                      "{selectedMember.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const memberToEdit = selectedMember;
                    setSelectedMember(null);
                    handleOpenEdit(memberToEdit);
                  }}
                  className="flex-1 min-w-[140px] py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>

                {selectedMember.isArchived ? (
                  <button
                    type="button"
                    onClick={() => handleUnarchiveMember(selectedMember)}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <ArchiveRestore className="w-4 h-4" />
                    Réactiver
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleArchiveMember(selectedMember)}
                    className="py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Archive className="w-4 h-4" />
                    Archiver
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="py-3 px-5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Enhanced Add / Edit Form Drawer Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              id="member-form-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className={`w-full max-w-xl h-full shadow-2xl flex flex-col justify-between border-l overflow-hidden ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
              }`}
            >
              {/* Drawer Top Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-xl">
                        {editingMember ? "Modifier la Fiche Licencié" : "Nouveau Licencié"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {editingMember ? `Mise à jour du profil de ${editingMember.name}` : "Enregistrez un nouveau membre avec son dossier complet"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFillDemoData}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
                      title="Remplir automatiquement des données de test"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>✨ Démo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-2">
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
                <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1 scrollbar-none">
                  {FORM_TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeFormTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFormTab(tab.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Body Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3.5 rounded-2xl font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form id="member-form" onSubmit={handleSubmit} className="space-y-5">
                  {/* TAB 1: IDENTITÉ */}
                  {activeFormTab === "identity" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Nom Complet *
                        </label>
                        <input
                          id="input-member-name"
                          type="text"
                          required
                          placeholder="Ex: Jean Dupont"
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
                            Genre
                          </label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                                : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                            }`}
                          >
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Âge (Ans) *
                          </label>
                          <input
                            id="input-member-age"
                            type="number"
                            required
                            min="1"
                            max="120"
                            placeholder="Ex: 24"
                            value={age}
                            onChange={(e) => handleAgeChange(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                                : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Date de Naissance (Calcul automatique de l'âge)
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Numéro de Licence Officiel
                          </label>
                          <button
                            type="button"
                            onClick={handleGenerateLicenseNumber}
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Générer Auto
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Ex: LIC-2026-89412"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm font-mono border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CONTACT */}
                  {activeFormTab === "contact" && (
                    <div className="space-y-4">
                      <ValidatedInput
                        id="input-member-email"
                        type="email"
                        label="Adresse Email"
                        placeholder="Ex: jean.dupont@example.com"
                        value={email}
                        onChange={setEmail}
                        validate={(val) => validateEmail(val, false)}
                        icon={Mail}
                        theme={theme === "classic" ? "classic" : "modern"}
                      />

                      <ValidatedInput
                        id="input-member-phone"
                        type="tel"
                        label="Numéro de Téléphone"
                        placeholder="Ex: 06 12 34 56 78"
                        value={phone}
                        onChange={setPhone}
                        validate={(val) => validatePhone(val, false)}
                        icon={Phone}
                        theme={theme === "classic" ? "classic" : "modern"}
                      />

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Adresse Domicile
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 12 Rue de la République"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
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
                            Code Postal
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 75001"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                                : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Ville
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Paris"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                                : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SPORT & ÉQUIPES */}
                  {activeFormTab === "sports" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Catégorie Sportive
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: U18 / Juniors, Sénior..."
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                                : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Rôle dans le Club
                          </label>
                          <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                                : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                            }`}
                          >
                            <option value="Joueur">Joueur / Pratiquant</option>
                            <option value="Capitaine">Capitaine d'équipe</option>
                            <option value="Entraîneur">Entraîneur / Coach</option>
                            <option value="Bénévole">Bénévole</option>
                            <option value="Bureau">Membre du Bureau</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Équipes Attribuées
                        </label>
                        {teams.length === 0 ? (
                          <p className="text-xs text-slate-400 italic p-3 border rounded-xl">Aucune équipe créée pour l'instant.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {teams.map((team) => {
                              const isChecked = selectedTeamIds.includes(team.id);
                              return (
                                <button
                                  type="button"
                                  key={team.id}
                                  onClick={() => handleToggleTeamSelection(team.id)}
                                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                                    isChecked
                                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold"
                                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <div>
                                    <span className="text-xs block">{team.name}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Entraîneur: {team.coach}</span>
                                  </div>
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                                    isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-700"
                                  }`}>
                                    {isChecked && <Check className="w-3.5 h-3.5" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SANTÉ & URGENCE */}
                  {activeFormTab === "medical" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <HeartPulse className="w-4 h-4" /> Certificat Médical & Aptitude
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                              Statut Certificat
                            </label>
                            <select
                              value={medicalCertificateStatus}
                              onChange={(e) => setMedicalCertificateStatus(e.target.value as any)}
                              className={`w-full rounded-xl py-2 px-3 outline-none text-xs border transition ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            >
                              <option value="valid">Valide / Conforme</option>
                              <option value="pending">En attente de réception</option>
                              <option value="expired">Expiré</option>
                              <option value="exempt">Dispensé (Surclassement)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                              Date d'Émission
                            </label>
                            <input
                              type="date"
                              value={medicalCertificateDate}
                              onChange={(e) => setMedicalCertificateDate(e.target.value)}
                              className={`w-full rounded-xl py-2 px-3 outline-none text-xs border transition ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-rose-500" /> Contact d'Urgence
                        </h4>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">
                            Nom & Prénom du Contact
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Marie Dupont"
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                            className={`w-full rounded-xl py-2 px-3 outline-none text-xs border transition ${
                              isClassic
                                ? "bg-slate-800 border-slate-700 text-white"
                                : "bg-white border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <ValidatedInput
                              id="input-emergency-phone"
                              type="tel"
                              label="Téléphone d'Urgence"
                              placeholder="Ex: 06 98 76 54 32"
                              value={emergencyContactPhone}
                              onChange={setEmergencyContactPhone}
                              validate={(val) => validatePhone(val, false)}
                              icon={Phone}
                              theme={theme === "classic" ? "classic" : "modern"}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                              Lien de Parenté
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: Parent, Conjoint..."
                              value={emergencyContactRelation}
                              onChange={(e) => setEmergencyContactRelation(e.target.value)}
                              className={`w-full rounded-xl py-2 px-3 outline-none text-xs border transition ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: COTISATION & NOTES */}
                  {activeFormTab === "payment" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-500" /> Cotisation Annuelle
                        </h4>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                              Statut
                            </label>
                            <select
                              value={paymentStatus}
                              onChange={(e) => setPaymentStatus(e.target.value as any)}
                              className={`w-full rounded-xl py-2 px-2.5 outline-none text-xs border transition ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            >
                              <option value="paid">Réglée</option>
                              <option value="pending">En attente</option>
                              <option value="exempt">Exonéré</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                              Montant (€)
                            </label>
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className={`w-full rounded-xl py-2 px-2.5 outline-none text-xs font-bold border transition ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                              Mode
                            </label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className={`w-full rounded-xl py-2 px-2.5 outline-none text-xs border transition ${
                                isClassic
                                  ? "bg-slate-800 border-slate-700 text-white"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}
                            >
                              <option value="CB">Carte Bancaire</option>
                              <option value="Virement">Virement</option>
                              <option value="Chèque">Chèque</option>
                              <option value="Espèces">Espèces</option>
                              <option value="Pass Sport">Pass Sport</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Remarques & Observations Administratives
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Allergies, autorisations d'image, remarques spécifiques..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className={`w-full rounded-xl p-3 outline-none text-xs border transition ${
                            isClassic
                              ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500"
                          }`}
                        />
                      </div>

                      {/* Archiving Toggle Option */}
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Archive className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <div>
                            <span className="font-bold text-xs block text-slate-900 dark:text-white">
                              Archiver ce membre
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Masque le membre du registre actif sans supprimer ses historiques et pièces financières.
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isArchived}
                          onChange={(e) => setIsArchived(e.target.checked)}
                          className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
                        />
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Drawer Footer Controls */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition text-xs sm:text-sm cursor-pointer"
                >
                  Annuler
                </button>

                <div className="flex items-center gap-2">
                  {/* Previous / Next tab buttons */}
                  {activeFormTab !== "identity" && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = FORM_TABS.findIndex((t) => t.id === activeFormTab);
                        if (currentIndex > 0) setActiveFormTab(FORM_TABS[currentIndex - 1].id);
                      }}
                      className="px-3.5 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Précédent
                    </button>
                  )}

                  {activeFormTab !== "payment" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = FORM_TABS.findIndex((t) => t.id === activeFormTab);
                        if (currentIndex < FORM_TABS.length - 1) setActiveFormTab(FORM_TABS[currentIndex + 1].id);
                      }}
                      className="px-4 py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl transition text-xs cursor-pointer hover:bg-slate-700 flex items-center gap-1"
                    >
                      <span>Suivant</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={`px-5 py-3 font-bold rounded-xl transition text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer text-white ${
                      isClassic ? "bg-[#0d6efd] hover:bg-blue-600" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingMember ? "Enregistrer" : "Créer le membre"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* PDF Export Options Modal */}
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
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Exportation PDF Officielle</h3>
                    <p className="text-xs text-slate-500">
                      Générez un document imprimable avec en-tête et signatures.
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
                  <label className="block font-bold mb-1">Titre du Document</label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Membres inclus</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-mono font-bold">
                      {filteredMembers.length} sur {members.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    L'export prendra en compte les filtres de recherche et de catégorie actuellement actifs.
                  </p>
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <input
                    type="checkbox"
                    checked={pdfIncludeSignatures}
                    onChange={(e) => setPdfIncludeSignatures(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold block">Inclure la zone de signatures officielles</span>
                    <span className="text-[11px] text-slate-500">Ajoute les cadres pour le Secrétaire Général et le Président en bas de document.</span>
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
                    exportMembersPDF(filteredMembers, {
                      title: pdfTitle,
                      categoryFilter: ageCategory,
                      includeSignatures: pdfIncludeSignatures
                    });
                    setIsExportPDFModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Télécharger le PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MEMBER CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={() => {
          if (deletingMember) {
            onDeleteMember(deletingMember.id);
            setDeletingMember(null);
          }
        }}
        title="Supprimer ce membre ?"
        itemName={deletingMember?.name}
        description="Cette action est définitive. La fiche de ce membre et ses rattachements seront supprimés de la base."
        confirmText="Supprimer le membre"
        cancelText="Conserver le membre"
        theme={theme}
      />

      {/* ARCHIVE MEMBER CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={!!archivingMember}
        onClose={() => setArchivingMember(null)}
        onConfirm={() => {
          if (archivingMember) {
            handleArchiveMember(archivingMember);
            setArchivingMember(null);
          }
        }}
        title="Archiver ce membre ?"
        itemName={archivingMember?.name}
        description="Le membre sera retiré des effectifs actifs. Son historique de cotisations et ses données seront conservés."
        confirmText="Archiver le membre"
        cancelText="Annuler"
        theme={theme}
      />
    </div>
  );
};

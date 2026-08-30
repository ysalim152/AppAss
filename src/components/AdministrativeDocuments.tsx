import React, { useState, useMemo, useRef } from "react";
import {
  AdministrativeDocument,
  AdministrativeDocType,
  DocumentStatus,
  AssociationInfo,
  AppTheme
} from "../types";
import {
  FileText,
  FolderArchive,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Shield,
  Building2,
  Landmark,
  Award,
  Handshake,
  FileSpreadsheet,
  Layers,
  Tag,
  Printer,
  Copy,
  Check,
  X,
  Upload,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  Lock,
  Unlock,
  Archive,
  ExternalLink,
  MapPin,
  Users,
  Briefcase,
  SlidersHorizontal,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdministrativeDocumentsProps {
  documents: AdministrativeDocument[];
  associationInfo: AssociationInfo;
  theme: AppTheme;
  onAddDocument: (doc: Omit<AdministrativeDocument, "id" | "createdAt">) => void;
  onUpdateDocument: (id: string, updates: Partial<AdministrativeDocument>) => void;
  onDeleteDocument: (id: string) => void;
}

// Icon & Color Helper for Document Types
const DOC_TYPE_META: Record<
  AdministrativeDocType,
  {
    icon: React.ElementType;
    color: string;
    bgLight: string;
    badgeBg: string;
    badgeText: string;
    shortLabel: string;
    folderName: string;
  }
> = {
  "Statuts & Règlements": {
    icon: Landmark,
    color: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/50",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    shortLabel: "Statuts & RI",
    folderName: "1. Statuts & Gouvernance"
  },
  "Procès-Verbaux (PV d'AG & CA)": {
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    badgeBg: "bg-blue-100 dark:bg-blue-900/50",
    badgeText: "text-blue-700 dark:text-blue-300",
    shortLabel: "PV d'AG & CA",
    folderName: "2. Assemblées Générales & CA"
  },
  "Conventions & Partenariats": {
    icon: Handshake,
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    shortLabel: "Conventions",
    folderName: "3. Conventions & Sponsoring"
  },
  "Agréments & Affiliations": {
    icon: Award,
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    badgeBg: "bg-amber-100 dark:bg-amber-900/50",
    badgeText: "text-amber-700 dark:text-amber-300",
    shortLabel: "Agréments",
    folderName: "4. Agréments & Fédérations"
  },
  "Assurances & Responsabilité Civile": {
    icon: Shield,
    color: "text-rose-600 dark:text-rose-400",
    bgLight: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    badgeBg: "bg-rose-100 dark:bg-rose-900/50",
    badgeText: "text-rose-700 dark:text-rose-300",
    shortLabel: "Assurances",
    folderName: "5. Assurances & Sécurité"
  },
  "Contrats & Baux": {
    icon: Briefcase,
    color: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    badgeBg: "bg-purple-100 dark:bg-purple-900/50",
    badgeText: "text-purple-700 dark:text-purple-300",
    shortLabel: "Contrats & Baux",
    folderName: "6. Contrats & Baux"
  },
  "Dossiers Subventions & CERFA": {
    icon: FileSpreadsheet,
    color: "text-cyan-600 dark:text-cyan-400",
    bgLight: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800",
    badgeBg: "bg-cyan-100 dark:bg-cyan-900/50",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    shortLabel: "Subventions",
    folderName: "7. Subventions & CERFA"
  },
  "Bilans & Comptes Financiers": {
    icon: FileCheck,
    color: "text-teal-600 dark:text-teal-400",
    bgLight: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    badgeBg: "bg-teal-100 dark:bg-teal-900/50",
    badgeText: "text-teal-700 dark:text-teal-300",
    shortLabel: "Bilans Financiers",
    folderName: "8. Bilans & Comptes"
  },
  "Autre": {
    icon: FileText,
    color: "text-slate-600 dark:text-slate-400",
    bgLight: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-700 dark:text-slate-300",
    shortLabel: "Autres documents",
    folderName: "9. Autres Archives"
  }
};

const ALL_DOC_TYPES: AdministrativeDocType[] = [
  "Statuts & Règlements",
  "Procès-Verbaux (PV d'AG & CA)",
  "Conventions & Partenariats",
  "Agréments & Affiliations",
  "Assurances & Responsabilité Civile",
  "Contrats & Baux",
  "Dossiers Subventions & CERFA",
  "Bilans & Comptes Financiers",
  "Autre"
];

export const AdministrativeDocuments: React.FC<AdministrativeDocumentsProps> = ({
  documents,
  associationInfo,
  theme,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument
}) => {
  const isClassic = theme === "classic";

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "title_asc" | "expiry_asc">("date_desc");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "folders">("grid");

  // Modals State
  const [previewDoc, setPreviewDoc] = useState<AdministrativeDocument | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<AdministrativeDocType>("Statuts & Règlements");
  const [formCategory, setFormCategory] = useState("");
  const [formRef, setFormRef] = useState("");
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [formValidUntil, setFormValidUntil] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSignatories, setFormSignatories] = useState("");
  const [formStatus, setFormStatus] = useState<DocumentStatus>("valid");
  const [formSeason, setFormSeason] = useState(associationInfo.season || "2025 - 2026");
  const [formLocation, setFormLocation] = useState("Bureau Administratif - Armoire 1");
  const [formTags, setFormTags] = useState("");
  const [formIsConfidential, setFormIsConfidential] = useState(false);
  const [formFileName, setFormFileName] = useState("");
  const [formFileSize, setFormFileSize] = useState("");
  const [formFileType, setFormFileType] = useState<"pdf" | "docx" | "image" | "scan" | "sheet" | "text">("pdf");
  const [formNotes, setFormNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template Generator state
  const [selectedTemplateId, setSelectedTemplateId] = useState<"pv_ag" | "convention_partenariat" | "statuts_loi1901" | "reglement_interieur">("pv_ag");
  const [templateCustomTitle, setTemplateCustomTitle] = useState("");
  const [copiedTemplateText, setCopiedTemplateText] = useState(false);

  // Extract unique tags & seasons
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    documents.forEach((d) => {
      d.tags?.forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [documents]);

  const allSeasons = useMemo(() => {
    const seasons = new Set<string>();
    documents.forEach((d) => {
      if (d.season) seasons.add(d.season);
    });
    return Array.from(seasons).sort().reverse();
  }, [documents]);

  // Compute counts per type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: documents.length };
    ALL_DOC_TYPES.forEach((t) => (counts[t] = 0));
    documents.forEach((d) => {
      counts[d.type] = (counts[d.type] || 0) + 1;
    });
    return counts;
  }, [documents]);

  // Regulatory Watch (Expiring within 60 days or already expired)
  const expiringAlerts = useMemo(() => {
    const today = new Date();
    const alertThreshold = new Date();
    alertThreshold.setDate(today.getDate() + 60);

    return documents.filter((d) => {
      if (d.status === "archived") return false;
      if (!d.validUntilDate) return false;
      const expDate = new Date(d.validUntilDate);
      return expDate <= alertThreshold;
    });
  }, [documents]);

  // Filtered & Sorted Documents
  const filteredDocuments = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return documents
      .filter((doc) => {
        // Search term matches
        const matchesSearch =
          !q ||
          doc.title.toLowerCase().includes(q) ||
          (doc.referenceNumber && doc.referenceNumber.toLowerCase().includes(q)) ||
          (doc.description && doc.description.toLowerCase().includes(q)) ||
          (doc.fileName && doc.fileName.toLowerCase().includes(q)) ||
          (doc.locationStored && doc.locationStored.toLowerCase().includes(q)) ||
          doc.signatories?.some((s) => s.toLowerCase().includes(q)) ||
          doc.tags?.some((t) => t.toLowerCase().includes(q));

        // Type filter
        const matchesType = selectedType === "all" || doc.type === selectedType;

        // Status filter
        const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;

        // Season filter
        const matchesSeason = selectedSeason === "all" || doc.season === selectedSeason;

        // Tag filter
        const matchesTag = selectedTag === "all" || (doc.tags && doc.tags.includes(selectedTag));

        return matchesSearch && matchesType && matchesStatus && matchesSeason && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === "date_desc") {
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
        }
        if (sortBy === "date_asc") {
          return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        }
        if (sortBy === "title_asc") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "expiry_asc") {
          const expA = a.validUntilDate ? new Date(a.validUntilDate).getTime() : Infinity;
          const expB = b.validUntilDate ? new Date(b.validUntilDate).getTime() : Infinity;
          return expA - expB;
        }
        return 0;
      });
  }, [documents, searchTerm, selectedType, selectedStatus, selectedSeason, selectedTag, sortBy]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedStatus("all");
    setSelectedSeason("all");
    setSelectedTag("all");
    setSortBy("date_desc");
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingDocId(null);
    setFormTitle("");
    setFormType(selectedType !== "all" ? (selectedType as AdministrativeDocType) : "Statuts & Règlements");
    setFormCategory("Juridique & Gouvernance");
    setFormRef(`DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setFormIssueDate(new Date().toISOString().split("T")[0]);
    setFormValidUntil("");
    setFormDescription("");
    setFormSignatories(`${associationInfo.presidentName || "Marie DUBOIS"} (Présidente)`);
    setFormStatus("valid");
    setFormSeason(associationInfo.season || "2025 - 2026");
    setFormLocation("Bureau Administratif - Armoire 1");
    setFormTags("Officiel, Administratif");
    setFormIsConfidential(false);
    setFormFileName("Document_Officiel.pdf");
    setFormFileSize("1.2 Mo");
    setFormFileType("pdf");
    setFormNotes("");
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (doc: AdministrativeDocument) => {
    setEditingDocId(doc.id);
    setFormTitle(doc.title);
    setFormType(doc.type);
    setFormCategory(doc.category || "");
    setFormRef(doc.referenceNumber || "");
    setFormIssueDate(doc.issueDate);
    setFormValidUntil(doc.validUntilDate || "");
    setFormDescription(doc.description || "");
    setFormSignatories(doc.signatories ? doc.signatories.join(", ") : "");
    setFormStatus(doc.status);
    setFormSeason(doc.season || associationInfo.season || "2025 - 2026");
    setFormLocation(doc.locationStored || "");
    setFormTags(doc.tags ? doc.tags.join(", ") : "");
    setFormIsConfidential(doc.isConfidential || false);
    setFormFileName(doc.fileName || "Document.pdf");
    setFormFileSize(doc.fileSize || "1.0 Mo");
    setFormFileType(doc.fileType || "pdf");
    setFormNotes(doc.notes || "");
    setIsAddEditModalOpen(true);
  };

  // Save Add or Edit
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedSignatories = formSignatories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedTags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const docPayload = {
      title: formTitle.trim(),
      type: formType,
      category: formCategory.trim() || undefined,
      referenceNumber: formRef.trim() || undefined,
      issueDate: formIssueDate,
      validUntilDate: formValidUntil || undefined,
      description: formDescription.trim() || undefined,
      signatories: parsedSignatories.length > 0 ? parsedSignatories : undefined,
      status: formStatus,
      season: formSeason,
      locationStored: formLocation.trim() || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      isConfidential: formIsConfidential,
      fileName: formFileName.trim() || `${formTitle.replace(/\s+/g, "_")}.pdf`,
      fileSize: formFileSize || "1.1 Mo",
      fileType: formFileType,
      notes: formNotes.trim() || undefined,
      updatedAt: new Date().toISOString()
    };

    if (editingDocId) {
      onUpdateDocument(editingDocId, docPayload);
    } else {
      onAddDocument(docPayload);
    }

    setIsAddEditModalOpen(false);
    setEditingDocId(null);
  };

  // Handle Local File Upload Selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFileName(file.name);
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setFormFileSize(`${sizeInMb} Mo`);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") setFormFileType("pdf");
      else if (ext === "docx" || ext === "doc") setFormFileType("docx");
      else if (ext === "xlsx" || ext === "xls" || ext === "csv") setFormFileType("sheet");
      else if (ext === "png" || ext === "jpg" || ext === "jpeg") setFormFileType("image");
      else setFormFileType("scan");

      if (!formTitle) {
        setFormTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
      }
    }
  };

  // Simulated Download Action
  const handleDownloadDocument = (doc: AdministrativeDocument) => {
    const content = `================================================================================
RÉPUBLIQUE FRANÇAISE - LOI DU 1ER JUILLET 1901
DOCUMENT ADMINISTRATIF OFFICIEL
================================================================================
ASSOCIATION : ${associationInfo.name}
SIRET       : ${associationInfo.siret || "N/A"}
RNA         : ${associationInfo.rna || "N/A"}
ADRESSE     : ${associationInfo.address}
CONTACT     : ${associationInfo.email} | ${associationInfo.phone}
--------------------------------------------------------------------------------
TITRE       : ${doc.title}
TYPE        : ${doc.type}
RÉFÉRENCE   : ${doc.referenceNumber || "NON RENSEIGNÉE"}
DATE SIGN.  : ${doc.issueDate}
VALIDITÉ    : ${doc.validUntilDate || "Permanente"}
STATUT      : ${doc.status.toUpperCase()}
SIGNATAIRES : ${doc.signatories ? doc.signatories.join(", ") : "Bureau de l'Association"}
LIEU ARCHIVE: ${doc.locationStored || "Bureau Administratif"}
--------------------------------------------------------------------------------
OBJET & DESCRIPTION :
${doc.description || "Document administratif officiel de l'association."}

NOTES :
${doc.notes || "Certifié conforme aux archives originales du club."}
================================================================================
Fait à Paris, le ${new Date().toLocaleDateString("fr-FR")}
Cachet et Signature de la Présidence :
${associationInfo.signatoryName || "Marie DUBOIS - Présidente"}
================================================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.fileName || `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper for Status Badge
  const renderStatusBadge = (status: DocumentStatus, validUntil?: string) => {
    if (status === "archived") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <Archive className="w-3 h-3" />
          <span>Archivé</span>
        </span>
      );
    }
    if (status === "pending_signature") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3 h-3 text-amber-500" />
          <span>En signature</span>
        </span>
      );
    }
    if (status === "expired" || (validUntil && new Date(validUntil) < new Date())) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          <span>Expiré / À renouveler</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        <span>Valide & En vigueur</span>
      </span>
    );
  };

  // Templates Definitions
  const templates = [
    {
      id: "pv_ag",
      title: "Procès-Verbal d'Assemblée Générale Ordinaire (AGO)",
      type: "Procès-Verbaux (PV d'AG & CA)" as AdministrativeDocType,
      desc: "Modèle complet avec ordre du jour, émargement, vote du rapport moral, quitus trésorier et renouvellement du bureau.",
      body: `PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE ORDINAIRE
ASSOCIATION : ${associationInfo.name}
SIRET : ${associationInfo.siret || "123 456 789 00012"} - RNA : ${associationInfo.rna || "W751029384"}
Siège social : ${associationInfo.address}

Le ${new Date().toLocaleDateString("fr-FR")} à 19h00, les membres de l'association se sont réunis en Assemblée Générale Ordinaire.
La séance est présidée par ${associationInfo.presidentName || "Marie DUBOIS"}, Présidente.
Le secrétariat de séance est assuré par ${associationInfo.secretaryName || "Claire MOREAU"}.

ORDRE DU JOUR :
1. Rapport moral et d'activité présenté par la Présidente.
2. Rapport financier et présentation des comptes de l'exercice par le Trésorier.
3. Vote de quitus et affectation du résultat financier.
4. Fixation du montant des cotisations pour la saison ${associationInfo.season || "2025 - 2026"}.
5. Élection / Renouvellement des membres du Bureau.
6. Questions diverses.

RÉSOLUTIONS VOTÉES :
- 1ère Résolution : Le rapport moral est adopté à l'unanimité des présents et représentés.
- 2ème Résolution : Les comptes annuels et le bilan financier sont approuvés sans réserve (Quitus accordé au Trésorier).
- 3ème Résolution : La cotisation standard est fixée à ${associationInfo.defaultFee || "150"} € pour la saison à venir.

L'ordre du jour étant épuisé, la séance est levée à 21h15.

Signatures officielles :
La Présidente : ${associationInfo.presidentName || "Marie DUBOIS"}
Le Trésorier : ${associationInfo.treasurerName || "Jean-Pierre MARTIN"}
La Secrétaire : ${associationInfo.secretaryName || "Claire MOREAU"}`
    },
    {
      id: "convention_partenariat",
      title: "Convention de Partenariat & Sponsoring Sportif",
      type: "Conventions & Partenariats" as AdministrativeDocType,
      desc: "Accord officiel régissant le soutien financier/matériel d'un partenaire, encart maillot et visibilité sur les supports de communication.",
      body: `CONVENTION DE PARTENARIAT & DE SPONSORING

ENTRE LES SOUSSIGNÉS :
L'association : ${associationInfo.name}
Affiliée sous le numéro : ${associationInfo.federationNumber || "5875042"}
Représentée par : ${associationInfo.presidentName || "Marie DUBOIS"}, en qualité de Présidente,
D'une part,

ET :
L'Entreprise Partenaire / Sponsor : [Nom de l'entreprise sponsor]
Représentée par : [Nom du dirigeant / Qualité]
Adresse : [Adresse complète du partenaire]
D'autre part.

IL A ÉTÉ CONVENU CE QUI SUIT :
Article 1 - Objet de la convention :
L'Entreprise apporte son soutien financier à l'Association à hauteur de [Montant en euros] € pour la saison sportive ${associationInfo.season || "2025 - 2026"}.

Article 2 - Engagements de l'Association :
En contrepartie, l'Association s'engage à :
- Apposer le logo du Partenaire sur les maillots officiels de l'équipe [Nom de l'équipe].
- Mentionner le Partenaire sur son site officiel (${associationInfo.website || "www.association.fr"}) et ses réseaux sociaux.
- Mettre à disposition [Nombre] invitations pour les rencontres à domicile.

Article 3 - Durée :
La présente convention est conclue pour la durée de la saison sportive en cours, du [Date début] au [Date fin].

Fait en deux exemplaires originaux, à Paris, le ${new Date().toLocaleDateString("fr-FR")}.

Pour l'Association :                              Pour le Partenaire :
${associationInfo.signatoryName || "Marie DUBOIS - Présidente"}             Le Représentant Légal`
    },
    {
      id: "statuts_loi1901",
      title: "Statuts Types d'Association Loi 1901",
      type: "Statuts & Règlements" as AdministrativeDocType,
      desc: "Trame juridique conforme au Code civil et à la Loi du 1er juillet 1901 pour révision ou constitution d'association.",
      body: `STATUTS DE L'ASSOCIATION : ${associationInfo.name.toUpperCase()}
Association régie par la loi du 1er juillet 1901 et le décret du 16 août 1901.

ARTICLE 1 - TITRE
Il est fondé entre les adhérents aux présents statuts une association ayant pour titre : "${associationInfo.name}".

ARTICLE 2 - OBJET
Cette association a pour objet la pratique, le développement et la promotion des activités sportives, physiques et culturelles.

ARTICLE 3 - SIÈGE SOCIAL
Le siège social est fixé à : ${associationInfo.address}.
Il pourra être transféré par simple décision du Conseil d'Administration.

ARTICLE 4 - COMPOSITION & COTISATIONS
L'association se compose de membres actifs, membres bienfaiteurs et membres d'honneur.
Pour être membre actif, il convient d'être à jour de sa cotisation annuelle.

ARTICLE 5 - ADMINISTRATION
L'association est dirigée par un Bureau comprenant au minimum :
- Un(e) Président(e) : ${associationInfo.presidentName || "Marie DUBOIS"}
- Un(e) Trésorier(ère) : ${associationInfo.treasurerName || "Jean-Pierre MARTIN"}
- Un(e) Secrétaire : ${associationInfo.secretaryName || "Claire MOREAU"}

Fait et arrêté en Assemblée Générale à Paris, le ${associationInfo.creationDate || "15/04/2012"}.`
    },
    {
      id: "reglement_interieur",
      title: "Règlement Intérieur Type du Club",
      type: "Statuts & Règlements" as AdministrativeDocType,
      desc: "Règles d'assiduité, respect des arbitres et des installations, tenue vestimentaire et sécurité des mineurs.",
      body: `RÈGLEMENT INTÉRIEUR DE L'ASSOCIATION
${associationInfo.name} — Saison ${associationInfo.season || "2025 - 2026"}

1. INSCRIPTION & LICENCE :
Nul ne peut participer aux entraînements et compétitions sans dossier d'adhésion complet (formulaire, certificat médical ou attestation de santé, règlement de la cotisation).

2. ASSIDUITÉ & COMPORTEMENT :
Les licenciés s'engagent à respecter les horaires fixés pour les entraînements et les convocations de match. Tout retard ou absence doit être signalé à l'entraîneur au moins 24 heures à l'avance.
Le respect mutuel, le fair-play et la courtoisie envers les adversaires et le corps arbitral sont des valeurs impératives.

3. UTILISATION DES INSTALLATIONS & DU MATÉRIEL :
Les équipements et locaux mis à disposition (gymnases, vestiaires, chasubles, ballons) doivent être maintenus en parfait état de propreté.

Fait pour valoir ce que de droit.
Adopté par le Bureau Directeur.`
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO HEADER & ACTIONS */}
      <div
        className={`p-6 md:p-8 rounded-3xl border transition-all ${
          isClassic
            ? "bg-slate-900 border-slate-800 text-white shadow-xl"
            : "bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-lg shadow-indigo-950/20 border-slate-800"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              <FolderArchive className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight">
                  Gestion Documentaire
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {documents.length} document{documents.length > 1 ? "s" : ""} archivé{documents.length > 1 ? "s" : ""}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Conformité Loi 1901
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
                Centralisez, classez et sécurisez l'ensemble des pièces administratives et juridiques de l'association : statuts déposés, procès-verbaux d'assemblées, conventions de gymnases, polices d'assurance et dossiers CERFA.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-white/15 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Générateur de Modèles</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRegistryModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-white/15 shadow-xs"
            >
              <Printer className="w-4 h-4 text-indigo-300" />
              <span>Registre Légal</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Document</span>
            </button>
          </div>
        </div>

        {/* Mini stats badges bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Statuts & Gouvernance</span>
            <span className="text-lg font-black text-white">
              {typeCounts["Statuts & Règlements"] + typeCounts["Procès-Verbaux (PV d'AG & CA)"]}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Conventions & Partenariats</span>
            <span className="text-lg font-black text-white">{typeCounts["Conventions & Partenariats"]}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Agréments & Assurances</span>
            <span className="text-lg font-black text-white">
              {typeCounts["Agréments & Affiliations"] + typeCounts["Assurances & Responsabilité Civile"]}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Dossiers Subventions</span>
            <span className="text-lg font-black text-white">{typeCounts["Dossiers Subventions & CERFA"]}</span>
          </div>
        </div>
      </div>

      {/* 2. REGULATORY WATCH ALERT (IF EXPIRING DOCS) */}
      {expiringAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-amber-900 dark:text-amber-200 text-xs">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold block text-sm">
                Veille Réglementaire : {expiringAlerts.length} document{expiringAlerts.length > 1 ? "s" : ""} arrive{expiringAlerts.length > 1 ? "nt" : ""} à échéance sous 60 jours
              </span>
              <p className="text-amber-800/80 dark:text-amber-300/80 text-[11px] mt-0.5">
                Vérifiez et renouvelez vos polices d'assurance, conventions d'occupation de salles et attestations d'affiliation pour garantir la couverture du club.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setSelectedStatus("expired")}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Voir les alertes
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. DOCUMENT TYPES QUICK FILTER CAROUSEL (DEDICATED SEARCH BY TYPE) */}
      <div
        className={`p-4 md:p-5 rounded-3xl border transition ${
          isClassic
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200/90 shadow-xs text-slate-800"
        }`}
      >
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm">
                Recherche Rapide par Type de Document
              </h3>
              <p className="text-[11px] text-slate-400">
                Filtrez les archives administratives d'un simple clic par catégorie juridique.
              </p>
            </div>
          </div>

          {selectedType !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Afficher tout</span>
            </button>
          )}
        </div>

        {/* Types Horizontal Scrollable Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {/* All Types Button */}
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={`shrink-0 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedType === "all"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30"
                : isClassic
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Tous ({documents.length})</span>
          </button>

          {/* Individual Document Types */}
          {ALL_DOC_TYPES.map((type) => {
            const meta = DOC_TYPE_META[type];
            const Icon = meta.icon;
            const isSelected = selectedType === type;
            const count = typeCounts[type] || 0;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`shrink-0 px-3.5 py-2.5 rounded-2xl border text-xs transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white dark:bg-indigo-600 dark:border-indigo-600 shadow-sm ring-2 ring-indigo-500/40 font-bold"
                    : isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-300" : meta.color}`} />
                <span className="font-semibold">{type}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
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
      </div>

      {/* 4. SEARCH & FILTER TOOLBAR */}
      <div
        className={`p-4 rounded-3xl border space-y-3 ${
          isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre, n° de référence, signataire, tag, mot-clé..."
              className={`w-full pl-10 pr-10 py-2 rounded-2xl text-xs font-semibold border outline-none transition ${
                isClassic
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-indigo-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500"
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                selectedStatus !== "all"
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                  : isClassic
                  ? "bg-slate-800 border-slate-700 text-slate-200"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <option value="all">Statut : Tous</option>
              <option value="valid">Validé & En vigueur</option>
              <option value="pending_signature">En attente de signature</option>
              <option value="expired">Expiré / À renouveler</option>
              <option value="archived">Archivé</option>
            </select>

            {/* Season Filter */}
            {allSeasons.length > 0 && (
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                  selectedSeason !== "all"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                    : isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <option value="all">Saison : Toutes</option>
                {allSeasons.map((s) => (
                  <option key={s} value={s}>
                    Saison {s}
                  </option>
                ))}
              </select>
            )}

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                  selectedTag !== "all"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 font-bold"
                    : isClassic
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <option value="all">Tag : Tous</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                isClassic ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <option value="date_desc">📅 Date la plus récente</option>
              <option value="date_asc">📅 Date la plus ancienne</option>
              <option value="title_asc">🔤 Titre (A-Z)</option>
              <option value="expiry_asc">⏳ Échéance proche</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Vue Grille / Cartes"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Vue Liste / Table"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("folders")}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "folders"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Vue Dossiers / Classeurs"
              >
                <Folder className="w-4 h-4" />
              </button>
            </div>

            {/* Reset Filters */}
            {(searchTerm || selectedType !== "all" || selectedStatus !== "all" || selectedSeason !== "all" || selectedTag !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. MAIN CONTENT DISPLAY (GRID / TABLE / FOLDERS) */}
      {filteredDocuments.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${
            isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-700"
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
            <FolderArchive className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">Aucun document trouvé</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Aucun document administratif ne correspond à vos critères de recherche ou de filtre actifs.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un document</span>
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredDocuments.map((doc) => {
              const meta = DOC_TYPE_META[doc.type] || DOC_TYPE_META["Autre"];
              const Icon = meta.icon;

              return (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`p-5 rounded-3xl border transition-all hover:shadow-md flex flex-col justify-between ${
                    isClassic
                      ? "bg-slate-900 border-slate-800 text-white hover:border-slate-700"
                      : "bg-white border-slate-200/80 text-slate-900 hover:border-indigo-200"
                  }`}
                >
                  <div>
                    {/* Header: Icon, Type Badge, Reference, Confidential */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2.5 rounded-2xl border ${meta.bgLight} ${meta.color} shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeBg} ${meta.badgeText} block w-max`}>
                            {doc.type}
                          </span>
                          {doc.referenceNumber && (
                            <span className="text-[11px] font-mono font-bold text-slate-400 block mt-0.5">
                              Réf: {doc.referenceNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {doc.isConfidential && (
                          <span
                            className="p-1 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold"
                            title="Document Confidentiel / Bureau Seul"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {renderStatusBadge(doc.status, doc.validUntilDate)}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-display font-extrabold text-sm md:text-base leading-snug line-clamp-2 mb-2 text-slate-900 dark:text-white">
                      {doc.title}
                    </h4>

                    {/* Description */}
                    {doc.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {doc.description}
                      </p>
                    )}

                    {/* Metadata items */}
                    <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" /> Date d'émission :
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(doc.issueDate).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      {doc.validUntilDate && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5" /> Échéance / Fin :
                          </span>
                          <span className={`font-semibold ${new Date(doc.validUntilDate) < new Date() ? "text-rose-600 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                            {new Date(doc.validUntilDate).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      )}

                      {doc.signatories && doc.signatories.length > 0 && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                            <Users className="w-3.5 h-3.5" /> Signataires :
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate text-right">
                            {doc.signatories.join(", ")}
                          </span>
                        </div>
                      )}

                      {doc.locationStored && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3.5 h-3.5" /> Lieu d'archive :
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                            {doc.locationStored}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.fileSize || "PDF"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition cursor-pointer"
                        title="Consulter le document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadDocument(doc)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                        title="Télécharger la pièce officielle"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(doc)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                        title="Modifier les informations"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(doc.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Supprimer du registre"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div
          className={`rounded-3xl border overflow-hidden ${
            isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-xs"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Réf & Type</th>
                  <th className="p-4">Titre du Document</th>
                  <th className="p-4">Date d'émission</th>
                  <th className="p-4">Validité</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Signataires</th>
                  <th className="p-4">Format / Poids</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocuments.map((doc) => {
                  const meta = DOC_TYPE_META[doc.type] || DOC_TYPE_META["Autre"];
                  const Icon = meta.icon;

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition cursor-pointer"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl border ${meta.bgLight} ${meta.color} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-500 dark:text-slate-400 block text-[11px]">
                              {doc.referenceNumber || "DOC"}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${meta.badgeBg} ${meta.badgeText}`}>
                              {meta.shortLabel}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {doc.title}
                        </span>
                        {doc.description && (
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {doc.description}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {new Date(doc.issueDate).toLocaleDateString("fr-FR")}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {doc.validUntilDate ? new Date(doc.validUntilDate).toLocaleDateString("fr-FR") : "Permanente"}
                      </td>

                      <td className="p-4">
                        {renderStatusBadge(doc.status, doc.validUntilDate)}
                      </td>

                      <td className="p-4 text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
                        {doc.signatories ? doc.signatories.join(", ") : "—"}
                      </td>

                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {doc.fileSize || "1.0 Mo"} ({doc.fileType?.toUpperCase() || "PDF"})
                      </td>

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 hover:bg-indigo-100 transition"
                            title="Consulter"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadDocument(doc)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(doc)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(doc.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
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
      ) : (
        /* THEMATIC FOLDERS VIEW */
        <div className="space-y-4">
          {ALL_DOC_TYPES.map((type) => {
            const typeDocs = filteredDocuments.filter((d) => d.type === type);
            if (typeDocs.length === 0 && selectedType !== "all") return null;

            const meta = DOC_TYPE_META[type];
            const Icon = meta.icon;

            return (
              <div
                key={type}
                className={`rounded-3xl border overflow-hidden ${
                  isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200/90 shadow-xs text-slate-800"
                }`}
              >
                {/* Folder Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl border ${meta.bgLight} ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm md:text-base text-slate-900 dark:text-white">
                        {meta.folderName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {typeDocs.length} document{typeDocs.length > 1 ? "s" : ""} dans ce classeur
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType(type);
                      handleOpenAddModal();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>

                {/* Folder Items List */}
                {typeDocs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Aucun document archivé dans ce dossier.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {typeDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setPreviewDoc(doc)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {doc.title}
                              </span>
                              {doc.referenceNumber && (
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                                  {doc.referenceNumber}
                                </span>
                              )}
                              {renderStatusBadge(doc.status, doc.validUntilDate)}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Émis le {new Date(doc.issueDate).toLocaleDateString("fr-FR")}
                              {doc.signatories ? ` • Signataires : ${doc.signatories.join(", ")}` : ""}
                              {doc.locationStored ? ` • Lieu : ${doc.locationStored}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition"
                          >
                            Consulter
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadDocument(doc)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition"
                            title="Télécharger"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: DOCUMENT VIEWER / READER (CONSULTER) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Consultation de Pièce Officielle
                    </span>
                    <h3 className="font-display font-extrabold text-base line-clamp-1">
                      {previewDoc.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Official Sheet Scroll Area */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Official Certification Sheet */}
                <div className="p-6 md:p-8 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-md font-sans space-y-6 relative overflow-hidden">
                  {/* Official Marianne / Association Watermark */}
                  <div className="absolute right-6 top-6 opacity-10 pointer-events-none select-none text-right">
                    <Landmark className="w-32 h-32 text-indigo-900" />
                  </div>

                  {/* Header: Association info */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
                    <div>
                      <h2 className="font-extrabold text-lg tracking-tight uppercase text-slate-950">
                        {associationInfo.name}
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Association sportive régie par la loi du 1er juillet 1901
                      </p>
                      <div className="flex flex-wrap gap-3 text-[11px] font-mono text-slate-500 mt-1">
                        <span>SIRET : {associationInfo.siret || "123 456 789 00012"}</span>
                        <span>RNA : {associationInfo.rna || "W751029384"}</span>
                        <span>Fédération : {associationInfo.federationNumber || "5875042"}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-900 font-mono font-black text-xs border border-indigo-200">
                        RÉF : {previewDoc.referenceNumber || "DOC-OFFICIEL"}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Dépôt & Enregistrement légal
                      </span>
                    </div>
                  </div>

                  {/* Document Title Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                      {previewDoc.type}
                    </span>
                    <h3 className="text-base md:text-lg font-black text-slate-950">
                      {previewDoc.title}
                    </h3>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Date d'émission</span>
                      <span className="font-bold text-slate-900">
                        {new Date(previewDoc.issueDate).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Validité</span>
                      <span className="font-bold text-slate-900">
                        {previewDoc.validUntilDate ? new Date(previewDoc.validUntilDate).toLocaleDateString("fr-FR") : "Indéterminée"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Statut Légal</span>
                      <span className="font-bold text-slate-900 uppercase text-[11px]">
                        {previewDoc.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Saison</span>
                      <span className="font-bold text-slate-900">
                        {previewDoc.season || "Toutes"}
                      </span>
                    </div>
                  </div>

                  {/* Description / Text Content */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                      Objet & Délibérations :
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                      {previewDoc.description || "Aucune description détaillée n'a été renseignée pour cette pièce."}
                    </div>
                  </div>

                  {/* Signatories Section */}
                  {previewDoc.signatories && previewDoc.signatories.length > 0 && (
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                        Signataires & Validations officielles :
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {previewDoc.signatories.map((sig, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-bold text-slate-800">{sig}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Signé
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Storage Location & Notes */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-4 border-t border-slate-200 text-[11px] text-slate-500">
                    <div>
                      <span className="font-bold text-slate-700 block">Conservation Originale :</span>
                      <span>{previewDoc.locationStored || "Bureau Administratif du Club"}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-700 block">Certifié conforme par :</span>
                      <span>{associationInfo.signatoryName || "Marie DUBOIS - Présidente"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Document : ${previewDoc.title} (Réf: ${previewDoc.referenceNumber}) - ${associationInfo.name}`
                      );
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Référence copiée !" : "Copier la référence"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = previewDoc;
                      setPreviewDoc(null);
                      handleOpenEditModal(toEdit);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(previewDoc)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger la Pièce ({previewDoc.fileSize || "1.0 Mo"})</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 7. MODAL: ADD / EDIT DOCUMENT FORM */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <form onSubmit={handleSaveDocument} className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                      {editingDocId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-base">
                        {editingDocId ? "Modifier le Document" : "Ajouter un Nouveau Document Administratif"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Renseignez les métadonnées officielles pour l'archivage légal.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Fields Scroll Area */}
                <div className="p-6 overflow-y-auto space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Titre Officiel du Document *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: Statuts constitutifs 2025, Convention Mairie, PV d'AG..."
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                        isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                      }`}
                    />
                  </div>

                  {/* Type & Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Type de Document *
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as AdministrativeDocType)}
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none cursor-pointer ${
                          isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      >
                        {ALL_DOC_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        N° de Référence / Registre
                      </label>
                      <input
                        type="text"
                        value={formRef}
                        onChange={(e) => setFormRef(e.target.value)}
                        placeholder="Ex: STAT-2025-01, PV-AG-2025"
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none font-mono ${
                          isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Dates: Issue & Expiry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Date de Signature / Émission *
                      </label>
                      <input
                        type="date"
                        required
                        value={formIssueDate}
                        onChange={(e) => setFormIssueDate(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                          isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Date de Fin de Validité (Optionnelle)
                      </label>
                      <input
                        type="date"
                        value={formValidUntil}
                        onChange={(e) => setFormValidUntil(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                          isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Status & Season */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Statut Légal
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as DocumentStatus)}
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none cursor-pointer ${
                          isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      >
                        <option value="valid">Valide & En vigueur</option>
                        <option value="pending_signature">En attente de signature</option>
                        <option value="expired">Expiré / À renouveler</option>
                        <option value="archived">Archivé</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Saison Sportive Associée
                      </label>
                      <input
                        type="text"
                        value={formSeason}
                        onChange={(e) => setFormSeason(e.target.value)}
                        placeholder="Ex: 2025 - 2026, Toutes saisons"
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                          isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Signatories & Storage Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Signataires (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={formSignatories}
                        onChange={(e) => setFormSignatories(e.target.value)}
                        placeholder="Ex: Marie DUBOIS (Présidente), Maire adjoint"
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                          isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Emplacement Physique de Conservation
                      </label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="Ex: Armoire Bureau 1 - Classeur Rouge"
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                          isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Description / Summary */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Objet & Résumé du Document
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Décrivez l'objet principal, les obligations ou résolutions votées..."
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                        isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                      }`}
                    />
                  </div>

                  {/* File Upload Zone */}
                  <div className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-800/60 border-slate-700" : "bg-indigo-50/40 border-indigo-100"}`}>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                      Fichier / Pièce Jointe
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.csv"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 rounded-2xl text-center cursor-pointer transition bg-white dark:bg-slate-900"
                    >
                      <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                        {formFileName ? `Fichier sélectionné : ${formFileName} (${formFileSize})` : "Glisser-déposer ou cliquer pour joindre un PDF/scan"}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Supporte PDF, Word, Excel, Scans & Images (max 10 Mo)
                      </span>
                    </div>
                  </div>

                  {/* Tags & Confidential */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Tags / Mots-clés (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="Ex: Statuts, Mairie, Subvention, AG"
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                          isClassic ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                        }`}
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsConfidential}
                          onChange={(e) => setFormIsConfidential(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          Document confidentiel (accès restreint au Bureau)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    {editingDocId ? "Enregistrer les modifications" : "Enregistrer et Archiver"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8. MODAL: TEMPLATE GENERATOR STUDIO */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base">
                      Générateur de Modèles Administratifs Loi 1901
                    </h3>
                    <p className="text-xs text-slate-400">
                      Générez des documents types pré-remplis avec les coordonnées du club.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Template Selector Tabs */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 shrink-0 bg-slate-50/30 dark:bg-slate-900/30">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      selectedTemplateId === tpl.id
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                        : isClassic
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>

              {/* Template Content Scroll Area */}
              <div className="p-6 overflow-y-auto space-y-4">
                {(() => {
                  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
                        <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                            {currentTemplate.title}
                          </h4>
                          <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300 mt-0.5">
                            {currentTemplate.desc}
                          </p>
                        </div>
                      </div>

                      {/* Editor Preview */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Texte Officiel Généré :
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Modifiable avant export
                          </span>
                        </div>
                        <textarea
                          rows={14}
                          readOnly
                          value={currentTemplate.body}
                          className={`w-full p-4 rounded-2xl text-xs font-mono border outline-none leading-relaxed ${
                            isClassic
                              ? "bg-slate-950 border-slate-800 text-slate-200"
                              : "bg-slate-50 border-slate-200 text-slate-900"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
                    navigator.clipboard.writeText(currentTemplate.body);
                    setCopiedTemplateText(true);
                    setTimeout(() => setCopiedTemplateText(false), 2000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedTemplateText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplateText ? "Texte copié !" : "Copier le texte"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
                      const blob = new Blob([currentTemplate.body], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${currentTemplate.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
                      onAddDocument({
                        title: currentTemplate.title,
                        type: currentTemplate.type,
                        referenceNumber: `MOD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                        issueDate: new Date().toISOString().split("T")[0],
                        description: currentTemplate.desc,
                        status: "valid",
                        season: associationInfo.season || "2025 - 2026",
                        fileName: `${currentTemplate.title.replace(/\s+/g, "_")}.pdf`,
                        fileSize: "1.2 Mo",
                        fileType: "pdf",
                        tags: ["Modèle", "Généré", "Loi 1901"]
                      });
                      setIsTemplateModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter aux Archives Documentaires</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 9. MODAL: REGISTRE LÉGAL DES DOCUMENTS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isRegistryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base">
                      Registre Légal des Délibérations & Documents Administratifs
                    </h3>
                    <p className="text-xs text-slate-400">
                      Document officiel conforme à l'article 5 de la Loi du 1er juillet 1901.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRegistryModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Sheet */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                <div className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 border border-slate-300 font-sans space-y-6">
                  <div className="text-center pb-4 border-b-2 border-slate-900">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block">
                      RÉPUBLIQUE FRANÇAISE • PRÉFECTURE DE POLICE
                    </span>
                    <h2 className="text-xl font-black uppercase text-slate-950 mt-1">
                      REGISTRE SPÉCIAL DES DÉLIBÉRATIONS & CONVENTIONS
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 font-semibold">
                      {associationInfo.name} — SIRET : {associationInfo.siret || "123 456 789 00012"} — RNA : {associationInfo.rna || "W751029384"}
                    </p>
                  </div>

                  {/* Summary Table */}
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Réf.</th>
                        <th className="p-2.5">Titre du Document</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Statut</th>
                        <th className="p-2.5">Lieu de Conservation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {documents.map((doc, idx) => (
                        <tr key={doc.id} className="text-[11px]">
                          <td className="p-2.5 font-mono font-bold">{doc.referenceNumber || `DOC-${idx + 1}`}</td>
                          <td className="p-2.5 font-bold">{doc.title}</td>
                          <td className="p-2.5 text-slate-600">{doc.type}</td>
                          <td className="p-2.5 font-mono">{new Date(doc.issueDate).toLocaleDateString("fr-FR")}</td>
                          <td className="p-2.5 font-bold uppercase">{doc.status}</td>
                          <td className="p-2.5 text-slate-600">{doc.locationStored || "Bureau Direction"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Signatures */}
                  <div className="pt-6 border-t border-slate-200 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-bold block">Fait à Paris, le {new Date().toLocaleDateString("fr-FR")}</span>
                      <span className="text-slate-500 text-[11px]">Total des pièces inscrites au registre : {documents.length}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold block">La Présidence :</span>
                      <span className="text-slate-700 font-semibold">{associationInfo.signatoryName || "Marie DUBOIS - Présidente"}</span>
                      <div className="w-32 h-12 border-b border-dashed border-slate-400 mt-2 ml-auto"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRegistryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Registre Officiel</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 10. MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-1.5">
                Supprimer cette pièce administrative ?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Cette action retirera définitivement ce document du registre d'archivage légal de l'association.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmId) {
                      onDeleteDocument(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-rose-600/20"
                >
                  Supprimer définitivement
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: string;
  avatar?: string;
  phone?: string;
  functionTitle?: string;
  bio?: string;
  twoFactorEnabled?: boolean;
  notifications?: {
    emailReceipts?: boolean;
    sessionAlerts?: boolean;
    equipmentAlerts?: boolean;
    monthlyReport?: boolean;
  };
  address?: string;
  city?: string;
  postalCode?: string;
  licenseNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  officialTitle?: string;
  preferredLanguage?: string;
  preferences?: Record<string, any>;
}

export interface Member {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  createdAt: string;
  licenseNumber?: string;
  gender?: 'M' | 'F' | 'Autre';
  category?: string;
  role?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  medicalCertificateStatus?: 'valid' | 'pending' | 'expired' | 'exempt';
  medicalCertificateDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  paymentStatus?: 'paid' | 'pending' | 'exempt';
  paymentAmount?: number;
  paymentMethod?: string;
  selectedTeamIds?: string[];
  notes?: string;
  avatarUrl?: string;
  isArchived?: boolean;
  archivedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  coach: string;
  memberIds: string[]; // List of member IDs in this team (replaces team_members relation)
  createdAt: string;
  category?: string;
  genderCategory?: 'Masculin' | 'Féminin' | 'Mixte';
  sport?: string;
  division?: string;
  assistantCoach?: string;
  trainingSchedule?: string;
  homeGround?: string;
  maxMembers?: number;
  captainId?: string;
  teamColor?: string;
  description?: string;
}

export interface Session {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  teamId: string; // Team ID linked to session
  location?: string; // Optional location
  type?: 'Entraînement' | 'Match' | 'Stage' | 'Réunion' | 'Autre';
  durationMinutes?: number; // Duration in minutes (e.g. 60, 90, 120)
  notes?: string;
  attendeeIds?: string[]; // Member IDs marked as present
  intensity?: 'Faible' | 'Modérée' | 'Élevée' | 'Récupération';
  opponent?: string;
  homeAway?: 'Domicile' | 'Extérieur';
  equipment?: string[];
  notifyMembers?: boolean;
}

export type NotificationType = 'meeting' | 'membership_fee' | 'new_member' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string; // ISO string
  isRead: boolean;
  targetView?: ActiveView;
  targetId?: string;
  priority?: 'high' | 'medium' | 'normal';
}

export type ActiveView = 'dashboard' | 'members' | 'teams' | 'sessions' | 'planning' | 'equipment' | 'finances' | 'documents' | 'bilan' | 'settings' | 'profile';

export type AdministrativeDocType =
  | 'Statuts & Règlements'
  | 'Procès-Verbaux (PV d\'AG & CA)'
  | 'Conventions & Partenariats'
  | 'Agréments & Affiliations'
  | 'Assurances & Responsabilité Civile'
  | 'Contrats & Baux'
  | 'Dossiers Subventions & CERFA'
  | 'Bilans & Comptes Financiers'
  | 'Autre';

export type DocumentStatus = 'valid' | 'pending_signature' | 'expired' | 'archived';

export interface AdministrativeDocument {
  id: string;
  title: string;
  type: AdministrativeDocType;
  category?: string;
  referenceNumber?: string; // e.g. "PV-2026-01", "CONV-MAIRIE-2025"
  issueDate: string; // YYYY-MM-DD
  validUntilDate?: string; // YYYY-MM-DD (expiry / renewal)
  description?: string;
  fileUrl?: string; // Data URL or external link
  fileName?: string; // e.g. "Statuts_Club_2025_Signes.pdf"
  fileSize?: string; // e.g. "1.4 Mo"
  fileType?: 'pdf' | 'docx' | 'image' | 'scan' | 'sheet' | 'text';
  isConfidential?: boolean;
  signatories?: string[]; // e.g. ["Présidente (M. Dubois)", "Maire Adjoint"]
  status: DocumentStatus;
  tags?: string[];
  season?: string; // e.g. "2025 - 2026"
  locationStored?: string; // e.g. "Classeur A - Bureau Direction"
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface MoralReport {
  id: string;
  season: string; // e.g. "2025 - 2026"
  title: string;
  date: string;
  presidentWord: string;
  sportingResults: string;
  membershipSummary: string;
  perspectives: string;
  status: 'draft' | 'approved' | 'submitted';
  voteFor?: number;
  voteAgainst?: number;
  voteAbstain?: number;
  approvalDate?: string;
  authorName?: string;
}

export type AppTheme = 'modern' | 'classic';

export interface FeeTierItem {
  id: string;
  name: string;
  amount: number;
  description: string;
  badge?: string;
  isDefault?: boolean;
}

export interface SeasonManagementItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'archived' | 'planned';
  membersCount?: number;
  expectedRevenue?: number;
}

export interface AssociationInfo {
  name: string;
  slogan: string;
  siret: string;
  address: string;
  email: string;
  phone: string;
  season: string;
  currency: string;
  autoReminders: boolean;
  logo?: string;
  website?: string;
  defaultFee?: number;
  receiptHeader?: string;
  signatoryName?: string;
  feeTiers?: FeeTierItem[];
  seasonsList?: SeasonManagementItem[];
  // Structure & Governance
  rna?: string;
  apeCode?: string;
  creationDate?: string;
  presidentName?: string;
  treasurerName?: string;
  secretaryName?: string;
  // Federation & Insurance
  federationName?: string;
  federationNumber?: string;
  sportsAgreementNumber?: string;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  // Banking
  bankName?: string;
  bankAccountHolder?: string;
  iban?: string;
  bic?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'Textile' | 'Matériel' | 'Ballons' | 'Médical' | 'Infrastructure' | 'Autre';
  quantity: number;
  condition: 'Neuf' | 'Bon état' | 'Usé' | 'À réparer' | 'À remplacer' | 'Hors service';
  assignedToType?: 'none' | 'team' | 'member';
  assignedToId?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  serialNumber?: string;
  unitPrice?: number;
  purchaseDate?: string;
  supplier?: string;
  minQuantityAlert?: number;
}

export interface Transaction {
  id: string;
  title: string;
  type: 'income' | 'expense';
  category: 'Cotisations' | 'Subventions' | 'Sponsor & Partenariat' | 'Équipements & Matériel' | 'Infrastructures & Salles' | 'Événements & Buvette' | 'Autre';
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Virement' | 'Carte CB' | 'Chèque' | 'Espèces' | 'Prélèvement';
  status: 'Payé' | 'En attente' | 'Annulé';
  memberId?: string;
  notes?: string;
  createdAt: string;
}


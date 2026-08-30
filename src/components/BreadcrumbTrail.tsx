import React from "react";
import {
  Home,
  ChevronRight,
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  CalendarDays,
  Package,
  Wallet,
  BarChart3,
  Settings,
  UserCheck,
  ArrowLeft,
  Tag,
  FolderArchive
} from "lucide-react";
import { ActiveView, AppTheme } from "../types";

interface BreadcrumbTrailProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  theme: AppTheme;
  associationName?: string;
  season?: string;
  membersCount?: number;
  teamsCount?: number;
  sessionsCount?: number;
  equipmentCount?: number;
  transactionsCount?: number;
  documentsCount?: number;
  lowStockCount?: number;
}

interface ViewConfig {
  label: string;
  shortLabel: string;
  category: string;
  icon: React.ElementType;
  description: string;
}

const VIEW_CONFIGS: Record<ActiveView, ViewConfig> = {
  dashboard: {
    label: "Tableau de bord",
    shortLabel: "Dashboard",
    category: "Vue générale",
    icon: LayoutDashboard,
    description: "Indicateurs clés & synthèse"
  },
  members: {
    label: "Gestion des Membres",
    shortLabel: "Membres",
    category: "Vie Sportive",
    icon: Users,
    description: "Adhérents, licences & cotisations"
  },
  teams: {
    label: "Équipes & Groupes",
    shortLabel: "Équipes",
    category: "Vie Sportive",
    icon: Shield,
    description: "Effectifs, entraîneurs & catégories"
  },
  sessions: {
    label: "Séances d'Entraînement",
    shortLabel: "Séances",
    category: "Activités",
    icon: Calendar,
    description: "Présences, créneaux & exercices"
  },
  planning: {
    label: "Planning & Calendrier",
    shortLabel: "Planning",
    category: "Activités",
    icon: CalendarDays,
    description: "Calendrier des matchs & événements"
  },
  equipment: {
    label: "Inventaire & Équipements",
    shortLabel: "Équipements",
    category: "Gestion & Logistique",
    icon: Package,
    description: "Matériel, stocks & dotations"
  },
  finances: {
    label: "Comptabilité & Trésorerie",
    shortLabel: "Finances",
    category: "Gestion & Logistique",
    icon: Wallet,
    description: "Recettes, dépenses & bilans"
  },
  documents: {
    label: "Gestion Documentaire",
    shortLabel: "Documents",
    category: "Administration",
    icon: FolderArchive,
    description: "Statuts, PV d'AG, conventions & assurances"
  },
  bilan: {
    label: "Bilan Moral & AG",
    shortLabel: "Bilan & AG",
    category: "Administration",
    icon: BarChart3,
    description: "Rapport d'activité & assemblée"
  },
  settings: {
    label: "Paramètres de l'Association",
    shortLabel: "Paramètres",
    category: "Administration",
    icon: Settings,
    description: "Configuration générale & tarifs"
  },
  profile: {
    label: "Mon Profil Administrateur",
    shortLabel: "Profil",
    category: "Compte",
    icon: UserCheck,
    description: "Informations & sécurité"
  }
};

export const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  activeView,
  onNavigate,
  theme,
  season,
  membersCount,
  teamsCount,
  sessionsCount,
  equipmentCount,
  transactionsCount,
  documentsCount,
  lowStockCount = 0
}) => {
  const currentConfig = VIEW_CONFIGS[activeView] || VIEW_CONFIGS.dashboard;
  const isDashboard = activeView === "dashboard";
  const isClassic = theme === "classic";

  // Context badge depending on current view
  const getContextBadge = () => {
    switch (activeView) {
      case "members":
        return membersCount !== undefined ? `${membersCount} adhérent${membersCount > 1 ? "s" : ""}` : null;
      case "teams":
        return teamsCount !== undefined ? `${teamsCount} équipe${teamsCount > 1 ? "s" : ""}` : null;
      case "sessions":
        return sessionsCount !== undefined ? `${sessionsCount} séance${sessionsCount > 1 ? "s" : ""}` : null;
      case "equipment":
        if (lowStockCount > 0) {
          return `${lowStockCount} alerte${lowStockCount > 1 ? "s" : ""} stock`;
        }
        return equipmentCount !== undefined ? `${equipmentCount} article${equipmentCount > 1 ? "s" : ""}` : null;
      case "finances":
        return transactionsCount !== undefined ? `${transactionsCount} opération${transactionsCount > 1 ? "s" : ""}` : null;
      case "documents":
        return documentsCount !== undefined ? `${documentsCount} document${documentsCount > 1 ? "s" : ""}` : null;
      default:
        return null;
    }
  };

  const badgeText = getContextBadge();
  const isAlertBadge = activeView === "equipment" && lowStockCount > 0;
  const CurrentIcon = currentConfig.icon;

  return (
    <nav
      id="app-breadcrumb-navigation"
      aria-label="Fil d'Ariane"
      className={`w-full border-b transition-colors duration-300 select-none ${
        isClassic
          ? "bg-slate-950/90 border-blue-900/40 text-blue-100"
          : "bg-white/80 dark:bg-slate-900/70 border-slate-200/75 dark:border-slate-800 text-slate-600 dark:text-slate-300"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
        {/* Trail Items */}
        <ol className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
          {/* Step 1: Home / Root Level */}
          <li className="flex items-center gap-1.5 shrink-0">
            {isDashboard ? (
              <span
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg font-semibold cursor-default ${
                  isClassic
                    ? "text-white bg-blue-900/40 border border-blue-500/30"
                    : "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40"
                }`}
                aria-current="page"
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium">Accueil</span>
              </span>
            ) : (
              <button
                type="button"
                id="breadcrumb-btn-home"
                onClick={() => onNavigate("dashboard")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors duration-150 cursor-pointer font-medium ${
                  isClassic
                    ? "text-blue-300 hover:text-white hover:bg-blue-900/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
                title="Retour au tableau de bord"
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span>Accueil</span>
              </button>
            )}
          </li>

          {!isDashboard && (
            <>
              {/* Separator 1 */}
              <li className="text-slate-400 dark:text-slate-600 shrink-0" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>

              {/* Step 2: Category / Domain grouping (visible on sm+) */}
              <li className="hidden sm:flex items-center gap-1 text-slate-400 dark:text-slate-500 shrink-0">
                <Tag className="w-3 h-3 opacity-60" />
                <span>{currentConfig.category}</span>
              </li>

              {/* Separator 2 */}
              <li className="hidden sm:block text-slate-400 dark:text-slate-600 shrink-0" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>

              {/* Step 3: Current Leaf View */}
              <li className="flex items-center gap-2 min-w-0" aria-current="page">
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold truncate ${
                    isClassic
                      ? "text-white bg-blue-900/60 border border-blue-500/40 shadow-2xs"
                      : "text-slate-900 dark:text-white bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300/70 dark:border-slate-700 shadow-2xs"
                  }`}
                >
                  <CurrentIcon className={`w-3.5 h-3.5 shrink-0 ${isClassic ? "text-blue-300" : "text-indigo-500"}`} />
                  <span className="truncate hidden md:inline">{currentConfig.label}</span>
                  <span className="truncate md:hidden">{currentConfig.shortLabel}</span>
                </span>

                {/* Optional Count / Alert Badge */}
                {badgeText && (
                  <span
                    className={`hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isAlertBadge
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                        : isClassic
                        ? "bg-blue-950 text-blue-200 border border-blue-800/60"
                        : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60"
                    }`}
                  >
                    {badgeText}
                  </span>
                )}
              </li>
            </>
          )}
        </ol>

        {/* Right side: Quick Return to Dashboard button or Season identifier */}
        <div className="flex items-center gap-2 shrink-0">
          {!isDashboard && (
            <button
              type="button"
              id="breadcrumb-btn-quick-back"
              onClick={() => onNavigate("dashboard")}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                isClassic
                  ? "bg-blue-950/60 border-blue-800/50 text-blue-200 hover:bg-blue-900 hover:text-white"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600"
              }`}
              title="Retour direct au tableau de bord"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Tableau de bord</span>
            </button>
          )}

          {season && (
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                isClassic
                  ? "bg-blue-950/40 border-blue-800/40 text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
              }`}
            >
              {season}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

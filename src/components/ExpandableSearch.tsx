import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  Users,
  Shield,
  Calendar,
  Package,
  DollarSign,
  ChevronRight,
  FolderOpen,
  FolderArchive
} from "lucide-react";
import {
  Member,
  Team,
  Session,
  Equipment,
  Transaction,
  AdministrativeDocument,
  ActiveView,
  AppTheme
} from "../types";
import { formatCurrency } from "../utils";

interface SearchResultItem {
  id: string;
  type: "member" | "team" | "session" | "equipment" | "transaction" | "document";
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    color: string;
  };
  icon: React.ElementType;
  targetView: ActiveView;
}

interface ExpandableSearchProps {
  members: Member[];
  teams: Team[];
  sessions: Session[];
  equipment: Equipment[];
  transactions: Transaction[];
  documents?: AdministrativeDocument[];
  theme: AppTheme;
  currency?: string;
  onNavigate: (view: ActiveView) => void;
}

export const ExpandableSearch: React.FC<ExpandableSearchProps> = ({
  members,
  teams,
  sessions,
  equipment,
  transactions,
  documents = [],
  theme,
  currency = "EUR",
  onNavigate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when expanding
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isExpanded]);

  // Global Ctrl+K / Cmd+K keyboard shortcut to expand & focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsExpanded(true);
      } else if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  // Handle outside click to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute live search results matching user query
  const results = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const list: SearchResultItem[] = [];

    // 1. Members
    members.forEach((m) => {
      if (
        m.name.toLowerCase().includes(cleanQuery) ||
        m.email?.toLowerCase().includes(cleanQuery) ||
        m.phone?.toLowerCase().includes(cleanQuery) ||
        m.category?.toLowerCase().includes(cleanQuery)
      ) {
        list.push({
          id: `mem-${m.id}`,
          type: "member",
          title: m.name,
          subtitle: `${m.category || "Membre"} • ${m.email || m.phone || `${m.age} ans`}`,
          badge: {
            label: m.paymentStatus === "paid" ? "Réglé" : m.paymentStatus === "pending" ? "En attente" : "Exempté",
            color: m.paymentStatus === "paid" ? "emerald" : m.paymentStatus === "pending" ? "rose" : "slate"
          },
          icon: Users,
          targetView: "members"
        });
      }
    });

    // 2. Teams
    teams.forEach((t) => {
      if (
        t.name.toLowerCase().includes(cleanQuery) ||
        t.coach?.toLowerCase().includes(cleanQuery) ||
        t.category?.toLowerCase().includes(cleanQuery)
      ) {
        list.push({
          id: `team-${t.id}`,
          type: "team",
          title: t.name,
          subtitle: `Coach: ${t.coach || "Non attribué"} • ${t.memberIds?.length || 0} membres`,
          badge: { label: t.category || "Équipe", color: "purple" },
          icon: Shield,
          targetView: "teams"
        });
      }
    });

    // 3. Planning / Sessions
    sessions.forEach((s) => {
      if (
        s.title.toLowerCase().includes(cleanQuery) ||
        s.location?.toLowerCase().includes(cleanQuery) ||
        s.type?.toLowerCase().includes(cleanQuery) ||
        s.opponent?.toLowerCase().includes(cleanQuery)
      ) {
        list.push({
          id: `sess-${s.id}`,
          type: "session",
          title: s.title,
          subtitle: `${s.date} à ${s.time} ${s.location ? `• ${s.location}` : ""}`,
          badge: { label: s.type || "Séance", color: "blue" },
          icon: Calendar,
          targetView: "planning"
        });
      }
    });

    // 4. Equipment
    equipment.forEach((eq) => {
      if (
        eq.name.toLowerCase().includes(cleanQuery) ||
        eq.category?.toLowerCase().includes(cleanQuery) ||
        eq.location?.toLowerCase().includes(cleanQuery)
      ) {
        list.push({
          id: `eq-${eq.id}`,
          type: "equipment",
          title: eq.name,
          subtitle: `Qté: ${eq.quantity} • État: ${eq.condition}`,
          badge: { label: eq.category || "Matériel", color: "amber" },
          icon: Package,
          targetView: "equipment"
        });
      }
    });

    // 5. Finances
    transactions.forEach((tx) => {
      if (
        tx.title.toLowerCase().includes(cleanQuery) ||
        tx.category?.toLowerCase().includes(cleanQuery) ||
        tx.paymentMethod?.toLowerCase().includes(cleanQuery) ||
        tx.amount.toString().includes(cleanQuery)
      ) {
        const isIncome = tx.type === "income";
        list.push({
          id: `tx-${tx.id}`,
          type: "transaction",
          title: tx.title,
          subtitle: `${tx.date} • ${tx.category}`,
          badge: {
            label: `${isIncome ? "+" : "-"}${formatCurrency(tx.amount, currency)}`,
            color: isIncome ? "emerald" : "rose"
          },
          icon: DollarSign,
          targetView: "finances"
        });
      }
    });

    // 6. Documents Administratifs
    documents.forEach((doc) => {
      if (
        doc.title.toLowerCase().includes(cleanQuery) ||
        doc.type.toLowerCase().includes(cleanQuery) ||
        (doc.referenceNumber && doc.referenceNumber.toLowerCase().includes(cleanQuery)) ||
        (doc.description && doc.description.toLowerCase().includes(cleanQuery)) ||
        doc.signatories?.some((s) => s.toLowerCase().includes(cleanQuery)) ||
        doc.tags?.some((t) => t.toLowerCase().includes(cleanQuery))
      ) {
        list.push({
          id: `doc-${doc.id}`,
          type: "document",
          title: doc.title,
          subtitle: `${doc.type} • ${new Date(doc.issueDate).toLocaleDateString("fr-FR")}${doc.referenceNumber ? ` • ${doc.referenceNumber}` : ""}`,
          badge: {
            label: doc.status === "valid" ? "Valide" : doc.status === "pending_signature" ? "En signature" : doc.status === "expired" ? "Expiré" : "Archivé",
            color: doc.status === "valid" ? "emerald" : doc.status === "pending_signature" ? "amber" : doc.status === "expired" ? "rose" : "slate"
          },
          icon: FolderArchive,
          targetView: "documents"
        });
      }
    });

    return list;
  }, [query, members, teams, sessions, equipment, transactions, documents, currency]);

  // Reset keyboard index on query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const validIndex = Math.max(0, Math.min(selectedIndex, results.length - 1));

  const handleSelectItem = (item: SearchResultItem) => {
    onNavigate(item.targetView);
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && results[validIndex]) {
        handleSelectItem(results[validIndex]);
      }
    } else if (e.key === "Escape") {
      setIsExpanded(false);
    }
  };

  const isClassic = theme === "classic";

  const getBadgeClass = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "rose":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      case "amber":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "purple":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
      case "blue":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20";
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Expanding Search Input Bar */}
      <motion.div
        layout
        initial={false}
        animate={{ width: isExpanded ? 280 : 40 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className={`relative h-10 rounded-xl border flex items-center overflow-hidden shadow-2xs transition-colors ${
          isExpanded
            ? isClassic
              ? "bg-blue-900 border-white text-white shadow-md"
              : "bg-white dark:bg-slate-900 border-indigo-500 text-slate-800 dark:text-slate-100 shadow-md ring-2 ring-indigo-500/20"
            : isClassic
            ? "bg-blue-800/80 border-blue-400/40 text-blue-100 hover:bg-blue-900 hover:border-white"
            : "bg-slate-100/90 border-slate-200/90 text-slate-600 hover:bg-white hover:border-indigo-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
        }`}
      >
        {!isExpanded ? (
          /* Closed State: Just the Logo/Icon Button */
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            title="Rechercher (Ctrl + K)"
            className="w-full h-full flex items-center justify-center cursor-pointer transition transform hover:scale-110"
          >
            <Search className={`w-4 h-4 ${isClassic ? "text-blue-100" : "text-indigo-600 dark:text-indigo-400"}`} />
          </button>
        ) : (
          /* Expanded State: Just the Writing Input Area */
          <div className="w-full h-full flex items-center px-3 gap-2">
            <Search className={`w-4 h-4 shrink-0 ${isClassic ? "text-blue-200" : "text-indigo-500"}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher..."
              className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400 font-medium"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Floating Results Dropdown (Shows ONLY when user is actively writing) */}
      <AnimatePresence>
        {isExpanded && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden z-50 p-2 max-h-80 overflow-y-auto ${
              isClassic
                ? "bg-slate-900 border-slate-700 text-white"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
            }`}
          >
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((item, index) => {
                  const ItemIcon = item.icon;
                  const isSelected = index === validIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition cursor-pointer border ${
                        isSelected
                          ? isClassic
                            ? "bg-slate-800 border-indigo-500/50"
                            : "bg-indigo-50/80 dark:bg-slate-800/80 border-indigo-500/40"
                          : "border-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getBadgeClass(item.badge.color)}`}>
                            {item.badge.label}
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 transition ${isSelected ? "text-indigo-500 translate-x-0.5" : "text-slate-400 opacity-40"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Aucun résultat pour "<span className="text-indigo-500">{query}</span>"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

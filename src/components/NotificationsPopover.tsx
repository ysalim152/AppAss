import React, { useState } from "react";
import { NotificationItem, NotificationType, ActiveView, AppTheme } from "../types";
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  CreditCard,
  UserPlus,
  Sparkles,
  ChevronRight,
  Plus,
  X,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NotificationsPopoverProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onAddNotification: (newNotif: Omit<NotificationItem, "id" | "date" | "isRead">) => void;
  onNavigate: (view: ActiveView) => void;
  theme?: AppTheme;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onAddNotification,
  onNavigate,
  theme = "modern"
}) => {
  const isClassic = theme === "classic";
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New notification form state
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newType, setNewType] = useState<NotificationType>("meeting");
  const [newPriority, setNewPriority] = useState<"normal" | "medium" | "high">("normal");
  const [newTargetView, setNewTargetView] = useState<ActiveView>("planning");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "meeting":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "membership_fee":
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case "new_member":
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case "system":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getPriorityBadge = (priority?: "high" | "medium" | "normal") => {
    if (priority === "high") {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
          Urgent
        </span>
      );
    }
    if (priority === "medium") {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          Échéance
        </span>
      );
    }
    return null;
  };

  const handleCreateNotifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    onAddNotification({
      title: newTitle,
      message: newMessage,
      type: newType,
      priority: newPriority,
      targetView: newTargetView
    });

    setNewTitle("");
    setNewMessage("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        id="btn-notifications-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl border transition flex items-center justify-center cursor-pointer ${
          isClassic
            ? "bg-blue-800/60 border-blue-400/40 text-blue-200 hover:bg-blue-700 hover:text-white"
            : "bg-slate-100/90 border-slate-200/90 text-slate-700 hover:bg-slate-200 hover:text-indigo-600"
        }`}
        title="Centre de notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[9px] font-extrabold text-white items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] rounded-3xl border shadow-2xl z-50 overflow-hidden flex flex-col ${
                isClassic
                  ? "bg-slate-900 border-slate-800 text-white"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
              style={{ maxHeight: "calc(100vh - 100px)" }}
            >
              {/* Header */}
              <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm font-display flex items-center gap-1.5">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600">
                          {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">Rappels de réunions, cotisations & inscriptions</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                    title="Ajouter un rappel"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-3 pt-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-1 overflow-x-auto text-[11px] font-semibold scrollbar-none">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    filter === "all"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("meeting")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    filter === "meeting"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Réunions
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("membership_fee")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    filter === "membership_fee"
                      ? "bg-amber-600 text-white"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Cotisations
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("new_member")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    filter === "new_member"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Inscriptions
                </button>
              </div>

              {/* Notification List Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[380px]">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center space-y-2 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-xs font-semibold">Aucune notification pour le moment.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border transition relative group ${
                        !notif.isRead
                          ? isClassic
                            ? "bg-slate-800/90 border-blue-500/30 shadow-sm"
                            : "bg-indigo-50/60 border-indigo-100 text-slate-900 shadow-sm"
                          : isClassic
                          ? "bg-slate-950/40 border-slate-800 text-slate-400"
                          : "bg-slate-50/60 border-slate-100 text-slate-600"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 mt-0.5">
                          {getNotificationIcon(notif.type)}
                        </div>

                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                            )}
                            <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white">
                              {notif.title}
                            </h4>
                            {getPriorityBadge(notif.priority)}
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                            {notif.message}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {notif.date}
                            </span>

                            {notif.targetView && (
                              <button
                                type="button"
                                onClick={() => {
                                  onMarkAsRead(notif.id);
                                  onNavigate(notif.targetView!);
                                  setIsOpen(false);
                                }}
                                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                Voir
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Top-Right Delete Action */}
                        <button
                          type="button"
                          onClick={() => onDeleteNotification(notif.id)}
                          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-500 rounded transition cursor-pointer opacity-80 hover:opacity-100"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs font-semibold">
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className={`flex items-center gap-1.5 transition cursor-pointer ${
                    unreadCount > 0
                      ? "text-indigo-600 dark:text-indigo-400 hover:underline"
                      : "text-slate-400 cursor-not-allowed opacity-50"
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout marquer comme lu
                </button>

                <button
                  type="button"
                  onClick={onClearAll}
                  disabled={notifications.length === 0}
                  className={`flex items-center gap-1.5 transition cursor-pointer ${
                    notifications.length > 0
                      ? "text-slate-500 hover:text-rose-600"
                      : "text-slate-400 cursor-not-allowed opacity-50"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Tout effacer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL: ADD MANUAL NOTIFICATION / REMINDER */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
                isClassic ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-base">Créer un Rappel / Notification</h3>
                    <p className="text-[11px] text-slate-400">Ajoutez une alerte personnalisée dans la barre supérieure</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNotifSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Titre de la notification
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Réunion de préparation du tournoi"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 outline-none focus:border-indigo-500 bg-transparent font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Message descriptif
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="ex: Présence obligatoire des entraîneurs à 19h00 en salle du bureau."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 outline-none focus:border-indigo-500 bg-transparent font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as NotificationType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 outline-none bg-transparent font-medium cursor-pointer"
                    >
                      <option value="meeting">Réunion / Match</option>
                      <option value="membership_fee">Cotisation</option>
                      <option value="new_member">Inscription</option>
                      <option value="system">Alerte Système</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Niveau de Priorité
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as "normal" | "medium" | "high")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 outline-none bg-transparent font-medium cursor-pointer"
                    >
                      <option value="normal">Normale</option>
                      <option value="medium">Moyenne (Échéance)</option>
                      <option value="high">Haute (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Redirection lors du clic
                  </label>
                  <select
                    value={newTargetView}
                    onChange={(e) => setNewTargetView(e.target.value as ActiveView)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 outline-none bg-transparent font-medium cursor-pointer"
                  >
                    <option value="planning">Planning & Calendrier</option>
                    <option value="members">Annuaire Membres</option>
                    <option value="finances">Finances & Cotisations</option>
                    <option value="sessions">Séances & Convocations</option>
                    <option value="dashboard">Tableau de Bord</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Créer le Rappel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

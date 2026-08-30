import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppTheme } from "../types";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  theme?: AppTheme;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  description = "Cette action est irréversible. Êtes-vous certain de vouloir supprimer cet élément ?",
  itemName,
  confirmText = "Supprimer définitivement",
  cancelText = "Annuler",
  theme
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const isClassic = theme === "classic";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden p-6 relative ${
            isClassic
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-200 text-slate-900 shadow-rose-500/5"
          }`}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            {/* Red Warning Icon */}
            <div className="p-3.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20 shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">
                {title}
              </h3>
              {itemName && (
                <div className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold my-1">
                  « {itemName} »
                </div>
              )}
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                {description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-3">
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

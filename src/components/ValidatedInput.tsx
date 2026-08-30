import React, { useState } from "react";
import { AlertCircle, CheckCircle2, LucideIcon } from "lucide-react";
import { ValidationResult } from "../lib/validation";

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  validate?: (value: string) => ValidationResult;
  icon?: LucideIcon;
  theme?: "classic" | "modern" | "dark";
  helpText?: string;
  showValidState?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  value,
  onChange,
  validate,
  icon: Icon,
  theme = "modern",
  helpText,
  showValidState = true,
  className = "",
  placeholder,
  id,
  type = "text",
  disabled,
  required,
  ...rest
}) => {
  const [isTouched, setIsTouched] = useState(false);

  const validationResult = validate && (isTouched || value.length > 0) 
    ? validate(value) 
    : { isValid: true };

  const hasError = !validationResult.isValid;
  const isValidAndNotEmpty = validate && value.trim().length > 0 && validationResult.isValid;

  const isClassic = theme === "classic";

  let borderStyles = isClassic
    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-400"
    : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-100 dark:focus:border-indigo-400";

  if (hasError) {
    borderStyles = "bg-rose-50/40 border-rose-500 text-rose-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/30 dark:bg-rose-950/20 dark:border-rose-500 dark:text-rose-100";
  } else if (isValidAndNotEmpty && showValidState) {
    borderStyles = "bg-emerald-50/30 border-emerald-500/80 text-slate-900 focus:border-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-500/80 dark:text-slate-100";
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => {
            if (!isTouched) setIsTouched(true);
            onChange(e.target.value);
          }}
          onBlur={() => setIsTouched(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm border transition duration-150 ${
            Icon ? "pl-10" : ""
          } ${borderStyles}`}
          {...rest}
        />

        {/* Floating status icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          {hasError && (
            <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
          )}
          {isValidAndNotEmpty && showValidState && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
        </div>
      </div>

      {/* Real-time Validation Error or Help Message */}
      {hasError ? (
        <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {validationResult.errorMessage}
        </p>
      ) : isValidAndNotEmpty && showValidState ? (
        <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          Format valide
        </p>
      ) : helpText ? (
        <p className="text-[11px] text-slate-400 mt-1">{helpText}</p>
      ) : null}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { User, AppTheme } from "../types";
import { ValidatedInput } from "./ValidatedInput";
import { validateEmail } from "../lib/validation";
import {
  LogIn,
  UserPlus,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  Lock,
  Check,
  Users,
  Award,
  ShieldCheck,
  Building2,
  Activity,
  RefreshCw,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginProps {
  onLogin: (user: User) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, theme, setTheme }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"email" | "code">("email");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Security Layer for Admin Registration
  const [adminSecurityKey, setAdminSecurityKey] = useState("");
  const [agreedAdminTerms, setAgreedAdminTerms] = useState(false);
  const [captchaPuzzle, setCaptchaPuzzle] = useState({ n1: 6, n2: 3, answer: 9 });
  const [captchaInput, setCaptchaInput] = useState("");

  const refreshCaptcha = () => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    setCaptchaPuzzle({ n1: a, n2: b, answer: a + b });
    setCaptchaInput("");
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [logoError, setLogoError] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("appass_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Password strength helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-700" };
    let score = 0;
    if (pass.length >= 4) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: "Faible", color: "bg-rose-500" };
    if (score === 2) return { score: 50, label: "Moyen", color: "bg-amber-500" };
    if (score === 3) return { score: 75, label: "Bon", color: "bg-blue-500" };
    return { score: 100, label: "Très fort", color: "bg-emerald-500" };
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("appass_remembered_email", email);
    } else {
      localStorage.removeItem("appass_remembered_email");
    }

    const storedUsers = localStorage.getItem("appass_users");
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    // Check if user exists (fallback to default admin if users are empty)
    let foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser && email.toLowerCase() === "admin@example.com") {
      // Auto-create default admin
      const defaultAdmin: User = {
        id: "u-default",
        name: "Administrateur Principal",
        email: "admin@example.com",
        role: "admin",
        createdAt: new Date().toISOString()
      };
      const updatedUsers = [...users, defaultAdmin];
      localStorage.setItem("appass_users", JSON.stringify(updatedUsers));
      foundUser = defaultAdmin;
    }

    if (foundUser) {
      const passwords = JSON.parse(localStorage.getItem("appass_passwords") || "{}");
      const storedPassword = passwords[foundUser.email.toLowerCase()];

      if (storedPassword) {
        if (password === storedPassword) {
          onLogin(foundUser);
        } else {
          setError("Mot de passe incorrect.");
        }
      } else {
        // Fallback for users registered before passwords were saved or the default credentials
        if (foundUser.email.toLowerCase() === "admin@example.com" && password === "admin") {
          onLogin(foundUser);
        } else if (foundUser.email.toLowerCase() !== "admin@example.com" && password.length >= 4) {
          onLogin(foundUser);
        } else {
          setError("Mot de passe incorrect.");
        }
      }
    } else {
      setError("Aucun utilisateur trouvé avec cet e-mail.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name || !email || !password || !confirmPassword || !adminSecurityKey || !captchaInput) {
      setError("Veuillez remplir tous les champs obligatoires du formulaire.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe administrateur doit comporter au moins 6 caractères pour des raisons de sécurité.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // 1. Verify Admin Security Key
    const expectedKey = localStorage.getItem("appass_admin_security_key") || "APPASS-2026";
    if (adminSecurityKey.trim().toUpperCase() !== expectedKey.toUpperCase()) {
      setError(`Clé de sécurité organisationnelle invalide. (Clé d'activation : ${expectedKey})`);
      return;
    }

    // 2. Verify Security Anti-Bot Captcha
    if (parseInt(captchaInput.trim(), 10) !== captchaPuzzle.answer) {
      setError("Le calcul de vérification de sécurité est incorrect.");
      refreshCaptcha();
      return;
    }

    // 3. Verify Admin Terms Agreement
    if (!agreedAdminTerms) {
      setError("Vous devez certifier être habilité(e) et accepter la charte de responsabilité d'administration.");
      return;
    }

    const storedUsers = localStorage.getItem("appass_users");
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    const exists =
      users.some((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      email.toLowerCase() === "admin@example.com";
    if (exists) {
      setError("Cet e-mail est déjà utilisé.");
      return;
    }

    const newUser: User = {
      id: "u-" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role: "admin",
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem("appass_users", JSON.stringify(updatedUsers));

    // Save Password
    const passwords = JSON.parse(localStorage.getItem("appass_passwords") || "{}");
    passwords[email.toLowerCase()] = password;
    localStorage.setItem("appass_passwords", JSON.stringify(passwords));

    setSuccessMsg("Compte Administrateur sécurisé créé avec succès ! Connectez-vous maintenant.");
    setIsRegistering(false);
    setPassword("");
    setConfirmPassword("");
    setAdminSecurityKey("");
    setCaptchaInput("");
    setAgreedAdminTerms(false);
    refreshCaptcha();
  };

  const handleRequestRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!recoveryEmail) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }

    const storedUsers = localStorage.getItem("appass_users");
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    const userExists =
      users.some((u) => u.email.toLowerCase() === recoveryEmail.toLowerCase()) ||
      recoveryEmail.toLowerCase() === "admin@example.com";

    if (!userExists) {
      setError("Aucun compte trouvé avec cette adresse email.");
      return;
    }

    // Generate a simulated 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setRecoveryStep("code");
    setSuccessMsg("Un code de récupération à 6 chiffres a été généré avec succès !");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!enteredCode || !newPassword || !confirmNewPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (enteredCode !== generatedCode) {
      setError("Le code de récupération saisi est incorrect.");
      return;
    }

    if (newPassword.length < 4) {
      setError("Le nouveau mot de passe doit faire au moins 4 caractères.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Update password mapping
    const passwords = JSON.parse(localStorage.getItem("appass_passwords") || "{}");
    passwords[recoveryEmail.toLowerCase()] = newPassword;
    localStorage.setItem("appass_passwords", JSON.stringify(passwords));

    setSuccessMsg("Votre mot de passe a été réinitialisé avec succès ! Connectez-vous.");

    setIsRecovering(false);
    setRecoveryStep("email");
    setEmail(recoveryEmail);
    setRecoveryEmail("");
    setGeneratedCode("");
    setEnteredCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const fillQuickCredentials = (demoRole: "admin" | "coach" | "treasurer" = "admin") => {
    if (demoRole === "admin") {
      setEmail("admin@example.com");
      setPassword("admin");
    } else if (demoRole === "coach") {
      setEmail("coach@example.com");
      setPassword("coach123");
    } else {
      setEmail("tresorier@example.com");
      setPassword("tresorier123");
    }
    setError("");
  };

  const isClassic = theme === "classic";
  const bgClass = isClassic ? "bg-black" : "bg-slate-950";
  const cardClass = isClassic
    ? "bg-[#111] border border-[#0d6efd] shadow-blue-500/10"
    : "bg-slate-900/90 backdrop-blur-2xl border border-slate-800 shadow-indigo-500/5";

  const inputClass = isClassic
    ? "w-full bg-black border border-[#0d6efd] focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-white rounded-xl py-3 pl-10 pr-10 outline-none transition text-xs font-medium"
    : "w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white rounded-xl py-3 pl-10 pr-10 outline-none transition text-xs font-medium";

  const labelClass = isClassic
    ? "block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5"
    : "block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5";

  const btnPrimary = isClassic
    ? "w-full bg-[#0d6efd] hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl py-3 px-4 text-xs font-bold transition duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer font-display"
    : "w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl py-3 px-4 text-xs font-bold transition duration-150 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer";

  const tabActive = isClassic
    ? "border-[#0d6efd] text-blue-400 font-extrabold"
    : "border-indigo-500 text-indigo-400 font-extrabold";
  const tabInactive = isClassic
    ? "border-transparent text-slate-400 hover:text-white"
    : "border-transparent text-slate-500 hover:text-slate-300";

  const passStrength = getPasswordStrength(isRegistering ? password : newPassword);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${bgClass} px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300`}>
      {/* Ambient background glows */}
      {!isClassic && (
        <>
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="max-w-md w-full space-y-6 relative z-10 my-auto">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            {!logoError ? (
              <img
                src="/assets/img/Logo2.png"
                alt="AppAss Logo"
                onError={() => setLogoError(true)}
                className="w-20 h-20 object-contain drop-shadow-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border shadow-xl ${
                  isClassic
                    ? "bg-[#0d6efd]/10 text-[#0d6efd] border-[#0d6efd]/30"
                    : "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                }`}
              >
                <Shield className="w-8 h-8" />
              </div>
            )}
          </div>
          <h1
            className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isClassic ? "text-[#0d6efd]" : "text-white"
            }`}
          >
            AppAss
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans">
            Gestion Intelligente d'Association Sportive & Omnisports
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          id="auth-card"
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 transition-all duration-300 ${cardClass}`}
        >
          {/* Header tabs */}
          {!isRecovering && (
            <div
              className={`flex border-b pb-3 justify-center space-x-6 ${
                isClassic ? "border-[#0d6efd]/30" : "border-slate-800"
              }`}
            >
              <button
                id="tab-login"
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError("");
                  setSuccessMsg("");
                }}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 px-2 cursor-pointer ${
                  !isRegistering ? tabActive : tabInactive
                }`}
              >
                Se Connecter
              </button>
              <button
                id="tab-register"
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError("");
                  setSuccessMsg("");
                }}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 px-2 cursor-pointer ${
                  isRegistering ? tabActive : tabInactive
                }`}
              >
                Créer un Compte
              </button>
            </div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                id="auth-error"
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2 font-medium"
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                id="auth-success"
                className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl flex items-center gap-2 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RECOVERY MODE */}
          {isRecovering ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  Mot de passe oublié ?
                </h3>
                <button
                  id="btn-back-to-login"
                  type="button"
                  onClick={() => {
                    setIsRecovering(false);
                    setRecoveryStep("email");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="p-1 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Retour
                </button>
              </div>

              {recoveryStep === "email" ? (
                <form id="recovery-email-form" onSubmit={handleRequestRecoveryCode} className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Saisissez l'adresse email de votre compte pour recevoir un code de vérification à 6 chiffres.
                  </p>
                  <div>
                    <ValidatedInput
                      id="recovery-email-input"
                      type="email"
                      label="Adresse Email"
                      required
                      placeholder="admin@example.com"
                      value={recoveryEmail}
                      onChange={setRecoveryEmail}
                      validate={(val) => validateEmail(val, true)}
                      icon={Mail}
                      theme={isClassic ? "classic" : "dark"}
                    />
                  </div>

                  <button id="btn-request-code-submit" type="submit" className={btnPrimary}>
                    <Mail className="w-4 h-4" />
                    Générer le code secret
                  </button>
                </form>
              ) : (
                <form id="recovery-reset-form" onSubmit={handleResetPassword} className="space-y-4">
                  <div
                    className={`p-3.5 rounded-2xl space-y-1.5 text-xs border ${
                      isClassic
                        ? "bg-[#0d6efd]/10 border-[#0d6efd]/30 text-blue-300"
                        : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1.5 text-white">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Simulation de Boîte de Réception
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Code de sécurité généré pour <strong className="text-white">{recoveryEmail}</strong> :
                    </p>
                    <div
                      className={`p-2 rounded-xl border text-center font-mono font-extrabold text-xl text-white tracking-widest select-all ${
                        isClassic ? "bg-black border-[#0d6efd]/30" : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      {generatedCode}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Code Secret (6 chiffres) *</label>
                    <input
                      id="recovery-code-input"
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      className={`${inputClass} text-center font-mono tracking-widest text-base pl-3 pr-3`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nouveau mot de passe *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        id="recovery-new-password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Confirmer le mot de passe *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        id="recovery-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button id="btn-reset-password-submit" type="submit" className={btnPrimary}>
                    Enregistrer le nouveau mot de passe
                  </button>
                </form>
              )}
            </div>
          ) : !isRegistering ? (
            /* LOGIN FORM */
            <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Adresse Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelClass}>Mot de passe *</label>
                  <button
                    id="btn-forgot-password"
                    type="button"
                    onClick={() => {
                      setIsRecovering(true);
                      setError("");
                      setSuccessMsg("");
                      setRecoveryEmail(email);
                    }}
                    className={`text-[11px] transition font-bold cursor-pointer ${
                      isClassic ? "text-blue-400 hover:text-blue-300" : "text-indigo-400 hover:text-indigo-300"
                    }`}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Se souvenir de moi</span>
                </label>
              </div>

              <button id="btn-login-submit" type="submit" className={btnPrimary}>
                <LogIn className="w-4 h-4" />
                Se connecter
              </button>

              <div className="relative flex py-1 items-center">
                <div className={`flex-grow border-t ${isClassic ? "border-[#0d6efd]/20" : "border-slate-800"}`} />
                <span className="flex-shrink mx-3 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                  Accès Démo Rapide
                </span>
                <div className={`flex-grow border-t ${isClassic ? "border-[#0d6efd]/20" : "border-slate-800"}`} />
              </div>

              {/* Quick Preset Accounts */}
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickCredentials("admin")}
                  className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between text-xs ${
                    isClassic
                      ? "bg-black border-[#0d6efd]/40 hover:bg-[#0d6efd]/10 text-white"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Administrateur Principal</span>
                      <span className="text-[10px] text-slate-400 font-mono">admin@example.com / admin</span>
                    </div>
                  </div>
                  <Check className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form id="register-form" onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Nom Complet *</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    id="register-name"
                    type="text"
                    required
                    placeholder="Marie Dubois"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <ValidatedInput
                  id="register-email"
                  type="email"
                  label="Adresse Email"
                  required
                  placeholder="marie@example.com"
                  value={email}
                  onChange={setEmail}
                  validate={(val) => validateEmail(val, true)}
                  icon={Mail}
                  theme={isClassic ? "classic" : "dark"}
                />
              </div>

              <div>
                <label className={labelClass}>Mot de passe *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-medium">Force : {passStrength.label}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passStrength.color}`}
                        style={{ width: `${passStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ADMIN SECURITY LAYER BOX */}
              <div
                className={`p-4 rounded-2xl border space-y-3.5 ${
                  isClassic
                    ? "bg-black border-[#0d6efd]/40"
                    : "bg-slate-950/80 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    Sécurité Administrateur
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Protection RGPD</span>
                </div>

                {/* 1. Admin Security Key */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={labelClass}>Clé de Sécurité Organisationnelle *</label>
                    <button
                      type="button"
                      onClick={() => setAdminSecurityKey("APPASS-2026")}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                    >
                      Insérer clé démo (APPASS-2026)
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      id="register-admin-key"
                      type="text"
                      required
                      placeholder="ex: APPASS-2026"
                      value={adminSecurityKey}
                      onChange={(e) => setAdminSecurityKey(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* 2. Math Anti-Bot Challenge */}
                <div>
                  <label className={labelClass}>
                    Test Anti-Robot : Combien font {captchaPuzzle.n1} + {captchaPuzzle.n2} ? *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        id="register-captcha"
                        type="text"
                        required
                        placeholder="Réponse numérique"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className={`p-3 rounded-xl border text-slate-400 hover:text-white transition cursor-pointer shrink-0 ${
                        isClassic ? "bg-black border-slate-800" : "bg-slate-900 border-slate-800"
                      }`}
                      title="Changer la question de sécurité"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3. Responsibility Charter Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer font-medium leading-tight">
                    <input
                      type="checkbox"
                      checked={agreedAdminTerms}
                      onChange={(e) => setAgreedAdminTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 shrink-0 mt-0.5 cursor-pointer"
                    />
                    <span>
                      Je certifie être habilité(e) à administrer l'association et j'accepte la charte de gestion des données adhérents.
                    </span>
                  </label>
                </div>
              </div>

              <button id="btn-register-submit" type="submit" className={btnPrimary}>
                <UserPlus className="w-4 h-4" />
                Créer mon compte
              </button>
            </form>
          )}
        </motion.div>

        {/* Feature Pills */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Données Sécurisées
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Version 2.5 Pro
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-500" /> Multi-activités
          </span>
        </div>
      </div>
    </div>
  );
};

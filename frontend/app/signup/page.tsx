"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { registerDoctor, isAuthenticated } from "@/lib/auth";
import LanguageSelector from "@/components/LanguageSelector";
import {
  IconBrain, IconUser, IconStethoscope, IconArrowRight,
  IconShield, IconNetwork, IconKey, IconArrowLeft, IconCheck, IconEye
} from "@/components/Icons";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [spec,            setSpec]            = useState("Cardiologist");
  const [loading,         setLoading]         = useState(false);
  const [err,             setErr]             = useState("");
  const [successMsg,      setSuccessMsg]      = useState("");

  useEffect(() => {
    // If already logged in, redirect to workspace
    if (isAuthenticated()) {
      router.push("/patients");
    }
  }, []);

  const SPECIALISATIONS = [
    { value: "Cardiologist", label: t("spec_cardiologist") },
    { value: "General Physician", label: t("spec_general_physician") },
    { value: "Neurologist", label: t("spec_neurologist") },
    { value: "Endocrinologist", label: t("spec_endocrinologist") },
    { value: "Pulmonologist", label: t("spec_pulmonologist") },
    { value: "Oncologist", label: t("spec_oncologist") },
  ];

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErr("Please enter your doctor name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 4) {
      setErr("Password must be at least 4 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match. Please check again.");
      return;
    }

    setLoading(true);

    const res = registerDoctor(email, password, name, spec);
    if (!res.success) {
      setErr(res.message || "Failed to create account.");
      setLoading(false);
      return;
    }

    setSuccessMsg("Account registered successfully! Redirecting to login page...");
    setTimeout(() => {
      router.push(`/login?signup=success&email=${encodeURIComponent(email.trim())}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-white flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Top Header Bar with Language Selector */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector />
      </div>

      {/* Background ambient radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-teal/5 blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-[480px] bg-[#0c1120] border border-[#1a2436] rounded-2xl p-6 md:p-8 shadow-2xl z-10 animate-fade-up">

        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal/20">
            <IconBrain size={30} className="text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight mb-1">
            Medhelp AI
          </h1>
          <p className="text-xs text-ink-muted">
            The memory layer for doctors
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSignUp} autoComplete="off" className="space-y-4">
          <div className="text-center mb-2">
            <h2 className="text-lg font-bold text-white mb-1">
              Create your account
            </h2>
            <p className="text-xs text-ink-muted">
              Start building persistent patient memory with Cognee Cloud
            </p>
          </div>

          {/* Cognee Memory Active Status Badge */}
          <div className="flex items-center justify-center gap-2 bg-[#001f17] border border-teal/30 rounded-full py-1.5 px-4 mb-4">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            <IconNetwork size={12} className="text-teal" />
            <span className="text-xs font-semibold text-teal">
              Cognee Cloud memory active
            </span>
          </div>

          {/* FIELDS */}
          <div className="space-y-3">
            {/* Doctor Name */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Doctor Name
              </label>
              <div className="flex items-center gap-2.5 bg-[#06080f] border border-line rounded-xl px-3 py-2.5 focus-within:border-teal transition-all">
                <IconUser size={14} className="text-ink-muted flex-shrink-0" />
                <input
                  type="text"
                  name="medhelp_signup_doctor_name"
                  autoComplete="off"
                  required
                  placeholder="e.g. Dr. Sarah Connor"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErr(""); }}
                  className="w-full bg-transparent text-xs text-white outline-none font-medium placeholder:text-ink-muted"
                />
              </div>
            </div>

            {/* Email / Username */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Email / Username
              </label>
              <div className="flex items-center gap-2.5 bg-[#06080f] border border-line rounded-xl px-3 py-2.5 focus-within:border-teal transition-all">
                <IconUser size={14} className="text-ink-muted flex-shrink-0" />
                <input
                  type="email"
                  name="medhelp_signup_email"
                  autoComplete="off"
                  required
                  placeholder="e.g. sarah@hospital.org"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                  className="w-full bg-transparent text-xs text-white outline-none font-medium placeholder:text-ink-muted"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Password
              </label>
              <div className="flex items-center gap-2.5 bg-[#06080f] border border-line rounded-xl px-3 py-2.5 focus-within:border-teal transition-all relative">
                <IconKey size={14} className="text-ink-muted flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="medhelp_signup_password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErr(""); }}
                  className="w-full bg-transparent text-xs text-white outline-none font-medium placeholder:text-ink-muted pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-ink-muted hover:text-white transition-colors cursor-pointer"
                >
                  <IconEye size={14} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Confirm Password
              </label>
              <div className="flex items-center gap-2.5 bg-[#06080f] border border-line rounded-xl px-3 py-2.5 focus-within:border-teal transition-all relative">
                <IconKey size={14} className="text-ink-muted flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="medhelp_signup_confirm_password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErr(""); }}
                  className="w-full bg-transparent text-xs text-white outline-none font-medium placeholder:text-ink-muted pr-8"
                />
              </div>
            </div>

            {/* Specialisation */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Specialisation
              </label>
              <div className="flex items-center gap-2.5 bg-[#06080f] border border-line rounded-xl px-3 py-2.5 focus-within:border-teal transition-all">
                <IconStethoscope size={14} className="text-ink-muted flex-shrink-0" />
                <select
                  value={spec}
                  onChange={(e) => setSpec(e.target.value)}
                  className="w-full bg-transparent text-xs text-white outline-none font-medium cursor-pointer"
                >
                  {SPECIALISATIONS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-[#0c1120] text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {err && (
            <div className="text-xs text-rose bg-rose-dark/30 border border-rose/30 rounded-xl p-3">
              {err}
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="text-xs text-teal bg-[#001f17] border border-teal/40 rounded-xl p-3 flex items-center gap-2">
              <IconCheck size={14} className="text-teal flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !!successMsg}
            className="w-full py-3 rounded-xl text-xs font-extrabold text-[#06080f] bg-gradient-to-r from-teal to-sky-500 hover:opacity-90 shadow-lg shadow-teal/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create account</span>
                <IconArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Options */}
        <div className="mt-6 pt-4 border-t border-line flex flex-col items-center gap-3 text-xs">
          <div>
            <span className="text-ink-muted">Already have an account? </span>
            <Link href="/login" className="text-teal font-bold hover:underline">
              Log in
            </Link>
          </div>
          <Link
            href="/"
            className="text-ink-muted hover:text-white font-medium flex items-center gap-1.5 transition-all"
          >
            <IconArrowLeft size={14} />
            <span>Back to home</span>
          </Link>
        </div>
      </div>

      {/* Privacy note */}
      <div className="mt-6 flex items-center gap-2 text-[10px] text-ink-muted z-10">
        <IconShield size={11} />
        <span>Registration · Secured Medhelp AI Authentication</span>
      </div>
    </div>
  );
}

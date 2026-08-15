"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { loginDoctor, isAuthenticated } from "@/lib/auth";
import LanguageSelector from "@/components/LanguageSelector";
import {
  IconBrain, IconUser, IconArrowRight, IconShield,
  IconNetwork, IconKey, IconArrowLeft, IconCheck, IconEye
} from "@/components/Icons";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [err,          setErr]          = useState("");
  const [infoMsg,      setInfoMsg]      = useState("");

  useEffect(() => {
    // If already logged in, redirect to workspace
    if (isAuthenticated()) {
      router.push("/patients");
      return;
    }

    const emailParam = searchParams?.get("email");
    const isSignupSuccess = searchParams?.get("signup") === "success";

    if (isSignupSuccess) {
      setInfoMsg("Account created successfully! Please enter your credentials to log in.");
    }

    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams, router]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    
    if (!email.trim() || !email.includes("@")) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 4) {
      setErr("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);

    const res = loginDoctor(email.trim(), password);
    if (!res.success) {
      setErr(res.message || "Failed to log in. Please check your credentials.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      router.push("/patients");
    }, 600);
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
      <div className="w-full max-w-[440px] bg-[#0c1120] border border-[#1a2436] rounded-2xl p-6 md:p-8 shadow-2xl z-10 animate-fade-up">

        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal/20">
            <IconBrain size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
            Medhelp AI
          </h1>
          <p className="text-xs text-ink-muted">
            {t("memory_layer_subtitle")}
          </p>
        </div>

        {/* Form Header */}
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-white mb-1">
            {t("right_card_title")}
          </h2>
          <p className="text-xs text-ink-muted">
            {t("right_card_subtitle")}
          </p>
        </div>

        {/* Cognee Memory Active Status Badge */}
        <div className="flex items-center justify-center gap-2 bg-[#001f17] border border-teal/30 rounded-full py-1.5 px-4 mb-5">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <IconNetwork size={12} className="text-teal" />
          <span className="text-xs font-semibold text-teal">
            {t("cognee_active_pill")}
          </span>
        </div>

        {/* Registration Success Alert Banner */}
        {infoMsg && (
          <div className="text-xs text-teal bg-[#001f17] border border-teal/40 rounded-xl p-3 mb-4 flex items-center gap-2">
            <IconCheck size={14} className="text-teal flex-shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSignIn} autoComplete="off" className="space-y-4">

          {/* Email / Username Field */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
              {t("email_label")}
            </label>
            <div className="flex items-center gap-2.5 bg-[#06080f] border border-line rounded-xl px-3.5 py-3 focus-within:border-teal transition-all">
              <IconUser size={15} className="text-ink-muted flex-shrink-0" />
              <input
                type="email"
                name="medhelp_login_email"
                autoComplete="off"
                required
                placeholder={t("email_placeholder")}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                className="w-full bg-transparent text-xs text-white outline-none font-medium placeholder:text-ink-muted"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                {t("password_label")}
              </label>
            </div>
            <div className="flex items-center gap-2.5 bg-[#06080f] border border-line rounded-xl px-3.5 py-3 focus-within:border-teal transition-all relative">
              <IconKey size={15} className="text-ink-muted flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="medhelp_login_password"
                autoComplete="new-password"
                required
                placeholder={t("password_placeholder")}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErr(""); }}
                className="w-full bg-transparent text-xs text-white outline-none font-medium placeholder:text-ink-muted pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-ink-muted hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                <IconEye size={15} />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {err && (
            <div className="text-xs text-rose bg-rose-dark/30 border border-rose/30 rounded-xl p-3">
              {err}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-xs font-extrabold text-[#06080f] bg-gradient-to-r from-teal to-sky-500 hover:opacity-90 shadow-lg shadow-teal/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>{t("connecting_btn")}</span>
              </>
            ) : (
              <>
                <span>{t("sign_in_btn")}</span>
                <IconArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Options */}
        <div className="mt-6 pt-4 border-t border-line flex flex-col items-center gap-3 text-xs">
          <div>
            <span className="text-ink-muted">Don't have an account? </span>
            <Link href="/signup" className="text-teal font-bold hover:underline">
              Sign up
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
        <span>Authentication · Secured Medhelp AI Workspace</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090f] text-white flex items-center justify-center">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
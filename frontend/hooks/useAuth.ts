"use client";
import { useState, useEffect } from "react";

export type Doctor = {
  name:           string;
  specialisation: string;
  initials:       string;
};

const DOCTOR_KEY  = "medhelp_doctor";
const PATIENT_KEY = "medhelp_active_patient";

export function useAuth() {
  const [doctor,  setDoctor]  = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DOCTOR_KEY);
      if (saved) setDoctor(JSON.parse(saved));
    } catch {}
    setLoading(false);
  }, []);

  const login = (name: string, specialisation: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const doc: Doctor = { name, specialisation, initials };
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(doc));
    setDoctor(doc);
  };

  const logout = () => {
    localStorage.removeItem(DOCTOR_KEY);
    localStorage.removeItem(PATIENT_KEY);
    localStorage.removeItem("medhelp_auth_token");
    setDoctor(null);
    window.location.href = "/";
  };

  const isLoggedIn = !!doctor;

  return { doctor, loading, login, logout, isLoggedIn };
}

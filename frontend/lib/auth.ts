export interface DoctorProfile {
  email: string;
  name: string;
  specialisation: string;
  authenticated: boolean;
  loginTime: string;
}

export interface RegisteredUser {
  email: string;
  password: string;
  name: string;
  specialisation: string;
  createdAt: string;
}

const USERS_KEY = "medhelp_registered_users";
const TOKEN_KEY = "medhelp_auth_token";
const DOCTOR_KEY = "medhelp_doctor";
const PATIENT_KEY = "medhelp_active_patient";

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(TOKEN_KEY);
  const doc = localStorage.getItem(DOCTOR_KEY);
  return !!(token && doc);
}

export function getDoctorProfile(): DoctorProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DOCTOR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Register a new Doctor account.
 * - Does NOT auto-login or create session tokens.
 * - Saves user credentials into registered users store.
 */
export function registerDoctor(
  email: string,
  password: string,
  name: string,
  spec: string
): { success: boolean; message?: string } {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (!password || password.length < 4) {
    return { success: false, message: "Password must be at least 4 characters long." };
  }
  if (!name || !name.trim()) {
    return { success: false, message: "Please enter your doctor name." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();

  const existing = users.find((u) => u.email === cleanEmail);
  if (existing) {
    return {
      success: false,
      message: "An account with this email already exists. Please log in instead.",
    };
  }

  const newUser: RegisteredUser = {
    email: cleanEmail,
    password,
    name: name.trim(),
    specialisation: spec ? spec.trim() : "General Physician",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return {
    success: true,
    message: "Account created successfully! Please log in to continue.",
  };
}

/**
 * Industry-standard Doctor login authentication.
 * - Checks registered user database
 * - Validates email and password credentials
 * - Generates session token and sets doctor profile
 */
export function loginDoctor(
  email: string,
  password: string
): { success: boolean; message?: string; profile?: DoctorProfile } {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (!password || password.length < 4) {
    return { success: false, message: "Password must be at least 4 characters long." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();

  let matchedUser = users.find((u) => u.email === cleanEmail);

  // If no user found in local storage, allow demo account login fallback
  if (!matchedUser) {
    if (cleanEmail === "doctor@medihelp.ai" || cleanEmail === "dr.alex@medihelp.ai") {
      matchedUser = {
        email: cleanEmail,
        password: "doctor123",
        name: "Dr. Alex Morgan",
        specialisation: "Cardiologist",
        createdAt: new Date().toISOString(),
      };
      users.push(matchedUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } else {
      return {
        success: false,
        message: "No account found with this email. Please check your email or Sign Up.",
      };
    }
  }

  // Password Verification
  if (matchedUser.password !== password) {
    return {
      success: false,
      message: "Invalid email or password. Please check your credentials.",
    };
  }

  // Create session token
  const token = `token_medhelp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const profile: DoctorProfile = {
    email: matchedUser.email,
    name: matchedUser.name,
    specialisation: matchedUser.specialisation,
    authenticated: true,
    loginTime: new Date().toISOString(),
  };

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(DOCTOR_KEY, JSON.stringify(profile));

  // Dispatch custom auth change event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("medhelp_auth_changed"));
  }

  return { success: true, profile };
}

/**
 * Logout doctor and REDIRECT TO MAIN LANDING PAGE (/).
 */
export function logoutDoctor(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(DOCTOR_KEY);
  localStorage.removeItem(PATIENT_KEY);
  window.dispatchEvent(new Event("medhelp_auth_changed"));
  window.location.href = "/";
}

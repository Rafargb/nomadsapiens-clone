import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Attach bearer token fallback if available (mobile / cookie issues)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nomad_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatError(err) {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || "Erro desconhecido";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => e?.msg || JSON.stringify(e)).join(", ");
  return JSON.stringify(detail);
}

export const REF_KEY = "nomad_ref";
export const REF_EXPIRY_KEY = "nomad_ref_exp";
const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function persistRef(code) {
  if (!code) return;
  localStorage.setItem(REF_KEY, code);
  localStorage.setItem(REF_EXPIRY_KEY, String(Date.now() + REF_TTL_MS));
}

export function getPersistedRef() {
  const code = localStorage.getItem(REF_KEY);
  const exp = Number(localStorage.getItem(REF_EXPIRY_KEY) || 0);
  if (!code || !exp || exp < Date.now()) return null;
  return code;
}

export function formatCurrency(value, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value || 0);
}

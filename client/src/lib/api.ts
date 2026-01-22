import { Appointment, Catalog, PatientSummary, PatientWithDetails, PortalSummary, Prescription } from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://127.0.0.1:8000");

type Options = RequestInit & { json?: unknown };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { json, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: json ? JSON.stringify(json) : options.body,
    cache: "no-store",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || res.statusText);
  }

  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<PatientWithDetails>("/auth/login", { method: "POST", json: { email, password } }),
  getPatients: () => request<PatientSummary[]>("/patients"),
  createPatient: (payload: Record<string, unknown>) =>
    request<PatientWithDetails>("/patients", { method: "POST", json: payload }),
  updatePatient: (id: number, payload: Record<string, unknown>) =>
    request<PatientWithDetails>(`/patients/${id}`, { method: "PATCH", json: payload }),
  deletePatient: (id: number) =>
    request<{ status: string }>(`/patients/${id}`, { method: "DELETE" }),
  getPatient: (id: number) => request<PatientWithDetails>(`/patients/${id}`),
  getSummary: (id: number, days = 7) =>
    request<PortalSummary>(`/patients/${id}/summary?days=${days}`),
  catalog: () => request<Catalog>("/catalog"),
  createAppointment: (payload: Partial<Appointment>) =>
    request<Appointment>("/appointments", { method: "POST", json: payload }),
  updateAppointment: (id: number, payload: Partial<Appointment>) =>
    request<Appointment>(`/appointments/${id}`, { method: "PUT", json: payload }),
  deleteAppointment: (id: number) => request<{ status: string }>(`/appointments/${id}`, { method: "DELETE" }),
  createPrescription: (payload: Partial<Prescription>) =>
    request<Prescription>("/prescriptions", { method: "POST", json: payload }),
  updatePrescription: (id: number, payload: Partial<Prescription>) =>
    request<Prescription>(`/prescriptions/${id}`, { method: "PUT", json: payload }),
  deletePrescription: (id: number) => request<{ status: string }>(`/prescriptions/${id}`, { method: "DELETE" }),
};

export { API_BASE };

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { PatientSummary } from "@/lib/types";

const blankForm = { name: "", email: "", password: "" };

export default function Admin() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const submitNewPatient = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.createPatient(form);
      setForm(blankForm);
      await fetchPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create patient");
    } finally {
      setLoading(false);
    }
  };

  const removePatient = async (id: number) => {
    const confirmed = window.confirm("Delete this patient and all related data?");
    if (!confirmed) return;
    setDeletingId(id);
    setError(null);
    try {
      await api.deletePatient(id);
      await fetchPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete patient");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-ocean/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean">
            Admin EMR
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-night sm:text-4xl">Patient roster</h1>
          <p className="max-w-2xl text-base text-ink/80">
            Manage patients, appointments, and prescriptions. Drill into a patient to edit details, schedule visits, or issue refills.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full bg-night px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-night/10 transition hover:-translate-y-px hover:bg-ink"
        >
          Patient portal
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="glass card-border rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink/70">Patients</p>
                <h2 className="text-xl font-semibold text-night">At-a-glance</h2>
              </div>
              <button
                onClick={fetchPatients}
                className="rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink hover:bg-ink/5"
              >
                Refresh
              </button>
            </div>
            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-inner">
              <div className="grid grid-cols-6 gap-3 bg-ink/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink">
                <span>Name</span>
                <span>Email</span>
                <span className="text-center">Appointments</span>
                <span className="text-center">Prescriptions</span>
                <span className="text-right col-span-2">Actions</span>
              </div>
              <div className="divide-y divide-ink/5">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="grid w-full grid-cols-6 items-center gap-3 px-4 py-3 text-left transition hover:bg-accent/5"
                  >
                    <button
                      onClick={() => router.push(`/admin/${patient.id}`)}
                      className="col-span-4 flex items-center gap-3 text-left"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-night">{patient.name}</p>
                        <p className="text-xs text-ink/70">ID {patient.id}</p>
                        <p className="text-xs text-ink/70">{patient.email}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-night">{patient.appointment_count}</p>
                          <p className="text-[10px] uppercase tracking-wide text-ink/70">Appts</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-night">{patient.prescription_count}</p>
                          <p className="text-[10px] uppercase tracking-wide text-ink/70">Rx</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/${patient.id}`)}
                      className="rounded-full bg-night px-3 py-2 text-xs font-semibold text-white shadow hover:-translate-y-px"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => removePatient(patient.id)}
                      disabled={deletingId === patient.id}
                      className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === patient.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                ))}
                {patients.length === 0 && (
                  <p className="px-4 py-6 text-sm text-ink/70">No patients found. Add one with the form.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="glass card-border rounded-3xl p-6">
            <p className="text-sm font-semibold text-ink/70">Create patient</p>
            <h2 className="text-xl font-semibold text-night">Add new record</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-semibold text-ink">
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-night shadow-inner focus:border-accent focus:outline-none"
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-night shadow-inner focus:border-accent focus:outline-none"
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-night shadow-inner focus:border-accent focus:outline-none"
                />
              </label>
              <button
                onClick={submitNewPatient}
                disabled={loading}
                className="w-full rounded-xl bg-night px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-night/20 transition hover:-translate-y-px hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Working…" : "Create patient"}
              </button>
              <p className="text-xs text-ink/70">
                Passwords are stored hashed on the backend for the exercise. New patients can immediately log into the portal.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

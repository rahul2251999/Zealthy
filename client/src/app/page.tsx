"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";

import { api } from "@/lib/api";
import { expandAppointments, expandRefills, formatDate, formatDateTime } from "@/lib/schedule";
import { PatientWithDetails } from "@/lib/types";

const repeatLabels: Record<string, string> = {
  none: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export default function Home() {
  const [email, setEmail] = useState("mark@some-email-provider.net");
  const [password, setPassword] = useState("Password123!");
  const [patient, setPatient] = useState<PatientWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const upcomingAppointments = useMemo(
    () => (patient ? expandAppointments(patient.appointments, 7) : []),
    [patient],
  );
  const upcomingRefills = useMemo(
    () => (patient ? expandRefills(patient.prescriptions, 7) : []),
    [patient],
  );
  const fullSchedule = useMemo(
    () => ({
      appointments: patient ? expandAppointments(patient.appointments, 90) : [],
      refills: patient ? expandRefills(patient.prescriptions, 90) : [],
    }),
    [patient],
  );

  const stats = patient
    ? [
        { label: "Appointments", value: patient.appointments.length },
        { label: "Prescriptions", value: patient.prescriptions.length },
        { label: "Next 7 days", value: upcomingAppointments.length + upcomingRefills.length },
      ]
    : [];

  const authenticate = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await api.login(email, password);
      setPatient(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-semibold uppercase tracking-wide text-night shadow-sm">
            Zealthy mini-EMR
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-night sm:text-4xl">
            Patient Portal
          </h1>
          <p className="max-w-2xl text-base text-ink/80">
            Log in as a patient to view upcoming appointments, refill windows, and your health snapshot. Use the admin view for creating patients, appointments, and prescriptions.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full bg-night px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-night/10 transition hover:translate-y-px hover:bg-ink"
        >
          Go to Admin
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <div className="glass card-border rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink/70">Patient access</p>
                <h2 className="text-xl font-semibold text-night">Secure login</h2>
              </div>
              <span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-semibold text-ocean">
                Demo ready
              </span>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-ink">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-night shadow-inner focus:border-accent focus:outline-none"
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-night shadow-inner focus:border-accent focus:outline-none"
                />
              </label>
              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                onClick={authenticate}
                disabled={loading}
                className="w-full rounded-xl bg-night px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-night/20 transition hover:-translate-y-px hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Login"}
              </button>
              <p className="text-xs text-ink/70">
                Try any seeded account (e.g. <span className="font-semibold">mark@some-email-provider.net</span>) or one you create in the admin.
              </p>
            </div>
          </div>
        </section>

        <section className="lg:col-span-3">
          {patient ? (
            <div className="space-y-6">
              <div className="glass card-border rounded-3xl p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink/70">Welcome</p>
                    <h2 className="text-2xl font-semibold text-night">{patient.name}</h2>
                    <p className="text-sm text-ink/70">{patient.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl bg-white/60 px-4 py-3 text-center shadow-inner"
                      >
                        <p className="text-sm text-ink/70">{stat.label}</p>
                        <p className="text-2xl font-semibold text-night">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card title="Next 7 days: appointments" emptyText="No upcoming appointments">
                  {upcomingAppointments.slice(0, 4).map(({ appointment, when }) => (
                    <ListRow
                      key={`${appointment.id}-${when.toISOString()}`}
                      title={`${appointment.provider}`}
                      subtitle={`${formatDateTime(when)} · ${repeatLabels[appointment.repeat]}`}
                    />
                  ))}
                </Card>

                <Card title="Next 7 days: refills" emptyText="No upcoming refills">
                  {upcomingRefills.slice(0, 4).map(({ prescription, when }) => (
                    <ListRow
                      key={`${prescription.id}-${when.toISOString()}`}
                      title={`${prescription.medication} (${prescription.dosage})`}
                      subtitle={`Ready on ${formatDate(when)} · ${repeatLabels[prescription.refill_schedule]}`}
                    />
                  ))}
                </Card>
              </div>

              <div className="glass card-border rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink/70">Full schedule</p>
                    <h3 className="text-xl font-semibold text-night">Next 3 months</h3>
                  </div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    Expanded view
                  </span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Card title="Appointments" emptyText="No appointments scheduled">
                    {fullSchedule.appointments.slice(0, 6).map(({ appointment, when }) => (
                      <ListRow
                        key={`${appointment.id}-${when.toISOString()}`}
                        title={`${formatDateTime(when)}`}
                        subtitle={`${appointment.provider} · ${repeatLabels[appointment.repeat]}`}
                      />
                    ))}
                  </Card>
                  <Card title="Prescriptions" emptyText="No refills scheduled">
                    {fullSchedule.refills.slice(0, 6).map(({ prescription, when }) => (
                      <ListRow
                        key={`${prescription.id}-${when.toISOString()}`}
                        title={`${prescription.medication} (${prescription.dosage})`}
                        subtitle={`Refill on ${formatDate(when)} · ${repeatLabels[prescription.refill_schedule]}`}
                      />
                    ))}
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass card-border flex h-full min-h-[360px] items-center justify-center rounded-3xl bg-white/70 p-10 text-center text-ink/70">
              <div className="max-w-xl space-y-3">
                <h2 className="text-2xl font-semibold text-night">Portal preview</h2>
                <p className="text-base">
                  Sign in with a seeded patient to see a personalized view of upcoming care and medication needs. The admin console lets you add new patients and manage their appointments and prescriptions.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  emptyText,
}: {
  title: string;
  children: React.ReactNode;
  emptyText: string;
}) {
  const isEmpty = React.Children.count(children) === 0;
  return (
    <div className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-inner">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">{title}</p>
      </div>
      <div className="space-y-2 text-sm text-night">
        {isEmpty ? (
          <p className="rounded-xl bg-ink/5 px-3 py-2 text-ink/70">{emptyText}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function ListRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-ink/5 bg-white/70 px-3 py-2 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-night">{title}</p>
        <p className="text-xs text-ink/70">{subtitle}</p>
      </div>
      <span className="mt-1 h-2 w-2 rounded-full bg-accent"></span>
    </div>
  );
}

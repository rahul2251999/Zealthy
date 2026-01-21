"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { expandAppointments, expandRefills, formatDate, formatDateTime } from "@/lib/schedule";
import { Appointment, Catalog, PatientWithDetails, Prescription, Repeat } from "@/lib/types";

type FormAppointment = {
  provider: string;
  datetime: string;
  repeat: Repeat;
  repeat_until: string;
};

type FormPrescription = {
  medication: string;
  dosage: string;
  quantity: number;
  refill_on: string;
  refill_schedule: Repeat;
};

const defaultAppointment: FormAppointment = {
  provider: "",
  datetime: "",
  repeat: "none",
  repeat_until: "",
};

const defaultPrescription: FormPrescription = {
  medication: "",
  dosage: "",
  quantity: 1,
  refill_on: "",
  refill_schedule: "none",
};

export default function PatientDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const routeParams = useParams();
  const rawId = (routeParams?.id as string | undefined) ?? params.id;
  const patientId = Number.parseInt(Array.isArray(rawId) ? rawId[0] : rawId ?? "", 10);
  const invalidId = Number.isNaN(patientId);

  const [patient, setPatient] = useState<PatientWithDetails | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [patientForm, setPatientForm] = useState({ name: "", email: "", password: "" });
  const [appointmentForm, setAppointmentForm] = useState<FormAppointment>(defaultAppointment);
  const [prescriptionForm, setPrescriptionForm] = useState<FormPrescription>(defaultPrescription);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (invalidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [record, cat] = await Promise.all([api.getPatient(patientId), api.catalog()]);
      setPatient(record);
      setCatalog(cat);
      setPatientForm({ name: record.name, email: record.email, password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load patient");
    } finally {
      setLoading(false);
    }
  }, [invalidId, patientId]);

  useEffect(() => {
    load();
  }, [load]);

  const upcoming = useMemo(
    () => ({
      appointments: patient ? expandAppointments(patient.appointments, 14) : [],
      refills: patient ? expandRefills(patient.prescriptions, 30) : [],
    }),
    [patient],
  );

  const savePatient = async () => {
    if (!patient) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = {};
      if (patientForm.name !== patient.name) payload.name = patientForm.name;
      if (patientForm.email !== patient.email) payload.email = patientForm.email;
      if (patientForm.password) payload.password = patientForm.password;
      const updated = await api.updatePatient(patient.id, payload);
      setPatient(updated);
      setPatientForm({ ...patientForm, password: "" });
      setMessage("Patient saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save patient");
    } finally {
      setSaving(false);
    }
  };

  const submitAppointment = async () => {
    if (!patient) return;
    if (!appointmentForm.provider || !appointmentForm.datetime) {
      setError("Provider and date/time are required for appointments");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload: Partial<Appointment> = {
        patient_id: patient.id,
        provider: appointmentForm.provider,
        datetime: new Date(appointmentForm.datetime).toISOString(),
        repeat: appointmentForm.repeat,
        repeat_until: appointmentForm.repeat_until || null,
      };
      if (editingAppointmentId) {
        await api.updateAppointment(editingAppointmentId, payload);
      } else {
        await api.createAppointment(payload);
      }
      setAppointmentForm(defaultAppointment);
      setEditingAppointmentId(null);
      await load();
      setMessage("Appointment saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save appointment");
    } finally {
      setSaving(false);
    }
  };

  const submitPrescription = async () => {
    if (!patient) return;
    if (!prescriptionForm.medication || !prescriptionForm.dosage || !prescriptionForm.refill_on) {
      setError("Medication, dosage, and refill date are required");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload: Partial<Prescription> = {
        patient_id: patient.id,
        medication: prescriptionForm.medication,
        dosage: prescriptionForm.dosage,
        quantity: Number(prescriptionForm.quantity),
        refill_on: prescriptionForm.refill_on,
        refill_schedule: prescriptionForm.refill_schedule,
      };
      if (editingPrescriptionId) {
        await api.updatePrescription(editingPrescriptionId, payload);
      } else {
        await api.createPrescription(payload);
      }
      setPrescriptionForm(defaultPrescription);
      setEditingPrescriptionId(null);
      await load();
      setMessage("Prescription saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save prescription");
    } finally {
      setSaving(false);
    }
  };

  const removeAppointment = async (id: number) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.deleteAppointment(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete appointment");
    } finally {
      setSaving(false);
    }
  };

  const removePrescription = async (id: number) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.deletePrescription(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete prescription");
    } finally {
      setSaving(false);
    }
  };

  const startEditAppointment = (appt: Appointment) => {
    setEditingAppointmentId(appt.id);
    setAppointmentForm({
      provider: appt.provider,
      datetime: toInputDate(appt.datetime),
      repeat: appt.repeat,
      repeat_until: appt.repeat_until ? appt.repeat_until.slice(0, 10) : "",
    });
  };

  const startEditPrescription = (rx: Prescription) => {
    setEditingPrescriptionId(rx.id);
    setPrescriptionForm({
      medication: rx.medication,
      dosage: rx.dosage,
      quantity: rx.quantity,
      refill_on: rx.refill_on,
      refill_schedule: rx.refill_schedule,
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink">Loading…</div>
    );
  }

  if (invalidId) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink">
        Invalid patient id.
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink">Patient not found.</div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.push("/admin")}
          className="rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink hover:bg-ink/5"
        >
          ← Back
        </button>
        <div>
          <p className="text-sm font-semibold text-ink/70">Patient profile</p>
          <h1 className="text-3xl font-semibold text-night">{patient.name}</h1>
        </div>
        <Link href="/" className="rounded-full bg-night px-3 py-2 text-xs font-semibold text-white">Portal</Link>
      </div>

      {(error || message) && (
        <div className="mb-6 flex flex-col gap-2">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl border border-mint text-sm px-3 py-2 text-night" style={{ background: "#e8fff1" }}>
              {message}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="glass card-border rounded-3xl p-6 lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink/70">Patient core data</p>
              <h2 className="text-xl font-semibold text-night">Demographics & access</h2>
            </div>
            <span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-semibold text-ocean">
              ID {patient.id}
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              Name
              <input
                value={patientForm.name}
                onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-night shadow-inner focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Email
              <input
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-night shadow-inner focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              New password
              <input
                type="password"
                value={patientForm.password}
                onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                placeholder="Leave blank to keep existing"
                className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-night shadow-inner focus:border-accent focus:outline-none"
              />
            </label>
            <div className="flex items-end justify-end">
              <button
                onClick={savePatient}
                disabled={saving}
                className="w-full rounded-xl bg-night px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-night/20 transition hover:-translate-y-px hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save patient"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-inner">
              <p className="text-sm font-semibold text-ink/70">Upcoming visits (14 days)</p>
              <div className="mt-2 space-y-2 text-sm">
                {upcoming.appointments.slice(0, 4).map(({ appointment, when }) => (
                  <div key={`${appointment.id}-${when.toISOString()}`} className="flex items-center justify-between rounded-xl bg-ink/5 px-3 py-2">
                    <div>
                      <p className="font-semibold text-night">{appointment.provider}</p>
                      <p className="text-xs text-ink/70">{formatDateTime(when)} · {appointment.repeat}</p>
                    </div>
                  </div>
                ))}
                {upcoming.appointments.length === 0 && (
                  <p className="rounded-xl bg-ink/5 px-3 py-2 text-ink/70">No visits in the next two weeks.</p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-inner">
              <p className="text-sm font-semibold text-ink/70">Refills (30 days)</p>
              <div className="mt-2 space-y-2 text-sm">
                {upcoming.refills.slice(0, 4).map(({ prescription, when }) => (
                  <div key={`${prescription.id}-${when.toISOString()}`} className="flex items-center justify-between rounded-xl bg-mint/40 px-3 py-2">
                    <div>
                      <p className="font-semibold text-night">{prescription.medication}</p>
                      <p className="text-xs text-ink/70">{formatDate(when)} · {prescription.refill_schedule}</p>
                    </div>
                  </div>
                ))}
                {upcoming.refills.length === 0 && (
                  <p className="rounded-xl bg-mint/30 px-3 py-2 text-ink/70">No refills queued.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass card-border rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink/70">Appointment</p>
                <h3 className="text-lg font-semibold text-night">{editingAppointmentId ? "Edit appointment" : "Add appointment"}</h3>
              </div>
              {editingAppointmentId && (
                <button
                  onClick={() => {
                    setEditingAppointmentId(null);
                    setAppointmentForm(defaultAppointment);
                  }}
                  className="text-xs font-semibold text-accent"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="mt-3 space-y-3 text-sm">
              <label className="block font-semibold text-ink">
                Provider
                <input
                  value={appointmentForm.provider}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, provider: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-inner focus:border-accent focus:outline-none"
                />
              </label>
              <label className="block font-semibold text-ink">
                Date & time
                <input
                  type="datetime-local"
                  value={appointmentForm.datetime}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, datetime: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-inner focus:border-accent focus:outline-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-semibold text-ink">
                  Repeat
                  <select
                    value={appointmentForm.repeat}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, repeat: e.target.value as Repeat })}
                    className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-inner focus:border-accent focus:outline-none"
                  >
                    <option value="none">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
                <label className="block font-semibold text-ink">
                  Repeat until (optional)
                  <input
                    type="date"
                    value={appointmentForm.repeat_until}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, repeat_until: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-inner focus:border-accent focus:outline-none"
                  />
                </label>
              </div>
              <button
                onClick={submitAppointment}
                disabled={saving}
                className="w-full rounded-xl bg-night px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-night/20 transition hover:-translate-y-px hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : editingAppointmentId ? "Update appointment" : "Create appointment"}
              </button>
            </div>
          </div>

          <div className="glass card-border rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink/70">Prescription</p>
                <h3 className="text-lg font-semibold text-night">{editingPrescriptionId ? "Edit prescription" : "Add prescription"}</h3>
              </div>
              {editingPrescriptionId && (
                <button
                  onClick={() => {
                    setEditingPrescriptionId(null);
                    setPrescriptionForm(defaultPrescription);
                  }}
                  className="text-xs font-semibold text-accent"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="mt-3 space-y-3 text-sm">
              <label className="block font-semibold text-ink">
                Medication
                <input
                  value={prescriptionForm.medication}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                  placeholder="Enter medication name"
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-inner focus:border-accent focus:outline-none"
                />
              </label>
              <label className="block font-semibold text-ink">
                Dosage
                <select
                  value={prescriptionForm.dosage}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-inner focus:border-accent focus:outline-none"
                >
                  <option value="">Select</option>
                  {catalog?.dosages.map((dose) => (
                    <option key={dose} value={dose}>
                      {dose}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-semibold text-ink">
                  Quantity
                  <input
                    type="number"
                    min={1}
                    value={prescriptionForm.quantity}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, quantity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-inner focus:border-accent focus:outline-none"
                  />
                </label>
                <label className="block font-semibold text-ink">
                  Refill schedule
                  <select
                    value={prescriptionForm.refill_schedule}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, refill_schedule: e.target.value as Repeat })}
                    className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-inner focus:border-accent focus:outline-none"
                  >
                    <option value="none">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
              </div>
              <label className="block font-semibold text-ink">
                Refill date
                <input
                  type="date"
                  value={prescriptionForm.refill_on}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, refill_on: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-inner focus:border-accent focus:outline-none"
                />
              </label>
              <button
                onClick={submitPrescription}
                disabled={saving}
                className="w-full rounded-xl bg-night px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-night/20 transition hover:-translate-y-px hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : editingPrescriptionId ? "Update prescription" : "Create prescription"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <RecordList
          title="Appointments"
          items={patient.appointments}
          onEdit={startEditAppointment}
          onDelete={removeAppointment}
        />
        <PrescriptionList
          title="Prescriptions"
          items={patient.prescriptions}
          onEdit={startEditPrescription}
          onDelete={removePrescription}
        />
      </div>
    </div>
  );
}

function RecordList({
  title,
  items,
  onEdit,
  onDelete,
}: {
  title: string;
  items: Appointment[];
  onEdit: (item: Appointment) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="glass card-border rounded-3xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-night">{title}</h3>
        <span className="text-xs font-semibold text-ink/70">{items.length} total</span>
      </div>
      <div className="space-y-3 text-sm">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/50 bg-white/80 px-4 py-3 shadow-inner">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-night">{item.provider}</p>
                <p className="text-xs text-ink/70">{formatDateTime(item.datetime)} · {item.repeat}</p>
              </div>
              <div className="flex gap-2 text-xs font-semibold">
                <button onClick={() => onEdit(item)} className="text-accent">Edit</button>
                <button onClick={() => onDelete(item.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-ink/70">No appointments yet.</p>}
      </div>
    </div>
  );
}

function PrescriptionList({
  title,
  items,
  onEdit,
  onDelete,
}: {
  title: string;
  items: Prescription[];
  onEdit: (item: Prescription) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="glass card-border rounded-3xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-night">{title}</h3>
        <span className="text-xs font-semibold text-ink/70">{items.length} total</span>
      </div>
      <div className="space-y-3 text-sm">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/50 bg-white/80 px-4 py-3 shadow-inner">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-night">{item.medication} ({item.dosage})</p>
                <p className="text-xs text-ink/70">Refill {formatDate(item.refill_on)} · {item.refill_schedule}</p>
              </div>
              <div className="flex gap-2 text-xs font-semibold">
                <button onClick={() => onEdit(item)} className="text-accent">Edit</button>
                <button onClick={() => onDelete(item.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-ink/70">No prescriptions yet.</p>}
      </div>
    </div>
  );
}

const toInputDate = (value: string) => {
  const dt = new Date(value);
  const iso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  return iso;
};

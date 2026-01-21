export type Repeat = "none" | "daily" | "weekly" | "monthly";

export type Patient = {
  id: number;
  name: string;
  email: string;
  date_of_birth?: string | null;
};

export type PatientSummary = Patient & {
  appointment_count: number;
  prescription_count: number;
};

export type Appointment = {
  id: number;
  patient_id: number;
  provider: string;
  datetime: string;
  repeat: Repeat;
  repeat_until?: string | null;
};

export type Prescription = {
  id: number;
  patient_id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refill_on: string;
  refill_schedule: Repeat;
};

export type PatientWithDetails = Patient & {
  appointments: Appointment[];
  prescriptions: Prescription[];
};

export type Catalog = {
  medications: string[];
  dosages: string[];
};

export type PortalSummary = {
  patient: PatientSummary;
  upcoming_appointments: Appointment[];
  upcoming_refills: Prescription[];
};

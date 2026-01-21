from __future__ import annotations

import calendar
import json
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from passlib.hash import pbkdf2_sha256
from sqlmodel import Session, select

from database import engine, get_session, init_db
from models import (
    Appointment,
    AppointmentCreate,
    AppointmentRead,
    AppointmentUpdate,
    Catalog,
    Patient,
    PatientCreate,
    PatientSummary,
    PatientUpdate,
    PatientWithDetails,
    LoginRequest,
    Prescription,
    PrescriptionCreate,
    PrescriptionRead,
    PrescriptionUpdate,
)

DATA_PATH = Path(__file__).parent / "data.json"
ALLOWED_REPEATS = {"none", "daily", "weekly", "monthly"}

app = FastAPI(title="Zealthy Mini EMR", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Netlify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    seed_from_file()


# Utility helpers

def parse_dt(raw: str) -> datetime:
    dt = datetime.fromisoformat(raw)
    return dt.replace(tzinfo=None)


def parse_date(raw: str) -> date:
    return date.fromisoformat(raw)


def ensure_repeat(value: Optional[str]) -> str:
    repeat = value or "none"
    if repeat not in ALLOWED_REPEATS:
        raise HTTPException(status_code=400, detail="Invalid repeat schedule")
    return repeat


def add_months(dt: datetime, months: int) -> datetime:
    month = dt.month - 1 + months
    year = dt.year + month // 12
    month = month % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    day = min(dt.day, last_day)
    return dt.replace(year=year, month=month, day=day)


def next_recurrence(dt: datetime, repeat: str) -> datetime:
    if repeat == "daily":
        return dt + timedelta(days=1)
    if repeat == "weekly":
        return dt + timedelta(weeks=1)
    if repeat == "monthly":
        return add_months(dt, 1)
    return dt


def generate_occurrences(
    start: datetime,
    repeat: str,
    repeat_until: Optional[date],
    window_days: int = 90,
) -> List[datetime]:
    repeat = ensure_repeat(repeat)
    now = datetime.utcnow()
    cutoff = now + timedelta(days=window_days)
    current = start

    occurrences: List[datetime] = []
    while current <= cutoff:
        if repeat_until and current.date() > repeat_until:
            break
        if current >= now:
            occurrences.append(current)
        if repeat == "none":
            break
        current = next_recurrence(current, repeat)
    return occurrences


def upcoming_dates(
    start_date: date, repeat: str, repeat_until: Optional[date], window_days: int = 90
) -> List[date]:
    dates: List[date] = []
    start_dt = datetime.combine(start_date, datetime.min.time())
    for occurrence in generate_occurrences(start_dt, repeat, repeat_until, window_days):
        dates.append(occurrence.date())
    return dates


def seed_from_file() -> None:
    if not DATA_PATH.exists():
        return

    from sqlmodel import Session

    with Session(engine) as session:
        has_patients = session.exec(select(Patient)).first() is not None
        if has_patients:
            return

        payload = json.loads(DATA_PATH.read_text())

        for user in payload.get("users", []):
            patient = Patient(
                id=user.get("id"),
                name=user["name"],
                email=user["email"],
                password_hash=pbkdf2_sha256.hash(user["password"]),
            )
            session.add(patient)
            session.flush()

            for appt in user.get("appointments", []):
                session.add(
                    Appointment(
                        id=appt.get("id"),
                        patient_id=patient.id,
                        provider=appt["provider"],
                        datetime=parse_dt(appt["datetime"]),
                        repeat=ensure_repeat(appt.get("repeat")),
                    )
                )

            for rx in user.get("prescriptions", []):
                session.add(
                    Prescription(
                        id=rx.get("id"),
                        patient_id=patient.id,
                        medication=rx["medication"],
                        dosage=rx["dosage"],
                        quantity=rx["quantity"],
                        refill_on=parse_date(rx["refill_on"]),
                        refill_schedule=ensure_repeat(rx.get("refill_schedule")),
                    )
                )

        session.commit()


# Routes


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/catalog", response_model=Catalog)
def catalog() -> Catalog:
    if not DATA_PATH.exists():
        raise HTTPException(status_code=500, detail="Catalog missing")
    payload = json.loads(DATA_PATH.read_text())
    return Catalog(medications=payload.get("medications", []), dosages=payload.get("dosages", []))


@app.post("/auth/login", response_model=PatientWithDetails)
def login(credentials: LoginRequest, session: Session = Depends(get_session)) -> PatientWithDetails:
    patient = session.exec(select(Patient).where(Patient.email == credentials.email)).first()
    if not patient or not pbkdf2_sha256.verify(credentials.password, patient.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return build_patient_details(patient, session)


@app.get("/patients", response_model=List[PatientSummary])
def list_patients(session: Session = Depends(get_session)) -> List[PatientSummary]:
    patients = session.exec(select(Patient)).all()
    summaries: List[PatientSummary] = []
    for patient in patients:
        appointment_rows = session.exec(
            select(Appointment).where(Appointment.patient_id == patient.id)
        ).all()
        prescription_rows = session.exec(
            select(Prescription).where(Prescription.patient_id == patient.id)
        ).all()
        summaries.append(
            PatientSummary(
                id=patient.id,
                name=patient.name,
                email=patient.email,
                date_of_birth=patient.date_of_birth,
                appointment_count=len(appointment_rows),
                prescription_count=len(prescription_rows),
            )
        )
    return summaries


@app.post("/patients", response_model=PatientWithDetails, status_code=201)
def create_patient(payload: PatientCreate, session: Session = Depends(get_session)) -> PatientWithDetails:
    existing = session.exec(select(Patient).where(Patient.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    patient = Patient(
        name=payload.name,
        email=payload.email,
        date_of_birth=payload.date_of_birth,
        password_hash=pbkdf2_sha256.hash(payload.password),
    )
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return build_patient_details(patient, session)


@app.get("/patients/{patient_id}", response_model=PatientWithDetails)
def get_patient(patient_id: int, session: Session = Depends(get_session)) -> PatientWithDetails:
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return build_patient_details(patient, session)


@app.patch("/patients/{patient_id}", response_model=PatientWithDetails)
def update_patient(
    patient_id: int, payload: PatientUpdate, session: Session = Depends(get_session)
) -> PatientWithDetails:
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if payload.name:
        patient.name = payload.name
    if payload.email:
        other = session.exec(select(Patient).where(Patient.email == payload.email, Patient.id != patient_id)).first()
        if other:
            raise HTTPException(status_code=400, detail="Email already exists")
        patient.email = payload.email
    if payload.date_of_birth:
        patient.date_of_birth = payload.date_of_birth
    if payload.password:
        patient.password_hash = pbkdf2_sha256.hash(payload.password)

    session.add(patient)
    session.commit()
    session.refresh(patient)
    return build_patient_details(patient, session)


@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, session: Session = Depends(get_session)):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Remove related rows first to satisfy FK constraints
    session.exec(
        select(Appointment).where(Appointment.patient_id == patient_id)
    ).unique().all()
    for appt in session.exec(select(Appointment).where(Appointment.patient_id == patient_id)):
        session.delete(appt)
    for rx in session.exec(select(Prescription).where(Prescription.patient_id == patient_id)):
        session.delete(rx)

    session.delete(patient)
    session.commit()
    return {"status": "deleted"}


@app.get("/patients/{patient_id}/summary")
def patient_summary(patient_id: int, days: int = 7, session: Session = Depends(get_session)):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    appointments = session.exec(select(Appointment).where(Appointment.patient_id == patient.id)).all()
    prescriptions = session.exec(select(Prescription).where(Prescription.patient_id == patient.id)).all()

    upcoming_appts = []
    for appt in appointments:
        occurrences = generate_occurrences(appt.datetime, appt.repeat, appt.repeat_until, days)
        if occurrences:
            upcoming_appts.append(appt)

    upcoming_refills = []
    for rx in prescriptions:
        dates = upcoming_dates(rx.refill_on, rx.refill_schedule, None, days)
        if dates:
            upcoming_refills.append(rx)

    return {
        "patient": PatientSummary(
            id=patient.id,
            name=patient.name,
            email=patient.email,
            date_of_birth=patient.date_of_birth,
            appointment_count=len(appointments),
            prescription_count=len(prescriptions),
        ),
        "upcoming_appointments": upcoming_appts,
        "upcoming_refills": upcoming_refills,
    }


# Appointment endpoints


@app.post("/appointments", response_model=AppointmentRead, status_code=201)
def create_appointment(
    payload: AppointmentCreate, session: Session = Depends(get_session)
) -> AppointmentRead:
    ensure_repeat(payload.repeat)
    patient = session.get(Patient, payload.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    appointment = Appointment(**payload.dict())
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment


@app.put("/appointments/{appointment_id}", response_model=AppointmentRead)
def update_appointment(
    appointment_id: int, payload: AppointmentUpdate, session: Session = Depends(get_session)
) -> AppointmentRead:
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if payload.provider is not None:
        appointment.provider = payload.provider
    if payload.datetime is not None:
        appointment.datetime = payload.datetime
    if payload.repeat is not None:
        appointment.repeat = ensure_repeat(payload.repeat)
    if payload.repeat_until is not None:
        appointment.repeat_until = payload.repeat_until

    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment


@app.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, session: Session = Depends(get_session)):
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    session.delete(appointment)
    session.commit()
    return {"status": "deleted"}


# Prescription endpoints


@app.post("/prescriptions", response_model=PrescriptionRead, status_code=201)
def create_prescription(
    payload: PrescriptionCreate, session: Session = Depends(get_session)
) -> PrescriptionRead:
    ensure_repeat(payload.refill_schedule)
    patient = session.get(Patient, payload.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    prescription = Prescription(**payload.dict())
    session.add(prescription)
    session.commit()
    session.refresh(prescription)
    return prescription


@app.put("/prescriptions/{prescription_id}", response_model=PrescriptionRead)
def update_prescription(
    prescription_id: int, payload: PrescriptionUpdate, session: Session = Depends(get_session)
) -> PrescriptionRead:
    prescription = session.get(Prescription, prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    if payload.medication is not None:
        prescription.medication = payload.medication
    if payload.dosage is not None:
        prescription.dosage = payload.dosage
    if payload.quantity is not None:
        prescription.quantity = payload.quantity
    if payload.refill_on is not None:
        prescription.refill_on = payload.refill_on
    if payload.refill_schedule is not None:
        prescription.refill_schedule = ensure_repeat(payload.refill_schedule)

    session.add(prescription)
    session.commit()
    session.refresh(prescription)
    return prescription


@app.delete("/prescriptions/{prescription_id}")
def delete_prescription(
    prescription_id: int, session: Session = Depends(get_session)
):
    prescription = session.get(Prescription, prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    session.delete(prescription)
    session.commit()
    return {"status": "deleted"}


def build_patient_details(patient: Patient, session: Session) -> PatientWithDetails:
    appointments = session.exec(select(Appointment).where(Appointment.patient_id == patient.id)).all()
    prescriptions = session.exec(select(Prescription).where(Prescription.patient_id == patient.id)).all()

    return PatientWithDetails(
        id=patient.id,
        name=patient.name,
        email=patient.email,
        date_of_birth=patient.date_of_birth,
        appointments=appointments,
        prescriptions=prescriptions,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

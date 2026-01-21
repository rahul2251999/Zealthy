from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from sqlmodel import Field, SQLModel


class PatientBase(SQLModel):
    name: str
    email: str
    date_of_birth: Optional[date] = None


class Patient(PatientBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str


class PatientCreate(PatientBase):
    password: str


class PatientUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[date] = None
    password: Optional[str] = None


class AppointmentBase(SQLModel):
    provider: str
    datetime: datetime
    repeat: str = "none"
    repeat_until: Optional[date] = None


class Appointment(AppointmentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")


class AppointmentCreate(AppointmentBase):
    patient_id: int


class AppointmentUpdate(SQLModel):
    provider: Optional[str] = None
    datetime: Optional[datetime] = None
    repeat: Optional[str] = None
    repeat_until: Optional[date] = None


class PrescriptionBase(SQLModel):
    medication: str
    dosage: str
    quantity: int
    refill_on: date
    refill_schedule: str = "none"


class Prescription(PrescriptionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")


class PrescriptionCreate(PrescriptionBase):
    patient_id: int


class PrescriptionUpdate(SQLModel):
    medication: Optional[str] = None
    dosage: Optional[str] = None
    quantity: Optional[int] = None
    refill_on: Optional[date] = None
    refill_schedule: Optional[str] = None


class PatientRead(PatientBase):
    id: int


class AppointmentRead(AppointmentBase):
    id: int
    patient_id: int


class PrescriptionRead(PrescriptionBase):
    id: int
    patient_id: int


class PatientWithDetails(PatientRead):
    appointments: List[AppointmentRead] = Field(default_factory=list)
    prescriptions: List[PrescriptionRead] = Field(default_factory=list)


class PatientSummary(PatientRead):
    appointment_count: int
    prescription_count: int


class Catalog(SQLModel):
    medications: List[str]
    dosages: List[str]


class LoginRequest(SQLModel):
    email: str
    password: str

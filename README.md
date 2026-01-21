# Zealthy Mini EMR & Patient Portal

A small full-stack exercise featuring a provider-facing mini-EMR (no auth) and a patient portal. Built with FastAPI + SQLite for the backend (Python) and Next.js + Tailwind for the frontend.

## Running the backend (Python/FastAPI)
1. `cd server`
2. (Optional) create a venv: `python3 -m venv .venv && source .venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Start the API: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

On first boot the API seeds `db.sqlite3` from `data.json` (patients, appointments, prescriptions) and exposes CORS for the Next.js client.

## Running the frontend (Next.js)
1. `cd client`
2. Install deps (already done via scaffold, but run if needed): `npm install`
3. Copy env: `cp .env.local.example .env.local` and adjust `NEXT_PUBLIC_API_BASE_URL` if your API runs elsewhere.
4. `npm run dev` and open `http://localhost:3000`.

## App structure
- `/` patient portal with login and upcoming summary (7-day focus) plus 3-month schedule.
- `/admin` mini-EMR table of patients and quick create form.
- `/admin/[id]` patient detail for CRUD on appointments and prescriptions + edit patient data.

## Notes
- Passwords are hashed with bcrypt on the backend for this exercise.
- Appointment/prescription repeat rules supported: none, daily, weekly, monthly with optional end date for appointments. Frontend generates schedules up to 3 months; backend exposes a 7-day summary endpoint.
- Seed data lives in `server/data.json` (medication + dosage catalogs also exposed via `/catalog`).
# Zealthy

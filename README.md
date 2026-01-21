# Zealthy Mini EMR & Patient Portal

A full-stack mini-EMR and patient portal. Providers manage patients, appointments, and prescriptions via `/admin`; patients log in at `/` to see upcoming appointments/refills and drill into schedules. Backend: FastAPI + SQLite. Frontend: Next.js + Tailwind.

## Run locally

Backend (FastAPI)
1) `cd server`
2) (Optional) `python3 -m venv .venv && source .venv/bin/activate`
3) `pip install -r requirements.txt`
4) `uvicorn main:app --reload --host 127.0.0.1 --port 8000`
   - Seeds `db.sqlite3` from `data.json` on first start (patients, appointments, prescriptions, catalog).

Frontend (Next.js)
1) `cd client`
2) `npm install`
3) `cp .env.local.example .env.local` and set `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
4) `npm run dev` and open `http://127.0.0.1:3000`

## Key paths
- `/` patient portal: login, 7-day summary, 3-month appointment/refill drill-down.
- `/admin` patient roster + create form.
- `/admin/[id]` patient detail: edit patient, CRUD appointments, CRUD prescriptions (free-text medication).

## Notes
- Passwords hashed with PBKDF2 for the exercise.
- Repeat rules: none/daily/weekly/monthly with optional end date on appointments; frontend expands 3 months.
- Seed/catalog from `server/data.json`; meds/dosages exposed at `/catalog`.

# Deployment Guide

## Frontend (Netlify)

### Setup Steps:

1. **Connect Repository to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository: `rahul2251999/Zealthy`
   - Netlify will auto-detect the `netlify.toml` configuration

2. **Configure Build Settings:**
   - Base directory: `client` (should be auto-detected)
   - Build command: `npm install && npm run build` (should be auto-detected)
   - Publish directory: `client/.next` (should be auto-detected)

3. **Set Environment Variables:**
   - Go to Site settings → Environment variables
   - Add: `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend.onrender.com`
     (Replace with your actual Render backend URL after deploying)

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will build and deploy automatically

## Backend (Render)

### Setup Steps:

1. **Create Render Account:**
   - Go to [Render](https://render.com)
   - Sign up/login with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `rahul2251999/Zealthy`
   - Select the repository

3. **Configure Service:**
   - **Name:** `zealthy-backend`
   - **Environment:** `Python 3`
   - **Build Command:** `cd server && pip install -r requirements.txt`
   - **Start Command:** `cd server && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

4. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your backend URL will be: `https://zealthy-backend.onrender.com` (or similar)

5. **Update Frontend:**
   - Go back to Netlify
   - Update `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL
   - Trigger a new deploy

## Alternative: Railway (Backend)

If you prefer Railway:

1. Go to [Railway](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add service → Select `server` directory
5. Railway auto-detects Python and deploys
6. Get the URL and update Netlify environment variable

## Quick Deploy Commands

### Local Testing:
```bash
# Backend
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd client
npm install
npm run dev
```

## Troubleshooting

- **CORS errors:** Backend already has CORS enabled for all origins
- **Build fails:** Check Netlify build logs
- **Backend not responding:** Check Render service logs
- **Environment variables:** Make sure `NEXT_PUBLIC_API_BASE_URL` is set in Netlify

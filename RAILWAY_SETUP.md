# Railway Setup - Backend + Frontend

This guide will help you deploy both backend and frontend on Railway.

## Current Setup

- **Backend Service:** `zealthy-backend` (already deployed)
- **Backend URL:** `https://zealthy-backend-production.up.railway.app`
- **Frontend Service:** To be created

## Step 1: Add Frontend Service to Railway

1. Go to your Railway project dashboard
2. Click **"+ New"** → **"GitHub Repo"** (or **"Empty Service"** if you want to add from existing project)
3. If adding from existing project:
   - Click **"+ New"** → **"GitHub Repo"**
   - Select repository: `rahul2251999/Zealthy`
   - Railway will detect it's a monorepo

## Step 2: Configure Frontend Service

### Option A: Using Docker (Recommended)

1. **Select the service** you just created (or create a new one)
2. Go to **Settings** → **Source**
3. Set **Root Directory:** `client`
4. Go to **Settings** → **Deploy**
5. Set **Dockerfile Path:** `Dockerfile` (it will look in the `client` directory)
6. Railway will automatically detect and use `client/Dockerfile`

### Option B: Using Nixpacks (Auto-detect)

1. **Select the service**
2. Go to **Settings** → **Source**
3. Set **Root Directory:** `client`
4. Railway will auto-detect Next.js and build it
5. Set **Start Command:** `npm start` (or Railway will auto-detect)

## Step 3: Configure Environment Variables

### For Frontend Service:

1. Go to your **Frontend Service** → **Variables** tab
2. Add the following environment variable:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://zealthy-backend-production.up.railway.app`
   - (Or use Railway's service reference: `${{zealthy-backend.RAILWAY_PUBLIC_DOMAIN}}` if both services are in the same project)

### For Backend Service:

Make sure these are set (if needed):
- `DB_PATH=/data/db.sqlite3` (optional, for custom DB path)
- `PORT` (Railway sets this automatically)

## Step 4: Deploy

1. Railway will automatically detect changes and deploy
2. Or manually trigger: **Deployments** → **Redeploy**

## Step 5: Get Your Frontend URL

1. Go to your **Frontend Service** → **Settings** → **Networking**
2. Click **"Generate Domain"** to get a public URL
3. Your frontend will be live at: `https://your-frontend-name.up.railway.app`

## Service Reference (Advanced)

If both services are in the same Railway project, you can use service references:

- In Frontend service, set: `NEXT_PUBLIC_API_BASE_URL=${{zealthy-backend.RAILWAY_PUBLIC_DOMAIN}}`
- This automatically uses the backend's public domain

## Troubleshooting

### Backend 502 Error
- Check **Deploy Logs** in Railway
- Verify the Dockerfile CMD is correct
- Check that PORT environment variable is being used

### Frontend Build Fails
- Check that Root Directory is set to `client`
- Verify `package.json` exists in `client/` directory
- Check build logs for specific errors

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Check that backend service is running and accessible
- Verify CORS is enabled on backend (it already is)

### Port Issues
- Railway automatically sets `PORT` environment variable
- Frontend should listen on `0.0.0.0:${PORT}`
- Backend should listen on `0.0.0.0:${PORT}`

## Quick Commands Reference

### Check Backend Health
```bash
curl https://zealthy-backend-production.up.railway.app/health
```

### Check Backend API Docs
```bash
curl https://zealthy-backend-production.up.railway.app/docs
```

## Architecture

```
Railway Project
├── zealthy-backend (Service 1)
│   ├── Root: server/ (or uses root Dockerfile)
│   ├── Dockerfile: ./Dockerfile
│   └── URL: https://zealthy-backend-production.up.railway.app
│
└── zealthy-frontend (Service 2)
    ├── Root: client/
    ├── Dockerfile: client/Dockerfile
    ├── Env: NEXT_PUBLIC_API_BASE_URL=https://zealthy-backend-production.up.railway.app
    └── URL: https://zealthy-frontend-production.up.railway.app
```

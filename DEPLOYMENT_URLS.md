# Deployment URLs

## Backend (Railway)
- **URL:** `https://zealthy-backend-production.up.railway.app`
- **Status:** ⚠️ Currently returning 502 (application not responding)
- **Health Check:** `https://zealthy-backend-production.up.railway.app/health`
- **API Docs:** `https://zealthy-backend-production.up.railway.app/docs`

## Frontend (To be deployed)
- **Platform:** Vercel or Netlify
- **Backend API URL:** `https://zealthy-backend-production.up.railway.app`
- **Environment Variable:** `NEXT_PUBLIC_API_BASE_URL=https://zealthy-backend-production.up.railway.app`

## Quick Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Import repository: `rahul2251999/Zealthy`
3. Set Root Directory: `client`
4. Add Environment Variable:
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://zealthy-backend-production.up.railway.app`
5. Deploy

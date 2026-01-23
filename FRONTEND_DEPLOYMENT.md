# Frontend Deployment Guide

Your backend is deployed on Railway. Now you need to deploy the frontend and connect it to your Railway backend.

## Option 1: Deploy to Vercel (Recommended - Easiest for Next.js)

### Steps:

1. **Go to [Vercel](https://vercel.com)**
   - Sign up/login with GitHub
   - Click "Add New Project"

2. **Import Your Repository**
   - Select `rahul2251999/Zealthy`
   - Vercel will auto-detect Next.js

3. **Configure Project Settings**
   - **Root Directory:** `client` (click "Edit" and set to `client`)
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

4. **Set Environment Variable**
   - Go to "Environment Variables"
   - Add: `NEXT_PUBLIC_API_BASE_URL`
   - Value: Your Railway backend URL (e.g., `https://zealthy-backend-production.up.railway.app`)
   - Apply to: Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Your frontend will be live at: `https://your-project.vercel.app`

## Option 2: Deploy to Netlify

### Steps:

1. **Go to [Netlify](https://app.netlify.com)**
   - Sign up/login with GitHub
   - Click "Add new site" → "Import an existing project"

2. **Connect Repository**
   - Select `rahul2251999/Zealthy`
   - Netlify will detect `netlify.toml`

3. **Configure Build Settings**
   - **Base directory:** `client`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `.next`

4. **Set Environment Variable**
   - Go to Site settings → Environment variables
   - Add: `NEXT_PUBLIC_API_BASE_URL`
   - Value: Your Railway backend URL (e.g., `https://zealthy-backend-production.up.railway.app`)

5. **Deploy**
   - Click "Deploy site"
   - Your frontend will be live

## Finding Your Railway Backend URL

1. Go to your Railway project dashboard
2. Click on your `zealthy-backend` service
3. Go to the "Settings" tab
4. Find your "Public Domain" or check the "Deployments" tab for the URL
5. It should look like: `https://zealthy-backend-production.up.railway.app`

## Important Notes

- Make sure your Railway backend has CORS enabled (it already does - allows all origins)
- The backend URL should NOT have a trailing slash
- After deployment, test the frontend to ensure it can connect to the backend
- If you see CORS errors, check that your Railway backend is running and accessible

## Quick Test

After deployment, visit your frontend URL and:
1. Try to log in (if you have test credentials)
2. Check the browser console for any API errors
3. Verify network requests are going to your Railway backend URL

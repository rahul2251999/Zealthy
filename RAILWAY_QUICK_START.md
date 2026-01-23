# Quick Start: Deploy Frontend on Railway

## Your Backend is Already Deployed
- **Backend URL:** `https://zealthy-backend-production.up.railway.app`
- **Service Name:** `zealthy-backend`

## Add Frontend Service (5 minutes)

### Step 1: Add New Service
1. Go to your Railway project: https://railway.app
2. Click **"+ New"** button
3. Select **"GitHub Repo"**
4. Choose repository: `rahul2251999/Zealthy`
5. Railway will ask which service - this creates a new service

### Step 2: Configure Frontend Service
1. **Rename the service** (optional): Click service name → rename to `zealthy-frontend`

2. **Set Root Directory:**
   - Go to **Settings** → **Source**
   - Set **Root Directory:** `client`
   - Click **Save**

3. **Choose Build Method:**
   
   **Option A: Docker (Recommended)**
   - Go to **Settings** → **Deploy**
   - Railway will auto-detect `client/Dockerfile`
   - Or manually set: **Dockerfile Path:** `Dockerfile`
   
   **Option B: Nixpacks (Auto-detect)**
   - Railway will auto-detect Next.js
   - No additional config needed

### Step 3: Set Environment Variable
1. Go to **Variables** tab
2. Click **"+ New Variable"**
3. Add:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://zealthy-backend-production.up.railway.app`
4. Click **Add**

### Step 4: Generate Public Domain
1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Railway will create a public URL like: `https://zealthy-frontend-production.up.railway.app`

### Step 5: Deploy
- Railway will automatically deploy when you push to GitHub
- Or manually: Go to **Deployments** → Click **"Redeploy"**

## That's It! 🎉

Your frontend will be live at the Railway-generated URL.

## Test Your App

1. Visit your frontend URL
2. You should see the Patient Portal login page
3. Try logging in with test credentials

## Troubleshooting

**Build fails?**
- Check **Deploy Logs** tab
- Verify Root Directory is set to `client`
- Make sure `package.json` exists in `client/`

**Can't connect to backend?**
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Check backend is running (visit backend URL in browser)
- Check browser console for errors

**Port errors?**
- Railway sets PORT automatically
- Next.js should handle it, but check logs if issues persist

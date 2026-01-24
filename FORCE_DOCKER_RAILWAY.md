# Force Railway to Use Docker Instead of Railpack

Railway is currently using Railpack (buildpack) instead of Docker. Here's how to fix it:

## Option 1: Configure Service Settings (Recommended)

1. **Go to Railway Dashboard:**
   - Open your project: https://railway.app
   - Click on `zealthy-backend` service

2. **Go to Settings → Deploy:**
   - Find **"Build Command"** section
   - Set **"Builder"** to **"Dockerfile"**
   - Set **"Dockerfile Path"** to `Dockerfile` (or leave empty if Dockerfile is in root)
   - Click **"Save"**

3. **Alternative: Go to Settings → Source:**
   - Make sure **"Root Directory"** is empty or `/` (not `server`)
   - Railway should detect the root `Dockerfile`

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"Redeploy"** or wait for auto-deploy

## Option 2: Delete and Recreate Service

If Option 1 doesn't work:

1. **Delete the current service** (or create a new one)
2. **Add new service** → **"GitHub Repo"**
3. **Select repository:** `rahul2251999/Zealthy`
4. **In service settings:**
   - **Root Directory:** Leave empty (root `/`)
   - **Deploy → Builder:** Select **"Dockerfile"**
   - **Dockerfile Path:** `Dockerfile`
5. **Deploy**

## Option 3: Use Railpack (Current Setup)

If you want to use Railpack instead of Docker, the `nixpacks.toml` has been updated to work properly. Railway should use it automatically.

## Verify Docker is Being Used

After configuring, check the deploy logs. You should see:
- `Docker build` instead of `Railpack`
- Docker build steps instead of buildpack steps

## Current Issue

Railway is trying to:
- Run `pip install -r requirements.txt` from root (but requirements.txt is in `server/`)
- Find `start.sh` in root (but it's in `server/`)

The Dockerfile handles this correctly by copying from `server/` directory.

## Quick Fix

**In Railway Dashboard:**
1. Service → **Settings** → **Deploy**
2. Change **Builder** from "Railpack" to **"Dockerfile"**
3. Save and redeploy

# Fix Backend 502 Error on Railway

## Current Issue
Backend is returning 502 Bad Gateway, meaning the application isn't starting.

## Quick Fix Steps

### 1. Check Railway Logs
1. Go to Railway dashboard: https://railway.app
2. Open your project → `zealthy-backend` service
3. Click **"Deploy Logs"** tab
4. Look for error messages (Python errors, import errors, etc.)

### 2. Common Issues & Solutions

#### Issue A: Database Path Not Writable
**Solution:** The Dockerfile has been updated to use `/app/db.sqlite3` by default (writable location)

#### Issue B: PORT Variable
**Solution:** Railway sets PORT automatically. The CMD uses `${PORT:-8000}` which should work.

#### Issue C: Application Crash on Startup
**Check logs for:**
- Import errors
- Missing dependencies
- Database initialization errors
- File permission errors

### 3. Redeploy After Fix

After updating the Dockerfile:
1. Commit and push changes
2. Railway will auto-deploy
3. Or manually: **Deployments** → **Redeploy**

### 4. Verify Backend is Working

Test endpoints:
```bash
# Health check
curl https://zealthy-backend-production.up.railway.app/health

# Should return: {"status":"ok"}

# API docs
curl https://zealthy-backend-production.up.railway.app/docs

# Catalog
curl https://zealthy-backend-production.up.railway.app/catalog
```

### 5. If Still Not Working

**Option 1: Use Railway Volume (for persistent DB)**
1. Go to service → **Volumes** tab
2. Create volume: `/data`
3. Set environment variable: `DB_PATH=/data/db.sqlite3`

**Option 2: Check Railway Service Settings**
1. Verify **Root Directory** is correct (should be root `/` or empty)
2. Verify **Dockerfile Path** is `Dockerfile`
3. Check **Build Command** (should be auto-detected)

**Option 3: Review Logs for Specific Errors**
- Share the error message from Railway logs
- Common errors:
  - `ModuleNotFoundError` → Missing dependency
  - `Permission denied` → File system issue
  - `Address already in use` → Port conflict
  - `No such file or directory` → Path issue

## Updated Dockerfile Changes

The Dockerfile has been updated to:
- Remove hardcoded `DB_PATH=/data/db.sqlite3` (uses default `/app/db.sqlite3`)
- Ensure proper permissions
- Handle PORT variable correctly

## Next Steps

1. **Commit the updated Dockerfile:**
   ```bash
   git add Dockerfile
   git commit -m "Fix backend Dockerfile for Railway deployment"
   git push
   ```

2. **Wait for Railway to redeploy** (automatic)

3. **Check logs** to see if it starts successfully

4. **Test the endpoints** using the curl commands above

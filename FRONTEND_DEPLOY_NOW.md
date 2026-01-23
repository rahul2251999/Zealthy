# Deploy Frontend Now - Quick Guide

## Your Backend URL
```
https://zealthy-backend-production.up.railway.app
```

## Deploy to Vercel (5 minutes)

### Step-by-Step:

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select repository: `rahul2251999/Zealthy`
   - Click "Import"

3. **Configure Project**
   - Click "Edit" next to Root Directory
   - Change from `/` to `client`
   - Click "Continue"

4. **Add Environment Variable** (IMPORTANT!)
   - Before deploying, click "Environment Variables"
   - Add new variable:
     - **Name:** `NEXT_PUBLIC_API_BASE_URL`
     - **Value:** `https://zealthy-backend-production.up.railway.app`
     - **Environments:** Select all (Production, Preview, Development)
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your frontend will be live!

6. **Get Your Frontend URL**
   - After deployment, Vercel will show you the URL
   - It will look like: `https://zealthy-xyz.vercel.app`
   - This is your app link! 🎉

## Test Your App

1. Visit your Vercel frontend URL
2. You should see the Patient Portal login page
3. Try logging in with test credentials (check your backend data.json for seeded accounts)

## Troubleshooting

- **502 Error on Backend:** Check Railway logs - the backend might need to be restarted
- **CORS Errors:** Backend already has CORS enabled, but verify it's running
- **API Not Working:** Make sure `NEXT_PUBLIC_API_BASE_URL` is set correctly in Vercel

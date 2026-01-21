# Netlify Setup Instructions

## ⚠️ IMPORTANT: Clear Publish Directory in Netlify UI

The error occurs because there's a publish directory set in your Netlify UI that conflicts with the Next.js plugin.

### Fix Steps:

1. **Go to your Netlify site dashboard**
2. **Click "Site settings"** (gear icon)
3. **Go to "Build & deploy"** → **"Build settings"**
4. **Under "Publish directory"**, **DELETE/EMPTY** the value (leave it blank)
5. **Click "Save"**
6. **Trigger a new deploy**

The `@netlify/plugin-nextjs` plugin will automatically handle the publish directory - you don't need to set it manually.

## Alternative: Set in UI

If you prefer to set it in the UI instead:
- **Base directory:** `client`
- **Publish directory:** `client/.next` (relative to repo root)
- **Build command:** `npm install && npm run build`

But it's better to leave publish directory empty and let the plugin handle it.

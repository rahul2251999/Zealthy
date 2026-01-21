# ⚠️ REQUIRED: Enable GitHub Pages

**The workflow will fail until you complete this step!**

## Quick Setup (2 minutes)

### Step 1: Enable GitHub Pages
1. Go to: **https://github.com/rahul2251999/Zealthy/settings/pages**
2. Under **"Source"**, select: **"GitHub Actions"**
3. Click **"Save"**

### Step 2: Verify
- Go to the **Actions** tab
- You should see the workflow running
- Once it completes, your site will be at: `https://rahul2251999.github.io/Zealthy/`

## Why is this required?

GitHub requires repository owners to manually enable Pages for security reasons. The workflow cannot enable it automatically.

## Troubleshooting

If you still see errors after enabling:
1. Make sure you're the repository owner or have admin access
2. Check that **Settings → Actions → General → Workflow permissions** is set to **"Read and write permissions"**
3. Re-run the workflow manually: **Actions** → **Deploy to GitHub Pages** → **Run workflow**

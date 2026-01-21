# GitHub Pages Deployment

## Setup Instructions

### 1. Enable GitHub Pages
1. Go to your repository: https://github.com/rahul2251999/Zealthy
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select: **GitHub Actions**
4. Click **Save**

### 2. Set Environment Variables (Optional)
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add: `NEXT_PUBLIC_API_BASE_URL` = your backend API URL (e.g., `https://your-backend.herokuapp.com`)
4. If not set, it defaults to `http://localhost:8000` (for local development)

### 3. Configure Workflow Permissions
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - **Read and write permissions**
   - Check **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

### 4. Deploy
- The workflow runs automatically on push to `main`
- Or trigger manually: **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

Your site will be available at: `https://rahul2251999.github.io/Zealthy/`

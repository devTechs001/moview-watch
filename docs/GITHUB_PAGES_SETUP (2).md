
# 🚀 GitHub Pages Deployment Guide

## Prerequisites

1. GitHub repository created
2. Code pushed to GitHub
3. Node.js and npm installed

## Setup Steps

### 1. Install gh-pages Package

```bash
cd client
npm install --save-dev gh-pages
```

### 2. Update package.json

Add to `client/package.json`:

```json
{
  "name": "cinemaflix-client",
  "version": "1.0.0",
  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

### 3. Update vite.config.js

Add base URL for GitHub Pages:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/YOUR_REPO_NAME/', // Add this line
  server: {
    port: 5173,
  },
})
```

### 4. Create .nojekyll File

In `client/public/` directory, create `.nojekyll` file (empty file):

```bash
cd client/public
touch .nojekyll
```

This prevents GitHub from processing your site with Jekyll.

### 5. Update Router for GitHub Pages

In `client/src/main.jsx`, update BrowserRouter:

```javascript
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/YOUR_REPO_NAME">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

## Deployment Commands

### Deploy to GitHub Pages

```bash
cd client
npm run deploy
```

This will:
1. Build your app (`npm run build`)
2. Create/update `gh-pages` branch
3. Push built files to GitHub Pages

### Manual Deployment

```bash
# Build the app
npm run build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

## GitHub Repository Settings

1. Go to your GitHub repository
2. Click **Settings**
3. Scroll to **Pages** section
4. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

## Access Your Site

After deployment (takes 1-2 minutes):

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## Environment Variables

### For GitHub Pages

Create `.env.production` in `client/` directory:

```env
VITE_API_URL=https://your-backend-api.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_TMDB_API_KEY=your_tmdb_key
```

**Note:** GitHub Pages only serves static files. Your backend API must be hosted separately (Heroku, Railway, Vercel, etc.)

## Troubleshooting

### Issue: 404 on Refresh

**Solution:** Add `404.html` in `client/public/`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>CinemaFlix</title>
    <script>
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/YOUR_REPO_NAME'">
  </head>
  <body></body>
</html>
```

### Issue: Assets Not Loading

**Solution:** Ensure `base` in `vite.config.js` matches your repo name.

### Issue: API Calls Failing

**Solution:** Update API base URL in production:

```javascript
// client/src/lib/axios.js
const baseURL = import.meta.env.PROD 
  ? 'https://your-backend-api.com/api'
  : 'http://localhost:5000/api'

const axios = Axios.create({ baseURL })
```

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd client
        npm ci
        
    - name: Build
      run: |
        cd client
        npm run build
        
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./client/dist
```

## Custom Domain (Optional)

### Add Custom Domain

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. Add `CNAME` file in `client/public/`:
   ```
   yourdomain.com
   ```
3. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```
4. In GitHub Settings → Pages, add custom domain

## Backend Deployment

GitHub Pages only hosts frontend. Deploy backend separately:

### Option 1: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd server
railway init
railway up
```

### Option 2: Heroku
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
cd server
heroku create your-app-name

# Deploy
git push heroku main
```

### Option 3: Render
1. Go to render.com
2. Connect GitHub repo
3. Select `server` directory
4. Deploy

## Complete Deployment Checklist

### Frontend (GitHub Pages)
- [ ] Install gh-pages
- [ ] Update package.json homepage
- [ ] Update vite.config.js base
- [ ] Create .nojekyll file
- [ ] Update BrowserRouter basename
- [ ] Run `npm run deploy`
- [ ] Configure GitHub Pages settings
- [ ] Test deployed site

### Backend (Separate Hosting)
- [ ] Choose hosting platform
- [ ] Set environment variables
- [ ] Deploy backend
- [ ] Update frontend API URL
- [ ] Test API connections

### Post-Deployment
- [ ] Test all features
- [ ] Check console for errors
- [ ] Verify API calls work
- [ ] Test authentication
- [ ] Check mobile responsiveness
- [ ] Test on different browsers

## Quick Deploy Script

Create `deploy.sh` in root:

```bash
#!/bin/bash

echo "🚀 Deploying to GitHub Pages..."

cd client

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building app..."
npm run build

echo "📤 Deploying..."
npm run deploy

echo "✅ Deployment complete!"
echo "🌐 Visit: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
```

Make executable:
```bash
chmod +x deploy.sh
```

Run:
```bash
./deploy.sh
```

## Summary

1. **Install**: `npm install --save-dev gh-pages`
2. **Configure**: Update package.json, vite.config.js
3. **Deploy**: `npm run deploy`
4. **Access**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

Your frontend will be live on GitHub Pages! 🎉

**Remember:** Backend must be hosted separately (Railway, Heroku, Render, etc.)

# 🚀 Netlify Deployment Guide - Fixed

## Issue Fixed

### Error: Deploy directory 'dist' does not exist

**Problem:**
- Netlify was looking for `dist` in root directory
- Vite builds to `client/dist`
- Configuration mismatch caused deployment failure

**Solution:**
- Created `netlify.toml` in root directory
- Set `base = "client"` to specify build directory
- Set `publish = "client/dist"` for correct output path

---

## Deployment Steps

### 1. Prerequisites

✅ GitHub repository created and code pushed
✅ Netlify account created (https://netlify.com)
✅ Backend deployed separately (Railway, Render, Heroku, etc.)

### 2. Connect Repository to Netlify

**Option A: Netlify Dashboard**

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** (authorize if needed)
4. Select your repository: `movie-app`
5. Netlify will auto-detect settings from `netlify.toml`
6. Click **"Deploy site"**

**Option B: Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

### 3. Configure Environment Variables

In Netlify Dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```
VITE_API_URL = https://your-backend.railway.app/api
VITE_SOCKET_URL = https://your-backend.railway.app
VITE_TMDB_API_KEY = your_tmdb_api_key
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_your_stripe_key
```

**Important:** Replace with your actual backend URL and API keys

### 4. Trigger Deployment

**Automatic:**
- Push to main branch → Auto-deploys

**Manual:**
- Netlify Dashboard → **Deploys** → **Trigger deploy**

---

## Configuration Files

### netlify.toml (Root Directory)

```toml
[build]
  base = "client"              # Build from client folder
  command = "npm run build"    # Build command
  publish = "client/dist"      # Output directory
  
[build.environment]
  NODE_VERSION = "18"          # Node version

[[redirects]]
  from = "/*"                  # All routes
  to = "/index.html"           # Redirect to index
  status = 200                 # SPA routing
```

### Key Settings Explained

**`base = "client"`**
- Tells Netlify to run commands from `client` folder
- Fixes the "dist does not exist" error

**`publish = "client/dist"`**
- Path to built files (relative to repo root)
- Where Netlify serves files from

**`command = "npm run build"`**
- Runs Vite build
- Creates production bundle

**Redirects**
- Enables client-side routing
- All routes serve `index.html`
- React Router handles navigation

---

## Build Process

### What Happens During Build

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Run Build Command**
   ```bash
   npm run build
   ```

3. **Vite Build Output**
   ```
   client/dist/
   ├── index.html
   ├── assets/
   │   ├── index-[hash].js
   │   ├── index-[hash].css
   │   └── [other assets]
   └── [other files]
   ```

4. **Deploy to Netlify CDN**
   - Files uploaded to global CDN
   - Site becomes live

---

## Environment Variables

### Required Variables

**VITE_API_URL**
```
Production: https://your-backend.railway.app/api
Development: http://localhost:5000/api
```

**VITE_SOCKET_URL**
```
Production: https://your-backend.railway.app
Development: http://localhost:5000
```

**VITE_TMDB_API_KEY**
```
Get from: https://www.themoviedb.org/settings/api
```

**VITE_STRIPE_PUBLISHABLE_KEY** (Optional)
```
Get from: https://dashboard.stripe.com/apikeys
Use test key for testing: pk_test_...
Use live key for production: pk_live_...
```

### How to Set in Netlify

1. **Dashboard Method:**
   - Site settings → Environment variables
   - Click "Add a variable"
   - Enter key and value
   - Click "Create variable"

2. **CLI Method:**
   ```bash
   netlify env:set VITE_API_URL "https://your-backend.railway.app/api"
   netlify env:set VITE_SOCKET_URL "https://your-backend.railway.app"
   ```

---

## Troubleshooting

### Issue 1: Build Fails - "dist does not exist"

**Solution:**
✅ Ensure `netlify.toml` is in root directory
✅ Check `base = "client"` is set
✅ Verify `publish = "client/dist"`

### Issue 2: Build Fails - "npm: command not found"

**Solution:**
✅ Set `NODE_VERSION = "18"` in netlify.toml
✅ Or set in Netlify dashboard: Build settings → Environment

### Issue 3: 404 on Page Refresh

**Solution:**
✅ Add redirects in netlify.toml:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Issue 4: API Calls Fail

**Solution:**
✅ Set `VITE_API_URL` environment variable
✅ Ensure backend is deployed and running
✅ Check CORS settings on backend
✅ Verify backend URL is correct

### Issue 5: Environment Variables Not Working

**Solution:**
✅ Variables must start with `VITE_`
✅ Redeploy after adding variables
✅ Check variable names match code

### Issue 6: Build Takes Too Long

**Solution:**
✅ Check build logs for errors
✅ Optimize dependencies
✅ Use build plugins if needed

---

## Deployment Checklist

### Pre-Deployment

- [ ] Backend deployed and running
- [ ] Backend URL obtained
- [ ] TMDB API key obtained
- [ ] Code pushed to GitHub
- [ ] `netlify.toml` in root directory

### Netlify Setup

- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain added (optional)

### Post-Deployment

- [ ] Site builds successfully
- [ ] Site is accessible
- [ ] All pages load correctly
- [ ] API calls work
- [ ] Authentication works
- [ ] Images/assets load
- [ ] Mobile responsive
- [ ] Test on different browsers

---

## Custom Domain (Optional)

### Add Custom Domain

1. **Buy Domain** (Namecheap, GoDaddy, etc.)

2. **Add to Netlify:**
   - Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain: `yourdomain.com`

3. **Update DNS:**
   - Add Netlify nameservers to your domain registrar
   - Or add A record pointing to Netlify

4. **Enable HTTPS:**
   - Netlify auto-provisions SSL certificate
   - Free Let's Encrypt certificate

---

## Continuous Deployment

### Auto-Deploy on Git Push

**Setup:**
1. Connect GitHub repository
2. Choose branch (usually `main`)
3. Every push triggers deployment

**Branch Deploys:**
```
main → Production (yourdomain.com)
dev → Preview (dev--yoursite.netlify.app)
feature → Preview (feature--yoursite.netlify.app)
```

### Deploy Previews

- Every pull request gets preview URL
- Test before merging
- Automatic cleanup after merge

---

## Build Commands Reference

### Standard Build
```bash
npm run build
```

### Build with Environment
```bash
VITE_API_URL=https://api.example.com npm run build
```

### Preview Build Locally
```bash
npm run build
npm run preview
```

### Clean Build
```bash
rm -rf client/dist
npm run build
```

---

## Netlify Features

### Available Features

✅ **Continuous Deployment** - Auto-deploy on push
✅ **Branch Deploys** - Deploy multiple branches
✅ **Deploy Previews** - Preview PRs before merge
✅ **Instant Rollbacks** - Revert to previous deploy
✅ **Custom Domains** - Use your own domain
✅ **Free SSL** - HTTPS automatically
✅ **CDN** - Global content delivery
✅ **Forms** - Handle form submissions
✅ **Functions** - Serverless functions
✅ **Analytics** - Site analytics (paid)

---

## Performance Optimization

### Build Optimization

**1. Code Splitting**
```javascript
// Already configured in Vite
// Automatic code splitting
```

**2. Asset Optimization**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  }
}
```

**3. Image Optimization**
- Use WebP format
- Compress images
- Lazy load images

### Netlify Optimizations

**1. Enable Asset Optimization**
- Site settings → Build & deploy
- Post processing → Asset optimization
- Enable CSS, JS, and image optimization

**2. Enable Prerendering**
- For better SEO
- Faster initial load

---

## Monitoring

### Check Deployment Status

**Dashboard:**
- Deploys tab shows all deployments
- Green = Success
- Red = Failed
- Yellow = Building

**Build Logs:**
- Click on deployment
- View full build log
- Check for errors

**Analytics:**
- Site overview
- Bandwidth usage
- Deploy frequency

---

## Cost

### Free Tier Includes

✅ 100 GB bandwidth/month
✅ 300 build minutes/month
✅ Unlimited sites
✅ HTTPS
✅ Deploy previews
✅ Form submissions (100/month)

### Paid Plans

- **Pro:** $19/month
- **Business:** $99/month
- **Enterprise:** Custom pricing

---

## Quick Commands

### Deploy Commands

```bash
# Deploy to production
netlify deploy --prod

# Deploy preview
netlify deploy

# Open site
netlify open

# View logs
netlify logs

# Link existing site
netlify link
```

---

## Summary

### ✅ Fixed Configuration

**Root `netlify.toml`:**
```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "client/dist"
```

### ✅ Deployment Steps

1. Push code to GitHub
2. Connect to Netlify
3. Set environment variables
4. Deploy automatically

### ✅ Your Site Will Be Live At

```
https://your-site-name.netlify.app
```

Or with custom domain:
```
https://yourdomain.com
```

---

## Next Steps

1. **Deploy Backend** (if not done)
   - Railway, Render, or Heroku
   - Get backend URL

2. **Set Environment Variables**
   - Add to Netlify dashboard
   - Include backend URL

3. **Push to GitHub**
   - Triggers automatic deployment

4. **Test Deployment**
   - Check all features work
   - Test API connections

5. **Add Custom Domain** (optional)
   - Configure DNS
   - Enable HTTPS

**Your frontend is ready to deploy!** 🚀

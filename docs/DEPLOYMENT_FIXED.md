# ✅ Netlify Deployment - FIXED

## Issue Resolved

**Error:** `Deploy directory 'dist' does not exist`

**Problem:** 
- Netlify was looking for `dist` in root (`/opt/build/repo/dist`)
- Build creates `client/dist`
- Path mismatch

**Solution:**
```toml
[build]
  base = "client"        # Build from client folder
  command = "npm run build"
  publish = "dist"       # Relative to base (client/dist)
```

---

## ✅ Correct Configuration

**File:** `netlify.toml` (in root)

```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Key Points:**
- `base = "client"` → Run commands from client folder
- `publish = "dist"` → Publish from client/dist (relative to base)
- `NODE_VERSION = "18"` → Use Node 18

---

## 🚀 Deploy Now

### 1. Commit and Push

```bash
git add netlify.toml
git commit -m "Fix Netlify deployment configuration"
git push origin main
```

### 2. Netlify Will Auto-Deploy

Build process:
```
1. cd client
2. npm install
3. npm run build
4. Deploy client/dist folder
```

### 3. Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables:

```
VITE_API_URL = https://your-backend.railway.app/api
VITE_SOCKET_URL = https://your-backend.railway.app
VITE_TMDB_API_KEY = your_tmdb_key
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_your_key
```

---

## 📊 Expected Build Output

```
1:56:05 AM: Build settings
1:56:05 AM:   Base directory: client
1:56:05 AM:   Build command: npm run build
1:56:05 AM:   Publish directory: client/dist
1:56:06 AM: Installing dependencies
1:56:10 AM: Dependencies installed
1:56:10 AM: Running build command
1:56:30 AM: Build complete
1:56:30 AM: Deploying to CDN
1:56:35 AM: Site is live!
```

---

## ✅ Deployment Checklist

- [x] netlify.toml in root
- [x] base = "client"
- [x] publish = "dist" (relative)
- [ ] Environment variables set
- [ ] Code pushed to GitHub
- [ ] Deployment triggered

---

## 🎉 Your Site Will Be Live At

```
https://your-site-name.netlify.app
```

**Next Steps:**
1. Push changes to GitHub
2. Wait for auto-deploy (2-3 minutes)
3. Set environment variables
4. Test your live site!

---

## 🔧 If Build Still Fails

**Check Build Logs:**
1. Go to Netlify Dashboard
2. Click on failed deploy
3. View full build log

**Common Issues:**

**1. Dependencies fail:**
```bash
# Solution: Check package.json in client folder
cd client
npm install
```

**2. Build command fails:**
```bash
# Solution: Test locally
cd client
npm run build
```

**3. Environment variables:**
```bash
# Solution: Add in Netlify dashboard
# Must start with VITE_
```

---

## 📝 Summary

**Fixed Configuration:**
- ✅ Base directory set to "client"
- ✅ Publish path relative to base
- ✅ Redirects for SPA routing
- ✅ Node version specified

**Your deployment should now succeed!** 🚀

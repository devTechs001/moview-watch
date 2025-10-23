# Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Render (Recommended - Free Tier Available)
**Deploy Both Frontend & Backend Together**

1. **Push to GitHub** (Already Done ✅)
   ```bash
   https://github.com/devTechs001/moview-watch.git
   ```

2. **Deploy to Render**
   - Go to https://render.com
   - Sign up with GitHub
   - Click "New" → "Blueprint"
   - Connect your repository: `devTechs001/moview-watch`
   - Render will auto-detect `render.yaml`
   - Set environment variables:
     - `MONGODB_URI` - Your MongoDB Atlas connection string
     - `JWT_SECRET` - Random secure string
     - `TMDB_API_KEY` - Your TMDB API key
     - `CLIENT_URL` - Will be auto-generated URL
     - `VITE_API_URL` - https://your-api-url.onrender.com/api
     - `VITE_SOCKET_URL` - https://your-api-url.onrender.com
   - Click "Apply"

**Free Tier Notes:**
- Backend spins down after 15 min of inactivity
- First request may take 30-50 seconds to wake up
- Perfect for portfolio projects!

---

### Option 2: Netlify (Frontend) + Render (Backend)

#### Deploy Backend to Render
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Name:** cinemaflix-api
   - **Root Directory:** server
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add environment variables (see below)
6. Deploy!

#### Deploy Frontend to Netlify
1. Go to https://netlify.com
2. New site from Git
3. Connect GitHub repo
4. Settings:
   - **Base directory:** client
   - **Build command:** `npm run build`
   - **Publish directory:** client/dist
5. Environment variables:
   - `VITE_API_URL` - https://your-render-backend.onrender.com/api
   - `VITE_SOCKET_URL` - https://your-render-backend.onrender.com
6. Deploy!

---

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Deploy Backend to Railway
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Railway auto-detects Node.js
5. Settings:
   - **Root Directory:** server
   - **Start Command:** `npm start`
6. Add environment variables
7. Get your backend URL

#### Deploy Frontend to Vercel
1. Go to https://vercel.com
2. Import Git Repository
3. Select your repo
4. Settings:
   - **Root Directory:** client
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** dist
5. Environment variables:
   - `VITE_API_URL` - https://your-railway-backend.up.railway.app/api
   - `VITE_SOCKET_URL` - https://your-railway-backend.up.railway.app
6. Deploy!

---

## 🔧 Environment Variables Reference

### Backend Environment Variables
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinemaflix
JWT_SECRET=your_super_secure_random_string_here
JWT_EXPIRE=7d
TMDB_API_KEY=your_tmdb_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name (optional)
CLOUDINARY_API_KEY=your_cloudinary_key (optional)
CLOUDINARY_API_SECRET=your_cloudinary_secret (optional)
CLIENT_URL=https://your-frontend-url.netlify.app
```

### Frontend Environment Variables
```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

---

## 📝 Pre-Deployment Checklist

### 1. MongoDB Atlas Setup
- [ ] Create free cluster at https://www.mongodb.com/cloud/atlas
- [ ] Create database user
- [ ] Whitelist IP: `0.0.0.0/0` (allow from anywhere)
- [ ] Get connection string
- [ ] Test connection locally

### 2. TMDB API Key
- [ ] Get free API key from https://www.themoviedb.org/settings/api
- [ ] Test locally first

### 3. Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Update CORS Settings
In `server/server.js`, update CLIENT_URL to match your deployed frontend

---

## 🎯 Step-by-Step: Render Deployment (Easiest)

### Step 1: Prepare MongoDB
1. Go to https://mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Database Access → Add Database User
4. Network Access → Add IP Address → `0.0.0.0/0`
5. Copy connection string

### Step 2: Deploy to Render
1. Visit https://render.com/deploy
2. Sign up with GitHub
3. New → Blueprint
4. Connect repository: `devTechs001/moview-watch`
5. Render detects `render.yaml` automatically

### Step 3: Set Environment Variables
Click on your backend service → Environment:
```
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/cinemaflix
JWT_SECRET = (generate with crypto command above)
TMDB_API_KEY = your_tmdb_key
CLIENT_URL = https://your-frontend-name.onrender.com
```

Click on your frontend service → Environment:
```
VITE_API_URL = https://your-backend-name.onrender.com/api
VITE_SOCKET_URL = https://your-backend-name.onrender.com
```

### Step 4: Deploy!
- Click "Create Blueprint"
- Wait 5-10 minutes for both services to deploy
- Visit your frontend URL!

---

## 🌐 Custom Domain (Optional)

### Netlify Custom Domain
1. Netlify Dashboard → Domain Settings
2. Add custom domain
3. Update DNS records with your domain provider

### Render Custom Domain
1. Render Dashboard → Service → Settings → Custom Domain
2. Add domain
3. Update DNS CNAME record

---

## 🐛 Common Deployment Issues

### Issue: MongoDB Connection Failed
**Solution:** 
- Check connection string format
- Verify IP whitelist includes `0.0.0.0/0`
- Ensure username/password are URL encoded

### Issue: CORS Errors
**Solution:**
- Verify `CLIENT_URL` in backend matches frontend URL
- Check CORS settings in `server/server.js`

### Issue: Environment Variables Not Working
**Solution:**
- Ensure variable names match exactly (case-sensitive)
- Redeploy after changing env vars
- Check deployment logs

### Issue: Render Free Tier Spinning Down
**Solution:**
- Expected behavior for free tier
- Use a cron job to ping every 10 minutes (https://cron-job.org)
- Upgrade to paid tier for always-on

### Issue: Build Fails
**Solution:**
- Check Node version (should be 18+)
- Verify all dependencies in package.json
- Check deployment logs for specific errors

---

## 📊 Monitoring Your Deployment

### Render
- Dashboard shows real-time logs
- Metrics available for paid plans
- Auto-deploys on git push

### Netlify
- Deploy logs available
- Analytics in dashboard
- Auto-deploys on git push

---

## 🔄 Updating Your Deployed App

Once deployed, updates are automatic:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main
```

Both Render and Netlify will automatically redeploy! 🎉

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Portfolio)
- **Render:** Free (backend + frontend)
- **Netlify:** Free (frontend only)
- **MongoDB Atlas:** Free M0 cluster
- **TMDB API:** Free
- **Total:** $0/month ✨

### Paid Tier (For Production)
- **Render Pro:** $7/month (always-on backend)
- **Netlify Pro:** $19/month (advanced features)
- **MongoDB Atlas:** $9/month (M2 cluster)
- **Total:** ~$35/month

---

## 🎉 You're Ready to Deploy!

Choose your platform and follow the steps above. Render is recommended for the easiest setup with both frontend and backend together.

**Your app will be live at:**
- Frontend: `https://your-app-name.onrender.com`
- Backend API: `https://your-app-name-api.onrender.com`

Good luck! 🚀

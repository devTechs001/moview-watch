# How to Start the Application

## Quick Start Guide

### Step 1: Start Backend Server

Open a terminal and run:

```bash
cd c:\Users\Melanie\react-projects\movie-app\server
npm run dev
```

**You should see:**
```
🔧 Environment loaded from .env file
📍 NODE_ENV: development
🔌 PORT: 5000
🗄️  MongoDB URI: ✅ Loaded
🔑 JWT Secret: ✅ Loaded
✅ MongoDB Connected: cluster1-shard-00-00.1frrfrb.mongodb.net
Server running in development mode on port 5000
```

**Keep this terminal running!** ⚠️

---

### Step 2: Start Frontend (in a NEW terminal)

Open a **second terminal** and run:

```bash
cd c:\Users\Melanie\react-projects\movie-app\client
npm run dev
```

**You should see:**
```
VITE ready in Xms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Step 3: Open Browser

Open your browser and go to:
- **http://localhost:5173** (or 5174)

---

## Admin Login

```
📧 Email: devtechs842@gmail.com
🔑 Password: pass123
```

---

## Common Issues

### Issue: Backend not running
**Error:** `ERR_CONNECTION_REFUSED` on port 5000

**Solution:** Make sure terminal 1 is still running the backend:
```bash
cd server
npm run dev
```

### Issue: MongoDB connection failed
**Solution:** Check your `.env` file has correct `MONGODB_URI`

### Issue: Port already in use
**Solution:** Kill the process on that port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## Running Both at Once (Optional)

From the root directory:
```bash
npm run dev
```

This starts both frontend and backend together!

---

## Features to Test

✅ **Like Movies** - Click heart icon on movie cards  
✅ **Share Movies** - Click share icon to copy link  
✅ **Search** - Use search bar in navbar  
✅ **Social Feed** - Click users icon in navbar  
✅ **Stories** - Navigate to `/stories`  
✅ **Admin Dashboard** - Login as admin, access `/admin`  
✅ **AI Security** - Admin → AI Security dashboard  
✅ **Import Movies** - Admin → Import Movies (need TMDB key)  

---

## Stop the App

Press `Ctrl + C` in both terminals to stop the servers.

---

## Need Help?

- Backend issues: Check `ENV_SETUP_GUIDE.md`
- Deployment: Check `DEPLOYMENT_GUIDE.md`
- Features: Check `SOCIAL_AI_FEATURES.md`

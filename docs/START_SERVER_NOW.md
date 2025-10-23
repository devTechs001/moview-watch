# 🚨 CRITICAL: START SERVER NOW!

## ❌ ERROR: ERR_CONNECTION_REFUSED

**Your server is NOT running!** This is why you're seeing all the errors.

---

## ⚡ IMMEDIATE FIX (2 MINUTES)

### Step 1: Start MongoDB
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

**OR** Open MongoDB Compass and click "Connect"

### Step 2: Start Backend Server
```bash
# Open NEW terminal
cd c:\Users\Melanie\react-projects\movie-app\server
npm run dev
```

**Wait for:** `✅ Server running on port 5000`

### Step 3: Verify Client is Running
```bash
# Check if client is running on port 5173 or 5174
# If not, open NEW terminal:
cd c:\Users\Melanie\react-projects\movie-app\client
npm run dev
```

---

## ✅ WHAT SHOULD HAPPEN

### Terminal 1 (Server) should show:
```
🔧 Environment loaded from .env file
📍 NODE_ENV: development
🔌 PORT: 5000
🗄️  MongoDB URI: ✅ Loaded
🔑 JWT Secret: ✅ Loaded
✅ MongoDB Connected
✅ Server running on port 5000
```

### Terminal 2 (Client) should show:
```
VITE v7.1.11  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🔍 CHECK IF SERVERS ARE RUNNING

### Check Server:
Open browser: http://localhost:5000/api
Should see: `{"message":"CinemaFlix API is running"}`

### Check Client:
Open browser: http://localhost:5173 (or 5174)
Should see: Splash screen

---

## 🆘 IF SERVER WON'T START

### Error: "MongoDB connection failed"
```bash
# Start MongoDB
net start MongoDB

# OR install MongoDB:
# Download from: https://www.mongodb.com/try/download/community
```

### Error: "Port 5000 already in use"
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Then restart server
cd server
npm run dev
```

### Error: "Cannot find module"
```bash
cd server
npm install
npm run dev
```

---

## 📋 COMPLETE STARTUP CHECKLIST

- [ ] MongoDB is running
- [ ] Server terminal open and running (port 5000)
- [ ] Client terminal open and running (port 5173/5174)
- [ ] http://localhost:5000/api shows API message
- [ ] http://localhost:5173 shows splash screen
- [ ] No ERR_CONNECTION_REFUSED errors in console

---

## 🎯 AFTER SERVERS ARE RUNNING

All these errors will disappear:
- ✅ ERR_CONNECTION_REFUSED - FIXED
- ✅ Failed to load resource - FIXED
- ✅ POST /api/posts 500 - FIXED
- ✅ Error fetching movies - FIXED
- ✅ Error fetching wishlist - FIXED

---

## 💡 KEEP TERMINALS OPEN

**DO NOT CLOSE** the terminal windows while using the app!

- Terminal 1: Server (must stay open)
- Terminal 2: Client (must stay open)

---

## 🚀 QUICK COMMANDS

### Start Everything:
```bash
# Terminal 1 - MongoDB
net start MongoDB

# Terminal 2 - Server
cd c:\Users\Melanie\react-projects\movie-app\server
npm run dev

# Terminal 3 - Client
cd c:\Users\Melanie\react-projects\movie-app\client
npm run dev
```

### Stop Everything:
```bash
# Press Ctrl+C in each terminal
# Then:
net stop MongoDB
```

---

## ✅ YOU'RE READY WHEN:

1. ✅ MongoDB running
2. ✅ Server shows "Server running on port 5000"
3. ✅ Client shows "Local: http://localhost:5173"
4. ✅ No connection errors in browser console
5. ✅ Can see movies on homepage

---

**START THE SERVERS NOW!** ⚡

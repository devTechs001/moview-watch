# Environment Variables Setup Guide

## Quick Fix for Current Issues

### Issue 1: MongoDB Connection Error
**Error:** `The uri parameter to openUri() must be a string, got "undefined"`

**Solution:** Your `.env` file exists but might have formatting issues.

### Issue 2: CORS Error (Port Mismatch)
**Error:** CORS blocked - origin 'http://localhost:5174' vs 'http://localhost:5173'

**Solution:** ✅ Already fixed! Server now accepts ports 5173, 5174, and 5175.

---

## Step-by-Step: Create Proper `.env` File

### 1. Open or Create `.env` File
Location: `c:\Users\Melanie\react-projects\movie-app\server\.env`

### 2. Copy This Exact Content

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://danielmk:20051117dan@cluster1.1frrfrb.mongodb.net/cinemaflix

JWT_SECRET=supersecretjwtkey12345changethislater
JWT_EXPIRE=7d

TMDB_API_KEY=your_tmdb_api_key_here

CLIENT_URL=http://localhost:5173
```

### 3. Save the File
- Make sure there are **NO SPACES** before or after the `=` signs
- Make sure there are **NO EMPTY LINES** at the top
- Save with UTF-8 encoding

### 4. Restart Server
The server will automatically restart with nodemon, or press `Ctrl+C` and run:
```bash
npm run dev
```

---

## Verify It's Working

When the server starts, you should see:
```
🔧 Environment loaded from .env file
📍 NODE_ENV: development
🔌 PORT: 5000
🗄️  MongoDB URI: ✅ Loaded
🔑 JWT Secret: ✅ Loaded
✅ MongoDB Connected: cluster1-shard-00-00.1frrfrb.mongodb.net
Server running in development mode on port 5000
```

---

## Common .env File Mistakes

### ❌ Wrong:
```env
MONGODB_URI = mongodb+srv://...  (extra spaces)
MONGODB_URI= mongodb+srv://...   (space before =)
MONGODB_URI =mongodb+srv://...   (space after =)
```

### ✅ Correct:
```env
MONGODB_URI=mongodb+srv://...
```

---

## MongoDB Atlas Security Warning

⚠️ **Security Note:** Your MongoDB password is visible in the connection string.

**For production, you should:**
1. Create a new MongoDB user with a strong password
2. Use environment variables on the deployment platform
3. Never commit `.env` to git (it's already in `.gitignore`)

---

## Get TMDB API Key (Optional)

For importing real movies from The Movie Database:

1. Go to: https://www.themoviedb.org/
2. Create free account
3. Go to: Settings → API
4. Request API Key (Developer)
5. Copy your API Key (v3 auth)
6. Add to `.env`:
   ```env
   TMDB_API_KEY=your_actual_key_here
   ```

---

## Test Your Setup

### 1. Server Should Start Successfully
```bash
cd server
npm run dev
```

Should show: `✅ MongoDB Connected`

### 2. Test API Endpoint
Open browser: http://localhost:5000

Should show: `{"message":"CinemaFlix API is running"}`

### 3. Frontend Connection
```bash
cd client
npm run dev
```

Should open on port 5173 or 5174 (both work now!)

---

## Still Having Issues?

### Check .env File Exists
```bash
dir server\.env
```

Should show the file. If not, create it manually.

### Check File Content
Open `server\.env` in notepad and verify:
- File is not empty
- No weird characters
- Proper format (KEY=value)

### Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as JWT_SECRET.

---

## Working Example

This is a complete working `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://danielmk:20051117dan@cluster1.1frrfrb.mongodb.net/cinemaflix
JWT_SECRET=mysecretkey123456789
JWT_EXPIRE=7d
TMDB_API_KEY=your_key_here
CLIENT_URL=http://localhost:5173
```

That's it! Save and restart your server. 🚀

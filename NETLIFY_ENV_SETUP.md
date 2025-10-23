# Netlify Environment Variables Setup

## Critical: Set These Environment Variables in Netlify

Your app is deployed but needs environment variables to function properly. Follow these steps:

### 1. Access Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site: **cinemaflx**
3. Navigate to **Site settings** → **Environment variables**

### 2. Add Required Environment Variables

Click **Add a variable** and add each of these:

#### Backend API Configuration
```
Variable: VITE_API_URL
Value: https://your-backend-url.com/api
```
**Note**: Replace with your actual backend API URL (Railway, Render, etc.)

```
Variable: VITE_SOCKET_URL
Value: https://your-backend-url.com
```
**Note**: Same domain as API, without `/api` suffix

#### TMDB API Key
```
Variable: VITE_TMDB_API_KEY
Value: your_tmdb_api_key_here
```
**Get your key from**: [TMDB API Settings](https://www.themoviedb.org/settings/api)

#### Stripe Configuration (for payments)
```
Variable: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_test_... or pk_live_...
```
**Get your key from**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

### 3. Trigger Redeploy

After adding all variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete

## Environment Variables Summary

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_API_URL` | Backend API endpoint | ✅ Yes |
| `VITE_SOCKET_URL` | WebSocket connection | ✅ Yes |
| `VITE_TMDB_API_KEY` | Movie database access | ✅ Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Payment processing | ⚠️ If using subscriptions |

## Fallback Values (Development)

If environment variables are not set, the app uses these defaults:
- `VITE_API_URL`: `http://localhost:5000/api`
- `VITE_SOCKET_URL`: `http://localhost:5000`

**These won't work in production!** You must set the actual values.

## Verification

After setting variables and redeploying:

1. **Open Browser Console** on your Netlify site
2. **Check for errors**:
   - ❌ `Failed to fetch` → API URL is wrong or backend is down
   - ❌ `401 Unauthorized` → Backend authentication issue
   - ✅ No errors → Everything is working!

3. **Test Features**:
   - Browse movies (requires TMDB API key)
   - Login/Register (requires backend API)
   - Real-time features (requires Socket URL)
   - Payments (requires Stripe key)

## Backend Deployment

If you haven't deployed your backend yet, you need to:

### Option 1: Railway
1. Go to [Railway](https://railway.app/)
2. Create new project from GitHub repo
3. Select the `server` folder
4. Set backend environment variables
5. Copy the generated URL

### Option 2: Render
1. Go to [Render](https://render.com/)
2. Create new Web Service
3. Connect your GitHub repo
4. Set root directory to `server`
5. Copy the generated URL

### Option 3: Heroku
1. Go to [Heroku](https://heroku.com/)
2. Create new app
3. Deploy from GitHub
4. Set buildpack to Node.js
5. Copy the app URL

## Common Issues

### Issue: Movies not loading
**Cause**: Missing `VITE_TMDB_API_KEY`
**Fix**: Add TMDB API key in Netlify environment variables

### Issue: Login/Register not working
**Cause**: Missing or incorrect `VITE_API_URL`
**Fix**: 
1. Verify backend is deployed and running
2. Set correct backend URL in Netlify
3. Ensure backend has CORS configured for Netlify domain

### Issue: Real-time features not working
**Cause**: Missing or incorrect `VITE_SOCKET_URL`
**Fix**: Set correct WebSocket URL (same as API URL without `/api`)

### Issue: Payment not working
**Cause**: Missing `VITE_STRIPE_PUBLISHABLE_KEY`
**Fix**: Add Stripe publishable key from Stripe dashboard

## CORS Configuration (Backend)

Your backend needs to allow requests from Netlify. In your backend code:

```javascript
// server/index.js or server/app.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cinemaflx.netlify.app'
  ],
  credentials: true
}));
```

## Next Steps

1. ✅ Set all required environment variables in Netlify
2. ✅ Deploy your backend (if not already done)
3. ✅ Update CORS settings in backend
4. ✅ Trigger redeploy in Netlify
5. ✅ Test all features on live site

## Support

If you encounter issues:
- Check Netlify build logs
- Check browser console for errors
- Verify all environment variables are set correctly
- Ensure backend is accessible from Netlify

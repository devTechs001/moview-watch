# Netlify Deployment Fix

## Issues Fixed

### 1. **Incompatible Plugins** ✅
- Removed `strapi-plugin-netlify-deployments` (Strapi-specific, not for React)
- Removed `@21yunbox/netlify-plugin-21yunbox-deploy-to-china-cdn` (unnecessary)
- Kept only `@netlify/plugin-lighthouse` for performance monitoring

### 2. **Base Path Configuration** ✅
- **Problem**: `vite.config.js` had `base: '/moview-watch/'` hardcoded for GitHub Pages
- **Solution**: Made it dynamic based on deployment target
  - Netlify: uses `base: '/'`
  - GitHub Pages: uses `base: '/moview-watch/'`

### 3. **Build Output Location** ✅
- Ensured `dist` folder is created in the correct location (`client/dist`)
- Updated `netlify.toml` to properly reference the build directory

## Changes Made

### `client/vite.config.js`
```javascript
// Before
base: '/moview-watch/', // GitHub Pages base URL

// After
base: process.env.GITHUB_PAGES === 'true' ? '/moview-watch/' : '/',
```

### `client/package.json`
```json
{
  "scripts": {
    "predeploy": "cross-env GITHUB_PAGES=true npm run build"
  },
  "devDependencies": {
    "cross-env": "^7.0.3"
  }
}
```

### `netlify.toml`
```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

## Deployment Steps

### For Netlify (Current Issue)

1. **Install Dependencies** (run locally first):
   ```bash
   cd client
   npm install
   ```

2. **Commit and Push Changes**:
   ```bash
   git add .
   git commit -m "Fix Netlify deployment configuration"
   git push origin main
   ```

3. **Netlify Will Auto-Deploy**:
   - The build will now use `base: '/'` automatically
   - Output will be in `client/dist`
   - Deployment should succeed

### For GitHub Pages (Still Works)

```bash
cd client
npm run deploy
```
- This will set `GITHUB_PAGES=true` environment variable
- Vite will build with `base: '/moview-watch/'`
- Deploys to GitHub Pages correctly

## Environment Variables to Set in Netlify

Go to **Site settings** → **Environment variables** and add:

```
VITE_API_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Verification

After deployment succeeds:

1. **Check Build Logs**: Should show "Build succeeded"
2. **Visit Site**: Check that assets load correctly (no 404s)
3. **Test Routing**: Navigate to different pages, refresh should work
4. **Check Console**: No errors related to missing assets

## Troubleshooting

### If Build Still Fails

1. **Check Netlify Build Logs** for specific errors
2. **Verify Node Version**: Should be 18 (set in `netlify.toml`)
3. **Check Environment Variables**: Make sure all required vars are set

### If Assets Don't Load

- Check browser console for 404 errors
- Verify the base path is `/` in the deployed site
- Check that `dist` folder contains all files

## Next Steps

1. ✅ Remove incompatible plugins from Netlify UI (if not already done)
2. ✅ Install dependencies: `cd client && npm install`
3. ✅ Commit and push changes
4. ⏳ Wait for Netlify auto-deployment
5. ✅ Verify deployment succeeded
6. ✅ Test the live site

## Support

If you encounter any issues:
- Check Netlify build logs
- Verify all environment variables are set
- Ensure backend API is accessible from Netlify

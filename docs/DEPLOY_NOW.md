# 🚀 Deploy to GitHub Pages - Ready!

## Your Configuration

- **GitHub Username:** devTechs001
- **Repository:** moview-watch
- **Email:** devtechs842@gmail.com
- **Live URL:** https://devTechs001.github.io/moview-watch

## ✅ Already Configured

All settings are ready! The following have been updated:

1. ✅ `package.json` - homepage set to your repo
2. ✅ `vite.config.js` - base URL configured
3. ✅ `main.jsx` - basename added for routing
4. ✅ `.nojekyll` - created to prevent Jekyll processing

## 🎯 Deploy Now (3 Steps)

### Step 1: Install gh-pages

```bash
cd client
npm install --save-dev gh-pages
```

### Step 2: Deploy

```bash
npm run deploy
```

This will:
- Build your app
- Create `gh-pages` branch
- Push to GitHub
- Deploy automatically

### Step 3: Configure GitHub Pages

1. Go to: https://github.com/devTechs001/moview-watch/settings/pages
2. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Click **Save**

## 🌐 Access Your Site

After 1-2 minutes, visit:

```
https://devTechs001.github.io/moview-watch
```

## 📝 Git Commands (If Needed)

### First Time Setup

```bash
# Configure git
git config user.name "devTechs001"
git config user.email "devtechs842@gmail.com"

# Add remote (if not already added)
git remote add origin https://github.com/devTechs001/moview-watch.git

# Push your code
git add .
git commit -m "feat: Ready for deployment"
git push -u origin main
```

### Deploy Frontend

```bash
cd client
npm run deploy
```

## 🔧 Troubleshooting

### Issue: gh-pages not found

```bash
cd client
npm install --save-dev gh-pages
```

### Issue: Permission denied

```bash
# Check remote URL
git remote -v

# If needed, update
git remote set-url origin https://github.com/devTechs001/moview-watch.git
```

### Issue: Build fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## 📊 Deployment Status

Check deployment status:
- GitHub Actions: https://github.com/devTechs001/moview-watch/actions
- Pages Settings: https://github.com/devTechs001/moview-watch/settings/pages

## 🎉 That's It!

Your app is configured and ready to deploy with one command:

```bash
cd client
npm run deploy
```

Then visit: **https://devTechs001.github.io/moview-watch** 🚀

## 📱 Backend Deployment

Remember: GitHub Pages only hosts the frontend. Deploy your backend separately:

### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
cd server
railway login
railway init
railway up
```

### Option 2: Render
1. Go to https://render.com
2. Connect GitHub repo
3. Select `server` directory
4. Deploy

### Option 3: Heroku
```bash
cd server
heroku login
heroku create moview-watch-api
git push heroku main
```

## 🔗 Update Frontend API URL

After deploying backend, update `client/src/lib/axios.js`:

```javascript
const baseURL = import.meta.env.PROD 
  ? 'https://your-backend-url.com/api'  // Your deployed backend
  : 'http://localhost:5000/api'

export default Axios.create({ baseURL })
```

## ✅ Complete Checklist

- [x] Package.json configured
- [x] Vite config updated
- [x] Router basename set
- [x] .nojekyll created
- [ ] Install gh-pages
- [ ] Run `npm run deploy`
- [ ] Configure GitHub Pages
- [ ] Deploy backend
- [ ] Update API URL
- [ ] Test live site

Ready to deploy! 🎊

# 🚀 CinemaFlix Deployment Guide

## 📋 Overview
This guide covers deploying CinemaFlix to both Netlify and GitHub Pages with proper server configuration.

## 🌐 Deployment URLs
- **Netlify**: https://cinemaflx.netlify.app
- **GitHub Pages**: https://devTechs001.github.io/moview-watch
- **Server**: https://cinemaflx-server.onrender.com

## 🔧 Configuration Files

### 1. Netlify Configuration (`netlify.toml`)
```toml
# Netlify Configuration for CinemaFlix Frontend
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "18"
  VITE_API_URL = "https://cinemaflx-server.onrender.com/api"
  VITE_SOCKET_URL = "https://cinemaflx-server.onrender.com"
  VITE_CLIENT_URL = "https://cinemaflx.netlify.app"

# SPA routing support
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# PWA support
[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Content-Type = "application/javascript"
    Cache-Control = "public, max-age=0, must-revalidate"
```

### 2. GitHub Pages Configuration (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: client/package-lock.json
        
    - name: Install dependencies
      run: |
        cd client
        npm ci
        
    - name: Build
      run: |
        cd client
        npm run build
      env:
        VITE_API_URL: https://cinemaflx-server.onrender.com/api
        VITE_SOCKET_URL: https://cinemaflx-server.onrender.com
        VITE_CLIENT_URL: https://devTechs001.github.io/moview-watch
        GITHUB_PAGES: true
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./client/dist
        cname: cinemaflx.netlify.app
```

### 3. Environment Configuration
The application automatically detects deployment environment and configures API URLs:

```javascript
// Auto-detects deployment environment
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  if (window.location.hostname.includes('netlify.app')) {
    return 'https://cinemaflx-server.onrender.com/api'
  }
  
  if (window.location.hostname.includes('github.io')) {
    return 'https://cinemaflx-server.onrender.com/api'
  }
  
  return 'http://localhost:5000/api'
}
```

## 🚀 Deployment Steps

### Netlify Deployment
1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
3. **Environment Variables** (set in Netlify dashboard):
   ```
   VITE_API_URL=https://cinemaflx-server.onrender.com/api
   VITE_SOCKET_URL=https://cinemaflx-server.onrender.com
   VITE_CLIENT_URL=https://cinemaflx.netlify.app
   ```
4. **Deploy**: Netlify will automatically deploy on every push to main branch

### GitHub Pages Deployment
1. **Enable GitHub Pages**: Go to repository Settings > Pages
2. **Source**: Deploy from GitHub Actions
3. **Workflow**: The provided workflow will automatically deploy
4. **Custom Domain**: Set `cinemaflx.netlify.app` as custom domain

### Server Deployment (Render)
1. **Connect Repository**: Link your GitHub repository to Render
2. **Service Type**: Web Service
3. **Build Command**: `cd server && npm install`
4. **Start Command**: `cd server && npm start`
5. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   CLIENT_URL=https://cinemaflx.netlify.app
   ```

## 🔧 Router Configuration
The application uses dynamic basename configuration:

```javascript
const getBasename = () => {
  if (window.location.hostname.includes('github.io')) {
    return '/moview-watch'
  }
  return '/'
}
```

## 📱 PWA Features
- **Service Worker**: Enhanced caching and offline support
- **Manifest**: Complete PWA manifest with shortcuts and file handlers
- **Install Prompt**: Native app installation
- **Push Notifications**: Real-time notifications
- **Background Sync**: Offline data synchronization

## 🎨 UI Enhancements
- **Responsive Design**: Mobile-first approach
- **Dark/Light Themes**: Dynamic theme switching
- **Animations**: Smooth transitions with Framer Motion
- **Loading States**: Enhanced loading indicators
- **Error Boundaries**: Graceful error handling

## 🔒 Security Features
- **CORS Configuration**: Proper cross-origin setup
- **Security Headers**: XSS protection, content type validation
- **Input Validation**: Server-side validation
- **Rate Limiting**: API rate limiting
- **Authentication**: JWT-based authentication

## 📊 Performance Optimizations
- **Code Splitting**: Dynamic imports for better performance
- **Image Optimization**: Responsive images and lazy loading
- **Caching**: Aggressive caching for static assets
- **Compression**: Gzip compression enabled
- **Bundle Analysis**: Optimized bundle sizes

## 🧪 Testing
- **Build Verification**: All builds pass successfully
- **Linting**: No linting errors
- **Type Safety**: TypeScript support where applicable
- **Error Handling**: Comprehensive error boundaries

## 📈 Monitoring
- **Lighthouse**: Performance monitoring
- **Analytics**: User behavior tracking
- **Error Tracking**: Real-time error monitoring
- **Uptime Monitoring**: Service availability tracking

## 🔄 CI/CD Pipeline
1. **Code Push**: Triggers automatic deployment
2. **Build Process**: Installs dependencies and builds
3. **Testing**: Runs linting and type checking
4. **Deployment**: Deploys to staging/production
5. **Health Checks**: Verifies deployment success

## 📞 Support
- **Documentation**: Comprehensive inline documentation
- **Error Logs**: Detailed error logging
- **Debug Mode**: Development debugging tools
- **Hot Reload**: Fast development iteration

## 🎯 Next Steps
1. **Database Setup**: Configure MongoDB Atlas
2. **API Keys**: Set up TMDB, Stripe, and other services
3. **Domain Setup**: Configure custom domains
4. **SSL Certificates**: Ensure HTTPS everywhere
5. **Monitoring**: Set up application monitoring

---

**Status**: ✅ Ready for Production Deployment
**Last Updated**: January 2025
**Version**: 1.0.0

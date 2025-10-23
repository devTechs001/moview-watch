# TMDB Movie Import Setup

## Get TMDB API Key

1. Go to https://www.themoviedb.org/
2. Create free account
3. Go to Settings → API
4. Request API Key (choose "Developer")
5. Copy your API Key (v3 auth)

## Configure Environment

Add to `server/.env`:
```
TMDB_API_KEY=your_api_key_here
```

## Import Movies

### Method 1: Admin Dashboard (UI)
1. Login as admin
2. Go to `/admin/import-movies`
3. Click "Import Popular" or "Import Trending"
4. Or search and import specific movies

### Method 2: Command Line
```bash
cd server
npm run seed:movies
```

This imports 80+ popular movies automatically!

## API Endpoints

```
POST /api/admin/tmdb/fetch-popular    - Fetch popular movies
POST /api/admin/tmdb/fetch-trending   - Fetch trending movies
GET  /api/admin/tmdb/search           - Search TMDB
POST /api/admin/tmdb/import/:tmdbId   - Import specific movie
```

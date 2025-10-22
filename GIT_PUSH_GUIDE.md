# Push to GitHub Repository

## Initial Setup (First Time)

```bash
cd c:\Users\Melanie\react-projects\movie-app

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Full-stack CinemaFlix movie app with social & AI features"

# Add remote repository
git remote add origin https://github.com/devTechs001/React-Movie-App.git

# Push to GitHub
git push -u origin main
```

## If Repository Already Exists

```bash
# Pull existing changes first
git pull origin main --allow-unrelated-histories

# Then push your changes
git push origin main
```

## Update Existing Repository

```bash
# Add changes
git add .

# Commit with message
git commit -m "Add TMDB integration, social features, and AI security"

# Push
git push origin main
```

## Common Issues

### Authentication Error
Use Personal Access Token instead of password:
1. GitHub → Settings → Developer Settings → Personal Access Tokens
2. Generate new token
3. Use token as password when prompted

### Branch Name
If using `master` instead of `main`:
```bash
git push -u origin master
```

## Quick Commands

```bash
# Check status
git status

# See remote
git remote -v

# Create .gitignore (already created)
# Ensures node_modules, .env not uploaded
```

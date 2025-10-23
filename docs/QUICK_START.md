# CinemaFlix - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (2 min)
```bash
# From the root directory
npm run install:all
```

### Step 2: Configure Environment (1 min)

**Server Configuration:**
```bash
cd server
copy .env.example .env
```

Edit `server/.env` and add:
```env
MONGODB_URI=mongodb://localhost:27017/cinemaflix
JWT_SECRET=my_super_secret_key_12345
```

**Client Configuration:**
```bash
cd ../client
copy .env.example .env
```

The default values in `.env.example` should work for local development.

### Step 3: Start MongoDB (1 min)

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - MongoDB Atlas (Free Tier):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `MONGODB_URI` in `server/.env`

### Step 4: Run Application (1 min)
```bash
# From root directory
npm run dev
```

This starts both frontend and backend:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 🎬 First Login

### Create Your Account
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Fill in your details
4. Login with your credentials

### Make Yourself Admin (Optional)
To access admin features, update your user role in MongoDB:

**Using MongoDB Compass:**
1. Connect to your database
2. Find your user in the `users` collection
3. Change `role: "user"` to `role: "admin"`

**Using MongoDB Shell:**
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## 📋 Features You Can Explore

### User Features
✅ Browse movies with beautiful cards  
✅ Search and filter by genre, year, rating  
✅ Watch full movies with custom video player  
✅ Like and rate movies  
✅ Add movies to wishlist  
✅ Comment on movies  
✅ Chat with other users (real-time)  
✅ Customize profile and settings  
✅ Dark/Light theme toggle  

### Admin Features (After setting role to admin)
✅ Admin dashboard with statistics  
✅ Add/Edit/Delete movies  
✅ Manage users  
✅ View analytics  
✅ Platform settings  

## 🎨 Customization Tips

### Change Brand Colors
Edit `client/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: "hsl(221.2 83.2% 53.3%)", // Your brand color
      // ...
    }
  }
}
```

### Update App Name
1. Edit `client/index.html` - Update `<title>`
2. Edit components that show "CinemaFlix"
3. Edit `README.md` with your name

### Add Logo
1. Add logo file to `client/public/`
2. Update `client/index.html` favicon
3. Update `client/src/components/Navbar.jsx` logo section

## 📦 Adding Sample Movies (For Testing)

Create a JavaScript file `server/seedMovies.js`:

```javascript
import Movie from './models/Movie.js'
import User from './models/User.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const movies = [
  {
    title: 'The Matrix',
    description: 'A computer hacker learns about the true nature of reality.',
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
    year: 1999,
    duration: 136,
    genre: ['Action', 'Sci-Fi'],
    director: 'Lana Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
  },
  // Add more movies...
]

const seedMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    
    // Get admin user
    const admin = await User.findOne({ role: 'admin' })
    
    if (!admin) {
      console.log('No admin user found')
      process.exit(1)
    }
    
    // Clear existing movies
    await Movie.deleteMany({})
    
    // Add movies
    for (const movie of movies) {
      await Movie.create({ ...movie, addedBy: admin._id })
    }
    
    console.log('Movies seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

seedMovies()
```

Run: `node server/seedMovies.js`

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in server/.env
PORT=5001
```

### Cannot Connect to MongoDB
- Check if MongoDB is running
- Verify connection string
- Check firewall settings

### Frontend Can't Connect to Backend
- Ensure backend is running
- Check VITE_API_URL in client/.env
- Check CORS settings in server/server.js

### Authentication Not Working
- Clear browser localStorage
- Check JWT_SECRET is set
- Verify token is being sent in headers

## 📚 Learn More

### API Documentation
All endpoints are documented in `PROJECT_STRUCTURE.md`

### Code Structure
Detailed structure in `PROJECT_STRUCTURE.md`

### Full Setup
Complete guide in `INSTALLATION.md`

### Main README
Features and overview in `README.md`

## 🎯 Next Steps

1. **Explore the app** - Try all features
2. **Add content** - Upload movies and test features
3. **Customize** - Change colors, branding, features
4. **Deploy** - Follow deployment guides
5. **Share** - Share with friends or clients

## 💡 Development Tips

### Hot Reload
Both frontend and backend have hot reload enabled. Just save files and see changes instantly.

### View Database
Use MongoDB Compass to visually explore your database:
https://www.mongodb.com/products/compass

### API Testing
Use Postman or Thunder Client to test API endpoints:
- Import endpoints from `PROJECT_STRUCTURE.md`
- Add Bearer token for protected routes

### Debugging
- Frontend: React DevTools browser extension
- Backend: Use `console.log` or Node debugger
- Network: Browser DevTools Network tab

## 🤝 Need Help?

- Review documentation files
- Check error messages in console
- Verify environment variables
- Test API endpoints individually
- Check MongoDB connection

## 🎉 You're Ready!

Your CinemaFlix movie streaming application is now running. Start exploring, customizing, and building your perfect movie platform!

**Happy Coding! 🚀**

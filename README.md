# CinemaFlix - Full Stack Movie Streaming Application

A comprehensive MERN stack movie streaming platform with advanced features including user authentication, movie management, social interactions, and admin dashboard.

## 🚀 Features

### User Features
- **Splash Screen**: Beautiful animated splash screen with branding
- **Authentication**: Secure login/register system for users and admins
- **Movie Preview**: Browse movies with images, descriptions, ratings, and reviews
- **Video Player**: Full-length movie/video streaming with controls
- **Social Media Platform**: Stories (24hr), activity feed, likes, comments, shares
- **Stories System**: Share movie moments that expire in 24 hours
- **Social Feed**: Real-time activity stream of what users are watching/rating
- **Follow System**: Follow other users and see their activity
- **Search & Filter**: Advanced search and filtering options
- **User Profiles**: Customizable profiles with social stats and themes
- **Chat & Calls**: Real-time user interaction features
- **Privacy Controls**: Manage who sees your activity
- **Responsive Design**: Works seamlessly on all devices

### Admin Features
- **Admin Dashboard**: Comprehensive admin panel with analytics
- **AI Security System**: Real-time threat detection with auto-fix capabilities
- **Security Monitoring**: Track all events, detect suspicious activity
- **Auto-Fix System**: AI automatically fixes security issues
- **Threat Intelligence**: Risk scoring, pattern recognition, anomaly detection
- **Learning AI**: System learns from experience and improves over time
- **Movie Management**: Add, edit, delete movies and content
- **User Management**: Manage users and permissions
- **Content Moderation**: Review and moderate comments/reviews
- **Analytics**: Track views, ratings, and user engagement
- **Security Insights**: AI recommendations for security improvements
- **Settings**: Customize application settings and themes

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Shadcn/ui components
- Framer Motion for animations
- React Router for navigation
- Axios for API calls
- Socket.io for real-time features
- React Player for video streaming

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Socket.io for real-time communication
- Multer for file uploads
- Cloudinary for media storage

## 📦 Installation

### Quick Start (5 minutes)
See [QUICK_START.md](QUICK_START.md) for the fastest way to get started.

### Full Installation

1. Clone the repository:
```bash
git clone https://github.com/devTechs001/React-Movie-App.git
cd movie-app
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
   - Create `.env` in the server folder (see `server/.env.example`)
   - Create `.env` in the client folder (see `client/.env.example`)

4. Configure MongoDB:
   - Use local MongoDB: `mongodb://localhost:27017/cinemaflix`
   - Or MongoDB Atlas (free tier): [Get connection string](https://www.mongodb.com/cloud/atlas)

5. Start the development servers:
```bash
npm run dev
```

The client will run on `http://localhost:5173`  
The server will run on `http://localhost:5000`

For detailed setup instructions, see [INSTALLATION.md](INSTALLATION.md)

## 🔧 Environment Variables

### Server (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 📱 Application Structure

```
movie-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Images, icons, etc.
│   └── public/            # Static files
│
└── server/                # Express backend
    ├── models/            # MongoDB models
    ├── routes/            # API routes
    ├── controllers/       # Route controllers
    ├── middleware/        # Custom middleware
    ├── config/            # Configuration files
    └── utils/             # Utility functions
```

## 🎨 Features Overview

### Authentication System
- JWT-based authentication
- Role-based access control (User/Admin)
- Secure password hashing
- Session management

### Movie Management
- CRUD operations for movies
- Category and genre management
- Movie metadata (title, description, cast, duration, etc.)
- Video upload and streaming
- Thumbnail management

### User Interactions
- Like/unlike movies
- Comment and rate movies
- Add to wishlist
- Share movies on social media
- Real-time chat between users
- Video/audio calls

### Admin Dashboard
- User analytics and statistics
- Content management
- User management
- Revenue tracking
- System settings

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
```

### Backend (Heroku/Railway/DigitalOcean)
```bash
cd server
npm start
```

## 📝 License

This project is licensed under the ISC License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

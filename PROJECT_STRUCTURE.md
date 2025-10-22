# CinemaFlix Project Structure

## Overview
Full-stack MERN movie streaming application with comprehensive features including authentication, movie management, user interactions, and admin dashboard.

## Directory Structure

```
movie-app/
├── client/                          # React Frontend (Vite)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── ui/                  # UI components (Button, Card, etc.)
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Input.jsx
│   │   │   ├── AdminRoute.jsx       # Admin route protection
│   │   │   ├── MovieCard.jsx        # Movie display card
│   │   │   ├── Navbar.jsx           # Main navigation
│   │   │   ├── ProtectedRoute.jsx   # Auth route protection
│   │   │   └── SplashScreen.jsx     # Animated splash screen
│   │   │
│   │   ├── lib/                     # Utilities
│   │   │   ├── axios.js             # Axios instance
│   │   │   └── utils.js             # Helper functions
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/               # Admin pages
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminMovies.jsx
│   │   │   │   ├── AdminSettings.jsx
│   │   │   │   └── AdminUsers.jsx
│   │   │   ├── auth/                # Authentication pages
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── ChatPage.jsx         # Chat/messaging
│   │   │   ├── HomePage.jsx         # Main home page
│   │   │   ├── LandingPage.jsx      # Public landing
│   │   │   ├── MovieDetails.jsx     # Movie details page
│   │   │   ├── ProfilePage.jsx      # User profile
│   │   │   ├── SearchPage.jsx       # Search & filters
│   │   │   ├── SettingsPage.jsx     # User settings
│   │   │   ├── WatchMovie.jsx       # Video player
│   │   │   └── WishlistPage.jsx     # User wishlist
│   │   │
│   │   ├── store/                   # State management (Zustand)
│   │   │   ├── authStore.js         # Authentication state
│   │   │   └── themeStore.js        # Theme state
│   │   │
│   │   ├── App.jsx                  # Main app component
│   │   ├── index.css                # Global styles
│   │   └── main.jsx                 # Entry point
│   │
│   ├── .env.example                 # Environment template
│   ├── index.html                   # HTML template
│   ├── package.json                 # Client dependencies
│   ├── postcss.config.js            # PostCSS config
│   ├── tailwind.config.js           # Tailwind config
│   └── vite.config.js               # Vite config
│
├── server/                          # Express Backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   │
│   ├── controllers/                 # Route controllers
│   │   ├── adminController.js       # Admin operations
│   │   ├── authController.js        # Authentication
│   │   ├── commentController.js     # Comments
│   │   ├── movieController.js       # Movie CRUD
│   │   └── userController.js        # User operations
│   │
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.js                  # JWT authentication
│   │   └── errorHandler.js          # Error handling
│   │
│   ├── models/                      # MongoDB models
│   │   ├── Comment.js               # Comment schema
│   │   ├── Movie.js                 # Movie schema
│   │   ├── Rating.js                # Rating schema
│   │   └── User.js                  # User schema
│   │
│   ├── routes/                      # API routes
│   │   ├── adminRoutes.js           # Admin endpoints
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── commentRoutes.js         # Comment endpoints
│   │   ├── movieRoutes.js           # Movie endpoints
│   │   └── userRoutes.js            # User endpoints
│   │
│   ├── utils/
│   │   └── generateToken.js         # JWT token generation
│   │
│   ├── .env.example                 # Environment template
│   ├── package.json                 # Server dependencies
│   └── server.js                    # Express app entry
│
├── .gitignore                       # Git ignore rules
├── INSTALLATION.md                  # Setup instructions
├── package.json                     # Root package.json
├── PROJECT_STRUCTURE.md             # This file
└── README.md                        # Project documentation
```

## Key Features by Directory

### Frontend (`client/`)

#### Components
- **UI Components**: Reusable styled components with Radix UI
- **SplashScreen**: Animated loading screen with Framer Motion
- **Navbar**: Responsive navigation with user dropdown
- **MovieCard**: Movie display with hover effects
- **Route Protection**: Auth and admin route guards

#### Pages
- **Landing**: Public homepage with features
- **Auth**: Login/register with validation
- **Home**: Movie browsing with categories
- **Movie Details**: Full movie info, comments, ratings
- **Watch**: Video player with controls
- **Search**: Advanced search and filters
- **Wishlist**: Saved movies
- **Profile**: User profile management
- **Settings**: User preferences
- **Chat**: Real-time messaging
- **Admin**: Dashboard, movie/user management

#### State Management
- **authStore**: User authentication state
- **themeStore**: Dark/light theme toggle

### Backend (`server/`)

#### Models
- **User**: Authentication, profile, wishlist, history
- **Movie**: Full movie metadata, ratings, views
- **Comment**: User comments with likes
- **Rating**: Movie ratings (1-10)

#### Controllers
- **Auth**: Register, login, token refresh
- **Movie**: CRUD, search, like, rate
- **User**: Profile, wishlist, history
- **Comment**: Create, delete, like
- **Admin**: Stats, user/movie management

#### Routes
- `/api/auth` - Authentication
- `/api/movies` - Movie operations
- `/api/user` - User operations
- `/api/comments` - Comment operations
- `/api/admin` - Admin operations

#### Middleware
- **auth**: JWT verification
- **admin**: Admin role check
- **errorHandler**: Global error handling

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible components
- **React Router** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **React Player** - Video player
- **Socket.io Client** - Real-time features

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - WebSocket server
- **Helmet** - Security headers
- **Morgan** - Logging
- **Compression** - Response compression

## API Endpoints

### Authentication
```
POST   /api/auth/register    - Register user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
```

### Movies
```
GET    /api/movies           - Get all movies
GET    /api/movies/:id       - Get single movie
POST   /api/movies           - Create movie (admin)
PUT    /api/movies/:id       - Update movie (admin)
DELETE /api/movies/:id       - Delete movie (admin)
PUT    /api/movies/:id/like  - Like movie
POST   /api/movies/:id/rate  - Rate movie
```

### User
```
GET    /api/user/profile           - Get profile
PUT    /api/user/profile           - Update profile
GET    /api/user/wishlist          - Get wishlist
POST   /api/user/wishlist/:id      - Add to wishlist
DELETE /api/user/wishlist/:id      - Remove from wishlist
POST   /api/user/history/:id       - Add to history
```

### Comments
```
GET    /api/comments/:movieId      - Get comments
POST   /api/comments/:movieId      - Create comment
DELETE /api/comments/:id           - Delete comment
PUT    /api/comments/:id/like      - Like comment
```

### Admin
```
GET    /api/admin/stats            - Get dashboard stats
GET    /api/admin/users            - Get all users
PUT    /api/admin/users/:id        - Update user
DELETE /api/admin/users/:id        - Delete user
```

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Server (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cinemaflix
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Development Workflow

1. **Install dependencies**: `npm run install:all`
2. **Setup environment**: Copy `.env.example` files
3. **Start MongoDB**: Local or Atlas
4. **Run dev servers**: `npm run dev`
5. **Access application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected routes (frontend & backend)
- Role-based access control
- CORS configuration
- Helmet security headers
- Rate limiting
- Input validation

## Performance Optimizations

- Code splitting with React Router
- Lazy loading components
- Image optimization
- Response compression
- Database indexing
- Efficient queries with Mongoose
- Caching strategies

## Scalability Considerations

- Modular architecture
- Stateless API design
- Database indexing
- WebSocket for real-time features
- CDN integration ready
- Load balancing compatible
- Microservices-ready structure

## Testing Strategy

- Unit tests for utilities
- Integration tests for API
- E2E tests for user flows
- Component tests with React Testing Library
- API tests with Jest/Supertest

## Deployment Checklist

- [ ] Build production bundles
- [ ] Set production environment variables
- [ ] Configure MongoDB Atlas
- [ ] Set up CDN for static assets
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Performance testing
- [ ] Security audit

## Future Enhancements

- Payment integration
- Video transcoding
- Advanced analytics
- Social sharing
- Email notifications
- Mobile app (React Native)
- PWA features
- Content recommendations (AI/ML)
- Multi-language support
- Advanced search (Elasticsearch)

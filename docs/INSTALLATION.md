# Installation Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas account)
- Git

## Step 1: Clone the Repository

```bash
git clone https://github.com/devTechs001/React-Movie-App.git
cd movie-app
```

## Step 2: Install Dependencies

Install root dependencies:
```bash
npm install
```

Install all workspace dependencies:
```bash
npm run install:all
```

Or install individually:
```bash
# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

## Step 3: Environment Variables

### Server Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file and add your configuration:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cinemaflix
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinemaflix

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary (optional, for image/video uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URL
CLIENT_URL=http://localhost:5173
```

### Client Environment Variables

Create a `.env` file in the `client` directory:

```bash
cd client
cp .env.example .env
```

Edit the `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Step 4: MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB locally from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/cinemaflix`

### Option 2: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Whitelist your IP address
4. Create database user
5. Get connection string and update `MONGODB_URI` in `.env`

## Step 5: Run the Application

### Development Mode

From the root directory, run both client and server:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Step 6: Create Admin Account (Optional)

You can manually create an admin user using MongoDB Compass or mongosh:

```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@cinemaflix.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or register normally and update role in database:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## Troubleshooting

### Port Already in Use

If port 5000 or 5173 is already in use:

1. Change PORT in `server/.env`
2. Update `VITE_API_URL` in `client/.env`
3. Update proxy in `client/vite.config.js`

### MongoDB Connection Error

- Check if MongoDB is running
- Verify connection string in `.env`
- Check firewall settings
- For Atlas: verify IP whitelist

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

### CORS Errors

- Verify `CLIENT_URL` in server `.env` matches your frontend URL
- Check CORS configuration in `server/server.js`

## Production Deployment

### Build Client

```bash
cd client
npm run build
```

### Environment Variables

Update environment variables for production:
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Update `CLIENT_URL` to production domain
- Generate secure `JWT_SECRET`

### Deploy Options

- **Frontend:** Vercel, Netlify, or AWS S3
- **Backend:** Heroku, Railway, DigitalOcean, or AWS EC2
- **Database:** MongoDB Atlas

## Additional Features Setup

### Cloudinary (for media uploads)

1. Create account at https://cloudinary.com
2. Get credentials from dashboard
3. Add to `server/.env`

### Email Service (optional)

Add email service configuration for password reset, notifications, etc.

## Default Test Credentials

After seeding (if implemented):
- **Admin:** admin@cinemaflix.com / admin123
- **User:** user@cinemaflix.com / user123

## Support

For issues or questions:
- Check GitHub Issues
- Review documentation
- Contact support

## Next Steps

1. Customize branding and colors
2. Add your movie content
3. Configure payment gateway (if needed)
4. Set up analytics
5. Configure CDN for video streaming
6. Implement caching strategy
7. Set up monitoring and logging

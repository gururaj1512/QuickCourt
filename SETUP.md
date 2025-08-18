# QuickCourt Setup Guide

## Prerequisites

- Node.js 16+ 
- MongoDB (local or cloud)
- npm or yarn

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (.env):**
   ```bash
   # Create .env file in the backend directory
   NODE_ENV=development
   PORT=5001
   FRONTEND_URL=http://localhost:5173

   # Database
   MONGODB_URI=mongodb://localhost:27017/quickcourt

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Email (optional - for password reset and verification)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@quickcourt.com

   # Cloudinary (optional - for avatar uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:5001`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (.env):**
   ```bash
   # Create .env file in the frontend directory
   VITE_API_URL=http://localhost:5001/api
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Database Setup

1. **Install MongoDB** (if using local database):
   - Download from [MongoDB website](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud)

2. **Start MongoDB:**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community

   # On Windows
   net start MongoDB

   # On Linux
   sudo systemctl start mongod
   ```

## Testing the Application

1. **Open your browser** and go to `http://localhost:5173`

2. **Register a new user** using the sign-up form

3. **Test login/logout** functionality

4. **Test profile management** features

5. **For admin features**, manually update a user's role in the database:
   ```javascript
   // In MongoDB shell or MongoDB Compass
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "Admin" } }
   )
   ```

## Troubleshooting

### CORS Issues
- Ensure both frontend and backend are running
- Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
- Verify CORS configuration in `backend/src/server.ts`

### Database Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in backend `.env`
- Verify network connectivity if using cloud database

### Port Issues
- Backend runs on port 5001 by default
- Frontend runs on port 5173 by default
- Update environment variables if you need different ports

## Development

- **Backend**: `http://localhost:5001`
- **Frontend**: `http://localhost:5173`
- **API Base**: `http://localhost:5001/api`

## Production Deployment

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build the backend:**
   ```bash
   cd backend
   npm run build
   ```

3. **Set production environment variables**
4. **Deploy to your preferred hosting platform**

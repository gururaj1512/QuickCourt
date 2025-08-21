import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';

import connectDB from './config/database';
import { notFound, errorHandler } from './middleware/error';

import auth from './routes/auth';
import courts from './routes/courts';
import bookings from './routes/bookings';


dotenv.config();

// Cloudinary Configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
connectDB();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10000
});
app.use('/api/', limiter);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
};

app.use('/api/auth', auth);
app.use('/api/courts', courts);
app.use('/api/bookings', bookings);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err: any, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;

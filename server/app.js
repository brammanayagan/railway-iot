import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import gateRoutes from './routes/gateRoutes.js';
import userAccountRoutes from './routes/userAccountRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/gate', gateRoutes);
app.use('/api/user-account', userAccountRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

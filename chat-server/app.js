import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', routes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;

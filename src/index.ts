import cors from 'cors';
import { config } from 'dotenv';
import type { Application, NextFunction, Request, Response } from 'express';
import express from 'express';
import { connect } from 'mongoose';
import { errorNotifier } from './helpers/errorNotifier';
import { errorLogger } from './helpers/logger';

config();
const app: Application = express();
const port = process.env['PORT']! || 3001;
const mongoURI = process.env['MONGO_URI']!;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 500 Error Handling Middleware
app.use(
  async (err: Error, req: Request, res: Response, _next: NextFunction) => {
    errorLogger.error({
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    await errorNotifier(err);

    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Something went wrong',
      },
    });
  },
);

// 404 Error Handling Middleware
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 404,
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

async function startServer() {
  try {
    // Connect to MongoDB
    await connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Start the server
    app.listen(port, () => {
      console.log(`🚀 Server is running at http://127.0.0.1:${port}`);
    });
  } catch (err) {
    // Handle any errors
    console.error('❌ Failed to start the server:', err);
    process.exit(1); // Exit the process with failure code
  }
}

// Start the application
void startServer();

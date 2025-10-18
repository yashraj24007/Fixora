import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleChatRequest } from './api/chat';
import { handleEmbeddingRequest } from './api/embeddings';
import { handleModelInference } from './api/model-inference';
import { handleLocalModelInference } from './api/local-model';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'https://fixora-seven.vercel.app',
    process.env.FRONTEND_URL || 'http://localhost:8080'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const rateLimitMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const limit = 50; // requests per minute
  const window = 60 * 1000; // 1 minute

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + window });
    return next();
  }

  const userLimit = rateLimit.get(ip)!;
  
  if (now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + window });
    return next();
  }

  if (userLimit.count >= limit) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  userLimit.count++;
  next();
};

// Routes
app.post('/api/chat', rateLimitMiddleware, handleChatRequest);
app.post('/api/embeddings', rateLimitMiddleware, handleEmbeddingRequest);
app.post('/api/model-inference', rateLimitMiddleware, handleModelInference);
app.post('/api/local-model', rateLimitMiddleware, handleLocalModelInference);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

console.log('Starting server...');
console.log('PORT:', PORT);
console.log('Attempting to bind to 0.0.0.0:' + PORT);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
  console.log(`✅ Server is listening on 0.0.0.0:${PORT}`);
  console.log('Server address:', server.address());
});

server.on('listening', () => {
  console.log('📡 listening event fired');
});

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the other process or use a different port.`);
  }
  process.exit(1);
});

console.log('Server setup complete, waiting for listen callback...');


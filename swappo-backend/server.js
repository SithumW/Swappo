// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { auth } from './auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { toNodeHandler } from "better-auth/node";

// Swagger imports for YAML approach
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Centralized routing
import router from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Load Swagger YAML documentation
let swaggerDocument;
try {
  swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
  
  // Update server URLs based on environment
  swaggerDocument.servers = [
    {
      url: process.env.NODE_ENV === 'production' 
        ? process.env.PRODUCTION_API_URL || 'https://your-domain.com/api'
        : `http://localhost:3000/api`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ];
  
  console.log('✅ Swagger documentation loaded successfully');
} catch (error) {
  console.error('❌ Error loading Swagger documentation:', error.message);
  console.log('📝 Make sure docs/swagger.yaml exists in your project root');
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',  // Add this
    'http://localhost:8081',  // Add this  
    'http://localhost:8082',  // Add this
    'http://localhost:8083',  // Add this
    'http://localhost:5173',  // Existing
    // Add your production domain when deploying
  ],
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make swagger document available to routes
app.locals.swaggerDocument = swaggerDocument;

// Swagger UI setup (only if documentation loaded successfully)
if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2563eb; font-size: 2rem; }
      .swagger-ui .info .description { font-size: 1rem; line-height: 1.6; }
      .swagger-ui .scheme-container { 
        background: #f8fafc; 
        padding: 20px; 
        border-radius: 8px; 
        margin: 20px 0;
      }
      .swagger-ui .auth-wrapper { margin: 20px 0; }
      .swagger-ui .btn.authorize { 
        background-color: #2563eb; 
        border-color: #2563eb; 
      }
      .swagger-ui .highlight-code { background: #f1f5f9; }
    `,
    customSiteTitle: 'Swappo API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      docExpansion: 'list', // 'none', 'list', or 'full'
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true
    }
  }));

  // Serve swagger spec as JSON (useful for API clients)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
}

// Routes
// Custom auth routes (for registration)
//app.use('/api/auth', authRoutes);   custom routes are ignored

// BetterAuth handler (for session management)
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api", router);



// Redirect root to API docs
app.get('/', (req, res) => {
  if (swaggerDocument) {
    res.redirect('/api-docs');
  } else {
    res.json({ 
      message: 'Swappo API Server',
      health: '/api/health',
      documentation: '/api-docs (not available - check swagger.yaml)'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
  }
  
  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'Duplicate entry' });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
// app.use((req, res) => {
//   res.status(404).json({ 
//     error: 'Route not found',
//     availableRoutes: {
//       health: '/api/health',
//       documentation: '/api-docs',
//       auth: '/api/auth/*',
//       users: '/api/users/*',
//       items: '/api/items/*',
//       trades: '/api/trades/*',
//       ratings: '/api/ratings/*'
//     }
//   });
// });

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(3000, () => {
  console.log('🚀 Swappo API server running on port', PORT);
  console.log('📍 Health check:', `http://localhost:${PORT}/api/health`);
  if (swaggerDocument) {
    console.log('📚 API Documentation:', `http://localhost:${PORT}/api-docs`);
    console.log('📄 Swagger JSON:', `http://localhost:${PORT}/api-docs.json`);
  } else {
    console.log('⚠️  API Documentation not available - check docs/swagger.yaml');
  }
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
});
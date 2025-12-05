// routes/index.js - Centralized routing
import express from 'express';


// Import all route modules
import userRoutes from './users.js';
import itemRoutes from './items.js';
import tradeRoutes from './trades.js';
import ratingRoutes from './ratings.js';
// Uncomment when auth routes are ready
// import authRoutes from './auth.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/items', itemRoutes);
router.use('/trades', tradeRoutes);
router.use('/ratings', ratingRoutes);
console.log('API routes initialized');

// Uncomment when auth routes are ready
// router.use('/auth', authRoutes);

export default router;

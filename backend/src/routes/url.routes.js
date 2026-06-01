import express from 'express';
import {
  createShortUrl,
  getUserUrls,
  deleteUrl,
} from '../controllers/url.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/', authMiddleware, createShortUrl);
router.get('/', authMiddleware, getUserUrls);
router.delete('/:id', authMiddleware, deleteUrl);

export default router;

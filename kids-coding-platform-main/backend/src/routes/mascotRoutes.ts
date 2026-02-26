import express from 'express';
import { MascotController } from '../controllers/mascotController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All mascot routes require authentication
router.use(authMiddleware);

/**
 * @route POST /api/mascot/chat
 * @desc Get AI-powered chat response from mascot
 * @access Private (authenticated children only)
 */
router.post('/chat', MascotController.chat);

/**
 * @route POST /api/mascot/step-message
 * @desc Get contextual step introduction message
 * @access Private (authenticated children only)
 */
router.post('/step-message', MascotController.getStepMessage);

/**
 * @route POST /api/mascot/help
 * @desc Get help message when child is stuck
 * @access Private (authenticated children only)
 */
router.post('/help', MascotController.getHelp);

/**
 * @route POST /api/mascot/celebrate
 * @desc Get celebration message for achievements
 * @access Private (authenticated children only)
 */
router.post('/celebrate', MascotController.celebrate);

export default router;

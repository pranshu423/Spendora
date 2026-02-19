import express from 'express';
import { updateUserProfile, changePassword, deleteUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/profile')
    .put(protect, updateUserProfile)
    .delete(protect, deleteUser);

router.route('/password').put(protect, changePassword);

export default router;

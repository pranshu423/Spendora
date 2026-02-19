import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user && (await user.matchPassword(req.body.currentPassword))) {
        user.password = req.body.newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401);
        throw new Error('Invalid current password');
    }
});

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        // Delete all user data
        await Subscription.deleteMany({ user: user._id });
        await Payment.deleteMany({ user: user._id });
        await user.deleteOne();

        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });

        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { updateUserProfile, changePassword, deleteUser };

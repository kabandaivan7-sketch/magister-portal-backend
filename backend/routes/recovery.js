const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Request password reset
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                message: 'Please enter your email address' 
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Always return success message (security best practice - don't reveal if email exists)
        if (!user) {
            return res.status(200).json({
                message: 'If an account exists with this email, a recovery link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Save token to user
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send recovery email
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            try {
                const transporter = createTransporter();
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                const resetUrl = `${frontendUrl}/reset-password.html?token=${resetToken}`;
                
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'Password Reset Request - Magister Portal',
                    html: `
                        <h2>Password Reset Request</h2>
                        <p>You requested to reset your password. Click the link below to reset it:</p>
                        <a href="${resetUrl}">${resetUrl}</a>
                        <p>This link will expire in 1 hour.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    `
                });
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                return res.status(500).json({
                    message: 'Error sending recovery email. Please try again later.'
                });
            }
        } else {
            // If email is not configured, log the token (for development)
            console.log('Reset token (email not configured):', resetToken);
        }

        res.status(200).json({
            message: 'Recovery email sent! Check your inbox.'
        });
    } catch (error) {
        console.error('Recovery error:', error);
        res.status(500).json({ 
            message: 'Error sending recovery email. Try again.',
            error: error.message 
        });
    }
});

// Reset password with token
router.post('/reset', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ 
                message: 'Token and new password are required' 
            });
        }

        // Find user with valid token
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid or expired reset token' 
            });
        }

        // Update password
        user.password = newPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({
            message: 'Password reset successful! You can now log in.'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ 
            message: 'Error resetting password. Try again.',
            error: error.message 
        });
    }
});

module.exports = router;


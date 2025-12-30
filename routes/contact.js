const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const { AppError } = require('../middleware/errorHandler');

// Create email transporter (configure with your email service)
const createTransporter = () => {
    // For Gmail, you'll need to use an App Password
    // For other services, adjust accordingly
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Contact form submission with validation
router.post('/', [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .escape(),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Message must be between 10 and 5000 characters')
        .escape()
], async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const { name, email, message } = req.body;

        // Save to database
        const contact = new Contact({ name, email, message });
        await contact.save();

        // Send email notification (optional)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            try {
                const transporter = createTransporter();
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                    subject: `New Contact Form Submission from ${name}`,
                    html: `
                        <h2>New Contact Form Submission</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Message:</strong></p>
                        <p>${message}</p>
                    `
                });
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.status(200).json({
            message: 'Message sent successfully!'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        next(new AppError('Error sending message. Try again.', 500));
    }
});

// Get all contact messages (admin only - add authentication later)
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ 
            message: 'Error fetching messages',
            error: error.message 
        });
    }
});

module.exports = router;


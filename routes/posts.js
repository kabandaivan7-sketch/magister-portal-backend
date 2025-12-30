const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { uploadFile, deleteFile } = require('../utils/uploadHandler');

// Configure multer for in-memory storage (we'll upload to S3 or local filesystem)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'));
        }
    }
});

// Create a new post
router.post('/', upload.single('media'), async (req, res) => {
    try {
        const { text } = req.body;
        const file = req.file;

        if (!text && !file) {
            return res.status(400).json({ 
                message: 'Please enter text or upload media' 
            });
        }

        const postData = {
            text: text || '',
            author: null // Set to user ID if authentication is added
        };

        if (file) {
            try {
                const mediaUrl = await uploadFile(file.buffer, file.originalname, file.mimetype);
                postData.mediaUrl = mediaUrl;
                postData.mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
            } catch (uploadError) {
                console.error('Upload error:', uploadError);
                return res.status(500).json({ 
                    message: 'Error uploading media. Try again.',
                    error: uploadError.message 
                });
            }
        }

        const post = new Post(postData);
        await post.save();

        res.status(201).json({
            message: 'Post created successfully',
            post: post
        });
    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).json({ 
            message: 'Error creating post. Try again.',
            error: error.message 
        });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'email')
            .limit(50);
        
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ 
            message: 'Error fetching posts',
            error: error.message 
        });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'email');
        
        if (!post) {
            return res.status(404).json({ 
                message: 'Post not found' 
            });
        }
        
        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ 
            message: 'Error fetching post',
            error: error.message 
        });
    }
});

// Delete post (and associated media)
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ 
                message: 'Post not found' 
            });
        }

        // Delete media file if exists
        if (post.mediaUrl) {
            try {
                await deleteFile(post.mediaUrl);
            } catch (deleteError) {
                console.error('Error deleting media:', deleteError);
                // Continue with post deletion even if file deletion fails
            }
        }

        await Post.findByIdAndDelete(req.params.id);
        
        res.json({
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ 
            message: 'Error deleting post',
            error: error.message 
        });
    }
});

// Serve uploaded files locally (only if not using S3)
const { USE_S3 } = require('../utils/uploadHandler');
if (!USE_S3) {
    const express_static = require('express');
    router.use('/uploads', express_static.static('uploads'));
}

module.exports = router;


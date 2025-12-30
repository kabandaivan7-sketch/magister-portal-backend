const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// VALIDATE ENVIRONMENT VARIABLES (Production)
// ============================================
if (NODE_ENV === 'production') {
    const requiredEnvVars = [
        'JWT_SECRET',
        'MONGODB_URI',
        'EMAIL_USER',
        'EMAIL_PASSWORD',
        'ALLOWED_ORIGINS'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
        console.error(`\n❌ FATAL: Missing required environment variables for production:`);
        missingEnvVars.forEach(envVar => {
            console.error(`   - ${envVar}`);
        });
        console.error(`\nPlease set all required environment variables before starting the server.\n`);
        process.exit(1);
    }
    
    console.log('✅ All required environment variables are set');
}

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    }
}));

// HTTPS Enforcement Middleware (for production)
if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
        // Check for x-forwarded-proto (used by Railway, Heroku, etc.)
        if (req.header('x-forwarded-proto') !== 'https') {
            const host = req.header('host');
            return res.redirect(`https://${host}${req.url}`);
        }
        next();
    });
}

// CORS Configuration - Restrict to your domain in production
const corsOptions = {
    origin: (origin, callback) => {
        if (NODE_ENV === 'development') {
            callback(null, true);
            return;
        }
        
        const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
            .split(',')
            .map(o => o.trim())
            .filter(o => o);
        
        // Also add FRONTEND_URL if set
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true
});
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'production') {
    app.use(morgan('combined')); // Apache combined log format
} else {
    app.use(morgan('dev')); // Colored output for development
}

// Serve static files (HTML, CSS, JS, images)
// Only serve specific directories in production
if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname), {
        dotfiles: 'ignore',
        index: false
    }));
} else {
    app.use(express.static(path.join(__dirname)));
}

// Import error handler
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const postRoutes = require('./routes/posts');
const recoveryRoutes = require('./routes/recovery');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/recover', recoveryRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/magisterportal')
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'MagisterPortal.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.path 
    });
});

// Global error handler middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server gracefully
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`🔒 Security: ${NODE_ENV === 'production' ? 'ENABLED' : 'DEVELOPMENT MODE'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});


# Magister Portal Backend

Node.js/Express backend server with MongoDB for the Magister Portal website.

## Features

- ✅ User authentication (Signup/Login)
- ✅ Password recovery with email
- ✅ Contact form with email notifications
- ✅ Blog post creation with media uploads
- ✅ JWT token-based authentication
- ✅ Secure password hashing with bcrypt
- ✅ File upload support (images/videos)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration:
     ```env
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/magisterportal
     JWT_SECRET=your-secret-key-here
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-password
     ```

3. **Set up MongoDB:**
   
   **Option A: Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - Use: `mongodb://localhost:27017/magisterportal`
   
   **Option B: MongoDB Atlas (Cloud)**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster
   - Get connection string
   - Use: `mongodb+srv://username:password@cluster.mongodb.net/magisterportal`

4. **Set up Email (Optional but recommended):**
   
   **For Gmail:**
   - Enable 2-Factor Authentication
   - Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Use the App Password in `EMAIL_PASSWORD`

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact messages (admin)

### Posts
- `POST /api/posts` - Create a new post (with optional media)
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post

### Recovery
- `POST /api/recover` - Request password reset
- `POST /api/recover/reset` - Reset password with token

## Frontend Integration

Update `MagisterPortal.js` to use:
```javascript
const API_URL = 'http://localhost:3000/api';
```

Or for production:
```javascript
const API_URL = 'https://your-backend-domain.com/api';
```

## File Structure

```
.
├── server.js              # Main server file
├── models/                # MongoDB models
│   ├── User.js
│   ├── Contact.js
│   └── Post.js
├── routes/                # API routes
│   ├── auth.js
│   ├── contact.js
│   ├── posts.js
│   └── recovery.js
├── middleware/            # Middleware functions
│   └── auth.js
├── uploads/              # Uploaded media files (created automatically)
├── .env                  # Environment variables (create from .env.example)
└── package.json
```

## Security Notes

1. **Change JWT_SECRET** to a strong random string in production
2. **Use HTTPS** in production
3. **Set NODE_ENV=production** in production
4. **Don't commit .env** file (already in .gitignore)
5. **Use MongoDB Atlas** with proper security settings for production

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for Atlas)

**Email Not Sending:**
- Check email credentials in `.env`
- For Gmail, use App Password (not regular password)
- Check spam folder

**File Upload Issues:**
- Ensure `uploads/` directory exists (created automatically)
- Check file size limits (10MB default)
- Verify file types are allowed

## Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or secure MongoDB instance
3. Use strong JWT_SECRET
4. Set up proper email service
5. Use HTTPS
6. Set up process manager (PM2 recommended)
7. Configure CORS for your domain

## License

ISC


# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Generate JWT Secret

**You need a secure random string for JWT_SECRET.** Choose one method:

### Method 1: Use the Generator Script (Easiest)
```bash
node generate-jwt-secret.js
```
This will generate a secure random string. Copy the output and use it in your `.env` file.

### Method 2: Use Node.js Command Line
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 3: Use Online Generator
Visit: https://generate-secret.vercel.app/64 (or any secure random string generator)
Generate a 64+ character random string.

### Method 4: Use PowerShell (Windows)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

**Important:** The JWT secret should be:
- At least 32 characters long
- Random and unpredictable
- Different for each environment (dev/production)
- Never shared or committed to git

## Step 3: Create .env File
Create a file named `.env` in the root directory with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/magisterportal

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/magisterportal

# JWT Secret (REQUIRED - see methods below to generate one)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Optional - for contact form and password recovery)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@magisterportal.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Step 4: Set Up MongoDB

### Option A: Local MongoDB
1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use: `mongodb://localhost:27017/magisterportal`

### Option B: MongoDB Atlas (Free Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string
5. Replace username/password in connection string
6. Use in `.env`: `mongodb+srv://username:password@cluster.mongodb.net/magisterportal`

## Step 5: Set Up Email (Optional)

For Gmail:
1. Enable 2-Factor Authentication
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate App Password
4. Use it in `EMAIL_PASSWORD`

## Step 6: Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3000`

## Step 7: Test the Website

1. Open `http://localhost:3000` in your browser
2. Try signing up a new user
3. Try logging in
4. Submit the contact form
5. Create a blog post

## Troubleshooting

- **MongoDB connection error**: Check if MongoDB is running and connection string is correct
- **Email not working**: Check email credentials, use App Password for Gmail
- **Port already in use**: Change PORT in `.env` to another number (e.g., 3001)


# Railway Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in (create account if needed)
2. Click **"New"** to create a new repository
3. Name it: `magister-portal`
4. Description: `Magister Portal Website - Production Ready`
5. Choose **Public** (for Railway to access it)
6. Click **Create repository**

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```powershell
cd "c:\Users\Dell\Magister Portal Website"

# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/magister-portal.git

# Rename main branch
git branch -M main

# Push code to GitHub
git push -u origin main
```

## Step 3: Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Click **Start Free** or **Login**
3. Sign up with GitHub (recommended - easier)
4. Authorize Railway to access your GitHub account

## Step 4: Create New Project on Railway

1. Click **"New Project"** in Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Find and select `magister-portal` repository
4. Click **Deploy**

## Step 5: Configure Environment Variables

Railway will automatically detect Node.js. Now add environment variables:

1. In Railway dashboard, go to your project
2. Click **"Variables"** tab
3. Add these variables:

```
PORT=3000
NODE_ENV=production

MONGODB_URI=mongodb+srv://magister_admin:%401Kabanda@magister-portal.6bp5z35.mongodb.net/magister_portal_db

JWT_SECRET=d0d22086378a398e46f9237be63d032093653f426062b03b949b3342b0d8e276

EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

FRONTEND_URL=https://your-railway-domain.up.railway.app

ALLOWED_ORIGINS=https://your-railway-domain.up.railway.app
```

## Step 6: Wait for Deployment

Railway automatically builds and deploys. You'll see:
- ✅ Build logs
- ✅ Deployment status
- ✅ Your live URL (e.g., `magister-portal-production.up.railway.app`)

## Step 7: Test Production Server

Open your Railway URL and test:
- ✅ Homepage loads
- ✅ Login/Signup works
- ✅ Blog posts display
- ✅ Contact form submits
- ✅ Password recovery works

## Step 8: Set Up Custom Domain (Optional)

1. Go to Railway project settings
2. Click **"Domain"**
3. Add your custom domain (if you have one)
4. Update DNS records with Railway's nameservers

---

## Troubleshooting

### Build Failed
- Check build logs in Railway dashboard
- Usually caused by missing environment variables

### Cannot Connect to MongoDB
- Verify MONGODB_URI is correct
- Add Railway IP to MongoDB Atlas whitelist:
  1. Go to MongoDB Atlas
  2. Network Access
  3. Add IP Address: `0.0.0.0/0` (allows all - only for testing)

### Deployment Takes Too Long
- First deployment can take 5-10 minutes
- Subsequent deployments are faster

### HTTPS Not Working
- Railway provides free SSL certificate
- Takes a few minutes to activate
- Check "Enforce HTTPS" in Railway settings

---

## Next Steps After Deployment

1. **Monitor your app** - Check logs in Railway dashboard
2. **Set up error tracking** - Add Sentry.io integration
3. **Configure email** - Test password recovery
4. **Backup database** - Set up MongoDB Atlas backups
5. **Add monitoring** - Use Railway's built-in metrics

---

## Quick Commands Reference

```powershell
# Check git status
git status

# View git log
git log --oneline

# Push new changes to production
git add .
git commit -m "Your message"
git push origin main

# Railway will auto-deploy on git push!
```

---

**Your website will be live in minutes!** 🚀

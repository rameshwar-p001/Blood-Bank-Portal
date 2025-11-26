# Vercel Deployment Guide for Blood Donation System

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - Project name: **blood-donation-system**
   - Directory: **./dist** (if asked)

### Option 2: Deploy via Vercel Dashboard

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

## ⚙️ Environment Variables Setup

After deployment, add environment variables in Vercel dashboard:

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```
VITE_EMAILJS_SERVICE_ID=service_zi8rh8s
VITE_EMAILJS_TEMPLATE_ID_APPLY=template_riwjqbi
VITE_EMAILJS_TEMPLATE_ID_STATUS=template_pdkx95n
VITE_EMAILJS_PUBLIC_KEY=BbHwlQ4GampI1ZaIc
VITE_EMAILJS_USER_ID=BbHwlQ4GampI1ZaIc

VITE_FIREBASE_API_KEY=AIzaSyANC9IEGhH8_GPjDT5xxjHpY0QK02J3luQ
VITE_FIREBASE_AUTH_DOMAIN=awp-job.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=awp-job
VITE_FIREBASE_STORAGE_BUCKET=awp-job.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=502883934375
VITE_FIREBASE_APP_ID=1:502883934375:web:6f6ea7bc63f2ea8118fb82
```

## 🔧 Vercel Configuration

The `vercel.json` file is already configured:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 🌐 Custom Domain (Optional)

After deployment, you can add a custom domain:

1. Go to project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS settings as instructed

## ✅ Deployment Checklist

Before deploying, ensure:
- [x] All API keys moved to `.env` file
- [x] `.env` added to `.gitignore`
- [x] `vercel.json` configuration file created
- [x] All dependencies in `package.json`
- [x] Build command works locally (`npm run build`)
- [x] Firebase project is active and accessible

## 🚀 Post-Deployment Steps

1. **Test the deployment** on the provided Vercel URL
2. **Add environment variables** in Vercel dashboard
3. **Redeploy** to apply environment variables
4. **Test all features:**
   - User registration/login
   - Firebase database connection
   - EmailJS contact form
   - All navigation and features

## 📱 Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Pull request previews are automatically created
- Roll back to previous deployments easily

## 🆘 Troubleshooting

### Build Fails?
- Check if all dependencies are in `package.json`
- Ensure no TypeScript errors
- Verify build works locally: `npm run build`

### Environment Variables Not Working?
- Ensure all variables start with `VITE_`
- Redeploy after adding environment variables
- Check variable names match exactly

### Firebase Connection Issues?
- Verify Firebase project is active
- Check Firebase configuration in Vercel environment variables
- Ensure Firestore and Authentication are enabled

### EmailJS Not Working?
- Verify EmailJS service and templates exist
- Check EmailJS credentials in environment variables
- Test EmailJS integration locally first

---

Your Blood Donation System is now ready for production deployment on Vercel! 🩸✨
# Deployment Guide for Vercel

## Prerequisites
- Vercel account (https://vercel.com)
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)

## Step 1: Prepare MongoDB Database

1. Create a free MongoDB Atlas cluster
2. Create a database user with password
3. Whitelist all IP addresses (0.0.0.0/0) for Vercel deployment
4. Get your MongoDB connection string (it looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/
   ```

## Step 2: Project Structure for Vercel

Your project should have this structure:
```
/
├── backend/
│   ├── server.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── vercel.json
├── requirements.txt (root level for backend)
└── README.md
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as `./`
   - **Build Command**: Leave default or empty
   - **Output Directory**: Leave default

4. Add Environment Variables:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=attribution_db
   CORS_ORIGINS=https://your-project.vercel.app
   ```

5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your project directory:
   ```bash
   cd /path/to/your/project
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Follow the prompts:
   - Set up and deploy? Y
   - Which scope? Select your account
   - Link to existing project? N
   - What's your project's name? attribution-iq (or your choice)
   - In which directory is your code located? ./
   - Want to override settings? N

6. Add environment variables:
   ```bash
   vercel env add MONGO_URL
   # Paste your MongoDB connection string

   vercel env add DB_NAME
   # Enter: attribution_db

   vercel env add CORS_ORIGINS
   # Enter: https://your-project.vercel.app
   ```

7. Redeploy with environment variables:
   ```bash
   vercel --prod
   ```

## Step 4: Update Frontend Environment

After deployment, update your frontend environment variable:

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   ```
   REACT_APP_BACKEND_URL=https://your-project.vercel.app
   ```

## Step 5: Test Your Deployment

1. Visit your deployed URL: `https://your-project.vercel.app`
2. The app should load and automatically generate sample data
3. Test all attribution models
4. Check journey explorer and detail views

## Troubleshooting

### Backend API not working
- Check Vercel Function Logs in dashboard
- Verify MONGO_URL is correct and database is accessible
- Ensure CORS_ORIGINS includes your Vercel domain

### Frontend not loading
- Check browser console for errors
- Verify REACT_APP_BACKEND_URL is set correctly
- Clear browser cache and reload

### Database connection errors
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database user credentials
- Ensure database name exists or will be created

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update CORS_ORIGINS environment variable to include your custom domain

## Performance Optimization

For production use:
1. Enable Vercel Analytics
2. Configure caching headers
3. Consider MongoDB indexes for large datasets
4. Monitor function execution times

## Continuous Deployment

Once connected to Git:
- Push to main/master branch → Auto-deploy to production
- Push to other branches → Auto-deploy preview URLs
- Pull requests → Automatic preview deployments

## Cost Considerations

- Vercel Free Tier: 100GB bandwidth/month, serverless functions
- MongoDB Atlas Free Tier: 512MB storage, shared cluster
- Both free tiers are sufficient for demo/small projects

## Support

For issues:
- Vercel: https://vercel.com/support
- MongoDB: https://www.mongodb.com/support

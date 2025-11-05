# Quick Vercel Deployment Setup

## What Was Done

✅ **Removed .gitignore files** - Project is ready for Git without restrictions
✅ **Created vercel.json** - Vercel deployment configuration for FastAPI + React
✅ **Removed all branding** - No "Made with Emergent" or similar text in code
✅ **Added comprehensive documentation** - README, DEPLOYMENT, and PROJECT_STRUCTURE guides
✅ **Root requirements.txt** - Backend dependencies for Vercel Python runtime

## File Structure for Vercel

```
attribution-iq/
├── backend/
│   ├── server.py              ✅ FastAPI backend
│   └── requirements.txt       ✅ Python dependencies
├── frontend/
│   ├── src/                   ✅ React application
│   └── package.json           ✅ Node dependencies
├── vercel.json                ✅ Vercel config (NEW)
├── requirements.txt           ✅ Root Python deps (NEW)
├── README.md                  ✅ Project docs (UPDATED)
├── DEPLOYMENT.md              ✅ Deploy guide (NEW)
└── PROJECT_STRUCTURE.md       ✅ Structure docs (NEW)
```

## Quick Deploy Steps

### 1. Push to GitHub
```bash
cd /path/to/your/project
git init
git add .
git commit -m "Initial commit - Attribution IQ"
git branch -M main
git remote add origin https://github.com/yourusername/attribution-iq.git
git push -u origin main
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add MONGO_URL
# Enter your MongoDB connection string

vercel env add DB_NAME
# Enter: attribution_db

vercel env add CORS_ORIGINS
# Enter: https://your-project.vercel.app

# Deploy to production
vercel --prod
```

### 3. Get MongoDB Connection String

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (free M0)
4. Create database user
5. Whitelist all IPs: 0.0.0.0/0
6. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/`

## Vercel Configuration Explained

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.py",
      "use": "@vercel/python"          // Python runtime for API
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",   // React build
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.py"      // Route /api/* to backend
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"            // Route everything else to frontend
    }
  ]
}
```

### How It Works

1. **Build Phase**:
   - Vercel runs Python build for backend (`server.py`)
   - Vercel runs `yarn build` for frontend (creates `build/` folder)

2. **Runtime**:
   - API requests to `/api/*` → Serverless Python function
   - All other requests → Static React files

3. **Serverless Functions**:
   - Each API endpoint becomes a serverless function
   - Auto-scaling based on traffic
   - Cold start: ~1-2 seconds (first request)
   - Warm requests: <100ms

## Environment Variables Required

| Variable | Example | Description |
|----------|---------|-------------|
| `MONGO_URL` | `mongodb+srv://...` | MongoDB connection string |
| `DB_NAME` | `attribution_db` | Database name |
| `CORS_ORIGINS` | `https://yourapp.vercel.app` | Allowed origins for CORS |
| `REACT_APP_BACKEND_URL` | `https://yourapp.vercel.app` | Frontend API URL |

## Post-Deployment Testing

1. Visit your Vercel URL
2. App should load and auto-generate sample data
3. Test switching attribution models
4. Test journey search and filters
5. Check journey detail modal
6. Verify all charts render correctly

## Troubleshooting

### API not responding
```bash
# Check Vercel function logs
vercel logs --follow
```

### Frontend shows errors
- Open browser DevTools → Console
- Check Network tab for failed requests
- Verify REACT_APP_BACKEND_URL is set

### Database connection failed
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
- Check MONGO_URL format
- Ensure database user has read/write permissions

## Vercel Features Used

- ✅ Serverless Functions (Python)
- ✅ Static Site Hosting (React)
- ✅ Environment Variables
- ✅ Automatic HTTPS
- ✅ CDN Global Distribution
- ✅ Git Integration (auto-deploy on push)
- ✅ Preview Deployments (PRs)

## Performance Notes

- **Free Tier Limits**:
  - 100GB bandwidth/month
  - 100 serverless function executions/day
  - 10 deployments/day
  - Sufficient for demo/small projects

- **Cold Starts**:
  - First API request: ~1-2 seconds
  - Subsequent requests: <100ms
  - Minimize by keeping functions warm (periodic pings)

- **Optimization Tips**:
  - Enable Vercel Analytics
  - Use Edge Caching headers
  - Optimize bundle size (already done with Tailwind)
  - Monitor function execution times

## Custom Domain Setup

1. Purchase domain (e.g., from Namecheap, GoDaddy)
2. In Vercel Dashboard → Project Settings → Domains
3. Add your domain
4. Update DNS records as shown
5. Update `CORS_ORIGINS` to include custom domain
6. SSL certificate auto-provisioned by Vercel

## Continuous Deployment

Once connected to GitHub:
- Push to `main` → Auto-deploy to production
- Push to other branches → Preview URLs
- Pull Requests → Automatic preview deployments

Each deployment gets a unique URL for testing before merging.

## Cost Estimate

**Free Tier (sufficient for this project):**
- Vercel: $0/month (100GB bandwidth)
- MongoDB Atlas: $0/month (512MB storage)

**Pro Tier (if you need more):**
- Vercel Pro: $20/month (1TB bandwidth)
- MongoDB M10: $57/month (10GB storage, backups)

## Alternative Deployment Options

If not using Vercel:
- **Frontend**: Netlify, Cloudflare Pages, GitHub Pages
- **Backend**: Railway, Render, Heroku, AWS Lambda
- **Database**: MongoDB Atlas (free tier), AWS DocumentDB

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

## Files Updated/Created

1. ✅ Removed `/app/.gitignore`
2. ✅ Removed `/app/frontend/.gitignore`
3. ✅ Created `/app/vercel.json`
4. ✅ Created `/app/requirements.txt`
5. ✅ Updated `/app/README.md`
6. ✅ Created `/app/DEPLOYMENT.md`
7. ✅ Created `/app/PROJECT_STRUCTURE.md`
8. ✅ Updated `/app/frontend/src/App.js` (removed branding)
9. ✅ Updated `/app/frontend/src/App.css` (hide external badges)

**Your project is now ready for Vercel deployment!**

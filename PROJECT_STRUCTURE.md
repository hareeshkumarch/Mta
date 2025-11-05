# Project Structure

## Root Directory
```
attribution-iq/
├── backend/                    # FastAPI backend
│   ├── server.py              # Main API server with all endpoints
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # React frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── ui/           # Shadcn UI components
│   │   ├── App.js            # Main application component
│   │   ├── App.css           # Application styles
│   │   ├── index.js          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── postcss.config.js     # PostCSS configuration
│   └── craco.config.js       # Create React App configuration
│
├── vercel.json               # Vercel deployment configuration
├── requirements.txt          # Root Python dependencies (for Vercel)
├── README.md                 # Project documentation
├── DEPLOYMENT.md             # Deployment guide
└── PROJECT_STRUCTURE.md      # This file
```

## Key Files Description

### Backend Files

**`backend/server.py`**
- Main FastAPI application
- Implements all 7 attribution models
- MongoDB integration with Motor (async driver)
- Sample data generation with 150 customer journeys
- API endpoints for journeys, attribution calculations, and statistics

**`backend/requirements.txt`**
- FastAPI and Uvicorn for API server
- Motor for async MongoDB
- Pydantic for data validation
- Python-dotenv for environment variables

### Frontend Files

**`frontend/src/App.js`**
- Main React application component
- Attribution model selector and switcher
- KPI dashboard with 6 key metrics
- Channel performance table with sorting
- Attribution comparison chart (Recharts)
- Customer journey explorer with search/filter
- Journey detail modal with timeline visualization

**`frontend/src/App.css`**
- Custom styles and animations
- Font imports (Space Grotesk, Inter)
- Smooth transitions and hover effects
- Responsive design utilities

**`frontend/src/components/ui/`**
- Shadcn UI components library
- Pre-built accessible components
- Includes: Button, Card, Dialog, Table, Select, Input, Badge, Tooltip, Tabs

**`frontend/package.json`**
- React 19 and React DOM
- Recharts for data visualization
- Axios for API calls
- Radix UI components (Shadcn foundation)
- Lucide React for icons
- Tailwind CSS for styling

### Configuration Files

**`vercel.json`**
- Vercel deployment configuration
- Routes API requests to backend
- Serves frontend static files
- Handles serverless function deployment

**`tailwind.config.js`**
- Tailwind CSS customization
- Color palette definitions
- Typography settings
- Plugin configurations

## Data Flow

1. **Initial Load**
   - Frontend checks for existing data via `/api/stats`
   - If no data exists, calls `/api/generate-data`
   - Generates 150 sample journeys with realistic patterns

2. **Model Selection**
   - User selects attribution model
   - Frontend calls `/api/attribution/{model}`
   - Backend calculates attribution based on selected model
   - Results displayed in performance table

3. **Journey Explorer**
   - Frontend fetches all journeys via `/api/journeys`
   - Displays in searchable/filterable table
   - Click "View" to see journey details
   - Modal shows timeline with touchpoint sequence

4. **Model Comparison**
   - Frontend calls `/api/attribution/compare/all`
   - Backend calculates all 7 models simultaneously
   - Stacked bar chart shows visual comparison

## Database Schema

### Journeys Collection
```javascript
{
  journey_id: "J001",
  customer_name: "Aarav Sharma",
  conversion_value: 28380.50,
  conversion_date: "2024-10-15T10:30:00",
  touchpoint_count: 5,
  time_to_conversion: 39,
  touchpoints: [
    {
      sequence: 1,
      channel: "Organic Search",
      timestamp: "2024-09-06T08:15:00",
      cost: 0,
      interaction_type: "Click",
      days_before_conversion: 31
    },
    // ... more touchpoints
  ]
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Health check |
| POST | `/api/generate-data` | Generate 150 sample journeys |
| GET | `/api/journeys` | Get all customer journeys |
| GET | `/api/journeys/{id}` | Get specific journey details |
| GET | `/api/attribution/{model}` | Get attribution for model |
| GET | `/api/attribution/compare/all` | Compare all 7 models |
| GET | `/api/stats` | Get overall statistics |

## Attribution Models Implemented

1. **First-Touch**: 100% credit to first touchpoint
2. **Last-Touch**: 100% credit to last touchpoint
3. **Last Non-Direct**: 100% to last paid channel
4. **Linear**: Equal distribution across all touchpoints
5. **Time Decay**: Exponential weighting (7-day half-life)
6. **U-Shaped**: 40% first, 40% last, 20% middle
7. **W-Shaped**: 30% first, 30% middle, 30% last, 10% others

## Sample Data Characteristics

- 150 unique customer journeys
- 11 marketing channels (Google Ads, Facebook, Instagram, LinkedIn, Email, Organic, Direct, YouTube, Blog, Webinar, Referral)
- 2-8 touchpoints per journey
- Conversion values: ₹1,000 - ₹50,000
- Time to conversion: 1-45 days
- Realistic journey patterns (paid first, organic/direct last)
- Indian customer names and rupee currency formatting

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=attribution_db
CORS_ORIGINS=*
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Production (Vercel)
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=attribution_db
CORS_ORIGINS=https://your-domain.vercel.app
REACT_APP_BACKEND_URL=https://your-domain.vercel.app
```

## Design System

### Colors
- Primary: Navy Blue (#0f172a)
- Accent: Purple (#8b5cf6)
- Background: Slate gradients
- Channel Colors: Unique per channel (11 total)

### Typography
- Headings: Space Grotesk (400-700)
- Body: Inter (400-700)
- Size hierarchy: xl to 6xl for headings

### Components
- Professional SaaS aesthetic
- Smooth transitions (200ms)
- Hover effects with transform
- Color-coded ROAS (green/yellow/red)
- Efficiency star ratings

## Performance Optimizations

- Async MongoDB queries with Motor
- React state management for data caching
- Recharts for efficient chart rendering
- Tailwind CSS for minimal CSS bundle
- Lazy loading for journey details
- Filtered journey display (20 at a time)

## Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user configured
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] Environment variables added to Vercel
- [ ] vercel.json configured
- [ ] Frontend build tested locally
- [ ] Backend API tested locally
- [ ] Deployed to Vercel
- [ ] Sample data generated
- [ ] All attribution models tested
- [ ] Journey explorer working
- [ ] Custom domain configured (optional)

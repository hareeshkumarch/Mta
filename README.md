# AttributionIQ - Marketing Attribution Analytics Dashboard

A comprehensive marketing attribution dashboard that analyzes customer journeys across multiple touchpoints and calculates attribution credit using 7 different attribution models.

## Features

- **7 Attribution Models**: First-Touch, Last-Touch, Last Non-Direct, Linear, Time Decay, U-Shaped, W-Shaped
- **150 Sample Journeys**: Auto-generated realistic customer journeys with Indian names and conversion data
- **Channel Performance Analytics**: Compare 11 marketing channels with ROAS and efficiency metrics
- **Journey Explorer**: Search, filter and view detailed customer journey timelines
- **Model Comparison**: Visual comparison of how different models attribute revenue

## Tech Stack

- **Frontend**: React 19, Recharts, Shadcn UI, Tailwind CSS
- **Backend**: FastAPI, Python
- **Database**: MongoDB

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## Deployment to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Environment Variables

Set these in Vercel dashboard:
- `MONGO_URL`: Your MongoDB connection string
- `DB_NAME`: Database name
- `CORS_ORIGINS`: Allowed origins (e.g., https://yourdomain.vercel.app)

## Attribution Models Explained

### First-Touch Attribution
Gives 100% credit to the first touchpoint in the customer journey.

### Last-Touch Attribution
Gives 100% credit to the last touchpoint before conversion.

### Last Non-Direct Click
Gives 100% credit to the last paid/non-direct touchpoint.

### Linear Attribution
Distributes credit equally across all touchpoints.

### Time Decay Attribution
Gives exponentially more credit to recent touchpoints (7-day half-life).

### U-Shaped (Position-Based)
40% to first touch, 40% to last touch, 20% split among middle.

### W-Shaped Attribution
30% first, 30% middle key touchpoint, 30% last, 10% to others.

## API Endpoints

- `GET /api/` - Health check
- `POST /api/generate-data` - Generate sample data
- `GET /api/journeys` - Get all journeys
- `GET /api/journeys/{journey_id}` - Get single journey
- `GET /api/attribution/{model}` - Get attribution for specific model
- `GET /api/attribution/compare/all` - Compare all models
- `GET /api/stats` - Get overall statistics

## License

MIT

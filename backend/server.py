from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Indian names for sample data
INDIAN_NAMES = [
    "Aarav Sharma", "Vivaan Patel", "Aditya Kumar", "Vihaan Singh", "Arjun Reddy",
    "Sai Krishnan", "Reyansh Mehta", "Ayaan Gupta", "Krishna Desai", "Ishaan Verma",
    "Shaurya Joshi", "Atharv Nair", "Pranav Iyer", "Dhruv Rao", "Kabir Malhotra",
    "Advait Shah", "Arnav Kapoor", "Shivaay Pillai", "Aadhya Sharma", "Ananya Patel",
    "Diya Kumar", "Sara Singh", "Ira Reddy", "Myra Krishnan", "Navya Mehta",
    "Pari Gupta", "Kiara Desai", "Anika Verma", "Saanvi Joshi", "Aarohi Nair",
    "Riya Iyer", "Kavya Rao", "Avni Malhotra", "Shanaya Shah", "Aditi Kapoor",
    "Aadhya Pillai", "Zara Thakur", "Anvi Chopra", "Aanya Bhatt", "Ahana Saxena",
    "Priya Agarwal", "Neha Bansal", "Pooja Sinha", "Rajesh Kumar", "Suresh Menon",
    "Vikram Chawla", "Manoj Kulkarni", "Deepak Pandey", "Sanjay Bose", "Rahul Mishra",
    "Amit Trivedi", "Karan Sethi", "Rohan Ghosh", "Nikhil Yadav", "Varun Jain",
    "Sandeep Rawat", "Manish Tiwari", "Rohit Dubey", "Akash Dixit", "Yogesh Tandon",
    "Harish Khanna", "Vishal Arora", "Gaurav Soni", "Ajay Dhawan", "Siddharth Goel",
    "Rishabh Bhatia", "Kartik Kohli", "Yash Ahuja", "Dev Garg", "Aryan Chauhan",
    "Lakshmi Ramesh", "Meera Subramanian", "Sneha Venkatesh", "Divya Balakrishnan",
    "Kavitha Natarajan", "Anjali Rajan", "Geetha Srinivasan", "Preethi Mohan",
    "Swetha Gopal", "Nithya Vijay", "Shruthi Arun", "Bhavana Krishna",
    "Varsha Prasad", "Madhavi Kumar", "Radha Shankar", "Uma Anand",
    "Karthik Murthy", "Naveen Reddy", "Mahesh Kumar", "Sunil Prakash",
    "Arun Venkat", "Vinod Ramachandran", "Ramesh Sundaram", "Ganesh Krishnan",
    "Ravi Kumar", "Balaji Narayanan", "Senthil Raman", "Praveen Sathyan",
    "Aravind Gopalan", "Murali Chandran", "Shyam Menon", "Hari Subramanian",
    "Vijay Karthik", "Ashok Kumar", "Prakash Narayan", "Dinesh Iyer",
    "Gopal Srinivas", "Nagaraj Venkataraman", "Selvam Raja", "Babu Krishnamurthy",
    "Prabhu Ramakrishnan", "Mani Soundararajan", "Elango Thirumalai",
    "Jayakumar Palaniappan", "Mohan Rajendran", "Sekar Kannan"
]

CHANNELS = [
    "Google Ads", "Facebook Ads", "Instagram", "LinkedIn", "Email Campaign",
    "Organic Search", "Direct Traffic", "YouTube", "Blog Content", "Webinar", "Referral"
]

PAID_CHANNELS = ["Google Ads", "Facebook Ads", "Instagram", "LinkedIn", "YouTube"]

INTERACTION_TYPES = ["Click", "View", "Engagement", "Download", "Form Fill"]

# Define Models
class Touchpoint(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sequence: int
    channel: str
    timestamp: str
    cost: float
    interaction_type: str
    days_before_conversion: int

class Journey(BaseModel):
    model_config = ConfigDict(extra="ignore")
    journey_id: str
    customer_name: str
    conversion_value: float
    conversion_date: str
    touchpoint_count: int
    time_to_conversion: int
    touchpoints: List[Touchpoint]

class AttributionResult(BaseModel):
    channel: str
    attributed_revenue: float
    attribution_percentage: float
    touchpoint_count: int
    cost: float
    roas: float
    conversions_influenced: int
    avg_position: float

class ModelComparison(BaseModel):
    model_name: str
    channels: List[AttributionResult]

# Sample data generation
async def generate_sample_data():
    """Generate 150 sample customer journeys with realistic patterns"""
    journeys = []
    conversion_end_date = datetime.now(timezone.utc)
    conversion_start_date = conversion_end_date - timedelta(days=90)
    
    for i in range(150):
        journey_id = f"J{str(i+1).zfill(3)}"
        customer_name = random.choice(INDIAN_NAMES)
        conversion_value = round(random.uniform(1000, 50000), 2)
        time_to_conversion = random.randint(1, 45)
        conversion_date = conversion_start_date + timedelta(
            days=random.randint(0, 90)
        )
        
        # Generate touchpoints with realistic patterns
        touchpoint_count = random.randint(2, 8)
        touchpoints = []
        
        # Create journey patterns based on common flows
        pattern_type = random.choice(["paid_first", "organic_first", "mixed"])
        
        available_channels = CHANNELS.copy()
        used_channels = []
        
        for seq in range(1, touchpoint_count + 1):
            # Pattern logic
            if seq == 1 and pattern_type == "paid_first":
                channel = random.choice([c for c in PAID_CHANNELS if c in available_channels])
            elif seq == 1 and pattern_type == "organic_first":
                channel = random.choice(["Organic Search", "Blog Content", "Referral"])
            elif seq == touchpoint_count:
                # Last touchpoint more likely to be direct or organic
                channel = random.choice(["Direct Traffic", "Organic Search", "Email Campaign"])
            else:
                channel = random.choice(available_channels)
            
            # Remove channel to avoid duplicates in small journeys
            if channel in available_channels:
                available_channels.remove(channel)
            used_channels.append(channel)
            
            # Calculate timestamp
            days_before = int((time_to_conversion / touchpoint_count) * (touchpoint_count - seq))
            touchpoint_date = conversion_date - timedelta(days=days_before)
            
            # Cost for paid channels
            cost = round(random.uniform(50, 5000), 2) if channel in PAID_CHANNELS else 0.0
            
            interaction_type = random.choice(INTERACTION_TYPES)
            
            touchpoint = {
                "sequence": seq,
                "channel": channel,
                "timestamp": touchpoint_date.isoformat(),
                "cost": cost,
                "interaction_type": interaction_type,
                "days_before_conversion": days_before
            }
            touchpoints.append(touchpoint)
        
        journey = {
            "journey_id": journey_id,
            "customer_name": customer_name,
            "conversion_value": conversion_value,
            "conversion_date": conversion_date.isoformat(),
            "touchpoint_count": touchpoint_count,
            "time_to_conversion": time_to_conversion,
            "touchpoints": touchpoints
        }
        journeys.append(journey)
    
    # Clear existing data and insert new
    await db.journeys.delete_many({})
    await db.journeys.insert_many(journeys)
    
    return {"message": f"Generated {len(journeys)} sample journeys", "count": len(journeys)}

# Attribution calculation functions
def calculate_first_touch(journeys: List[Dict]) -> List[AttributionResult]:
    """100% credit to first touchpoint"""
    channel_data = {}
    
    for journey in journeys:
        first_tp = journey["touchpoints"][0]
        channel = first_tp["channel"]
        
        if channel not in channel_data:
            channel_data[channel] = {
                "revenue": 0,
                "touchpoints": 0,
                "cost": 0,
                "conversions": 0,
                "positions": []
            }
        
        channel_data[channel]["revenue"] += journey["conversion_value"]
        channel_data[channel]["conversions"] += 1
        
        for tp in journey["touchpoints"]:
            if tp["channel"] == channel:
                channel_data[channel]["touchpoints"] += 1
                channel_data[channel]["cost"] += tp["cost"]
                channel_data[channel]["positions"].append(tp["sequence"])
    
    return format_attribution_results(channel_data, sum(j["conversion_value"] for j in journeys))

def calculate_last_touch(journeys: List[Dict]) -> List[AttributionResult]:
    """100% credit to last touchpoint"""
    channel_data = {}
    
    for journey in journeys:
        last_tp = journey["touchpoints"][-1]
        channel = last_tp["channel"]
        
        if channel not in channel_data:
            channel_data[channel] = {
                "revenue": 0,
                "touchpoints": 0,
                "cost": 0,
                "conversions": 0,
                "positions": []
            }
        
        channel_data[channel]["revenue"] += journey["conversion_value"]
        channel_data[channel]["conversions"] += 1
        
        for tp in journey["touchpoints"]:
            if tp["channel"] == channel:
                channel_data[channel]["touchpoints"] += 1
                channel_data[channel]["cost"] += tp["cost"]
                channel_data[channel]["positions"].append(tp["sequence"])
    
    return format_attribution_results(channel_data, sum(j["conversion_value"] for j in journeys))

def calculate_last_non_direct(journeys: List[Dict]) -> List[AttributionResult]:
    """100% credit to last non-direct touchpoint"""
    channel_data = {}
    
    for journey in journeys:
        # Find last non-direct touchpoint
        last_non_direct = None
        for tp in reversed(journey["touchpoints"]):
            if tp["channel"] != "Direct Traffic":
                last_non_direct = tp
                break
        
        if not last_non_direct:
            last_non_direct = journey["touchpoints"][-1]
        
        channel = last_non_direct["channel"]
        
        if channel not in channel_data:
            channel_data[channel] = {
                "revenue": 0,
                "touchpoints": 0,
                "cost": 0,
                "conversions": 0,
                "positions": []
            }
        
        channel_data[channel]["revenue"] += journey["conversion_value"]
        channel_data[channel]["conversions"] += 1
        
        for tp in journey["touchpoints"]:
            if tp["channel"] == channel:
                channel_data[channel]["touchpoints"] += 1
                channel_data[channel]["cost"] += tp["cost"]
                channel_data[channel]["positions"].append(tp["sequence"])
    
    return format_attribution_results(channel_data, sum(j["conversion_value"] for j in journeys))

def calculate_linear(journeys: List[Dict]) -> List[AttributionResult]:
    """Equal credit to all touchpoints"""
    channel_data = {}
    
    for journey in journeys:
        credit_per_tp = journey["conversion_value"] / journey["touchpoint_count"]
        
        for tp in journey["touchpoints"]:
            channel = tp["channel"]
            
            if channel not in channel_data:
                channel_data[channel] = {
                    "revenue": 0,
                    "touchpoints": 0,
                    "cost": 0,
                    "conversions": 0,
                    "positions": []
                }
            
            channel_data[channel]["revenue"] += credit_per_tp
            channel_data[channel]["touchpoints"] += 1
            channel_data[channel]["cost"] += tp["cost"]
            channel_data[channel]["positions"].append(tp["sequence"])
        
        # Count conversions influenced
        channels_in_journey = set(tp["channel"] for tp in journey["touchpoints"])
        for ch in channels_in_journey:
            if ch in channel_data:
                channel_data[ch]["conversions"] += 1
    
    return format_attribution_results(channel_data, sum(j["conversion_value"] for j in journeys))

def calculate_time_decay(journeys: List[Dict]) -> List[AttributionResult]:
    """Exponentially more credit to recent touchpoints (7-day half-life)"""
    channel_data = {}
    
    for journey in journeys:
        # Calculate weights for each touchpoint
        weights = []
        for tp in journey["touchpoints"]:
            days_before = tp["days_before_conversion"]
            weight = 2 ** (-days_before / 7)
            weights.append(weight)
        
        # Normalize weights
        total_weight = sum(weights)
        normalized_weights = [w / total_weight for w in weights]
        
        for i, tp in enumerate(journey["touchpoints"]):
            channel = tp["channel"]
            credit = journey["conversion_value"] * normalized_weights[i]
            
            if channel not in channel_data:
                channel_data[channel] = {
                    "revenue": 0,
                    "touchpoints": 0,
                    "cost": 0,
                    "conversions": 0,
                    "positions": []
                }
            
            channel_data[channel]["revenue"] += credit
            channel_data[channel]["touchpoints"] += 1
            channel_data[channel]["cost"] += tp["cost"]
            channel_data[channel]["positions"].append(tp["sequence"])
        
        channels_in_journey = set(tp["channel"] for tp in journey["touchpoints"])
        for ch in channels_in_journey:
            if ch in channel_data:
                channel_data[ch]["conversions"] += 1
    
    return format_attribution_results(channel_data, sum(j["conversion_value"] for j in journeys))

def calculate_position_based(journeys: List[Dict]) -> List[AttributionResult]:
    """40% first, 40% last, 20% split among middle"""
    channel_data = {}
    
    for journey in journeys:
        touchpoints = journey["touchpoints"]
        count = len(touchpoints)
        
        for i, tp in enumerate(touchpoints):
            channel = tp["channel"]
            
            if channel not in channel_data:
                channel_data[channel] = {
                    "revenue": 0,
                    "touchpoints": 0,
                    "cost": 0,
                    "conversions": 0,
                    "positions": []
                }
            
            if count == 1:
                credit = journey["conversion_value"]
            elif i == 0:
                credit = journey["conversion_value"] * 0.4
            elif i == count - 1:
                credit = journey["conversion_value"] * 0.4
            else:
                credit = journey["conversion_value"] * 0.2 / (count - 2)
            
            channel_data[channel]["revenue"] += credit
            channel_data[channel]["touchpoints"] += 1
            channel_data[channel]["cost"] += tp["cost"]
            channel_data[channel]["positions"].append(tp["sequence"])
        
        channels_in_journey = set(tp["channel"] for tp in touchpoints)
        for ch in channels_in_journey:
            if ch in channel_data:
                channel_data[ch]["conversions"] += 1
    
    return format_attribution_results(channel_data, sum(j["conversion_value"] for j in journeys))

def calculate_w_shaped(journeys: List[Dict]) -> List[AttributionResult]:
    """30% first, 30% middle key touchpoint, 30% last, 10% to others"""
    channel_data = {}
    
    for journey in journeys:
        touchpoints = journey["touchpoints"]
        count = len(touchpoints)
        
        for i, tp in enumerate(touchpoints):
            channel = tp["channel"]
            
            if channel not in channel_data:
                channel_data[channel] = {
                    "revenue": 0,
                    "touchpoints": 0,
                    "cost": 0,
                    "conversions": 0,
                    "positions": []
                }
            
            if count == 1:
                credit = journey["conversion_value"]
            elif count == 2:
                credit = journey["conversion_value"] * 0.5
            elif i == 0:
                credit = journey["conversion_value"] * 0.3
            elif i == count - 1:
                credit = journey["conversion_value"] * 0.3
            elif i == count // 2:
                credit = journey["conversion_value"] * 0.3
            else:
                others_count = count - 3
                credit = journey["conversion_value"] * 0.1 / others_count if others_count > 0 else 0
            
            channel_data[channel]["revenue"] += credit
            channel_data[channel]["touchpoints"] += 1
            channel_data[channel]["cost"] += tp["cost"]
            channel_data[channel]["positions"].append(tp["sequence"])
        
        channels_in_journey = set(tp["channel"] for tp in touchpoints)
        for ch in channels_in_journey:
            if ch in channel_data:
                channel_data[ch]["conversions"] += 1
    
    return format_attribution_results(channel_data, sum(j["conversion_value"] for j in journeys))

def format_attribution_results(channel_data: Dict, total_revenue: float) -> List[AttributionResult]:
    """Format attribution results"""
    results = []
    
    for channel, data in channel_data.items():
        avg_position = sum(data["positions"]) / len(data["positions"]) if data["positions"] else 0
        roas = data["revenue"] / data["cost"] if data["cost"] > 0 else 0
        
        results.append(AttributionResult(
            channel=channel,
            attributed_revenue=round(data["revenue"], 2),
            attribution_percentage=round((data["revenue"] / total_revenue * 100), 2) if total_revenue > 0 else 0,
            touchpoint_count=data["touchpoints"],
            cost=round(data["cost"], 2),
            roas=round(roas, 2),
            conversions_influenced=data["conversions"],
            avg_position=round(avg_position, 2)
        ))
    
    return sorted(results, key=lambda x: x.attributed_revenue, reverse=True)

# API Routes
@api_router.get("/")
async def root():
    return {"message": "AttributionIQ API"}

@api_router.post("/generate-data")
async def create_sample_data():
    """Generate sample data"""
    result = await generate_sample_data()
    return result

@api_router.get("/journeys", response_model=List[Journey])
async def get_journeys():
    """Get all customer journeys"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    return journeys

@api_router.get("/journeys/{journey_id}", response_model=Journey)
async def get_journey(journey_id: str):
    """Get single journey by ID"""
    journey = await db.journeys.find_one({"journey_id": journey_id}, {"_id": 0})
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    return journey

@api_router.get("/attribution/{model}", response_model=List[AttributionResult])
async def get_attribution(model: str):
    """Get attribution for specific model"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    
    if not journeys:
        raise HTTPException(status_code=404, detail="No journeys found. Please generate sample data first.")
    
    model = model.lower().replace("-", "_")
    
    if model == "first_touch":
        return calculate_first_touch(journeys)
    elif model == "last_touch":
        return calculate_last_touch(journeys)
    elif model == "last_non_direct":
        return calculate_last_non_direct(journeys)
    elif model == "linear":
        return calculate_linear(journeys)
    elif model == "time_decay":
        return calculate_time_decay(journeys)
    elif model == "position_based" or model == "u_shaped":
        return calculate_position_based(journeys)
    elif model == "w_shaped":
        return calculate_w_shaped(journeys)
    else:
        raise HTTPException(status_code=400, detail="Invalid model name")

@api_router.get("/attribution/compare/all", response_model=List[ModelComparison])
async def compare_all_models():
    """Compare all attribution models"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    
    if not journeys:
        raise HTTPException(status_code=404, detail="No journeys found")
    
    models = [
        ("First-Touch", calculate_first_touch(journeys)),
        ("Last-Touch", calculate_last_touch(journeys)),
        ("Last Non-Direct", calculate_last_non_direct(journeys)),
        ("Linear", calculate_linear(journeys)),
        ("Time Decay", calculate_time_decay(journeys)),
        ("U-Shaped", calculate_position_based(journeys)),
        ("W-Shaped", calculate_w_shaped(journeys))
    ]
    
    return [ModelComparison(model_name=name, channels=channels) for name, channels in models]

@api_router.get("/stats")
async def get_stats():
    """Get overall statistics"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    
    if not journeys:
        return {
            "total_conversions": 0,
            "total_revenue": 0,
            "avg_touchpoints": 0,
            "avg_time_to_conversion": 0,
            "total_marketing_spend": 0,
            "overall_roas": 0
        }
    
    total_revenue = sum(j["conversion_value"] for j in journeys)
    total_touchpoints = sum(j["touchpoint_count"] for j in journeys)
    total_time = sum(j["time_to_conversion"] for j in journeys)
    
    total_spend = 0
    for journey in journeys:
        for tp in journey["touchpoints"]:
            total_spend += tp["cost"]
    
    return {
        "total_conversions": len(journeys),
        "total_revenue": round(total_revenue, 2),
        "avg_touchpoints": round(total_touchpoints / len(journeys), 1),
        "avg_time_to_conversion": round(total_time / len(journeys), 1),
        "total_marketing_spend": round(total_spend, 2),
        "overall_roas": round(total_revenue / total_spend, 2) if total_spend > 0 else 0
    }

@api_router.get("/advanced-metrics")
async def get_advanced_metrics():
    """Get advanced marketing metrics"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    
    if not journeys:
        return {}
    
    # Calculate channel-specific metrics
    channel_metrics = {}
    for journey in journeys:
        for tp in journey["touchpoints"]:
            channel = tp["channel"]
            if channel not in channel_metrics:
                channel_metrics[channel] = {
                    "total_interactions": 0,
                    "conversions": 0,
                    "revenue": 0,
                    "spend": 0
                }
            channel_metrics[channel]["total_interactions"] += 1
            channel_metrics[channel]["spend"] += tp["cost"]
        
        # Count unique channels in journey
        unique_channels = set(tp["channel"] for tp in journey["touchpoints"])
        for channel in unique_channels:
            if channel in channel_metrics:
                channel_metrics[channel]["conversions"] += 1
                channel_metrics[channel]["revenue"] += journey["conversion_value"] / len(unique_channels)
    
    # Format results with conversion rate and CPA
    results = []
    for channel, metrics in channel_metrics.items():
        conversion_rate = (metrics["conversions"] / metrics["total_interactions"] * 100) if metrics["total_interactions"] > 0 else 0
        cpa = metrics["spend"] / metrics["conversions"] if metrics["conversions"] > 0 else 0
        
        results.append({
            "channel": channel,
            "conversion_rate": round(conversion_rate, 2),
            "cpa": round(cpa, 2),
            "total_interactions": metrics["total_interactions"],
            "conversions": metrics["conversions"],
            "revenue": round(metrics["revenue"], 2),
            "spend": round(metrics["spend"], 2)
        })
    
    return sorted(results, key=lambda x: x["conversion_rate"], reverse=True)

@api_router.get("/revenue-trends")
async def get_revenue_trends():
    """Get daily revenue trends"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    
    if not journeys:
        return []
    
    # Group by conversion date
    date_revenue = {}
    for journey in journeys:
        date_str = journey["conversion_date"][:10]  # Get YYYY-MM-DD
        if date_str not in date_revenue:
            date_revenue[date_str] = {
                "conversions": 0,
                "revenue": 0,
                "spend": 0
            }
        date_revenue[date_str]["conversions"] += 1
        date_revenue[date_str]["revenue"] += journey["conversion_value"]
        
        for tp in journey["touchpoints"]:
            date_revenue[date_str]["spend"] += tp["cost"]
    
    # Sort by date and format
    sorted_dates = sorted(date_revenue.keys())
    results = []
    cumulative_revenue = 0
    
    for date in sorted_dates:
        data = date_revenue[date]
        cumulative_revenue += data["revenue"]
        results.append({
            "date": date,
            "revenue": round(data["revenue"], 2),
            "conversions": data["conversions"],
            "spend": round(data["spend"], 2),
            "cumulative_revenue": round(cumulative_revenue, 2),
            "roas": round(data["revenue"] / data["spend"], 2) if data["spend"] > 0 else 0
        })
    
    return results

@api_router.get("/channel-synergy")
async def get_channel_synergy():
    """Get channel co-occurrence matrix for synergy analysis"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    
    if not journeys:
        return []
    
    # Build co-occurrence matrix
    synergy_matrix = {}
    
    for journey in journeys:
        channels = list(set(tp["channel"] for tp in journey["touchpoints"]))
        
        # Count co-occurrences
        for i, ch1 in enumerate(channels):
            if ch1 not in synergy_matrix:
                synergy_matrix[ch1] = {}
            
            for ch2 in channels:
                if ch2 not in synergy_matrix[ch1]:
                    synergy_matrix[ch1][ch2] = 0
                synergy_matrix[ch1][ch2] += 1
    
    # Format for heatmap
    results = []
    for ch1, connections in synergy_matrix.items():
        for ch2, count in connections.items():
            results.append({
                "channel1": ch1,
                "channel2": ch2,
                "co_occurrences": count
            })
    
    return results

@api_router.get("/funnel-analysis")
async def get_funnel_analysis():
    """Get customer journey funnel by touchpoint count"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    
    if not journeys:
        return []
    
    # Group by touchpoint count
    funnel_data = {}
    for journey in journeys:
        count = journey["touchpoint_count"]
        if count not in funnel_data:
            funnel_data[count] = {
                "journeys": 0,
                "revenue": 0,
                "avg_conversion_value": 0
            }
        funnel_data[count]["journeys"] += 1
        funnel_data[count]["revenue"] += journey["conversion_value"]
    
    # Calculate averages and format
    results = []
    for touchpoint_count in sorted(funnel_data.keys()):
        data = funnel_data[touchpoint_count]
        results.append({
            "touchpoint_count": touchpoint_count,
            "journeys": data["journeys"],
            "revenue": round(data["revenue"], 2),
            "avg_conversion_value": round(data["revenue"] / data["journeys"], 2)
        })
    
    return results

@api_router.get("/top-performers")
async def get_top_performers():
    """Get top and bottom performing channels across all models"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    
    if not journeys:
        return {"top": [], "bottom": []}
    
    # Get linear attribution as a fair baseline
    linear_results = calculate_linear(journeys)
    
    # Sort by attributed revenue
    sorted_channels = sorted(linear_results, key=lambda x: x.attributed_revenue, reverse=True)
    
    return {
        "top": [{"channel": ch.channel, "revenue": ch.attributed_revenue, "roas": ch.roas} 
                for ch in sorted_channels[:5]],
        "bottom": [{"channel": ch.channel, "revenue": ch.attributed_revenue, "roas": ch.roas} 
                   for ch in sorted_channels[-5:]]
    }

@api_router.get("/attribution-variance")
async def get_attribution_variance():
    """Analyze how much attribution varies across different models"""
    journeys = await db.journeys.find({}, {"_id": 0}).to_list(1000)
    
    if not journeys:
        return []
    
    # Calculate attribution for all models
    models_data = {
        "First-Touch": calculate_first_touch(journeys),
        "Last-Touch": calculate_last_touch(journeys),
        "Linear": calculate_linear(journeys),
        "Time Decay": calculate_time_decay(journeys),
        "U-Shaped": calculate_position_based(journeys),
        "W-Shaped": calculate_w_shaped(journeys)
    }
    
    # Build channel variance data
    all_channels = set()
    for model_results in models_data.values():
        for result in model_results:
            all_channels.add(result.channel)
    
    variance_data = []
    for channel in all_channels:
        revenues = []
        for model_name, results in models_data.items():
            for result in results:
                if result.channel == channel:
                    revenues.append(result.attributed_revenue)
                    break
        
        if revenues:
            avg_revenue = sum(revenues) / len(revenues)
            variance = sum((r - avg_revenue) ** 2 for r in revenues) / len(revenues)
            std_dev = variance ** 0.5
            
            variance_data.append({
                "channel": channel,
                "avg_revenue": round(avg_revenue, 2),
                "std_dev": round(std_dev, 2),
                "coefficient_of_variation": round((std_dev / avg_revenue * 100) if avg_revenue > 0 else 0, 2),
                "min_revenue": round(min(revenues), 2),
                "max_revenue": round(max(revenues), 2)
            })
    
    return sorted(variance_data, key=lambda x: x["coefficient_of_variation"], reverse=True)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

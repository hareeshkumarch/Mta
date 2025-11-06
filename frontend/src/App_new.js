import { useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  LineChart, Line, AreaChart, Area, PieChart, Pie, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, Treemap
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Clock, Target, Info, ChevronRight, 
  Search, Filter, Activity, PieChart as PieChartIcon, BarChart3, LineChartIcon,
  Zap, Award, TrendingUpIcon, AlertCircle
} from "lucide-react";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CHANNEL_COLORS = {
  "Google Ads": "#4285F4",
  "Facebook Ads": "#1877F2",
  "Instagram": "#E4405F",
  "LinkedIn": "#0A66C2",
  "Email Campaign": "#10B981",
  "Organic Search": "#8B5CF6",
  "Direct Traffic": "#6B7280",
  "YouTube": "#FF0000",
  "Blog Content": "#F59E0B",
  "Webinar": "#EC4899",
  "Referral": "#14B8A6"
};

const VIBRANT_COLORS = ["#38BDF8", "#34D399", "#FB7185", "#A78BFA", "#FBBF24", "#14B8A6", "#F472B6", "#60A5FA"];

const MODEL_INFO = {
  "first-touch": {
    title: "First-Touch Attribution",
    description: "Gives 100% credit to the first touchpoint in the customer journey.",
    useCase: "Best for evaluating awareness campaigns and top-of-funnel channels.",
    pros: "Clear view of customer acquisition sources.",
    cons: "Ignores all nurturing touchpoints that helped close the sale."
  },
  "last-touch": {
    title: "Last-Touch Attribution",
    description: "Gives 100% credit to the last touchpoint before conversion.",
    useCase: "Best for evaluating closing channels and direct conversion drivers.",
    pros: "Shows which channels directly drive conversions.",
    cons: "Completely ignores the customer journey and awareness channels."
  },
  "last-non-direct": {
    title: "Last Non-Direct Click",
    description: "Gives 100% credit to the last paid/non-direct touchpoint.",
    useCase: "Best for understanding which marketing channels drive conversions (excluding direct traffic).",
    pros: "Removes bias toward direct traffic.",
    cons: "Still ignores the full customer journey."
  },
  "linear": {
    title: "Linear Attribution",
    description: "Distributes credit equally across all touchpoints.",
    useCase: "Best for understanding overall channel contribution throughout the journey.",
    pros: "Fair distribution, acknowledges all touchpoints.",
    cons: "Doesn't account for varying importance of different touchpoints."
  },
  "time-decay": {
    title: "Time Decay Attribution",
    description: "Gives exponentially more credit to recent touchpoints (7-day half-life).",
    useCase: "Best for businesses with short sales cycles where recent interactions matter most.",
    pros: "Prioritizes touchpoints closer to conversion.",
    cons: "May undervalue early awareness touchpoints."
  },
  "u-shaped": {
    title: "U-Shaped (Position-Based)",
    description: "40% to first touch, 40% to last touch, 20% split among middle.",
    useCase: "Best for B2B or high-consideration purchases where awareness and closing matter most.",
    pros: "Balances first and last touch importance.",
    cons: "Middle touchpoints get minimal credit."
  },
  "w-shaped": {
    title: "W-Shaped Attribution",
    description: "30% first, 30% middle key touchpoint, 30% last, 10% to others.",
    useCase: "Best for complex sales with clear milestone (e.g., demo, trial signup).",
    pros: "Recognizes key middle milestone in journey.",
    cons: "Requires identifying the key middle touchpoint."
  }
};

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (start === end) return;
    
    const timer = setInterval(() => {
      start += end / (duration / 16);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{prefix}{typeof value === 'number' ? Math.round(count).toLocaleString() : count}{suffix}</span>;
};

function App() {
  const [stats, setStats] = useState(null);
  const [selectedModel, setSelectedModel] = useState("first-touch");
  const [attributionData, setAttributionData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [journeyDetailModal, setJourneyDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTouchpoints, setFilterTouchpoints] = useState("all");
  const [dataGenerated, setDataGenerated] = useState(false);
  
  // New state for advanced metrics
  const [advancedMetrics, setAdvancedMetrics] = useState([]);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [channelSynergy, setChannelSynergy] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [topPerformers, setTopPerformers] = useState({ top: [], bottom: [] });
  const [attributionVariance, setAttributionVariance] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (dataGenerated) {
      fetchAttributionData(selectedModel);
    }
  }, [selectedModel, dataGenerated]);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      const statsResponse = await axios.get(`${API}/stats`);
      
      if (statsResponse.data.total_conversions === 0) {
        await axios.post(`${API}/generate-data`);
      }
      
      await Promise.all([
        fetchStats(),
        fetchAttributionData(selectedModel),
        fetchComparisonData(),
        fetchJourneys(),
        fetchAdvancedMetrics(),
        fetchRevenueTrends(),
        fetchChannelSynergy(),
        fetchFunnelData(),
        fetchTopPerformers(),
        fetchAttributionVariance()
      ]);
      
      setDataGenerated(true);
      setLoading(false);
    } catch (error) {
      console.error("Error initializing data:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAttributionData = async (model) => {
    try {
      const response = await axios.get(`${API}/attribution/${model}`);
      setAttributionData(response.data);
    } catch (error) {
      console.error("Error fetching attribution:", error);
    }
  };

  const fetchComparisonData = async () => {
    try {
      const response = await axios.get(`${API}/attribution/compare/all`);
      setComparisonData(response.data);
    } catch (error) {
      console.error("Error fetching comparison:", error);
    }
  };

  const fetchJourneys = async () => {
    try {
      const response = await axios.get(`${API}/journeys`);
      setJourneys(response.data);
    } catch (error) {
      console.error("Error fetching journeys:", error);
    }
  };

  const fetchAdvancedMetrics = async () => {
    try {
      const response = await axios.get(`${API}/advanced-metrics`);
      setAdvancedMetrics(response.data);
    } catch (error) {
      console.error("Error fetching advanced metrics:", error);
    }
  };

  const fetchRevenueTrends = async () => {
    try {
      const response = await axios.get(`${API}/revenue-trends`);
      setRevenueTrends(response.data);
    } catch (error) {
      console.error("Error fetching revenue trends:", error);
    }
  };

  const fetchChannelSynergy = async () => {
    try {
      const response = await axios.get(`${API}/channel-synergy`);
      setChannelSynergy(response.data);
    } catch (error) {
      console.error("Error fetching channel synergy:", error);
    }
  };

  const fetchFunnelData = async () => {
    try {
      const response = await axios.get(`${API}/funnel-analysis`);
      setFunnelData(response.data);
    } catch (error) {
      console.error("Error fetching funnel data:", error);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const response = await axios.get(`${API}/top-performers`);
      setTopPerformers(response.data);
    } catch (error) {
      console.error("Error fetching top performers:", error);
    }
  };

  const fetchAttributionVariance = async () => {
    try {
      const response = await axios.get(`${API}/attribution-variance`);
      setAttributionVariance(response.data);
    } catch (error) {
      console.error("Error fetching attribution variance:", error);
    }
  };

  const openJourneyDetail = async (journeyId) => {
    try {
      const response = await axios.get(`${API}/journeys/${journeyId}`);
      setSelectedJourney(response.data);
      setJourneyDetailModal(true);
    } catch (error) {
      console.error("Error fetching journey detail:", error);
    }
  };

  const getROASColor = (roas) => {
    if (roas >= 3.0) return "text-emerald-600";
    if (roas >= 1.5) return "text-amber-600";
    return "text-rose-600";
  };

  const getEfficiencyStars = (roas) => {
    if (roas >= 5.0) return "★★★★★";
    if (roas >= 3.0) return "★★★★☆";
    if (roas >= 2.0) return "★★★☆☆";
    if (roas >= 1.0) return "★★☆☆☆";
    return "★☆☆☆☆";
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = journey.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journey.journey_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterTouchpoints === "all" ||
                         (filterTouchpoints === "2-3" && journey.touchpoint_count >= 2 && journey.touchpoint_count <= 3) ||
                         (filterTouchpoints === "4-5" && journey.touchpoint_count >= 4 && journey.touchpoint_count <= 5) ||
                         (filterTouchpoints === "6+" && journey.touchpoint_count >= 6);
    
    return matchesSearch && matchesFilter;
  });

  // Prepare data for Radar Chart
  const radarChartData = attributionData.slice(0, 8).map(item => ({
    channel: item.channel.split(' ')[0],
    ROAS: item.roas,
    Revenue: item.attributed_revenue / 10000,
    Conversions: item.conversions_influenced,
    Touchpoints: item.touchpoint_count / 10
  }));

  // Prepare data for Pie Chart
  const pieChartData = attributionData.slice(0, 7).map(item => ({
    name: item.channel,
    value: item.attributed_revenue,
    percentage: item.attribution_percentage
  }));

  // Prepare data for Scatter Plot
  const scatterData = attributionData.map(item => ({
    x: item.cost,
    y: item.attributed_revenue,
    z: item.conversions_influenced * 100,
    channel: item.channel,
    roas: item.roas
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-purple-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-purple-400 opacity-20 mx-auto"></div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mb-2">Loading AttributionIQ...</p>
          <p className="text-sm text-slate-600">Preparing advanced analytics dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header with Gradient */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <Target className="h-10 w-10 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">AttributionIQ</h1>
                <p className="text-sm text-purple-100 mt-1 font-medium">Advanced Marketing Attribution Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white text-purple-800 px-4 py-2 text-sm font-semibold shadow-lg">
                <Activity className="h-4 w-4 mr-2 inline" />
                Live Analytics
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Enhanced KPI Cards with Gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
          <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-cyan-400 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center opacity-90">
                <Users className="h-5 w-5 mr-2" />
                Total Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold">
                <AnimatedCounter value={stats?.total_conversions || 0} />
              </p>
              <p className="text-xs mt-2 opacity-80 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Qualified leads
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-emerald-500 to-teal-400 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center opacity-90">
                <DollarSign className="h-5 w-5 mr-2" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold">{formatCurrency(stats?.total_revenue || 0)}</p>
              <p className="text-xs mt-2 opacity-80 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Gross revenue
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-500 to-pink-400 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center opacity-90">
                <Activity className="h-5 w-5 mr-2" />
                Avg Touchpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold">
                <AnimatedCounter value={stats?.avg_touchpoints || 0} />
              </p>
              <p className="text-xs mt-2 opacity-80 flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" />
                Per journey
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-amber-500 to-orange-400 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center opacity-90">
                <Clock className="h-5 w-5 mr-2" />
                Avg Time to Convert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold">
                <AnimatedCounter value={stats?.avg_time_to_conversion || 0} />
                <span className="text-2xl ml-1">d</span>
              </p>
              <p className="text-xs mt-2 opacity-80 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Days average
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-rose-500 to-pink-400 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center opacity-90">
                <TrendingDown className="h-5 w-5 mr-2" />
                Marketing Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold">{formatCurrency(stats?.total_marketing_spend || 0)}</p>
              <p className="text-xs mt-2 opacity-80 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Total invested
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-indigo-500 to-purple-400 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center opacity-90">
                <Target className="h-5 w-5 mr-2" />
                Overall ROAS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold">
                <AnimatedCounter value={stats?.overall_roas || 0} />x
              </p>
              <p className="text-xs mt-2 opacity-80 flex items-center">
                <Award className="h-3 w-3 mr-1" />
                Return on spend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-md p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg font-semibold">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="attribution" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg font-semibold">
              <BarChart3 className="h-4 w-4 mr-2" />
              Attribution
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-lg font-semibold">
              <LineChartIcon className="h-4 w-4 mr-2" />
              Advanced Analytics
            </TabsTrigger>
            <TabsTrigger value="journeys" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg font-semibold">
              <Users className="h-4 w-4 mr-2" />
              Journeys
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Revenue Distribution Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <PieChartIcon className="h-6 w-6 mr-3 text-purple-600" />
                    Revenue Distribution by Channel
                  </CardTitle>
                  <CardDescription>Top performing channels contribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percentage}) => `${name.split(' ')[0]}: ${percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[entry.name] || VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Channel Performance Radar */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Zap className="h-6 w-6 mr-3 text-amber-600" />
                    Multi-Dimensional Performance
                  </CardTitle>
                  <CardDescription>Channel metrics across key dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarChartData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="channel" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: '#94a3b8' }} />
                      <Radar name="ROAS" dataKey="ROAS" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                      <Radar name="Revenue (₹10k)" dataKey="Revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Radar name="Conversions" dataKey="Conversions" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trends Line Chart */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <LineChartIcon className="h-6 w-6 mr-3 text-blue-600" />
                  Revenue & Conversion Trends Over Time
                </CardTitle>
                <CardDescription>Daily performance metrics and cumulative growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueTrends}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'revenue' || name === 'cumulative_revenue') return [formatCurrency(value), name === 'revenue' ? 'Daily Revenue' : 'Cumulative Revenue'];
                        if (name === 'conversions') return [value, 'Conversions'];
                        if (name === 'roas') return [`${value}x`, 'ROAS'];
                        return [value, name];
                      }}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRevenue)" name="Daily Revenue" />
                    <Area type="monotone" dataKey="cumulative_revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorCumulative)" name="Cumulative Revenue" />
                    <Line type="monotone" dataKey="conversions" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top & Bottom Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-emerald-700">
                    <Award className="h-6 w-6 mr-3" />
                    Top 5 Performers
                  </CardTitle>
                  <CardDescription>Highest revenue generating channels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformers.top.map((channel, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-slate-800">{channel.channel}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">{formatCurrency(channel.revenue)}</p>
                          <p className="text-xs text-slate-500">ROAS: {channel.roas}x</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-amber-700">
                    <AlertCircle className="h-6 w-6 mr-3" />
                    Areas for Improvement
                  </CardTitle>
                  <CardDescription>Channels requiring optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformers.bottom.map((channel, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold">
                            {topPerformers.bottom.length - index}
                          </div>
                          <span className="font-semibold text-slate-800">{channel.channel}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-600">{formatCurrency(channel.revenue)}</p>
                          <p className="text-xs text-slate-500">ROAS: {channel.roas}x</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attribution Tab */}
          <TabsContent value="attribution" className="space-y-8 mt-8">
            {/* Model Selector */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <span className="flex items-center">
                    <Target className="h-6 w-6 mr-3 text-purple-600" />
                    Attribution Model
                  </span>
                  <TooltipProvider>
                    <TooltipUI>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                          <Info className="h-5 w-5 text-purple-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md p-4 bg-white shadow-2xl">
                        <div className="space-y-2">
                          <p className="font-bold text-purple-700">{MODEL_INFO[selectedModel]?.title}</p>
                          <p className="text-sm text-slate-700">{MODEL_INFO[selectedModel]?.description}</p>
                          <p className="text-sm text-emerald-700"><strong>Use Case:</strong> {MODEL_INFO[selectedModel]?.useCase}</p>
                          <p className="text-sm text-blue-700"><strong>Pros:</strong> {MODEL_INFO[selectedModel]?.pros}</p>
                          <p className="text-sm text-rose-700"><strong>Cons:</strong> {MODEL_INFO[selectedModel]?.cons}</p>
                        </div>
                      </TooltipContent>
                    </TooltipUI>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: "first-touch", label: "First-Touch", color: "from-blue-500 to-cyan-500" },
                    { id: "last-touch", label: "Last-Touch", color: "from-purple-500 to-pink-500" },
                    { id: "last-non-direct", label: "Last Non-Direct", color: "from-emerald-500 to-teal-500" },
                    { id: "linear", label: "Linear", color: "from-amber-500 to-orange-500" },
                    { id: "time-decay", label: "Time Decay", color: "from-rose-500 to-pink-500" },
                    { id: "u-shaped", label: "U-Shaped", color: "from-indigo-500 to-purple-500" },
                    { id: "w-shaped", label: "W-Shaped", color: "from-fuchsia-500 to-pink-500" }
                  ].map((model) => (
                    <Button
                      key={model.id}
                      variant={selectedModel === model.id ? "default" : "outline"}
                      onClick={() => setSelectedModel(model.id)}
                      className={selectedModel === model.id 
                        ? `bg-gradient-to-r ${model.color} text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold`
                        : "hover:bg-slate-50 font-semibold"
                      }
                    >
                      {model.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance Table */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl">Channel Performance - {MODEL_INFO[selectedModel]?.title}</CardTitle>
                <CardDescription>Detailed metrics for selected attribution model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold">Channel</TableHead>
                        <TableHead className="text-right font-bold">Attributed Revenue</TableHead>
                        <TableHead className="text-right font-bold">Attribution %</TableHead>
                        <TableHead className="text-right font-bold">Touchpoints</TableHead>
                        <TableHead className="text-right font-bold">Cost</TableHead>
                        <TableHead className="text-right font-bold">ROAS</TableHead>
                        <TableHead className="text-right font-bold">Conversions</TableHead>
                        <TableHead className="text-right font-bold">Avg Position</TableHead>
                        <TableHead className="text-right font-bold">Efficiency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attributionData.map((item, index) => (
                        <TableRow key={index} className="hover:bg-purple-50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full shadow-sm" 
                                style={{ backgroundColor: CHANNEL_COLORS[item.channel] }}
                              ></div>
                              <span className="font-semibold">{item.channel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-800">{formatCurrency(item.attributed_revenue)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="font-semibold">{item.attribution_percentage}%</Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.touchpoint_count}</TableCell>
                          <TableCell className="text-right text-slate-600">{formatCurrency(item.cost)}</TableCell>
                          <TableCell className={`text-right font-bold ${getROASColor(item.roas)}`}>
                            {item.roas > 0 ? `${item.roas}x` : '-'}
                          </TableCell>
                          <TableCell className="text-right">{item.conversions_influenced}</TableCell>
                          <TableCell className="text-right">{item.avg_position}</TableCell>
                          <TableCell className="text-right text-amber-500 text-lg">{getEfficiencyStars(item.roas)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Attribution Model Comparison */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-indigo-600" />
                  Attribution Model Comparison
                </CardTitle>
                <CardDescription>Compare revenue attribution across all 7 models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
                    data={comparisonData.map(model => ({
                      name: model.model_name,
                      ...model.channels.reduce((acc, channel) => {
                        acc[channel.channel] = channel.attributed_revenue;
                        return acc;
                      }, {})
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {Object.keys(CHANNEL_COLORS).map((channel) => (
                      <Bar 
                        key={channel} 
                        dataKey={channel} 
                        stackId="a" 
                        fill={CHANNEL_COLORS[channel]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost vs Revenue Scatter Plot */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-rose-600" />
                  Cost vs Revenue Analysis
                </CardTitle>
                <CardDescription>Channel efficiency visualization (bubble size = conversions)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Cost" 
                      tick={{ fill: '#64748b' }}
                      label={{ value: 'Marketing Cost (₹)', position: 'insideBottom', offset: -10, fill: '#64748b', fontWeight: 600 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Revenue" 
                      tick={{ fill: '#64748b' }}
                      label={{ value: 'Attributed Revenue (₹)', angle: -90, position: 'insideLeft', fill: '#64748b', fontWeight: 600 }}
                    />
                    <ZAxis type="number" dataKey="z" range={[100, 2000]} name="Conversions" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200">
                              <p className="font-bold text-slate-800 mb-2">{data.channel}</p>
                              <p className="text-sm text-slate-600">Cost: {formatCurrency(data.x)}</p>
                              <p className="text-sm text-slate-600">Revenue: {formatCurrency(data.y)}</p>
                              <p className="text-sm text-slate-600">Conversions: {data.z / 100}</p>
                              <p className="text-sm font-bold text-purple-600 mt-1">ROAS: {data.roas}x</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Channels" data={scatterData}>
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[entry.channel] || VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="advanced" className="space-y-8 mt-8">
            {/* Advanced Metrics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Conversion Rate by Channel */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <TrendingUpIcon className="h-6 w-6 mr-3 text-emerald-600" />
                    Conversion Rate by Channel
                  </CardTitle>
                  <CardDescription>Effectiveness of each marketing channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={advancedMetrics} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" tick={{ fill: '#64748b' }} />
                      <YAxis dataKey="channel" type="category" tick={{ fill: '#64748b', fontSize: 12 }} width={90} />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'conversion_rate') return [`${value}%`, 'Conversion Rate'];
                          return [value, name];
                        }}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="conversion_rate" fill="#10B981" radius={[0, 8, 8, 0]}>
                        {advancedMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cost Per Acquisition */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <DollarSign className="h-6 w-6 mr-3 text-amber-600" />
                    Cost Per Acquisition (CPA)
                  </CardTitle>
                  <CardDescription>Average cost to acquire a customer</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={advancedMetrics} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" tick={{ fill: '#64748b' }} />
                      <YAxis dataKey="channel" type="category" tick={{ fill: '#64748b', fontSize: 12 }} width={90} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'CPA']}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="cpa" fill="#F59E0B" radius={[0, 8, 8, 0]}>
                        {advancedMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Funnel Analysis */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Filter className="h-6 w-6 mr-3 text-purple-600" />
                  Customer Journey Funnel
                </CardTitle>
                <CardDescription>Revenue performance by journey complexity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="touchpoint_count" 
                      label={{ value: 'Number of Touchpoints', position: 'insideBottom', offset: -5, fill: '#64748b', fontWeight: 600 }}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'revenue' || name === 'avg_conversion_value') return [formatCurrency(value), name === 'revenue' ? 'Total Revenue' : 'Avg Conversion Value'];
                        return [value, name === 'journeys' ? 'Number of Journeys' : name];
                      }}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="journeys" fill="#8B5CF6" name="Number of Journeys" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="avg_conversion_value" fill="#10B981" name="Avg Conversion Value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attribution Variance */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-blue-600" />
                  Attribution Model Variance
                </CardTitle>
                <CardDescription>How much channel attribution varies across different models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold">Channel</TableHead>
                        <TableHead className="text-right font-bold">Avg Revenue</TableHead>
                        <TableHead className="text-right font-bold">Std Deviation</TableHead>
                        <TableHead className="text-right font-bold">Variance %</TableHead>
                        <TableHead className="text-right font-bold">Min Revenue</TableHead>
                        <TableHead className="text-right font-bold">Max Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attributionVariance.map((item, index) => (
                        <TableRow key={index} className="hover:bg-blue-50 transition-colors">
                          <TableCell className="font-semibold">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: CHANNEL_COLORS[item.channel] }}
                              ></div>
                              <span>{item.channel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(item.avg_revenue)}</TableCell>
                          <TableCell className="text-right text-slate-600">{formatCurrency(item.std_dev)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={item.coefficient_of_variation > 50 ? "destructive" : "secondary"} className="font-semibold">
                              {item.coefficient_of_variation}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-slate-600">{formatCurrency(item.min_revenue)}</TableCell>
                          <TableCell className="text-right text-slate-600">{formatCurrency(item.max_revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Journeys Tab */}
          <TabsContent value="journeys" className="space-y-8 mt-8">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Users className="h-6 w-6 mr-3 text-purple-600" />
                  Customer Journey Explorer
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        placeholder="Search by name or journey ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <Select value={filterTouchpoints} onValueChange={setFilterTouchpoints}>
                      <SelectTrigger className="border-slate-300">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Touchpoints</SelectItem>
                        <SelectItem value="2-3">2-3 Touchpoints</SelectItem>
                        <SelectItem value="4-5">4-5 Touchpoints</SelectItem>
                        <SelectItem value="6+">6+ Touchpoints</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold">Journey ID</TableHead>
                        <TableHead className="font-bold">Customer Name</TableHead>
                        <TableHead className="font-bold">Journey Path</TableHead>
                        <TableHead className="text-right font-bold">Touchpoints</TableHead>
                        <TableHead className="text-right font-bold">Days to Convert</TableHead>
                        <TableHead className="text-right font-bold">Conversion Value</TableHead>
                        <TableHead className="text-right font-bold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJourneys.slice(0, 20).map((journey) => (
                        <TableRow key={journey.journey_id} className="hover:bg-purple-50 transition-colors">
                          <TableCell className="font-semibold text-purple-700">{journey.journey_id}</TableCell>
                          <TableCell className="font-medium">{journey.customer_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {journey.touchpoints.slice(0, 4).map((tp, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs font-semibold"
                                  style={{ borderColor: CHANNEL_COLORS[tp.channel], color: CHANNEL_COLORS[tp.channel] }}
                                >
                                  {tp.channel.split(' ')[0]}
                                </Badge>
                              ))}
                              {journey.touchpoints.length > 4 && (
                                <span className="text-xs text-slate-500 font-semibold">+{journey.touchpoints.length - 4}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{journey.touchpoint_count}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{journey.time_to_conversion}</TableCell>
                          <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(journey.conversion_value)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openJourneyDetail(journey.journey_id)}
                              className="hover:bg-purple-100 text-purple-600 font-semibold"
                            >
                              View <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredJourneys.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No journeys found matching your filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Journey Detail Modal */}
      <Dialog open={journeyDetailModal} onOpenChange={setJourneyDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white to-purple-50">
          {selectedJourney && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-purple-700">Journey Details - {selectedJourney.journey_id}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Customer</p>
                    <p className="font-bold text-slate-800">{selectedJourney.customer_name}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Conversion Value</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(selectedJourney.conversion_value)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Touchpoints</p>
                    <p className="font-bold text-purple-600">{selectedJourney.touchpoint_count}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Time to Convert</p>
                    <p className="font-bold text-blue-600">{selectedJourney.time_to_conversion} days</p>
                  </div>
                </div>

                {/* Journey Timeline */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold text-lg mb-6 text-slate-800">Journey Timeline</h3>
                  <div className="space-y-4">
                    {selectedJourney.touchpoints.map((tp, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                            style={{ backgroundColor: CHANNEL_COLORS[tp.channel] }}
                          >
                            {tp.sequence}
                          </div>
                          {index < selectedJourney.touchpoints.length - 1 && (
                            <div className="w-0.5 h-16 bg-gradient-to-b from-slate-300 to-slate-200 my-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8 bg-slate-50 p-4 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800">{tp.channel}</p>
                              <p className="text-sm text-slate-600">{tp.interaction_type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-purple-600">
                                {tp.days_before_conversion === 0 ? 'Conversion' : `${tp.days_before_conversion} days before`}
                              </p>
                              {tp.cost > 0 && (
                                <p className="text-sm text-slate-500 font-medium">{formatCurrency(tp.cost)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;

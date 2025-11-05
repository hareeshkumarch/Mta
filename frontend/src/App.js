import { useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Target, Info, ChevronRight, Search, Filter } from "lucide-react";
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
      
      // Check if data exists
      const statsResponse = await axios.get(`${API}/stats`);
      
      if (statsResponse.data.total_conversions === 0) {
        // Generate sample data
        await axios.post(`${API}/generate-data`);
      }
      
      // Fetch all data
      await Promise.all([
        fetchStats(),
        fetchAttributionData(selectedModel),
        fetchComparisonData(),
        fetchJourneys()
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
    if (roas >= 3.0) return "text-green-600";
    if (roas >= 1.5) return "text-yellow-600";
    return "text-red-600";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-slate-700">Loading AttributionIQ...</p>
          <p className="text-sm text-slate-500 mt-2">Generating sample data and analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-xl" data-testid="main-header">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="app-title">AttributionIQ</h1>
                <p className="text-sm text-slate-300">Marketing Attribution Analytics Platform</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1" data-testid="demo-badge">
              Demo Mode
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8" data-testid="kpi-section">
          <Card className="hover:shadow-lg transition-shadow duration-300" data-testid="kpi-conversions">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Total Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats?.total_conversions || 0}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300" data-testid="kpi-revenue">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats?.total_revenue || 0)}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300" data-testid="kpi-touchpoints">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                Avg Touchpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats?.avg_touchpoints || 0}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300" data-testid="kpi-time">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-orange-600" />
                Avg Time to Convert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats?.avg_time_to_conversion || 0} <span className="text-lg text-slate-500">days</span></p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300" data-testid="kpi-spend">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                Marketing Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats?.total_marketing_spend || 0)}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300" data-testid="kpi-roas">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <Target className="h-4 w-4 mr-2 text-indigo-600" />
                Overall ROAS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats?.overall_roas || 0}x</p>
            </CardContent>
          </Card>
        </div>

        {/* Model Selector */}
        <Card className="mb-8" data-testid="model-selector-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Attribution Model</span>
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <div className="space-y-2">
                      <p className="font-semibold">{MODEL_INFO[selectedModel]?.title}</p>
                      <p className="text-sm">{MODEL_INFO[selectedModel]?.description}</p>
                      <p className="text-sm text-green-600"><strong>Use Case:</strong> {MODEL_INFO[selectedModel]?.useCase}</p>
                      <p className="text-sm text-blue-600"><strong>Pros:</strong> {MODEL_INFO[selectedModel]?.pros}</p>
                      <p className="text-sm text-red-600"><strong>Cons:</strong> {MODEL_INFO[selectedModel]?.cons}</p>
                    </div>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3" data-testid="model-buttons">
              {[
                { id: "first-touch", label: "First-Touch" },
                { id: "last-touch", label: "Last-Touch" },
                { id: "last-non-direct", label: "Last Non-Direct" },
                { id: "linear", label: "Linear" },
                { id: "time-decay", label: "Time Decay" },
                { id: "u-shaped", label: "U-Shaped" },
                { id: "w-shaped", label: "W-Shaped" }
              ].map((model) => (
                <Button
                  key={model.id}
                  data-testid={`model-button-${model.id}`}
                  variant={selectedModel === model.id ? "default" : "outline"}
                  onClick={() => setSelectedModel(model.id)}
                  className={selectedModel === model.id ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {model.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Channel Performance Table */}
        <Card className="mb-8" data-testid="channel-performance-table">
          <CardHeader>
            <CardTitle>Channel Performance - {MODEL_INFO[selectedModel]?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Attributed Revenue</TableHead>
                    <TableHead className="text-right">Attribution %</TableHead>
                    <TableHead className="text-right">Touchpoints</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Avg Position</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributionData.map((item, index) => (
                    <TableRow key={index} data-testid={`channel-row-${item.channel.toLowerCase().replace(/\s+/g, '-')}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CHANNEL_COLORS[item.channel] }}
                          ></div>
                          <span>{item.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(item.attributed_revenue)}</TableCell>
                      <TableCell className="text-right">{item.attribution_percentage}%</TableCell>
                      <TableCell className="text-right">{item.touchpoint_count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.cost)}</TableCell>
                      <TableCell className={`text-right font-semibold ${getROASColor(item.roas)}`}>
                        {item.roas > 0 ? `${item.roas}x` : '-'}
                      </TableCell>
                      <TableCell className="text-right">{item.conversions_influenced}</TableCell>
                      <TableCell className="text-right">{item.avg_position}</TableCell>
                      <TableCell className="text-right text-yellow-500">{getEfficiencyStars(item.roas)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Attribution Comparison Chart */}
        <Card className="mb-8" data-testid="comparison-chart-card">
          <CardHeader>
            <CardTitle>Attribution Model Comparison</CardTitle>
            <p className="text-sm text-slate-500">Compare how different models attribute revenue across channels</p>
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                />
                <Legend />
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

        {/* Journey Explorer */}
        <Card data-testid="journey-explorer-card">
          <CardHeader>
            <CardTitle>Customer Journey Explorer</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    data-testid="journey-search-input"
                    placeholder="Search by name or journey ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterTouchpoints} onValueChange={setFilterTouchpoints}>
                  <SelectTrigger data-testid="journey-filter-select">
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
                  <TableRow>
                    <TableHead>Journey ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Journey Path</TableHead>
                    <TableHead className="text-right">Touchpoints</TableHead>
                    <TableHead className="text-right">Days to Convert</TableHead>
                    <TableHead className="text-right">Conversion Value</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJourneys.slice(0, 20).map((journey) => (
                    <TableRow key={journey.journey_id} data-testid={`journey-row-${journey.journey_id}`}>
                      <TableCell className="font-medium">{journey.journey_id}</TableCell>
                      <TableCell>{journey.customer_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {journey.touchpoints.slice(0, 4).map((tp, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs"
                              style={{ borderColor: CHANNEL_COLORS[tp.channel], color: CHANNEL_COLORS[tp.channel] }}
                            >
                              {tp.channel.split(' ')[0]}
                            </Badge>
                          ))}
                          {journey.touchpoints.length > 4 && (
                            <span className="text-xs text-slate-500">+{journey.touchpoints.length - 4}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{journey.touchpoint_count}</TableCell>
                      <TableCell className="text-right">{journey.time_to_conversion}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(journey.conversion_value)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          data-testid={`view-journey-${journey.journey_id}`}
                          variant="ghost" 
                          size="sm"
                          onClick={() => openJourneyDetail(journey.journey_id)}
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
              <div className="text-center py-8 text-slate-500">
                No journeys found matching your filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Journey Detail Modal */}
      <Dialog open={journeyDetailModal} onOpenChange={setJourneyDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="journey-detail-modal">
          {selectedJourney && (
            <>
              <DialogHeader>
                <DialogTitle>Journey Details - {selectedJourney.journey_id}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Customer</p>
                    <p className="font-semibold">{selectedJourney.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Conversion Value</p>
                    <p className="font-semibold text-green-600">{formatCurrency(selectedJourney.conversion_value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Touchpoints</p>
                    <p className="font-semibold">{selectedJourney.touchpoint_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Time to Convert</p>
                    <p className="font-semibold">{selectedJourney.time_to_conversion} days</p>
                  </div>
                </div>

                {/* Journey Timeline */}
                <div>
                  <h3 className="font-semibold mb-4">Journey Timeline</h3>
                  <div className="space-y-4">
                    {selectedJourney.touchpoints.map((tp, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: CHANNEL_COLORS[tp.channel] }}
                          >
                            {tp.sequence}
                          </div>
                          {index < selectedJourney.touchpoints.length - 1 && (
                            <div className="w-0.5 h-12 bg-slate-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{tp.channel}</p>
                              <p className="text-sm text-slate-500">{tp.interaction_type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {tp.days_before_conversion === 0 ? 'Conversion' : `${tp.days_before_conversion} days before`}
                              </p>
                              {tp.cost > 0 && (
                                <p className="text-sm text-slate-500">{formatCurrency(tp.cost)}</p>
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

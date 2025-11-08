import { Brain, Sparkles, TrendingUp, Activity, BarChart3, PieChart, AlertCircle, Zap, Target, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import StarfieldBackground from "@/components/StarfieldBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ScatterChart, Scatter, ZAxis
} from "recharts";
import { useInsightsData } from "@/api/useInsightsData";

const Insights = () => {
  const {
    patternData,
    eventDistribution,
    correlationData,
    topInsights,
    cmeAnalysis,
    flareClassification,
    isLoading,
    isError
  } = useInsightsData();

  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <Brain className="w-16 h-16 text-primary animate-pulse mx-auto" />
                <p className="text-lg text-muted-foreground">Loading AI insights...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                <p className="text-lg text-red-500">Error loading insights data</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarfieldBackground />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-12 h-12 text-primary animate-pulse-glow" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent">
              AI Intelligence Insights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deep learning analysis and pattern recognition from space weather data
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Live data from NASA DONKI & NOAA • Updated every 5 minutes</span>
            </div>
          </div>

          {/* Key Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topInsights.map((insight, index) => (
              <Card
                key={index}
                className={`border-border bg-card/80 backdrop-blur-sm hover:shadow-glow-cyan transition-all duration-300 animate-fade-in cursor-pointer transform hover:-translate-y-1 ${
                  selectedInsight === index ? 'ring-2 ring-primary shadow-glow-cyan' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedInsight(selectedInsight === index ? null : index)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {insight.severity === 'high' && <Zap className="w-4 h-4 text-warning animate-pulse" />}
                      {insight.severity === 'medium' && <Target className="w-4 h-4 text-accent" />}
                      {insight.severity === 'low' && <Activity className="w-4 h-4 text-primary" />}
                      <Badge
                        variant="outline"
                        className={`${
                          insight.severity === "high"
                            ? "border-warning text-warning animate-pulse"
                            : insight.severity === "medium"
                            ? "border-accent text-accent"
                            : "border-primary text-primary"
                        }`}
                      >
                        {insight.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{insight.title}</h3>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <p className="text-2xl font-bold text-primary">{insight.confidence.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <p className="text-2xl font-bold text-accent">{insight.dataPoints.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Data Points</p>
                    </div>
                  </div>
                  {selectedInsight === index && (
                    <div className="pt-3 mt-3 border-t border-border animate-fade-in">
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pattern Detection Over Time */}
          <Card className="border-border bg-card/80 backdrop-blur-sm shadow-glow-cyan">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Pattern Detection Timeline (30 Days)
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  NASA DONKI
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={patternData}>
                  <defs>
                    <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPatterns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="anomalies" 
                    stackId="1" 
                    stroke="hsl(var(--warning))" 
                    fill="url(#colorAnomalies)" 
                    name="Anomalies Detected" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="patterns" 
                    stackId="1" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorPatterns)" 
                    name="Patterns Found" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Source: NASA DONKI Solar Flare Data</span>
                <span>Total Events: {patternData.reduce((sum, d) => sum + d.anomalies + d.patterns, 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* CME Analysis & Flare Classification */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CME Speed and Frequency */}
            <Card className="border-border bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  CME Speed & Frequency (4 Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cmeAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="week" 
                      stroke="hsl(var(--muted-foreground))" 
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--accent))" 
                      name="CME Count"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="avgSpeed" 
                      fill="hsl(var(--primary))" 
                      name="Avg Speed (km/s)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Total CMEs: {cmeAnalysis.reduce((sum, w) => sum + w.count, 0)} • 
                    Max Speed: {Math.max(...cmeAnalysis.map(w => w.maxSpeed))} km/s
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Solar Flare Classification */}
            <Card className="border-border bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Solar Flare Classification
                  </div>
                  <Badge variant="outline" className="border-accent text-accent">
                    Last 30 Days
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={flareClassification}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {flareClassification.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Total Flares: {flareClassification.reduce((sum, f) => sum + f.value, 0)} • 
                    X-class most severe
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Distribution */}
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Space Weather Event Distribution
                </div>
                <Badge variant="outline" className="border-warning text-warning">
                  Live Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={eventDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Total Events: {eventDistribution.reduce((sum, e) => sum + e.value, 0)} • 
                  Sources: NASA DONKI (Flares, CME, GST) & NOAA SWPC
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Correlation Analysis */}
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Solar Flux vs Geomagnetic Activity Correlation
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  NOAA Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    dataKey="solarFlux" 
                    name="Solar Flux" 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Solar Flux (SFU)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="geoMagnetic" 
                    name="Geomagnetic Index" 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Kp Index (×10)', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis type="number" dataKey="size" range={[50, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Scatter 
                    name="Events" 
                    data={correlationData} 
                    fill="hsl(var(--primary))"
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Bubble size indicates correlation strength • Data points: {correlationData.length} • 
                  Sources: NOAA F10.7 Flux & Kp Index
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Insights;
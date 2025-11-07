import { TrendingUp, Calendar, AlertTriangle, Activity, Clock, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import StarfieldBackground from "@/components/StarfieldBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

const generatePredictionData = (days: number) => {
  return Array.from({ length: days }, (_, i) => ({
    day: `Day ${i + 1}`,
    predicted: Math.random() * 50 + 30,
    confidence: Math.random() * 20 + 70,
    kpIndex: Math.random() * 5 + 2,
    solarFlux: Math.random() * 100 + 70,
  }));
};

const generateHourlyData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    xray: Math.random() * 5 + 1,
    proton: Math.random() * 10 + 5,
    electron: Math.random() * 15 + 10,
  }));
};

const radarData = [
  { metric: 'Solar Flux', current: 85, predicted: 92, max: 100 },
  { metric: 'X-Ray', current: 65, predicted: 78, max: 100 },
  { metric: 'Geomagnetic', current: 45, predicted: 58, max: 100 },
  { metric: 'Proton Flux', current: 72, predicted: 68, max: 100 },
  { metric: 'Electron Flux', current: 88, predicted: 85, max: 100 },
];

const Predictions = () => {
  const predictionData = generatePredictionData(7);
  const hourlyData = generateHourlyData();

  const upcomingEvents = [
    {
      title: "Moderate Geomagnetic Storm",
      probability: "68%",
      timeframe: "48-72 hours",
      severity: "Moderate",
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      title: "Solar Flare Activity Peak",
      probability: "45%",
      timeframe: "5-7 days",
      severity: "Low",
      icon: Activity,
      color: "text-accent",
    },
    {
      title: "Enhanced Solar Wind Stream",
      probability: "82%",
      timeframe: "24-36 hours",
      severity: "Minor",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarfieldBackground />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-12 h-12 text-primary animate-pulse-glow" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent">
              AI-Powered Predictions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced machine learning models predict space weather events with high accuracy
            </p>
          </div>

          {/* 7-Day Forecast */}
          <Card className="border-border bg-card/80 backdrop-blur-sm shadow-glow-cyan">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                7-Day Space Weather Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.3)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">Predicted Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span className="text-sm text-muted-foreground">Confidence Level</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Predicted Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <Card
                  key={index}
                  className="border-border bg-card/80 backdrop-blur-sm hover:shadow-glow-cyan transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <event.icon className={`w-8 h-8 ${event.color}`} />
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.severity === "Moderate" ? "bg-warning/20 text-warning" :
                        event.severity === "Low" ? "bg-accent/20 text-accent" :
                        "bg-primary/20 text-primary"
                      }`}>
                        {event.severity}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Probability:</span>
                          <span className="font-medium text-foreground">{event.probability}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Timeframe:</span>
                          <span className="font-medium text-foreground">{event.timeframe}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          event.severity === "Moderate" ? "bg-warning" :
                          event.severity === "Low" ? "bg-accent" : "bg-primary"
                        }`}
                        style={{ width: event.probability }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 24-Hour Detailed Forecast */}
          <Card className="border-border bg-card/80 backdrop-blur-sm shadow-glow-cyan">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                24-Hour Particle Flux Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="xray" stroke="hsl(var(--warning))" strokeWidth={2} name="X-Ray Flux" />
                  <Line type="monotone" dataKey="proton" stroke="hsl(var(--primary))" strokeWidth={2} name="Proton Flux" />
                  <Line type="monotone" dataKey="electron" stroke="hsl(var(--accent))" strokeWidth={2} name="Electron Flux" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Multi-Parameter Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Multi-Parameter Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" stroke="hsl(var(--foreground))" />
                    <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                    <Radar name="Current" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Radar name="Predicted" dataKey="predicted" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Weekly Activity Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="kpIndex" fill="hsl(var(--primary))" name="Kp Index" />
                    <Bar dataKey="solarFlux" fill="hsl(var(--accent))" name="Solar Flux" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Confidence Matrix */}
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Model Confidence Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Solar Flares", confidence: 92 },
                  { label: "Geomagnetic Storms", confidence: 87 },
                  { label: "Solar Wind", confidence: 94 },
                  { label: "X-Ray Flux", confidence: 89 },
                ].map((item, index) => (
                  <div key={index} className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-border">
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-3xl font-bold text-primary">{item.confidence}%</p>
                    <div className="w-full bg-secondary rounded-full h-1">
                      <div
                        className="h-1 rounded-full bg-primary"
                        style={{ width: `${item.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Predictions;

import { Brain, Sparkles, TrendingUp, Activity, BarChart3, PieChart, AlertCircle, Zap, Target, Clock, Lightbulb } from "lucide-react";
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

  // Cosmic color scheme
  const colors = {
    primary: '#9D4EDD', // Purple
    secondary: '#FF006E', // Pink
    accent: '#3A86FF', // Blue
    warning: '#FFBE0B', // Yellow
    success: '#06FFA5', // Cyan-green
    bg: '#0a0118',
    cardBg: 'rgba(26, 9, 47, 0.8)',
  };

  // Calculate correlation insights
  const getCorrelationInsight = () => {
    if (!correlationData || correlationData.length === 0) return "Insufficient data for analysis";
    
    const avgSolarFlux = correlationData.reduce((sum, d) => sum + d.solarFlux, 0) / correlationData.length;
    const avgGeoMagnetic = correlationData.reduce((sum, d) => sum + d.geoMagnetic, 0) / correlationData.length;
    
    const highFluxHighKp = correlationData.filter(d => d.solarFlux > avgSolarFlux && d.geoMagnetic > avgGeoMagnetic).length;
    const correlationStrength = (highFluxHighKp / correlationData.length) * 100;
    
    if (correlationStrength > 60) {
      return `Strong positive correlation detected (${correlationStrength.toFixed(0)}% of data points). When solar flux increases, geomagnetic activity typically intensifies within 24-48 hours, indicating solar wind interactions with Earth's magnetosphere.`;
    } else if (correlationStrength > 40) {
      return `Moderate correlation observed (${correlationStrength.toFixed(0)}% of data points). Solar flux shows some relationship with geomagnetic activity, suggesting periodic solar wind influences.`;
    } else {
      return `Weak correlation detected (${correlationStrength.toFixed(0)}% of data points). Current conditions show independent solar and geomagnetic variations, possibly due to varying solar wind speeds or CME absence.`;
    }
  };

  const getCMEInsight = () => {
    if (!cmeAnalysis || cmeAnalysis.length === 0) return "No CME data available";
    
    const totalCMEs = cmeAnalysis.reduce((sum, w) => sum + w.count, 0);
    const avgSpeed = cmeAnalysis.reduce((sum, w) => sum + w.avgSpeed, 0) / cmeAnalysis.length;
    const maxSpeed = Math.max(...cmeAnalysis.map(w => w.maxSpeed));
    
    return `Total of ${totalCMEs} CMEs detected in the past month with average speed of ${Math.round(avgSpeed)} km/s. ${maxSpeed > 1000 ? `Peak speed of ${maxSpeed} km/s indicates potential for strong geomagnetic storms. Fast CMEs (>1000 km/s) can trigger satellite disruptions and aurora displays at lower latitudes.` : 'Current CME speeds are within normal ranges, posing minimal risk to satellite operations.'}`;
  };

  const getFlareDistributionInsight = () => {
    if (!flareClassification || flareClassification.length === 0) return "No flare data available";
    
    const xClass = flareClassification.find(f => f.name.includes('X'))?.value || 0;
    const mClass = flareClassification.find(f => f.name.includes('M'))?.value || 0;
    const total = flareClassification.reduce((sum, f) => sum + f.value, 0);
    
    const severePercentage = ((xClass + mClass) / total) * 100;
    
    return `${severePercentage.toFixed(1)}% of detected flares are M or X class. ${xClass > 0 ? `${xClass} X-class flare(s) detected - these can cause radio blackouts and significantly impact HF communications.` : 'No X-class flares currently detected.'} ${mClass > 5 ? `Elevated M-class flare activity (${mClass} events) suggests active solar regions capable of producing stronger eruptions.` : 'M-class flare activity is within normal solar cycle variations.'}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: colors.bg }}>
        <StarfieldBackground />
        <div className="relative z-10">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <Brain className="w-16 h-16 animate-pulse mx-auto" style={{ color: colors.primary }} />
                <p className="text-lg text-gray-400">Loading AI insights...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: colors.bg }}>
        <StarfieldBackground />
        <div className="relative z-10">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 mx-auto" style={{ color: colors.secondary }} />
                <p className="text-lg" style={{ color: colors.secondary }}>Error loading insights data</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 rounded-xl transition-all"
                  style={{ 
                    background: colors.primary,
                    boxShadow: `0 0 20px ${colors.primary}40`
                  }}
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: colors.bg }}>
      <StarfieldBackground />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-12 h-12 animate-pulse" style={{ color: colors.primary }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span style={{ 
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                AI Intelligence Insights
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Deep learning analysis and pattern recognition from space weather data
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Live data from NASA DONKI & NOAA • Updated every 5 minutes</span>
            </div>
          </div>

          {/* Key Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topInsights.map((insight, index) => (
              <Card
                key={index}
                className="cursor-pointer transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  background: colors.cardBg,
                  border: `2px solid ${selectedInsight === index ? colors.primary : 'rgba(157, 78, 221, 0.3)'}`,
                  boxShadow: selectedInsight === index ? `0 0 30px ${colors.primary}40` : 'none'
                }}
                onClick={() => setSelectedInsight(selectedInsight === index ? null : index)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {insight.severity === 'high' && <Zap className="w-4 h-4 animate-pulse" style={{ color: colors.warning }} />}
                      {insight.severity === 'medium' && <Target className="w-4 h-4" style={{ color: colors.accent }} />}
                      {insight.severity === 'low' && <Activity className="w-4 h-4" style={{ color: colors.success }} />}
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: insight.severity === "high" ? colors.warning : 
                                     insight.severity === "medium" ? colors.accent : colors.success,
                          color: insight.severity === "high" ? colors.warning : 
                                insight.severity === "medium" ? colors.accent : colors.success,
                        }}
                        className={insight.severity === "high" ? "animate-pulse" : ""}
                      >
                        {insight.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{insight.timestamp}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-3 rounded-lg bg-black/30 hover:bg-black/50 transition-colors">
                      <p className="text-2xl font-bold" style={{ color: colors.primary }}>{insight.confidence.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Confidence</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-black/30 hover:bg-black/50 transition-colors">
                      <p className="text-2xl font-bold" style={{ color: colors.accent }}>{insight.dataPoints.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Data Points</p>
                    </div>
                  </div>
                  {selectedInsight === index && (
                    <div className="pt-3 mt-3 border-t border-gray-700 animate-fade-in">
                      <p className="text-sm text-gray-400">{insight.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Section Title */}
          <div className="pt-8">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif', color: colors.primary }}>
              Solar Event Trends
            </h2>
            <p className="text-gray-400">Historical patterns and frequency analysis</p>
          </div>

          {/* Pattern Detection Over Time */}
          <Card style={{ background: colors.cardBg, border: `1px solid ${colors.primary}40` }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: colors.primary }} />
                  <span style={{ color: colors.primary }}>Pattern Detection Timeline (30 Days)</span>
                </div>
                <Badge variant="outline" style={{ borderColor: colors.primary, color: colors.primary }}>
                  NASA DONKI
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={patternData}>
                  <defs>
                    <linearGradient id="cosmicAnomalies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors.secondary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="cosmicPatterns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.cardBg,
                      border: '1px solid rgba(157, 78, 221, 0.3)',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="anomalies" stackId="1" stroke={colors.secondary} fill="url(#cosmicAnomalies)" name="Anomalies Detected" />
                  <Area type="monotone" dataKey="patterns" stackId="1" stroke={colors.primary} fill="url(#cosmicPatterns)" name="Patterns Found" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                <span>Source: NASA DONKI Solar Flare Data</span>
                <span>Total Events: {patternData.reduce((sum, d) => sum + d.anomalies + d.patterns, 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* CME Analysis & Flare Classification */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CME Speed and Frequency */}
            <Card style={{ background: colors.cardBg, border: `1px solid ${colors.accent}40` }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif', color: colors.accent }}>
                  <BarChart3 className="w-5 h-5" />
                  CME Speed & Frequency (4 Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cmeAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.cardBg,
                        border: '1px solid rgba(58, 134, 255, 0.3)',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill={colors.accent} name="CME Count" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgSpeed" fill={colors.primary} name="Avg Speed (km/s)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: colors.warning }} />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {getCMEInsight()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Solar Flare Classification */}
            <Card style={{ background: colors.cardBg, border: `1px solid ${colors.secondary}40` }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" style={{ color: colors.secondary }} />
                    <span style={{ color: colors.secondary }}>Solar Flare Classification</span>
                  </div>
                  <Badge variant="outline" style={{ borderColor: colors.secondary, color: colors.secondary }}>
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
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: colors.warning }} />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {getFlareDistributionInsight()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section Title */}
          <div className="pt-8">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif', color: colors.accent }}>
              Correlation Analysis
            </h2>
            <p className="text-gray-400">Understanding relationships between solar and geomagnetic phenomena</p>
          </div>

          {/* Event Distribution */}
          <Card style={{ background: colors.cardBg, border: `1px solid ${colors.success}40` }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" style={{ color: colors.success }} />
                  <span style={{ color: colors.success }}>Space Weather Event Distribution</span>
                </div>
                <Badge variant="outline" style={{ borderColor: colors.warning, color: colors.warning }}>
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
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: colors.warning }} />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Event distribution shows the relative frequency of different space weather phenomena. Solar flares are the most common but CMEs and geomagnetic storms have longer-lasting effects on Earth's magnetosphere and satellite operations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Correlation Analysis */}
          <Card style={{ background: colors.cardBg, border: `1px solid ${colors.primary}40` }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: colors.primary }} />
                  <span style={{ color: colors.primary }}>Solar Flux vs Geomagnetic Activity Correlation</span>
                </div>
                <Badge variant="outline" style={{ borderColor: colors.primary, color: colors.primary }}>
                  NOAA Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number" 
                    dataKey="solarFlux" 
                    name="Solar Flux" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Solar Flux (SFU)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="geoMagnetic" 
                    name="Geomagnetic Index" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Kp Index (×10)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                  />
                  <ZAxis type="number" dataKey="size" range={[50, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: colors.cardBg,
                      border: '1px solid rgba(157, 78, 221, 0.3)',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Scatter name="Events" data={correlationData} fill={colors.primary} />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: colors.warning }} />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {getCorrelationInsight()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Insights;
import { Activity, Zap, Sun, Brain, Info, Clock, TrendingUp, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import StarfieldBackground from "@/components/StarfieldBackground";
import ChatInterface from "@/components/ChatInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSpaceData } from "@/api/useSpaceData";
import { useSpaceChartData } from "@/api/useSpaceChartData";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState } from "react";

const Index = () => {
  const { data, isLoading, isError, error } = useSpaceData();
  const { xrayData, flareData, isLoading: chartsLoading } = useSpaceChartData();
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // Tooltip content
  const tooltips = {
  solarFlux:
    "Solar Flux\n" +
    "Solar flux measures how much energy the Sun emits toward Earth in the form of radio waves.\n" +
    "\tIt’s often measured at a frequency of 10.7 cm (2800 MHz) and tells us how active the Sun is.\n" +
    "\tHigher solar flux = more solar activity = stronger ionization in Earth’s upper atmosphere (affecting radio signals and satellites).",

  kpIndex:
    "🌍 Kp Index\n" +
    "The Kp index shows how disturbed Earth’s magnetic field is, on a scale of 0 to 9.\n" +
    "\tLow Kp (0–3): calm geomagnetic conditions.\n" +
    "\tHigh Kp (5+): geomagnetic storms possible — this can cause auroras or satellite disruptions.",

  flareIntensity:
    "🌋 Flare Intensity & Classes\n" +
    "Solar flares are sudden bursts of energy from the Sun’s surface.\n" +
    "\tThey’re classified by strength:\n" +
    "\tA, B, C → small flares\n" +
    "\tM → medium intensity\n" +
    "\tX → strongest flares (can disrupt radio, GPS, and cause auroras)\n" +
    "Each class is 10× stronger than the one before.",

  riskScore:
    "Risk Score\n" +
    "AI-calculated probability of space weather disruption based on current conditions."
};


  const getFlareClass = (flux: number) => {
    if (!flux) return "A0.0";
    const logFlux = Math.log10(flux);
    if (logFlux >= -4) return `X${(flux / 1e-4).toFixed(1)}`;
    if (logFlux >= -5) return `M${(flux / 1e-5).toFixed(1)}`;
    if (logFlux >= -6) return `C${(flux / 1e-6).toFixed(1)}`;
    if (logFlux >= -7) return `B${(flux / 1e-7).toFixed(1)}`;
    return `A${(flux / 1e-8).toFixed(1)}`;
  };

  const calculateRiskScore = () => {
    if (!data.kpIndex || !data.xRayFlux) return 24;
    let riskScore = 0;
    const kp = parseFloat(data.kpIndex.value);
    if (kp >= 7) riskScore += 40;
    else if (kp >= 5) riskScore += 30;
    else if (kp >= 4) riskScore += 20;
    else riskScore += (kp / 4) * 20;
    
    const flux = data.xRayFlux.xray_long;
    const logFlux = Math.log10(flux);
    if (logFlux >= -4) riskScore += 40;
    else if (logFlux >= -5) riskScore += 30;
    else if (logFlux >= -6) riskScore += 20;
    else riskScore += 10;
    
    if (data.cmeEvents && data.cmeEvents.length > 0) {
      const recentCME = data.cmeEvents[0];
      if (recentCME.is_halo) riskScore += 20;
      else if (recentCME.speed > 1000) riskScore += 15;
      else if (recentCME.speed > 500) riskScore += 10;
    }
    return Math.min(Math.round(riskScore), 100);
  };

  const getConditionColor = (type: string, value: number) => {
    if (type === 'solarFlux') {
      if (value > 160) return { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]' };
      if (value > 120) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-500', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]' };
      return { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-500', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]' };
    }
    if (type === 'kpIndex') {
      if (value > 5) return { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]' };
      if (value > 3) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-500', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]' };
      return { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-500', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]' };
    }
    return { bg: 'bg-cyan-500/10', border: 'border-cyan-500', text: 'text-cyan-500', glow: '' };
  };

  const generateNaturalSummary = () => {
    if (!data.kpIndex || !data.xRayFlux) return "Loading space weather data...";
    
    const kp = parseFloat(data.kpIndex.value);
    const flareClass = data.xRayFlux ? getFlareClass(data.xRayFlux.xray_long) : "A0.0";
    const solarFlux = Math.round(data.solarFlux?.value || 142);
    
    let activity = "calm";
    if (kp > 5 || flareClass.startsWith('X')) activity = "highly active";
    else if (kp > 3 || flareClass.startsWith('M')) activity = "moderately active";
    
    let geoField = "stable";
    if (kp > 6) geoField = "stormy";
    else if (kp > 4) geoField = "unsettled";
    
    let satelliteStatus = "stable";
    if (kp > 5) satelliteStatus = "at elevated risk";
    else if (kp > 3) satelliteStatus = "being monitored";
    
    return `The Sun is ${activity} with a ${flareClass} class flare and ${geoField} geomagnetic field (Kp=${kp.toFixed(1)}). Solar flux at ${solarFlux} SFU. Satellite operations ${satelliteStatus}.`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#050B16]">
        <StarfieldBackground />
        <div className="relative z-10">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-lg text-gray-400">Loading space weather data...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#050B16]">
        <StarfieldBackground />
        <div className="relative z-10">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                <p className="text-lg text-red-500">Error loading data: {error?.message}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-[#00FFFF] text-[#050B16] rounded-xl hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all"
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

  const solarFluxValue = data.solarFlux?.value || 142;
  const kpIndexValue = parseFloat(data.kpIndex?.value || "3.2");
  const flareClass = data.xRayFlux ? getFlareClass(data.xRayFlux.xray_long) : "C2.4";
  const riskScore = calculateRiskScore();

  const solarFluxColor = getConditionColor('solarFlux', solarFluxValue);
  const kpColor = getConditionColor('kpIndex', kpIndexValue);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050B16]">
      <StarfieldBackground />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="bg-gradient-to-r from-[#FFD43B] via-[#00FFFF] to-[#FF6B00] bg-clip-text text-transparent">
                Live Space Weather Dashboard
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Real-time monitoring of solar activity and geomagnetic conditions
            </p>
          </div>

          {/* Metrics Grid with Tooltips */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Solar Flux */}
            <div 
              className={`relative p-6 rounded-2xl border-2 ${solarFluxColor.border} ${solarFluxColor.bg} backdrop-blur-sm transition-all duration-300 ${hoveredMetric === 'solarFlux' ? solarFluxColor.glow : ''}`}
              onMouseEnter={() => setHoveredMetric('solarFlux')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <Sun className="w-8 h-8 text-[#FFD43B]" />
                <Info className="w-5 h-5 text-gray-400 cursor-help" />
              </div>
              <h3 className="text-sm text-gray-400 mb-2">Solar Flux</h3>
              <p className={`text-3xl font-bold ${solarFluxColor.text}`}>{Math.round(solarFluxValue)}</p>
              <p className="text-xs text-gray-500 mt-1">SFU</p>
              {hoveredMetric === 'solarFlux' && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-[#0D1624] border border-gray-700 rounded-xl text-xs text-gray-300 w-64 z-50">
                  {tooltips.solarFlux}
                </div>
              )}
            </div>

            {/* Kp Index */}
            <div 
              className={`relative p-6 rounded-2xl border-2 ${kpColor.border} ${kpColor.bg} backdrop-blur-sm transition-all duration-300 ${hoveredMetric === 'kpIndex' ? kpColor.glow : ''}`}
              onMouseEnter={() => setHoveredMetric('kpIndex')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <Activity className="w-8 h-8 text-[#00FFFF]" />
                <Info className="w-5 h-5 text-gray-400 cursor-help" />
              </div>
              <h3 className="text-sm text-gray-400 mb-2">Kp Index</h3>
              <p className={`text-3xl font-bold ${kpColor.text}`}>{kpIndexValue.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">Kp</p>
              {hoveredMetric === 'kpIndex' && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-[#0D1624] border border-gray-700 rounded-xl text-xs text-gray-300 w-64 z-50">
                  {tooltips.kpIndex}
                </div>
              )}
            </div>

            {/* Flare Intensity */}
            <div 
              className={`relative p-6 rounded-2xl border-2 border-[#FF6B00] bg-[#FF6B00]/10 backdrop-blur-sm transition-all duration-300 ${flareClass.startsWith('M') || flareClass.startsWith('X') ? 'animate-pulse shadow-[0_0_20px_rgba(255,107,0,0.5)]' : ''}`}
              onMouseEnter={() => setHoveredMetric('flareIntensity')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <Zap className="w-8 h-8 text-[#FF6B00]" />
                <Info className="w-5 h-5 text-gray-400 cursor-help" />
              </div>
              <h3 className="text-sm text-gray-400 mb-2">Flare Intensity</h3>
              <p className="text-3xl font-bold text-[#FF6B00]">{flareClass}</p>
              <p className="text-xs text-gray-500 mt-1">Class</p>
              {hoveredMetric === 'flareIntensity' && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-[#0D1624] border border-gray-700 rounded-xl text-xs text-gray-300 w-64 z-50">
                  {tooltips.flareIntensity}
                </div>
              )}
            </div>

            {/* AI Risk Score */}
            <div 
              className="relative p-6 rounded-2xl border-2 border-[#00FFFF] bg-[#00FFFF]/10 backdrop-blur-sm transition-all duration-300"
              onMouseEnter={() => setHoveredMetric('riskScore')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <Brain className="w-8 h-8 text-[#00FFFF]" />
                <Info className="w-5 h-5 text-gray-400 cursor-help" />
              </div>
              <h3 className="text-sm text-gray-400 mb-2">AI Risk Score</h3>
              <p className="text-3xl font-bold text-[#00FFFF]">{riskScore}</p>
              <p className="text-xs text-gray-500 mt-1">%</p>
              {hoveredMetric === 'riskScore' && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-[#0D1624] border border-gray-700 rounded-xl text-xs text-gray-300 w-64 z-50">
                  {tooltips.riskScore}
                </div>
              )}
            </div>
          </div>

          {/* Natural Language Summary */}
          <Card className="border-2 border-[#00FFFF]/30 bg-[#0D1624]/80 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00FFFF]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <TrendingUp className="w-5 h-5" />
                Current Conditions Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                {generateNaturalSummary()}
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Updated at {data.kpIndex?.time_tag || new Date().toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section - Only 2 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-700/50 bg-[#0D1624]/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#FFD43B]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Solar Flux vs Time (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-500">Loading chart...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={flareData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0D1624', 
                          border: '1px solid #374151',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#FFD43B" strokeWidth={2} name="Flare Count" />
                      <Line type="monotone" dataKey="maxIntensity" stroke="#FF6B00" strokeWidth={2} name="Max Intensity" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-700/50 bg-[#0D1624]/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#00FFFF]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  X-Ray Flux Levels (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-500">Loading chart...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={xrayData}>
                      <defs>
                        <linearGradient id="colorLong" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#00FFFF" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorShort" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#62FF7E" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#62FF7E" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 'auto']} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0D1624', 
                          border: '1px solid #374151',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="longFlux" stroke="#00FFFF" fill="url(#colorLong)" name="Long Channel" />
                      <Area type="monotone" dataKey="shortFlux" stroke="#62FF7E" fill="url(#colorShort)" name="Short Channel" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* <ChatInterface /> */}
    </div>
  );
};

export default Index;
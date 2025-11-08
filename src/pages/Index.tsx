import { Activity, Zap, Radio, Brain, Sun, Satellite } from "lucide-react";
import Navbar from "@/components/Navbar";
import MetricCard from "@/components/MetricCard";
import ChartCard from "@/components/ChartCard";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import ChatInterface from "@/components/ChatInterface";
import StarfieldBackground from "@/components/StarfieldBackground";
import { useSpaceData } from "@/api/useSpaceData";
import { useSpaceChartData } from "@/api/useSpaceChartData";

const Index = () => {
  const { data, isLoading, isError, error } = useSpaceData();
  const { xrayData, flareData, isLoading: chartsLoading } = useSpaceChartData();

  // Helper function to determine flare class from X-ray flux
  const getFlareClass = (flux) => {
    if (!flux) return "A0.0";
    const logFlux = Math.log10(flux);
    if (logFlux >= -4) return `X${(flux / 1e-4).toFixed(1)}`;
    if (logFlux >= -5) return `M${(flux / 1e-5).toFixed(1)}`;
    if (logFlux >= -6) return `C${(flux / 1e-6).toFixed(1)}`;
    if (logFlux >= -7) return `B${(flux / 1e-7).toFixed(1)}`;
    return `A${(flux / 1e-8).toFixed(1)}`;
  };

  // Helper function to calculate AI risk score
  const calculateRiskScore = () => {
    if (!data.kpIndex || !data.xRayFlux) return 24;
    
    let riskScore = 0;
    
    // Kp Index contribution (0-40 points)
    const kp = parseFloat(data.kpIndex.value);
    if (kp >= 7) riskScore += 40;
    else if (kp >= 5) riskScore += 30;
    else if (kp >= 4) riskScore += 20;
    else riskScore += (kp / 4) * 20;
    
    // X-ray flux contribution (0-40 points)
    const flux = data.xRayFlux.xray_long;
    const logFlux = Math.log10(flux);
    if (logFlux >= -4) riskScore += 40; // X-class
    else if (logFlux >= -5) riskScore += 30; // M-class
    else if (logFlux >= -6) riskScore += 20; // C-class
    else riskScore += 10; // B/A-class
    
    // CME contribution (0-20 points)
    if (data.cmeEvents && data.cmeEvents.length > 0) {
      const recentCME = data.cmeEvents[0];
      if (recentCME.is_halo) riskScore += 20;
      else if (recentCME.speed > 1000) riskScore += 15;
      else if (recentCME.speed > 500) riskScore += 10;
    }
    
    return Math.min(Math.round(riskScore), 100);
  };

  // Helper function to determine trend
  const getTrend = (key) => {
    // Simple trend logic - in production, you'd compare with historical data
    if (key === 'kp' && data.kpIndex) {
      const kp = parseFloat(data.kpIndex.value);
      return kp > 4 ? "up" : kp > 2 ? "stable" : "down";
    }
    return "stable";
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-lg text-muted-foreground">Loading space weather data...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-red-500 text-2xl">⚠</span>
                </div>
                <p className="text-lg text-red-500">Error loading data: {error?.message}</p>
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

  const solarFluxValue = data.solarFlux?.value || 142;
  const kpIndexValue = data.kpIndex?.value || "3.2";
  const flareClass = data.xRayFlux ? getFlareClass(data.xRayFlux.xray_long) : "C2.4";
  const riskScore = calculateRiskScore();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarfieldBackground />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent">
              AI-Driven Space Weather Intelligence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time monitoring and prediction of solar activity, geomagnetic storms, and satellite risk assessment
            </p>
            {data.kpIndex && (
              <p className="text-sm text-muted-foreground">
                Last updated: {data.kpIndex.time_tag}
              </p>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Solar Flux"
              value={Math.round(solarFluxValue).toString()}
              unit="SFU"
              icon={Sun}
              trend="stable"
              glowColor="yellow"
            />
            <MetricCard
              title="Kp Index"
              value={kpIndexValue.toString()}
              unit="Kp"
              icon={Activity}
              trend={getTrend('kp')}
              glowColor="cyan"
            />
            <MetricCard
              title="Flare Intensity"
              value={flareClass}
              unit="Class"
              icon={Zap}
              trend="down"
              glowColor="green"
            />
            <MetricCard
              title="AI Risk Score"
              value={riskScore.toString()}
              unit="%"
              icon={Brain}
              trend={riskScore > 50 ? "up" : riskScore > 30 ? "stable" : "down"}
              glowColor="cyan"
            />
          </div>

          {/* Charts Section - NOW DYNAMIC! */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title="Solar Flare Activity (24h)" 
              type="line" 
              data={flareData}
              isLoading={chartsLoading}
            />
            <ChartCard 
              title="X-Ray Flux Levels" 
              type="area" 
              data={xrayData}
              isLoading={chartsLoading}
            />
          </div>

          {/* 3D Visualization Placeholder */}
          <div className="relative h-96 rounded-xl border border-border bg-gradient-cosmic overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-glow opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
              <Satellite className="w-16 h-16 text-primary animate-float" />
              <h3 className="text-2xl font-bold text-foreground">3D Satellite Orbit View</h3>
              <p className="text-muted-foreground">Interactive globe visualization coming soon</p>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse delay-200"></div>
              </div>
            </div>
          </div>

          {/* AI Insights Panel */}
          <AIInsightsPanel />

          {/* Flare Events Timeline */}
          <div className="relative rounded-xl border border-border bg-secondary/30 overflow-hidden">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                Recent Solar Flare Events
              </h3>
              {data.solarFlares && data.solarFlares.length > 0 ? (
                <div className="space-y-2">
                  {data.solarFlares.map((flare, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">{flare.class}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(flare.peakTime).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {flare.region || 'Unknown Region'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent flare events detected
                </div>
              )}
            </div>
          </div>

          {/* CME Events */}
          {data.cmeEvents && data.cmeEvents.length > 0 && (
            <div className="relative rounded-xl border border-border bg-secondary/30 overflow-hidden">
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" />
                  Recent Coronal Mass Ejections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.cmeEvents.map((cme, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-background/50 rounded-lg border border-border hover:border-accent transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Speed</span>
                          <span className="text-lg font-bold text-accent">
                            {cme.speed !== 'N/A' ? `${cme.speed} km/s` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Type</span>
                          <span className={`text-sm font-semibold ${cme.is_halo ? 'text-warning' : 'text-primary'}`}>
                            {cme.is_halo ? 'Halo CME' : 'Partial'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(cme.time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      Floating Chat Interface
      <ChatInterface />
    </div>
  );
};

export default Index;
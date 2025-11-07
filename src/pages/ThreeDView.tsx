import { Globe, Satellite, Radio, Activity, AlertCircle, Zap, TrendingUp, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import StarfieldBackground from "@/components/StarfieldBackground";
import InteractiveEarth3D from "@/components/InteractiveEarth3D";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSatelliteData } from "@/api/useSatelliteData";
import { useState } from "react";

const ThreeDView = () => {
  const { 
    satellites, 
    issPosition, 
    geomagAlerts, 
    affectedRegions, 
    kpIndex, 
    isLoading, 
    isError, 
    error 
  } = useSatelliteData();

  const [selectedSatellite, setSelectedSatellite] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Loading state
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
                <p className="text-lg text-muted-foreground">Loading satellite tracking data...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
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
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-lg text-red-500">Error loading tracking data: {error?.message}</p>
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
              <Globe className="w-12 h-12 text-primary animate-float" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent">
              3D Global Visualization
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive visualization of satellite positions and space weather impact zones
            </p>
            {kpIndex && (
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30">
                  <Activity className="w-4 h-4 text-accent" />
                  <span className="text-sm">
                    Kp Index: <span className="font-bold text-accent">{kpIndex.toFixed(1)}</span>
                  </span>
                </div>
                {issPosition && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                    <Satellite className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm">
                      ISS: <span className="font-bold text-primary">{issPosition.velocity}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Geomagnetic Alerts Banner */}
          {geomagAlerts && geomagAlerts.length > 0 && (
            <Card className="border-warning bg-warning/10 backdrop-blur-sm animate-pulse-slow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-warning flex items-center gap-2">
                      Active Geomagnetic Storm Alerts
                      <Badge variant="outline" className="border-warning text-warning">
                        {geomagAlerts.length} Active
                      </Badge>
                    </h3>
                    <div className="space-y-1">
                      {geomagAlerts.slice(0, 3).map((alert, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          • {alert.message} - <span className="text-xs">{new Date(alert.issueTime).toLocaleString()}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main 3D Viewport */}
          <Card className="border-border bg-gradient-cosmic overflow-hidden shadow-glow-cyan group">
            <CardContent className="p-0">
              <div className="relative h-[700px] bg-black">
                <InteractiveEarth3D 
                  issPosition={issPosition}
                  satellites={satellites}
                  kpIndex={kpIndex}
                />
                
                {/* Enhanced Info Panel */}
                <div className="absolute top-4 left-4 p-4 rounded-lg bg-card/95 backdrop-blur-md border border-border space-y-3 max-w-xs z-10 shadow-lg">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Eye className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Interactive Controls</p>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Hover & drag to rotate Earth</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Scroll to zoom in/out</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-warning">•</span>
                      <span>Red pulsing dot = ISS position</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Green dots = Safe satellites</span>
                    </div>
                  </div>
                  {issPosition && (
                    <div className="pt-3 mt-3 border-t border-border space-y-1">
                      <p className="text-xs font-semibold text-primary">ISS Live Data</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Lat:</span>
                          <span className="text-foreground ml-1">{issPosition.latitude.toFixed(2)}°</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lon:</span>
                          <span className="text-foreground ml-1">{issPosition.longitude.toFixed(2)}°</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Alt:</span>
                          <span className="text-foreground ml-1">{issPosition.altitude}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Speed:</span>
                          <span className="text-foreground ml-1">{issPosition.velocity}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Update Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-card/95 backdrop-blur-md border border-primary/30 z-10 shadow-lg">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping"></div>
                  </div>
                  <span className="text-xs text-foreground font-medium">Live Tracking</span>
                </div>

                {/* Atmosphere intensity indicator */}
                {kpIndex && kpIndex > 5 && (
                  <div className="absolute bottom-4 left-4 px-4 py-2 rounded-lg bg-warning/20 backdrop-blur-md border border-warning z-10">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-warning animate-pulse" />
                      <span className="text-xs text-warning font-semibold">
                        Enhanced Atmospheric Activity
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Satellite Status Grid - Enhanced */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Satellite className="w-6 h-6 text-primary" />
                Tracked Satellites
              </h2>
              <span className="text-sm text-muted-foreground">
                Risk from Kp: {kpIndex?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {satellites.map((satellite, index) => (
                <Card
                  key={index}
                  className={`border-border bg-card/80 backdrop-blur-sm hover:shadow-glow-cyan transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                    selectedSatellite === satellite.name ? 'ring-2 ring-primary shadow-glow-cyan' : ''
                  }`}
                  onClick={() => setSelectedSatellite(selectedSatellite === satellite.name ? null : satellite.name)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          satellite.status === 'alert' ? 'bg-warning' :
                          satellite.status === 'monitoring' ? 'bg-accent' : 'bg-primary'
                        }`}></div>
                        <h3 className="font-semibold text-foreground">{satellite.name}</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          satellite.status === "alert"
                            ? "border-warning text-warning"
                            : satellite.status === "monitoring"
                            ? "border-accent text-accent"
                            : "border-primary text-primary"
                        }`}
                      >
                        {satellite.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Altitude:</span>
                        <span className="text-foreground font-medium">{satellite.altitude}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Risk Level:</span>
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            satellite.risk === "High"
                              ? "text-warning"
                              : satellite.risk === "Medium"
                              ? "text-accent"
                              : "text-primary"
                          }`}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {satellite.risk}
                        </span>
                      </div>
                    </div>
                    {satellite.name === "ISS" && issPosition && (
                      <div className="pt-3 mt-3 border-t border-border">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-primary/10 rounded p-2">
                            <p className="text-muted-foreground">Latitude</p>
                            <p className="text-primary font-bold">{issPosition.latitude.toFixed(2)}°</p>
                          </div>
                          <div className="bg-accent/10 rounded p-2">
                            <p className="text-muted-foreground">Longitude</p>
                            <p className="text-accent font-bold">{issPosition.longitude.toFixed(2)}°</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedSatellite === satellite.name && (
                      <div className="pt-2 text-xs text-muted-foreground animate-fade-in">
                        <p>Real-time risk assessment based on geomagnetic activity and orbital altitude.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Affected Regions - Enhanced */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Radio className="w-6 h-6 text-primary" />
              Affected Geographic Regions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {affectedRegions.map((region, index) => (
                <Card
                  key={index}
                  className={`border-border bg-card/80 backdrop-blur-sm hover:shadow-glow-cyan transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                    selectedRegion === region.region ? 'ring-2 ring-accent shadow-glow-cyan' : ''
                  }`}
                  onClick={() => setSelectedRegion(selectedRegion === region.region ? null : region.region)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">{region.region}</h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            region.severity === "High"
                              ? "border-warning text-warning animate-pulse"
                              : region.severity === "Moderate"
                              ? "border-accent text-accent"
                              : "border-primary text-primary"
                          }`}
                        >
                          {region.severity}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Aurora Forecast
                            </span>
                            <span className="text-foreground font-medium">{region.auroras}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Kp Index
                            </span>
                            <span className="text-accent font-bold text-lg">{region.kpIndex}</span>
                          </div>
                        </div>
                        {selectedRegion === region.region && (
                          <div className="text-xs text-muted-foreground p-3 bg-primary/5 rounded-lg animate-fade-in border border-primary/20">
                            <p className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">ℹ️</span>
                              <span>
                                Severity based on current geomagnetic activity. Aurora visibility depends on 
                                local weather conditions and light pollution.
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Data Attribution */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground text-center">
                🛰️ Data sources: NOAA Space Weather Prediction Center • WhereTheISS.at API • 
                📡 Updates: ISS position every 5s, Space weather every 5min • 
                🌍 3D Earth model with real-time atmospheric effects
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ThreeDView;
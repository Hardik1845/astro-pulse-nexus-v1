import { Globe, Satellite, Radio, Activity, AlertCircle, Zap, TrendingUp, Eye, MapPin } from "lucide-react";
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

  const [selectedSatellite, setSelectedSatellite] = useState<string>("ISS");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Get selected satellite data
  const getSelectedSatelliteData = () => {
    if (selectedSatellite === "ISS" && issPosition) {
      return {
        name: "ISS",
        altitude: issPosition.altitude,
        latitude: issPosition.latitude.toFixed(2),
        longitude: issPosition.longitude.toFixed(2),
        velocity: issPosition.velocity,
        status: satellites.find(s => s.name === "ISS")?.status || "safe",
        risk: satellites.find(s => s.name === "ISS")?.risk || "Low"
      };
    }
    
    const sat = satellites.find(s => s.name === selectedSatellite);
    if (sat) {
      return {
        name: sat.name,
        altitude: sat.altitude,
        latitude: "N/A",
        longitude: "N/A",
        velocity: "N/A",
        status: sat.status,
        risk: sat.risk
      };
    }
    return null;
  };

  const selectedData = getSelectedSatelliteData();

  // Get status color and description
  const getStatusInfo = () => {
    if (!kpIndex) return { color: "bg-green-500", badge: "🟢 Safe", desc: "Normal" };
    
    if (kpIndex >= 6) return { 
      color: "bg-red-500", 
      badge: "🔴 At Risk",
      desc: "High geomagnetic activity - Satellite operations may be affected"
    };
    if (kpIndex >= 4) return { 
      color: "bg-yellow-500", 
      badge: "🟡 Watch",
      desc: "Moderate geomagnetic activity - Monitoring required"
    };
    return { 
      color: "bg-green-500", 
      badge: "🟢 Safe",
      desc: "Low geomagnetic activity - Normal operations"
    };
  };

  const statusInfo = getStatusInfo();

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
                <p className="text-lg text-gray-400">Loading satellite tracking data...</p>
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
                <p className="text-lg text-red-500">Error loading tracking data: {error?.message}</p>
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050B16]">
      <StarfieldBackground />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-12 h-12 text-[#00FFFF] animate-float" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="bg-gradient-to-r from-[#00FFFF] via-[#62FF7E] to-[#FFD43B] bg-clip-text text-transparent">
                3D Global Visualization
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Interactive visualization of satellite positions and space weather impact zones
            </p>
            {kpIndex && (
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FFFF]/10 border border-[#00FFFF]/30">
                  <Activity className="w-4 h-4 text-[#00FFFF]" />
                  <span className="text-sm">
                    Kp Index: <span className="font-bold text-[#00FFFF]">{kpIndex.toFixed(1)}</span>
                  </span>
                </div>
                {issPosition && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30">
                    <Satellite className="w-4 h-4 text-[#FF6B00] animate-pulse" />
                    <span className="text-sm">
                      ISS: <span className="font-bold text-[#FF6B00]">{issPosition.velocity}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Geomagnetic Alerts Banner */}
          {geomagAlerts && geomagAlerts.length > 0 && (
            <Card className="border-[#FFD43B] bg-[#FFD43B]/10 backdrop-blur-sm animate-pulse-slow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#FFD43B] mt-0.5 flex-shrink-0 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-[#FFD43B] flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Active Geomagnetic Storm Alerts
                      <Badge variant="outline" className="border-[#FFD43B] text-[#FFD43B]">
                        {geomagAlerts.length} Active
                      </Badge>
                    </h3>
                    <div className="space-y-1">
                      {geomagAlerts.slice(0, 3).map((alert, idx) => (
                        <p key={idx} className="text-sm text-gray-400">
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
          <Card className="border-[#00FFFF]/30 bg-gradient-to-br from-[#0D1624] to-[#0a0a14] overflow-hidden shadow-[0_0_40px_rgba(0,255,255,0.3)]">
            <CardContent className="p-0">
              <div className="relative h-[700px] bg-black">
                <InteractiveEarth3D 
                  issPosition={issPosition}
                  satellites={satellites}
                  kpIndex={kpIndex}
                />
                
                {/* Enhanced Info Panel */}
                <div className="absolute top-4 left-4 p-4 rounded-xl bg-[#0D1624]/95 backdrop-blur-md border-2 border-[#00FFFF]/30 space-y-3 max-w-xs z-10 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#00FFFF]/30">
                    <Eye className="w-4 h-4 text-[#00FFFF]" />
                    <p className="text-sm font-semibold text-[#00FFFF]" style={{ fontFamily: 'Orbitron, sans-serif' }}>Interactive Controls</p>
                  </div>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-start gap-2">
                      <span className="text-[#00FFFF]">•</span>
                      <span>Drag to rotate • Scroll to zoom</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FF6B00]">🔴</span>
                      <span>ISS (Live tracking)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#62FF7E]">🟢</span>
                      <span>Other satellites</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#62FF7E]">💚</span>
                      <span>Aurora zones (65-70° lat)</span>
                    </div>
                  </div>
                </div>

                {/* Live Update Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1624]/95 backdrop-blur-md border-2 border-[#00FFFF]/30 z-10 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-[#00FFFF] animate-pulse"></div>
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#00FFFF] animate-ping"></div>
                  </div>
                  <span className="text-xs text-white font-medium">Live Tracking</span>
                </div>

                {/* Aurora Legend */}
                <div className="absolute bottom-4 left-4 px-4 py-3 rounded-xl bg-[#0D1624]/95 backdrop-blur-md border-2 border-[#62FF7E]/30 z-10">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#62FF7E]" />
                    <div className="text-xs">
                      <p className="font-semibold text-[#62FF7E] mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>Aurora Forecast Zones</p>
                      <div className="space-y-0.5 text-gray-400">
                        <p>🟢 Green rings: High-latitude aurora zones</p>
                        <p>🔴 Red areas: Geomagnetic impact (Kp {'>'}5)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Atmosphere Indicator */}
                {kpIndex && kpIndex > 5 && (
                  <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-[#FF6B00]/20 backdrop-blur-md border-2 border-[#FF6B00] z-10">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#FF6B00] animate-pulse" />
                      <span className="text-xs text-[#FF6B00] font-semibold">
                        Enhanced Atmospheric Activity
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Satellite Info Card */}
          <Card className="border-2 border-[#00FFFF]/30 bg-[#0D1624]/80 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#00FFFF]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Selected Satellite Data
                </h3>
                <Badge variant="outline" className={`${statusInfo.color} text-white border-0 px-3 py-1`}>
                  {statusInfo.badge}
                </Badge>
              </div>
              
              {selectedData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#00FFFF]/10 border border-[#00FFFF]/30">
                    <p className="text-xs text-gray-400 mb-1">Satellite</p>
                    <p className="text-lg font-bold text-[#00FFFF]">{selectedData.name}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FFD43B]/10 border border-[#FFD43B]/30">
                    <p className="text-xs text-gray-400 mb-1">Altitude</p>
                    <p className="text-lg font-bold text-[#FFD43B]">{selectedData.altitude}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#62FF7E]/10 border border-[#62FF7E]/30">
                    <p className="text-xs text-gray-400 mb-1">Position</p>
                    <p className="text-sm font-bold text-[#62FF7E]">
                      {selectedData.latitude}°, {selectedData.longitude}°
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30">
                    <p className="text-xs text-gray-400 mb-1">Velocity</p>
                    <p className="text-lg font-bold text-[#FF6B00]">{selectedData.velocity}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-4 rounded-xl bg-black/30 border border-gray-700">
                <p className="text-sm text-gray-400">{statusInfo.desc}</p>
              </div>
            </CardContent>
          </Card>

          {/* Satellite Status Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <Satellite className="w-6 h-6 text-[#00FFFF] inline mr-2" />
                Tracked Satellites
              </h2>
              <span className="text-sm text-gray-400">
                Click to view details • Risk from Kp: {kpIndex?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {satellites.map((satellite, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${
                    selectedSatellite === satellite.name 
                      ? 'ring-2 ring-[#00FFFF] shadow-[0_0_30px_rgba(0,255,255,0.5)] border-[#00FFFF]' 
                      : 'border-gray-700 hover:border-[#00FFFF]/50'
                  } bg-[#0D1624]/80 backdrop-blur-sm`}
                  onClick={() => setSelectedSatellite(satellite.name)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          satellite.status === 'alert' ? 'bg-red-500' :
                          satellite.status === 'monitoring' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <h3 className="font-semibold text-white">{satellite.name}</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          satellite.status === "alert"
                            ? "border-red-500 text-red-500"
                            : satellite.status === "monitoring"
                            ? "border-yellow-500 text-yellow-500"
                            : "border-green-500 text-green-500"
                        }`}
                      >
                        {satellite.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Altitude:</span>
                        <span className="text-white font-medium">{satellite.altitude}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Risk Level:</span>
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            satellite.risk === "High"
                              ? "text-red-500"
                              : satellite.risk === "Medium"
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {satellite.risk}
                        </span>
                      </div>
                    </div>
                    {satellite.name === "ISS" && issPosition && (
                      <div className="pt-3 mt-3 border-t border-gray-700">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[#00FFFF]/10 rounded p-2">
                            <p className="text-gray-400">Latitude</p>
                            <p className="text-[#00FFFF] font-bold">{issPosition.latitude.toFixed(2)}°</p>
                          </div>
                          <div className="bg-[#62FF7E]/10 rounded p-2">
                            <p className="text-gray-400">Longitude</p>
                            <p className="text-[#62FF7E] font-bold">{issPosition.longitude.toFixed(2)}°</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 pt-2">
                      {satellite.name === "ISS" && "International Space Station - Low Earth Orbit research facility"}
                      {satellite.name === "Hubble" && "Space telescope observing distant galaxies and nebulae"}
                      {satellite.name === "GPS III-5" && "Navigation satellite providing global positioning data"}
                      {satellite.name === "Starlink-4521" && "Communication satellite for global internet coverage"}
                      {satellite.name === "GOES-18" && "Weather monitoring satellite tracking storms and solar activity"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Affected Regions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <Radio className="w-6 h-6 text-[#62FF7E] inline mr-2" />
              Affected Geographic Regions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {affectedRegions.map((region, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${
                    selectedRegion === region.region ? 'ring-2 ring-[#62FF7E] shadow-[0_0_30px_rgba(98,255,126,0.5)]' : ''
                  } border-gray-700 bg-[#0D1624]/80 backdrop-blur-sm hover:border-[#62FF7E]/50`}
                  onClick={() => setSelectedRegion(selectedRegion === region.region ? null : region.region)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-[#62FF7E]" />
                          <h3 className="text-lg font-semibold text-white">{region.region}</h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            region.severity === "High"
                              ? "border-red-500 text-red-500 animate-pulse"
                              : region.severity === "Moderate"
                              ? "border-yellow-500 text-yellow-500"
                              : "border-green-500 text-green-500"
                          }`}
                        >
                          {region.severity}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-black/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Aurora Forecast
                            </span>
                            <span className="text-white font-medium">{region.auroras}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Kp Index
                            </span>
                            <span className="text-[#00FFFF] font-bold text-lg">{region.kpIndex}</span>
                          </div>
                        </div>
                        {selectedRegion === region.region && (
                          <div className="text-xs text-gray-400 p-3 bg-[#00FFFF]/5 rounded-lg animate-fade-in border border-[#00FFFF]/20">
                            <p className="flex items-start gap-2">
                              <span className="text-[#00FFFF] mt-0.5">ℹ️</span>
                              <span>
                                Severity based on current geomagnetic activity. Aurora visibility depends on 
                                local weather conditions and light pollution. Best viewing during new moon phases.
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
          <Card className="border-gray-700 bg-[#0D1624]/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 text-center">
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
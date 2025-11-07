import { useQueries, useQuery } from '@tanstack/react-query';

// API Configuration
const N2YO_API_KEY = "YOUR_N2YO_API_KEY"; // Get free key from: https://www.n2yo.com/api/
// Note: If you don't have N2YO key, we'll use Open Notify for ISS only

// API Endpoints
const SATELLITE_ENDPOINTS = {
    // ISS Current Position (Free, no key needed) - HTTPS version
    ISS_POSITION: 'https://api.wheretheiss.at/v1/satellites/25544',
    
    // NOAA Geomagnetic Storm Alerts
    NOAA_GEOMAG_ALERTS: 'https://services.swpc.noaa.gov/json/geomagnetic_storm_alerts.json',
    
    // NOAA Aurora Forecast
    NOAA_AURORA_FORECAST: 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
    
    // NOAA Planetary K-index (for severity calculation)
    NOAA_KP_INDEX: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
};

// N2YO Satellite IDs (NORAD IDs)
const SATELLITE_IDS = {
    ISS: 25544,
    HUBBLE: 20580,
    GPS_III_5: 46826,
    STARLINK: 47964, // Example Starlink satellite
    GOES_18: 51850,
};

// Generic fetch function with better error handling
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
};

/**
 * Hook to fetch ISS position (always works, no API key needed)
 */
export const useISSPosition = () => {
    return useQuery({
        queryKey: ['issPosition'],
        queryFn: () => fetchData(SATELLITE_ENDPOINTS.ISS_POSITION),
        select: (data) => ({
            name: 'ISS',
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            timestamp: data.timestamp,
            altitude: `${Math.round(data.altitude)} km`,
            velocity: `${Math.round(data.velocity)} km/h`,
        }),
        refetchInterval: 5000, // Update every 5 seconds for live tracking
        staleTime: 3000,
    });
};

/**
 * Hook to fetch geomagnetic storm alerts
 */
export const useGeomagneticAlerts = () => {
    return useQuery({
        queryKey: ['geomagAlerts'],
        queryFn: () => fetchData(SATELLITE_ENDPOINTS.NOAA_GEOMAG_ALERTS),
        select: (data) => {
            // Handle empty or null response
            if (!data || !Array.isArray(data) || data.length === 0) {
                return [];
            }
            
            // Get recent alerts (last 7 days)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return data
                .filter(alert => {
                    try {
                        return new Date(alert.issue_datetime) > weekAgo;
                    } catch {
                        return false;
                    }
                })
                .map(alert => ({
                    message: alert.message || 'Geomagnetic storm alert',
                    issueTime: alert.issue_datetime || new Date().toISOString(),
                    type: alert.type || 'geomagnetic_storm',
                }))
                .slice(0, 5); // Limit to 5 most recent
        },
        retry: 2,
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchInterval: 10 * 60 * 1000,
    });
};

/**
 * Hook to fetch current Kp index for severity calculation
 */
export const useKpIndex = () => {
    return useQuery({
        queryKey: ['kpIndexCurrent'],
        queryFn: () => fetchData(SATELLITE_ENDPOINTS.NOAA_KP_INDEX),
        select: (data) => {
            if (!data || !Array.isArray(data) || data.length === 0) {
                return 2.0; // Default safe value
            }
            const latest = data.slice(-1)[0];
            const kpValue = parseFloat(latest?.kp);
            return isNaN(kpValue) ? 2.0 : kpValue;
        },
        retry: 2,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });
};

/**
 * Calculate satellite risk based on altitude and current Kp index
 */
const calculateSatelliteRisk = (altitude, kpIndex) => {
    const altitudeKm = parseInt(altitude.replace(/,/g, ''));
    
    // Higher Kp = more risk, especially for LEO satellites
    if (altitudeKm < 1000) {
        // Low Earth Orbit - most affected
        if (kpIndex >= 6) return { level: 'High', status: 'alert' };
        if (kpIndex >= 4) return { level: 'Medium', status: 'monitoring' };
        return { level: 'Low', status: 'safe' };
    } else if (altitudeKm < 10000) {
        // Medium Earth Orbit
        if (kpIndex >= 7) return { level: 'High', status: 'alert' };
        if (kpIndex >= 5) return { level: 'Medium', status: 'monitoring' };
        return { level: 'Low', status: 'safe' };
    } else {
        // Geostationary - less affected by geomagnetic storms
        if (kpIndex >= 8) return { level: 'High', status: 'alert' };
        if (kpIndex >= 6) return { level: 'Medium', status: 'monitoring' };
        return { level: 'Low', status: 'safe' };
    }
};

/**
 * Calculate regional severity and aurora visibility
 */
const calculateRegionalImpact = (kpIndex) => {
    const regions = [
        {
            region: "North America",
            baseLatitude: 45,
        },
        {
            region: "Northern Europe",
            baseLatitude: 55,
        },
        {
            region: "Australia",
            baseLatitude: -35,
        },
        {
            region: "Asia",
            baseLatitude: 40,
        },
    ];

    return regions.map(region => {
        let severity = "Low";
        let auroras = "Not expected";

        if (kpIndex >= 7) {
            severity = "High";
            if (Math.abs(region.baseLatitude) > 40) {
                auroras = "Visible across region";
            } else {
                auroras = "Possible at high latitudes";
            }
        } else if (kpIndex >= 5) {
            severity = "Moderate";
            if (Math.abs(region.baseLatitude) > 50) {
                auroras = "Visible at high latitudes";
            } else {
                auroras = "Possible at northern/southern latitudes";
            }
        } else if (kpIndex >= 3) {
            severity = "Low";
            if (Math.abs(region.baseLatitude) > 60) {
                auroras = "Possible at extreme latitudes";
            }
        }

        return {
            region: region.region,
            severity,
            auroras,
            kpIndex: kpIndex.toFixed(1),
        };
    });
};

/**
 * Main hook to get all satellite and regional data
 */
export const useSatelliteData = () => {
    const issPosition = useISSPosition();
    const geomagAlerts = useGeomagneticAlerts();
    const kpIndex = useKpIndex();

    // Static satellite data with dynamic risk calculation
    const getSatellites = () => {
        const currentKp = kpIndex.data || 2.0;
        
        const satellites = [
            { name: "ISS", altitude: "408 km" },
            { name: "Hubble", altitude: "547 km" },
            { name: "GPS III-5", altitude: "20,200 km" },
            { name: "Starlink-4521", altitude: "550 km" },
            { name: "GOES-18", altitude: "35,786 km" },
        ];

        return satellites.map(sat => {
            const risk = calculateSatelliteRisk(sat.altitude, currentKp);
            return {
                ...sat,
                status: risk.status,
                risk: risk.level,
            };
        });
    };

    // Calculate affected regions based on Kp index
    const getAffectedRegions = () => {
        const currentKp = kpIndex.data || 2.0;
        return calculateRegionalImpact(currentKp);
    };

    // Determine if we should show loading (only on initial load, not refetch)
    const isInitialLoading = issPosition.isLoading && !issPosition.data;

    return {
        satellites: getSatellites(),
        issPosition: issPosition.data,
        geomagAlerts: geomagAlerts.data || [],
        affectedRegions: getAffectedRegions(),
        kpIndex: kpIndex.data,
        isLoading: isInitialLoading,
        isError: issPosition.isError || kpIndex.isError,
        error: issPosition.error || kpIndex.error,
    };
};

export default useSatelliteData;
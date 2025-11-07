import { useQuery } from '@tanstack/react-query';

// NASA API Key (same as your main hook)
const NASA_API_KEY = "lJMzpCiMTf0Yl6KkASAYdqraC6GYbjmYy6aY6lWz";

// Additional endpoints for chart data
const CHART_ENDPOINTS = {
    // NOAA X-ray flux - 7 days for better visualization
    NOAA_XRAY_7DAY: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json',
    // NOAA X-ray flux - 1 day
    NOAA_XRAY_1DAY: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json',
    // NASA Solar Flares - last 30 days
    NASA_SOLAR_FLARES_30D: `https://api.nasa.gov/DONKI/FLR?startDate=${getDateDaysAgo(30)}&endDate=${getDateDaysAgo(0)}&api_key=${NASA_API_KEY}`,
};

// Helper function to get date N days ago
function getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

// Generic fetch function
const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Hook to fetch X-ray flux data for charts
 * Returns data formatted for Recharts
 */
export const useXRayFluxChart = () => {
    return useQuery({
        queryKey: ['xrayFluxChart'],
        queryFn: () => fetchData(CHART_ENDPOINTS.NOAA_XRAY_1DAY),
        select: (data) => {
            // Sample every 30 data points to get hourly data (from 1-minute intervals)
            const hourlyData = data.filter((_, index) => index % 30 === 0);
            
            // Take last 24 hours
            const last24Hours = hourlyData.slice(-24);
            
            return last24Hours.map(item => {
                const time = new Date(item.time_tag);
                const longFlux = parseFloat(item.flux);
                const shortFlux = parseFloat(item.flux_short);
                
                return {
                    time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: time.getTime(),
                    // Convert to more readable values (multiply by 1e7 to make visible)
                    longFlux: longFlux * 1e7,
                    shortFlux: shortFlux * 1e7,
                    // Store original values for tooltip
                    originalLong: longFlux,
                    originalShort: shortFlux,
                    // Convert to class for reference
                    class: getFlareClass(longFlux),
                };
            });
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });
};

/**
 * Hook to fetch Solar Flare activity data for charts
 * Returns flare events over the last 24-48 hours
 */
export const useSolarFlareChart = () => {
    return useQuery({
        queryKey: ['solarFlareChart'],
        queryFn: () => fetchData(CHART_ENDPOINTS.NASA_SOLAR_FLARES_30D),
        select: (data) => {
            // Create hourly buckets for the last 24 hours
            const now = new Date();
            const hourlyBuckets = [];
            
            for (let i = 23; i >= 0; i--) {
                const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
                hourlyBuckets.push({
                    time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: hour.getTime(),
                    count: 0,
                    maxIntensity: 0,
                    flares: []
                });
            }
            
            // If no flares in last 30 days, return empty buckets
            if (!data || data.length === 0) {
                return hourlyBuckets;
            }
            
            // Filter flares from last 24 hours
            const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const recentFlares = data.filter(flare => {
                const flareTime = new Date(flare.beginTime);
                return flareTime >= last24Hours;
            });
            
            // Populate buckets with flare data
            recentFlares.forEach(flare => {
                const flareTime = new Date(flare.beginTime);
                const hoursDiff = Math.floor((now - flareTime) / (60 * 60 * 1000));
                const bucketIndex = 23 - hoursDiff;
                
                if (bucketIndex >= 0 && bucketIndex < 24) {
                    hourlyBuckets[bucketIndex].count++;
                    const intensity = getFlareIntensity(flare.classType);
                    if (intensity > hourlyBuckets[bucketIndex].maxIntensity) {
                        hourlyBuckets[bucketIndex].maxIntensity = intensity;
                    }
                    hourlyBuckets[bucketIndex].flares.push({
                        class: flare.classType,
                        time: flare.peakTime
                    });
                }
            });
            
            return hourlyBuckets;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchInterval: 10 * 60 * 1000,
    });
};

/**
 * Helper function to convert X-ray flux to flare class
 */
const getFlareClass = (flux) => {
    if (!flux || flux <= 0) return "A0.0";
    const logFlux = Math.log10(flux);
    if (logFlux >= -4) return `X${(flux / 1e-4).toFixed(1)}`;
    if (logFlux >= -5) return `M${(flux / 1e-5).toFixed(1)}`;
    if (logFlux >= -6) return `C${(flux / 1e-6).toFixed(1)}`;
    if (logFlux >= -7) return `B${(flux / 1e-7).toFixed(1)}`;
    return `A${(flux / 1e-8).toFixed(1)}`;
};

/**
 * Helper function to get numeric intensity from flare class
 * Used for chart visualization
 */
const getFlareIntensity = (classType) => {
    if (!classType) return 0;
    
    const classLetter = classType.charAt(0);
    const classNumber = parseFloat(classType.substring(1)) || 1;
    
    const baseValues = {
        'X': 1000,
        'M': 100,
        'C': 10,
        'B': 1,
        'A': 0.1
    };
    
    return (baseValues[classLetter] || 0) * classNumber;
};

/**
 * Combined hook for all chart data
 */
export const useSpaceChartData = () => {
    const xrayChart = useXRayFluxChart();
    const flareChart = useSolarFlareChart();
    
    return {
        xrayData: xrayChart.data,
        flareData: flareChart.data,
        isLoading: xrayChart.isLoading || flareChart.isLoading,
        isError: xrayChart.isError || flareChart.isError,
        error: xrayChart.error || flareChart.error,
    };
};

// Export individual hooks as default
export default useSpaceChartData;
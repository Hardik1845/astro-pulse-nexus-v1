import { useQueries, useQuery } from '@tanstack/react-query';

// --- CONFIGURATION ---
// !! IMPORTANT: REPLACE 'YOUR_NASA_API_KEY' WITH YOUR ACTUAL NASA API KEY !!
const NASA_API_KEY = "lJMzpCiMTf0Yl6KkASAYdqraC6GYbjmYy6aY6lWz"; 
// You can get one here: https://api.nasa.gov/

// --- API ENDPOINT MAPPING ---
// Using recommended endpoints from your list
const API_ENDPOINTS = {
    // NOAA Endpoints (No key required)
    NOAA_KP_INDEX: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
    NOAA_XRAY_FLUX: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json',
    NOAA_F107_FLUX: 'https://services.swpc.noaa.gov/json/f107_cm_flux.json',
    NOAA_SOLAR_WIND: 'https://services.swpc.noaa.gov/json/ace/solar_wind_5m.json',
    
    // NASA DONKI Endpoints (Requires API Key)
    NASA_SOLAR_FLARES: `https://api.nasa.gov/DONKI/FLR?startDate=${new Date().toISOString().split('T')[0]}&api_key=${NASA_API_KEY}`,
    NASA_CME: `https://api.nasa.gov/DONKI/CME?startDate=${new Date().toISOString().split('T')[0]}&api_key=${NASA_API_KEY}`,
};


/**
 * Generic function to fetch JSON data from an endpoint.
 * @param {string} url The API endpoint URL.
 */
const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Custom hook to fetch all required space weather data using useQueries for parallel fetching.
 * The hook returns a consolidated object for easy consumption in components.
 */
export const useSpaceData = () => {
    // Array of query configurations for useQueries
    const queries = [
        // 1. Kp Index (Geomagnetic Storm Indicator)
        {
            queryKey: ['kpIndex'],
            queryFn: () => fetchData(API_ENDPOINTS.NOAA_KP_INDEX),
            select: (data) => {
                // Return the latest Kp index value
                const latest = data.slice(-1)[0];
                return latest ? { 
                    value: latest.kp, 
                    time_tag: new Date(latest.time_tag).toLocaleTimeString() 
                } : null;
            }
        },
        // 2. Solar Radio Flux (F10.7)
        {
            queryKey: ['solarFlux'],
            queryFn: () => fetchData(API_ENDPOINTS.NOAA_F107_FLUX),
            select: (data) => {
                // Return the latest observed F10.7 value
                const latest = data.observed_indices?.slice(-1)[0];
                return latest ? { 
                    value: latest['f10.7_cm'], 
                    date: latest.time_tag 
                } : null;
            }
        },
        // 3. Solar X-ray Flux (Flare Intensity)
        {
            queryKey: ['xRayFlux'],
            queryFn: () => fetchData(API_ENDPOINTS.NOAA_XRAY_FLUX),
            select: (data) => {
                // Get the most recent X-ray B (lower energy) and L (higher energy) flux
                const latest = data.slice(-1)[0];
                return latest ? { 
                    xray_long: latest.flux, // Long-channel (L) flux
                    xray_short: latest.flux_short, // Short-channel (S) flux
                    time_tag: new Date(latest.time_tag).toLocaleTimeString()
                } : null;
            }
        },
        // 4. Coronal Mass Ejections (CME)
        {
            queryKey: ['cmeEvents'],
            queryFn: () => fetchData(API_ENDPOINTS.NASA_CME),
            select: (data) => {
                // Format recent CME events (past 7 days)
                return data.slice(0, 5).map(cme => ({
                    time: cme.startTime,
                    speed: cme.cmeAnalyses?.[0]?.speed || 'N/A',
                    is_halo: cme.cmeAnalyses?.[0]?.isHalo || false,
                }));
            }
        },
        // 5. Solar Flare Events
        {
            queryKey: ['solarFlares'],
            queryFn: () => fetchData(API_ENDPOINTS.NASA_SOLAR_FLARES),
            select: (data) => {
                // Format recent flare events
                return data.slice(0, 5).map(flare => ({
                    class: flare.flrID.split(' - ')[1], // e.g., 'C1.2'
                    peakTime: flare.peakTime,
                    region: flare.sourceLocation,
                }));
            }
        },
    ];

    const results = useQueries({ queries });

    // Consolidate loading, error, and data into a single object for the component
    const isLoading = results.some(result => result.isLoading);
    const isError = results.some(result => result.isError);
    const error = results.find(result => result.isError)?.error;

    const data = {
        kpIndex: results[0].data,
        solarFlux: results[1].data,
        xRayFlux: results[2].data,
        cmeEvents: results[3].data,
        solarFlares: results[4].data,
    };

    return { data, isLoading, isError, error };
};

// Export the types of data for clarity in the pages (optional but helpful)
export const DataKeys = {
    KP_INDEX: 'kpIndex',
    SOLAR_FLUX: 'solarFlux',
    XRAY_FLUX: 'xRayFlux',
    CME_EVENTS: 'cmeEvents',
    SOLAR_FLARES: 'solarFlares'
};

// Default export is the hook
export default useSpaceData;
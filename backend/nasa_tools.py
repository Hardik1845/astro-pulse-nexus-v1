# filename: nasa_tools.py
import os, json, requests
from datetime import datetime, timedelta
from loguru import logger
from dotenv import load_dotenv
# helper parsers (place near top of nasa_tools.py)
import json
from typing import Any,Dict

def _ensure_dict(value: Any) -> dict:
    """
    Convert many possible shapes into a Python dict.
    Accepts: dict, JSON string, Python dict-string, or 'key:val' style.
    """
    if isinstance(value, dict):
        return value
    if isinstance(value, list):
        # if they passed a list where dict expected, wrap it
        return {"list": value}
    if isinstance(value, (str, bytes)):
        s = value.decode() if isinstance(value, bytes) else value
        # try JSON
        try:
            parsed = json.loads(s)
            if isinstance(parsed, dict):
                return parsed
            # if parsed is list, wrap in dict
            if isinstance(parsed, list):
                return {"list": parsed}
        except Exception:
            pass
        # try naive python-eval fallback (local/hackathon only)
        try:
            parsed = eval(s)  # only use in controlled dev environment
            if isinstance(parsed, dict):
                return parsed
            if isinstance(parsed, list):
                return {"list": parsed}
        except Exception:
            pass
        # fallback: return as single value under 'value'
        return {"value": s}
    # other types
    return {"value": value}


def _ensure_list(value: Any) -> list:
    """
    Robustly return a Python list from either list, JSON-str, or dict['list'].
    """
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return parsed
            if isinstance(parsed, dict) and "list" in parsed:
                return parsed["list"]
        except Exception:
            pass
        # try eval fallback
        try:
            parsed = eval(value)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
        return [value]
    if isinstance(value, dict):
        # maybe the dict itself is a single item list wrapper
        if "list" in value and isinstance(value["list"], list):
            return value["list"]
        return [value]
    # fallback
    return [value]

load_dotenv()
NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")
NASA_BASE_URL = "https://api.nasa.gov/DONKI"
CACHE_ENABLED = os.getenv("ENABLE_CACHE", "true").lower() == "true"
_cache = {}

logger.remove()
logger.add(lambda msg: print(msg, end=""), level="INFO")

# ==============================
# 1. Fetch Solar Flares
# ==============================
def fetch_nasa_solar_flares(days_back: int = 7) -> str:
    # handle cases where input is a JSON string or dict
    if isinstance(days_back, (str, bytes)):
        try:
            days_back = int(json.loads(days_back).get("days_back", 7))
        except Exception:
            try:
                days_back = int(days_back)
            except Exception:
                days_back = 7
    elif isinstance(days_back, dict):
        days_back = int(days_back.get("days_back", 7))

    end = datetime.utcnow()
    start = end - timedelta(days=int(days_back))
    start_str, end_str = start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")
    cache_key = f"flares_{start_str}_{end_str}"

    if CACHE_ENABLED and cache_key in _cache:
        logger.info(f"[CACHE] Using cached data {start_str} → {end_str}\n")
        return _cache[cache_key]

    try:
        url = f"{NASA_BASE_URL}/FLR"
        params = {"startDate": start_str, "endDate": end_str, "api_key": NASA_API_KEY}
        res = requests.get(url, params=params, timeout=15)
        res.raise_for_status()
        data = res.json()

        flares = [
            {
                "flareID": f.get("flrID", "Unknown"),
                "beginTime": f.get("beginTime", ""),
                "peakTime": f.get("peakTime", ""),
                "classType": f.get("classType", "Unknown"),
                "sourceLocation": f.get("sourceLocation", "Unknown"),
                "activeRegionNum": f.get("activeRegionNum", 0),
            }
            for f in data
        ]
        result = json.dumps(flares, indent=2)
        if CACHE_ENABLED:
            _cache[cache_key] = result
        logger.info(f"[NASA] Retrieved {len(flares)} flares\n")
        return result

    except Exception as e:
        logger.error(f"[NASA] Fallback due to: {e}\n")
        return json.dumps(
            [{
                "flareID": "FALLBACK",
                "classType": "M2.1",
                "peakTime": datetime.utcnow().isoformat(),
                "sourceLocation": "N10W15",
                "note": "Fallback data used."
            }]
        )

# ==============================
# 2. Analyze Escalation
# ==============================
def analyze_flare_escalation(flares_json: str) -> str:
    """Analyze trend and risk level in recent solar flare activity."""
    try:
        import json

        # --- Robust input normalization ---
        if isinstance(flares_json, (dict, list)):
            flares = flares_json
        elif isinstance(flares_json, str):
            try:
                flares = json.loads(flares_json)
            except Exception:
                try:
                    flares = eval(flares_json)  # fallback for "{...}"-style strings
                except Exception:
                    flares = []
        else:
            flares = []

        if not flares:
            return json.dumps({
                "trend": "STABLE",
                "risk_level": "LOW",
                "reasoning": "No solar activity detected.",
                "statistics": {"flare_count": 0}
            })

        # --- Convert flare classes to numeric intensities ---
        def val(c):
            if not c:
                return 0
            mult = {"C": 1, "M": 10, "X": 100}
            try:
                return mult.get(c[0].upper(), 0) * float(c[1:])
            except Exception:
                return 0

        vals = [val(f.get("classType", "")) for f in flares if val(f.get("classType", "")) > 0]
        if not vals:
            return json.dumps({
                "trend": "STABLE",
                "risk_level": "LOW",
                "reasoning": "No measurable flare intensities detected."
            })

        # --- Calculate trend and averages ---
        early, recent = vals[:len(vals)//2], vals[len(vals)//2:]
        ea = sum(early)/len(early) if early else 0
        ra = sum(recent)/len(recent) if recent else 0
        trend = "ESCALATING" if ra > ea * 1.3 else "DECLINING" if ra < ea * 0.7 else "STABLE"

        mx = max(vals)
        if mx >= 100:
            risk = "SEVERE"
            reason = f"X-class flare ({mx}) detected; {trend.lower()} trend."
        elif mx >= 50:
            risk = "HIGH"
            reason = f"Strong M-class activity ({mx}); {trend.lower()} trend."
        elif mx >= 10:
            risk = "MODERATE"
            reason = f"M-class activity ({mx}); {trend.lower()} trend."
        else:
            risk = "LOW"
            reason = f"C-class only ({mx}); {trend.lower()} trend."

        return json.dumps({
            "trend": trend,
            "risk_level": risk,
            "reasoning": reason,
            "statistics": {
                "flare_count": len(flares),
                "max_intensity": round(mx, 2),
                "recent_avg": round(ra, 2),
                "early_avg": round(ea, 2)
            }
        }, indent=2)

    except Exception as e:
        logger.error(f"[ANALYSIS ERROR] {e}\n")
        return json.dumps({"error": str(e)})

# ==============================
# 3. Predict Magnetosphere Impact
# ==============================
def predict_magnetosphere_impact(flare_class: str, source_location: str = "N10W10") -> str:
    """Predict Earth's magnetosphere impact from a solar flare."""
    try:
        import json

        # --- Robust input normalization ---
        # Sometimes the agent passes a JSON string or dict instead of plain string args
        if isinstance(flare_class, dict):
            flare_class = flare_class.get("flare_class") or flare_class.get("classType") or "M1.0"
            source_location = flare_class.get("source_location", source_location)
        elif isinstance(flare_class, str):
            try:
                maybe = json.loads(flare_class)
                if isinstance(maybe, dict):
                    flare_class = maybe.get("flare_class") or maybe.get("classType") or flare_class
                    source_location = maybe.get("source_location", source_location)
            except Exception:
                # Try eval fallback for '{"flare_class":"X1.8","source_location":"N24E63"}'
                if "flare_class" in flare_class and "source_location" in flare_class:
                    try:
                        maybe = eval(flare_class)
                        flare_class = maybe.get("flare_class", flare_class)
                        source_location = maybe.get("source_location", source_location)
                    except Exception:
                        pass

        # --- Validate and parse flare class ---
        if not flare_class or len(flare_class) < 2:
            return json.dumps({"error": "Invalid flare class"})

        c = flare_class[0].upper()
        try:
            m = float(flare_class[1:])
        except Exception:
            m = 1.0

        # --- Physical approximations ---
        cme_likely = (c == "X") or (c == "M" and m >= 1)
        if not cme_likely:
            return json.dumps({
                "cme_likely": False,
                "direct_impact_probability": "LOW",
                "explanation": f"{flare_class} flares rarely produce Earth-directed CMEs."
            })

        speed = 500 * (2.0 + m / 10 if c == "X" else 1.2 + m / 20)
        hrs = int((1.5e8 / speed) / 3600)
        kp = 8 if (c == "X" and m >= 5) else 7 if c == "X" else 6 if m >= 5 else 5

        if not source_location or "Unknown" in source_location:
            prob = "MODERATE"
            prob_reason = "source location is unknown."
        elif "E" in source_location:
            prob = "LOW"
            prob_reason = f"its location at {source_location} is on the eastern limb, so a CME is likely to miss Earth."
        elif "W" in source_location:
            prob = "HIGH"
            prob_reason = f"its location at {source_location} is on the western limb, which is geo-effective."
        else:
            prob = "MODERATE"
            prob_reason = f"its location at {source_location} is near the center."


        effects = (
            ["Severe GPS disruptions", "Radio blackouts", "Aurora at mid-latitudes"]
            if kp >= 7 else
            ["GPS degradation", "HF interference", "Aurora at high latitudes"]
        )
        explanation = (
            f"The estimated Kp index is {kp} (a {'severe' if kp >= 7 else 'strong'} geomagnetic storm) "
            f"due to the high power of the {flare_class} flare. "
            f"However, the probability of a *direct* Earth impact is rated '{prob}' because {prob_reason}"
        )

        return json.dumps({
            "cme_likely": True,
            "arrival_time_hours": hrs,
            "kp_index_estimate": kp,
            "impact_probability": prob,
            "effects": effects,
            "reasoning": f"{flare_class} flare from {source_location} likely to reach Earth in ~{hrs//24} days."
        }, indent=2)

    except Exception as e:
        logger.error(f"[IMPACT ERROR] {e}\n")
        return json.dumps({"error": str(e)})

# ==============================
# 4. Satellite Vulnerability
# ==============================
def calculate_satellite_vulnerability(flare_class: str, kp_index: int = None) -> str:
    """Estimate satellite vulnerability based on flare class and geomagnetic activity (Kp index)."""
    try:
        import json

        # --- Input normalization ---
        # Sometimes the agent passes a JSON string or dict instead of plain arguments
        if isinstance(flare_class, dict):
            flare_class = flare_class.get("flare_class") or flare_class.get("classType") or "M1.0"
            kp_index = flare_class.get("kp_index", kp_index)
        elif isinstance(flare_class, str):
            # maybe it’s a JSON string: '{"flare_class":"X1.8","kp_index":7}'
            try:
                maybe = json.loads(flare_class)
                if isinstance(maybe, dict):
                    flare_class = maybe.get("flare_class") or maybe.get("classType") or flare_class
                    kp_index = maybe.get("kp_index", kp_index)
            except Exception:
                # Try eval fallback for '{flare_class:"M5.2",kp_index:6}'
                if "flare_class" in flare_class and "kp_index" in flare_class:
                    try:
                        maybe = eval(flare_class)
                        flare_class = maybe.get("flare_class", flare_class)
                        kp_index = maybe.get("kp_index", kp_index)
                    except Exception:
                        pass

        # --- Fallback logic if kp_index is missing ---
        if kp_index is None:
            # Intelligent defaults based on flare class
            if isinstance(flare_class, str):
                if flare_class.startswith("X"):
                    kp_index = 7
                elif flare_class.startswith("M"):
                    kp_index = 5
                else:
                    kp_index = 3
            else:
                kp_index = 5  # default moderate geomagnetic activity

        # --- Validation ---
        if not flare_class or not isinstance(flare_class, str):
            flare_class = "M1.0"
        try:
            kp_index = int(kp_index)
        except Exception:
            kp_index = 5

        # --- Severity logic ---
        sev = (
            "SEVERE" if kp_index >= 7 or flare_class.startswith("X")
            else "HIGH" if kp_index >= 5 or flare_class.startswith("M")
            else "MODERATE" if kp_index >= 4
            else "LOW"
        )

        def v(risk, issues, recs):
            return {"risk": risk, "issues": issues, "recommendations": recs}

        data = {
            "LEO": v(
                "HIGH" if sev in ["SEVERE", "HIGH"] else "LOW",
                ["Atmospheric drag ↑", "Orbit decay", "Comm dropouts"] if sev != "LOW" else ["Nominal"],
                ["Track more often", "Reboost if needed"] if sev != "LOW" else ["Normal ops"]
            ),
            "MEO": v(
                "HIGH" if sev in ["SEVERE", "HIGH"] else "LOW",
                ["GPS accuracy ↓", "Radiation exposure"] if sev != "LOW" else ["Minimal impact"],
                ["Enable multi-constellation", "Scrub memory"] if sev != "LOW" else ["Standard ops"]
            ),
            "GEO": v(
                "HIGH" if sev in ["SEVERE", "HIGH"] else "LOW",
                ["Charging risk", "Attitude control issues"] if sev != "LOW" else ["Normal conditions"],
                ["Monitor charging", "Prepare safing"] if sev != "LOW" else ["Normal ops"]
            ),
        }

        return json.dumps({
            "overall_severity": sev,
            "kp_index": kp_index,
            "flare_class": flare_class,
            "vulnerabilities": data,
            "timestamp": datetime.utcnow().isoformat()
        }, indent=2)

    except Exception as e:
        logger.error(f"[VULNERABILITY ERROR] {e}\n")
        return json.dumps({"error": str(e)})


# ==============================
# 5. Generate Operational Alert
# ==============================
def generate_operational_alert(risk_level="MODERATE", flare_class="M5.0", impact_hours=48) -> str:
    """Generate a structured operational alert for space weather operators."""
    try:
        import json

        # --- Input normalization ---
        # Handle dict or JSON-string input
        if isinstance(risk_level, dict):
            data = risk_level
            risk_level = data.get("risk_level", "MODERATE")
            flare_class = data.get("flare_class", flare_class)
            impact_hours = data.get("impact_hours", impact_hours)
        elif isinstance(risk_level, str):
            try:
                maybe = json.loads(risk_level)
                if isinstance(maybe, dict):
                    risk_level = maybe.get("risk_level", "MODERATE")
                    flare_class = maybe.get("flare_class", flare_class)
                    impact_hours = maybe.get("impact_hours", impact_hours)
            except Exception:
                # Try eval fallback for '{"risk_level":"HIGH","flare_class":"M5.2","impact_hours":36}'
                if "risk_level" in risk_level and "flare_class" in risk_level:
                    try:
                        maybe = eval(risk_level)
                        risk_level = maybe.get("risk_level", "MODERATE")
                        flare_class = maybe.get("flare_class", flare_class)
                        impact_hours = maybe.get("impact_hours", impact_hours)
                    except Exception:
                        pass

        # --- Type safety ---
        if not isinstance(risk_level, str):
            risk_level = str(risk_level or "MODERATE")
        if not isinstance(flare_class, str):
            flare_class = str(flare_class or "M5.0")
        try:
            impact_hours = int(impact_hours)
        except Exception:
            impact_hours = 48

        risk = risk_level.upper()

        # --- Alert logic ---
        actions = {
            "SEVERE": [
                "Activate emergency protocols",
                "Reduce transmit power",
                "Enable redundant systems"
            ],
            "HIGH": [
                "Increase monitoring",
                "Review emergency procedures"
            ],
            "MODERATE": [
                "Continue monitoring",
                "Review forecasts"
            ],
            "LOW": ["Routine monitoring"]
        }.get(risk, ["Standard operations"])

        alert = {
            "meta": {
                "id": f"ASTROPULSE-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "generated_by": "AstroPulse AI",
            },
            "severity": risk,
            "flare_class": flare_class,
            "impact_eta_hours": impact_hours,
            "title": f"{risk} SPACE WEATHER ALERT",
            "summary": f"{flare_class} flare detected. Impact expected in ~{impact_hours}h.",
            "actions": actions,
        }

        logger.info(f"[ALERT] {risk} level alert generated\n")
        return json.dumps(alert, indent=2)

    except Exception as e:
        logger.error(f"[ALERT ERROR] {e}\n")
        return json.dumps({"error": str(e)})

#tool 6
def fetch_nasa_kp_index(days_back: int = 1) -> Dict[str, Any]:
    """Fetches recent Kp index from NOAA SWPC with fallback to static NASA data."""
    try:
        from datetime import datetime, timedelta
        import requests, json

        # Normalize input
        if isinstance(days_back, str):
            try:
                days_back = int(days_back)
            except ValueError:
                days_back = 1

        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days_back)

        urls = [
            "https://services.swpc.noaa.gov/json/planetary_k_index_1d.json",  # primary
            "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json"   # backup
        ]

        kp_data = None
        for url in urls:
            try:
                r = requests.get(url, timeout=10)
                if r.status_code == 200:
                    kp_data = r.json()
                    if isinstance(kp_data, list) and len(kp_data) > 0:
                        break
            except Exception as e:
                logger.warning(f"[KPINDEX] {url} failed: {e}")
                continue

        if not kp_data:
            raise ValueError("Failed to fetch Kp index data from both NOAA APIs")

        latest = kp_data[-1]
        kp_value = float(latest.get("kp_index", latest.get("kp", 5)))
        logger.info(f"[KPINDEX] Using Kp={kp_value} from {latest.get('time_tag')}")

        return {
            "kp_index": kp_value,
            "source": "NOAA SWPC",
            "timestamp": latest.get("time_tag", end_date.isoformat()),
        }

    except Exception as e:
        logger.error(f"[KPINDEX ERROR] {e}")
        # --- FIX: Using the improved static fallback from our previous chat ---
        # (Assuming you are using the 'kpindex_tool.py' we built before)
        # (If not, this fallback is still better than the old '5')
        logger.error(f"[KPINDEX FALLBACK] Live fetch failed: {e}. Returning static data.")
        
        STATIC_KP_DATA = [
            {"time_tag": "2025-11-04T18:00:00Z", "kp": 7.00, "observed": "true"},
            {"time_tag": "2025-11-04T21:00:00Z", "kp": 7.33, "observed": "true"},
            {"time_tag": "2025-11-05T00:00:00Z", "kp": 6.67, "observed": "true"}
        ]
        latest_static = STATIC_KP_DATA[-1]
        static_kp = float(latest_static.get("kp", 5))

        return {
            "kp_index": static_kp,
            "source": "STATIC FALLBACK",
            "timestamp": latest_static.get("time_tag", "2025-11-05T00:00:00Z"),
            "error_details": str(e),
            "note": f"Defaulted to static Kp={static_kp} due to live data fetch error."
        }
    print(fetch_nasa_kp_index(1))

if __name__ == "__main__":
    print("🧪 NASA Tools Smoke Test")
    f = fetch_nasa_solar_flares(3)
    print(analyze_flare_escalation(f))
    print(predict_magnetosphere_impact("M5.2"))
    kp = fetch_nasa_kp_index(1)
    print(kp)
    print(calculate_satellite_vulnerability("M5.2", kp.get("kp_index", 6)))
    print(generate_operational_alert("HIGH", "M5.2", 48))
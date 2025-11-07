# filename: main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from solar_agent import SolarAnalystAgent
from nasa_tools import (
    fetch_nasa_solar_flares,
    analyze_flare_escalation,
    predict_magnetosphere_impact,
    calculate_satellite_vulnerability,
    generate_operational_alert,
    fetch_nasa_kp_index
)
import os, json, logging

# ==============================
# Environment and logging setup
# ==============================
load_dotenv()

os.environ["OPENAI_API_KEY"] = os.getenv("GEMINI_API_KEY", "")
os.environ["OPENAI_API_BASE"] = "https://generativelanguage.googleapis.com/v1beta/openai/"

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("AstroPulse")

# ==============================
# FastAPI App
# ==============================
app = FastAPI(title="AstroPulse Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Core Models
# ==============================
class UserMessage(BaseModel):
    message: str

llm = ChatOpenAI(model="gemini-2.5-flash")
solar_agent = SolarAnalystAgent(model_name="gemini-2.5-flash", verbose=True)

# ==============================
# Chat Endpoint (Direct Gemini)
# ==============================
@app.post("/chat")
async def chat(user_msg: UserMessage):
    try:
        response = llm.invoke(user_msg.message)
        return {"reply": response.content}
    except Exception as e:
        logger.exception("Chat endpoint error")
        return {"error": str(e)}

# ==============================
# Agent Endpoint (Autonomous)
# ==============================
@app.post("/agent")
async def agent_endpoint(
    user_msg: UserMessage,
    brief: bool = Query(True, description="Short Gemini summary"),
    trace: bool = Query(False, description="Include reasoning trace")
):
    """
    Autonomous AI Space Weather Agent.
    """
    try:
        result = solar_agent.query(user_msg.message)
        if not result["success"]:
            return {"status": "error", "error": result.get("error", "Unknown failure")}

        full_report = result.get("output", "").split("Invalid Format")[0].strip()

        if brief:
            summary_prompt = (
                "Summarize the following solar activity report in 2–3 short sentences. "
                "Highlight the overall trend, strongest flare, risk level, and Earth impact likelihood.\n\n"
                f"{full_report}"
            )
            summary = llm.invoke(summary_prompt).content.strip()
            output = summary
            mode = "brief"
        else:
            output = full_report
            mode = "full"

        response = {
            "status": "success",
            "report": output,
            "steps": len(result.get("intermediate_steps", [])),
            "mode": mode,
        }

        if trace:
            # attach reasoning steps for frontend visualization
            response["trace"] = result.get("intermediate_steps", [])

        return response

    except Exception as e:
        logger.exception("Agent endpoint failed")
        return {"status": "failed", "error": str(e)}

# ==============================
# NASA Tools Routes
# ==============================
@app.get("/kp-index")
async def get_kp_index(days_back: int = Query(1, description="Days back to fetch Kp index (1–7 recommended)")):
    """
    Fetch the most recent Kp index data (geomagnetic activity).
    """
    try:
        result = fetch_nasa_kp_index(days_back)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/nasa/flares")
def get_solar_flares(days_back: int = Query(7, ge=1, le=30)):
    return json.loads(fetch_nasa_solar_flares(days_back))

@app.get("/nasa/analysis")
def get_flare_analysis(days_back: int = Query(7, ge=1, le=30)):
    flares = fetch_nasa_solar_flares(days_back)
    return json.loads(analyze_flare_escalation(flares))

@app.get("/nasa/impact")
def predict_impact(flare_class: str = "M5.2", source_location: str = "N10W30"):
    return json.loads(predict_magnetosphere_impact(flare_class, source_location))

@app.get("/nasa/vulnerability")
def satellite_vulnerability(flare_class: str = "M5.2", kp_index: int = 5):
    return json.loads(calculate_satellite_vulnerability(flare_class, kp_index))

@app.get("/nasa/alert")
def operational_alert(risk_level: str = "HIGH", flare_class: str = "M5.2", impact_hours: int = 48):
    return json.loads(generate_operational_alert(risk_level, flare_class, impact_hours))

@app.get("/")
def root():
    return {"message": "🛰️ AstroPulse backend active (Gemini + NASA tools)"}
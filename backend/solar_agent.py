# filename: solar_agent.py
import os, sys, json
from typing import List, Dict, Any
from dotenv import load_dotenv
from loguru import logger
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.callbacks import StdOutCallbackHandler
from nasa_tools import (
    fetch_nasa_solar_flares,
    analyze_flare_escalation,
    predict_magnetosphere_impact,
    calculate_satellite_vulnerability,
    generate_operational_alert,
    fetch_nasa_kp_index,  # ✅ NEW TOOL
)


load_dotenv()
logger.remove()
logger.add(sys.stdout, level="INFO", format="<green>[{time:HH:mm:ss}]</green> {message}")
callback_handler = StdOutCallbackHandler()


class SolarAnalystAgent:
    _shared_memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    def __init__(self, model_name="gemini-2.5-flash", temperature=0.1, verbose=True):
        self.verbose = verbose
        logger.info("Initializing Solar Analyst Agent...")

        if not os.getenv("OPENAI_API_KEY"):
            os.environ["OPENAI_API_KEY"] = os.getenv("GEMINI_API_KEY", "")
        if not os.getenv("OPENAI_API_BASE"):
            os.environ["OPENAI_API_BASE"] = "https://generativelanguage.googleapis.com/v1beta/openai/"

        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_API_BASE")
        if not api_key:
            raise ValueError("Missing GEMINI_API_KEY in environment variables.")

        self.llm = ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=api_key,
            base_url=base_url,
        )

        self.tools = self._create_tools()
        self.memory = SolarAnalystAgent._shared_memory
        self.agent = self._create_agent()

        self.executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            memory=self.memory,  
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=15,
            return_intermediate_steps=True,
            callbacks=[callback_handler],
        )

        logger.success("Solar Analyst Agent ready.")

    def _create_tools(self) -> List[Tool]:
        return [
            Tool("FetchNASASolarFlares", fetch_nasa_solar_flares,
                 "Fetches recent solar flare data from NASA DONKI."),
            Tool("AnalyzeFlareEscalation", analyze_flare_escalation,
                 "Analyzes solar flare trends and risk levels."),
            Tool("PredictMagnetosphereImpact", predict_magnetosphere_impact,
                 "Predicts magnetosphere impact from a flare class and source."),
            Tool("FetchNASA_KpIndex", fetch_nasa_kp_index,  # ✅ NEW TOOL
             "Fetches the most recent Kp geomagnetic index from NASA DONKI GST endpoint."),
            Tool("CalculateSatelliteVulnerability", calculate_satellite_vulnerability,
                 "Assesses LEO/MEO/GEO satellite risks based on flare strength and Kp index."),
            Tool("GenerateOperationalAlert", generate_operational_alert,
                 "Generates actionable space-weather alert messages.")
        ]

    def _create_agent(self):
        tool_names = ", ".join([t.name for t in self.tools])
        tool_descs = "\n".join([f"{t.name}: {t.description}" for t in self.tools])

        template = (
            "You are AstroPulse Solar Analyst, an autonomous AI specializing in solar weather analysis.\n\n"
            "TOOLS AVAILABLE:\n{tools}\n\n"
            "User Question: {input}\n\n"
            "Follow this reasoning format:\n"
            "Thought: ...\nAction: ...\nAction Input: ...\nObservation: ...\n"
            "Repeat until done, then:\nFinal Answer: ...\n\n"
            "You can use these tool names: {tool_names}\n\n"
            
            # --- ✅ 100% SAFE ADDITION (START) ---
            "Note: When using the `PredictMagnetosphereImpact` tool, its output contains an `explanation` field. You MUST use this field in your final answer to clearly explain to the user *why* the Kp index might be high even if the impact probability is low.\n\n"
            # --- ✅ 100% SAFE ADDITION (END) ---

            # --- 🛡️ GUARDRAIL 1: UPDATED TO FIX THE LOOP (START) ---
            "CRITICAL: Before using any tools, first assess the user's intent. If the query is a simple greeting ('hi', 'hey'), sign-off ('bye'), or a **general factual question** ('what is...', 'who is...') that does not require real-time solar data analysis, **DO NOT use any tools**. Your *only* output must be in this exact format:\n"
            "Thought: The user is asking a simple question that I can answer directly.\n"
            "Final Answer: [Your direct answer here]\n\n"
            # --- 🛡️ GUARDRAIL 1: UPDATED TO FIX THE LOOP (END) ---

            # --- 🛡️ GUARDRAIL 2: AMBIGUITY (START) ---
            "CRITICAL: If the user's query is vague or could refer to multiple topics (e.g., 'is it bad?', 'what's the update?'), DO NOT run any tools. Your *only* output must be in this exact format:\n"
            "Thought: The user's query is ambiguous. I must ask for clarification.\n"
            "Final Answer: To give you the best analysis, could you specify if you're asking about satellite vulnerability, magnetosphere impact, or something else?\n\n"
            # --- 🛡️ GUARDRAIL 2: AMBIGUITY (END) ---

            "If the user asks 'who are you' or 'what can you do', answer the question directly. Do not re-state your persona 'I am AstroPulse...' if you've already introduced yourself. Your *only* output must be in this exact format:\n"
            "Thought: The user is asking about my identity or capabilities.\n"
            "Final Answer: [Your direct answer here, e.g., 'I am an AI...' or 'I can do the following: ...']\n\n"
            
            "Note: If a Kp index is needed for analysis, use FetchNASA_KpIndex before calling CalculateSatelliteVulnerability.\n\n"
            
            "Note: Use prior context from chat_history to maintain continuity between related queries.\n\n"
            
            "Current reasoning log(Do not repeat this in your answer):\n{agent_scratchpad}"
        )

        prompt = PromptTemplate(
            template=template,
            input_variables=["input", "agent_scratchpad", "tool_names"],
            partial_variables={"tools": tool_descs},
        )

        return create_react_agent(self.llm, self.tools, prompt)


    def query(self, question: str) -> Dict[str, Any]:
        """Run the agent on a user query and capture detailed reasoning steps."""
        import json

        logger.info(f"🤔 Query: {question}")
        try:
            # Run the agent chain and capture intermediate steps
            result = self.executor.invoke({"input": question}, callbacks=[callback_handler])

            steps = []
            for action, observation in result.get("intermediate_steps", []):
                # Normalize input (the LLM often passes JSON strings or dicts)
                raw_input = getattr(action, "tool_input", None)
                parsed_input = raw_input
                if isinstance(raw_input, str):
                    try:
                        parsed_input = json.loads(raw_input)
                    except Exception:
                        try:
                            if raw_input.strip().startswith("{") and raw_input.strip().endswith("}"):
                                parsed_input = eval(raw_input)
                        except Exception:
                            parsed_input = raw_input
                elif isinstance(raw_input, dict):
                    parsed_input = raw_input
                else:
                    parsed_input = str(raw_input)

                # Normalize observation (could be JSON string)
                parsed_observation = observation
                if isinstance(observation, str):
                    try:
                        parsed_observation = json.loads(observation)
                    except Exception:
                        parsed_observation = observation

                steps.append({
                    "thought": getattr(action, "log", "") or "",
                    "action": getattr(action, "tool", ""),
                    "input": parsed_input,
                    "observation": parsed_observation,
                })

            # Clean final output
            output = result.get("output", "")
            if "Invalid Format" in output:
                output = output.split("Invalid Format")[0].strip()

            logger.success("✅ Query completed successfully")
            return {
                "success": True,
                "output": output,
                "intermediate_steps": steps,
                "error": None
            }

        except Exception as e:
            logger.error(f"❌ Query failed: {str(e)}")
            return {
                "success": False,
                "output": "",
                "intermediate_steps": [],
                "error": str(e)
            }


    def autonomous_check(self) -> Dict[str, Any]:
        logger.info("Running autonomous space weather check...")
        prompt = (
            "Perform an autonomous 7-day solar activity analysis:\n"
            "1. Fetch NASA data\n2. Analyze escalation\n3. Predict impacts\n"
            "4. Assess satellite vulnerability\n5. Generate operational alert"
        )
        return self.query(prompt)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from typing import List, Dict, Any
import json
import logging
import re

app = FastAPI(title="SkillScope AI Processing Service")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ResumeText(BaseModel):
    text: str


class ExtractedResume(BaseModel):
    name: str
    skills: list[str]
    experience: str


class RoadmapRequest(BaseModel):
    role: str
    missingSkills: List[str]

class RoadmapResponse(BaseModel):
    plan: List[dict]


class AssessmentRequest(BaseModel):
    role: str
    skills: list[str]
    missingSkills: list[str]


OLLAMA_URL = "http://localhost:11434/api/generate"


def extract_json(text: str) -> str:
    """Extract the first valid JSON object from an arbitrary text block."""
    try:
        # Strategy 1: Find everything between the first '{' and the last '}'
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            # Try to validate that it is at least loadable
            json.loads(json_str)
            return json_str
    except Exception:
        pass
    
    # Fallback: if regex fail or json load fail, return original or minimal valid JSON
    return text


@app.post("/extract-skills", response_model=ExtractedResume)
async def extract_skills(resume_data: ResumeText):
    if not resume_data.text or not resume_data.text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")

    prompt = f"""Extract name, skills, and experience from this resume.
Return STRICT JSON ONLY, no conversational text.

{{
"name": "",
"skills": [],
"experience": ""
}}

Resume:
{resume_data.text}
"""

    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        logger.info("Sending request to Ollama for skill extraction...")
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
        response.raise_for_status()

        result_json = response.json()
        ai_text = result_json.get("response", "")
        clean_json = extract_json(ai_text)

        try:
            parsed_data = json.loads(clean_json)
            if not isinstance(parsed_data, dict):
                parsed_data = {}

            skills = parsed_data.get("skills", [])
            if not isinstance(skills, list):
                skills = [str(skills)]

            return ExtractedResume(
                name=str(parsed_data.get("name", "Unknown")),
                skills=skills,
                experience=str(parsed_data.get("experience", "Not found"))
            )
        except Exception as parse_err:
            logger.error(f"Failed to parse AI response into JSON. Raw: {ai_text}. Error: {str(parse_err)}")
            raise HTTPException(status_code=500, detail="AI generated invalid JSON")

    except requests.exceptions.RequestException as e:
        logger.error(f"Ollama connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Ollama connection error")


@app.post("/generate-assessment")
async def generate_assessment(req: AssessmentRequest):
    prompt = f"""Generate 3 technical interview questions and 1 coding problem.
Domain: {req.role}
User Skills: {', '.join(req.skills)}
Focus also on missing skills: {', '.join(req.missingSkills)}

Return ONLY JSON. Do not add explanation or text.
STRICT JSON FORMAT:
{{
"questions": [
  {{
    "question": "What is the primary role of a Load Balancer?",
    "options": ["Encapsulating data", "Distributing network traffic", "Storing backups", "Debugging code"]
  }}
],
"coding": {{
"title": "Reverse String",
"description": "Write a function to reverse a string in-place.",
"input_format": "A string 's'",
"output_format": "The reversed string",
"constraints": "s.length < 1000",
"sample_input": "'hello'",
"sample_output": "'olleh'",
"placeholder": "// Code here"
}}
}}
"""

    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        logger.info(f"Generating assessment for role: {req.role}")
        response = requests.post(OLLAMA_URL, json=payload, timeout=180)
        response.raise_for_status()

        result_json = response.json()
        ai_text = result_json.get("response", "")
        clean_json = extract_json(ai_text)

        try:
            return json.loads(clean_json)
        except Exception as parse_err:
            logger.error(f"Failed to parse AI assessment JSON. Raw: {ai_text}")
            # Fallback JSON as requested
            return {
                "questions": [
                    {
                        "question": "Basic technical evaluation question?",
                        "options": ["Option A", "Option B", "Option C", "Option D"]
                    }
                ],
                "coding": {
                    "title": "Problem Title",
                    "description": "Problem Description",
                    "input_format": "N/A",
                    "output_format": "N/A",
                    "constraints": "N/A",
                    "sample_input": "N/A",
                    "sample_output": "N/A",
                    "placeholder": "// Solution"
                }
            }

    except requests.exceptions.RequestException as e:
        logger.error(f"Ollama connection error: {str(e)}")
        raise HTTPException(status_code=503, detail="Ollama service unavailable")


@app.post("/generate-roadmap")
async def generate_roadmap(req: RoadmapRequest):
    prompt = f"""Generate a 7-day learning roadmap.
Role: {req.role}
Focus on missing skills: {', '.join(req.missingSkills)}

Return ONLY JSON. Do not add explanation or text.
STRICT JSON FORMAT:
{{
"plan": [
{{
"day": 1,
"topic": "Topic Name",
"tasks": ["Task 1", "Task 2"]
}}
]
}}
"""
    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        logger.info(f"Generating roadmap for role: {req.role}")
        response = requests.post(OLLAMA_URL, json=payload, timeout=180)
        response.raise_for_status()

        result_json = response.json()
        ai_text = result_json.get("response", "")
        clean_json = extract_json(ai_text)

        try:
            return json.loads(clean_json)
        except Exception as parse_err:
            logger.error(f"Failed to parse AI roadmap JSON. Raw: {ai_text}")
            # Fallback Roadmap
            return {
                "plan": [
                    {
                        "day": 1,
                        "topic": "Fundamentals of " + req.role,
                        "tasks": ["Review core concepts", "Research documentation"]
                    }
                ]
            }

    except requests.exceptions.RequestException as e:
        logger.error(f"Ollama connection error: {str(e)}")
        raise HTTPException(status_code=503, detail="Ollama service unavailable")

import os
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

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
logger.info("Using Ollama endpoint: %s", OLLAMA_URL)


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


def get_mock_resume_data():
    return {
        "name": "Alex Smith",
        "skills": ["Java", "Python", "SQL", "Spring Boot", "React", "Docker", "AWS"],
        "experience": "5+ years of full-stack development experience with a focus on cloud-native applications."
    }

def get_mock_assessment(role):
    return {
        "questions": [
            {
                "question": f"How do you ensure scalability in a {role} environment?",
                "options": ["Vertical scaling only", "Implementing load balancing and microservices", "Using only local storage", "Reducing number of users"]
            },
            {
                "question": f"Which of the following is a best practice for {role}?",
                "options": ["Hardcoding secrets", "Writing unit tests", "Ignoring logs", "Manual deployments only"]
            },
            {
                "question": f"What is the primary benefit of using containers in {role}?",
                "options": ["Reducing hardware cost", "Consistent environments across dev/prod", "Making code run slower", "Increasing dependency conflicts"]
            }
        ],
        "coding": {
            "title": "Two Sum Problem",
            "description": f"Targeting {role} fundamentals: Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
            "input_format": "List[int], int target",
            "output_format": "List[int]",
            "constraints": "n^2 complexity allowed for now",
            "sample_input": "[2, 7, 11, 15], 9",
            "sample_output": "[0, 1]",
            "placeholder": "def two_sum(nums, target):\n    # Your code here\n    pass"
        }
    }

def get_mock_roadmap(role, skills):
    return {
        "plan": [
            {"day": 1, "topic": f"Mastering {role} Core", "tasks": ["Setup environment", "Review basic syntax"]},
            {"day": 2, "topic": "Advanced Data Structures", "tasks": ["Implement trees", "O(n) optimizations"]},
            {"day": 3, "topic": f"{skills[0] if skills else 'System'} Deep Dive", "tasks": ["Concurrency models", "Memory management"]},
            {"day": 4, "topic": "API Design & Security", "tasks": ["REST conventions", "JWT implementation"]},
            {"day": 5, "topic": "Cloud & DevOps", "tasks": ["Dockerize app", "CI/CD pipelines"]},
            {"day": 6, "topic": "Real-world Project", "tasks": ["Build a prototype", "Fix bug backlog"]},
            {"day": 7, "topic": "Final Review", "tasks": ["Performance tuning", "Prepare for interview"]}
        ]
    }


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
        logger.info("Sending request to Ollama for skill extraction at %s", OLLAMA_URL)
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
        response.raise_for_status()

        result_json = response.json()
        ai_text = result_json.get("response", "")
        clean_json = extract_json(ai_text)

        parsed_data = json.loads(clean_json)
        return ExtractedResume(
            name=str(parsed_data.get("name", "Unknown")),
            skills=parsed_data.get("skills", []),
            experience=str(parsed_data.get("experience", "Not found"))
        )

    except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
        logger.warning("Ollama unreachable or returned invalid JSON. Falling back to Mock Mode. Error: %s", str(e))
        mock_data = get_mock_resume_data()
        return ExtractedResume(**mock_data)


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
    "question": "question text",
    "options": ["opt1", "opt2", "opt3", "opt4"]
  }}
],
"coding": {{
"title": "Problem Title",
"description": "...",
...
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
        logger.info("Generating assessment for role: %s using %s", req.role, OLLAMA_URL)
        response = requests.post(OLLAMA_URL, json=payload, timeout=180)
        response.raise_for_status()
        return response.json().get("response", {})

    except Exception as e:
        logger.warning("AI Assessment generation failed. Falling back to Mock Mode. Error: %s", str(e))
        return get_mock_assessment(req.role)


@app.post("/generate-roadmap")
async def generate_roadmap(req: RoadmapRequest):
    prompt = f"""Generate a 7-day learning roadmap for {req.role}."""
    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        logger.info("Generating roadmap for role: %s using %s", req.role, OLLAMA_URL)
        response = requests.post(OLLAMA_URL, json=payload, timeout=180)
        response.raise_for_status()
        return response.json().get("response", {})

    except Exception as e:
        logger.warning("AI Roadmap generation failed. Falling back to Mock Mode. Error: %s", str(e))
        return get_mock_roadmap(req.role, req.missingSkills)


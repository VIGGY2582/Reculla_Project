import requests
import json

def test_assessment():
    url = "http://localhost:8000/generate-assessment"
    data = {
        "role": "Java Developer",
        "skills": ["Java", "Spring Boot"],
        "missingSkills": ["Docker", "Kubernetes"]
    }
    print(f"Testing {url}...")
    try:
        response = requests.post(url, json=data, timeout=120)
        print(f"Status: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_assessment()

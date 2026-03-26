package com.skillscope.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillscope.dto.AnalysisResponse;
import com.skillscope.entity.Assessment;
import com.skillscope.entity.User;
import com.skillscope.repository.AssessmentRepository;
import com.skillscope.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import org.springframework.http.ResponseEntity;
import com.skillscope.dto.AssessmentResponseDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.skillscope.entity.AssessmentResult;
import com.skillscope.repository.AssessmentResultRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssessmentServiceImpl implements AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;
    private final SkillAnalysisService skillAnalysisService;
    private final AssessmentResultRepository assessmentResultRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void submitAssessment(UUID userId, Map<String, Object> answers) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the latest assessment for this user
        Assessment assessment = assessmentRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new RuntimeException("No assessment found for user"));

        try {
            AssessmentResult result = AssessmentResult.builder()
                    .user(user)
                    .assessment(assessment)
                    .score(80) // Dummy score for now
                    .answers(objectMapper.writeValueAsString(answers))
                    .build();

            assessmentResultRepository.save(result);
            log.info("Assessment result saved for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to save assessment result", e);
            throw new RuntimeException("Failed to submit assessment: " + e.getMessage());
        }
    }

    @Override
    public AssessmentResponseDTO generateAssessment(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AnalysisResponse analysis = skillAnalysisService.analyzeUserSkills(userId);

        try {
            log.info("Generating assessment for user: {} with role: {}", userId, analysis.getBestRole());
            Map<String, Object> responseBody = callAiAssessmentService(analysis);
            
            log.info("AI Response Body: {}", responseBody);
            
            // Extract JSON safely as requested
            List<Object> questions = (List<Object>) responseBody.get("questions");
            Map<String, Object> coding = (Map<String, Object>) responseBody.get("coding");

            Assessment assessment = Assessment.builder()
                    .user(user)
                    .role(analysis.getBestRole())
                    .questions(objectMapper.writeValueAsString(questions))
                    .codingProblem(objectMapper.writeValueAsString(coding))
                    .build();

            Assessment savedAssessment = assessmentRepository.save(assessment);

            return AssessmentResponseDTO.builder()
                    .role(savedAssessment.getRole())
                    .questions(objectMapper.readValue(savedAssessment.getQuestions(), new TypeReference<List<Object>>() {}))
                    .coding(objectMapper.readValue(savedAssessment.getCodingProblem(), new TypeReference<Map<String, Object>>() {}))
                    .build();
        } catch (Exception e) {
            e.printStackTrace(); // as requested
            log.error("AI Generation failed, using fallback assessment. Error: {}", e.getMessage());
            
            // Fallback response (IMPORTANT)
            Map<String, Object> fallback = getFallbackResponse();
            try {
                Assessment assessment = Assessment.builder()
                        .user(user)
                        .role(analysis.getBestRole())
                        .questions(objectMapper.writeValueAsString(fallback.get("questions")))
                        .codingProblem(objectMapper.writeValueAsString(fallback.get("coding")))
                        .build();

                Assessment savedAssessment = assessmentRepository.save(assessment);
                
                return AssessmentResponseDTO.builder()
                        .role(savedAssessment.getRole())
                        .questions(objectMapper.readValue(savedAssessment.getQuestions(), new TypeReference<List<Object>>() {}))
                        .coding(objectMapper.readValue(savedAssessment.getCodingProblem(), new TypeReference<Map<String, Object>>() {}))
                        .build();
            } catch (Exception fatal) {
                throw new RuntimeException("Fatal error during fallback assessment generation");
            }
        }
    }

    private Map<String, Object> getFallbackResponse() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("questions", Arrays.asList("Basic backend question"));
        
        Map<String, String> coding = new HashMap<>();
        coding.put("title", "Practice Problem");
        coding.put("description", "Solve a simple logic problem related to your domain.");
        coding.put("input_format", "N/A");
        coding.put("output_format", "N/A");
        coding.put("constraints", "N/A");
        coding.put("sample_input", "N/A");
        coding.put("sample_output", "N/A");
        
        fallback.put("coding", coding);
        return fallback;
    }

    private Map<String, Object> callAiAssessmentService(AnalysisResponse analysis) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://localhost:8000/generate-assessment";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("role", analysis.getBestRole());
        requestBody.put("skills", analysis.getMatchedSkills());
        requestBody.put("missingSkills", analysis.getMissingSkills());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Calling AI Service at: {}", url);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (Exception e) {
            log.error("Failed to connect to AI Service for assessment", e);
            throw new RuntimeException("AI assessment generation failed. Error: " + e.getMessage());
        }
    }
}

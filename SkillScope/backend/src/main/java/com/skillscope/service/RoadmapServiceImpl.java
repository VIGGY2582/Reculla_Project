package com.skillscope.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillscope.dto.AnalysisResponse;
import com.skillscope.entity.Roadmap;
import com.skillscope.entity.User;
import com.skillscope.repository.RoadmapRepository;
import com.skillscope.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.skillscope.dto.RoadmapResponseDTO;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapServiceImpl implements RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final UserRepository userRepository;
    private final SkillAnalysisService skillAnalysisService;
    private final ObjectMapper objectMapper;

    @Override
    public RoadmapResponseDTO generateRoadmap(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AnalysisResponse analysis = skillAnalysisService.analyzeUserSkills(userId);

        try {
            log.info("Generating roadmap for user: {} with role: {}", userId, analysis.getBestRole());
            Map<String, Object> responseBody = callAiRoadmapService(analysis);
            
            System.out.println("AI Roadmap Response: " + responseBody);

            if (responseBody == null) {
                throw new RuntimeException("AI response is null");
            }

            Roadmap roadmap = Roadmap.builder()
                    .user(user)
                    .role(analysis.getBestRole())
                    .roadmapContent(objectMapper.writeValueAsString(responseBody.get("plan")))
                    .build();

            return toResponse(roadmapRepository.save(roadmap));
        } catch (Exception e) {
            e.printStackTrace();
            log.error("AI Roadmap Generation failed. Error: {}", e.getMessage());
            throw new RuntimeException("Roadmap generation failed: " + e.getMessage());
        }
    }

    @Override
    public RoadmapResponseDTO getLatestRoadmap(UUID userId) {
        Roadmap roadmap = roadmapRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new RuntimeException("Roadmap not found"));
        return toResponse(roadmap);
    }

    private RoadmapResponseDTO toResponse(Roadmap roadmap) {
        return RoadmapResponseDTO.builder()
                .role(roadmap.getRole())
                .roadmapContent(roadmap.getRoadmapContent())
                .build();
    }

    private Map<String, Object> callAiRoadmapService(AnalysisResponse analysis) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://localhost:8000/generate-roadmap";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("role", analysis.getBestRole());
        requestBody.put("missingSkills", analysis.getMissingSkills());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Calling AI Roadmap Service at: {}", url);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (Exception e) {
            log.error("Failed to connect to AI Service for roadmap", e);
            throw new RuntimeException("AI roadmap generation failed. Error: " + e.getMessage());
        }
    }
}

package com.skillscope.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillscope.dto.ResumeResponse;
import com.skillscope.entity.Progress;
import com.skillscope.entity.Resume;
import com.skillscope.entity.User;
import com.skillscope.repository.ResumeRepository;
import com.skillscope.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ProgressService progressService;
    
    private final String uploadDir = "uploads/resumes/";

    @Override
    public ResumeResponse processResume(MultipartFile file, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || (!originalFilename.endsWith(".pdf") && !originalFilename.endsWith(".docx"))) {
            throw new RuntimeException("Only PDF and DOCX files are supported");
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String savedFileName = UUID.randomUUID() + "_" + originalFilename;
            Path filePath = uploadPath.resolve(savedFileName);
            Files.copy(file.getInputStream(), filePath);

            Tika tika = new Tika();
            String extractedText = tika.parseToString(filePath.toFile());

            ResumeResponse aiResponse = callAiService(extractedText);

            ObjectMapper mapper = new ObjectMapper();
            String skillsJson = mapper.writeValueAsString(aiResponse.getSkills());

            Resume resume = Resume.builder()
                    .user(user)
                    .filePath(filePath.toString())
                    .extractedName(aiResponse.getName())
                    .extractedSkills(skillsJson)
                    .experience(aiResponse.getExperience())
                    .build();

            resumeRepository.save(resume);

            // Automatically track extracted skills as COMPLETED
            for (String skill : aiResponse.getSkills()) {
                progressService.updateProgress(user.getId(), skill.trim(), Progress.ProgressStatus.COMPLETED);
            }

            return aiResponse;

        } catch (Exception e) {
            log.error("Error processing resume", e);
            throw new RuntimeException("Failed to process resume: " + e.getMessage());
        }
    }

    private ResumeResponse callAiService(String text) {
        RestTemplate restTemplate = new RestTemplate();
        String aiServiceUrl = "http://localhost:8000/extract-skills";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = new HashMap<>();
        body.put("text", text);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        try {
            return restTemplate.postForObject(aiServiceUrl, request, ResumeResponse.class);
        } catch (Exception e) {
            log.error("Failed to connect to AI Service", e);
            throw new RuntimeException("AI processing failed. Ensure ai-service is running. Error details: " + e.getMessage());
        }
    }
}

package com.skillscope.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillscope.dto.AnalysisResponse;
import com.skillscope.entity.JobRole;
import com.skillscope.entity.JobRoleSkill;
import com.skillscope.entity.Resume;
import com.skillscope.entity.Progress;
import com.skillscope.entity.User;
import com.skillscope.repository.JobRoleRepository;
import com.skillscope.repository.ResumeRepository;
import com.skillscope.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillAnalysisServiceImpl implements SkillAnalysisService {

    private final ResumeRepository resumeRepository;
    private final JobRoleRepository jobRoleRepository;
    private final UserRepository userRepository;
    private final ProgressService progressService;
    private final ObjectMapper objectMapper;

    @Override
    public AnalysisResponse analyzeUserSkills(UUID userId) {
        List<Resume> resumes = resumeRepository.findByUserId(userId);
        if (resumes.isEmpty()) {
            throw new RuntimeException("No resume found for user. Please upload a resume first.");
        }

        // Get latest resume
        log.info("Analyzing skills for user: {}", userId);
        Resume resume = resumes.get(resumes.size() - 1);
        log.info("Found resume: {}", resume.getId());
        
        Set<String> userSkills = parseSkills(resume.getExtractedSkills());
        log.info("User skills: {}", userSkills);
        List<JobRole> allRoles = jobRoleRepository.findAll();
        log.info("Comparing against {} job roles", allRoles.size());

        AnalysisResponse bestMatch = null;
        double maxPercentage = -1;

        for (JobRole role : allRoles) {
            Set<String> roleSkills = role.getSkills().stream()
                    .map(s -> s.getSkillName().toLowerCase().trim())
                    .collect(Collectors.toSet());

            if (roleSkills.isEmpty()) continue;

            Set<String> matched = new HashSet<>(userSkills);
            matched.retainAll(roleSkills);

            Set<String> missing = new HashSet<>(roleSkills);
            missing.removeAll(userSkills);

            double percentage = (double) matched.size() / roleSkills.size() * 100;

            if (percentage > maxPercentage) {
                maxPercentage = percentage;
                bestMatch = AnalysisResponse.builder()
                        .bestRole(role.getName())
                        .matchPercentage(Math.round(percentage * 100.0) / 100.0)
                        .matchedSkills(new ArrayList<>(matched))
                        .missingSkills(new ArrayList<>(missing))
                        .recommendation(generateRecommendation(role.getName(), percentage, missing))
                        .build();
            }
        }

        if (bestMatch == null) {
            throw new RuntimeException("No job roles configured in the system.");
        }

        // Automate Progress Tracking
        updateUserProgress(userId, bestMatch);

        // Persistent Target Role
        User user = userRepository.findById(userId).orElseThrow();
        user.setTargetRole(bestMatch.getBestRole());
        userRepository.save(user);

        return bestMatch;
    }

    @Override
    public AnalysisResponse getCurrentAnalysis(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String targetRoleName = user.getTargetRole();
        if (targetRoleName == null || targetRoleName.isBlank()) {
            log.warn("No target role set for user: {}", userId);
            return null;
        }

        // Case-insensitive lookup and trimming for robustness
        JobRole role = jobRoleRepository.findAll().stream()
                .filter(r -> r.getName().equalsIgnoreCase(targetRoleName.trim()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Target role not found: " + targetRoleName));

        List<Progress> progressList = progressService.getProgress(userId);
        Set<String> completedSkills = progressList.stream()
                .filter(p -> p.getStatus() == Progress.ProgressStatus.COMPLETED)
                .map(p -> p.getSkill().toLowerCase().trim())
                .collect(Collectors.toSet());

        Set<String> roleSkills = role.getSkills().stream()
                .map(s -> s.getSkillName().toLowerCase().trim())
                .collect(Collectors.toSet());

        Set<String> matched = new HashSet<>(roleSkills);
        matched.retainAll(completedSkills);

        Set<String> missing = new HashSet<>(roleSkills);
        missing.removeAll(completedSkills);

        double percentage = roleSkills.isEmpty() ? 0 : (double) matched.size() / roleSkills.size() * 100;

        return AnalysisResponse.builder()
                .bestRole(role.getName())
                .matchPercentage(Math.round(percentage * 100.0) / 100.0)
                .matchedSkills(new ArrayList<>(matched))
                .missingSkills(new ArrayList<>(missing))
                .recommendation(generateRecommendation(role.getName(), percentage, missing))
                .build();
    }

    private void updateUserProgress(UUID userId, AnalysisResponse analysis) {
        log.info("Automating progress tracking for user: {}", userId);
        
        // Mark matched skills as COMPLETED
        for (String skill : analysis.getMatchedSkills()) {
            progressService.updateProgress(userId, skill, Progress.ProgressStatus.COMPLETED);
        }
        
        // Mark missing skills as NOT_STARTED
        for (String skill : analysis.getMissingSkills()) {
            progressService.updateProgress(userId, skill, Progress.ProgressStatus.NOT_STARTED);
        }
    }

    private Set<String> parseSkills(String skillsJson) {
        try {
            List<String> skills = objectMapper.readValue(skillsJson, new TypeReference<List<String>>() {});
            return skills.stream()
                    .map(s -> s.toLowerCase().trim())
                    .collect(Collectors.toSet());
        } catch (Exception e) {
            return Collections.emptySet();
        }
    }

    private String generateRecommendation(String role, double percentage, Set<String> missing) {
        if (percentage >= 80) {
            return "Excellent match for " + role + "! You have most of the required skills.";
        } else if (percentage >= 50) {
            return "Good match. To become a strong candidate for " + role + ", focus on learning: " + String.join(", ", missing);
        } else {
            return "You have a foundation, but " + role + " requires significant upskilling in: " + String.join(", ", missing);
        }
    }
}

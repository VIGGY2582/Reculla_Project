package com.skillscope.controller;

import com.skillscope.dto.AnalysisResponse;
import com.skillscope.security.UserDetailsImpl;
import com.skillscope.service.SkillAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SkillAnalysisController {

    private final SkillAnalysisService skillAnalysisService;

    @GetMapping("/analysis/mine")
    public ResponseEntity<AnalysisResponse> getMyAnalysis(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(skillAnalysisService.analyzeUserSkills(userDetails.getId()));
    }

    @GetMapping("/skills/analyze/{userId}")
    public ResponseEntity<AnalysisResponse> analyzeSpecificUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(skillAnalysisService.analyzeUserSkills(userId));
    }

    @GetMapping("/skills/current/{userId}")
    public ResponseEntity<AnalysisResponse> getTargetSkillAnalysis(@PathVariable UUID userId) {
        AnalysisResponse current = skillAnalysisService.getCurrentAnalysis(userId);
        if (current == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(current);
    }
}

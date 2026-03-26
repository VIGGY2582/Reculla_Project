package com.skillscope.controller;

import com.skillscope.dto.AssessmentResponseDTO;
import com.skillscope.security.UserDetailsImpl;
import com.skillscope.service.AssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping("/generate")
    public ResponseEntity<AssessmentResponseDTO> generateAssessment(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(assessmentService.generateAssessment(userDetails.getId()));
    }

    @PostMapping("/generate/{userId}")
    public ResponseEntity<AssessmentResponseDTO> generateAssessmentForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(assessmentService.generateAssessment(userId));
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitAssessment(Authentication authentication, @RequestBody Map<String, Object> answers) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        assessmentService.submitAssessment(userDetails.getId(), answers);
        return ResponseEntity.ok("Assessment submitted successfully");
    }
}

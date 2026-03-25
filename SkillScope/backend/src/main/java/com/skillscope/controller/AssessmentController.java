package com.skillscope.controller;

import com.skillscope.entity.Assessment;
import com.skillscope.security.UserDetailsImpl;
import com.skillscope.service.AssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping("/generate")
    public ResponseEntity<Assessment> generateAssessment(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(assessmentService.generateAssessment(userDetails.getId()));
    }

    @PostMapping("/generate/{userId}")
    public ResponseEntity<Assessment> generateAssessmentForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(assessmentService.generateAssessment(userId));
    }
}

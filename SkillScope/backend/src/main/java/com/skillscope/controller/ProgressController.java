package com.skillscope.controller;

import com.skillscope.dto.ProgressRequest;
import com.skillscope.entity.Progress;
import com.skillscope.security.UserDetailsImpl;
import com.skillscope.service.ProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping("/update")
    public ResponseEntity<Progress> updateProgress(Authentication authentication, @RequestBody ProgressRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        log.info("Updating progress for user: {}, skill: {}, status: {}", userDetails.getId(), request.getSkill(), request.getStatus());
        
        Progress.ProgressStatus status;
        try {
            status = Progress.ProgressStatus.valueOf(request.getStatus().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid status: " + request.getStatus());
        }

        return ResponseEntity.ok(progressService.updateProgress(userDetails.getId(), request.getSkill(), status));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Progress>> getMyProgress(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(progressService.getProgress(userDetails.getId()));
    }
}

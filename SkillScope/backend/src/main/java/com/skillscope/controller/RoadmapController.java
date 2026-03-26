package com.skillscope.controller;

import com.skillscope.dto.RoadmapResponseDTO;
import com.skillscope.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    @PostMapping("/generate/{userId}")
    public ResponseEntity<RoadmapResponseDTO> generateRoadmap(@PathVariable UUID userId) {
        return ResponseEntity.ok(roadmapService.generateRoadmap(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<RoadmapResponseDTO> getRoadmap(@PathVariable UUID userId) {
        return ResponseEntity.ok(roadmapService.getLatestRoadmap(userId));
    }
}

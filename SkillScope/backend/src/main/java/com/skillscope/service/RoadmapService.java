package com.skillscope.service;

import com.skillscope.dto.RoadmapResponseDTO;
import java.util.UUID;

public interface RoadmapService {
    RoadmapResponseDTO generateRoadmap(UUID userId);
    RoadmapResponseDTO getLatestRoadmap(UUID userId);
}

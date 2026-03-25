package com.skillscope.service;

import com.skillscope.dto.AnalysisResponse;
import java.util.UUID;

public interface SkillAnalysisService {
    AnalysisResponse analyzeUserSkills(UUID userId);
}

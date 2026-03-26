package com.skillscope.service;

import com.skillscope.dto.AssessmentResponseDTO;
import java.util.Map;
import java.util.UUID;

public interface AssessmentService {
    AssessmentResponseDTO generateAssessment(UUID userId);
    void submitAssessment(UUID userId, Map<String, Object> answers);
}

package com.skillscope.service;

import com.skillscope.entity.Assessment;
import java.util.UUID;

public interface AssessmentService {
    Assessment generateAssessment(UUID userId);
}

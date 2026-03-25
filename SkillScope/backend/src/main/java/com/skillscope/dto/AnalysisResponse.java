package com.skillscope.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalysisResponse {
    private String bestRole;
    private double matchPercentage;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private String recommendation;
}

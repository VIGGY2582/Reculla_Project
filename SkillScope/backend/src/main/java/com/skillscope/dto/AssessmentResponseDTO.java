package com.skillscope.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResponseDTO {
    private String role;
    private List<Object> questions;
    private Map<String, Object> coding;
}

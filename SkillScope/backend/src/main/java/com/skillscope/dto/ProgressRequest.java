package com.skillscope.dto;

import com.skillscope.entity.Progress;
import lombok.Data;

@Data
public class ProgressRequest {
    private String skill;
    private Progress.ProgressStatus status;
}

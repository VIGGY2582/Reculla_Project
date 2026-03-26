package com.skillscope.service;

import com.skillscope.entity.Progress;
import java.util.List;
import java.util.UUID;

public interface ProgressService {
    Progress updateProgress(UUID userId, String skill, Progress.ProgressStatus status);
    List<Progress> getProgress(UUID userId);
}

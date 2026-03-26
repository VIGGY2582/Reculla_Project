package com.skillscope.service;

import com.skillscope.entity.Progress;
import com.skillscope.entity.User;
import com.skillscope.repository.ProgressRepository;
import com.skillscope.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;

    @Override
    public Progress updateProgress(UUID userId, String skill, Progress.ProgressStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Progress progress = progressRepository.findByUserIdAndSkill(userId, skill)
                .orElse(Progress.builder()
                        .user(user)
                        .skill(skill)
                        .build());
        
        progress.setStatus(status);
        return progressRepository.save(progress);
    }

    @Override
    public List<Progress> getProgress(UUID userId) {
        return progressRepository.findByUserId(userId);
    }
}

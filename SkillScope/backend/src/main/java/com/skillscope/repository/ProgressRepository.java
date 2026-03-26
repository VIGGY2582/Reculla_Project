package com.skillscope.repository;

import com.skillscope.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgressRepository extends JpaRepository<Progress, UUID> {
    List<Progress> findByUserId(UUID userId);
    Optional<Progress> findByUserIdAndSkill(UUID userId, String skill);
}

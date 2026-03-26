package com.skillscope.repository;

import com.skillscope.entity.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RoadmapRepository extends JpaRepository<Roadmap, UUID> {
    Optional<Roadmap> findTopByUserIdOrderByCreatedAtDesc(UUID userId);
}

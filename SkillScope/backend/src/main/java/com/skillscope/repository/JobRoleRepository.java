package com.skillscope.repository;

import com.skillscope.entity.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.util.UUID;

@Repository
public interface JobRoleRepository extends JpaRepository<JobRole, UUID> {
    boolean existsByName(String name);
    Optional<JobRole> findByName(String name);
}

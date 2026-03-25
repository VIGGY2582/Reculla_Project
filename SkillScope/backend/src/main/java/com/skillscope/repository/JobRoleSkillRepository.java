package com.skillscope.repository;

import com.skillscope.entity.JobRoleSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface JobRoleSkillRepository extends JpaRepository<JobRoleSkill, UUID> {
}

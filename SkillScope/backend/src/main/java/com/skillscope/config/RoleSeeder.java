package com.skillscope.config;

import com.skillscope.entity.JobRole;
import com.skillscope.entity.JobRoleSkill;
import com.skillscope.entity.Role;
import com.skillscope.entity.RoleType;
import com.skillscope.repository.JobRoleRepository;
import com.skillscope.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RoleSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final JobRoleRepository jobRoleRepository;

    @Override
    public void run(String... args) {
        seedUserRoles();
        seedJobRoles();
    }

    private void seedUserRoles() {
        for (RoleType type : RoleType.values()) {
            if (roleRepository.findByName(type).isEmpty()) {
                Role role = new Role();
                role.setName(type);
                roleRepository.save(role);
            }
        }
    }

    private void seedJobRoles() {
        if (jobRoleRepository.count() == 0) {
            saveJobRole("Backend Developer", "Focused on server-side logic and databases.",
                    "Java", "Spring Boot", "SQL", "REST API", "Microservices");

            saveJobRole("Frontend Developer", "Building modern user interfaces.",
                    "HTML", "CSS", "JavaScript", "React", "TypeScript");

            saveJobRole("Data Scientist", "Analyzing data and building models.",
                    "Python", "Pandas", "Machine Learning", "Statistics", "SQL");
        }
    }

    private void saveJobRole(String name, String desc, String... skills) {
        JobRole role = JobRole.builder()
                .name(name)
                .description(desc)
                .build();

        Set<JobRoleSkill> skillSet = Arrays.stream(skills)
                .map(s -> JobRoleSkill.builder().jobRole(role).skillName(s).build())
                .collect(Collectors.toSet());

        role.setSkills(skillSet);
        jobRoleRepository.save(role);
    }
}

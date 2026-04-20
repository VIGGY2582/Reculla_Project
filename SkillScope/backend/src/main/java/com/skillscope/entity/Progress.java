package com.skillscope.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String skill;

    @Enumerated(EnumType.STRING)
    private ProgressStatus status;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ProgressStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED
    }
}

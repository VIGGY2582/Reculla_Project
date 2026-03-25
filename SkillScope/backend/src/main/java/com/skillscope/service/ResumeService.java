package com.skillscope.service;

import com.skillscope.dto.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ResumeService {
    ResumeResponse processResume(MultipartFile file, String email);
}

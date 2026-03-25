package com.skillscope.service;

import com.skillscope.dto.AuthResponse;
import com.skillscope.dto.LoginRequest;
import com.skillscope.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}

package com.workforcehub.service;

import com.workforcehub.dto.AuthRequest;
import com.workforcehub.dto.AuthResponse;
import com.workforcehub.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse register(RegisterRequest request);
}

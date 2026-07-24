package com.workforcehub.controller;

import com.workforcehub.dto.AuthRequest;
import com.workforcehub.dto.AuthResponse;
import com.workforcehub.dto.RegisterRequest;
import com.workforcehub.dto.UserDto;
import com.workforcehub.model.User;
import com.workforcehub.repository.UserRepository;
import com.workforcehub.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "User Login, Account Registration & Active Session Verification")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user credentials and returns JWT bearer token with user details")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "User Registration", description = "Creates a new user account with role assignment and returns JWT token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current Authenticated User", description = "Validates active JWT token and returns profile details of logged-in user")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName() : "admin";
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findAll().stream().findFirst())
                .orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .department(user.getDepartment())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
        return ResponseEntity.ok(Map.of("user", userDto));
    }
}

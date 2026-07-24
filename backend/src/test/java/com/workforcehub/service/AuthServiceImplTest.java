package com.workforcehub.service;

import com.workforcehub.dto.AuthRequest;
import com.workforcehub.dto.AuthResponse;
import com.workforcehub.dto.RegisterRequest;
import com.workforcehub.exception.BadRequestException;
import com.workforcehub.model.Role;
import com.workforcehub.model.User;
import com.workforcehub.repository.AuditLogRepository;
import com.workforcehub.repository.UserRepository;
import com.workforcehub.security.JwtTokenProvider;
import com.workforcehub.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("admin")
                .email("admin@workforcehub.com")
                .password("encoded_pass")
                .firstName("System")
                .lastName("Admin")
                .role(Role.ROLE_ADMIN)
                .department("IT")
                .build();
    }

    @Test
    void login_Success() {
        AuthRequest request = new AuthRequest("admin", "password123");
        Authentication authentication = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mock_jwt_token");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("admin", response.getUser().getUsername());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void register_ExistingUsername_ThrowsBadRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("admin");
        request.setEmail("new@workforcehub.com");
        request.setPassword("password123");
        request.setFirstName("New");
        request.setLastName("User");

        when(userRepository.existsByUsername("admin")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }
}

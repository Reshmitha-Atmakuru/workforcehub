package com.workforcehub.service.impl;

import com.workforcehub.dto.*;
import com.workforcehub.exception.BadRequestException;
import com.workforcehub.model.*;
import com.workforcehub.repository.AuditLogRepository;
import com.workforcehub.repository.EmployeeRepository;
import com.workforcehub.repository.UserRepository;
import com.workforcehub.security.JwtTokenProvider;
import com.workforcehub.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.workforcehub.service.EmailService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Override
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new BadRequestException("User not found"));

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("LOGIN")
                .entityType("USER #" + user.getUsername())
                .entityId(String.valueOf(user.getId()))
                .performedBy(user.getUsername())
                .details("User " + user.getUsername() + " logged in successfully.")
                .build());

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();

        return AuthResponse.builder()
                .token(jwt)
                .refreshToken(jwt)
                .user(userDto)
                .message("Login successful")
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email Address is already in use!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .department(request.getDepartment() != null ? request.getDepartment() : "General")
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE)
                .build();

        userRepository.save(user);

        long count = employeeRepository.count() + 1001;
        String empCode = "EMP-" + count;

        Employee employee = Employee.builder()
                .code(empCode)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone("+91 98765 00000")
                .department(user.getDepartment())
                .jobTitle(user.getRole() == Role.ROLE_ADMIN ? "System Administrator" : "Associate Engineer")
                .accountRole(user.getRole())
                .salary(new BigDecimal("1200000"))
                .joinDate(LocalDate.now())
                .status("ACTIVE")
                .officeLocation("Bengaluru, Karnataka")
                .user(user)
                .build();

        employeeRepository.save(employee);

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("REGISTER")
                .entityType("USER #" + user.getUsername())
                .entityId(String.valueOf(user.getId()))
                .performedBy(user.getUsername())
                .details("New user registration for " + user.getFirstName() + " " + user.getLastName())
                .build());

        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName(), user.getRole().name());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();

        return AuthResponse.builder()
                .token(jwt)
                .refreshToken(jwt)
                .user(userDto)
                .message("User registered successfully")
                .build();
    }
}

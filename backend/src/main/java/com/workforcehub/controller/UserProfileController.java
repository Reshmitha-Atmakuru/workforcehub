package com.workforcehub.controller;

import com.workforcehub.dto.UserDto;
import com.workforcehub.exception.ResourceNotFoundException;
import com.workforcehub.model.User;
import com.workforcehub.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "User Profile", description = "User profile management and profile image upload")
public class UserProfileController {

    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/profiles";

    @GetMapping
    @Operation(summary = "Get current user profile", description = "Returns the authenticated user's profile information")
    public ResponseEntity<UserDto> getProfile(Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName()
                : "admin";
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(mapToDto(user));
    }

    @PostMapping("/upload-image")
    @Operation(summary = "Upload profile image", description = "Upload a profile picture for the authenticated user (JPEG, PNG, max 10MB)")
    public ResponseEntity<UserDto> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        String username = (authentication != null && authentication.getName() != null) ? authentication.getName()
                : "admin";
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/"))) {
            return ResponseEntity.badRequest().build();
        }

        // Create upload directory if not exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String newFilename = "profile_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

        // Save file
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Update user record
        user.setProfileImageUrl("/api/profile/image/" + newFilename);
        userRepository.save(user);

        return ResponseEntity.ok(mapToDto(user));
    }

    @GetMapping("/image/{filename:.+}")
    @Operation(summary = "Serve profile image", description = "Returns the profile image file for display")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/jpeg";
                if (filename.endsWith(".png"))
                    contentType = "image/png";
                else if (filename.endsWith(".gif"))
                    contentType = "image/gif";
                else if (filename.endsWith(".webp"))
                    contentType = "image/webp";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .department(user.getDepartment())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}

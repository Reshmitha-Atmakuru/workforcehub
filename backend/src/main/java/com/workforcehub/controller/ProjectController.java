package com.workforcehub.controller;

import com.workforcehub.dto.ProjectDto;
import com.workforcehub.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/projects", "/projects"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Project Management", description = "Enterprise Project Creation, Portfolio Filtering & Dynamic Progress Tracking")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "List All Projects", description = "Fetches project portfolio with dynamic completion percentage, status, and department filtering")
    public ResponseEntity<List<ProjectDto>> getAllProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(projectService.getAllProjects(search, department, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Project by ID", description = "Retrieves project details including deadline, budget, status, and task metrics")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    @Operation(summary = "Create Project", description = "Creates a new enterprise project and initializes task metrics")
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody ProjectDto projectDto, Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName() : "admin";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(projectDto, username));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Project", description = "Updates project properties while preserving task-derived progress percentage")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDto projectDto, Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName() : "admin";
        return ResponseEntity.ok(projectService.updateProject(id, projectDto, username));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Project", description = "Deletes enterprise project record and logs administrative audit entry")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName() : "admin";
        projectService.deleteProject(id, username);
        return ResponseEntity.noContent().build();
    }
}

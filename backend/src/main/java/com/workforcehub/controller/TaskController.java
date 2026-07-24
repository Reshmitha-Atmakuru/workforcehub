package com.workforcehub.controller;

import com.workforcehub.dto.TaskDto;
import com.workforcehub.service.TaskService;
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
@RequestMapping({"/api/tasks", "/tasks"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Task Deliverables", description = "Task Registry, Assignment, Status Transitions & Auto Progress Triggers")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "Get All Tasks", description = "Retrieves all deliverable tasks with search, project, assigned employee, status, and priority filters")
    public ResponseEntity<List<TaskDto>> getAllTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long assignedEmployeeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return ResponseEntity.ok(taskService.getAllTasks(search, projectId, assignedEmployeeId, status, priority));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Task by ID", description = "Retrieves task details including assigned employee and parent project")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    @Operation(summary = "Create & Assign Task", description = "Creates deliverable task, assigns to employee, and triggers parent project progress recalculation")
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto, Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName() : "admin";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(taskDto, username));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Task Status & Details", description = "Updates task status (TODO/IN_PROGRESS/COMPLETED) and automatically recalculates parent project progress percentage in DB")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto taskDto, Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName() : "admin";
        return ResponseEntity.ok(taskService.updateTask(id, taskDto, username));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Task", description = "Removes task item and updates parent project progress percentage")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName() : "admin";
        taskService.deleteTask(id, username);
        return ResponseEntity.noContent().build();
    }
}

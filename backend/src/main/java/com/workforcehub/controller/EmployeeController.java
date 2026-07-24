package com.workforcehub.controller;

import com.workforcehub.dto.EmployeeDto;
import com.workforcehub.model.Role;
import com.workforcehub.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Employee Directory", description = "Workforce CRUD Operations, Pagination, Sorting & Filtering")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @Operation(summary = "Get All Employees", description = "Retrieves paginated employee directory with optional filters for search query, department, status, and role")
    public ResponseEntity<Page<EmployeeDto>> getAllEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Role roleEnum = null;
        if (role != null && !role.equals("All") && !role.isEmpty()) {
            try {
                roleEnum = Role.valueOf(role);
            } catch (IllegalArgumentException ignored) {
                // Invalid role string — treat as no filter
            }
        }

        return ResponseEntity.ok(employeeService.getAllEmployees(search, department, status, roleEnum, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Employee by ID", description = "Retrieves complete employee profile details including skills and role")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PostMapping
    @Operation(summary = "Create Employee Record", description = "Adds a new workforce member to system and logs audit trail event")
    public ResponseEntity<EmployeeDto> createEmployee(@Valid @RequestBody EmployeeDto employeeDto,
            Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName()
                : "admin";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employeeService.createEmployee(employeeDto, username));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Employee Profile", description = "Modifies employee attributes (department, role, salary, skills) and logs audit trail")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable Long id,
            @Valid @RequestBody EmployeeDto employeeDto, Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName()
                : "admin";
        return ResponseEntity.ok(employeeService.updateEmployee(id, employeeDto, username));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Employee Record", description = "Removes employee profile from database and logs audit trail event")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id, Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName()
                : "admin";
        employeeService.deleteEmployee(id, username);
        return ResponseEntity.noContent().build();
    }
}

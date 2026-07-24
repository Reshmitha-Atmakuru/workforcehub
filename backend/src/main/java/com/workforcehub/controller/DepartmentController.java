package com.workforcehub.controller;

import com.workforcehub.dto.DepartmentDto;
import com.workforcehub.model.Department;
import com.workforcehub.repository.DepartmentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        List<DepartmentDto> list = departmentRepository.findAll().stream()
                .map(d -> DepartmentDto.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .code(d.getCode())
                        .description(d.getDescription())
                        .location(d.getLocation())
                        .budget(d.getBudget())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<Department> createDepartment(@Valid @RequestBody Department department) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentRepository.save(department));
    }
}


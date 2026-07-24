package com.workforcehub.service;

import com.workforcehub.dto.EmployeeDto;
import com.workforcehub.model.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    Page<EmployeeDto> getAllEmployees(String search, String department, String status, Role role, Pageable pageable);
    EmployeeDto getEmployeeById(Long id);
    EmployeeDto createEmployee(EmployeeDto employeeDto, String currentUsername);
    EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto, String currentUsername);
    void deleteEmployee(Long id, String currentUsername);
}


package com.workforcehub.service.impl;

import com.workforcehub.dto.EmployeeDto;
import com.workforcehub.exception.ResourceNotFoundException;
import com.workforcehub.model.AuditLog;
import com.workforcehub.model.Employee;
import com.workforcehub.model.Role;
import com.workforcehub.repository.AuditLogRepository;
import com.workforcehub.repository.EmployeeRepository;
import com.workforcehub.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public Page<EmployeeDto> getAllEmployees(String search, String department, String status, Role role, Pageable pageable) {
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String deptParam = (department != null && !department.equals("ALL") && !department.equals("All")) ? department : null;
        String statusParam = (status != null && !status.equals("ALL") && !status.equals("All")) ? status : null;
        Role roleParam = role;

        return employeeRepository.searchEmployees(searchParam, deptParam, statusParam, roleParam, pageable)
                .map(this::mapToDto);
    }

    @Override
    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDto(employee);
    }

    @Override
    @Transactional
    public EmployeeDto createEmployee(EmployeeDto dto, String currentUsername) {
        long count = employeeRepository.count() + 1001;
        String empCode = dto.getCode() != null && !dto.getCode().isEmpty() ? dto.getCode() : "EMP-" + count;

        Employee employee = Employee.builder()
                .code(empCode)
                .firstName(dto.getFirstName() != null ? dto.getFirstName() : "New")
                .lastName(dto.getLastName() != null ? dto.getLastName() : "Employee")
                .email(dto.getEmail() != null ? dto.getEmail() : "employee" + count + "@workforcehub.com")
                .phone(dto.getPhone() != null ? dto.getPhone() : "+91 98765 00000")
                .department(dto.getDepartment() != null ? dto.getDepartment() : "Engineering")
                .jobTitle(dto.getJobTitle() != null ? dto.getJobTitle() : "Specialist")
                .accountRole(dto.getAccountRole() != null ? dto.getAccountRole() : Role.ROLE_EMPLOYEE)
                .salary(dto.getSalary() != null ? dto.getSalary() : new java.math.BigDecimal("1200000"))
                .joinDate(dto.getJoinDate() != null ? dto.getJoinDate() : java.time.LocalDate.now())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .officeLocation(dto.getOfficeLocation() != null ? dto.getOfficeLocation() : "Bengaluru, Karnataka")
                .skills(dto.getSkills() != null ? dto.getSkills() : java.util.Collections.emptyList())
                .build();

        Employee saved = employeeRepository.save(employee);

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("CREATE")
                .entityType("EMPLOYEE " + empCode)
                .entityId(String.valueOf(saved.getId()))
                .performedBy(currentUsername != null ? currentUsername : "SYSTEM")
                .details("Created employee profile for " + saved.getFirstName() + " " + saved.getLastName())
                .build());

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeDto dto, String currentUsername) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (dto.getFirstName() != null) employee.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) employee.setLastName(dto.getLastName());
        if (dto.getEmail() != null) employee.setEmail(dto.getEmail());
        if (dto.getPhone() != null) employee.setPhone(dto.getPhone());
        if (dto.getDepartment() != null) employee.setDepartment(dto.getDepartment());
        if (dto.getJobTitle() != null) employee.setJobTitle(dto.getJobTitle());
        if (dto.getAccountRole() != null) employee.setAccountRole(dto.getAccountRole());
        if (dto.getSalary() != null) employee.setSalary(dto.getSalary());
        if (dto.getStatus() != null) employee.setStatus(dto.getStatus());
        if (dto.getOfficeLocation() != null) employee.setOfficeLocation(dto.getOfficeLocation());
        if (dto.getSkills() != null) employee.setSkills(dto.getSkills());

        Employee updated = employeeRepository.save(employee);

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("UPDATE")
                .entityType("EMPLOYEE " + updated.getCode())
                .entityId(String.valueOf(updated.getId()))
                .performedBy(currentUsername != null ? currentUsername : "SYSTEM")
                .details("Updated employee profile for " + updated.getFirstName() + " " + updated.getLastName())
                .build());

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id, String currentUsername) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employeeRepository.delete(employee);

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("DELETE")
                .entityType("EMPLOYEE " + employee.getCode())
                .entityId(String.valueOf(employee.getId()))
                .performedBy(currentUsername != null ? currentUsername : "SYSTEM")
                .details("Deleted employee record: " + employee.getFirstName() + " " + employee.getLastName())
                .build());
    }

    private EmployeeDto mapToDto(Employee e) {
        return EmployeeDto.builder()
                .id(e.getId())
                .code(e.getCode() != null ? e.getCode() : "EMP-" + e.getId())
                .firstName(e.getFirstName() != null ? e.getFirstName() : "Employee")
                .lastName(e.getLastName() != null ? e.getLastName() : "")
                .email(e.getEmail() != null ? e.getEmail() : "")
                .phone(e.getPhone() != null ? e.getPhone() : "+91 98765 00000")
                .department(e.getDepartment() != null ? e.getDepartment() : "Engineering")
                .jobTitle(e.getJobTitle() != null ? e.getJobTitle() : "Specialist")
                .accountRole(e.getAccountRole() != null ? e.getAccountRole() : Role.ROLE_EMPLOYEE)
                .salary(e.getSalary() != null ? e.getSalary() : new java.math.BigDecimal("1200000"))
                .joinDate(e.getJoinDate() != null ? e.getJoinDate() : java.time.LocalDate.now())
                .status(e.getStatus() != null ? e.getStatus() : "ACTIVE")
                .officeLocation(e.getOfficeLocation() != null ? e.getOfficeLocation() : "Bengaluru, Karnataka")
                .skills(e.getSkills() != null ? e.getSkills() : java.util.Collections.emptyList())
                .userId(e.getUser() != null ? e.getUser().getId() : null)
                .build();
    }
}

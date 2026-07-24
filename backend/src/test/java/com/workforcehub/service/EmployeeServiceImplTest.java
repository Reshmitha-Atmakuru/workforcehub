package com.workforcehub.service;

import com.workforcehub.dto.EmployeeDto;
import com.workforcehub.exception.ResourceNotFoundException;
import com.workforcehub.model.Employee;
import com.workforcehub.model.Role;
import com.workforcehub.repository.AuditLogRepository;
import com.workforcehub.repository.EmployeeRepository;
import com.workforcehub.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee employee;
    private EmployeeDto employeeDto;

    @BeforeEach
    void setUp() {
        employee = Employee.builder()
                .id(1L)
                .code("EMP-1001")
                .firstName("Kiran")
                .lastName("Reddy")
                .email("kiran.reddy@workforcehub.com")
                .department("Engineering")
                .jobTitle("Software Engineer")
                .accountRole(Role.ROLE_EMPLOYEE)
                .salary(new BigDecimal("850000.00"))
                .status("ACTIVE")
                .skills(List.of("Java", "Spring Boot", "React"))
                .build();

        employeeDto = EmployeeDto.builder()
                .firstName("Kiran")
                .lastName("Reddy")
                .email("kiran.reddy@workforcehub.com")
                .department("Engineering")
                .jobTitle("Software Engineer")
                .accountRole(Role.ROLE_EMPLOYEE)
                .salary(new BigDecimal("850000.00"))
                .skills(List.of("Java", "Spring Boot", "React"))
                .build();
    }

    @Test
    void getEmployeeById_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        EmployeeDto result = employeeService.getEmployeeById(1L);

        assertNotNull(result);
        assertEquals("EMP-1001", result.getCode());
        assertEquals("Kiran", result.getFirstName());
        assertEquals("Engineering", result.getDepartment());
        verify(employeeRepository, times(1)).findById(1L);
    }

    @Test
    void getEmployeeById_NotFound_ThrowsException() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.getEmployeeById(99L));
        verify(employeeRepository, times(1)).findById(99L);
    }

    @Test
    void createEmployee_Success() {
        when(employeeRepository.count()).thenReturn(5L);
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        EmployeeDto result = employeeService.createEmployee(employeeDto, "admin");

        assertNotNull(result);
        assertEquals("Kiran", result.getFirstName());
        verify(employeeRepository, times(1)).save(any(Employee.class));
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void getAllEmployees_ReturnsPagedData() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Employee> page = new PageImpl<>(List.of(employee));
        when(employeeRepository.searchEmployees(null, null, null, null, pageable)).thenReturn(page);

        Page<EmployeeDto> result = employeeService.getAllEmployees(null, null, null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Kiran", result.getContent().get(0).getFirstName());
    }

    @Test
    void deleteEmployee_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        doNothing().when(employeeRepository).delete(employee);

        employeeService.deleteEmployee(1L, "admin");

        verify(employeeRepository, times(1)).delete(employee);
        verify(auditLogRepository, times(1)).save(any());
    }
}

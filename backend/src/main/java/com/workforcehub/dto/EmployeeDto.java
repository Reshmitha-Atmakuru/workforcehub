package com.workforcehub.dto;

import com.workforcehub.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {
    private Long id;
    private String code;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String department;
    private String jobTitle;
    private Role accountRole;
    private BigDecimal salary;
    private LocalDate joinDate;
    private String status;
    private String officeLocation;
    private List<String> skills;
    private Long userId;
}

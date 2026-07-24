package com.workforcehub.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailDto {
    private String to;
    private String subject;
    private String body;
    private boolean broadcast; // if true, send to all employees
}

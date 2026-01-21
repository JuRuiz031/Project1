package com.example.calendario.dto.calendar;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CalendarCreateRequestDTO {
    
    @NotNull(message = "User ID cannot be null")
    @JsonProperty("user_id")
    private Long userId;
    
    @NotBlank(message = "Calendar name cannot be empty")
    @JsonProperty("name")
    private String name;
    
    // Constructors
    public CalendarCreateRequestDTO() {}
    
    public CalendarCreateRequestDTO(Long userId, String name) {
        this.userId = userId;
        this.name = name;
    }
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

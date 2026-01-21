package com.example.calendario.dto.calendar;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalendarUpdateRequestDTO {
    
    @JsonProperty("name")
    private String name; // Optional
    
    @JsonProperty("admins")
    private List<Long> admins; // Optional - user IDs to promote to admin
    
    // Constructors
    public CalendarUpdateRequestDTO() {}
    
    public CalendarUpdateRequestDTO(String name, List<Long> admins) {
        this.name = name;
        this.admins = admins;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public List<Long> getAdmins() { return admins; }
    public void setAdmins(List<Long> admins) { this.admins = admins; }
}

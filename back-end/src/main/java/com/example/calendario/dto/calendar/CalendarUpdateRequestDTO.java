package com.example.calendario.dto.calendar;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalendarUpdateRequestDTO {
    
    @JsonProperty("name")
    private String name; // Optional
    
    @JsonProperty("admins")
    private List<String> admins; // Optional - user IDs to promote to admin
    
    // Constructors
    public CalendarUpdateRequestDTO() {}
    
    public CalendarUpdateRequestDTO(String name, List<String> admins) {
        this.name = name;
        this.admins = admins;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public List<String> getAdmins() { return admins; }
    public void setAdmins(List<String> admins) { this.admins = admins; }
}

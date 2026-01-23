package com.example.calendario.dto.calendar;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalendarUpdateResponseDTO {
    
    @JsonProperty("calendar_id")
    private String calendarId;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("admins")
    private List<String> admins;
    
    // Constructors
    public CalendarUpdateResponseDTO() {}
    
    public CalendarUpdateResponseDTO(String calendarId, String name, List<String> admins) {
        this.calendarId = calendarId;
        this.name = name;
        this.admins = admins;
    }
    
    // Getters and Setters
    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public List<String> getAdmins() { return admins; }
    public void setAdmins(List<String> admins) { this.admins = admins; }
}

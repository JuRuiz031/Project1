package com.example.calendario.dto.calendar;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalendarResponseDTO {
    
    @JsonProperty("calendar_id")
    private String calendarId;
    
    @JsonProperty("name")
    private String name;
    
    // Constructors
    public CalendarResponseDTO() {}
    
    public CalendarResponseDTO(String calendarId, String name) {
        this.calendarId = calendarId;
        this.name = name;
    }
    
    // Getters and Setters
    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

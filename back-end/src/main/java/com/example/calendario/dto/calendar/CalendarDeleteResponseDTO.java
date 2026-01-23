package com.example.calendario.dto.calendar;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalendarDeleteResponseDTO {
    
    @JsonProperty("calendar_id")
    private String calendarId;
    
    @JsonProperty("deleted")
    private boolean deleted;
    
    // Constructors
    public CalendarDeleteResponseDTO() {}
    
    public CalendarDeleteResponseDTO(String calendarId, boolean deleted) {
        this.calendarId = calendarId;
        this.deleted = deleted;
    }
    
    // Getters and Setters
    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
    
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
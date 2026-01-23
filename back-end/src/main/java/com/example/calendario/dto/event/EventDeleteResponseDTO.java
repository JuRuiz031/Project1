package com.example.calendario.dto.event;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EventDeleteResponseDTO {
    
    @JsonProperty("event_id")
    private String eventId;
    
    @JsonProperty("calendar_id")
    private String calendarId;
    
    @JsonProperty("deleted")
    private Boolean deleted;
    
    // Constructors
    public EventDeleteResponseDTO() {}
    
    public EventDeleteResponseDTO(String eventId, String calendarId, Boolean deleted) {
        this.eventId = eventId;
        this.calendarId = calendarId;
        this.deleted = deleted;
    }
    
    // Getters and Setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    
    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
    
    public Boolean getDeleted() { return deleted; }
    public void setDeleted(Boolean deleted) { this.deleted = deleted; }
}

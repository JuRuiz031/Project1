package com.example.calendario.dto.calendar;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalendarInviteResponseDTO {
    
    @JsonProperty("calendar_id")
    private String calendarId;
    
    @JsonProperty("invite_link")
    private String inviteLink;
    
    // Constructors
    public CalendarInviteResponseDTO() {}
    
    public CalendarInviteResponseDTO(String calendarId, String inviteLink) {
        this.calendarId = calendarId;
        this.inviteLink = inviteLink;
    }
    
    // Getters and Setters
    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
    
    public String getInviteLink() { return inviteLink; }
    public void setInviteLink(String inviteLink) { this.inviteLink = inviteLink; }
}

package com.example.calendario.dto.invite;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EventInviteResponseDTO {
    
    @JsonProperty("event_id")
    private String eventId;
    
    @JsonProperty("invite_link")
    private String inviteLink;
    
    @JsonProperty("guest_name")
    private String guestName;
    
    // Constructors
    public EventInviteResponseDTO() {}
    
    public EventInviteResponseDTO(String eventId, String inviteLink, String guestName) {
        this.eventId = eventId;
        this.inviteLink = inviteLink;
        this.guestName = guestName;
    }
    
    // Getters and Setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    
    public String getInviteLink() { return inviteLink; }
    public void setInviteLink(String inviteLink) { this.inviteLink = inviteLink; }
    
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
}

package com.example.calendario.dto.calendar;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public class CalendarInviteAcceptRequestDTO {
    
    @NotBlank(message = "Invite token cannot be empty")
    @JsonProperty("invite_token")
    private String inviteToken;
    
    // Constructors
    public CalendarInviteAcceptRequestDTO() {}
    
    public CalendarInviteAcceptRequestDTO(String inviteToken) {
        this.inviteToken = inviteToken;
    }
    
    // Getters and Setters
    public String getInviteToken() { return inviteToken; }
    public void setInviteToken(String inviteToken) { this.inviteToken = inviteToken; }
}

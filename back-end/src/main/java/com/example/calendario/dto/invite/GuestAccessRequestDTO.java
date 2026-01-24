package com.example.calendario.dto.invite;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public class GuestAccessRequestDTO {
    
    @NotBlank(message = "Guest name cannot be empty")
    @JsonProperty("guest_name")
    private String guestName;
    
    // Constructors
    public GuestAccessRequestDTO() {}
    
    public GuestAccessRequestDTO(String guestName) {
        this.guestName = guestName;
    }
    
    // Getters and Setters
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
}

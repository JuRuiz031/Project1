package com.example.calendario.dto.invite;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class InviteRequestDTO {

    @JsonProperty("event_id")
    private String eventId;

    @JsonProperty("poll_id")
    private String pollId;

    @JsonProperty("expiration_date")
    private LocalDateTime expirationDate;

    // Default constructor
    public InviteRequestDTO() {}

    // All-args constructor
    public InviteRequestDTO(String eventId, String pollId, LocalDateTime expirationDate) {
        this.eventId = eventId;
        this.pollId = pollId;
        this.expirationDate = expirationDate;
    }

    // Getters and setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getPollId() { return pollId; }
    public void setPollId(String pollId) { this.pollId = pollId; }

    public LocalDateTime getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDateTime expirationDate) { this.expirationDate = expirationDate; }
}

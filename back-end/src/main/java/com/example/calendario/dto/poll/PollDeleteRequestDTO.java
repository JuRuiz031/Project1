package com.example.calendario.dto.poll;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;

public class PollDeleteRequestDTO {

    @NotNull(message = "User ID cannot be null")
    @JsonProperty("user_id")
    private String userId;

    @NotNull(message = "Calendar ID cannot be null")
    @JsonProperty("calendar_id")
    private String calendarId;

    public PollDeleteRequestDTO() {}

    public PollDeleteRequestDTO(String userId, String calendarId) {
        this.userId = userId;
        this.calendarId = calendarId;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
}

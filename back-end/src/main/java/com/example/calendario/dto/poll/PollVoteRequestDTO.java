package com.example.calendario.dto.poll;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class PollVoteRequestDTO {

    @NotNull(message = "User ID cannot be null")
    @JsonProperty("user_id")
    private String userId;

    @NotNull(message = "Calendar ID cannot be null")
    @JsonProperty("calendar_id")
    private String calendarId;

    @NotNull(message = "Options cannot be null")
    @NotEmpty(message = "Options must contain at least one selection")
    @JsonProperty("options")
    private List<Integer> options;

    public PollVoteRequestDTO() {}

    public PollVoteRequestDTO(String userId, String calendarId, List<Integer> options) {
        this.userId = userId;
        this.calendarId = calendarId;
        this.options = options;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }

    public List<Integer> getOptions() { return options; }
    public void setOptions(List<Integer> options) { this.options = options; }
}

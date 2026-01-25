package com.example.calendario.dto.user;

import java.util.List;

import com.example.calendario.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UserResponseDTO {

    @JsonProperty("user_id")
    private String id;

    @JsonProperty("username")
    private String username;

    @JsonProperty("email")
    private String email;

    @JsonProperty("calendars")
    private List<UserCalendarDTO> calendars;

    // Inner class for calendar info in user response
    public static class UserCalendarDTO {
        @JsonProperty("calendar_id")
        private String calendarId;

        @JsonProperty("name")
        private String name;

        public UserCalendarDTO() {}

        public UserCalendarDTO(String calendarId, String name) {
            this.calendarId = calendarId;
            this.name = name;
        }

        public String getCalendarId() { return calendarId; }
        public void setCalendarId(String calendarId) { this.calendarId = calendarId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    // Constructors
    public UserResponseDTO() {}

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.calendars = null; // To be populated by service layer
    }

    public UserResponseDTO(User user, List<UserCalendarDTO> calendars) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.calendars = calendars;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<UserCalendarDTO> getCalendars() { return calendars; }
    public void setCalendars(List<UserCalendarDTO> calendars) { this.calendars = calendars; }

    // toString method for debugging
    @Override
    public String toString() {
        return "UserResponseDTO{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", calendars=" + calendars +
                '}';
    }
}

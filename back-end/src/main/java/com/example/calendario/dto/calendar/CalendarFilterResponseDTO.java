package com.example.calendario.dto.calendar;

import java.util.List;

import com.example.calendario.dto.event.EventResponseDTO;
import com.example.calendario.dto.poll.PollResponseDTO;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CalendarFilterResponseDTO {
    
    @JsonProperty("events")
    private List<EventResponseDTO> events;

    @JsonProperty("polls")
    private List<PollResponseDTO> polls;
    
    @JsonProperty("users")
    private List<CalendarUserInfo> users;
    
    // Inner class for user info
    public static class CalendarUserInfo {
        @JsonProperty("calendar_id")
        private String calendarId;
        
        @JsonProperty("user_id")
        private String userId;
        
        @JsonProperty("username")
        private String username;
        
        public CalendarUserInfo() {}
        
        public CalendarUserInfo(String calendarId, String userId, String username) {
            this.calendarId = calendarId;
            this.userId = userId;
            this.username = username;
        }
        
        public String getCalendarId() { return calendarId; }
        public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
    
    // Constructors
    public CalendarFilterResponseDTO() {}
    
    public CalendarFilterResponseDTO(List<EventResponseDTO> events, List<PollResponseDTO> polls, List<CalendarUserInfo> users) {
        this.events = events;
        this.polls = polls;
        this.users = users;
    }
    
    // Getters and Setters
    public List<EventResponseDTO> getEvents() { return events; }
    public void setEvents(List<EventResponseDTO> events) { this.events = events; }

    public List<PollResponseDTO> getPolls() { return polls; }
    public void setPolls(List<PollResponseDTO> polls) { this.polls = polls; }
    
    public List<CalendarUserInfo> getUsers() { return users; }
    public void setUsers(List<CalendarUserInfo> users) { this.users = users; }
}

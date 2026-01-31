package com.example.calendario.dto.calendar;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalendarHomepageResponseDTO {
    
    @JsonProperty("calendars")
    private List<CalendarInfo> calendars;
    
    @JsonProperty("tags")
    private List<String> tags;
    
    // Inner class for calendar info
    public static class CalendarInfo {
        @JsonProperty("calendar_id")
        private String calendarId;
        
        @JsonProperty("name")
        private String name;

        @JsonProperty("is_admin")
        private Boolean isAdmin;
        
        @JsonProperty("users")
        private List<UserInfo> users;
        
        public CalendarInfo() {}
        
        public CalendarInfo(String calendarId, String name, Boolean isAdmin) {
            this.calendarId = calendarId;
            this.name = name;
            this.isAdmin = isAdmin;
            this.users = new java.util.ArrayList<>();
        }
        
        public CalendarInfo(String calendarId, String name, Boolean isAdmin, List<UserInfo> users) {
            this.calendarId = calendarId;
            this.name = name;
            this.isAdmin = isAdmin;
            this.users = users;
        }
        
        public String getCalendarId() { return calendarId; }
        public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Boolean getIsAdmin() { return isAdmin; }
        public void setIsAdmin(Boolean isAdmin) { this.isAdmin = isAdmin; }
        
        public List<UserInfo> getUsers() { return users; }
        public void setUsers(List<UserInfo> users) { this.users = users; }
    }
    
    // Inner class for user info
    public static class UserInfo {
        @JsonProperty("user_id")
        private String userId;
        
        @JsonProperty("username")
        private String username;
        
        @JsonProperty("is_admin")
        private Boolean isAdmin;
        
        public UserInfo() {}
        
        public UserInfo(String userId, String username) {
            this.userId = userId;
            this.username = username;
            this.isAdmin = false;
        }
        
        public UserInfo(String userId, String username, Boolean isAdmin) {
            this.userId = userId;
            this.username = username;
            this.isAdmin = isAdmin;
        }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public Boolean getIsAdmin() { return isAdmin; }
        public void setIsAdmin(Boolean isAdmin) { this.isAdmin = isAdmin; }
    }
    
    // Constructors
    public CalendarHomepageResponseDTO() {}
    
    public CalendarHomepageResponseDTO(List<CalendarInfo> calendars, List<String> tags) {
        this.calendars = calendars;
        this.tags = tags;
    }
    
    // Getters and Setters
    public List<CalendarInfo> getCalendars() { return calendars; }
    public void setCalendars(List<CalendarInfo> calendars) { this.calendars = calendars; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}

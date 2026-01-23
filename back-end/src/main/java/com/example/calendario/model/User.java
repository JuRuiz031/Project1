package com.example.calendario.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    
    @Id
    private String id; // Mongo generated ID

    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;

    private Boolean isSuperuser; // Checks if the user has superuser privileges in the mongo document

    private List<CalendarMembership> calendarIds = new ArrayList<>(); // List of calendars and admin status


    // Inner class for calendar membership
    public static class CalendarMembership {
        private String calendarId;
        private Boolean isAdmin;

        // Constructors
        public CalendarMembership() {}

        public CalendarMembership(String calendarId, Boolean isAdmin) {
            this.calendarId = calendarId;
            this.isAdmin = isAdmin;
        }

        // Getters and Setters
        public String getCalendarId() { return calendarId; }
        public void setCalendarId(String calendarId) { this.calendarId = calendarId; }

        public Boolean getIsAdmin() { return isAdmin; }
        public void setIsAdmin(Boolean isAdmin) { this.isAdmin = isAdmin; }
    }


    // Constructors
    public User() {} // Default constructor (used by Spring Data)

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }


    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getIsSuperuser() { return isSuperuser; }
    public void setIsSuperuser(Boolean isSuperuser) { this.isSuperuser = isSuperuser; }

    public List<CalendarMembership> getCalendarIds() { return calendarIds; }
    public void setCalendarIds(List<CalendarMembership> calendarIds) { this.calendarIds = calendarIds; }

    // Helper methods for calendar management
    public void addCalendarMembership(String calendarId, Boolean isAdmin) {
        // Avoid duplicates
        boolean alreadyExists = this.calendarIds.stream()
                .anyMatch(cm -> cm.getCalendarId().equals(calendarId));
        
        if (!alreadyExists) {
            this.calendarIds.add(new CalendarMembership(calendarId, isAdmin));
        }
    }

    public boolean isAdminOfCalendar(String calendarId) {
        return this.calendarIds.stream()
                .filter(cm -> cm.getCalendarId().equals(calendarId))
                .findFirst()
                .map(CalendarMembership::getIsAdmin)
                .orElse(false);
    }

    public boolean isMemberOfCalendar(String calendarId) {
        return this.calendarIds.stream()
                .anyMatch(cm -> cm.getCalendarId().equals(calendarId));
    }

    public void removeCalendarMembership(String calendarId) {
        this.calendarIds.removeIf(cm -> cm.getCalendarId().equals(calendarId));
    }

    // Helper method for superuser check (handles null values)
    public boolean isSuperuser() {
        return this.isSuperuser != null && this.isSuperuser;
    }
}

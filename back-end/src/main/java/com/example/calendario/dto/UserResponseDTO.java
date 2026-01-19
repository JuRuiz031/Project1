package com.example.calendario.dto;

import com.example.calendario.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UserResponseDTO {

    @JsonProperty("user_id")
    private String id;
    @JsonProperty("username")
    private String username;
    @JsonProperty("email")
    private String email;
    @JsonProperty("is_superuser")
    private Boolean isSuperuser;

    // FUTURE CALENDARS LIST
    // @JsonProperty("calendars")
    // private List<CalendarDTO> calendars;
    // Constructors
    
    public UserResponseDTO() {}

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.isSuperuser = user.getIsSuperuser();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Boolean getIsSuperuser() { return isSuperuser; }
    public void setIsSuperuser(Boolean isSuperuser) { this.isSuperuser = isSuperuser; }

    // toString method for debugging
    @Override
    public String toString() {
        return "UserResponseDTO{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", isSuperuser=" + isSuperuser +
                '}';
    }
}

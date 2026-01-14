package com.example.calendario.dto;

import com.example.calendario.model.User;

public class UserResponseDTO {

    private String id;
    private String username;
    private String email;
    private Boolean isSuperuser;

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

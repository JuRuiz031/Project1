package com.example.calendario.dto.user;

import com.example.calendario.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Simplified user DTO for login responses.
 * Contains only user_id and username as per API spec.
 */
public class LoginUserDTO {

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("username")
    private String username;

    // Constructors
    public LoginUserDTO() {}

    public LoginUserDTO(String userId, String username) {
        this.userId = userId;
        this.username = username;
    }

    public LoginUserDTO(User user) {
        this.userId = user.getId();
        this.username = user.getUsername();
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}

package com.example.calendario.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginSuccessDTO {
    
    @JsonProperty("token")
    private String token;

    @JsonProperty("user")
    private UserResponseDTO user;

    @JsonProperty("expires_at")
    private String expiresAt;

    // Constructor
    public LoginSuccessDTO(String token, UserResponseDTO user, String expiresAt) {
        this.token = token;
        this.user = user;
        this.expiresAt = expiresAt;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserResponseDTO getUser() { return user; }
    public void setUser(UserResponseDTO user) { this.user = user; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
}
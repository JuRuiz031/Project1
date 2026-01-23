package com.example.calendario.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UserUpdateDTO {

    @Size(min = 3, max = 25, message = "Username must be between 3 and 25 characters")
    @JsonProperty("username")
    private String username;

    @Email(message = "Invalid email format")
    @JsonProperty("email")
    private String email;

    @Size(min = 5, max = 25, message = "Password must be between 5 and 25 characters")
    @JsonProperty("password")
    private String password;

    // Constructors
    public UserUpdateDTO() {}

    public UserUpdateDTO(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    @Override
    public String toString() {
        return "UserUpdateDTO{" +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}

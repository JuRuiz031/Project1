package com.example.calendario.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.calendario.dto.user.LoginRequestDTO;
import com.example.calendario.dto.user.LoginStatusDTO;
import com.example.calendario.dto.user.LoginSuccessDTO;
import com.example.calendario.dto.user.UserDeleteResponseDTO;
import com.example.calendario.dto.user.UserRegistrationDTO;
import com.example.calendario.dto.user.UserResponseDTO;
import com.example.calendario.dto.user.UserUpdateDTO;
import com.example.calendario.model.User;
import com.example.calendario.service.UserService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;

    // Constructor
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST Register Users
    @PostMapping("/users")
    public ResponseEntity<UserResponseDTO> registerUser(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        User createdUser = userService.registerUser(registrationDTO);
        return ResponseEntity.ok(new UserResponseDTO(createdUser));
    }

    // GET Login Status - check if user is authenticated
    @GetMapping("/login")
    public ResponseEntity<LoginStatusDTO> getLoginStatus() {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        LoginStatusDTO response = userService.checkLoginStatus(authenticatedUsername);
        return ResponseEntity.ok(response);
    }

    // POST Login Users
    @PostMapping("/login")
    public ResponseEntity<LoginSuccessDTO> loginUser(@Valid @RequestBody LoginRequestDTO loginDTO) {
        LoginSuccessDTO response = userService.authenticateUser(loginDTO);
        return ResponseEntity.ok(response);
    }

    // GET View User by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable String id) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        // Validate access and get user (authorization check done in service)
        User user = userService.validateUserAccess(id, authenticatedUsername);
        
        return ResponseEntity.ok(new UserResponseDTO(user));
    }

    // DELETE User by ID
    @DeleteMapping("/users/{id}")
    public ResponseEntity<UserDeleteResponseDTO> deleteUserById(@PathVariable String id) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        // Validate access and delete user (authorization check done in service)
        UserDeleteResponseDTO deletedUser = userService.validateAndDeleteUser(id, authenticatedUsername);
        
        return ResponseEntity.ok(deletedUser);
    }

    // PATCH User
    @PatchMapping("/users/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable String id, @Valid @RequestBody UserUpdateDTO updateDTO) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();
        
        User updatedUser = userService.updateUser(id, updateDTO, authenticatedUsername);
        
        return ResponseEntity.ok(new UserResponseDTO(updatedUser));
    }

}

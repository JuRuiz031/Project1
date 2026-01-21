package com.example.calendario.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.calendario.dto.LoginRequestDTO;
import com.example.calendario.dto.LoginSuccessDTO;
import com.example.calendario.dto.UserRegistrationDTO;
import com.example.calendario.dto.UserResponseDTO;
import com.example.calendario.dto.UserUpdateDTO;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.model.User;
import com.example.calendario.service.UserService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:4200")
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


    // POST Login Users
    @PostMapping("/login")
    public ResponseEntity<LoginSuccessDTO> loginUser(@Valid @RequestBody LoginRequestDTO loginDTO) {
        LoginSuccessDTO response = userService.authenticateUser(loginDTO);
        return ResponseEntity.ok(response);
    }

    // GET View User by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable String id) {
        User user = userService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return ResponseEntity.ok(new UserResponseDTO(user));
    }

    // PATCH User
    @PatchMapping("/users/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable String id, @Valid @RequestBody UserUpdateDTO updateDTO) {
        User updatedUser = userService.updateUser(id, updateDTO);
        return ResponseEntity.ok(new UserResponseDTO(updatedUser));
    }

}

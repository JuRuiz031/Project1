package com.example.calendario.service;

import org.springframework.stereotype.Service;

import com.example.calendario.dto.LoginRequestDTO;
import com.example.calendario.dto.UserRegistrationDTO;
import com.example.calendario.model.User;
import com.example.calendario.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;

    // Constructor
   public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
   }

   //Register new User
   public User registerUser(UserRegistrationDTO dto) {

    // Check if username or email already exists
    if(userRepository.findByUsername(dto.getUsername()).isPresent()) {
        throw new RuntimeException("Username already exists");
    }

    if(userRepository.findByEmail(dto.getEmail()).isPresent()) {
        throw new RuntimeException("Email already exists");
    }

    // Convert DTO to User entity
    User newUser = new User(
            dto.getUsername(),
            dto.getEmail(),
            dto.getPassword()
    );

    return userRepository.save(newUser);
   }

   // Authenticate existing User
   public User loginUser(LoginRequestDTO dto) {

    // Find user by username
    User user = userRepository.findByUsername(dto.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

    // Check password (not hashed or salted yet) MUST BE IMPLEMENTED LATER
    if(!user.getPassword().equals(dto.getPassword())) {
        throw new RuntimeException("Invalid password");
    }

    // Authentication successful
    return user;
   }
}

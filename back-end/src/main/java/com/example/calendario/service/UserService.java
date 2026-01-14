package com.example.calendario.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.calendario.dto.LoginRequestDTO;
import com.example.calendario.dto.LoginSuccessDTO;
import com.example.calendario.dto.UserRegistrationDTO;
import com.example.calendario.dto.UserResponseDTO;
import com.example.calendario.exception.DuplicateEmailException;
import com.example.calendario.exception.DuplicateUsernameException;
import com.example.calendario.exception.InvalidCredentialsException;
import com.example.calendario.exception.ResourceNotFoundException;
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
        throw new DuplicateUsernameException("Username already exists: " + dto.getUsername());
    }

    if(userRepository.findByEmail(dto.getEmail()).isPresent()) {
        throw new DuplicateEmailException("Email already exists: " + dto.getEmail());
    }

    // Convert DTO to User entity
    User newUser = new User(
            dto.getUsername(),
            dto.getEmail(),
            dto.getPassword()
    );

    return userRepository.save(newUser);
   }

   // Authenticate existing User and return LoginSuccessDTO
   public LoginSuccessDTO authenticateUser(LoginRequestDTO dto) {

    // Find user by username
    User user = userRepository.findByUsername(dto.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // Check password (not hashed or salted yet) MUST BE IMPLEMENTED LATER
    if(!user.getPassword().equals(dto.getPassword())) {
        throw new InvalidCredentialsException("Invalid password");
    }

    // Generate a dummy token **MUST ADD JWT LATER**
    String mockToken = "mock-jwt-token-placeholder";
    String expiresAt = Instant.now().plus(1, ChronoUnit.HOURS).toString();

    // Return clean DTO
    return new LoginSuccessDTO(
            mockToken,
            new UserResponseDTO(user),
            expiresAt
    );
   }

   // Find by user ID
   public Optional<User> findById(String id) {
    return userRepository.findById(id);
   }
}

package com.example.calendario.service;
import java.util.Date;
import java.util.Optional;
import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.calendario.dto.user.UserDeleteResponseDTO;
import com.example.calendario.dto.user.UserUpdateDTO;
import com.example.calendario.dto.user.LoginRequestDTO;
import com.example.calendario.dto.user.LoginSuccessDTO;
import com.example.calendario.dto.user.UserRegistrationDTO;
import com.example.calendario.dto.user.UserResponseDTO;
import com.example.calendario.exception.DuplicateEmailException;
import com.example.calendario.exception.DuplicateUsernameException;
import com.example.calendario.exception.ForbiddenException;
import com.example.calendario.exception.InvalidCredentialsException;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.model.User;
import com.example.calendario.repository.UserRepository;
import com.example.calendario.util.JwtUtil;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // Constructor
   public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
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

    // Generate JWT token
    String token = jwtUtil.generateToken(user.getUsername());
    Date expiration = jwtUtil.extractExpiration(token);
    String expiresAt = expiration.toInstant().toString();

    // Return clean DTO
    return new LoginSuccessDTO(
            token,
            new UserResponseDTO(user),
            expiresAt
    );
   }

   // Find by user ID
   public Optional<User> findById(String id) {
    return userRepository.findById(id);
   }

   // Update User details
   public User updateUser(String id, UserUpdateDTO dto, String authenticatedUsername) {
    User authenticatedUser = findByUsername(authenticatedUsername)
        .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

    if (!id.equals(authenticatedUser.getId())) {
        throw new ForbiddenException("Can only update your account");
    }

    User userToUpdate = findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // Update fields if provided
    if(dto.getUsername() != null && !dto.getUsername().isEmpty()) {
        // Check for duplicate username
        userRepository.findByUsername(dto.getUsername()).ifPresent(existingUser -> {
            if(!existingUser.getId().equals(id)) {
                throw new DuplicateUsernameException("Username already exists: " + dto.getUsername());
            }
        });
        userToUpdate.setUsername(dto.getUsername());
    }

    if(dto.getEmail() != null && !dto.getEmail().isEmpty()) {
        // Check for duplicate email
        userRepository.findByEmail(dto.getEmail()).ifPresent(existingUser -> {
            if(!existingUser.getId().equals(id)) {
                throw new DuplicateEmailException("Email already exists: " + dto.getEmail());
            }
        });
        userToUpdate.setEmail(dto.getEmail());
    }

    if(dto.getPassword() != null && !dto.getPassword().isEmpty()) {
        userToUpdate.setPassword(dto.getPassword());
    }

    return userRepository.save(userToUpdate);
    }

   // Find by username
   public Optional<User> findByUsername(String username) {
    return userRepository.findByUsername(username);
   }

   // Save user
   public User saveUser(User user) {
    return userRepository.save(user);
   }

   // Batch save multiple users (more efficient than saving one by one)
   public Iterable<User> saveAllUsers(Iterable<User> users) {
    return userRepository.saveAll(users);
   }

   // Get all users (for cascade delete operations)
   public Iterable<User> getAllUsers() {
    return userRepository.findAll();
   }

   // Validate user access - check authorization for viewing user data
   public User validateUserAccess(String requestedUserId, String authenticatedUsername) {
       // Step 1: Find the authenticated user
       User authenticatedUser = findByUsername(authenticatedUsername)
           .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
       
       // Step 2: Check authorization - user can only access their own data
       if (!authenticatedUser.getId().equals(requestedUserId)) {
           throw new ForbiddenException("You can only access your own user data");
       }
       
       // Step 3: Return the requested user
       return findById(requestedUserId)
           .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + requestedUserId));
   }

    // Validate and delete user
    public UserDeleteResponseDTO validateAndDeleteUser(String requestedUserId, String authenticatedUsername) {
        // Step 1: Find the authenticated user
        User authenticatedUser = findByUsername(authenticatedUsername)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        
        // Step 2: Check authorization - user can only delete their own account
        if (!authenticatedUser.getId().equals(requestedUserId)) {
            throw new ForbiddenException("You can only delete your own user account");
        }
        
        // Step 3: Find the user to be deleted
        User userToDelete = findById(requestedUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + requestedUserId));
        
        // Step 4: Delete the user
        userRepository.delete(userToDelete);
        
        // Step 5: Return response DTO
        return new UserDeleteResponseDTO(userToDelete, true);
    }

   // Get all calendar IDs that belong to a user
   public List<String> getCalendarIdsForUser(String userId, String authenticatedUsername) {
       User user = validateUserAccess(userId, authenticatedUsername);

       if (user.getCalendarIds() == null) {
           return Collections.emptyList();
       }

       return user.getCalendarIds().stream()
               .map(User.CalendarMembership::getCalendarId)
               .collect(Collectors.toList());
   }
}

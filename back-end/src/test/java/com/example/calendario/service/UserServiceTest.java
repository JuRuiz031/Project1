package com.example.calendario.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.calendario.dto.user.LoginRequestDTO;
import com.example.calendario.dto.user.LoginSuccessDTO;
import com.example.calendario.dto.user.UserDeleteResponseDTO;
import com.example.calendario.dto.user.UserRegistrationDTO;
import com.example.calendario.dto.user.UserUpdateDTO;
import com.example.calendario.exception.DuplicateEmailException;
import com.example.calendario.exception.DuplicateUsernameException;
import com.example.calendario.exception.ForbiddenException;
import com.example.calendario.exception.InvalidCredentialsException;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.model.User;
import com.example.calendario.repository.UserRepository;
import com.example.calendario.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserRegistrationDTO registrationDTO;
    private LoginRequestDTO loginRequestDTO;

    @BeforeEach
    public void setUp() {
        testUser = new User("testuser", "test@example.com", "password123");
        testUser.setId("user-123");

        registrationDTO = new UserRegistrationDTO();
        registrationDTO.setUsername("newuser");
        registrationDTO.setEmail("new@example.com");
        registrationDTO.setPassword("newpass");

        loginRequestDTO = new LoginRequestDTO();
        loginRequestDTO.setUsername("testuser");
        loginRequestDTO.setPassword("password123");
    }

    @Test
    void testRegisterUser_Success() {
        // Arrange
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("new-user-id");
            return user;
        });

        // Act
        User result = userService.registerUser(registrationDTO);

        // Assert
        assertNotNull(result);
        assertEquals("newuser", result.getUsername());
        assertEquals("new@example.com", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterUser_DuplicateUsername() {
        // Arrange
        when(userRepository.findByUsername("newuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        DuplicateUsernameException exception = assertThrows(DuplicateUsernameException.class, () -> {
            userService.registerUser(registrationDTO);
        });
        assertEquals("Username already exists: newuser", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUser_DuplicateEmail() {
        // Arrange
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        DuplicateEmailException exception = assertThrows(DuplicateEmailException.class, () -> {
            userService.registerUser(registrationDTO);
        });
        assertEquals("Email already exists: new@example.com", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testAuthenticateUser_Success() {
        // Arrange
        String token = "jwt-token-123";
        Date expiration = new Date(System.currentTimeMillis() + 3600000);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken("testuser")).thenReturn(token);
        when(jwtUtil.extractExpiration(token)).thenReturn(expiration);

        // Act
        LoginSuccessDTO result = userService.authenticateUser(loginRequestDTO);

        // Assert
        assertNotNull(result);
        assertEquals(token, result.getToken());
        assertNotNull(result.getUser());
        assertEquals("user-123", result.getUser().getUserId());
        assertEquals("testuser", result.getUser().getUsername());
        assertNotNull(result.getExpiresAt());
        verify(jwtUtil, times(1)).generateToken("testuser");
    }

    @Test
    void testAuthenticateUser_UserNotFound() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userService.authenticateUser(loginRequestDTO);
        });
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void testAuthenticateUser_InvalidPassword() {
        // Arrange
        loginRequestDTO.setPassword("wrongpassword");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        InvalidCredentialsException exception = assertThrows(InvalidCredentialsException.class, () -> {
            userService.authenticateUser(loginRequestDTO);
        });
        assertEquals("Invalid password", exception.getMessage());
    }

    @Test
    void testAuthenticateUser_ReturnsSimplifiedUserDTO() {
        // Arrange - Test that login returns LoginUserDTO with only user_id and username
        String token = "jwt-token-456";
        Date expiration = new Date(System.currentTimeMillis() + 3600000);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken("testuser")).thenReturn(token);
        when(jwtUtil.extractExpiration(token)).thenReturn(expiration);

        // Act
        LoginSuccessDTO result = userService.authenticateUser(loginRequestDTO);

        // Assert - Verify LoginUserDTO contains only user_id and username (no email, no password)
        assertNotNull(result.getUser());
        assertEquals("user-123", result.getUser().getUserId());
        assertEquals("testuser", result.getUser().getUsername());
        // LoginUserDTO should not expose email or other sensitive data
        // This is verified by the DTO structure itself
    }


    @Test
    void testUpdateUser_Success() {
        // Arrange
        UserUpdateDTO updateDTO = new UserUpdateDTO();
        updateDTO.setUsername("updateduser");
        updateDTO.setEmail("updated@example.com");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));
        when(userRepository.findByUsername("updateduser")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("updated@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = userService.updateUser("user-123", updateDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("updateduser", result.getUsername());
        assertEquals("updated@example.com", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_Forbidden() {
        // Arrange
        UserUpdateDTO updateDTO = new UserUpdateDTO();
        User otherUser = new User("otheruser", "other@example.com", "pass");
        otherUser.setId("other-123");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            userService.updateUser("other-123", updateDTO, "testuser");
        });
        assertEquals("Can only update your account", exception.getMessage());
    }

    @Test
    void testUpdateUser_DuplicateUsername() {
        // Arrange
        UserUpdateDTO updateDTO = new UserUpdateDTO();
        updateDTO.setUsername("existinguser");

        User existingUser = new User("existinguser", "existing@example.com", "pass");
        existingUser.setId("existing-123");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));
        when(userRepository.findByUsername("existinguser")).thenReturn(Optional.of(existingUser));

        // Act & Assert
        DuplicateUsernameException exception = assertThrows(DuplicateUsernameException.class, () -> {
            userService.updateUser("user-123", updateDTO, "testuser");
        });
        assertEquals("Username already exists: existinguser", exception.getMessage());
    }

    @Test
    void testValidateUserAccess_Success() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));

        // Act
        User result = userService.validateUserAccess("user-123", "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("user-123", result.getId());
    }

    @Test
    void testValidateUserAccess_Forbidden() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            userService.validateUserAccess("other-user-id", "testuser");
        });
        assertEquals("You can only access your own user data", exception.getMessage());
    }

    @Test
    void testValidateAndDeleteUser_Success() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(any(User.class));

        // Act
        UserDeleteResponseDTO result = userService.validateAndDeleteUser("user-123", "testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.isDeleted());
        assertEquals("user-123", result.getId());
        verify(userRepository, times(1)).delete(testUser);
    }

    @Test
    void testValidateAndDeleteUser_Forbidden() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            userService.validateAndDeleteUser("other-user-id", "testuser");
        });
        assertEquals("You can only delete your own user account", exception.getMessage());
    }

    @Test
    void testGetCalendarIdsForUser_Success() {
        // Arrange
        testUser.addCalendarMembership("cal-1", true);
        testUser.addCalendarMembership("cal-2", false);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));

        // Act
        List<String> result = userService.getCalendarIdsForUser("user-123", "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains("cal-1"));
        assertTrue(result.contains("cal-2"));
    }

    @Test
    void testGetCalendarIdsForUser_EmptyList() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));

        // Act
        List<String> result = userService.getCalendarIdsForUser("user-123", "testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testFindByUsername() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.findByUsername("testuser");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
    }

    @Test
    void testFindById() {
        // Arrange
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.findById("user-123");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("user-123", result.get().getId());
    }

    @Test
    void testSaveUser() {
        // Arrange
        when(userRepository.save(testUser)).thenReturn(testUser);

        // Act
        User result = userService.saveUser(testUser);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository, times(1)).save(testUser);
    }
}

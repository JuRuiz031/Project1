package com.example.calendario.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.calendario.model.User;


@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    // Find all users who are members of a specific calendar
    @Query("{'calendarIds.calendarId': ?0}")
    List<User> findByCalendarIdsMembershipCalendarId(String calendarId);
}
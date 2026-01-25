package com.example.calendario.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.calendario.model.Poll;

@Repository
public interface PollRepository extends MongoRepository<Poll, String> {

}

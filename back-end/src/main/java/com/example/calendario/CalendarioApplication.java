package com.example.calendario;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class CalendarioApplication {

	public static void main(String[] args) {
		SpringApplication.run(CalendarioApplication.class, args);
	}

}

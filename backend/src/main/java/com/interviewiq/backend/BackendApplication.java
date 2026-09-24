package com.interviewiq.backend;

import com.interviewiq.model.User;
import com.interviewiq.model.UserCredits;
import com.interviewiq.repository.UserRepository;
import com.interviewiq.repository.UserCreditsRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@ComponentScan(basePackages = "com.interviewiq")
@EntityScan(basePackages = "com.interviewiq.model")
@EnableJpaRepositories(basePackages = "com.interviewiq.repository")
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedAdmin(
			UserRepository userRepository,
			UserCreditsRepository userCreditsRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			String adminEmail = "admin@interviewiq.ai";
			if (userRepository.findByEmail(adminEmail).isEmpty()) {
				User admin = new User();
				admin.setFullName("Admin Manager");
				admin.setEmail(adminEmail);
				admin.setPasswordHash(passwordEncoder.encode("admin123"));
				admin.setRole("ADMIN");
				admin.setCredits(100);
				User savedAdmin = userRepository.save(admin);

				UserCredits uc = new UserCredits();
				uc.setUserId(savedAdmin.getId());
				uc.setCredits(100);
				userCreditsRepository.save(uc);

				System.out.println("\n\n=======================================================");
				System.out.println("SEED DATA: ADMIN ACCOUNT CREATED SUCCESSFULLY!");
				System.out.println("EMAIL: admin@interviewiq.ai");
				System.out.println("PASSWORD: admin123");
				System.out.println("ROLE: ADMIN");
				System.out.println("=======================================================\n\n");
			}
		};
	}
}

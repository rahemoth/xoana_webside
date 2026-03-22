package com.xoana.config;

import com.xoana.model.User;
import com.xoana.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Create default admin user
            if (!userRepository.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@xoana.com")
                        .password(passwordEncoder.encode("admin123"))
                        .nickname("管理员")
                        .role(User.Role.ADMIN)
                        .enabled(true)
                        .build();
                userRepository.save(admin);
            }

            // Create default test user
            if (!userRepository.existsByUsername("test")) {
                User testUser = User.builder()
                        .username("test")
                        .email("test@xoana.com")
                        .password(passwordEncoder.encode("test123"))
                        .nickname("测试用户")
                        .role(User.Role.USER)
                        .enabled(true)
                        .build();
                userRepository.save(testUser);
            }
        };
    }
}

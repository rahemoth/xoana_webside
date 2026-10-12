package com.xoana.config;

import com.xoana.model.SiteSettings;
import com.xoana.model.User;
import com.xoana.repository.ProductRepository;
import com.xoana.repository.SiteSettingsRepository;
import com.xoana.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                      SiteSettingsRepository siteSettingsRepository,
                                      ProductRepository productRepository) {
        return args -> {
            // Create default admin user
            if (!userRepository.existsByUsername("jacky")) {
                User admin = User.builder()
                        .username("jacky")
                        .email("admin@xoana.com")
                        .password(passwordEncoder.encode("jacky060620"))
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

            // Initialize default site settings if not present
            if (!siteSettingsRepository.existsById(1L)) {
                siteSettingsRepository.save(new SiteSettings());
            }

            // Databases created before optimistic locking was added have products without a
            // version; Hibernate would treat those rows as new and reject every edit.
            int initialized = productRepository.initializeMissingVersions();
            if (initialized > 0) {
                log.info("Initialized the optimistic-locking version for {} existing product(s)", initialized);
            }
        };
    }
}

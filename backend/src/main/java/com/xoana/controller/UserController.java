package com.xoana.controller;

import com.xoana.dto.ApiResponse;
import com.xoana.model.User;
import com.xoana.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getProfile(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .map(u -> ResponseEntity.ok(ApiResponse.success(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(@RequestBody Map<String, String> updates,
                                                           Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .map(user -> {
                    if (updates.containsKey("nickname")) user.setNickname(updates.get("nickname"));
                    if (updates.containsKey("phone")) user.setPhone(updates.get("phone"));
                    if (updates.containsKey("address")) user.setAddress(updates.get("address"));
                    if (updates.containsKey("avatar")) user.setAvatar(updates.get("avatar"));
                    return ResponseEntity.ok(ApiResponse.success(userRepository.save(user)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(userRepository.findAll(pageable)));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setEnabled(!user.isEnabled());
                    return ResponseEntity.ok(ApiResponse.success(userRepository.save(user)));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

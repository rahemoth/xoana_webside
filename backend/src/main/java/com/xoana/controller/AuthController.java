package com.xoana.controller;

import com.xoana.dto.ApiResponse;
import com.xoana.dto.AuthResponse;
import com.xoana.dto.LoginRequest;
import com.xoana.dto.RegisterRequest;
import com.xoana.model.User;
import com.xoana.repository.UserRepository;
import com.xoana.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtTokenProvider jwtProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authManager, UserDetailsService userDetailsService,
                          JwtTokenProvider jwtProvider, UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authManager = authManager;
        this.userDetailsService = userDetailsService;
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword()));
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtProvider.generateToken(userDetails);
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole().name())
                .id(user.getId())
                .build()));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("用户名已存在"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("邮箱已被注册"));
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname() != null ? request.getNickname() : request.getUsername())
                .role(User.Role.USER)
                .enabled(true)
                .build();
        userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtProvider.generateToken(userDetails);
        return ResponseEntity.ok(ApiResponse.success("注册成功", AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole().name())
                .id(user.getId())
                .build()));
    }
}

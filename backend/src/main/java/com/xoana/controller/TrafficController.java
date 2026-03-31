package com.xoana.controller;

import com.xoana.dto.ApiResponse;
import com.xoana.model.SiteTraffic;
import com.xoana.repository.OrderRepository;
import com.xoana.repository.SiteTrafficRepository;
import com.xoana.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/traffic")
public class TrafficController {

    private final SiteTrafficRepository trafficRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public TrafficController(SiteTrafficRepository trafficRepository,
                             UserRepository userRepository,
                             OrderRepository orderRepository) {
        this.trafficRepository = trafficRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @PostMapping("/track")
    public ResponseEntity<Void> trackVisit(@RequestBody Map<String, String> body,
                                           HttpServletRequest request) {
        SiteTraffic traffic = SiteTraffic.builder()
                .pagePath(body.getOrDefault("path", "/"))
                .visitorIp(request.getRemoteAddr())
                .userAgent(request.getHeader("User-Agent"))
                .referer(request.getHeader("Referer"))
                .visitedAt(LocalDateTime.now())
                .build();
        trafficRepository.save(traffic);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    // Deleted:@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @RequestParam(defaultValue = "7") int days) {
        LocalDateTime start = LocalDateTime.now().minusDays(days);
        LocalDateTime end = LocalDateTime.now();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVisits", trafficRepository.countByVisitedAtBetween(start, end));
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("topPages", trafficRepository.getTopPages(start, end));
        stats.put("dailyVisits", trafficRepository.getDailyVisits(start, end));

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

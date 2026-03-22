package com.xoana.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_traffic")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteTraffic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "page_path", length = 200)
    private String pagePath;

    @Column(name = "visitor_ip", length = 50)
    private String visitorIp;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "referer", length = 500)
    private String referer;

    @Column(name = "visited_at")
    @Builder.Default
    private LocalDateTime visitedAt = LocalDateTime.now();

    @Column(name = "user_id")
    private Long userId;
}

package com.xoana.controller;

import com.xoana.dto.ApiResponse;
import com.xoana.model.Article;
import com.xoana.repository.ArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleRepository articleRepository;

    public ArticleController(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Article>>> getPublishedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(articleRepository.findByPublishedTrue(pageable)));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<Article>>> getRecentArticles() {
        return ResponseEntity.ok(ApiResponse.success(articleRepository.findTop5ByPublishedTrueOrderByCreatedAtDesc()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Article>> getArticle(@PathVariable Long id) {
        return articleRepository.findById(id)
                .filter(Article::isPublished)
                .map(a -> {
                    a.setViewCount(a.getViewCount() + 1);
                    articleRepository.save(a);
                    return ResponseEntity.ok(ApiResponse.success(a));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<Article>>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(articleRepository.findAll(pageable)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Article>> createArticle(@RequestBody Article article) {
        article.setId(null);
        if (article.isPublished()) {
            article.setPublishedAt(LocalDateTime.now());
        }
        return ResponseEntity.ok(ApiResponse.success(articleRepository.save(article)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Article>> updateArticle(@PathVariable Long id, @RequestBody Article article) {
        return articleRepository.findById(id)
                .map(a -> {
                    article.setId(id);
                    if (article.isPublished() && !a.isPublished()) {
                        article.setPublishedAt(LocalDateTime.now());
                    }
                    return ResponseEntity.ok(ApiResponse.success(articleRepository.save(article)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable Long id) {
        if (!articleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        articleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Article deleted", null));
    }
}

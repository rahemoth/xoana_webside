package com.xoana.repository;

import com.xoana.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    Page<Article> findByPublishedTrue(Pageable pageable);
    List<Article> findTop5ByPublishedTrueOrderByCreatedAtDesc();

    // Media library reference check: matches the file name in relative or absolute URLs.
    @Query("SELECT COUNT(a) FROM Article a WHERE a.coverImage LIKE CONCAT('%', :filename)")
    long countByCoverImage(@Param("filename") String filename);

    // Atomic increment so concurrent reads cannot overwrite each other's counts.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Article a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    int incrementViewCount(@Param("id") Long id);
}

package com.xoana.controller;

import com.xoana.dto.ApiResponse;
import com.xoana.model.SiteSettings;
import com.xoana.repository.ArticleRepository;
import com.xoana.repository.ProductRepository;
import com.xoana.repository.SiteSettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * The upload folder is the library: every image the backend has ever stored is listed here,
 * so files survive a database reset and no separate bookkeeping can drift out of sync.
 */
@RestController
@RequestMapping("/api/admin/media")
@PreAuthorize("hasRole('ADMIN')")
public class MediaController {

    private static final Logger log = LoggerFactory.getLogger(MediaController.class);
    // Names in this file are hidden from the library; the files themselves stay on disk.
    private static final String HIDDEN_FILE = ".hidden";

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final ProductRepository productRepository;
    private final ArticleRepository articleRepository;
    private final SiteSettingsRepository siteSettingsRepository;

    public MediaController(ProductRepository productRepository, ArticleRepository articleRepository,
                           SiteSettingsRepository siteSettingsRepository) {
        this.productRepository = productRepository;
        this.articleRepository = articleRepository;
        this.siteSettingsRepository = siteSettingsRepository;
    }

    public record MediaItem(String src, String filename, long size, LocalDateTime uploadedAt) {
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MediaItem>>> listMedia(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "60") int size) {
        PageRequest pageable = Pagination.of(page, Math.min(size, 200));
        List<MediaItem> items = listUploadedImages();
        int from = (int) Math.min(pageable.getOffset(), items.size());
        int to = Math.min(from + pageable.getPageSize(), items.size());
        Page<MediaItem> result = new PageImpl<>(items.subList(from, to), pageable, items.size());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @DeleteMapping("/{filename}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable String filename) {
        Path directory = uploadDirectory();
        Path target = directory.resolve(filename).normalize();
        // Only plain files directly inside the upload folder may be removed.
        if (filename.startsWith(".") || !directory.equals(target.getParent()) || !Files.isRegularFile(target)) {
            return ResponseEntity.notFound().build();
        }
        if (isInUse(filename)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("该图片正在被商品、文章或设置使用，请先解除引用再移除"));
        }
        try {
            // Hide instead of delete: the file stays on disk, so image URLs in any database
            // keep working even when this instance cannot see that database's references.
            Path hiddenFile = directory.resolve(HIDDEN_FILE);
            List<String> hidden = Files.isRegularFile(hiddenFile)
                    ? new ArrayList<>(Files.readAllLines(hiddenFile, StandardCharsets.UTF_8))
                    : new ArrayList<>();
            if (!hidden.contains(filename)) {
                hidden.add(filename);
                Files.write(hiddenFile, hidden, StandardCharsets.UTF_8);
            }
        } catch (IOException exception) {
            log.error("Unable to update the media library hide list", exception);
            return ResponseEntity.internalServerError().body(ApiResponse.error("移除失败，请稍后重试"));
        }
        return ResponseEntity.ok(ApiResponse.<Void>success("已从图片库移除，文件仍保留在磁盘上", null));
    }

    private List<MediaItem> listUploadedImages() {
        Path directory = uploadDirectory();
        if (!Files.isDirectory(directory)) {
            return List.of();
        }
        Set<String> hidden = hiddenFilenames(directory);
        try (Stream<Path> files = Files.list(directory)) {
            return files.filter(Files::isRegularFile)
                    .filter(path -> !path.getFileName().toString().startsWith("."))
                    .filter(path -> !hidden.contains(path.getFileName().toString()))
                    .map(this::toItem)
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparing(MediaItem::uploadedAt).reversed())
                    .toList();
        } catch (IOException exception) {
            log.error("Unable to list uploaded images", exception);
            return List.of();
        }
    }

    private Set<String> hiddenFilenames(Path directory) {
        Path hiddenFile = directory.resolve(HIDDEN_FILE);
        if (!Files.isRegularFile(hiddenFile)) {
            return Set.of();
        }
        try {
            return Files.readAllLines(hiddenFile, StandardCharsets.UTF_8).stream()
                    .map(String::trim)
                    .filter(name -> !name.isEmpty())
                    .collect(Collectors.toSet());
        } catch (IOException exception) {
            log.warn("Unable to read the media library hide list", exception);
            return Set.of();
        }
    }

    private MediaItem toItem(Path path) {
        try {
            String filename = path.getFileName().toString();
            return new MediaItem("/uploads/" + filename, filename, Files.size(path),
                    LocalDateTime.ofInstant(Files.getLastModifiedTime(path).toInstant(), ZoneId.systemDefault()));
        } catch (IOException exception) {
            log.warn("Skipping unreadable upload: {}", path);
            return null;
        }
    }

    // Legacy rows store the image as an absolute URL while new ones store "/uploads/...",
    // so references are matched by file name.
    private boolean isInUse(String filename) {
        if (productRepository.countByCoverImage(filename) > 0 || productRepository.countByImage(filename) > 0) {
            return true;
        }
        if (articleRepository.countByCoverImage(filename) > 0) {
            return true;
        }
        SiteSettings settings = siteSettingsRepository.findById(1L).orElse(null);
        if (settings == null) {
            return false;
        }
        if (references(settings.getBrandImage(), filename) || references(settings.getWechatQR(), filename)) {
            return true;
        }
        for (String legacy : Arrays.asList(settings.getGalleryImage1(), settings.getGalleryImage2(),
                settings.getGalleryImage3(), settings.getGalleryImage4(), settings.getGalleryImage5())) {
            if (references(legacy, filename)) {
                return true;
            }
        }
        return settings.getGalleryImages() != null
                && settings.getGalleryImages().stream().anyMatch(image -> references(image.src(), filename));
    }

    private boolean references(String stored, String filename) {
        if (stored == null || stored.isEmpty()) {
            return false;
        }
        return stored.equals(filename)
                || stored.equals("/uploads/" + filename)
                || stored.endsWith("/uploads/" + filename);
    }

    private Path uploadDirectory() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }
}

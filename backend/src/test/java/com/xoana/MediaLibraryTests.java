package com.xoana;

import com.xoana.model.Product;
import com.xoana.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.util.Comparator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class MediaLibraryTests {

    @TempDir
    static Path uploadDirectory;

    @DynamicPropertySource
    static void uploadsFolder(DynamicPropertyRegistry registry) {
        // Keep the library tests away from the real ./uploads folder.
        registry.add("app.upload.dir", () -> uploadDirectory.toString());
    }

    @Autowired MockMvc mvc;
    @Autowired ProductRepository products;

    @BeforeEach
    void cleanUploads() throws Exception {
        if (!Files.isDirectory(uploadDirectory)) {
            return;
        }
        // Deepest first so the .trash folder and its contents are cleared too.
        try (var walk = Files.walk(uploadDirectory)) {
            for (Path path : walk.sorted(Comparator.reverseOrder()).toList()) {
                if (!path.equals(uploadDirectory)) {
                    Files.deleteIfExists(path);
                }
            }
        }
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void listsEveryUploadedImageNewestFirst() throws Exception {
        writeImage("older.jpg", Instant.parse("2026-01-01T10:00:00Z"));
        writeImage("newer.jpg", Instant.parse("2026-02-01T10:00:00Z"));

        mvc.perform(get("/api/admin/media"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[0].filename").value("newer.jpg"))
                .andExpect(jsonPath("$.data.content[0].src").value("/uploads/newer.jpg"))
                .andExpect(jsonPath("$.data.content[1].filename").value("older.jpg"))
                .andExpect(jsonPath("$.data.content[0].size").isNumber());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void hidesAnUnusedImageWithoutRemovingTheFile() throws Exception {
        writeImage("unused.jpg", Instant.now());

        mvc.perform(delete("/api/admin/media/unused.jpg"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
        // The file stays on disk so image URLs in any database keep working.
        assertThat(Files.exists(uploadDirectory.resolve("unused.jpg"))).isTrue();
        mvc.perform(get("/api/admin/media")).andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void refusesToHideAnImageStillUsedByAProduct() throws Exception {
        writeImage("cover.jpg", Instant.now());
        products.saveAndFlush(Product.builder().name("Library product")
                .price(BigDecimal.TEN).stock(1).coverImage("/uploads/cover.jpg").build());

        mvc.perform(delete("/api/admin/media/cover.jpg"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.success").value(false));
        mvc.perform(get("/api/admin/media")).andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void referencesStoredAsAbsoluteUrlsAreDetectedToo() throws Exception {
        writeImage("legacy.jpg", Instant.now());
        products.saveAndFlush(Product.builder().name("Legacy product")
                .price(BigDecimal.TEN).stock(1)
                .coverImage("http://localhost:8080/uploads/legacy.jpg").build());

        mvc.perform(delete("/api/admin/media/legacy.jpg"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unknownOrNestedFilenamesAreNotFound() throws Exception {
        mvc.perform(delete("/api/admin/media/missing.jpg")).andExpect(status().isNotFound());
        mvc.perform(delete("/api/admin/media/sub/other.jpg")).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "USER")
    void theLibraryIsAdministratorOnly() throws Exception {
        mvc.perform(get("/api/admin/media")).andExpect(status().isForbidden());
        mvc.perform(delete("/api/admin/media/anything.jpg")).andExpect(status().isForbidden());
    }

    private void writeImage(String filename, Instant modifiedAt) throws Exception {
        Path file = uploadDirectory.resolve(filename);
        Files.write(file, "fake-image".getBytes(StandardCharsets.UTF_8));
        Files.setLastModifiedTime(file, FileTime.from(modifiedAt));
    }
}

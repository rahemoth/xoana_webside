package com.xoana.controller;

import com.xoana.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/upload")
public class FileUploadController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${server.url:http://localhost:8080}")
    private String serverUrl;

    // ... existing code ...

    @PostMapping("/image")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        System.out.println("=== 开始处理文件上传 ===");
        System.out.println("配置的上传目录：" + uploadDir);

        if (file.isEmpty()) {
            System.out.println("文件为空");
            return ResponseEntity.badRequest().body(ApiResponse.error("文件为空"));
        }

        System.out.println("原始文件名：" + file.getOriginalFilename());
        System.out.println("文件大小：" + file.getSize() + " bytes");
        System.out.println("文件类型：" + file.getContentType());

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            System.out.println("文件类型不符合要求：" + contentType);
            return ResponseEntity.badRequest().body(ApiResponse.error("只支持图片文件"));
        }

        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        System.out.println("生成的新文件名：" + filename);

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        System.out.println("绝对上传路径：" + uploadPath);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            System.out.println("已创建上传目录：" + uploadPath);
        }

        Path filePath = uploadPath.resolve(filename);
        System.out.println("文件完整路径：" + filePath);

        try {
            file.transferTo(filePath.toFile());
            System.out.println("文件保存成功：" + filePath);

            if (Files.exists(filePath)) {
                System.out.println("文件验证成功，大小：" + Files.size(filePath) + " bytes");
            } else {
                System.out.println("⚠️ 警告：文件保存后不存在！");
            }
        } catch (Exception e) {
            System.out.println("❌ 文件保存失败：" + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponse.error("保存文件失败：" + e.getMessage()));
        }

        // 返回完整的 URL
        String imageUrl = serverUrl + "/uploads/" + filename;
        System.out.println("返回的图片 URL：" + imageUrl);
        System.out.println("=== 文件上传完成 ===");

        return ResponseEntity.ok(ApiResponse.success(imageUrl));
    }




    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex >= 0 ? filename.substring(dotIndex) : ".jpg";
    }
}

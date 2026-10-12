package com.xoana.controller;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xoana.dto.ApiResponse;
import com.xoana.model.SiteSettings;
import com.xoana.repository.SiteSettingsRepository;
import jakarta.validation.Validator;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SiteSettingsController {

    // Everything the settings screen may write. Unknown keys and "id" are ignored so a
    // request body can never rename or replace the singleton row.
    private static final List<String> EDITABLE_FIELDS = List.of(
            "siteName", "siteNameEn", "siteDescription", "siteDescriptionEn",
            "heroTitle", "heroTitleEn", "heroSubtitle", "heroSubtitleEn", "heroDescription", "heroDescriptionEn",
            "brandDescription", "brandDescriptionEn", "brandImage",
            "galleryImages", "galleryImage1", "galleryImage2", "galleryImage3", "galleryImage4", "galleryImage5",
            "contactEmail", "contactPhone", "contactAddress", "contactAddressEn", "wechatQR",
            "checkoutEnabled",
            "stat1Value", "stat1Label", "stat1LabelEn", "stat2Value", "stat2Label", "stat2LabelEn",
            "stat3Value", "stat3Label", "stat3LabelEn");

    private final SiteSettingsRepository siteSettingsRepository;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    public SiteSettingsController(SiteSettingsRepository siteSettingsRepository, ObjectMapper objectMapper,
                                  Validator validator) {
        this.siteSettingsRepository = siteSettingsRepository;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SiteSettings>> getSettings() {
        SiteSettings settings = siteSettingsRepository.findById(1L)
                .orElse(new SiteSettings());
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    // Merge onto the stored row: fields the request omits keep their saved value instead of
    // falling back to the entity's defaults.
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SiteSettings>> updateSettings(@RequestBody Map<String, Object> updates) {
        updates.keySet().retainAll(EDITABLE_FIELDS);
        SiteSettings existing = siteSettingsRepository.findById(1L).orElseGet(() -> {
            SiteSettings created = new SiteSettings();
            created.setId(1L);
            return created;
        });
        SiteSettings candidate = objectMapper.convertValue(existing, SiteSettings.class);
        try {
            objectMapper.updateValue(candidate, updates);
        } catch (JsonMappingException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.error("设置字段格式不正确"));
        }
        if (!validator.validate(candidate).isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("设置信息不完整或格式不正确"));
        }
        candidate.setId(1L);
        return ResponseEntity.ok(ApiResponse.success("设置已保存", siteSettingsRepository.save(candidate)));
    }
}

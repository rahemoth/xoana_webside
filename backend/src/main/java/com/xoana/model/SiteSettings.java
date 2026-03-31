package com.xoana.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "site_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SiteSettings {

    @Id
    private Long id = 1L;

    // 基本信息 - Basic Info
    @Column(length = 100)
    private String siteName = "XOANA";

    @Column(length = 100)
    private String siteNameEn = "XOANA";

    @Column(columnDefinition = "TEXT")
    private String siteDescription = "独立手指滑板品牌";

    @Column(columnDefinition = "TEXT")
    private String siteDescriptionEn = "Independent Fingerboard Brand";

    // Hero 区域
    @Column(length = 200)
    private String heroTitle = "XOANA 指板";

    @Column(length = 200)
    private String heroTitleEn = "Fingerboard";

    @Column(length = 200)
    private String heroSubtitle = "极致工艺，专注品质";

    @Column(length = 200)
    private String heroSubtitleEn = "Craftsmanship & Quality";

    @Column(columnDefinition = "TEXT")
    private String heroDescription = "每一块指板都是独立手工打造，融合传统技艺与现代设计";

    @Column(columnDefinition = "TEXT")
    private String heroDescriptionEn = "Each fingerboard is handcrafted independently, blending traditional craftsmanship with modern design.";

    // 品牌介绍
    @Column(columnDefinition = "TEXT")
    private String brandDescription = "XOANA 是一个专注于独立手指滑板的品牌，我们致力于为每一位玩家带来最高品质的产品体验。";

    @Column(columnDefinition = "TEXT")
    private String brandDescriptionEn = "XOANA is an independent fingerboard brand dedicated to providing the highest quality products for every player.";

    @Column(length = 500)
    private String brandImage = "";

    // Gallery
    @Column(length = 500)
    private String galleryImage1 = "";

    @Column(length = 500)
    private String galleryImage2 = "";

    @Column(length = 500)
    private String galleryImage3 = "";

    @Column(length = 500)
    private String galleryImage4 = "";

    @Column(length = 500)
    private String galleryImage5 = "";

    // 联系信息
    @Column(length = 200)
    private String contactEmail = "contact@xoana.com";

    @Column(length = 50)
    private String contactPhone = "+86 138 0000 0000";

    @Column(length = 500)
    private String contactAddress = "上海市浦东新区 · 中国";

    @Column(length = 500)
    private String contactAddressEn = "Pudong New Area, Shanghai · China";

    @Column(length = 500)
    private String wechatQR = "";

    @Column(name = "checkout_enabled")
    private boolean checkoutEnabled = true;
}

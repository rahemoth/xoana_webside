package com.xoana.controller;

import com.xoana.dto.ApiResponse;
import com.xoana.model.Product;
import com.xoana.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> products;
        if (keyword != null && !keyword.isBlank()) {
            products = productRepository.searchByKeyword(keyword, pageable);
        } else if (category != null && !category.isBlank()) {
            products = productRepository.findByCategoryAndActiveTrue(category, pageable);
        } else {
            products = productRepository.findByActiveTrue(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<Product>>> getFeaturedProducts() {
        return ResponseEntity.ok(ApiResponse.success(productRepository.findByFeaturedTrueAndActiveTrue()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .filter(Product::isActive)
                .map(p -> ResponseEntity.ok(ApiResponse.success(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody Product product) {
        product.setId(null);
        return ResponseEntity.ok(ApiResponse.success(productRepository.save(product)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productRepository.findById(id)
                .map(p -> {
                    product.setId(id);
                    return ResponseEntity.ok(ApiResponse.success(productRepository.save(product)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(p -> {
                    p.setActive(false);
                    productRepository.save(p);
                    return ResponseEntity.ok(ApiResponse.<Void>success("Product deleted", null));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.urlshortener.controller;

import com.urlshortener.model.Url;
import com.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class UrlController {

    private final UrlService urlService;

    public UrlController(UrlService urlService) {
        this.urlService = urlService;
    }

    @PostMapping("/api/shorten")
    public ResponseEntity<Map<String, String>> shorten(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String originalUrl = body.get("url");
        if (originalUrl == null || originalUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }

        String customCode = body.get("customCode");

        try {
            Url saved = urlService.shortenUrl(originalUrl, customCode);
            String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
            String shortUrl = baseUrl + "/" + saved.getShortCode();
            return ResponseEntity.ok(Map.of("shortUrl", shortUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<?> redirect(@PathVariable String shortCode) {
        try {
            Url url = urlService.incrementClickAndGet(shortCode);
            HttpHeaders headers = new HttpHeaders();
            headers.add("Location", url.getOriginalUrl());
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/stats/{shortCode}")
    public ResponseEntity<?> stats(@PathVariable String shortCode) {
        return urlService.getByShortCode(shortCode)
                .map(url -> ResponseEntity.ok(Map.of(
                        "originalUrl", url.getOriginalUrl(),
                        "shortCode", url.getShortCode(),
                        "clickCount", url.getClickCount(),
                        "createdAt", url.getCreatedAt().toString()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/api/toggle/{shortCode}")
    public ResponseEntity<?> toggleActive(@PathVariable String shortCode) {
        try {
            Url url = urlService.toggleActive(shortCode);
            return ResponseEntity.ok(Map.of(
                    "shortCode", url.getShortCode(),
                    "active", url.isActive()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/api/all")
    public ResponseEntity<List<Map<String, Object>>> getAllUrls() {
        List<Map<String, Object>> result = urlService.getAllUrls().stream()
                .map(url -> Map.<String, Object>of(
                        "originalUrl", url.getOriginalUrl(),
                        "shortCode", url.getShortCode(),
                        "clickCount", url.getClickCount(),
                        "createdAt", url.getCreatedAt().toString(),
                        "active", url.isActive()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}


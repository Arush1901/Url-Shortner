package com.urlshortener.controller;

import com.urlshortener.model.Url;
import com.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
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

        Url saved = urlService.shortenUrl(originalUrl);
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String shortUrl = baseUrl + "/" + saved.getShortCode();

        return ResponseEntity.ok(Map.of("shortUrl", shortUrl));
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode) {
        Url url = urlService.incrementClickAndGet(shortCode);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", url.getOriginalUrl());
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
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
}

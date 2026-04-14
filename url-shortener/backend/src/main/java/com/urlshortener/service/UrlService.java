package com.urlshortener.service;

import com.urlshortener.model.Url;
import com.urlshortener.repository.UrlRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

@Service
public class UrlService {

    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;
    private final Random random = new Random();

    private final UrlRepository urlRepository;

    public UrlService(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    public Url shortenUrl(String originalUrl) {
        String shortCode = generateUniqueCode();
        Url url = new Url();
        url.setOriginalUrl(originalUrl);
        url.setShortCode(shortCode);
        return urlRepository.save(url);
    }

    public Optional<Url> getByShortCode(String shortCode) {
        return urlRepository.findByShortCode(shortCode);
    }

    public Url incrementClickAndGet(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Short URL not found: " + shortCode));
        url.setClickCount(url.getClickCount() + 1);
        return urlRepository.save(url);
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = generateRandomCode();
        } while (urlRepository.existsByShortCode(code));
        return code;
    }

    private String generateRandomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}

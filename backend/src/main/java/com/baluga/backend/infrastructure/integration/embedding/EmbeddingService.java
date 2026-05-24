package com.baluga.backend.infrastructure.integration.embedding;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    private final String baseUrl;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public EmbeddingService(EmbeddingServiceConfig config, ObjectMapper objectMapper) {
        this.baseUrl = config.baseUrl();
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();
        log.info("EmbeddingService connected to {}", config.baseUrl());
    }

    public float[] encode(String text) {
        try {
            String json = objectMapper.writeValueAsString(Map.of("texts", List.of(text)));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/embed"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Embedding API returned " + response.statusCode() + ": " + response.body());
            }

            EmbedResponse embedResponse = objectMapper.readValue(response.body(), EmbedResponse.class);

            if (embedResponse == null || embedResponse.embeddings().isEmpty()) {
                throw new IllegalStateException("Empty embedding response");
            }
            return toFloatArray(embedResponse.embeddings().get(0));
        } catch (Exception e) {
            throw new RuntimeException("Embedding failed", e);
        }
    }

    public List<float[]> batchEncode(List<String> texts, int batchSize) {
        List<float[]> results = new ArrayList<>();
        for (int i = 0; i < texts.size(); i += batchSize) {
            int end = Math.min(i + batchSize, texts.size());
            List<String> batch = texts.subList(i, end);

            try {
                String json = objectMapper.writeValueAsString(Map.of("texts", batch));
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(baseUrl + "/embed"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(json))
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    EmbedResponse er = objectMapper.readValue(response.body(), EmbedResponse.class);
                    for (List<Double> emb : er.embeddings()) {
                        results.add(toFloatArray(emb));
                    }
                }
            } catch (Exception e) {
                log.error("Batch embedding failed: {}", e.getMessage());
            }
            log.debug("Embedded batch {}-{} of {}", i, end, texts.size());
        }
        return results;
    }

    public int getDimensions() {
        return 1024; // BGE-large-zh-v1.5
    }

    private float[] toFloatArray(List<Double> list) {
        float[] arr = new float[list.size()];
        for (int i = 0; i < list.size(); i++) {
            arr[i] = list.get(i).floatValue();
        }
        return arr;
    }

    private record EmbedResponse(List<List<Double>> embeddings, int dimensions) {}
}

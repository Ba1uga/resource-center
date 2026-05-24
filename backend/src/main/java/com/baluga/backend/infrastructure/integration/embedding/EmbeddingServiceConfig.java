package com.baluga.backend.infrastructure.integration.embedding;

import org.springframework.boot.context.properties.ConfigurationProperties;


@ConfigurationProperties(prefix = "baluga.embedding")
public record EmbeddingServiceConfig(String baseUrl) {}

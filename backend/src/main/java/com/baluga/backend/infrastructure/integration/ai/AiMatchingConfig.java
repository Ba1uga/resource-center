package com.baluga.backend.infrastructure.integration.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import lombok.Data;


@Data
@ConfigurationProperties(prefix = "baluga.ai.matching")
public class AiMatchingConfig {

    private String provider = "keyword";

    private String openaiApiKey = "";

    private String openaiBaseUrl = "https://api.deepseek.com/v1";

    private String openaiModel = "deepseek-chat";

    private int maxTokens = 4096;

    private double temperature = 0.1;

    private int timeoutSeconds = 120;

    private int maxRetries = 2;

    private int maxCandidatesPerResource = 3;
}

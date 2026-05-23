package com.baluga.backend.modules.storage.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;


@Data
@ConfigurationProperties(prefix = "baluga.storage")
public class StorageProperties {

    private String uploadDir = System.getProperty("java.io.tmpdir") + "/baluga-uploads";
}

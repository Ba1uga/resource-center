package com.baluga.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;


@Configuration
@EnableConfigurationProperties(PgVectorConfig.PgVectorProperties.class)
public class PgVectorConfig {

    @Bean
    public JdbcTemplate pgvectorJdbcTemplate(PgVectorProperties props) {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(props.getUrl());
        ds.setUsername(props.getUsername());
        ds.setPassword(props.getPassword());
        ds.setDriverClassName(props.getDriverClassName());
        ds.setMaximumPoolSize(props.getHikari() != null ? props.getHikari().getMaximumPoolSize() : 5);
        ds.setMinimumIdle(props.getHikari() != null ? props.getHikari().getMinimumIdle() : 1);
        ds.setConnectionTimeout(props.getHikari() != null ? props.getHikari().getConnectionTimeout() : 10000);
        return new JdbcTemplate(ds);
    }

    @ConfigurationProperties(prefix = "spring.pgvector.datasource")
    public static class PgVectorProperties {
        private String url;
        private String username;
        private String password;
        private String driverClassName = "org.postgresql.Driver";
        private HikariProps hikari = new HikariProps();

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getDriverClassName() { return driverClassName; }
        public void setDriverClassName(String driverClassName) { this.driverClassName = driverClassName; }
        public HikariProps getHikari() { return hikari; }
        public void setHikari(HikariProps hikari) { this.hikari = hikari; }

        public static class HikariProps {
            private int maximumPoolSize = 5;
            private int minimumIdle = 1;
            private long connectionTimeout = 10000;

            public int getMaximumPoolSize() { return maximumPoolSize; }
            public void setMaximumPoolSize(int v) { this.maximumPoolSize = v; }
            public int getMinimumIdle() { return minimumIdle; }
            public void setMinimumIdle(int v) { this.minimumIdle = v; }
            public long getConnectionTimeout() { return connectionTimeout; }
            public void setConnectionTimeout(long v) { this.connectionTimeout = v; }
        }
    }
}

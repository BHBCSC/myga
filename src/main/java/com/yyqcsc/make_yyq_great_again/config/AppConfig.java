package com.yyqcsc.make_yyq_great_again.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.sql.DataSource;

@Configuration
public class AppConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String os = System.getProperty("os.name").toLowerCase();
        String audioLocation;
        if (os.contains("win")) {
            audioLocation = "file:D:/myga/audio/";
        } else if (os.contains("mac")) {
            audioLocation = "file:/Users/yyq/PycharmProjects/PythonProject1/ielts/audio_files";
        } else {
            audioLocation = "file:/app/myga/audio/";
        }
        registry.addResourceHandler("/audio/**")
                .addResourceLocations(audioLocation);
    }

    @Bean
    public DataSource dataSource() {
        String os = System.getProperty("os.name").toLowerCase();
        String jdbcUrl;
        if (os.contains("win")) {
            jdbcUrl = "jdbc:h2:file:D:/myga/h2/myga_db;AUTO_SERVER=TRUE";
        } else if (os.contains("mac")) {
            jdbcUrl = "jdbc:h2:file:/Users/yyq/myga/h2/myga_db;AUTO_SERVER=TRUE";
        } else {
            jdbcUrl = "jdbc:h2:file:/app/myga/h2/myga_db;AUTO_SERVER=TRUE";
        }

        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl(jdbcUrl);
        dataSource.setUsername("sa");
        dataSource.setPassword("password");
        return dataSource;
    }
}